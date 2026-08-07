// RNG helpers. Gameplay variance uses Math.random (PRD wants variety, not determinism).
// A seeded LCG is provided for anything that must be reproducible (e.g. terrain shape).

export function rand(a, b) {
  return a + Math.random() * (b - a);
}

export function randInt(a, b) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

/** Pick a uniformly random element, or null if empty. */
export function pick(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

export function chance(p) {
  return Math.random() < p;
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Seeded LCG → () => [0,1). Same seed → same stream. */
export function seededRng(seed) {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
