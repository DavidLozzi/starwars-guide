// Google Analytics 4 transport — the same property the hub (starwars.guide) reports to, so
// the game's traffic lands in one place with the rest of the brand. The gtag library is
// loaded by the CDN snippet in index.html; that snippet only defines the dataLayer/gtag
// stub, so the config-driven init() below is what actually starts a GA session.
//
// Same discipline as src/telemetry/rum.js and src/ui/ads.js: every window/document access is
// inside a function so this module imports clean in Node, an `enabled` config gate, a
// once-only latch, and a try/catch around every third-party call so a blocked script never
// breaks boot. Names come from src/telemetry/events.js (TE.*), never written inline.

import { APP_VERSION } from '../version.js';

let initialised = false;
let echo = false;      // ?debug → mirror every tracked event to the console
let sendEnabled = false; // false until init succeeds, or when the host is a dev host

// GA4 hard limits (https://support.google.com/analytics/answer/9267744).
const MAX_PARAMS = 25;
const MAX_NAME = 40;
const MAX_VALUE = 100;
const MAX_UP_NAME = 24;
const MAX_UP_VALUE = 36;

/** The gtag stub, or null when the snippet is absent (Node, tests, blocked by an extension). */
function gtag() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function' ? window.gtag : null;
}

function call(...args) {
  const g = gtag();
  if (!g) return;
  try { g(...args); }
  catch (err) { if (echo) console.warn('[ga] call failed', err); }
}

/** `game.wave_cleared` → `game_wave_cleared`; GA4 event names are [A-Za-z][A-Za-z0-9_]*. */
export function gaName(name) {
  return String(name).replace(/[^A-Za-z0-9_]/g, '_').replace(/^[^A-Za-z]+/, '').slice(0, MAX_NAME);
}

/** `planetName` → `planet_name` — GA4 accepts camelCase but every report reads snake_case. */
function gaKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .toLowerCase()
    .slice(0, MAX_NAME);
}

/**
 * Flatten an attribute bag into GA4-legal params: snake_case keys, scalar values only,
 * strings clamped to 100 chars, nulls dropped, capped at 25 entries.
 */
export function gaParams(attrs, limit = MAX_PARAMS) {
  const out = {};
  if (!attrs) return out;
  let n = 0;
  for (const k in attrs) {
    if (n >= limit) break;
    const v = attrs[k];
    if (v === null || v === undefined) continue;
    const t = typeof v;
    if (t === 'number') { if (!Number.isFinite(v)) continue; out[gaKey(k)] = v; }
    else if (t === 'boolean') out[gaKey(k)] = v;
    else if (t === 'string') out[gaKey(k)] = v.slice(0, MAX_VALUE);
    else continue;
    n++;
  }
  return out;
}

/** Global context becomes user properties (tighter limits than event params). */
function gaUserProps(obj) {
  const out = {};
  if (!obj) return out;
  for (const k in obj) {
    const v = obj[k];
    if (v === null || v === undefined || typeof v === 'object') continue;
    out[gaKey(k).slice(0, MAX_UP_NAME)] = String(v).slice(0, MAX_UP_VALUE);
  }
  return out;
}

/** 'dev' on the hosts listed in globals.ga.devHosts, 'prod' everywhere else. */
export function gaEnvOf(cfg) {
  if (typeof location === 'undefined') return 'dev';
  const hosts = (cfg && cfg.devHosts) || [];
  return hosts.includes(location.hostname) ? 'dev' : 'prod';
}

export function initGa({ config } = {}) {
  if (initialised) return false;
  const cfg = config && config.globals && config.globals.ga;
  if (!cfg || !cfg.enabled) return false;
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  echo = !!(config && config.debug);

  const g = gtag();
  if (!g) {
    if (echo) console.warn('[ga] gtag snippet missing — Google Analytics disabled for this session');
    return false;
  }

  const env = gaEnvOf(cfg);
  if (env === 'dev' && !cfg.sendFromDevHosts) {
    initialised = true;
    if (echo) console.log('[ga] dev host — not sending (globals.ga.sendFromDevHosts is false)');
    return false;
  }

  call('js', new Date());
  call('config', cfg.measurementId, {
    app_version: APP_VERSION,
    debug_mode: !!cfg.debugMode,
    send_page_view: cfg.sendPageView !== false,
  });

  initialised = true;
  sendEnabled = true;
  if (echo) console.log(`[ga] init id=${cfg.measurementId} env=${env} version=${APP_VERSION}`);
  return true;
}

/** Custom event. `name` must come from src/telemetry/events.js (TE.*), never a raw string. */
export function gaTrack(name, attrs) {
  if (!sendEnabled) return;
  call('event', gaName(name), gaParams(attrs));
}

/** GA4's recommended shape for errors. */
export function gaTrackError(err, attrs) {
  if (!sendEnabled) return;
  const description = err && err.message ? err.message : String(err);
  call('event', 'exception', gaParams({ ...(attrs || {}), description, fatal: false }));
}

/** Global context → user properties, attached to every subsequent event. */
export function gaSetContext(obj) {
  if (!sendEnabled) return;
  call('set', 'user_properties', gaUserProps(obj));
}

export function gaSetContextProperty(key, value) {
  gaSetContext({ [key]: value });
}
