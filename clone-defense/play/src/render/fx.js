// FX pool drawing (PRD §12 gameplay layer). The pool lives in sim state; entries are
// { active, type, x, y, life, maxLife } with life counting DOWN to 0 (prototype
// convention). p = life/maxLife is the remaining fraction: alpha fades with p,
// rings expand as (1 - p). Constant fillStyle strings + globalAlpha — no per-frame
// string building or allocation.

const SPARK = '#fff8c8';
const RING = '#3bf07a';
const CRUSH = '#ff5050';
const HEAL = '#78ffa0';
const PICKUP = '#ffffff';
const SURGE = '#ffc63b';

const TAU = Math.PI * 2;

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Draw every active fx. sx/sy = field→canvas scale; s = uniform radius scale. */
export function drawFx(ctx, fxPool, sx, sy) {
  const s = sx < sy ? sx : sy;
  for (let i = 0; i < fxPool.length; i++) {
    const f = fxPool[i];
    if (!f.active) continue;
    const p = clamp01(f.maxLife > 0 ? f.life / f.maxLife : 0);
    const cx = f.x * sx;
    const cy = f.y * sy;
    if (f.type === 'spark') {
      // deflect flash — bright dot that shrinks out
      ctx.globalAlpha = p;
      ctx.fillStyle = SPARK;
      ctx.beginPath();
      ctx.arc(cx, cy, (2 + 5 * p) * s, 0, TAU);
      ctx.fill();
    } else if (f.type === 'ring') {
      // push shockwave — expanding green ring
      ctx.globalAlpha = 0.9 * p;
      ctx.strokeStyle = RING;
      ctx.lineWidth = Math.max(1, 2 * s);
      ctx.beginPath();
      ctx.arc(cx, cy, (10 + 60 * (1 - p)) * s, 0, TAU);
      ctx.stroke();
    } else if (f.type === 'crush') {
      // crush implosion — red blot collapsing in
      ctx.globalAlpha = p;
      ctx.fillStyle = CRUSH;
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * p * s, 0, TAU);
      ctx.fill();
    } else if (f.type === 'pickup') {
      // power-up caught — white flash ring snapping outward (§19)
      ctx.globalAlpha = p;
      ctx.strokeStyle = PICKUP;
      ctx.lineWidth = Math.max(1, 3 * p * s);
      ctx.beginPath();
      ctx.arc(cx, cy, (4 + 34 * (1 - p)) * s, 0, TAU);
      ctx.stroke();
    } else if (f.type === 'surge') {
      // buff activating — warm aura swelling around the unit it landed on (§19)
      ctx.globalAlpha = 0.7 * p;
      ctx.strokeStyle = SURGE;
      ctx.lineWidth = Math.max(1, 2 * s);
      ctx.beginPath();
      ctx.arc(cx, cy, (6 + 26 * (1 - p)) * s, 0, TAU);
      ctx.stroke();
    } else if (f.type === 'heal') {
      // heal pulse — soft expanding green ring
      ctx.globalAlpha = 0.8 * p;
      ctx.strokeStyle = HEAL;
      ctx.lineWidth = Math.max(1, 2 * s);
      ctx.beginPath();
      ctx.arc(cx, cy, (8 + 48 * (1 - p)) * s, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
