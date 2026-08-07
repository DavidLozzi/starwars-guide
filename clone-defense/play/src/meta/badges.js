// Badges — flat "you did X" collection, any order, no ranking (PRD §11).
// Pure event consumers: every condition is computable from the EVT stream (+ profile
// for dedupe). Never appear in-run, never touch balance.
//
// DEFERRED (v2): daily-streak / attendance badges — they need clock-based session
// tracking, which v1 deliberately skips. Per PRD §11 streaks must never grant skins.

import { EVT } from '../engine/events.js';

export const BADGES = [
  { id: 'first-blood',     name: 'FIRST BLOOD',     desc: 'Destroy a droid with a deflected bolt.' },
  { id: 'first-run',       name: 'BAPTISM OF FIRE', desc: 'Complete your first run.' },
  { id: 'reach-planet-3',  name: 'FIELD PROMOTION', desc: 'Reach Planet 3.' },
  { id: 'reach-planet-5',  name: 'SEASONED GENERAL', desc: 'Reach Planet 5.' },
  { id: 'reach-planet-12', name: 'THE LONG CAMPAIGN', desc: 'Reach Planet 12.' },
  { id: 'order-66',        name: 'ORDER 66',        desc: 'Reach the finale.' },
  { id: 'flawless-planet', name: 'NOT ON MY WATCH', desc: 'Clear a planet without losing a single clone.' },
  { id: 'no-deflect-wave', name: 'HOLD THE LINE',   desc: 'Clear a wave without deflecting a single bolt.' },
  { id: 'force-adept',     name: 'FORCE ADEPT',     desc: 'Use all four Force powers in one run.' },
  { id: 'slayer-battle',   name: 'CLANKER',         desc: 'Destroy your first battle droid.' },
  { id: 'slayer-super',    name: 'HEAVY METAL',     desc: 'Destroy your first super battle droid.' },
  { id: 'slayer-sniper',   name: 'COUNTER-SNIPED',  desc: 'Destroy your first sniper droid.' },
  { id: 'slayer-spider',   name: 'BUG STOMPER',     desc: 'Destroy your first spider droid.' },
];

export const BADGE_IDS = new Set(BADGES.map((b) => b.id));

export function badgeById(id) {
  for (const b of BADGES) if (b.id === id) return b;
  return null;
}

const POWER_KEYS = ['push', 'block', 'crush', 'heal'];

/**
 * Subscribe badge conditions to the event stream.
 * award(id) is provided by the facade: it dedupes against the profile and persists.
 * config.planets is used only to map DROID_KILLED typeKey → archetype bucket
 * (battle | super | sniper | spider) via the current planet's droid table.
 */
export function wireBadges({ emitter, config, award }) {
  let planetCfg = null;
  let powersUsed = new Set();

  emitter.on(EVT.RUN_STARTED, () => {
    powersUsed = new Set();
    planetCfg = null;
  });

  emitter.on(EVT.PLANET_STARTED, (p) => {
    const planetIndex = p ? p.planetIndex : 0;
    planetCfg = (config && config.planets && config.planets[planetIndex]) || null;
    const planet = planetIndex + 1; // 1-based
    if (planet >= 3) award('reach-planet-3');
    if (planet >= 5) award('reach-planet-5');
    if (planet >= 12) award('reach-planet-12');
  });

  emitter.on(EVT.DROID_KILLED, (p) => {
    if (!p) return;
    if (p.byDeflect) award('first-blood');
    const def = planetCfg && planetCfg.droids && planetCfg.droids[p.typeKey];
    if (def && def.archetype) award('slayer-' + def.archetype); // ids outside the catalog are ignored by award()
  });

  emitter.on(EVT.WAVE_CLEARED, (p) => {
    if (p && p.deflects === 0) award('no-deflect-wave');
  });

  emitter.on(EVT.PLANET_CLEARED, (p) => {
    if (p && p.flawless) award('flawless-planet');
  });

  emitter.on(EVT.POWER_USED, (p) => {
    if (!p || !POWER_KEYS.includes(p.power)) return;
    powersUsed.add(p.power);
    if (powersUsed.size >= POWER_KEYS.length) award('force-adept');
  });

  emitter.on(EVT.RUN_ENDED, (p) => {
    award('first-run');
    if (p && p.cause === 'finale') award('order-66');
  });
}
