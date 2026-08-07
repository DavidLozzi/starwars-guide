// Combat — mutual fire, bolt motion, saber block (cap per window), two-knob deflection,
// walls, arrival damage & death. PRD §2. Emits DEFLECTED, DROID_KILLED, CLONE_DIED.

import { EVT } from '../engine/events.js';
import { spawnBolt, spawnFx } from './state.js';
import { earnForce } from './force.js';
import { noteDroidDeath } from './powerups.js';
import { clamp01 } from '../engine/rng.js';

export const ARRIVE_R = 10; // field units: a bolt "reaches" its target within this radius

// Reused scratch — the Bad Batch draw every droid's fire while they last (PRD §19).
const tempPool = [];

/** Droid target pool: the Bad Batch squad when one is deployed, otherwise the whole army. */
function targetPool(liveClones) {
  tempPool.length = 0;
  for (let i = 0; i < liveClones.length; i++) if (liveClones[i].temp) tempPool.push(liveClones[i]);
  return tempPool.length ? tempPool : liveClones;
}

function pressureMult(state, globals) {
  const t = Math.min(1, state._waveT / globals.pressureRampSec);
  return 1 + (globals.pressureRamp - 1) * t;
}

function shotAccuracy(def) {
  return clamp01(def.accuracy + (Math.random() * 2 - 1) * def.jitter * def.accuracy);
}

function cooldown(def, rateMult = 1) {
  return (1 / (def.fireRate * rateMult)) * (1 + (Math.random() * 2 - 1) * def.jitter);
}

export function fireBolt(state, from, shooter, target, def, dmg) {
  const b = spawnBolt(state);
  b.from = from;
  b.x = shooter.x;
  b.y = shooter.y + (from === 'B' ? 14 : -10);
  b.dmg = dmg;
  b.acc = shotAccuracy(def);
  b.target = target;
  b.targetId = target.id;
  // Per droid TYPE speed (planet config); clones have no boltSpeed and fall back to the
  // global. Stored on the bolt so the deflect return keeps this bolt's own speed.
  b.speed = def.boltSpeed || state._boltSpeed;
  aimAt(b, target.x, target.y, b.speed);
}

export function aimAt(b, tx, ty, speed) {
  const a = Math.atan2(ty - b.y, tx - b.x);
  b.vx = Math.cos(a) * speed;
  b.vy = Math.sin(a) * speed;
}

const DEG = Math.PI / 180;

/**
 * Rotate an already-aimed returned bolt by ±planet.deflectJitterDeg — the jedi's aim gets
 * shakier as the campaign wears on (PRD §2). Small angles matter: the bolt only connects if
 * it passes within ARRIVE_R of the target, so the miss threshold is atan(ARRIVE_R / distance)
 * ≈ 1.4°–2.5° over the jedi→droid range (jedi sits at 0.7·FIELD_H, droids at 0.05–0.30).
 * A missed bolt keeps flying and is culled off-field — deflHit stays true, so if the jittered
 * line happens to still pass through the target it lands at full multiplied damage.
 */
function deflectJitter(b, planet, target) {
  const spread = planet.deflectJitterDeg || 0;
  if (spread <= 0) return;
  const a = Math.atan2(target.y - b.y, target.x - b.x)
    + (Math.random() * 2 - 1) * spread * DEG;
  const speed = Math.hypot(b.vx, b.vy);
  b.vx = Math.cos(a) * speed;
  b.vy = Math.sin(a) * speed;
}

