// Screen overlays — title, breather, game-over, collections + helper gate.
// Reacts to EVT + sim state (CONTRACTS "UI"). PRD §8, §11, §17.

import { EVT } from '../engine/events.js';
import { bakeJedi } from '../render/sprites.js';
import { APP_VERSION } from '../version.js';
import { track } from '../telemetry/track.js';
import { TE } from '../telemetry/events.js';

/** Report how a share card actually left the device (see meta/sharecard.js return values). */
function trackShareOutcome(surface, promise) {
  if (!promise || typeof promise.then !== 'function') return;
  promise.then(
    (outcome) => track(TE.SHARE_RESULT, { surface, outcome: outcome || 'unknown' }),
    (err) => track(TE.SHARE_RESULT, { surface, outcome: 'failed', error: String(err) }),
  );
}

const SCREENS = ['screen-title', 'screen-breather', 'screen-over', 'screen-collections', 'screen-settings', 'screen-howto', 'helper-overlay'];

const POWER_HELP = {
  push: ['PUSH', 'Shoves a droid and its neighbors back and stalls their fire for a few seconds.', 'Drag over a droid cluster · GO to confirm'],
  block: ['BLOCK', 'Conjures a Force wall in front of your clones. It soaks fire until its HP is gone; clones shoot through it.', 'Drag in front of clones under fire'],
  crush: ['CRUSH', 'Instantly kills one droid outright, whatever its health.', 'Drag over the deadliest droid'],
  heal: ['HEAL', 'Restores a clone to full and tops up its neighbors. It cannot revive the dead.', 'Drag over a wounded clone'],
};

// First-catch explainers for power-ups (PRD §19). Keys are src/config/powerups.js. Shown
// once per type, ever. [title, body] only — unlike POWER_HELP these carry no hint line: the
// card appears AFTER the effect has already fired, so there is no decision left to coach.
const POWERUP_HELP = {
  forceFull: ['FORCE SURGE', 'Your Force bar floods to full in a heartbeat. It keeps until you spend it.'],
  forceHalf: ['FORCE FLOW', 'Half a Force bar, poured in at once. It keeps until you spend it.'],
  healAll: ['FIELD MEDIC', 'Every living clone is restored to full health. The fallen stay fallen.'],
  empower: ['BATTLE MEDITATION', 'For a few seconds your deflections aim truer and hit far harder. You will glow while it lasts.'],
  secondYoda: ['MASTER YODA', 'Master Yoda fights at your side for a while, mirroring your movement with a saber of his own.'],
  ultimate: ['THE HIGH GROUND', 'Every droid on the field is thrown back and stunned — and a quarter of them are crushed outright.'],
  badBatch: ['BAD BATCH', 'A hardened squad drops in and draws every droid\'s fire. They cannot be killed, but they will not stay long — and they cannot save you if your own clones fall.'],
};

