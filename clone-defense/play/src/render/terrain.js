// Pre-rendered planet layer (PRD §12 layer 1): bg gradient + faint console grid +
// procedural terrain silhouette from floorSeed. Painted ONCE per planet/resize into
// an offscreen canvas; the renderer blits it every frame (zero per-frame allocation).

import { FIELD_W, FIELD_H } from '../engine/field.js';

// Tiny seeded LCG — src/engine/rng.js is not on this branch, so it lives here.
// Same constants as the prototype so seeds produce a familiar silhouette.
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const STEP = 8; // field units between terrain samples — resolution independent
const GRID = 24; // field units between console grid lines

// Terrain heights are generated in FIELD units so a planet's silhouette is
// identical at any canvas size / DPR.
// Exported so dev/planet-editor.html can seed its draft strokes from the live
// procedural silhouette instead of carrying a copied point table.
export function terrainHeights(seed, baseY, amp) {
  const rng = makeRng(seed);
  const pts = [];
  for (let x = 0; x <= FIELD_W; x += STEP) {
    pts.push(baseY + Math.sin(x * 0.05 + seed) * 0.5 * amp + (rng() - 0.5) * amp);
  }
  return pts;
}

function strokeRidge(ctx, pts, sx, sy, fillToBottom, hPx) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const x = i * STEP * sx;
    if (i === 0) ctx.moveTo(x, pts[i] * sy);
    else ctx.lineTo(x, pts[i] * sy);
  }
  if (fillToBottom) {
    ctx.lineTo(FIELD_W * sx, hPx);
    ctx.lineTo(0, hPx);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

/**
 * (Re)paint the planet layer into `layerCanvas` at wPx × hPx backing pixels.
 * `terrainBase` is the cosmetic silhouette baseline as a fraction of FIELD_H
 * (GLOBALS.zones.terrainBase — cosmetic only, zero gameplay effect, PRD §12).
 */
export function paintPlanetLayer(layerCanvas, planet, wPx, hPx, terrainBase) {
  layerCanvas.width = Math.max(1, wPx);
  layerCanvas.height = Math.max(1, hPx);
  const ctx = layerCanvas.getContext('2d');
  const sx = layerCanvas.width / FIELD_W;
  const sy = layerCanvas.height / FIELD_H;

  // Background gradient (dark-base by design — bolt readability, PRD §16).
  const grad = ctx.createLinearGradient(0, 0, 0, layerCanvas.height);
  grad.addColorStop(0, planet.palette.bgGradient[0]);
  grad.addColorStop(1, planet.palette.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);

  // Faint console grid — the "Republic tactical display" texture from the prototype.
  ctx.strokeStyle = 'rgba(59,240,122,0.04)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= FIELD_W; gx += GRID) {
    ctx.beginPath();
    ctx.moveTo(gx * sx, 0);
    ctx.lineTo(gx * sx, layerCanvas.height);
    ctx.stroke();
  }
  for (let gy = 0; gy <= FIELD_H; gy += GRID) {
    ctx.beginPath();
    ctx.moveTo(0, gy * sy);
    ctx.lineTo(layerCanvas.width, gy * sy);
    ctx.stroke();
  }

  const baseY = terrainBase * FIELD_H;

  // Far ridge — fainter, higher, for depth (improves on the prototype's single line).
  const far = terrainHeights(planet.floorSeed * 2 + 17, baseY - 14, 18);
  ctx.strokeStyle = planet.palette.terrain;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(1, sy);
  strokeRidge(ctx, far, sx, sy, false, layerCanvas.height);

  // Main silhouette — dim fill down to the bottom edge, bright ridge line on top.
  const main = terrainHeights(planet.floorSeed, baseY, 12);
  ctx.fillStyle = planet.palette.terrain;
  ctx.globalAlpha = 0.22;
  strokeRidge(ctx, main, sx, sy, true, layerCanvas.height);
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(2, 2 * sy);
  strokeRidge(ctx, main, sx, sy, false, layerCanvas.height);
}
