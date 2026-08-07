// Loud config validation — PRD §10: "error loudly if a wave references a droid key
// not defined in that planet (catches typos)."

import { POWERUP_KEYS } from './powerups.js';

// The 4 gameplay archetypes (badge/tier buckets). Per-type ART is keyed by the type's
// own name in src/render/sprites.js, not by this field — archetype only drives the
// slayer-* badges (src/meta/badges.js) and the config-reference tier coloring.
const ARCHETYPE_KEYS = ['battle', 'super', 'sniper', 'spider'];

export function validatePlanets(planets) {
  const errors = [];
  if (!Array.isArray(planets) || planets.length === 0) {
    throw new Error('CONFIG: planets must be a non-empty array');
  }
  planets.forEach((p, i) => {
    const where = `planet ${i + 1} (${p?.id ?? '?'})`;
    if (!p.id || !p.name) errors.push(`${where}: missing id/name`);
    if (!Array.isArray(p.waves) || p.waves.length !== 10) {
      errors.push(`${where}: must have exactly 10 waves, has ${p.waves?.length ?? 0}`);
    }
    if (!(p.deflectAccuracy > 0 && p.deflectAccuracy < 1)) {
      errors.push(`${where}: deflectAccuracy must be in (0,1), never 1.0 — got ${p.deflectAccuracy}`);
    }
    if (!(p.deflectMultiplier >= 1)) {
      errors.push(`${where}: deflectMultiplier must be >= 1 — got ${p.deflectMultiplier}`);
    }
    // Return-aim spread in degrees. The miss threshold is only ~1.4°–2.5° (see
    // deflectJitter in src/sim/combat.js), so anything past 10 makes deflection useless.
    if (!(typeof p.deflectJitterDeg === 'number' && p.deflectJitterDeg >= 0 && p.deflectJitterDeg <= 10)) {
      errors.push(`${where}: deflectJitterDeg must be a number in [0,10] — got ${p.deflectJitterDeg}`);
    }
    if (!p.palette?.bgGradient || !p.palette?.terrain || !p.palette?.accent) {
      errors.push(`${where}: incomplete palette`);
    }
    const droidKeys = Object.keys(p.droids ?? {});
    if (droidKeys.length === 0) errors.push(`${where}: no droid types defined`);
    droidKeys.forEach((k) => {
      const d = p.droids[k];
      if (!ARCHETYPE_KEYS.includes(d.archetype)) {
        errors.push(`${where}: droid '${k}' archetype '${d.archetype}' not one of ${ARCHETYPE_KEYS.join('|')}`);
      }
      // Bolt travel speed, field units/sec, per droid type (clones use globals.boltSpeed).
      // Band is a sanity rail: below ~50 bolts crawl, above ~400 they cross the field in
      // under a frame at 60fps and can never be met by the saber arc.
      if (!(typeof d.boltSpeed === 'number' && d.boltSpeed >= 50 && d.boltSpeed <= 400)) {
        errors.push(`${where}: droid '${k}' boltSpeed must be a number in [50,400] — got ${d.boltSpeed}`);
      }
    });
    (p.waves ?? []).forEach((wave, w) => {
      Object.entries(wave).forEach(([k, n]) => {
        if (!p.droids?.[k]) errors.push(`${where} wave ${w + 1}: references undefined droid '${k}'`);
        if (!Number.isInteger(n) || n < 1) errors.push(`${where} wave ${w + 1}: count for '${k}' must be a positive integer, got ${n}`);
      });
    });
    // Power-up drop script (optional). Every entry is deterministic: on the `kill`-th droid
    // death of `wave`, restricted to `droidType` when present. The wave-supply checks below
    // are the important ones — a drop the wave can never satisfy fails silently at runtime,
    // so it has to fail loudly here instead.
    if (p.powerups !== undefined) {
      if (!Array.isArray(p.powerups)) {
        errors.push(`${where}: powerups must be an array`);
      } else {
        const seen = new Set();
        p.powerups.forEach((e, k) => {
          const at = `${where} powerups[${k}]`;
          if (!POWERUP_KEYS.includes(e?.type)) {
            errors.push(`${at}: type '${e?.type}' not one of ${POWERUP_KEYS.join('|')}`);
          }
          const waveCount = Array.isArray(p.waves) ? p.waves.length : 0;
          if (!Number.isInteger(e?.wave) || e.wave < 1 || e.wave > waveCount) {
            errors.push(`${at}: wave must be an integer in [1,${waveCount}] — got ${e?.wave}`);
            return; // the supply checks below need a real wave
          }
          if (!Number.isInteger(e?.kill) || e.kill < 1) {
            errors.push(`${at}: kill must be a positive integer — got ${e?.kill}`);
            return;
          }
          const wave = p.waves[e.wave - 1] ?? {};
          if (e.droidType !== undefined) {
            if (!p.droids?.[e.droidType]) {
              errors.push(`${at}: references undefined droid '${e.droidType}'`);
            } else if (!(wave[e.droidType] >= e.kill)) {
              errors.push(`${at}: wave ${e.wave} has ${wave[e.droidType] ?? 0} of '${e.droidType}', so kill ${e.kill} can never fire`);
            }
          } else {
            const total = Object.values(wave).reduce((a, b) => a + b, 0);
            if (e.kill > total) {
              errors.push(`${at}: wave ${e.wave} has ${total} droids, so kill ${e.kill} can never fire`);
            }
          }
          const sig = `${e.wave}|${e.kill}|${e.droidType ?? '*'}`;
          if (seen.has(sig)) errors.push(`${at}: duplicate trigger (wave ${e.wave}, kill ${e.kill}, ${e.droidType ?? 'any'})`);
          seen.add(sig);
        });
      }
    }
    const cloneKeys = Object.keys(p.clones ?? {});
    if (cloneKeys.length === 0) errors.push(`${where}: no clone types defined`);
    Object.entries(p.roster ?? {}).forEach(([k, n]) => {
      if (!p.clones?.[k]) errors.push(`${where}: roster references undefined clone '${k}'`);
      if (!Number.isInteger(n) || n < 1) errors.push(`${where}: roster count for '${k}' must be a positive integer, got ${n}`);
    });
    if (Object.keys(p.roster ?? {}).length === 0) errors.push(`${where}: empty roster`);
  });
  if (errors.length) {
    throw new Error(`CONFIG VALIDATION FAILED (${errors.length}):\n- ${errors.join('\n- ')}`);
  }
  return true;
}
