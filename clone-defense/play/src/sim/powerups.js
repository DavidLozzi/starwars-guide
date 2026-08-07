// Power-ups (PRD §19) — scripted drops, the falling collectible, and the seven effects.
// Headless: no window/document/canvas.
//
// Drops are NOT random. Each planet carries a `powerups` script of { wave, kill, type,
// droidType } entries; the drop fires on exactly the kill-th droid death of that wave
// (restricted to droidType when present). Deterministic so players can learn them.
//
// This module owns the kill counters rather than reusing waveStats.bKills, because bKills is
// the *scored* kill count and Force Crush deliberately awards nothing — a drop script must
// fire the same way no matter how the droid died.

import { FIELD_W, FIELD_H } from '../engine/field.js';
import { EVT } from '../engine/events.js';
import { clamp, rand } from '../engine/rng.js';
import { spawnFx, spawnDrop, nextId } from './state.js';
import { earnForce } from './force.js';

/** Rebuild the drop script for the wave about to start and zero the kill counters. */
export function planDrops(state, planet, waveIndex) {
  const plan = state._dropPlan;
  plan.length = 0;
  state._waveKills = 0;
  state._waveKillsByType = {};
  const script = planet.powerups;
  if (!Array.isArray(script)) return;
  for (let i = 0; i < script.length; i++) {
    const e = script[i];
    if (e.wave === waveIndex + 1) {
      plan.push({ kill: e.kill, type: e.type, droidType: e.droidType ?? null, fired: false });
    }
  }
}

/**
 * Record a droid death for the drop script and spawn any pickup it triggers. Called from
 * EVERY death site (bolt arrival, Force Crush, the ultimate power-up) so counting is uniform.
 * Scoring/force/DROID_KILLED stay at their original call sites — this only adds the drop.
 */
export function noteDroidDeath(state, globals, emitter, d) {
  state._waveKills++;
  const t = d.typeKey;
  state._waveKillsByType[t] = (state._waveKillsByType[t] || 0) + 1;
  if (!globals.powerups?.enabled) return;
  const plan = state._dropPlan;
  for (let i = 0; i < plan.length; i++) {
    const e = plan[i];
    if (e.fired) continue;
    const hit = e.droidType
      ? (t === e.droidType && state._waveKillsByType[t] === e.kill)
      : state._waveKills === e.kill;
    if (!hit) continue;
    e.fired = true;
    const x = clamp(d.x, 14, FIELD_W - 14);
    spawnDrop(state, e.type, x, globals.powerups.spawnY);
    emitter.emit(EVT.POWERUP_DROPPED, { type: e.type, droidType: t, x });
  }
}

function caught(d, j, r2) {
  const dx = d.x - j.x, dy = d.y - j.y;
  return dx * dx + dy * dy < r2;
}

/** Fall, catch, miss. The ally jedi catches too — it is a second pair of hands, not a decoy. */
export function stepDrops(state, globals, emitter, dt) {
  const P = globals.powerups;
  const pool = state.drops;
  const r2 = P.catchRadius * P.catchRadius;
  for (let i = 0; i < pool.length; i++) {
    const d = pool[i];
    if (!d.active) continue;
    d.y += P.fallSpeed * dt;
    if (caught(d, state.jedi, r2) || (state.jedi2.active && caught(d, state.jedi2, r2))) {
      d.active = false;
      spawnFx(state, 'pickup', d.x, d.y, 0.45);
      applyPowerup(state, globals, emitter, d.type);
      state.waveStats.powerupsCaught++;
      emitter.emit(EVT.POWERUP_COLLECTED, { type: d.type });
      continue;
    }
    if (d.y > FIELD_H + 12) {
      d.active = false;
      emitter.emit(EVT.POWERUP_MISSED, { type: d.type });
    }
  }
}

/** Tick the force ramp and every buff countdown, expiring each one exactly once. */
export function stepBuffs(state, globals, emitter, dt) {
  const B = state.buffs;

  // forceFull / forceHalf drip-feed: fed through earnForce so the high-water mark, tier
  // unlocks and waveStats.forceGained all behave as if it were earned normally.
  if (state._forceRampRemain > 0) {
    const chunk = Math.min(state._forceRampRemain, state._forceRampRate * dt);
    state._forceRampRemain -= chunk;
    earnForce(state, globals, emitter, chunk, 'powerup');
    if (state._forceRampRemain <= 0) { state._forceRampRemain = 0; state._forceRampRate = 0; }
  }

  if (B.empowerT > 0) {
    B.empowerT -= dt;
    if (B.empowerT <= 0) B.empowerT = 0;
  }
  if (B.allyT > 0) {
    B.allyT -= dt;
    if (B.allyT <= 0) {
      B.allyT = 0;
      state.jedi2.active = false;
      state.jedi2.ally = null;
      state._blockStamps2.length = 0;
    }
  }
  if (B.badBatchT > 0) {
    B.badBatchT -= dt;
    if (B.badBatchT <= 0) { B.badBatchT = 0; dismissBadBatch(state); }
  }
}

