// Order 66 — the clones turn on the jedi over the still-live map (PRD §18).
// Runs between the last droid dying on the finale planet and the finale screen.
// Headless: no window/document/canvas. All timing/odds come from globals.order66.
//
// Deliberately NOT combat.js: the run is already scored and over, so there is no
// Force, no score, no mercy window, no block capacity, no wall interception here —
// just a flat blockChance roll per bolt, and the first one through ends it.

import { EVT } from '../engine/events.js';
import { rand, chance } from '../engine/rng.js';
import { spawnFx } from './state.js';
import { fireBolt, ARRIVE_R } from './combat.js';
import { finale } from './wave.js';

// Clone blasters never miss the jedi in the finale — the block roll is the only defense.
const O66_DEF = { accuracy: 1, jitter: 0 };

const liveC = []; // scratch, reused every frame (CONTRACTS: no per-frame allocation)

function killAllBolts(state) {
  const bolts = state.bolts;
  for (let i = 0; i < bolts.length; i++) bolts[i].active = false;
}

export function startOrder66(state, globals, emitter) {
  const o66 = globals.order66;
  state.mode = 'order66';
  state._o66T = 0;
  state._o66DeadT = -1;
  state.jedi.alive = true;
  // Droid fire still in flight must not kill a clone mid-cutscene.
  killAllBolts(state);
  // No power-up survives into the finale — no ally at the jedi's side, no falling pickups.
  for (let i = 0; i < state.drops.length; i++) state.drops[i].active = false;
  state.buffs.empowerT = 0;
  state.buffs.allyT = 0;
  state.buffs.badBatchT = 0;
  state.jedi2.active = false;
  state.jedi2.ally = null;
  for (let i = state.clones.length - 1; i >= 0; i--) if (state.clones[i].temp) state.clones.splice(i, 1);
  for (let i = 0; i < state.clones.length; i++) {
    if (state.clones[i].alive) state.clones[i].cd = rand(0, o66.staggerSec);
  }
  emitter.emit(EVT.ORDER66_STARTED, { planetIndex: state.planetIndex, score: state.score });
}

function decayFx(state, dt) {
  const fx = state.fx;
  for (let i = 0; i < fx.length; i++) {
    if (fx[i].active) { fx[i].life -= dt; if (fx[i].life <= 0) fx[i].active = false; }
  }
}

export function stepOrder66(state, globals, emitter, dt) {
  const o66 = globals.order66;
  const speed = globals.boltSpeed;
  state._boltSpeed = speed; // normally set by stepCombat; fireBolt reads it
  state._o66T += dt;

  // the banner beat: text lands, the clones hold, nothing moves yet
  if (state._o66T < o66.turnDelaySec) { decayFx(state, dt); return; }

  // jedi down — hold on the body, then hand off to the existing finale screen
  if (state._o66DeadT >= 0) {
    state._o66DeadT += dt;
    decayFx(state, dt);
    if (state._o66DeadT >= o66.deathHoldSec) finale(state, emitter);
    return;
  }

  // --- the volley ---
  liveC.length = 0;
  for (let i = 0; i < state.clones.length; i++) if (state.clones[i].alive) liveC.push(state.clones[i]);

  const jedi = state.jedi;
  for (let i = 0; i < liveC.length; i++) {
    const c = liveC[i];
    c.cd -= dt;
    if (c.cd <= 0) {
      c.cd = o66.fireIntervalSec * (1 + (Math.random() * 2 - 1) * o66.fireJitter);
      fireBolt(state, 'C', c, jedi, O66_DEF, 1);
    }
  }

  const bolts = state.bolts;
  const jx = jedi.x, jy = jedi.y;
  const saberR2 = globals.saber.radius * globals.saber.radius;
  for (let i = 0; i < bolts.length; i++) {
    const b = bolts[i];
    if (!b.active) continue;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // one block roll per bolt transit, flat odds (globals.order66.blockChance)
    if (!b.blocked && !b.saberChecked) {
      const ddx = b.x - jx, ddy = b.y - jy;
      if (ddx * ddx + ddy * ddy < saberR2) {
        b.saberChecked = true;
        if (chance(o66.blockChance)) {
          b.blocked = true;
          b.target = null;
          b.targetId = null;
          spawnFx(state, 'spark', b.x, b.y, 0.25);
          // knocked away, nowhere in particular — same shape as a missed deflect
          b.vx = (Math.random() * 2 - 1) * speed * 0.5;
          b.vy = -speed;
        }
      }
    }

    // arrival: one blast kills
    if (!b.blocked) {
      const adx = b.x - jx, ady = b.y - jy;
      if (adx * adx + ady * ady < ARRIVE_R * ARRIVE_R) {
        jedi.alive = false;
        state._o66DeadT = 0;
        killAllBolts(state);
        spawnFx(state, 'crush', jx, jy, 0.6);
        emitter.emit(EVT.JEDI_FELL, { planetIndex: state.planetIndex });
        break;
      }
    }

    if (b.y < -50 || b.y > 690 || b.x < -50 || b.x > 450) b.active = false;
  }

  decayFx(state, dt);
}
