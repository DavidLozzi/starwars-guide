// Persistence — the thin interface (CONTRACTS.md "Meta", PRD §14).
// localStorage key 'jedi-defense.v1', versioned JSON; corrupt/missing → fresh default.
// Headless-safe: when localStorage is undefined (Node), falls back to an in-memory store.
// No storage is touched at import time.

import { makeRun, updateBest, appendRun } from './records.js';
import { seal } from '../ui/env.js';

export const STORAGE_KEY = 'jedi-defense.v1';
export const PROFILE_VERSION = 1;
// Separate key so wiping game progress (resetAll) never forks device identity in Datadog.
export const PLAYER_ID_KEY = 'jedi-defense.pid.v1';

/** Anonymous per-device id. crypto.randomUUID when available, else a plain fallback. */
function newPlayerId() {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}

/** Fresh default profile — exact contract shape. best is zeroed (= "no record yet"). */
export function freshProfile() {
  return {
    version: PROFILE_VERSION,
    best: { planet: 0, wave: 0, score: 0 },            // 1-based for display; 0 = none
    runs: [],                                          // { endedAt, planet, wave, score, durationSec, cause }
    skins: { unlocked: ['default'], active: 'default' },
    badges: {},                                        // badgeId → isoDateString
    helpersSeen: {},                                   // power → true
    powerupsSeen: {},                                  // power-up type → true (ui/pickups.js)
    coachSeen: {},                                     // nudge id → true (ui/coach.js)
  };
}

/** Minimal in-memory localStorage stand-in (Node / private-mode fallback). */
export function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
}

function defaultStorage() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      // Probe: some private modes expose localStorage but throw on write.
      const probe = STORAGE_KEY + '.probe';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    }
  } catch (_) { /* fall through to memory */ }
  return memoryStorage();
}

/** Re-shape parsed JSON defensively; any structural surprise → fresh field. */
function normalize(parsed) {
  const fresh = freshProfile();
  if (!parsed || typeof parsed !== 'object' || parsed.version !== PROFILE_VERSION) return null;
  const p = fresh;
  const b = parsed.best;
  if (b && typeof b === 'object') {
    p.best.planet = Number(b.planet) || 0;
    p.best.wave = Number(b.wave) || 0;
    p.best.score = Number(b.score) || 0;
  }
  if (Array.isArray(parsed.runs)) {
    for (const r of parsed.runs) {
      if (r && typeof r === 'object') p.runs.push(makeRun(r));
    }
    if (p.runs.length > 50) p.runs.splice(0, p.runs.length - 50);
  }
  const s = parsed.skins;
  if (s && typeof s === 'object') {
    if (Array.isArray(s.unlocked)) {
      for (const id of s.unlocked) {
        if (typeof id === 'string' && !p.skins.unlocked.includes(id)) p.skins.unlocked.push(id);
      }
    }
    if (typeof s.active === 'string' && p.skins.unlocked.includes(s.active)) p.skins.active = s.active;
  }
  if (parsed.badges && typeof parsed.badges === 'object' && !Array.isArray(parsed.badges)) {
    for (const k of Object.keys(parsed.badges)) {
      if (typeof parsed.badges[k] === 'string') p.badges[k] = parsed.badges[k];
    }
  }
  if (parsed.helpersSeen && typeof parsed.helpersSeen === 'object' && !Array.isArray(parsed.helpersSeen)) {
    for (const k of Object.keys(parsed.helpersSeen)) {
      if (parsed.helpersSeen[k]) p.helpersSeen[k] = true;
    }
  }
  if (parsed.powerupsSeen && typeof parsed.powerupsSeen === 'object' && !Array.isArray(parsed.powerupsSeen)) {
    for (const k of Object.keys(parsed.powerupsSeen)) {
      if (parsed.powerupsSeen[k]) p.powerupsSeen[k] = true;
    }
  }
  if (parsed.coachSeen && typeof parsed.coachSeen === 'object' && !Array.isArray(parsed.coachSeen)) {
    for (const k of Object.keys(parsed.coachSeen)) {
      if (parsed.coachSeen[k]) p.coachSeen[k] = true;
    }
  }
  return p;
}

/**
 * Persistence instance bound to a storage. `createMeta` builds one; the module-level
 * exports below delegate to a default instance (real localStorage, or memory in Node).
 * loadProfile() caches: the returned profile is a live ref, mutated in place by the
 * mutators, and re-serialized on every change.
 */