export function createScreens(game, { emitter, meta, config }) {
  const state = game.state;
  const planets = config.planets;
  const el = (id) => document.getElementById(id);

  function hideAll() { for (const s of SCREENS) el(s).classList.remove('show'); }
  function show(id) { el(id).classList.add('show'); }
  function stealthBreather(on) { el('screen-breather').classList.toggle('stealth', on); }

  // ---- title ----
  function refreshTitleBest() {
    const b = meta.profile.best;
    if (!b.planet) { el('title-best').textContent = 'NO RECORD YET'; return; }
    const name = (planets[b.planet - 1] && planets[b.planet - 1].name) || 'UNKNOWN';
    el('title-best').innerHTML = `<span class="best-h">YOUR BEST</span>`
      + `${name} (${b.planet}) - Wave ${b.wave}<br>`
      + `Score: ${b.score.toLocaleString('en-US')}`;
  }
  refreshTitleBest();

  el('btn-deploy').addEventListener('click', () => game.startRun());
  el('btn-redeploy').addEventListener('click', () => game.startRun());
  el('btn-retreat').addEventListener('click', () => { hideAll(); show('screen-title'); refreshTitleBest(); });
  el('btn-ready').addEventListener('click', () => game.readyFromBreather());

  // ---- collections ----
  el('btn-collections').addEventListener('click', () => { renderCollections('skins'); show('screen-collections'); });
  el('btn-collections-close').addEventListener('click', () => { hideAll(); show('screen-title'); refreshTitleBest(); });

  // ---- settings ----
  el('app-version').textContent = 'v' + APP_VERSION;
  function resetSettingsUI() {
    el('reset-confirm-1').hidden = true;
    el('reset-confirm-2').hidden = true;
    el('helpers-reset-note').hidden = true;
    el('btn-reset-data').hidden = false;
  }
  el('btn-settings').addEventListener('click', () => { resetSettingsUI(); hideAll(); show('screen-settings'); });
  el('btn-settings-close').addEventListener('click', () => { resetSettingsUI(); hideAll(); show('screen-title'); refreshTitleBest(); });
  el('btn-reset-helpers').addEventListener('click', () => { meta.resetHelpers(); el('helpers-reset-note').hidden = false; });
  // Reset My Data — two-step confirmation.
  el('btn-reset-data').addEventListener('click', () => { el('btn-reset-data').hidden = true; el('reset-confirm-1').hidden = false; });
  el('reset-cancel-1').addEventListener('click', resetSettingsUI);
  el('reset-continue').addEventListener('click', () => { el('reset-confirm-1').hidden = true; el('reset-confirm-2').hidden = false; });
  el('reset-cancel-2').addEventListener('click', resetSettingsUI);
  el('reset-erase').addEventListener('click', () => {
    // Report what was lost BEFORE the wipe + reload — nothing survives the next line.
    track(TE.DATA_RESET, {
      badgesErased: Object.keys(meta.profile.badges).length,
      skinsErased: meta.profile.skins.unlocked.length,
      runsErased: meta.profile.runs.length,
    });
    meta.resetAllData();
    location.reload();
  });

  // ---- how to play ----
  el('btn-howto').addEventListener('click', () => show('screen-howto'));
  const closeHowto = () => { hideAll(); show('screen-title'); refreshTitleBest(); };
  el('btn-howto-close').addEventListener('click', closeHowto);
  el('btn-howto-x').addEventListener('click', closeHowto);
  el('tab-skins').addEventListener('click', () => renderCollections('skins'));
  el('tab-badges').addEventListener('click', () => renderCollections('badges'));

  function renderCollections(tab) {
    el('tab-skins').classList.toggle('active', tab === 'skins');
    el('tab-badges').classList.toggle('active', tab === 'badges');
    const body = el('collections-body');
    body.innerHTML = '';
    if (tab === 'skins') {
      renderSkinList(body, { onEquip: () => renderCollections('skins') });
    } else {
      const grid = document.createElement('div');
      grid.className = 'badge-grid';
      for (const badge of meta.catalogs.badges) {
        const got = !!meta.profile.badges[badge.id];
        const cell = document.createElement('div');
        cell.className = 'badge-cell' + (got ? ' unlocked' : '');
        // Tap a badge to read how it's earned (badge.desc = the criteria).
        cell.innerHTML = `<span class="badge-glyph">${got ? (badge.glyph || '★') : '?'}</span>`
          + `<span>${got ? badge.name : 'LOCKED'}</span>`
          + `<span class="badge-desc">${badge.desc || ''}</span>`;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.dataset.badgeId = badge.id;          // read by the telemetry click delegate
        cell.dataset.unlocked = got ? '1' : '0';
        cell.addEventListener('click', () => cell.classList.toggle('show-desc'));
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.classList.toggle('show-desc'); }
        });
        grid.appendChild(cell);
      }
      body.appendChild(grid);
    }
  }
  function unlockLabel(u) {
    if (u.type === 'planet') return 'PLANET ' + u.value;
    if (u.type === 'score') return u.value + ' PTS';
    return 'LOCKED';
  }

  // Shared skin picker — used by the collections screen and the planet-clear breather.
  // Two modes:
  //   collections: onEquip — clicking an unlocked row equips immediately, then re-renders.
  //   select (planet-clear): onSelect + selectedId — clicking sets a pending choice (any
  //     unlocked row, incl. the current one); nothing persists until APPLY. newIds flag NEW.
  // Card grid: each knight shows its own baked sprite + name + state. Locked cards render a
  // dimmed silhouette (see styles.css .skin-card.locked). Used by collections + planet-clear.
  function renderSkinList(container, { newIds = [], onEquip, onSelect, selectedId } = {}) {
    const selectMode = !!onSelect;
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'skin-grid';
    for (const skin of meta.catalogs.skins) {
      const unlocked = meta.profile.skins.unlocked.includes(skin.id);
      const active = meta.profile.skins.active === skin.id;
      const isNew = newIds.includes(skin.id);
      const selected = selectMode && selectedId === skin.id;
      const card = document.createElement('div');
      card.className = 'skin-card' + (unlocked ? '' : ' locked') + (active ? ' active' : '')
        + (isNew ? ' is-new' : '') + (selected ? ' selected' : '');
      const cv = bakeJedi(3, skin.palette, skin.map);
      cv.className = 'skin-cv';
      const name = document.createElement('span');
      name.className = 'skin-name';
      name.textContent = skin.name;
      const st = document.createElement('span');
      st.className = 'skin-state';
      if (selectMode) {
        st.textContent = selected ? 'SELECTED' : active ? 'CURRENT' : isNew ? 'NEW' : unlocked ? '' : unlockLabel(skin.unlock);
      } else {
        st.textContent = active ? 'ACTIVE' : isNew ? 'NEW · EQUIP' : unlocked ? 'EQUIP' : unlockLabel(skin.unlock);
      }
      card.append(cv, name, st);
      card.dataset.skinId = skin.id;              // read by the telemetry click delegate
      card.dataset.unlocked = unlocked ? '1' : '0';
      card.dataset.surface = selectMode ? 'planet_clear' : 'collections';
      if (unlocked) {
        if (selectMode) card.addEventListener('click', () => onSelect(skin.id));
        else if (!active) card.addEventListener('click', () => { meta.setActiveSkin(skin.id, 'collections'); if (onEquip) onEquip(); });
      }
      grid.appendChild(card);
    }
    container.appendChild(grid);
  }

  // ---- breather ----
  // Timings live in globals; CSS reads them off this custom property so there is one source.
  document.documentElement.style.setProperty('--breather-fade', config.globals.breatherFadeMs + 'ms');
  let lastWave = null;
  emitter.on(EVT.WAVE_CLEARED, (p) => { lastWave = p; });
  emitter.on(EVT.BREATHER_STARTED, (info) => {
    const p = lastWave || { survivors: 0, deflects: 0, bKills: 0, forceGained: 0, flawless: false };
    const isPlanet = info.nextIsPlanet && state.pendingPlanetIndex != null;
    if (isPlanet) {
      el('breather-title').innerHTML = 'PLANET CLEARED<br><span class="bt-planet">' + planets[state.planetIndex].name + '</span>';
    } else {
      // waveIndex was already incremented by waveClear(); it now equals the 1-based cleared wave.
      el('breather-title').textContent = 'WAVE ' + state.waveIndex + ' CLEAR';
    }
    el('breather-stats').textContent = `SURVIVORS ${p.survivors} · DEFLECTS ${p.deflects} · KILLS ${p.bKills}`;
    el('breather-flawless').hidden = !p.flawless;
    el('breather-force').textContent = `FORCE +${p.forceGained} → ${Math.round(state.force)}`;

    // Planet-clear gets the full treatment: no countdown, recovered badges, inline skin picker.
    el('screen-breather').classList.toggle('planet', isPlanet);
    el('breather-count').hidden = isPlanet;
    el('breather-planet').hidden = !isPlanet;
    if (isPlanet) renderPlanetClear();

    hideAll();
    show('screen-breather');
    stagePlanetClear(isPlanet);
  });

  // Planet-clear lands in two beats: CLEARED + the world's name, then everything else fades
  // in planetClearRevealMs later. Between-wave breathers show whole (the .show fade covers them).
  let stageTimer = null;
  function stagePlanetClear(isPlanet) {
    const b = el('screen-breather');
    if (stageTimer) { clearTimeout(stageTimer); stageTimer = null; }
    b.classList.remove('revealed');
    b.classList.toggle('staged', isPlanet);
    if (!isPlanet) return;
    stageTimer = setTimeout(() => {
      stageTimer = null;
      b.classList.add('revealed');
    }, config.globals.planetClearRevealMs);
  }
  // Populate the planet-clear extras: badges recovered this world + the knight skin picker.
  function renderPlanetClear() {
    const earned = meta.badgesEarnedThisPlanet();
    const wrap = el('breather-earned-wrap');
    const list = el('breather-earned');
    list.innerHTML = '';
    if (earned.length) {
      const byId = Object.fromEntries(meta.catalogs.badges.map((x) => [x.id, x]));
      for (const id of earned) {
        const chip = document.createElement('span');
        chip.className = 'bp-chip';
        chip.textContent = '★ ' + ((byId[id] && byId[id].name) || id);
        list.appendChild(chip);
      }
      wrap.hidden = false;
    } else wrap.hidden = true;
    // NEW JEDI header only when a knight was unlocked on this planet.
    el('breather-newjedi-h').hidden = meta.skinsUnlockedThisPlanet().length === 0;
    closeKnightPicker(); // start collapsed each planet-clear: button visible, picker hidden
  }

  // ---- planet-clear knight picker: CHANGE KNIGHT button → list + APPLY (no cancel) ----
  let pendingSkin = null; // selected-but-not-yet-applied skin id
  function renderKnightList() {
    renderSkinList(el('breather-skins'), {
      newIds: meta.skinsUnlockedThisPlanet(),
      selectedId: pendingSkin,
      onSelect: (id) => { pendingSkin = id; renderKnightList(); },
    });
  }
  function openKnightPicker() {
    pendingSkin = meta.profile.skins.active; // default selection = current knight
    el('btn-change-knight').hidden = true;
    el('breather-skins-panel').hidden = false;
    renderKnightList();
  }
  function applyKnight() {
    if (pendingSkin) meta.setActiveSkin(pendingSkin, 'planet_clear'); // refuses locked; pending is always an unlocked row
    closeKnightPicker();
  }
  function closeKnightPicker() {
    pendingSkin = null;
    el('breather-skins-panel').hidden = true;
    el('btn-change-knight').hidden = false;
  }
  el('btn-change-knight').addEventListener('click', openKnightPicker);
  el('btn-apply-knight').addEventListener('click', applyKnight);

  // Proceeding (auto-countdown or READY) starts the next wave — dismiss the breather so
  // play resumes on-screen. Covers both between-wave and between-planet transitions.
  emitter.on(EVT.WAVE_STARTED, () => {
    const b = el('screen-breather');
    if (stageTimer) { clearTimeout(stageTimer); stageTimer = null; }
    b.classList.remove('show');
    // reset so the overlay is clean for the next use
    b.classList.remove('planet', 'staged', 'revealed');
  });

  // ---- game over (death only; finale is finale.js) ----
  emitter.on(EVT.RUN_ENDED, (p) => {
    if (p.cause !== 'death') return;
    const planet = planets[p.planetIndex];
    el('over-result').textContent = `${planet.name} · WAVE ${p.waveIndex + 1} · SCORE ${p.score}`;
    const b = meta.profile.best;
    el('over-best').textContent = `BEST · PLANET ${b.planet} · WAVE ${b.wave} · ${b.score}`;

    const earned = meta.badgesEarnedThisRun();
    const list = el('over-badges');
    list.innerHTML = '';
    if (earned.length) {
      const byId = Object.fromEntries(meta.catalogs.badges.map((x) => [x.id, x]));
      for (const id of earned) {
        const d = document.createElement('div');
        d.className = 'badge-earned';
        d.textContent = '★ ' + ((byId[id] && byId[id].name) || id);
        list.appendChild(d);
      }
      list.hidden = false;
    } else list.hidden = true;

    const shareBtn = el('btn-share');
    if (meta.shareCard) {
      shareBtn.hidden = false;
      // The click itself is logged by the telemetry delegate; this reports the outcome.
      shareBtn.onclick = () => trackShareOutcome('game_over', meta.shareCard(
        { planet: p.planetIndex + 1, wave: p.waveIndex + 1, score: p.score, cause: p.cause, planetName: planet.name },
        planet,
      ));
    } else shareBtn.hidden = true;

    hideAll();
    show('screen-over');
  });

  // enter play → clear overlays
  emitter.on(EVT.RUN_STARTED, hideAll);

  function update() {
    // Planet-clear has no countdown (READY only); only the between-wave breather ticks.
    if (state.mode === 'breather' && state.pendingPlanetIndex == null) {
      el('breather-count').textContent = 'NEXT WAVE IN ' + Math.max(0, Math.ceil(state.breatherT));
    }
  }

  return { update, hideAll, stealthBreather, showHelper, showPowerupHelp, refreshTitleBest };

  // ---- helper overlay (shared with powerflow) ----
  function showHelper(power, onOk) {
    const [title, body, hint] = POWER_HELP[power];
    el('helper-title').textContent = title;
    el('helper-body').textContent = body;
    el('helper-hint').textContent = hint;
    el('helper-hint').style.display = ''; // a hintless power-up card may have collapsed it
    show('helper-overlay');
    const ok = el('btn-helper-ok');
    ok.dataset.power = power;                     // read by the telemetry click delegate
    ok.dataset.gate = onOk ? '1' : '0';           // first-use gate vs a voluntary "?" re-read
    ok.onclick = () => { el('helper-overlay').classList.remove('show'); if (onOk) onOk(); };
  }

  // ---- first-catch power-up explainer (ui/pickups.js) ----
  // Same overlay, different copy table. The effect has ALREADY applied by the time this
  // shows — the card explains what just happened, it is not a confirmation.
  function showPowerupHelp(type, onOk) {
    const copy = POWERUP_HELP[type];
    if (!copy) { if (onOk) onOk(); return; }
    const [title, body] = copy;
    el('helper-title').textContent = title;
    el('helper-body').textContent = body;
    // No hint line on power-up cards — collapse the shared element rather than blanking it,
    // so the card does not carry an empty row. showHelper re-shows it for the powers.
    el('helper-hint').style.display = 'none';
    show('helper-overlay');
    const ok = el('btn-helper-ok');
    ok.dataset.power = type;
    ok.dataset.gate = '1';
    ok.onclick = () => { el('helper-overlay').classList.remove('show'); if (onOk) onOk(); };
  }
}
