// Force economy — bar, tiered per-run unlocks (high-water mark), cascading discounts.
// PRD §4 (economy) and §6 (tiered per-run unlock + discount).

import { EVT } from '../engine/events.js';

export const TIER_ORDER = ['push', 'block', 'crush', 'heal'];

function tierIndex(power) {
  return TIER_ORDER.indexOf(power);
}

/** Highest tier index whose threshold the run's high-water force has crossed (−1 = none). */
export function highestUnlockedIndex(state, globals) {
  let h = -1;
  for (let i = 0; i < TIER_ORDER.length; i++) {
    if (state.highestForce >= globals.tiers[TIER_ORDER[i]].unlockAt) h = i;
  }
  return h;
}

/** Use cost after the cascading discount (each unlocked tier above cuts the cost). */
export function costOf(state, globals, power) {
  const base = globals.tiers[power].useCost;
  const above = Math.max(0, highestUnlockedIndex(state, globals) - tierIndex(power));
  const disc = 1 - globals.discount.perTierBelow * above;
  return Math.max(globals.discount.minCost, base * disc);
}

export function isUnlocked(state, globals, power) {
  return state.highestForce >= globals.tiers[power].unlockAt;
}

export function canUse(state, globals, power) {
  return isUnlocked(state, globals, power) && state.force >= costOf(state, globals, power);
}

/**
 * Add force from a continuous source (deflect / bKill). Suppressed during the
 * clone-death pause (§4) — 'waveClear' and 'powerup' are earned deliberately, not
 * continuously, so they bypass the stall. Updates the high-water mark and fires tier
 * unlocks. Returns the amount actually credited.
 */
export function earnForce(state, globals, emitter, amount, source) {
  const paused = source !== 'waveClear' && source !== 'powerup' && state._clock < state._forcePauseUntil;
  if (paused) return 0;
  const before = state.force;
  state.force = Math.min(globals.forceBar.capacity, state.force + amount);
  const gained = state.force - before;
  if (gained > 0) {
    state.waveStats.forceGained += gained;
    emitter.emit(EVT.FORCE_EARNED, { amount: gained, source });
  }
  refreshUnlocks(state, globals, emitter);
  return gained;
}

/** Raise the high-water mark to current force and emit TIER_UNLOCKED once per tier per run. */
export function refreshUnlocks(state, globals, emitter) {
  if (state.force > state.highestForce) state.highestForce = state.force;
  for (let i = 0; i < TIER_ORDER.length; i++) {
    const power = TIER_ORDER[i];
    if (state.highestForce >= globals.tiers[power].unlockAt && !state._unlocked[power]) {
      state._unlocked[power] = true;
      emitter.emit(EVT.TIER_UNLOCKED, { power });
    }
  }
}

export function spend(state, amount) {
  state.force = Math.max(0, state.force - amount);
}