export function stepCombat(state, globals, planet, emitter, dt, liveClones, liveDroids) {
  state._boltSpeed = globals.boltSpeed; // clone / fallback speed; droid types carry their own

  // --- mutual fire: both sides pick a RANDOM valid live enemy (PRD §2) ---
  const pmult = pressureMult(state, globals);
  const droidTargets = targetPool(liveClones);
  for (let i = 0; i < liveDroids.length; i++) {
    const d = liveDroids[i];
    if (d.stun > 0) { d.stun -= dt; continue; }
    d.cd -= dt * pmult;
    if (d.cd <= 0 && droidTargets.length) {
      const def = planet.droids[d.typeKey];
      d.cd = cooldown(def);
      const t = droidTargets[(Math.random() * droidTargets.length) | 0];
      fireBolt(state, 'B', d, t, def, def.damage);
    }
  }
  for (let i = 0; i < liveClones.length; i++) {
    const c = liveClones[i];
    c.cd -= dt;
    if (c.cd <= 0 && liveDroids.length) {
      const def = c.def || planet.clones[c.typeKey]; // Bad Batch carry their own profile
      c.cd = cooldown(def, globals.cloneFireRateMult);
      const t = liveDroids[(Math.random() * liveDroids.length) | 0];
      fireBolt(state, 'C', c, t, def, def.damage);
    }
  }

  // --- prune saber block windows (sim time in ms) ---
  // The ally jedi keeps its OWN window, so summoning it genuinely doubles the throughput
  // instead of splitting one budget between two sabers.
  const nowMs = state._clock * 1000;
  const stamps = state._blockStamps;
  const stamps2 = state._blockStamps2;
  while (stamps.length && nowMs - stamps[0] >= globals.saber.windowMs) stamps.shift();
  while (stamps2.length && nowMs - stamps2[0] >= globals.saber.windowMs) stamps2.shift();

  // --- move + resolve bolts ---
  const bolts = state.bolts;
  const jx = state.jedi.x, jy = state.jedi.y;
  const j2 = state.jedi2;
  const saberR2 = globals.saber.radius * globals.saber.radius;
  // Battle-meditation buff: sharper return aim and much heavier return damage, for a few seconds.
  const emp = state.buffs.empowerT > 0 ? globals.powerups.types.empower : null;
  const returnAcc = emp
    ? Math.min(emp.accuracyCap, planet.deflectAccuracy * emp.accuracyMult)
    : planet.deflectAccuracy;
  const returnMult = planet.deflectMultiplier * (emp ? emp.deflectMult : 1);
  for (let i = 0; i < bolts.length; i++) {
    const b = bolts[i];
    if (!b.active) continue;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // saber block — droid bolts only, not yet blocked (PRD §2)
    if (b.from === 'B' && !b.blocked) {
      if (!b.saberChecked) {
        const ddx = b.x - jx, ddy = b.y - jy;
        let arc = ddx * ddx + ddy * ddy < saberR2 ? stamps : null;
        if (!arc && j2.active) {
          const d2x = b.x - j2.x, d2y = b.y - j2.y;
          if (d2x * d2x + d2y * d2y < saberR2) arc = stamps2;
        }
        if (arc) {
          b.saberChecked = true; // one roll per bolt transit — dwell time can exceed windowMs, don't re-roll every frame
          const inSafety = state._clock < state._saberSafetyUntil;
          const withinCap = arc.length < globals.saber.blockCapacity;
          const chance = withinCap ? globals.saber.blockChance : globals.saber.overflowChance;
          if (inSafety || Math.random() < chance) {
            if (!inSafety && withinCap) arc.push(nowMs); // mercy blocks bypass the window entirely
            b.blocked = true;
            state.waveStats.deflects++;
            state.score += globals.score.deflect;
            earnForce(state, globals, emitter, globals.earn.deflect, 'deflect');
            emitter.emit(EVT.DEFLECTED, { x: b.x, y: b.y });
            spawnFx(state, 'spark', b.x, b.y, 0.25);
            // two independent knobs: return accuracy, then multiplied damage (PRD §2)
            if (Math.random() < returnAcc && liveDroids.length) {
              const v = liveDroids[(Math.random() * liveDroids.length) | 0];
              b.target = v; b.targetId = v.id; b.deflHit = true;
              b.dmg = b.dmg * returnMult;
              aimAt(b, v.x, v.y, b.speed); // returned at the speed it arrived with
              deflectJitter(b, planet, v);
            } else {
              b.target = null; b.targetId = null; // miss: flies off harmlessly
              b.vx = (Math.random() * 2 - 1) * b.speed * 0.5;
              b.vy = -b.speed;
            }
          } else {
            // leaked: bolt passes through untouched. Leaks accumulate (blocks do NOT reset the
            // count); every leakLimit-th leak triggers a mercy window that guarantees blocking
            // for globals.saber.safetySec seconds.
            state._leakStreak++;
            if (state._leakStreak >= globals.saber.leakLimit) {
              state._saberSafetyUntil = state._clock + globals.saber.safetySec;
              state._leakStreak = 0;
            }
          }
        }
      }
      // wall interception (Force Block): droid bolts only. Runs every frame regardless of
      // saberChecked — a bolt that already leaked past the saber must still be stoppable by a wall.
      if (!b.blocked) {
        const walls = state.walls;
        for (let w = 0; w < walls.length; w++) {
          const wl = walls[w];
          if (wl.hp > 0 && Math.abs(b.y - wl.y) < 6 && Math.abs(b.x - wl.x) < wl.w / 2) {
            wl.hp -= b.dmg;
            b.active = false;
            spawnFx(state, 'spark', b.x, b.y, 0.2);
            break;
          }
        }
        if (!b.active) continue;
      }
    }

    // arrival at a live target
    const tgt = b.target;
    if (tgt) {
      const adx = b.x - tgt.x, ady = b.y - tgt.y;
      if (adx * adx + ady * ady < ARRIVE_R * ARRIVE_R) {
        b.active = false;
        const hit = b.deflHit || Math.random() < b.acc;
        if (hit && tgt.alive && tgt.temp) {
          // Bad Batch draws fire but cannot be killed — they leave only when their timer expires.
          spawnFx(state, 'spark', tgt.x, tgt.y, 0.2);
        } else if (hit && tgt.alive) {
          tgt.hp -= b.dmg;
          if (tgt.hp <= 0) {
            tgt.alive = false;
            const targetIsDroid = b.from === 'C' || b.deflHit;
            if (targetIsDroid) {
              state.waveStats.bKills++;
              state.score += globals.score.bKill;
              earnForce(state, globals, emitter, globals.earn.bKill, 'bKill');
              emitter.emit(EVT.DROID_KILLED, { typeKey: tgt.typeKey, byDeflect: !!b.deflHit });
              noteDroidDeath(state, globals, emitter, tgt);
            } else {
              killClone(state, globals, emitter, tgt);
            }
          }
        }
        continue;
      }
    }

    // off-field cull
    if (b.y < -50 || b.y > 690 || b.x < -50 || b.x > 450) b.active = false;
  }

  // fx decay
  const fx = state.fx;
  for (let i = 0; i < fx.length; i++) {
    if (fx[i].active) { fx[i].life -= dt; if (fx[i].life <= 0) fx[i].active = false; }
  }
  // compact walls
  for (let i = state.walls.length - 1; i >= 0; i--) if (state.walls[i].hp <= 0) state.walls.splice(i, 1);
}

function killClone(state, globals, emitter, clone) {
  state.waveStats.clonesLost++;
  state.planetStats.clonesLost++;
  state.runStats.deaths++;
  state._planetFlawless = false;
  state._forcePauseUntil = state._clock + globals.earn.cloneDeathPauseSec; // the Force recoils (§4)
  // Bad Batch are borrowed bodies, not part of the life pool — they never pad the count.
  let remaining = 0;
  for (let i = 0; i < state.clones.length; i++) {
    const c = state.clones[i];
    if (c.alive && !c.temp) remaining++;
  }
  emitter.emit(EVT.CLONE_DIED, { id: clone.id, remaining });
}
