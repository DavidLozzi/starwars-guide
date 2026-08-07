// Order 66 finale — the map overlay while the clones turn, then the full-bleed
// red screen once the jedi falls (PRD §17, §18).

import { EVT } from '../engine/events.js';
import { track } from '../telemetry/track.js';
import { TE } from '../telemetry/events.js';

export function createFinale(game, { emitter, meta, config }) {
  const device = document.getElementById('device');
  const finale = document.getElementById('finale');
  const stats = document.getElementById('finale-stats');
  const overlay = document.getElementById('o66-overlay');
  const shareBtn = document.getElementById('btn-finale-share');
  const planets = config.planets;

  function hide() {
    finale.classList.remove('show');
    overlay.classList.remove('show');
    device.classList.remove('framefall');
  }

  // ORDER 66 lands over the still-live map; the console frame stays up until the finale screen.
  emitter.on(EVT.ORDER66_STARTED, () => overlay.classList.add('show'));

  emitter.on(EVT.FINALE_REACHED, (p) => {
    overlay.classList.remove('show');
    stats.textContent = `SCORE ${p.score}`;
    device.classList.add('framefall');
    finale.classList.add('show');
  });

  // Fires immediately after FINALE_REACHED and carries what the share card needs.
  emitter.on(EVT.RUN_ENDED, (p) => {
    if (p.cause !== 'finale') return;
    const planet = planets[p.planetIndex];
    if (!meta.shareCard || !planet) { shareBtn.hidden = true; return; }
    shareBtn.hidden = false;
    shareBtn.onclick = () => {
      const out = meta.shareCard(
        {
          planet: p.planetIndex + 1,
          // waveIndex was already incremented past the last wave by waveClear()
          wave: Math.min(p.waveIndex + 1, planet.waves.length),
          score: p.score,
          cause: 'finale',
          planetName: planet.name,
        },
        planet,
      );
      // The click itself is logged by the telemetry delegate; this reports the outcome.
      if (out && typeof out.then === 'function') {
        out.then(
          (outcome) => track(TE.SHARE_RESULT, { surface: 'finale', outcome: outcome || 'unknown' }),
          (err) => track(TE.SHARE_RESULT, { surface: 'finale', outcome: 'failed', error: String(err) }),
        );
      }
    };
  });

  emitter.on(EVT.RUN_STARTED, hide);

  document.getElementById('btn-finale-again').addEventListener('click', () => {
    hide();
    game.startRun();
  });

  return {};
}
