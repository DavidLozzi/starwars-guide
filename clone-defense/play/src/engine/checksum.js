// Small 32-bit string/int hashing helpers. Pure math — no DOM, no state, safe under Node.

/** FNV-1a over UTF-16 code units → uint32. */
export function h32(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Fold two uint32s into one. */
export function blend(a, b) {
  return Math.imul(a ^ b, 0x27220a95) >>> 0;
}

/** LCG keystream of `n` bytes from a uint32 seed. */
export function stream(seed, n) {
  let s = seed >>> 0;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out[i] = (s >>> 24) & 0xff;
  }
  return out;
}