export function createPersistence(storage) {
  const store = storage || defaultStorage();
  let profile = null;
  let pid = null;

  /** Persistent device id, own key, unaffected by resetAll(). */
  function playerId() {
    if (pid) return pid;
    try {
      const raw = store.getItem(PLAYER_ID_KEY);
      if (typeof raw === 'string' && raw.length >= 8 && raw.length <= 64) pid = raw;
    } catch (_) { /* fall through to mint */ }
    if (!pid) {
      pid = newPlayerId();
      try { store.setItem(PLAYER_ID_KEY, pid); } catch (_) { /* storage full/blocked */ }
    }
    return pid;
  }

  function loadProfile() {
    if (profile) return profile;
    let raw = null;
    try { raw = store.getItem(STORAGE_KEY); } catch (_) { raw = null; }
    if (raw != null) {
      try { profile = normalize(JSON.parse(raw)); } catch (_) { profile = null; }
    }
    if (!profile) profile = freshProfile();
    return profile;
  }

  let firstWrite = true;

  function saveProfile(p) {
    // First write of the session double-checks the host context (docs/HOST-LOCK.md).
    if (firstWrite) { firstWrite = false; seal(); }
    if (p) profile = p;
    const cur = loadProfile();
    try { store.setItem(STORAGE_KEY, JSON.stringify(cur)); } catch (_) { /* storage full/blocked: keep in memory */ }
    return cur;
  }

  /** Append run (cap 50), update best by planet → wave → score. Returns the stored run. */
  function recordRun(runShape) {
    const p = loadProfile();
    const run = makeRun(runShape);
    appendRun(p.runs, run);
    updateBest(p.best, run);
    saveProfile(p);
    return run;
  }

  function unlockSkin(id) {
    const p = loadProfile();
    if (p.skins.unlocked.includes(id)) return false;
    p.skins.unlocked.push(id);
    saveProfile(p);
    return true;
  }

  function setActiveSkin(id) {
    const p = loadProfile();
    if (!p.skins.unlocked.includes(id)) return false;
    if (p.skins.active !== id) {
      p.skins.active = id;
      saveProfile(p);
    }
    return true;
  }

  function awardBadge(id) {
    const p = loadProfile();
    if (p.badges[id]) return false;
    p.badges[id] = new Date().toISOString();
    saveProfile(p);
    return true;
  }

  function markHelperSeen(power) {
    const p = loadProfile();
    if (p.helpersSeen[power]) return false;
    p.helpersSeen[power] = true;
    saveProfile(p);
    return true;
  }

  /** First-catch power-up explainers (ui/pickups.js). Same shape as markHelperSeen. */
  function markPowerupSeen(type) {
    const p = loadProfile();
    if (p.powerupsSeen[type]) return false;
    p.powerupsSeen[type] = true;
    saveProfile(p);
    return true;
  }

  /** One-time coaching nudges (ui/coach.js). Same shape as markHelperSeen. */
  function markCoachSeen(id) {
    const p = loadProfile();
    if (p.coachSeen[id]) return false;
    p.coachSeen[id] = true;
    saveProfile(p);
    return true;
  }

  /** Clear the whole tutorial surface — first-use power cards and coaching nudges — so it
   *  shows again (mutates the live profile ref). */
  function resetHelpers() {
    const p = loadProfile();
    p.helpersSeen = {};
    p.powerupsSeen = {};
    p.coachSeen = {};
    saveProfile(p);
    return true;
  }

  /** Wipe the entire saved profile. Next loadProfile() returns a fresh default.
   *  Callers typically reload the page afterwards for a fully clean re-init. */
  function resetAll() {
    try { store.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
    profile = null;
    return true;
  }

  return { loadProfile, saveProfile, recordRun, unlockSkin, setActiveSkin, awardBadge, markHelperSeen, markPowerupSeen, markCoachSeen, resetHelpers, resetAll, playerId };
}

// ---- Contract-named module-level functions (default instance, lazily created) ----
let _default = null;
function inst() { return _default || (_default = createPersistence()); }

export const loadProfile = () => inst().loadProfile();
export const saveProfile = (p) => inst().saveProfile(p);
export const recordRun = (runShape) => inst().recordRun(runShape);
export const unlockSkin = (id) => inst().unlockSkin(id);
export const setActiveSkin = (id) => inst().setActiveSkin(id);
export const awardBadge = (id) => inst().awardBadge(id);
export const markHelperSeen = (power) => inst().markHelperSeen(power);
export const markPowerupSeen = (type) => inst().markPowerupSeen(type);
export const markCoachSeen = (id) => inst().markCoachSeen(id);
export const resetHelpers = () => inst().resetHelpers();
export const resetAll = () => inst().resetAll();
export const playerId = () => inst().playerId();
