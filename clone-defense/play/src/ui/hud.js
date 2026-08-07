// HUD strip — score, planet·wave, clones, segmented force bar + tier ticks, power buttons.
// Reads sim state each frame (CONTRACTS "UI"); owns no game logic. PRD §2, §18.

import { EVT } from '../engine/events.js';
import { POWERUP_LABELS } from '../config/powerups.js';

const FORCE_CELLS = 20;
const POWERS = ['push', 'block', 'crush', 'heal'];
// Buff chips: [state.buffs key, the power-up whose label names it]. Instant power-ups
// (force fill, heal-all) have no chip — there is nothing left running to count down.
const BUFF_CHIPS = [
  ['empowerT', 'empower'],
  ['allyT', 'secondYoda'],
  ['badBatchT', 'badBatch'],
];

export function createHUD(game, { emitter, config }) {
  const globals = config.globals;
  const planets = config.planets;
  const state = game.state;

  const elScore = document.getElementById('hud-score');
  const elPlanet = document.getElementById('hud-planet');
  const elClones = document.getElementById('hud-clones');
  const barEl = document.getElementById('force-bar');
  const ticksEl = document.getElementById('force-ticks');

  // build force cells + tier threshold ticks once
  const cells = [];
  for (let i = 0; i < FORCE_CELLS; i++) {
    const c = document.createElement('div');
    c.className = 'force-cell';
    barEl.appendChild(c);
    cells.push(c);
  }
  for (const p of POWERS) {
    const t = document.createElement('div');
    t.className = 'force-tick';
    t.style.left = (globals.tiers[p].unlockAt / globals.forceBar.capacity * 100) + '%';
    ticksEl.appendChild(t);
  }

  // one chip per timed buff, built once and toggled by class (no per-frame DOM churn)
  const buffsEl = document.getElementById('buffs');
  const buffChips = [];
  for (const [key, type] of BUFF_CHIPS) {
    const el = document.createElement('div');
    el.className = 'buff';
    if (buffsEl) buffsEl.appendChild(el);
    buffChips.push({ key, label: POWERUP_LABELS[type] || type, el, shown: false, secs: -1 });
  }

  const pwButtons = {};
  const pwCosts = {};
  for (const p of POWERS) {
    pwButtons[p] = document.querySelector(`.pw[data-power="${p}"]`);
    pwCosts[p] = document.getElementById('pw-cost-' + p);
  }

  // brief amber flash when a power tap is rejected (unaffordable/locked)
  function flash(power) {
    const b = pwButtons[power];
    if (!b) return;
    b.classList.remove('flash');
    void b.offsetWidth; // restart animation
    b.classList.add('flash');
  }

  function update() {
    elScore.textContent = Math.floor(state.score);

    // Bad Batch are on loan — they never count toward the life pool the player is defending.
    let alive = 0;
    let total = 0;
    for (let i = 0; i < state.clones.length; i++) {
      const c = state.clones[i];
      if (c.temp) continue;
      total++;
      if (c.alive) alive++;
    }
    elClones.textContent = total ? `${alive}/${total}` : '—';

    const planet = planets[state.planetIndex];
    if (state.mode === 'title') {
      elPlanet.textContent = 'STANDBY';
      elPlanet.style.color = '';
    } else if (planet) {
      // waveClear() increments waveIndex before the breather, so during the between-wave beat
      // waveIndex already points at the next wave — show the wave just cleared, not the next one.
      // Order 66 fires after the same increment, so it reads the cleared wave too.
      const between = state.mode === 'breather' || state.mode === 'order66'
        || (state.mode === 'power' && state.prevMode === 'breather');
      const waveNum = between ? state.waveIndex : state.waveIndex + 1;
      elPlanet.textContent = `${planet.name} · WAVE ${waveNum}`;
      elPlanet.style.color = planet.palette.accent;
    }

    const frac = state.force / globals.forceBar.capacity;
    const lit = Math.round(frac * FORCE_CELLS);
    for (let i = 0; i < FORCE_CELLS; i++) cells[i].classList.toggle('on', i < lit);
    barEl.classList.toggle('charging', state._forceRampRemain > 0);

    // buff chips — only touch the DOM when the visible second actually changes
    const buffs = state.buffs;
    for (let i = 0; i < buffChips.length; i++) {
      const chip = buffChips[i];
      const t = buffs ? buffs[chip.key] : 0;
      const on = t > 0;
      if (on !== chip.shown) { chip.el.classList.toggle('on', on); chip.shown = on; }
      if (!on) { chip.secs = -1; continue; }
      const secs = Math.ceil(t);
      if (secs !== chip.secs) { chip.el.textContent = `${chip.label} ${secs}s`; chip.secs = secs; }
    }

    const powersLocked = state.mode === 'order66'; // no Force left to spend once the clones turn
    for (const p of POWERS) {
      const b = pwButtons[p];
      const unlocked = state.highestForce >= globals.tiers[p].unlockAt;
      b.classList.toggle('unlocked', unlocked);
      b.classList.toggle('ready', !powersLocked && game.canUse(p));
      pwCosts[p].textContent = unlocked ? Math.round(game.costOf(p)) : Math.round(globals.tiers[p].unlockAt);
    }
  }

  emitter.on(EVT.RUN_STARTED, update);
  return { update, flash };
}
