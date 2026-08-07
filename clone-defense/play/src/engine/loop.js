// requestAnimationFrame loop with dt clamp + auto-pause on tab hide.
// The ONLY engine module that touches window/document (CONTRACTS ground rules).

const MAX_DT = 0.05; // clamp long frames (tab switch, GC) so the sim never leaps

/**
 * @param {(dt:number)=>void} onFrame  called each frame with clamped dt (seconds)
 * @returns {{ start(): void, stop(): void }}
 */
export function createLoop(onFrame) {
  let last = 0;
  let raf = 0;
  let running = false;

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min(MAX_DT, (now - last) / 1000) : 0;
    last = now;
    onFrame(dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // Reset the timestamp when returning to the tab so the first frame back has a sane dt.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) last = 0;
      else last = 0;
    });
  }

  return { start, stop };
}
