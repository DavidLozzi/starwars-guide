// Wave / planet / breather lifecycle + scatter placement. PRD §2 (scatter), §5 (clones),
// §8 (pacing). Emits WAVE_STARTED, PLANET_STARTED/CLEARED, WAVE_CLEARED, BREATHER_STARTED,
// FINALE_REACHED, RUN_ENDED.

import { FIELD_W, FIELD_H } from '../engine/field.js';
import { EVT } from '../engine/events.js';
import { rand } from '../engine/rng.js';
import { earnForce } from './force.js';
import { nextId } from './state.js';
import { planDrops } from './powerups.js';
import { startOrder66 } from './order66.js';

/** Scatter n points in [yMinFrac,yMaxFrac] of the field, min-spaced, varied depth (PRD §2). */
function scatter(n, yMinFrac, yMaxFrac, minDist) {
  const pts = [];
  const md2 = minDist * minDist;
  let guard = 0;
  while (pts.length < n && guard++ < 2000) {
    const x = rand(0.08, 0.92) * FIELD_W;
    const y = rand(yMinFrac, yMaxFrac) * FIELD_H;
    let ok = true;
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - x, dy = pts[i].y - y;
      if (dx * dx + dy * dy < md2) { ok = false; break; }
    }
    if (ok) pts.push({ x, y });
  }
  return pts;
}

export function startPlanet(state, globals, planets, pi, emitter, wi = 0) {
  const planet = planets[pi];
  state.planetIndex = pi;
  state.waveIndex = wi;
  state.walls.length = 0;
  state.planetStats = { clonesLost: 0 };
  state._planetFlawless = true;

  // standing army, set per planet, resets on arrival (§5)
  const roster = planet.roster;
  const keys = Object.keys(roster);
  let total = 0;
  for (const k of keys) total += roster[k];
  const pts = scatter(total, globals.zones.cloneYMin, globals.zones.cloneYMax, globals.zones.scatterMinDist);
  const clones = [];
  let idx = 0;
  for (const k of keys) {
    const def = planet.clones[k];
    for (let i = 0; i < roster[k]; i++) {
      const p = pts[idx++] || { x: rand(0.1, 0.9) * FIELD_W, y: rand(0.78, 0.92) * FIELD_H };
      clones.push({ id: nextId(state), x: p.x, y: p.y, hp: def.hp, maxHp: def.hp, alive: true, typeKey: k, sprite: k, cd: rand(0, 2) });
    }
  }
  state.clones = clones;
  emitter.emit(EVT.PLANET_STARTED, { planetIndex: pi, name: planet.name });
  startWave(state, globals, planet, emitter);
}

export function startWave(state, globals, planet, emitter) {
  const comp = planet.waves[state.waveIndex];
  const entries = [];
  for (const k of Object.keys(comp)) for (let i = 0; i < comp[k]; i++) entries.push(k);
  // debug smoke mode: cap total droids per wave
  if (Number.isFinite(globals.debugWaveSize)) entries.length = Math.min(entries.length, globals.debugWaveSize);

  const pts = scatter(entries.length, globals.zones.droidYMin, globals.zones.droidYMax, globals.zones.scatterMinDist);
  const droids = [];
  for (let i = 0; i < entries.length; i++) {
    const k = entries[i];
    const def = planet.droids[k];
    const p = pts[i] || { x: rand(0.1, 0.9) * FIELD_W, y: rand(0.06, 0.28) * FIELD_H };
    droids.push({ id: nextId(state), x: p.x, y: p.y, hp: def.hp, maxHp: def.hp, alive: true, typeKey: k, sprite: k, archetype: def.archetype, stun: 0, cd: rand(0, 2) });
  }
  state.droids = droids;

  for (let i = 0; i < state.bolts.length; i++) state.bolts[i].active = false;
  // Timed power-up effects never carry across a wave: uncaught drops vanish, every buff ends,
  // and any Bad Batch bodies are pruned now — safe here because every bolt was just
  // deactivated, so nothing holds a target reference to them. The Force ramp is deliberately
  // NOT reset: force is a banked resource, not a timed buff, and a bar you were promised must
  // finish filling even if the wave ends mid-drip. Only startRun clears it.
  for (let i = 0; i < state.drops.length; i++) state.drops[i].active = false;
  for (let i = state.clones.length - 1; i >= 0; i--) if (state.clones[i].temp) state.clones.splice(i, 1);
  state.buffs.empowerT = 0;
  state.buffs.allyT = 0;
  state.buffs.badBatchT = 0;
  state.jedi2.active = false;
  state.jedi2.ally = null;
  state._blockStamps2.length = 0;
  planDrops(state, planet, state.waveIndex);
  state._waveT = 0;
  state._blockStamps.length = 0;
  state._leakStreak = 0;
  state._saberSafetyUntil = 0;
  state._powerGraceT = 0;
  state._clearHoldT = 0;
  state.waveStats = { deflects: 0, bKills: 0, clonesLost: 0, forceGained: 0, powerupsCaught: 0 };
  state.jedi.x = state.jedi.tx = FIELD_W / 2;
  state.jedi.y = state.jedi.ty = FIELD_H * 0.7;
  state.jedi.alive = true;
  state._o66T = 0;
  state._o66DeadT = -1;
  state.mode = 'play';
  emitter.emit(EVT.WAVE_STARTED, { planetIndex: state.planetIndex, waveIndex: state.waveIndex });
}

