// Event catalog + emitter — PRD §11 requires event emission in the core loop from day one.
// Sim emits; UI and meta consume. Emit even if nothing listens yet.

export const EVT = {
  RUN_STARTED: 'runStarted',
  PLANET_STARTED: 'planetStarted',     // { planetIndex, name }
  WAVE_STARTED: 'waveStarted',         // { planetIndex, waveIndex }
  DEFLECTED: 'deflected',              // { x, y }
  CLONE_DIED: 'cloneDied',             // { id, remaining }
  DROID_KILLED: 'droidKilled',         // { typeKey, byDeflect }
  WAVE_CLEARED: 'waveCleared',         // { waveIndex, survivors, deflects, bKills, forceGained, clonesLost, planetClonesLost, powerupsCaught, flawless }
  PLANET_CLEARED: 'planetCleared',     // { planetIndex, flawless }
  TIER_UNLOCKED: 'tierUnlocked',       // { power }
  POWER_USED: 'powerUsed',             // { power, cost }
  POWERUP_DROPPED: 'powerupDropped',   // { type, droidType, x } — a scripted kill spawned a falling pickup
  POWERUP_COLLECTED: 'powerupCollected', // { type } — the jedi (or the ally) caught it
  POWERUP_MISSED: 'powerupMissed',     // { type } — it fell off the bottom of the field
  FORCE_EARNED: 'forceEarned',         // { amount, source }
  BREATHER_STARTED: 'breatherStarted', // { nextIsPlanet }
  ORDER66_STARTED: 'order66Started',   // { planetIndex, score } — clones turn on the jedi, map still live
  JEDI_FELL: 'jediFell',               // { planetIndex }
  // Progression — emitted by meta/ (the one place that is both consumer and emitter).
  BADGE_AWARDED: 'badgeAwarded',       // { id, name, total }
  SKIN_UNLOCKED: 'skinUnlocked',       // { id, name, unlockType, unlockValue, total }
  SKIN_EQUIPPED: 'skinEquipped',       // { id, name, previousId, source }
  NEW_BEST: 'newBest',                 // { planet, wave, score, previousPlanet, previousWave, previousScore }
  RUN_ENDED: 'runEnded',               // { planetIndex, waveIndex, score, durationSec, cause }
  FINALE_REACHED: 'finaleReached',     // { score }
};

export function createEmitter() {
  const listeners = new Map();
  return {
    on(evt, fn) {
      if (!listeners.has(evt)) listeners.set(evt, []);
      listeners.get(evt).push(fn);
      return fn;
    },
    off(evt, fn) {
      const arr = listeners.get(evt);
      if (!arr) return;
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    },
    emit(evt, payload) {
      const arr = listeners.get(evt);
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) arr[i](payload);
    },
  };
}
