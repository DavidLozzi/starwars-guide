// Bottom AdSense banner — shown ONLY on non-gameplay overlay screens, overlaying the
// HUD/Force-powers strip. Pure DOM/UI: all document/window access is inside functions so
// this module stays import-clean and is never pulled into the headless sim/engine boundary.
//
// Visibility is CSS-driven (styles.css): `.device:has(.screen.show) .ad-banner` — every overlay
// screen, pause included. The <ins> is pushed to AdSense exactly ONCE at init — screen changes
// only toggle CSS visibility, never re-push (re-pushing a filled slot throws "already have ads
// in this slot").

let initialised = false;

// Builds the banner inside #hud and asks AdSense to fill it once.
// config.globals.ads: { enabled, client, slot, width, height, hideOnTitleUntilFirstRun }
export function initAds({ config, meta } = {}) {
  if (initialised) return;
  const ads = config && config.globals && config.globals.ads;
  if (!ads || !ads.enabled) return;
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const hud = document.getElementById('hud');
  if (!hud) return;

  // A first-time visitor meets the game, not an ad: the banner stays off the title screen until
  // they have a run behind them. Decided ONCE at boot, not re-checked per screen — finishing a
  // run mid-session shouldn't retro-add an ad to the home screen they already saw, and by their
  // next visit `runs` is non-empty so it shows normally.
  const firstVisit = !!ads.hideOnTitleUntilFirstRun
    && !!meta && !!meta.profile && (meta.profile.runs || []).length === 0;
  const device = document.getElementById('device');
  if (device) device.classList.toggle('ad-first-visit', firstVisit);

  const banner = document.createElement('div');
  banner.className = 'ad-banner';

  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  // Fixed-size unit: inline-block + explicit px, and deliberately NO data-ad-format /
  // data-full-width-responsive — either of those makes AdSense ignore the dimensions and
  // serve a responsive unit again (tall rectangles, anchor overlays). `.ad-banner`'s
  // text-align:center centers the inline-block inside the strip.
  ins.style.display = 'inline-block';
  ins.style.width = ads.width + 'px';
  ins.style.height = ads.height + 'px';
  // dataset.* maps to the data-ad-* attributes AdSense reads (data-ad-client, etc.).
  ins.dataset.adClient = ads.client;
  ins.dataset.adSlot = ads.slot;

  banner.appendChild(ins);
  hud.appendChild(banner);

  // Opt this page OUT of Google Auto ads' anchor/vignette overlays. Those are injected as
  // position:fixed elements straight into <body> — independent of the .ad-banner unit above
  // and its CSS clipping — and are what produce a huge ad pinned over the whole screen if
  // Anchor ads is enabled account-side. Must be its own push (before or after the fill push;
  // order doesn't matter to the adsbygoogle queue).
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({ overlays: { bottom: false } });
  } catch (err) {
    console.warn('[jedi-defense] AdSense overlay opt-out failed', err);
  }

  // Fill once. Wrapped so a missing/blocked adsbygoogle.js (e.g. offline, ad blocker) never
  // breaks boot — the empty banner just stays hidden by CSS until an overlay screen appears.
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    initialised = true;
  } catch (err) {
    console.warn('[jedi-defense] AdSense push failed', err);
  }
}
