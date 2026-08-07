// Power-use flow (PRD §7): tap power → (first-use helper) → aim selector on the live
// field → fixed center GO/CANCEL. Selector dragging itself is routed from main.js.

import { track } from '../telemetry/track.js';
import { TE } from '../telemetry/events.js';

export function createPowerFlow(game, { renderer, meta, screens, hud, config }) {
  const state = game.state;
  const globals = config.globals;
  const ctl = document.getElementById('power-ctl');

  function endCtl() {
    ctl.classList.remove('show');
    screens.stealthBreather(false);
  }

  // Enter power mode NOW so the sim (and breather timer) freeze immediately —
  // even while the first-use helper card is still up. Otherwise the field keeps
  // stepping behind the card and the wave can clear under it.
  function enter(power) {
    if (!game.beginPower(power)) return false;
    // beginPower recorded where we came from in state.prevMode
    if (state.prevMode === 'breather') screens.stealthBreather(true);
    return true;
  }

  function attempt(power) {
    if (state.mode !== 'play' && state.mode !== 'breather') return;
    if (!game.canUse(power)) {
      // The clearest friction signal in the game: wanted it, couldn't have it.
      const unlockAt = globals.tiers[power].unlockAt;
      const locked = state.highestForce < unlockAt;
      const cost = game.costOf(power);
      track(TE.POWER_REJECTED, {
        power,
        reason: locked ? 'locked' : 'insufficient_force',
        cost: Math.round(cost),
        shortBy: locked ? 0 : Math.max(0, Math.round(cost - state.force)),
      });
      hud.flash(power);
      return;
    }
    if (!enter(power)) return;                       // freeze the field first
    if (!meta.profile.helpersSeen[power]) {
      track(TE.HELPER_FIRST_SEEN, { power });
      screens.showHelper(power, () => { meta.markHelperSeen(power); ctl.classList.add('show'); });
    } else {
      ctl.classList.add('show');
    }
  }

  document.querySelectorAll('.pw').forEach((b) => {
    b.addEventListener('click', () => attempt(b.dataset.power));
  });
  document.querySelectorAll('.pw-help').forEach((b) => {
    b.addEventListener('click', (e) => { e.stopPropagation(); screens.showHelper(b.dataset.power, null); });
  });

  document.getElementById('power-go').addEventListener('click', () => { game.confirmPower(); endCtl(); });
  document.getElementById('power-cancel').addEventListener('click', () => { game.cancelPower(); endCtl(); });

  return {};
}
