// Force-power effect primitives (PRD §6): pushback · wall · kill · healClone.
// Config-driven magnitudes (GLOBALS.powers). New variants are config; new verbs are code.

import { FIELD_H } from '../engine/field.js';
import { spawnFx } from './state.js';
import { noteDroidDeath } from './powerups.js';
import { clamp } from '../engine/rng.js';

export function applyPower(state, globals, power, x, y, emitter) {
  const P = globals.powers;
  if (power === 'push') {
    const r2 = P.push.radius * P.push.radius;
    const ceil = globals.zones.droidYMin * FIELD_H;
    for (let i = 0; i < state.droids.length; i++) {
      const d = state.droids[i];
      if (!d.alive) continue;
      const dx = d.x - x, dy = d.y - y;
      if (dx * dx + dy * dy < r2) {
        d.stun = P.push.stunSec;
        d.y = clamp(d.y - P.push.knockback, ceil, d.y);
        spawnFx(state, 'ring', d.x, d.y, 0.5);
      }
    }
  } else if (power === 'block') {
    state.walls.push({ x, y, w: P.block.wallWidth, hp: P.block.wallHp, maxHp: P.block.wallHp });
  } else if (power === 'crush') {
    const best = nearest(state.droids, x, y, P.crush.radius);
    if (best) {
      best.hp = 0;
      best.alive = false;
      spawnFx(state, 'crush', best.x, best.y, 0.6);
      // Uncredited (no score/force/DROID_KILLED, as always) but it still advances the
      // power-up drop script — a drop must not depend on HOW the droid died.
      noteDroidDeath(state, globals, emitter, best);
    }
  } else if (power === 'heal') {
    // canRevive=false → dead clones are not valid heal targets (PRD §13.6 default)
    const best = nearest(state.clones, x, y, P.heal.innerRadius, !P.heal.canRevive);
    if (best) {
      best.hp = best.maxHp * P.heal.amount;
      spawnFx(state, 'heal', best.x, best.y, 0.8);
    }
    const or2 = P.heal.outerRadius * P.heal.outerRadius;
    for (let i = 0; i < state.clones.length; i++) {
      const c = state.clones[i];
      if (!c.alive || c === best) continue;
      const dx = c.x - x, dy = c.y - y;
      if (dx * dx + dy * dy < or2) {
        c.hp = Math.min(c.maxHp, c.hp + P.heal.neighborAmount * c.maxHp);
        spawnFx(state, 'heal', c.x, c.y, 0.5);
      }
    }
  }
}

function nearest(list, x, y, radius, mustBeAlive = true) {
  let best = null;
  let bd = radius * radius;
  for (let i = 0; i < list.length; i++) {
    const u = list[i];
    if (mustBeAlive && !u.alive) continue;
    const dx = u.x - x, dy = u.y - y;
    const dd = dx * dx + dy * dy;
    if (dd < bd) { bd = dd; best = u; }
  }
  return best;
}
