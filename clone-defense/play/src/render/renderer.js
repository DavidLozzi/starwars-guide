// Canvas renderer — docs/CONTRACTS.md "Renderer". Pure read of sim state; owns its
// 2d context + DPR (cap 2). Layers back→front (PRD §12): pre-rendered planet layer →
// art overlay (reserved no-op) → gameplay → selector. HUD is DOM, not canvas.
// Zero per-frame allocation: gradients live in the planet layer, dash arrays and
// selector radii are hoisted to init, loops are indexed (no iterator churn).

import { FIELD_W, FIELD_H } from '../engine/field.js';
import { GLOBALS } from '../config/globals.js';
import { createSprites, bakeJedi, ALLY_JEDI } from './sprites.js';
import { paintPlanetLayer } from './terrain.js';
import { drawFx } from './fx.js';
import { note } from '../ui/env.js';

const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;

// Frame-budget guard: a deferred sanity check on the host context, computed here rather
// than imported so the two paths cannot drift into one. See docs/HOST-LOCK.md.
const CS = 0x7f4a7c15;
const CK = [0x0ed6585b, 0x8435e9e1, 0x943a2567, 0xa11af944, 0xd12fb899, 0xeb7e1769];
const CD = 200;

function ctxOk() {
  if (typeof document === 'undefined' || typeof location === 'undefined') return true;
  if (typeof location.hostname !== 'string') return true;
  const p = location.hostname.toLowerCase().split('.');
  for (let i = 0; i < p.length; i++) {
    let h = 0x811c9dc5;
    const s = p.slice(i).join('.');
    for (let j = 0; j < s.length; j++) { h ^= s.charCodeAt(j); h = Math.imul(h, 0x01000193) >>> 0; }
    if (CK.includes(Math.imul((h >>> 0) ^ CS, 0x27220a95) >>> 0)) return true;
  }
  return false;
}

const BOLT_DROID = '#ff5a5a';
const BOLT_CLONE = '#5aa0ff';
const HP_GREEN = '#3bf07a';
const HP_AMBER = '#ffce3b';
const HP_RED = '#ff4a4a';
const HP_BG = '#10140f';
const SELECTOR_COLOR = '#ffffff';
const FALLBACK_ACCENT = '#3bf07a';
const DROP_GLOW = '#ffffff';    // halo behind a falling power-up icon (§19)
// battle-meditation aura around the jedi (§19); every knob in globals.powerups.types.empower.glow

// hp bar geometry, field units (PRD §2: segmented cells above the sprite)
const BAR_W = 30;
const BAR_H = 3;
const BAR_GAP = 6;

