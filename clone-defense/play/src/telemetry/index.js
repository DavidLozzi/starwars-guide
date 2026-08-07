// Telemetry wiring — turns the internal event bus and DOM clicks into Datadog actions.
//
// Deliberately a pure SUBSCRIBER: it listens to EVT and to one delegated click listener,
// so gameplay code carries no analytics calls. The only exceptions live where the data
// cannot reach the bus — power rejection (ui/powerflow.js), share outcome (ui/screens.js,
// ui/finale.js) and the pre-wipe data reset (ui/screens.js).
//
// Every name comes from TE in ./events.js, which is also what generates
// dev/telemetry-reference.html. No name is ever written inline here.

import { EVT } from '../engine/events.js';
import { APP_VERSION } from '../version.js';
import { TE, CLICKS } from './events.js';
import { track, setContext, envOf } from './track.js';

export function initTelemetry(game, { emitter, meta, config } = {}) {
  if (typeof document === 'undefined') return {};
  const state = game.state;
  const planets = config.planets;
  const profile = meta.profile;
  const playerId = meta.playerId;

  // ---- context ---------------------------------------------------------------
  /** Run-scoped attributes merged into every game / ui / meta action. */
  function ctx(extra) {
    const planet = planets[state.planetIndex];
    let clonesAlive = 0;
    for (let i = 0; i < state.clones.length; i++) if (state.clones[i].alive) clonesAlive++;
    const out = {
      planet: state.planetIndex + 1,
      planetName: planet ? planet.name : null,
      wave: state.waveIndex + 1,
      score: state.score,
      force: Math.round(state.force),
      clonesAlive,
      mode: state.mode,
    };
    if (extra) for (const k in extra) out[k] = extra[k];
    return out;
  }

  function refreshGlobalContext() {
    setContext({
      playerId,
      appVersion: APP_VERSION,
      env: envOf(config.globals.rum || {}),
      debug: !!config.debug,
      jumpUsed: config.jumpPlanet != null || config.jumpWave != null,
      activeSkin: profile.skins.active,
      badgeCount: Object.keys(profile.badges).length,
      skinCount: profile.skins.unlocked.length,
      bestPlanet: profile.best.planet,
      bestScore: profile.best.score,
      runsPlayed: profile.runs.length,
    });
  }
  refreshGlobalContext();

  // ---- session ---------------------------------------------------------------
  track(TE.BOOT, {
    returning: profile.runs.length > 0,
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
  });

  // ---- game milestones -------------------------------------------------------
  // High-frequency events (DEFLECTED, DROID_KILLED, CLONE_DIED, FORCE_EARNED) are
  // deliberately absent — their totals ride on wave_cleared. See NOT_TRACKED in events.js.
  emitter.on(EVT.RUN_STARTED, () => {
    refreshGlobalContext();
    track(TE.RUN_STARTED, ctx({ startPlanet: state.planetIndex + 1 }));
  });

  emitter.on(EVT.PLANET_STARTED, (p) => {
    const planet = planets[p.planetIndex];
    let roster = 0;
    if (planet) for (const k in planet.roster) roster += planet.roster[k];
    refreshGlobalContext();
    track(TE.PLANET_STARTED, ctx({ planetId: planet ? planet.id : null, roster }));
  });

  emitter.on(EVT.WAVE_STARTED, () => {
    track(TE.WAVE_STARTED, ctx({ droids: state.droids.length }));
  });

  emitter.on(EVT.WAVE_CLEARED, (p) => {
    track(TE.WAVE_CLEARED, ctx({
      // waveIndex has already been incremented on state, so report the payload's value.
      wave: p.waveIndex + 1,
      survivors: p.survivors,
      deflects: p.deflects,
      bKills: p.bKills,
      forceGained: p.forceGained,
      clonesLost: p.clonesLost,
      planetClonesLost: p.planetClonesLost,
      powerupsCaught: p.powerupsCaught,
      flawless: p.flawless,
    }));
  });

  // Power-ups (PRD §19). Drops are scripted, so dropped vs collected is a clean catch rate.
  emitter.on(EVT.POWERUP_DROPPED, (p) => track(TE.POWERUP_DROPPED, ctx({ type: p.type, droidType: p.droidType })));
  emitter.on(EVT.POWERUP_COLLECTED, (p) => track(TE.POWERUP_COLLECTED, ctx({ type: p.type })));
  emitter.on(EVT.POWERUP_MISSED, (p) => track(TE.POWERUP_MISSED, ctx({ type: p.type })));

  emitter.on(EVT.PLANET_CLEARED, (p) => track(TE.PLANET_CLEARED, ctx({ flawless: p.flawless })));
  emitter.on(EVT.BREATHER_STARTED, (p) => track(TE.BREATHER_STARTED, ctx({ nextIsPlanet: p.nextIsPlanet })));

  emitter.on(EVT.TIER_UNLOCKED, (p) => {
    track(TE.TIER_UNLOCKED, ctx({ power: p.power, unlockAt: config.globals.tiers[p.power].unlockAt }));
  });

  emitter.on(EVT.POWER_USED, (p) => {
    track(TE.POWER_USED, ctx({
      power: p.power,
      cost: Math.round(p.cost),
      duringBreather: state.prevMode === 'breather',
    }));
  });

  emitter.on(EVT.ORDER66_STARTED, () => track(TE.ORDER66_STARTED, ctx()));
  emitter.on(EVT.JEDI_FELL, () => {
    track(TE.JEDI_FELL, ctx({ survivedSec: Math.round(state._o66T * 10) / 10 }));
  });

  emitter.on(EVT.RUN_ENDED, (p) => {
    track(TE.RUN_ENDED, ctx({
      cause: p.cause,
      planet: p.planetIndex + 1,
      wave: p.waveIndex + 1,
      score: p.score,
      durationSec: Math.round(p.durationSec),
      deaths: state.runStats.deaths,
      powersUsed: state.runStats.powersUsed,
    }));
    refreshGlobalContext();
  });

  // ---- progression (emitted by meta/) -----------------------------------------
  emitter.on(EVT.BADGE_AWARDED, (p) => {
    track(TE.BADGE_AWARDED, ctx({ badgeId: p.id, badgeName: p.name, total: p.total }));
  });
  emitter.on(EVT.SKIN_UNLOCKED, (p) => {
    track(TE.SKIN_UNLOCKED, ctx({
      skinId: p.id, skinName: p.name,
      unlockType: p.unlockType, unlockValue: p.unlockValue, total: p.total,
    }));
  });
  emitter.on(EVT.SKIN_EQUIPPED, (p) => {
    track(TE.SKIN_EQUIPPED, ctx({ skinId: p.id, skinName: p.name, previousId: p.previousId, source: p.source }));
    refreshGlobalContext();
  });
  emitter.on(EVT.NEW_BEST, (p) => {
    track(TE.NEW_BEST, ctx({
      bestPlanet: p.planet, bestWave: p.wave, bestScore: p.score,
      previousPlanet: p.previousPlanet, previousScore: p.previousScore,
    }));
  });

  // ---- clicks ------------------------------------------------------------------
  // ONE capture-phase listener rather than 20 wired handlers. Capture matters twice:
  // it beats the button's own handler (so state is still pre-action, e.g. the selector
  // still holds the power being cancelled), and it survives stopPropagation on .pw-help.
  function onClick(e) {
    const t = e.target;
    if (!t || typeof t.closest !== 'function') return;

    const help = t.closest('.pw-help');
    if (help) { track(TE.UI_POWER_HELP, ctx({ power: help.dataset.power })); return; }

    const badge = t.closest('[data-badge-id]');
    if (badge) {
      track(TE.UI_BADGE_INSPECTED, ctx({
        badgeId: badge.dataset.badgeId, unlocked: badge.dataset.unlocked === '1',
      }));
      return;
    }

    const skin = t.closest('[data-skin-id]');
    if (skin) {
      track(TE.UI_SKIN_CARD_TAP, ctx({
        skinId: skin.dataset.skinId,
        unlocked: skin.dataset.unlocked === '1',
        surface: skin.dataset.surface,
      }));
      return;
    }

    const btn = t.closest('[id]');
    if (!btn) return;
    const id = btn.id;

    if (id === 'btn-helper-ok') {
      track(TE.UI_HELPER_OK, ctx({ power: btn.dataset.power, gate: btn.dataset.gate === '1' }));
      return;
    }
    // One button, two meanings — the label is the only place the intent lives.
    if (id === 'btn-pause') {
      const resuming = btn.textContent.indexOf('RESUME') >= 0;
      track(resuming ? TE.UI_RESUME : TE.UI_PAUSE, ctx(resuming ? { method: 'button' } : null));
      return;
    }

    const hit = CLICKS[id];
    if (!hit) return;
    track(hit.name, ctx(hit.attrs));
  }

  const device = document.getElementById('device');
  const finale = document.getElementById('finale');
  if (device && device.addEventListener) device.addEventListener('click', onClick, true);
  if (finale && finale.addEventListener) finale.addEventListener('click', onClick, true);

  return { ctx };
}