export function waveClear(state, globals, planets, emitter) {
  const planet = planets[state.planetIndex];
  let survivors = 0;
  for (let i = 0; i < state.clones.length; i++) if (state.clones[i].alive) survivors++;

  const gained = globals.earn.waveClearBase + globals.earn.survivorPerClone * survivors;
  earnForce(state, globals, emitter, gained, 'waveClear');
  state.score += globals.score.waveClear;

  const clearedWave = state.waveIndex;
  const waveFlawless = state.waveStats.clonesLost === 0;
  emitter.emit(EVT.WAVE_CLEARED, {
    waveIndex: clearedWave,
    survivors,
    deflects: state.waveStats.deflects,
    bKills: state.waveStats.bKills,
    forceGained: Math.round(state.waveStats.forceGained),
    clonesLost: state.waveStats.clonesLost,
    planetClonesLost: state.planetStats.clonesLost, // running planet total — final wave carries the planet's toll
    powerupsCaught: state.waveStats.powerupsCaught,
    flawless: waveFlawless,
  });

  state.waveIndex++;
  state.pendingPlanetIndex = null;

  if (state.waveIndex >= planet.waves.length) {
    state.score += globals.score.planetClear;
    emitter.emit(EVT.PLANET_CLEARED, { planetIndex: state.planetIndex, flawless: state._planetFlawless });
    if (state.planetIndex + 1 >= globals.finalePlanet) {
      // Order 66 plays out on the live map first; it calls finale() when the jedi falls.
      startOrder66(state, globals, emitter);
      return;
    }
    state.pendingPlanetIndex = state.planetIndex + 1;
  }

  state.mode = 'breather';
  state.breatherT = state.pendingPlanetIndex != null
    ? globals.planetBreatherSec : globals.breatherSec;
  state.breatherPaused = false;
  emitter.emit(EVT.BREATHER_STARTED, { nextIsPlanet: state.pendingPlanetIndex != null });
}

export function proceedFromBreather(state, globals, planets, emitter) {
  if (state.pendingPlanetIndex != null) {
    const p = state.pendingPlanetIndex;
    state.pendingPlanetIndex = null;
    startPlanet(state, globals, planets, p, emitter);
  } else {
    startWave(state, globals, planets[state.planetIndex], emitter);
  }
}

function durationSec(state) {
  return state.runStats.startedAtMs ? (Date.now() - state.runStats.startedAtMs) / 1000 : 0;
}

export function finale(state, emitter) {
  state.mode = 'finale';
  emitter.emit(EVT.FINALE_REACHED, { score: state.score });
  emitter.emit(EVT.RUN_ENDED, {
    planetIndex: state.planetIndex, waveIndex: state.waveIndex,
    score: state.score, durationSec: durationSec(state), cause: 'finale',
  });
}

export function gameOver(state, emitter) {
  state.mode = 'over';
  emitter.emit(EVT.RUN_ENDED, {
    planetIndex: state.planetIndex, waveIndex: state.waveIndex,
    score: state.score, durationSec: durationSec(state), cause: 'death',
  });
}