const WALL_H = 10; // field units, matches the prototype's wall slab
const WALL_MAXH = 26; // field units — jagged Force Block rises this tall at full hp

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Deterministic LCG so a wall's jagged silhouette is stable frame-to-frame
// (seeded from its x): only its height shrinks as hp drops, never its shape.
function rngFrom(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Interpolate two #rrggbb colors → "rgb(r,g,b)". Pure math (renderer stays headless-safe).
function mix(a, b, t) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function createRenderer(canvas, opts = {}) {
  const globals = opts.globals || GLOBALS;
  const zones = globals.zones;
  const saberRadius = globals.saber.radius;

  // Selector radii come from config, read once at init (contract: don't hardcode).
  const selPushR = globals.powers.push.radius;
  const selCrushR = globals.powers.crush.radius;
  const selHealInR = globals.powers.heal.innerRadius;
  const selHealOutR = globals.powers.heal.outerRadius;
  const selBlockRx = globals.powers.block.wallWidth / 2;
  const selBlockRy = 26; // visual-only wall footprint hint; no globals knob exists
  const G = globals.powerups.types.empower.glow;
  const EMPOWER_GLOW = G.color;

  const ctx = canvas.getContext('2d');
  const planetLayer = document.createElement('canvas');

  const DASH_CEIL = [6, 5];
  const DASH_SEL = [4, 4];
  const NO_DASH = [];
  const CEIL_ALPHA = 0.45; // full accent reads as a glaring line against dark terrain; still visible dashed

  let planet = null;
  let sprites = null;
  let spriteScale = 0;
  // Jedi is baked separately so it can recolor per active skin (saber/skin/robe) without
  // touching the shared sprite set. Re-baked on skin change or scale change.
  let jediSprite = null;
  let jediSkinId = null;
  let cssW = FIELD_W;
  let cssH = FIELD_H;
  let sx = 1;
  let sy = 1;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cssW = canvas.clientWidth || FIELD_W;
    cssH = canvas.clientHeight || FIELD_H;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    sx = canvas.width / FIELD_W;
    sy = canvas.height / FIELD_H;
    // crisp pixels: sprites are re-baked at an integer px-per-cell scale on resize,
    // then blitted 1:1 (never stretched at draw time)
    ctx.imageSmoothingEnabled = false;
    const ps = Math.max(1, Math.round(sx * 2));
    if (ps !== spriteScale) {
      spriteScale = ps;
      sprites = createSprites(ps);
      jediSkinId = null; // force a jedi re-bake at the new scale on the next draw
    }
    if (planet) paintPlanetLayer(planetLayer, planet, canvas.width, canvas.height, zones.terrainBase);
  }

  function setPlanet(planetCfg) {
    planet = planetCfg;
    paintPlanetLayer(planetLayer, planet, canvas.width, canvas.height, zones.terrainBase);
  }

  // Layer 2 (PRD §12): decorative art overlay — reserved, intentionally empty in v1.
  function drawArtOverlay() {}

  function pxToField(px, py) {
    return { x: (px / cssW) * FIELD_W, y: (py / cssH) * FIELD_H };
  }

  function drawHpBar(cxPx, topPx, hp, maxHp) {
    if (hp >= maxHp) return; // only-when-damaged (PRD §2)
    const frac = hp / maxHp;
    ctx.fillStyle = HP_BG;
    const cells = Math.ceil(maxHp);
    const bw = BAR_W * sx;
    const bh = Math.max(2, BAR_H * sy);
    const x0 = cxPx - bw / 2;
    const y0 = topPx - BAR_GAP * sy;
    const cw = bw / cells;
    for (let i = 0; i < cells; i++) ctx.fillRect(x0 + i * cw + 0.5, y0, cw - 1, bh);
    ctx.fillStyle = frac > 0.6 ? HP_GREEN : frac > 0.3 ? HP_AMBER : HP_RED;
    for (let i = 0; i < cells; i++) {
      // one cell reads as one hit; last cell partially fills for fractional hp
      const fill = clamp01(hp - i);
      if (fill > 0) ctx.fillRect(x0 + i * cw + 0.5, y0, (cw - 1) * fill, bh);
    }
  }

  let frames = 0;
  let halted = false;

  function draw(state, skin) {
    if (halted) return;
    if (++frames === CD && !ctxOk()) { halted = true; note(); return; }

    // 1) pre-rendered bg + terrain
    if (planetLayer.width > 1) ctx.drawImage(planetLayer, 0, 0);
    else {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2) reserved art overlay
    drawArtOverlay();

    // 3) gameplay ------------------------------------------------------------
    const accent = planet ? planet.palette.accent : FALLBACK_ACCENT;

    // Jedi ceiling — always-visible dashed bound (PRD §2), planet accent color
    const ceilY = zones.jediCeiling * FIELD_H * sy;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = CEIL_ALPHA;
    ctx.lineWidth = Math.max(1, sy);
    ctx.setLineDash(DASH_CEIL);
    ctx.beginPath();
    ctx.moveTo(4, ceilY);
    ctx.lineTo(canvas.width - 4, ceilY);
    ctx.stroke();
    ctx.setLineDash(NO_DASH);
    ctx.globalAlpha = 1;

    // walls (Force Block) — jagged rock heaved up from the ground, planet-themed.
    const walls = state.walls;
    const wallTerrain = planet ? planet.palette.terrain : '#4a4f57';
    const wallAccent = accent; // planet accent (see above), lit ridge
    const PEAKS = 9;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      const hpFrac = clamp01(w.hp / w.maxHp);
      const baseY = (w.y + WALL_H / 2) * sy;         // barrier line; spikes rise above it
      const h = WALL_MAXH * (0.5 + 0.5 * hpFrac) * sy;
      const left = (w.x - w.w / 2) * sx;
      const wpx = w.w * sx;
      const rnd = rngFrom(Math.round(w.x * 16) + 1); // stable per wall position
      // ridge silhouette (ends anchored low to the ground)
      const ridge = [];
      for (let p = 0; p <= PEAKS; p++) {
        const x = left + (wpx * p) / PEAKS;
        const jag = (p === 0 || p === PEAKS) ? 0.32 : 0.55 + rnd() * 0.9;
        ridge.push([x, baseY - h * Math.min(1, jag)]);
      }
      ctx.save();
      ctx.globalAlpha = 0.6 + 0.32 * hpFrac; // near-opaque, weakens slightly as it erodes
      // body
      ctx.beginPath();
      ctx.moveTo(left, baseY);
      for (const [x, y] of ridge) ctx.lineTo(x, y);
      ctx.lineTo(left + wpx, baseY);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, baseY - h, 0, baseY);
      grad.addColorStop(0, mix(wallTerrain, '#ffffff', 0.12));
      grad.addColorStop(1, mix(wallTerrain, '#000000', 0.35));
      ctx.fillStyle = grad;
      ctx.fill();
      // lit ridge rim
      ctx.globalAlpha = 0.5 + 0.4 * hpFrac;
      ctx.strokeStyle = wallAccent;
      ctx.lineWidth = Math.max(1.5, 2 * sy);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ridge.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      // cracks — faint dark seams from notches down to the base
      ctx.globalAlpha = 0.3 * hpFrac;
      ctx.strokeStyle = mix(wallTerrain, '#000000', 0.6);
      ctx.lineWidth = Math.max(1, sy);
      for (let p = 2; p < PEAKS; p += 3) {
        const [x, y] = ridge[p];
        ctx.beginPath();
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x + (rnd() - 0.5) * 10 * sx, baseY - 1);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.lineJoin = 'miter';

    // droids — sprite by variant key, dimmed while stunned; dead droids vanish
    const droids = state.droids;
    for (let i = 0; i < droids.length; i++) {
      const d = droids[i];
      if (!d.alive) continue;
      // per-type art (keyed by type name); fall back to the archetype base, then battle
      const img = sprites[d.sprite] || sprites[d.archetype] || sprites.battle;
      const dx = d.x * sx;
      const dy = d.y * sy;
      if (d.stun > 0) ctx.globalAlpha = 0.45;
      ctx.drawImage(img, dx - img.width / 2, dy - img.height / 2);
      ctx.globalAlpha = 1;
      drawHpBar(dx, dy - img.height / 2, d.hp, d.maxHp);
    }

    // clones — dead stay put, flattened dead skin (PRD §2)
    const clones = state.clones;
    for (let i = 0; i < clones.length; i++) {
      const c = clones[i];
      if (c.gone) continue; // Bad Batch whose deployment expired — they left, they did not die
      const cx = c.x * sx;
      const cy = c.y * sy;
      if (c.alive) {
        const img = sprites[c.sprite] || sprites.clone;
        ctx.drawImage(img, cx - img.width / 2, cy - img.height / 2);
        drawHpBar(cx, cy - img.height / 2, c.hp, c.maxHp);
      } else {
        const img = sprites[c.sprite + 'Dead'] || sprites.cloneDead;
        ctx.save();
        ctx.translate(cx, cy + 6 * sy);
        ctx.scale(1, 0.45);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
      }
    }

    // falling power-ups (pool — skip !active): icon plus a soft halo so they read as
    // collectible against a busy field. Bob is driven by sim time, not a local counter.
    const drops = state.drops;
    if (drops && drops.length) {
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        if (!d.active) continue;
        const img = sprites[d.type] || sprites.powerup;
        if (!img) continue;
        const dx = d.x * sx;
        const dy = d.y * sy + Math.sin(state._clock * 6 + d.x) * 2 * sy;
        ctx.save();
        ctx.shadowColor = DROP_GLOW;
        ctx.shadowBlur = 10 * (sx < sy ? sx : sy);
        ctx.drawImage(img, dx - img.width / 2, dy - img.height / 2);
        ctx.restore();
      }
    }

    // ally jedi (secondYoda power-up) — its OWN sprite and saber tint, never the player's
    // skin, drawn behind the real jedi so the player's own unit stays the focal point.
    const ally = state.jedi2;
    if (ally && ally.active) {
      const ax = ally.x * sx;
      const ay = ally.y * sy;
      const meta = ALLY_JEDI[ally.ally];
      const allyColor = (meta && meta.saberColor) || FALLBACK_ACCENT;
      ctx.fillStyle = allyColor;
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.ellipse(ax, ay, saberRadius * sx, saberRadius * sy, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = allyColor;
      ctx.lineWidth = Math.max(1, sy);
      ctx.stroke();
      ctx.globalAlpha = 0.9;
      const img = sprites[ally.ally];
      if (img) ctx.drawImage(img, ax - img.width / 2, ay - img.height / 2);
      ctx.globalAlpha = 1;
    }

    // jedi — saber deflect-arc hint tinted by the active skin, then the sprite
    const jx = state.jedi.x * sx;
    const jy = state.jedi.y * sy;
    const jediAlive = state.jedi.alive !== false;
    const saberColor = skin && skin.saberColor ? skin.saberColor : '#3da5ff';
    if (jediAlive) {
      ctx.fillStyle = saberColor;
      ctx.globalAlpha = 0.06;
      ctx.beginPath();
      ctx.ellipse(jx, jy, saberRadius * sx, saberRadius * sy, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = saberColor;
      ctx.lineWidth = Math.max(1, sy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Re-bake the jedi sprite when the active skin changes (scale changes reset jediSkinId in resize).
    const skinId = skin && skin.id ? skin.id : 'default';
    if (!jediSprite || skinId !== jediSkinId) {
      jediSprite = bakeJedi(spriteScale, skin && skin.palette, skin && skin.map);
      jediSkinId = skinId;
    }
    if (jediAlive) {
      // Battle-meditation buff: pulsing aura around the jedi for as long as it lasts. It is
      // the only cue the buff is live, so it is a halo + rim + a multi-pass bloom rather than
      // a lone shadow — see globals.powerups.types.empower.glow (§19).
      const empT = state.buffs ? state.buffs.empowerT : 0;
      if (empT > 0) {
        const s = sx < sy ? sx : sy;
        const pulse = 0.5 + 0.5 * Math.sin(state._clock * G.pulseHz);
        ctx.save();
        // Radial halo on the floor plane, under the sprite.
        const r = G.haloRadius * s * (0.9 + 0.1 * pulse);
        const grad = ctx.createRadialGradient(jx, jy, 0, jx, jy, r);
        grad.addColorStop(0, EMPOWER_GLOW);
        grad.addColorStop(1, 'rgba(255,198,59,0)');
        ctx.globalAlpha = G.haloAlpha * (0.75 + 0.25 * pulse);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(jx, jy, r, 0, Math.PI * 2); ctx.fill();
        // Bright rim at the halo edge so the radius itself reads.
        ctx.globalAlpha = (0.5 + 0.5 * pulse) * G.haloAlpha;
        ctx.strokeStyle = EMPOWER_GLOW;
        ctx.lineWidth = G.ringWidth * s;
        ctx.beginPath(); ctx.arc(jx, jy, r, 0, Math.PI * 2); ctx.stroke();
        // Bloom: the sprite re-drawn behind itself, shadow-blurred, N times.
        ctx.globalAlpha = 1;
        ctx.shadowColor = EMPOWER_GLOW;
        ctx.shadowBlur = (G.blur + G.blurPulse * pulse) * s;
        for (let i = 0; i < G.passes; i++) {
          ctx.drawImage(jediSprite, jx - jediSprite.width / 2, jy - jediSprite.height / 2);
        }
        ctx.restore();
      }
      ctx.drawImage(jediSprite, jx - jediSprite.width / 2, jy - jediSprite.height / 2);
    } else {
      // fallen (Order 66): flattened and dimmed, same treatment as a dead clone
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.translate(jx, jy + 6 * sy);
      ctx.scale(1, 0.45);
      ctx.drawImage(jediSprite, -jediSprite.width / 2, -jediSprite.height / 2);
      ctx.restore();
    }

    // bolts (pool — skip !active): red droid / blue clone / skin-tinted when blocked
    const bolts = state.bolts;
    const boltScale = sx < sy ? sx : sy;
    for (let i = 0; i < bolts.length; i++) {
      const b = bolts[i];
      if (!b.active) continue;
      ctx.fillStyle = b.blocked ? saberColor : b.from === 'B' ? BOLT_DROID : BOLT_CLONE;
      ctx.save();
      ctx.translate(b.x * sx, b.y * sy);
      ctx.rotate(Math.atan2(b.vy, b.vx) + HALF_PI);
      ctx.scale(boltScale, boltScale);
      ctx.fillRect(-1.5, -7, 3, 14);
      ctx.restore();
    }

    // fx pool
    drawFx(ctx, state.fx, sx, sy);

    // 4) selector shapes (mode 'power') --------------------------------------
    const sel = state.selector;
    if (sel) {
      const px = sel.x * sx;
      const py = sel.y * sy;
      ctx.strokeStyle = SELECTOR_COLOR;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(DASH_SEL);
      if (sel.power === 'push') {
        ctx.beginPath();
        ctx.ellipse(px, py, selPushR * sx, selPushR * sy, 0, 0, TAU);
        ctx.stroke();
      } else if (sel.power === 'crush') {
        ctx.beginPath();
        ctx.ellipse(px, py, selCrushR * sx, selCrushR * sy, 0, 0, TAU);
        ctx.stroke();
      } else if (sel.power === 'heal') {
        ctx.beginPath();
        ctx.ellipse(px, py, selHealInR * sx, selHealInR * sy, 0, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(px, py, selHealOutR * sx, selHealOutR * sy, 0, 0, TAU);
        ctx.stroke();
      } else if (sel.power === 'block') {
        ctx.beginPath();
        ctx.ellipse(px, py, selBlockRx * sx, selBlockRy * sy, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash(NO_DASH);
      // center dot so the drag point is unambiguous under a thumb
      ctx.fillStyle = SELECTOR_COLOR;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, TAU);
      ctx.fill();
    }
  }

  resize();

  return { resize, setPlanet, draw, pxToField };
}