/**
 * The Bad Batch march off rather than being spliced out: in-flight bolts hold direct target
 * references, so removing them mid-wave would leave bolts chasing ghosts. `gone` tells the
 * renderer to skip them; wave.js prunes them at the next startWave, when no bolt is live.
 */
function dismissBadBatch(state) {
  for (let i = 0; i < state.clones.length; i++) {
    const c = state.clones[i];
    if (c.temp) { c.alive = false; c.gone = true; }
  }
}

export function applyPowerup(state, globals, emitter, type) {
  const T = globals.powerups.types;

  if (type === 'forceFull' || type === 'forceHalf') {
    const c = T[type];
    const amount = globals.forceBar.capacity * c.fillFrac;
    // Additive: catching a second one mid-ramp tops up rather than truncating the first.
    state._forceRampRemain += amount;
    state._forceRampRate = amount / Math.max(0.0001, c.fillSec);

  } else if (type === 'healAll') {
    const amt = T.healAll.amount;
    for (let i = 0; i < state.clones.length; i++) {
      const c = state.clones[i];
      if (!c.alive) continue;
      c.hp = Math.max(c.hp, c.maxHp * amt); // a sub-1.0 amount must never DAMAGE a healthy clone
      spawnFx(state, 'heal', c.x, c.y, 0.8);
    }

  } else if (type === 'empower') {
    state.buffs.empowerT = T.empower.durationSec;
    spawnFx(state, 'surge', state.jedi.x, state.jedi.y, 0.6);

  } else if (type === 'secondYoda') {
    const c = T.secondYoda;
    const j2 = state.jedi2;
    state.buffs.allyT = c.durationSec;
    j2.active = true;
    j2.ally = c.ally;
    // Snap into position instead of sweeping in from wherever it last stood.
    j2.tx = j2.x = clamp(state.jedi.x - c.offsetX, 14, FIELD_W - 14);
    j2.ty = j2.y = state.jedi.y;
    state._blockStamps2.length = 0;
    spawnFx(state, 'surge', j2.x, j2.y, 0.6);

  } else if (type === 'ultimate') {
    // Same rules as Force Push (globals.powers.push), field-wide, then crush a fraction.
    const P = globals.powers.push;
    const ceil = globals.zones.droidYMin * FIELD_H;
    const live = [];
    for (let i = 0; i < state.droids.length; i++) if (state.droids[i].alive) live.push(state.droids[i]);
    for (let i = 0; i < live.length; i++) {
      const d = live[i];
      d.stun = P.stunSec;
      d.y = clamp(d.y - P.knockback, ceil, d.y);
      spawnFx(state, 'ring', d.x, d.y, 0.5);
    }
    // Partial Fisher-Yates: pick crushFrac of them without shuffling the whole list.
    const n = Math.min(live.length, Math.ceil(live.length * T.ultimate.crushFrac));
    for (let i = 0; i < n; i++) {
      const j = i + ((Math.random() * (live.length - i)) | 0);
      const swap = live[i]; live[i] = live[j]; live[j] = swap;
      const d = live[i];
      d.hp = 0;
      d.alive = false;
      spawnFx(state, 'crush', d.x, d.y, 0.6);
      noteDroidDeath(state, globals, emitter, d); // uncredited, like Force Crush — economy unchanged
    }

  } else if (type === 'badBatch') {
    const c = T.badBatch;
    state.buffs.badBatchT = c.durationSec;
    const y = c.y * FIELD_H;
    for (let i = 0; i < c.count; i++) {
      const t = c.count === 1 ? 0.5 : i / (c.count - 1);
      const x = clamp(FIELD_W / 2 + (t - 0.5) * 2 * c.spread, 16, FIELD_W - 16);
      state.clones.push({
        id: nextId(state), x, y: y + rand(-8, 8),
        hp: c.hp, maxHp: c.hp, alive: true,
        typeKey: 'badbatch', sprite: 'badbatch', cd: rand(0, 0.6),
        temp: true, gone: false,
        // Their own fire profile: they are not in planet.clones, so combat.js reads this instead.
        def: { damage: c.damage, accuracy: c.accuracy, fireRate: c.fireRate, jitter: c.jitter },
      });
      spawnFx(state, 'surge', x, y, 0.5);
    }
  }
}
