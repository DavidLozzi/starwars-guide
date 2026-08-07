// Global knobs — PRD §10 tiers 1 (feel) and 2 (economy).
// Decimals for continuous quantities, integers only for discrete counts.

export const GLOBALS = {
  // --- Feel knobs (touched constantly) ---
  boltSpeed: 150.0,              // field units / sec — CLONE bolts and the default; droids override per type (planet droids.*.boltSpeed)
  saber: {
    radius: 32.0,                // deflect arc radius, field units
    blockChance: 0.82,           // per-bolt deflect roll inside radius (0-1)
    blockCapacity: 4,            // bolts per window (int) — burst throttle on top of blockChance
    overflowChance: 0.35,        // per-bolt roll once the window cap is full; does NOT consume the window
    leakLimit: 2,                // leaked bolts before the mercy window triggers (1 = first leak triggers)
    safetySec: 1.2,              // guaranteed-block duration once the mercy window triggers
    windowMs: 200.0,
  },
  jedi: {
    touchOffsetY: 70.0,          // finger offset so the sprite isn't under the thumb (touch only)
    followLerp: 14.0,            // per-second lerp factor toward pointer target
  },
  zones: {                       // fractions of FIELD_H (PRD §2 geometry)
    droidYMin: 0.05,
    droidYMax: 0.30,
    jediCeiling: 0.62,           // visible line; jedi cannot cross upward
    cloneYMin: 0.76,
    cloneYMax: 0.93,
    terrainBase: 0.74,           // cosmetic silhouette baseline
    scatterMinDist: 40.0,        // min spacing between scattered units, field units
  },
  waveEnd: 'killAll',            // 'killAll' | 'timer'
  waveTimerSec: 30.0,
  pressureRamp: 2,             // droid fireRate multiplier reached at rampSec into a wave
  pressureRampSec: 6.0,
  cloneFireRateMult: 0.85,     // campaign-wide scale on every planet's clone fireRate (<1 = clones shoot slower)
  waveClearHoldSec: 0.5,         // sim keeps running this long after the last droid dies, before the breather (PRD §8)
  breatherSec: 10.0,
  planetBreatherSec: 10.0,       // longer "bigger beat" between planets (PRD §8); not debug-shortened
  breatherFadeMs: 260,           // breather overlay fade-in
  planetClearRevealMs: 500,      // planet-clear beat 1 (CLEARED + name) holds this long before beat 2 fades in
  postPowerGraceSec: 0.2,        // sim freezes this long after a power is cast so the player can move their thumb back to the jedi

  // --- Economy knobs (tuned in bursts) ---
  forceBar: { capacity: 1000.0, resetOnDeath: true },
  earn: {
    waveClearBase: 10.0,
    survivorPerClone: 1.2,
    deflect: 1.4,
    bKill: 5.0,
    cloneDeathPauseSec: 2.0,     // "the Force recoils" — earning stalls briefly after a clone dies (PRD §4)
  },
  tiers: {                       // order matters: tier 1 → 4
    push:  { unlockAt: 150.0, useCost: 150.0 },
    block: { unlockAt: 400.0, useCost: 300.0 },
    crush: { unlockAt: 600.0, useCost: 500.0 },
    heal:  { unlockAt: 800.0, useCost: 650.0 },
  },
  discount: { perTierBelow: 0.05, minCost: 10.0 },  // cascading discount (PRD §6)

  powers: {
    push:  { radius: 70.0, stunSec: 10.0, knockback: 30.0 },
    block: { wallWidth: 140.0, wallHp: 30.0 },
    crush: { radius: 30.0 },
    heal:  { innerRadius: 34.0, outerRadius: 80.0, amount: 1.0, neighborAmount: 0.25, canRevive: false },
  },

  // --- Power-ups (PRD §19): scripted droid kills drop a collectible the jedi must catch ---
  // Deliberately global: a power-up behaves identically on every planet. Per-planet content is
  // only WHEN it drops (each planet's `powerups: [{ wave, kill, type, droidType }]`).
  // Type keys are the catalog in src/config/powerups.js.
  powerups: {
    enabled: true,
    fallSpeed: 110.0,              // field units / sec, top → bottom
    catchRadius: 22.0,             // jedi (or ally) centre → drop centre, field units
    spawnY: 8.0,                   // field units below the top edge where a drop enters
    types: {
      forceFull:  { fillFrac: 1.00, fillSec: 1.0 },   // fraction of forceBar.capacity, ramped over fillSec
      forceHalf:  { fillFrac: 0.50, fillSec: 1.0 },
      healAll:    { amount: 1.00 },                   // fraction of maxHp every live clone is restored to
      empower:    {
        durationSec: 5.0, accuracyMult: 2.0, deflectMult: 5.0, accuracyCap: 0.99,
        // The aura render/renderer.js paints around the jedi while it runs. Purely visual,
        // but it is the ONLY signal the buff is live, so it is tuned to be unmissable.
        glow: {
          color: '#ffc63b',
          haloRadius: 30.0,        // field units — outer edge of the radial halo
          haloAlpha: 0.55,         // peak alpha at the halo centre
          ringWidth: 2.5,          // field units — bright rim drawn at haloRadius
          blur: 16.0,              // base canvas shadowBlur on the sprite pass
          blurPulse: 10.0,         // ± added to blur by the pulse
          pulseHz: 6.0,            // radians/sec of the sin() pulse
          passes: 3,               // sprite re-draws; more passes = denser bloom
        },
      },
      secondYoda: { durationSec: 9.0, offsetX: 100.0, ally: 'yoda' },  // `ally` keys ALLY_JEDI in src/render/sprites.js
      ultimate:   { crushFrac: 0.25 },                // push magnitudes are reused from powers.push above
      badBatch:   {
        durationSec: 12.0,
        count: 4,                  // squad size (int)
        spread: 90.0,              // horizontal spread around field centre, field units
        y: 0.80,                   // fraction of FIELD_H
        hp: 8.0, damage: 3.0, accuracy: 0.8, fireRate: 0.9, jitter: 0.15,
      },
    },
  },

  score: { deflect: 10, bKill: 100, waveClear: 250, planetClear: 1000 },
  finalePlanet: 15,              // clearing this planet (1-based) triggers Order 66

  // --- Order 66 (PRD §18): the clones turn on the jedi over the still-live map ---
  order66: {
    turnDelaySec: 2.0,           // ORDER 66 banner holds before the clones open fire
    blockChance: 0.25,           // jedi block roll per incoming bolt — one roll per bolt, no mercy window
    fireIntervalSec: 1.1,        // seconds between shots, per clone
    fireJitter: 0.35,            // ± fraction applied to the interval
    staggerSec: 1.2,             // initial random cooldown spread so the volley isn't in lockstep
    deathHoldSec: 1.6,           // beat between the killing blow and the finale screen
  },

  // --- New-player coaching (DOM/UI layer — never read by sim/engine) ---
  // The first-use helper cards only teach a power AFTER it is tapped, so a player who never
  // notices the power buttons never learns the Force economy exists. This nudge fires once
  // ever, when powers are clearly affordable and still untouched.
  coach: {
    powerNudge: {
      enabled: true,
      readyCount: 2,          // fire once this many powers are affordable at the same time
      armDelaySec: 1.5,       // the condition must hold this long before the card appears
      highlightSec: 4.0,      // power buttons keep pulsing this long after the card is dismissed
    },
  },

  // --- Ads (non-gameplay screens only; DOM/UI layer — never read by sim/engine) ---
  ads: {
    enabled: true,
    client: 'ca-pub-6056590143595280',   // AdSense publisher (shared with hub starwars.guide)
    slot: '2081244130',                  // "clonedefense" ad unit
    // Fixed 320x50 mobile banner — NOT responsive/auto. A fixed unit is what keeps the ad
    // inside the HUD strip: `auto` served tall rectangles and anchor-format overlays that
    // escaped the .ad-banner clip. Sized to fit the narrowest device width (386px at a
    // 390px viewport) and the ~56px that survives max-height minus the iOS safe-area inset.
    width: 320,
    height: 50,
    // Every overlay screen carries the banner, pause included — which screens qualify is the
    // `:has(.screen.show)` selector in styles.css, not a list here.
    hideOnTitleUntilFirstRun: true,      // a brand-new visitor gets an ad-free home screen
  },

  // --- Datadog RUM (DOM/UI layer — never read by sim/engine) ---
  // The agent itself is loaded by the CDN snippet in index.html; these are the init options.
  // Every event name/attribute is catalogued in src/telemetry/events.js → dev/telemetry-reference.html.
  rum: {
    enabled: true,
    applicationId: '7401776c-bb20-4d3b-b106-38b52a5ade84',
    clientToken: 'pub43e1bb0221be17c7701c7d3f3ea805cb',
    site: 'datadoghq.com',
    service: 'clone-defense',
    devHosts: ['localhost', '127.0.0.1', ''],  // hostname match → env 'dev', anything else 'prod'
    sessionSampleRate: 100,                    // % of sessions captured
    sessionReplaySampleRate: 100,              // % of those with replay (canvas pixels are NOT recorded)
    trackResources: true,
    trackUserInteractions: true,               // Datadog's own click actions, alongside our custom ones
    trackLongTasks: true,
  },

  // --- Google Analytics 4 (DOM/UI layer — never read by sim/engine) ---
  // Same measurement id as the hub (starwars.guide, _includes/head.html), so the game's
  // traffic joins the rest of the brand in one property. The gtag library is loaded by the
  // CDN snippet in index.html; these are the init options applied in src/telemetry/ga.js.
  // Every event mirrors the Datadog catalog in src/telemetry/events.js — dots become
  // underscores (game.wave_cleared → game_wave_cleared) because GA4 forbids dots.
  ga: {
    enabled: true,
    measurementId: 'G-JYWS72F9R1',
    devHosts: ['localhost', '127.0.0.1', ''],  // hostname match → env 'dev'
    sendFromDevHosts: false,                   // true would pollute the hub's property with QA runs
    sendPageView: true,                        // GA4's automatic page_view on config
    debugMode: false,                          // true → events show in GA4 DebugView
  },
};

// Applied over GLOBALS/planets when the URL contains ?debug — QA smoke runs only.
export const DEBUG_OVERRIDES = {
  breatherSec: 3.0,
  earn: { waveClearBase: 200.0, survivorPerClone: 10.0, deflect: 20.0, bKill: 50.0, cloneDeathPauseSec: 2.0 },
  debugWaveSize: 3,              // cap droids per wave (int; applied to every wave of every planet)
};
