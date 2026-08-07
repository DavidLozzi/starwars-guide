// Run state shape (CONTRACTS.md "State shape") + pooled-object helpers.
// Bolts and FX live in pools: reused slots with an `active` flag, never per-frame allocated.

import { FIELD_W, FIELD_H } from '../engine/field.js';

export function createState() {
  return {
    mode: 'title', // title | play | power | breather | over | order66 | finale
    planetIndex: 0,
    waveIndex: 0,
    score: 0,
    force: 0,
    highestForce: 0, // run high-water mark → drives tier unlocks
    jedi: { x: FIELD_W / 2, y: FIELD_H * 0.7, tx: FIELD_W / 2, ty: FIELD_H * 0.7, alive: true },
    clones: [],
    droids: [],
    bolts: [], // POOL
    walls: [],
    fx: [], // POOL
    drops: [], // POOL — falling power-ups the jedi must catch (§19)
    // Ally jedi summoned by the secondYoda power-up. `ally` keys ALLY_JEDI in render/sprites.js.
    jedi2: { active: false, ally: null, x: FIELD_W / 2, y: FIELD_H * 0.7, tx: FIELD_W / 2, ty: FIELD_H * 0.7 },
    // Power-up buff timers, seconds counting down. Zero = inactive. Cleared every wave.
    buffs: { empowerT: 0, allyT: 0, badBatchT: 0 },
    selector: null,
    prevMode: 'play',
    breatherT: 0,
    breatherPaused: false,
    pendingPlanetIndex: null,
    waveStats: { deflects: 0, bKills: 0, clonesLost: 0, forceGained: 0, powerupsCaught: 0 },
    planetStats: { clonesLost: 0 }, // cumulative clone deaths on the current planet
    runStats: { startedAtMs: 0, deaths: 0, powersUsed: 0 },

    // ---- internal sim bookkeeping (not part of the render/UI contract) ----
    _clock: 0, // seconds since run start (headless time base for the saber window)
    _waveT: 0, // seconds elapsed in the current wave (pressure ramp)
    _blockStamps: [], // ms timestamps of recent saber blocks (saber cap window)
    _blockStamps2: [], // same window for the ally jedi — an independent budget, so the ally is a real spike
    _leakStreak: 0, // leaked droid bolts since last mercy trigger / wave start (blocks do NOT reset it)
    _saberSafetyUntil: 0, // sim-clock (seconds) until which every bolt guarantees a block
    _forcePauseUntil: 0, // clone-death "the Force recoils" stall (§4)
    _powerGraceT: 0, // post-power freeze (s) so the player can reposition their thumb
    _clearHoldT: 0, // last droid died: sim keeps running this long (s) before the breather (§8)
    _forceRampRemain: 0, // force still owed by a forceFull/forceHalf pickup (drip-fed so the bar animates)
    _forceRampRate: 0, // force per second while the ramp runs
    _dropPlan: [], // this wave's scripted drops: { kill, type, droidType, fired }
    _waveKills: 0, // droid deaths this wave, every type, every source (drop script counter)
    _waveKillsByType: {}, // typeKey → deaths this wave (drop script counter, droidType-scoped entries)
    _unlocked: {}, // power → true once its tier threshold was crossed this run
    _planetFlawless: true, // no clone died this planet
    _o66T: 0, // seconds since Order 66 began (banner beat, then the volley)
    _o66DeadT: -1, // seconds since the jedi fell; < 0 until the killing blow lands
    _idSeq: 0,
  };
}

// ---- pools -----------------------------------------------------------------

export function spawnBolt(state) {
  const pool = state.bolts;
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].active) return reset(pool[i]);
  }
  const b = reset({});
  pool.push(b);
  return b;
}

function reset(b) {
  b.active = true;
  b.x = 0; b.y = 0; b.vx = 0; b.vy = 0;
  b.from = 'B';
  b.dmg = 1;
  b.acc = 1;
  b.speed = 0; // this bolt's own travel speed — droid types differ; a deflected bolt keeps it
  b.blocked = false;
  b.saberChecked = false;
  b.deflHit = false;
  b.targetId = null;
  b.target = null; // internal ref (units are stationary within a wave)
  return b;
}

export function spawnFx(state, type, x, y, life) {
  const pool = state.fx;
  let f = null;
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].active) { f = pool[i]; break; }
  }
  if (!f) { f = {}; pool.push(f); }
  f.active = true;
  f.type = type;
  f.x = x; f.y = y;
  f.life = life;
  f.maxLife = life;
  return f;
}

export function spawnDrop(state, type, x, y) {
  const pool = state.drops;
  let d = null;
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].active) { d = pool[i]; break; }
  }
  if (!d) { d = {}; pool.push(d); }
  d.active = true;
  d.type = type;
  d.x = x; d.y = y;
  return d;
}

export function nextId(state) {
  return ++state._idSeq;
}
