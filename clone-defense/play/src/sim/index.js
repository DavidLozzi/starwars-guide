// Simulation facade — the public API in docs/CONTRACTS.md "Sim public API".
// Headless: no window/document/canvas. Orchestrates step order and mode transitions.

import { FIELD_W, FIELD_H } from '../engine/field.js';
import { EVT } from '../engine/events.js';
import { createState } from './state.js';
import { stepCombat } from './combat.js';
import { applyPower } from './powers.js';
import { stepDrops, stepBuffs } from './powerups.js';
import { canUse as canUseF, costOf as costOfF, spend, refreshUnlocks } from './force.js';
import { startPlanet, startWave, waveClear, proceedFromBreather, gameOver } from './wave.js';
import { stepOrder66 } from './order66.js';

export function createGame(config, emitter) {
  const globals = config.globals;
  const planets = config.planets;
  const state = createState();
  const liveC = [];
  const liveD = [];

  function startRun(planetIndex = config.jumpPlanet ?? 0, waveIndex = config.jumpWave ?? 0) {
    state.score = 0;
    state.force = 0;
    state.highestForce = 0;
    state._forceRampRemain = 0; // a run starts empty even if the last one ended mid-drip
    state._forceRampRate = 0;
    state._unlocked = {};
    state._clock = 0;
    state._forcePauseUntil = 0;
    state._boltSpeed = globals.boltSpeed; // clone/fallback speed, so fireBolt is valid before the first step
    state.runStats = { startedAtMs: Date.now(), deaths: 0, powersUsed: 0 };
    emitter.emit(EVT.RUN_STARTED, {});
    startPlanet(state, globals, planets, planetIndex, emitter, waveIndex);
  }

  function step(dt) {
    // 'order66' runs the finale volley on the live map: same jedi movement, no combat.
    if (state.mode !== 'play' && state.mode !== 'order66') return;
    // Post-power grace: freeze the sim briefly so the player can move their thumb
    // back to the jedi before combat resumes (set in confirmPower).
    if (state._powerGraceT > 0) { state._powerGraceT -= dt; return; }
    state._clock += dt;

    // jedi follows the pointer, clamped to the roam zone below the ceiling (PRD §2)
    const j = state.jedi;
    if (j.alive) {
      const k = Math.min(1, dt * globals.jedi.followLerp);
      j.x += (j.tx - j.x) * k;
      j.y += (j.ty - j.y) * k;
      j.x = j.x < 14 ? 14 : j.x > FIELD_W - 14 ? FIELD_W - 14 : j.x;
      const ceil = globals.zones.jediCeiling * FIELD_H + 16;
      const floor = FIELD_H - 22;
      j.y = j.y < ceil ? ceil : j.y > floor ? floor : j.y;

      // The ally jedi shadows the same drag, offset to the jedi's left (§19).
      const a = state.jedi2;
      if (a.active) {
        a.tx = j.tx - globals.powerups.types.secondYoda.offsetX;
        a.ty = j.ty;
        a.x += (a.tx - a.x) * k;
        a.y += (a.ty - a.y) * k;
        a.x = a.x < 14 ? 14 : a.x > FIELD_W - 14 ? FIELD_W - 14 : a.x;
        a.y = a.y < ceil ? ceil : a.y > floor ? floor : a.y;
      }
    }

    if (state.mode === 'order66') { stepOrder66(state, globals, emitter, dt); return; }
    state._waveT += dt;

    // live lists (reused scratch arrays — no per-frame allocation)
    liveC.length = 0;
    liveD.length = 0;
    for (let i = 0; i < state.clones.length; i++) if (state.clones[i].alive) liveC.push(state.clones[i]);
    for (let i = 0; i < state.droids.length; i++) if (state.droids[i].alive) liveD.push(state.droids[i]);

    // The clone roster is the life pool. Bad Batch are borrowed bodies (temp) — they soak
    // fire but can never keep a run alive past the last real clone (§19).
    let liveReal = 0;
    for (let i = 0; i < liveC.length; i++) if (!liveC[i].temp) liveReal++;
    if (liveReal === 0) { gameOver(state, emitter); return; }

    stepCombat(state, globals, planets[state.planetIndex], emitter, dt, liveC, liveD);
    stepBuffs(state, globals, emitter, dt);
    stepDrops(state, globals, emitter, dt);

    // wave end
    let liveDroids = 0;
    for (let i = 0; i < state.droids.length; i++) if (state.droids[i].alive) liveDroids++;
    const cleared = globals.waveEnd === 'timer'
      ? state._waveT >= globals.waveTimerSec
      : liveDroids === 0;
    // Hold the wave open for a beat after the last droid falls so bolts in flight land and
    // the kill FX play out, instead of cutting straight to the breather (PRD §8). `cleared`
    // stays true every frame from here, so the timer is only armed on the first one.
    if (cleared) {
      if (state._clearHoldT <= 0) state._clearHoldT = globals.waveClearHoldSec;
      state._clearHoldT -= dt;
      if (state._clearHoldT <= 0) waveClear(state, globals, planets, emitter);
    }
  }

  function tickBreather(dt) {
    if (state.mode !== 'breather' || state.breatherPaused) return;
    if (state.pendingPlanetIndex != null) return; // planet-clear waits for READY (no countdown)
    state.breatherT -= dt;
    if (state.breatherT <= 0) proceedFromBreather(state, globals, planets, emitter);
  }

  function readyFromBreather() {
    if (state.mode === 'breather') proceedFromBreather(state, globals, planets, emitter);
  }

  function setJediTarget(x, y) {
    state.jedi.tx = x;
    state.jedi.ty = y;
  }

  // ---- powers (PRD §7 flow) ----
  const canUse = (power) => canUseF(state, globals, power);
  const costOf = (power) => costOfF(state, globals, power);

  function beginPower(power) {
    if (state.mode !== 'play' && state.mode !== 'breather') return false;
    if (!canUse(power)) return false;
    if (state.mode === 'breather') state.breatherPaused = true;
    state.prevMode = state.mode;
    state.mode = 'power';
    const top = power === 'push' || power === 'crush';
    state.selector = { power, x: FIELD_W / 2, y: (top ? 0.18 : 0.8) * FIELD_H };
    return true;
  }

  function moveSelector(x, y) {
    if (state.mode === 'power' && state.selector) { state.selector.x = x; state.selector.y = y; }
  }

  function confirmPower() {
    if (state.mode !== 'power' || !state.selector) return;
    const power = state.selector.power;
    const cost = costOf(power);
    spend(state, cost);
    refreshUnlocks(state, globals, emitter);
    applyPower(state, globals, power, state.selector.x, state.selector.y, emitter);
    state.runStats.powersUsed++;
    emitter.emit(EVT.POWER_USED, { power, cost });
    const resumingPlay = state.prevMode === 'play';
    endPower();
    if (resumingPlay) state._powerGraceT = globals.postPowerGraceSec; // thumb-return grace (globals)
  }

  function cancelPower() {
    if (state.mode !== 'power') return;
    endPower();
  }

  function endPower() {
    state.mode = state.prevMode;
    state.breatherPaused = false;
    state.selector = null;
  }

  return {
    state,
    startRun, step, tickBreather, readyFromBreather, setJediTarget,
    canUse, costOf, beginPower, moveSelector, confirmPower, cancelPower,
  };
}
