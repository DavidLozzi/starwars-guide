// Meta facade — createMeta({ emitter, config }) → the object UI receives as deps.meta.
// Pure event consumer (CONTRACTS.md): subscribes to EVT, never touches sim internals.

import { EVT } from '../engine/events.js';
import { createPersistence } from './persistence.js';
import { SKINS, skinById, evaluateSkinUnlocks } from './skins.js';
import { BADGES, BADGE_IDS, badgeById, wireBadges } from './badges.js';
import { shareCard as shareCardImpl, renderCardCanvas } from './sharecard.js';
import { seal } from '../ui/env.js';

/**
 * @param {object} opts
 * @param {object} opts.emitter  engine/events.js emitter
 * @param {object} opts.config   { globals, planets } (planets used for droid-type badges)
 * @param {object} [opts.storage] localStorage-like override (tests); defaults to
 *                                real localStorage, or in-memory when headless.
 */
export function createMeta({ emitter, config, storage } = {}) {
  const persistence = createPersistence(storage);
  const profile = persistence.loadProfile(); // live ref — mutated in place, UI reads it directly
  const playerId = persistence.playerId();   // anonymous per-device id, survives resetAll()

  // ---- run-scoped trackers -------------------------------------------------
  let runPlanet = 1;        // furthest planet reached this run (1-based)
  let runBadges = [];       // badge ids earned this run (game-over screen, PRD §17)
  let runSkins = [];        // skin ids unlocked this run
  let planetBadges = [];    // badge ids earned during the current planet (planet-clear screen)
  let planetSkins = [];     // skin ids unlocked during the current planet

  // ---- badges ----------------------------------------------------------------
  function award(id) {
    if (!BADGE_IDS.has(id)) return false;      // ignore ids outside the catalog
    if (profile.badges[id]) return false;      // no duplicates
    persistence.awardBadge(id);
    runBadges.push(id);
    planetBadges.push(id);
    const def = badgeById(id);
    emitter.emit(EVT.BADGE_AWARDED, {
      id, name: (def && def.name) || id, total: Object.keys(profile.badges).length,
    });
    return true;
  }
  wireBadges({ emitter, config, award });

  // ---- skins -----------------------------------------------------------------
  // Unlocks evaluate against best-so-far: best record merged with the current
  // run's progress (so reaching Planet 3 unlocks mid-run, not only after death).
  function checkSkinUnlocks(runScore) {
    const record = {
      planet: Math.max(profile.best.planet, runPlanet),
      score: Math.max(profile.best.score, Number(runScore) || 0),
    };
    const newly = evaluateSkinUnlocks(record, profile.skins.unlocked);
    for (const id of newly) {
      persistence.unlockSkin(id);
      runSkins.push(id);
      planetSkins.push(id);
      const def = skinById(id);
      emitter.emit(EVT.SKIN_UNLOCKED, {
        id,
        name: (def && def.name) || id,
        unlockType: def && def.unlock ? def.unlock.type : null,
        unlockValue: def && def.unlock ? def.unlock.value : null,
        total: profile.skins.unlocked.length,
      });
    }
    return newly;
  }

  // ---- event wiring ------------------------------------------------------------
  emitter.on(EVT.RUN_STARTED, () => {
    runPlanet = 1;
    runBadges = [];
    runSkins = [];
  });

  // Deferred host-context check (docs/HOST-LOCK.md) — third wave of a run.
  let cleared = 0;
  emitter.on(EVT.WAVE_CLEARED, () => { if (++cleared === 3) seal(); });

  emitter.on(EVT.PLANET_STARTED, (p) => {
    runPlanet = ((p && p.planetIndex) || 0) + 1;
    planetBadges = [];   // reset before checkSkinUnlocks so reach-this-planet skins count here
    planetSkins = [];
    checkSkinUnlocks(0);
  });

  emitter.on(EVT.RUN_ENDED, (p) => {
    const payload = p || {};
    // profile.best is mutated in place by recordRun, so snapshot it first to spot a new record.
    const was = { planet: profile.best.planet, wave: profile.best.wave, score: profile.best.score };
    // RUN_ENDED carries 0-based indices; profile stores 1-based (contract).
    persistence.recordRun({
      planet: (payload.planetIndex || 0) + 1,
      wave: (payload.waveIndex || 0) + 1,
      score: payload.score || 0,
      durationSec: payload.durationSec || 0,
      cause: payload.cause,
    });
    const best = profile.best;
    if (best.planet !== was.planet || best.wave !== was.wave || best.score !== was.score) {
      emitter.emit(EVT.NEW_BEST, {
        planet: best.planet, wave: best.wave, score: best.score,
        previousPlanet: was.planet, previousWave: was.wave, previousScore: was.score,
      });
    }
    checkSkinUnlocks(payload.score || 0);
  });

  // ---- public surface ------------------------------------------------------------
  /** Equip a skin. `source` is analytics-only: 'collections' | 'planet_clear'. */
  function setActiveSkin(id, source) {
    const previousId = profile.skins.active;
    const okSwap = persistence.setActiveSkin(id);  // refuses locked skins
    if (!okSwap || previousId === id) return okSwap;
    const def = skinById(id);
    emitter.emit(EVT.SKIN_EQUIPPED, {
      id, name: (def && def.name) || id, previousId, source: source || 'unknown',
    });
    return true;
  }

  function activeSkin() {
    const s = skinById(profile.skins.active) || SKINS[0];
    return {
      id: s.id, name: s.name, saberColor: s.saberColor,
      palette: s.palette, map: s.map,
    };
  }

  return {
    profile,
    playerId,
    catalogs: { skins: SKINS, badges: BADGES },

    markHelperSeen: persistence.markHelperSeen,
    markPowerupSeen: persistence.markPowerupSeen, // first-catch power-up cards (ui/pickups.js)
    markCoachSeen: persistence.markCoachSeen,   // one-time coaching nudges (ui/coach.js)
    resetHelpers: persistence.resetHelpers,     // force dialogs show again (no reload)
    resetAllData: persistence.resetAll,         // wipe profile; caller reloads the page
    setActiveSkin,                              // refuses locked skins, persists, emits SKIN_EQUIPPED
    activeSkin,

    /** Share flow (PRD §9): planetCfg = the planet the player died on. */
    shareCard: (runResult, planetCfg) => shareCardImpl(runResult, planetCfg, activeSkin()),
    /** Card preview without triggering the share sheet (collections / game-over). */
    renderCardCanvas: (runResult, planetCfg) => renderCardCanvas(runResult, planetCfg, activeSkin()),

    /** Surfaced on the game-over screen (PRD §17). */
    badgesEarnedThisRun: () => runBadges.slice(),
    skinsUnlockedThisRun: () => runSkins.slice(),

    /** Surfaced on the planet-clear breather screen (what was recovered this world). */
    badgesEarnedThisPlanet: () => planetBadges.slice(),
    skinsUnlockedThisPlanet: () => planetSkins.slice(),
  };
}
