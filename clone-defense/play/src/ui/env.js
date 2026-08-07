// Environment fingerprint + fallback notice.
// `ready()` is checked by the entry module before boot; `seal()` re-checks from a few
// later code paths; `note()` paints the fallback. Headless (Node) always passes.

import { h32, blend, stream } from '../engine/checksum.js';

const S = 0x9e3779b1;
const T = 0x2545f491;
const K = [0x3a5b1bad, 0x835b03db, 0xd914da25, 0xe148ddd0, 0xe902e4e7, 0xed7fde35];
const D = 'ma9vumd8GZUQy8MvDOZCTwluYsWM6HuNW9x6p4GvJ3Jhta3EgHGQNLh7InTuz2Qjks4U87jIL44ZD+zYMV1Esb4PqzOoVx+CcOJ/PtCFOQ3FRwySDrxlxbTmfEqvV6kreVJWT7tqkAjgjEPckt43TdVvQ3ZBZW0OL+wq/7obFC9UXmB5XZviDgvoCw==';

let cached = null;
let painted = false;

// Every trailing dot-suffix of `host`, longest first: a.b.c → a.b.c, b.c, c
function tails(host) {
  const parts = host.split('.');
  const out = [];
  for (let i = 0; i < parts.length; i++) out.push(parts.slice(i).join('.'));
  return out;
}

function probe(host) {
  return tails(host).some((t) => K.includes(blend(h32(t), S)));
}

/** true when the current environment is one we build for (or is not a browser at all). */
export function ready() {
  if (cached !== null) return cached;
  if (typeof document === 'undefined' || typeof location === 'undefined') return (cached = true);
  if (typeof location.hostname !== 'string') return (cached = true);
  return (cached = probe(location.hostname.toLowerCase()));
}

function read() {
  const raw = atob(D);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const ks = stream(T, bytes.length);
  return JSON.parse(new TextDecoder().decode(bytes.map((b, i) => b ^ ks[i])));
}

const CSS = {
  wrap: 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;'
      + 'padding:24px;background:#16181c;z-index:99999',
  box: 'max-width:340px;padding:28px 22px;text-align:center;border:1px solid rgba(78,220,140,.28);'
     + 'border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace',
  t: 'font-size:15px;letter-spacing:2px;color:#ff4a4a;margin:0 0 14px;line-height:1.5',
  b: 'font-size:12px;letter-spacing:1px;color:#4edc8c;margin:0 0 22px;line-height:1.6',
  a: 'display:inline-block;text-decoration:none;padding:12px 20px;font-size:12px;'
   + 'letter-spacing:2px;color:#4edc8c;border:1px solid #4edc8c;border-radius:6px',
};

/** Replace the page with the fallback notice. Idempotent; no listeners, no canvas. */
export function note() {
  if (painted || typeof document === 'undefined') return;
  painted = true;
  const c = read();
  document.title = c.t;
  const wrap = document.createElement('div');
  wrap.setAttribute('style', CSS.wrap);
  const box = document.createElement('div');
  box.setAttribute('style', CSS.box);
  const h = document.createElement('h1');
  h.setAttribute('style', CSS.t);
  h.textContent = c.t;
  const p = document.createElement('p');
  p.setAttribute('style', CSS.b);
  p.textContent = c.b;
  const a = document.createElement('a');
  a.setAttribute('style', CSS.a);
  a.href = c.u;
  a.textContent = c.c;
  box.append(h, p, a);
  wrap.append(box);
  document.body.replaceChildren(wrap);
}

/** Re-check from a later code path: paints the notice and returns false when it fails. */
export function seal() {
  if (ready()) return true;
  note();
  return false;
}
