// First-catch power-up explainer (PRD §19). The sim applies a power-up the instant it is
// caught; this only pauses the field afterwards to say what just happened, once per type ever.
//
// Same one-shot pattern as the per-power helper cards in ui/powerflow.js — the difference is
// the trigger: a power is TAPPED (so the card can gate it), a power-up is CAUGHT (so the card
// can only explain it after the fact).

import { EVT } from '../engine/events.js';
import { track } from '../telemetry/track.js';
import { TE } from '../telemetry/events.js';

export function createPickups(game, { emitter, meta, screens, setFrozen }) {
  // Guards a re-entrant catch: the ally can grab a second drop on the same frame.
  let showing = false;

  emitter.on(EVT.POWERUP_COLLECTED, ({ type }) => {
    if (showing) return;
    if (meta.profile.powerupsSeen[type]) return;
    showing = true;
    track(TE.POWERUP_HELP_SEEN, { type });
    setFrozen(true);
    screens.showPowerupHelp(type, () => {
      meta.markPowerupSeen(type);
      setFrozen(false);
      showing = false;
    });
  });

  // A run that ends (or turns into Order 66) while the card is up must not leave the sim
  // frozen — the card's own OK is the only other thing that clears it.
  const release = () => { if (showing) { showing = false; setFrozen(false); } };
  emitter.on(EVT.RUN_ENDED, release);
  emitter.on(EVT.ORDER66_STARTED, release);

  return { isShowing: () => showing };
}
