// Transport facade — one call site, two sinks: Datadog RUM (./rum.js) and Google Analytics
// (./ga.js). Everything that reports an event imports from HERE, not from a sink, so adding
// or removing a backend never touches gameplay/UI code.
//
// Both sinks no-op when their script is absent (Node, tests, ad blockers) and both are
// independently gated by config (globals.rum.enabled / globals.ga.enabled), so a failure or
// a disabled backend on one side never affects the other.

import { initRum, track as rumTrack, trackError as rumTrackError,
         setContext as rumSetContext, setContextProperty as rumSetContextProperty } from './rum.js';
import { initGa, gaTrack, gaTrackError, gaSetContext, gaSetContextProperty } from './ga.js';

/** Boot both analytics backends. Returns which ones actually started. */
export function initTransports({ config } = {}) {
  return { rum: initRum({ config }), ga: initGa({ config }) };
}

/** Custom event. `name` must come from src/telemetry/events.js (TE.*), never a raw string. */
export function track(name, attrs) {
  rumTrack(name, attrs);
  gaTrack(name, attrs);
}

export function trackError(err, attrs) {
  rumTrackError(err, attrs);
  gaTrackError(err, attrs);
}

/** Attributes attached to every subsequent event (see GLOBAL_CONTEXT in events.js). */
export function setContext(obj) {
  rumSetContext(obj);
  gaSetContext(obj);
}

export function setContextProperty(key, value) {
  rumSetContextProperty(key, value);
  gaSetContextProperty(key, value);
}

export { envOf } from './rum.js';
