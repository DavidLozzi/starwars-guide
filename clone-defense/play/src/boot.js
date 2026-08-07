// Boot — wires config → sim → render → ui → meta and runs the rAF loop.
// CONTRACTS "Boot". No build step: native ES modules, relative paths.

import { GLOBALS, DEBUG_OVERRIDES } from './config/globals.js';
import { PLANETS } from './config/planets/index.js';
import { FIELD_H } from './engine/field.js';
import { createEmitter, EVT } from './engine/events.js';
import { createLoop } from './engine/loop.js';
import { createGame } from './sim/index.js';
import { createRenderer } from './render/renderer.js';
import { createMeta } from './meta/index.js';
import { createHUD } from './ui/hud.js';
import { createScreens } from './ui/screens.js';
import { createPowerFlow } from './ui/powerflow.js';
import { createCoach } from './ui/coach.js';
import { createPickups } from './ui/pickups.js';
import { createFinale } from './ui/finale.js';
import { initAds } from './ui/ads.js';
import { initTransports, trackError } from './telemetry/track.js';
import { initTelemetry } from './telemetry/index.js';

// ?planet=N&wave=M (1-based, QA jump) → skip straight to that planet/wave on deploy.
function parseJump() {
  if (typeof location === 'undefined') return { jumpPlanet: null, jumpWave: null };
  const params = new URLSearchParams(location.search);
  const pRaw = parseInt(params.get('planet'), 10);
  const wRaw = parseInt(params.get('wave'), 10);
  const jumpPlanet = Number.isFinite(pRaw)
    ? Math.min(Math.max(pRaw - 1, 0), PLANETS.length - 1) : null;
  const waveCount = jumpPlanet != null ? PLANETS[jumpPlanet].waves.length : 1;
  const jumpWave = Number.isFinite(wRaw)
    ? Math.min(Math.max(wRaw - 1, 0), waveCount - 1) : null;
  return { jumpPlanet, jumpWave };
}

// ?debug → tiny waves + fast earn for QA smoke runs (CONTRACTS "Boot").
function buildConfig() {
  const debug = typeof location !== 'undefined' && /(\?|&)debug\b/.test(location.search);
  const { jumpPlanet, jumpWave } = parseJump();
  if (!debug) return { globals: GLOBALS, planets: PLANETS, debug: false, jumpPlanet, jumpWave };
  const g = structuredClone(GLOBALS);
  g.breatherSec = DEBUG_OVERRIDES.breatherSec;
  g.debugWaveSize = DEBUG_OVERRIDES.debugWaveSize;
  Object.assign(g.earn, DEBUG_OVERRIDES.earn);
  return { globals: g, planets: PLANETS, debug: true, jumpPlanet, jumpWave };
}

const config = buildConfig();
const emitter = createEmitter();
const game = createGame(config, emitter);
const state = game.state;

const canvas = document.getElementById('field-canvas');
const renderer = createRenderer(canvas, { globals: config.globals });
const meta = createMeta({ emitter, config });

// Telemetry before the UI factories so no early event is missed (CONTRACTS "Boot").
initTransports({ config });
initTelemetry(game, { emitter, meta, config });

const hud = createHUD(game, { emitter, config });
const screens = createScreens(game, { emitter, meta, config });
createPowerFlow(game, { renderer, meta, screens, hud, config });
createFinale(game, { emitter, meta, config });
initAds({ config, meta });   // bottom banner over the HUD; visible only on non-gameplay screens

// swap the pre-rendered planet layer whenever a planet begins
emitter.on(EVT.PLANET_STARTED, (p) => renderer.setPlanet(config.planets[p.planetIndex]));

// ---- pointer input on the field (pointer events only, CONTRACTS "UI") ----
const fieldwrap = document.getElementById('fieldwrap');
const touchOffsetY = config.globals.jedi.touchOffsetY; // field units
let dragging = false;
let paused = false;

function routePointer(e) {
  if (e.target && e.target.closest('#power-ctl')) return; // GO/CANCEL never move anything
  const rect = fieldwrap.getBoundingClientRect();
  const f = renderer.pxToField(e.clientX - rect.left, e.clientY - rect.top);
  if (state.mode === 'play' || state.mode === 'order66') {
    const oy = e.pointerType === 'touch' ? touchOffsetY : 0;
    game.setJediTarget(f.x, Math.max(0, f.y - oy));
  } else if (state.mode === 'power') {
    game.moveSelector(f.x, f.y);
  }
}
fieldwrap.addEventListener('pointerdown', (e) => {
  if (paused) return;                                     // frozen: ignore field input
  if (e.target && e.target.closest('#power-ctl')) return;
  dragging = true;
  routePointer(e);
});
fieldwrap.addEventListener('pointermove', (e) => { if (dragging) routePointer(e); });
window.addEventListener('pointerup', () => { dragging = false; });

// ---- crash reporting (RUM Error Tracking, not just an action) ----
window.addEventListener('error', (e) => trackError(e.error || e.message, { source: 'window' }));
window.addEventListener('unhandledrejection', (e) => trackError(e.reason, { source: 'promise' }));

// ---- resize ----
function onResize() { renderer.resize(); }
window.addEventListener('resize', onResize);
onResize();

// ---- pause (header button): freezes the sim + breather; tap the overlay to resume ----
const device = document.getElementById('device');
const pauseBtn = document.getElementById('btn-pause');
const pauseScreen = document.getElementById('screen-pause');
/** Freeze the sim with no chrome of its own — ui/coach.js borrows this for its nudge card,
 *  which must NOT dim the power buttons the way `.device.paused` does. */
function setFrozen(p) { paused = p; }
function setPaused(p) {
  setFrozen(p);
  device.classList.toggle('paused', p);
  pauseScreen.classList.toggle('show', p);
  pauseBtn.textContent = p ? 'RESUME' : '❚❚ PAUSE';
}
pauseBtn.addEventListener('click', () => setPaused(!paused));
pauseScreen.addEventListener('click', () => setPaused(false));
// Only offer pause during an active run.
emitter.on(EVT.RUN_STARTED, () => { setPaused(false); pauseBtn.hidden = false; });
emitter.on(EVT.RUN_ENDED, () => { setPaused(false); pauseBtn.hidden = true; });
// Order 66 is a cutscene the player can still move through — but not pause.
emitter.on(EVT.ORDER66_STARTED, () => { setPaused(false); pauseBtn.hidden = true; });

// One-time new-player nudge toward the power buttons; owns its own freeze via setFrozen.
const coach = createCoach(game, { emitter, meta, config, setFrozen, EVT });
// First-catch power-up explainers; borrows the same freeze (PRD §19).
createPickups(game, { emitter, meta, screens, setFrozen });

// ---- main loop ----
const loop = createLoop((dt) => {
  if (!paused) {
    game.step(dt);
    game.tickBreather(dt);
  }
  coach.tick(dt);   // after the step so the check sees this frame's Force
  renderer.draw(state, meta.activeSkin());
  hud.update();
  screens.update();
});
loop.start();

if (config.debug) {
  // debug-only test/QA handle (never present in a normal build)
  window.__jd = { game, meta, renderer, config, coach };
  console.log('[jedi-defense] debug mode: tiny waves, fast force');
}
if (config.jumpPlanet != null || config.jumpWave != null) {
  console.log(`[jedi-defense] jump: planet ${(config.jumpPlanet ?? 0) + 1}, wave ${(config.jumpWave ?? 0) + 1}`);
}
