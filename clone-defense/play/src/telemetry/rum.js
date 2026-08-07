// Datadog RUM transport. The agent is loaded by the CDN snippet in index.html, which
// defines the window.DD_RUM queue stub — so onReady() is safe to call before the agent
// lands. Init options come from globals.rum; nothing here is hardcoded except the shape.
//
// Same discipline as src/ui/ads.js: every window/document access is inside a function so
// this module imports clean in Node, an `enabled` config gate, a once-only latch, and a
// try/catch around every third-party call so a blocked agent never breaks boot.

import { APP_VERSION } from '../version.js';

let initialised = false;
let echo = false; // ?debug → mirror every tracked event to the console

/** The queue stub, or null when the snippet is absent (Node, tests, blocked by an extension). */
function dd() {
  return typeof window !== 'undefined' && window.DD_RUM ? window.DD_RUM : null;
}

/** Run `fn` against the agent once it's ready, swallowing any third-party failure. */
function whenReady(fn) {
  const rum = dd();
  if (!rum) return;
  try { rum.onReady(() => { try { fn(rum); } catch (err) { warn(err); } }); }
  catch (err) { warn(err); }
}

function warn(err) {
  if (echo) console.warn('[rum] call failed', err);
}

/** 'dev' on the hosts listed in globals.rum.devHosts, 'prod' everywhere else. */
export function envOf(rumCfg) {
  if (typeof location === 'undefined') return 'dev';
  const hosts = rumCfg.devHosts || [];
  return hosts.includes(location.hostname) ? 'dev' : 'prod';
}

export function initRum({ config } = {}) {
  if (initialised) return false;
  const cfg = config && config.globals && config.globals.rum;
  if (!cfg || !cfg.enabled) return false;
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  echo = !!(config && config.debug);

  const rum = dd();
  if (!rum) {
    if (echo) console.warn('[rum] DD_RUM snippet missing — telemetry disabled for this session');
    return false;
  }

  const env = envOf(cfg);
  whenReady((r) => {
    r.init({
      applicationId: cfg.applicationId,
      clientToken: cfg.clientToken,
      site: cfg.site,
      service: cfg.service,
      env,
      version: APP_VERSION,
      sessionSampleRate: cfg.sessionSampleRate,
      sessionReplaySampleRate: cfg.sessionReplaySampleRate,
      trackResources: cfg.trackResources,
      trackUserInteractions: cfg.trackUserInteractions,
      trackLongTasks: cfg.trackLongTasks,
    });
    if (cfg.sessionReplaySampleRate > 0) r.startSessionReplayRecording();
  });

  initialised = true;
  if (echo) console.log(`[rum] init service=${cfg.service} env=${env} version=${APP_VERSION}`);
  return true;
}

/** Custom action. `name` must come from src/telemetry/events.js (TE.*), never a raw string. */
export function track(name, attrs) {
  if (echo) console.log('[rum]', name, attrs || {});
  whenReady((r) => r.addAction(name, attrs || {}));
}

export function trackError(err, attrs) {
  if (echo) console.warn('[rum] error', err, attrs || {});
  whenReady((r) => r.addError(err, attrs || {}));
}

/** Attributes attached to every subsequent event (see GLOBAL_CONTEXT in events.js). */
export function setContext(obj) {
  whenReady((r) => r.setGlobalContext(obj));
}

export function setContextProperty(key, value) {
  whenReady((r) => r.setGlobalContextProperty(key, value));
}
