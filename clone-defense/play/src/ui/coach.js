// New-player coaching (PRD §7) — one-time nudge toward the power buttons.
//
// The first-use helper card in ui/powerflow.js teaches a power only once the player taps it.
// A player who never notices the four buttons under the Force bar never sees any of it, so the
// whole Force economy goes undiscovered. This watches for the giveaway signal — Force piled up
// high enough that several powers are affordable, and not one has been used — then freezes the
// field, explains where the buttons are, and spotlights them.
//
// UI layer: reads sim state, never writes it. The freeze is boot's, handed in as setFrozen.

import { track } from '../telemetry/track.js';
import { TE } from '../telemetry/events.js';

export function createCoach(game, { emitter, meta, config, setFrozen, EVT }) {
  const state = game.state;
  const cfg = config.globals.coach.powerNudge;
  const powers = Object.keys(config.globals.tiers);

  const el = (id) => document.getElementById(id);
  const card = el('screen-coach');
  const okBtn = el('btn-coach-ok');
  const device = el('device');
  const pauseBtn = el('btn-pause');
  const powersEl = document.querySelector('.powers');

  let armed = 0;        // seconds the fire condition has held
  let showing = false;
  let dwell = 0;        // seconds the card has been up
  let hint = 0;         // seconds left on the post-dismiss button pulse
  let doneThisSession = false;

  /** Powers the player could cast right now — the same test the HUD's `ready` class uses. */
  function readyCount() {
    let n = 0;
    for (const p of powers) if (game.canUse(p)) n++;
    return n;
  }

  function eligible() {
    if (!cfg.enabled || showing || doneThisSession) return false;
    if (meta.profile.coachSeen.powerNudge) return false;
    if (state.runStats.powersUsed > 0) return false;
    // 'play' only: skips power aiming, breathers, Order 66, game over — and every screen overlay.
    return state.mode === 'play';
  }

  function open() {
    showing = true;
    dwell = 0;
    armed = 0;
    setFrozen(true);
    card.classList.add('show');
    device.classList.add('coaching');
    pauseBtn.hidden = true;   // sole writer of the freeze while the card is up
    track(TE.COACH_NUDGE_SHOWN, { readyCount: readyCount(), armDelaySec: cfg.armDelaySec });
  }

  function dismiss(method, power) {
    if (!showing) return;
    showing = false;
    doneThisSession = true;
    meta.markCoachSeen('powerNudge');
    card.classList.remove('show');
    device.classList.remove('coaching');
    setFrozen(false);
    pauseBtn.hidden = false;
    hint = cfg.highlightSec;  // keep the buttons pulsing for a beat once the field is live again
    track(TE.COACH_NUDGE_DISMISSED, {
      method,
      power: power || 'none',
      dwellSec: Math.round(dwell * 10) / 10,
    });
  }

  okBtn.addEventListener('click', () => dismiss('ok', null));

  // Capture phase so the card is gone (and the field unfrozen) before powerflow's own click
  // handler runs attempt() → beginPower → the first-use helper card.
  if (powersEl) {
    powersEl.addEventListener('click', (e) => {
      if (!showing) return;
      const btn = e.target && e.target.closest ? e.target.closest('.pw') : null;
      dismiss('power_tap', btn && btn.dataset ? btn.dataset.power : null);
    }, true);
  }

  // A run can end with the card up (Order 66, or the last clone falling on the frozen frame's
  // heels) — never leave the sim frozen behind a dead run.
  if (emitter && EVT) {
    emitter.on(EVT.RUN_ENDED, () => { dismiss('run_ended', null); armed = 0; hint = 0; });
    emitter.on(EVT.ORDER66_STARTED, () => { dismiss('order66', null); armed = 0; });
  }

  /** Frame-driven so the arming window and the pulse both stop dead while the game is paused. */
  function tick(dt) {
    if (hint > 0) {
      hint -= dt;
      if (hint <= 0) { hint = 0; device.classList.remove('coach-hint'); }
      else device.classList.add('coach-hint');
    }
    if (showing) { dwell += dt; return; }
    if (!eligible()) { armed = 0; return; }
    if (readyCount() < cfg.readyCount) { armed = 0; return; }
    armed += dt;
    if (armed >= cfg.armDelaySec) open();
  }

  return { tick, isShowing: () => showing, dismiss };
}
