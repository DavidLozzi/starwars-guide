// Share card (PRD §9, §16, §18) — a purpose-built image, NOT a battlefield screenshot.
// "I LOST THE WAR AT" kicker over the planet name LARGE (the hook), "PLANET N" with
// no denominator, wave, score smaller,
// saber-color identity flair, Order 66 line on finale, app name + site URL.
// Palette comes from the DEATH planet's config — the colors themselves say how far you got.
// Console style: monospace, all-caps, bracketed frame, real Aurebesh watermark text
// (the "Aurebesh" web font declared in styles.css; loaded before the card is drawn).
//
// DOM/canvas is touched only inside functions — this module imports clean in Node.

// The game ships as a subdirectory of the hub repo (starwars.guide/clone-defense/),
// not its own subdomain — see CLAUDE.md "Brand position".
export const SITE_URL = 'starwars.guide/clone-defense/';

const APP_NAME = 'CLONE DEFENSE';
const CARD_W = 1080;
const CARD_H = 1350;
const MONO = '"Courier New", ui-monospace, Menlo, monospace';
const CONSOLE_GREEN = '#3bf07a'; // house console accent (PRD §18), used sparingly
const RED = '#ff4a4a';

// ---------------------------------------------------------------- helpers

function fmtScore(n) {
  return String(Math.max(0, Math.floor(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function spaced(s) { return s.split('').join(' '); }

/** Shrink font size until text fits maxWidth. Sets ctx.font; returns the px used. */
function fitFont(ctx, text, maxWidth, startPx, weight, minPx = 36) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${MONO}`;
  while (px > minPx && ctx.measureText(text).width > maxWidth) {
    px -= 4;
    ctx.font = `${weight} ${px}px ${MONO}`;
  }
  return px;
}

// Aurebesh font-family used as a decorative watermark (PRD §18: accent texture,
// never functional text). The "Aurebesh" face is a Latin→Aurebesh substitution font
// declared in styles.css and loaded before the card is drawn (see shareCard()).
const AUREBESH = '"Aurebesh", ' + MONO;

// Draw a left-aligned band of real Aurebesh (subtle console texture).
function drawAurebeshBand(ctx, text, x, y, px, color, alpha, spacing) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.font = `${px}px ${AUREBESH}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = spacing + 'px';
  ctx.fillText(text, x, y);
  ctx.letterSpacing = '0px';
  ctx.restore();
}

function drawCornerBrackets(ctx, x, y, w, h, len, color, lineW) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineW;
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
  ctx.stroke();
  ctx.restore();
}

/** Accept RUN_ENDED payload (0-based indices) or profile run shape (1-based). */
function normalizeRun(r) {
  const src = r || {};
  const planet = src.planet != null ? Number(src.planet)
    : (src.planetIndex != null ? Number(src.planetIndex) + 1 : 1);
  const wave = src.wave != null ? Number(src.wave)
    : (src.waveIndex != null ? Number(src.waveIndex) + 1 : 1);
  return {
    planet: planet || 1,
    wave: wave || 1,
    score: Number(src.score) || 0,
    cause: src.cause === 'finale' ? 'finale' : 'death',
  };
}

// ---------------------------------------------------------------- drawing

function drawCard(ctx, W, H, run, planetCfg, skin) {
  const pal = (planetCfg && planetCfg.palette) || {};
  const grad = Array.isArray(pal.bgGradient) && pal.bgGradient.length >= 2
    ? pal.bgGradient : ['#16181c', '#000000'];
  const accent = pal.accent || CONSOLE_GREEN;
  const planetName = (planetCfg && planetCfg.name) || 'UNKNOWN WORLD';
  const finale = run.cause === 'finale';

  // Background — death planet's gradient (PRD §16 tie-in).
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, grad[0]);
  bg.addColorStop(1, grad[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft accent glow behind the headline zone.
  const glow = ctx.createRadialGradient(W / 2, H * 0.36, 60, W / 2, H * 0.36, W * 0.75);
  glow.addColorStop(0, accent + '2e'); // ~18% alpha
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Scanlines — console texture.
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 0; y < H; y += 7) ctx.fillRect(0, y, W, 2);

  // Aurebesh watermark bands — real glyphs, subtle console texture (PRD §18).
  // Kept to the quiet zone below the header so they never crowd the score/saber.
  drawAurebeshBand(ctx, 'REPUBLIC BATTLE RECORD', 84, 300, 44, accent, 0.07, 8);
  drawAurebeshBand(ctx, 'GRAND ARMY OF THE REPUBLIC', 100, 362, 30, accent, 0.05, 6);

  // Console frame.
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, W - 84, H - 84);
  ctx.globalAlpha = 1;
  drawCornerBrackets(ctx, 42, 42, W - 84, H - 84, 64, accent, 9);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Header — transmission tag.
  ctx.fillStyle = accent;
  ctx.font = `bold 30px ${MONO}`;
  ctx.fillText(spaced('REPUBLIC BATTLE RECORD'), W / 2, 132);
  ctx.globalAlpha = 0.55;
  ctx.font = `26px ${MONO}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('// TRANSMISSION ' + (finale ? 'TERMINATED' : 'LOST') + ' //', W / 2, 178);
  ctx.globalAlpha = 1;

  // Planet name — LARGE, the hook.
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = accent;
  ctx.shadowBlur = 42;
  const namePx = fitFont(ctx, planetName, W - 200, 172, 'bold');
  ctx.fillText(planetName, W / 2, 470);
  ctx.shadowBlur = 0;

  // Kicker — the line that gives the planet name its meaning. Deliberately allowed to
  // sit on top of the Aurebesh watermark bands (300/362); it is offset from the fitted
  // headline height so a long, shrunk planet name never collides with it.
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.85;
  ctx.font = `36px ${MONO}`;
  ctx.fillText(spaced('I LOST THE WAR AT'), W / 2, 470 - namePx * 0.72 - 18);
  ctx.restore();

  // Subtitle — "PLANET N", no denominator (PRD §9: no fixed total advertised).
  ctx.fillStyle = accent;
  ctx.font = `bold 56px ${MONO}`;
  ctx.fillText(spaced('PLANET ' + run.planet), W / 2, 566);

  // Divider.
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 638); ctx.lineTo(W - 180, 638);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Wave reached.
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 78px ${MONO}`;
  ctx.fillText('WAVE ' + run.wave, W / 2, 760);

  // Score — secondary, smaller, value bold.
  ctx.globalAlpha = 0.75;
  ctx.font = `44px ${MONO}`;
  const scoreLabel = 'SCORE ';
  const scoreValue = fmtScore(run.score);
  const scoreLabelW = ctx.measureText(scoreLabel).width;
  ctx.font = `bold 44px ${MONO}`;
  const scoreValueW = ctx.measureText(scoreValue).width;
  const scoreX = W / 2 - (scoreLabelW + scoreValueW) / 2;
  ctx.textAlign = 'left';
  ctx.font = `44px ${MONO}`;
  ctx.fillText(scoreLabel, scoreX, 836);
  ctx.font = `bold 44px ${MONO}`;
  ctx.fillText(scoreValue, scoreX + scoreLabelW, 836);
  ctx.textAlign = 'center';
  ctx.globalAlpha = 1;

  // Identity flair — saber beam in the player's color + skin name (PRD §11).
  const saber = (skin && skin.saberColor) || '#3b9dff';
  const skinName = (skin && skin.name) || 'PADAWAN';
  const beamY = 980;
  const beamW = 480;
  const bx = (W - beamW) / 2;
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.font = `24px ${MONO}`;
  ctx.fillText(spaced('PLAYED AS'), W / 2, beamY - 44);
  ctx.globalAlpha = 1;
  ctx.save();
  // hilt
  ctx.fillStyle = '#9aa0a6';
  ctx.fillRect(bx - 58, beamY - 11, 52, 22);
  ctx.fillStyle = '#3c4043';
  ctx.fillRect(bx - 40, beamY - 15, 12, 30);
  // blade glow
  ctx.shadowColor = saber;
  ctx.shadowBlur = 34;
  ctx.fillStyle = saber;
  ctx.fillRect(bx, beamY - 7, beamW, 14);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(bx, beamY - 2, beamW, 4);
  ctx.restore();
  ctx.fillStyle = saber;
  ctx.font = `bold 36px ${MONO}`;
  ctx.fillText(spaced(skinName), W / 2, beamY + 74);

  // Order 66 line — only on the finale (the genuinely shareable beat, PRD §9).
  // Sits in the band between the skin name (baseline 1054) and the footer (H-156):
  // headline is fit-shrunk to the frame's inner width so the letter-spaced form
  // never runs past the console border.
  if (finale) {
    ctx.save();
    ctx.fillStyle = RED;
    ctx.shadowColor = RED;
    ctx.shadowBlur = 30;
    const order = spaced('ORDER 66 EXECUTED');
    fitFont(ctx, order, W - 240, 58, 'bold', 28);
    ctx.fillText(order, W / 2, 1112);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.8;
    const sub = 'THE CLONES TURNED. THE REPUBLIC FELL.';
    fitFont(ctx, sub, W - 240, 28, 'normal', 18);
    ctx.fillText(sub, W / 2, 1152);
    ctx.restore();
  }

  // Footer — app name + site URL (reaches non-players; PRD §17).
  ctx.fillStyle = accent;
  ctx.font = `bold 40px ${MONO}`;
  ctx.fillText(spaced(APP_NAME), W / 2, H - 156);
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.7;
  ctx.font = `32px ${MONO}`;
  ctx.fillText(SITE_URL, W / 2, H - 108);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- public API

/**
 * Render the share card to a fresh offscreen canvas (1080x1350) and return it.
 * runResult: RUN_ENDED payload or profile run shape. planetCfg: death planet's config.
 * skin: { id, name, saberColor }. Browser-only (needs document); import stays headless-safe.
 */
export function renderCardCanvas(runResult, planetCfg, skin) {
  if (typeof document === 'undefined') {
    throw new Error('renderCardCanvas requires a DOM (browser only)');
  }
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  drawCard(ctx, CARD_W, CARD_H, normalizeRun(runResult), planetCfg, skin);
  return canvas;
}

/**
 * Render → blob → navigator.share({ files }) with a download-link fallback (PRD §9).
 * Resolves 'shared' | 'downloaded' | 'cancelled'.
 */
export async function shareCard(runResult, planetCfg, skin) {
  // Ensure the Aurebesh watermark face is available to the canvas before drawing.
  if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
    try { await document.fonts.load('40px Aurebesh'); } catch { /* fall back to mono */ }
  }
  const canvas = renderCardCanvas(runResult, planetCfg, skin);
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('share card toBlob failed'))), 'image/png');
  });
  const fileName = 'jedi-defense-' + ((planetCfg && planetCfg.id) || 'run') + '.png';
  const run = normalizeRun(runResult);
  const planetName = (planetCfg && planetCfg.name) || 'an unknown world';
  const text = run.cause === 'finale'
    ? `Order 66 found me on ${planetName}. Play Clone Defense: https://${SITE_URL}`
    : `My last stand: ${planetName}, wave ${run.wave}. Beat it: https://${SITE_URL}`;

  try {
    if (typeof navigator !== 'undefined' && navigator.share && typeof File !== 'undefined') {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: APP_NAME, text });
        return 'shared';
      }
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return 'cancelled';
    // Any other share failure → fall through to download.
  }

  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'downloaded';
}
