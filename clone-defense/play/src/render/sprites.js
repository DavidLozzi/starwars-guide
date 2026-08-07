// Placeholder 16-bit pixel sprites (PRD §18) — pixel-map strings baked to offscreen
// canvases. Nothing here touches the DOM at import time; canvas creation happens only
// inside createSprites() so this module stays importable headless (contract ground rule).

import { POWERUP_KEYS } from '../config/powerups.js';

/**
 * Ally jedi summoned by a power-up (PRD §19). Deliberately NOT in src/meta/skins.js: allies
 * must never be offered to the player as an equippable skin, and the renderer blits their own
 * sprite rather than bakeJedi(), so the player's equipped skin can never leak onto them.
 * `saberColor` tints the deflect arc and MUST equal that sprite's palette `S`.
 */
export const ALLY_JEDI = {
  yoda: { name: 'YODA', saberColor: '#5fe86f' },
};

// Power-up pickup icons — one MAPS/PALETTES entry per key (src/config/powerups.js).
// A key with no literal art falls back to the generic `powerup` base below.
export const POWERUP_TYPES = POWERUP_KEYS;

// Per-sprite palettes. Sprites hold identity across planets (PRD §18) — planet
// palettes never tint these.
export const PALETTES = {
  jedi: { r: '#5a3a1e', R: '#7a5028', s: '#e0b088', b: '#2a3550', S: '#3b9dff', k: '#1a1208' },
  clone: { w: '#dfe6ee', W: '#ffffff', g: '#9aa6b2', v: '#2f6fb0', V: '#4f9fe0', k: '#20242a' },
  // Dead skin = same map, desaturated greys (PRD §2: dead clones stay on the field).
  cloneDead: { w: '#4a4f55', W: '#5a6066', g: '#3a3f44', v: '#33383d', V: '#3d4248', k: '#17191c' },
  battle: { T: '#c9a86a', d: '#5b4a26', e: '#ff3b3b', a: '#232323' },
  super: { G: '#7b8592', d: '#333a44', e: '#ff4040', C: '#1c1f24' },
  sniper: { t: '#a08234', T: '#c9a94e', d: '#5f4c1c', e: '#ff4040', r: '#2f333b', R: '#59606c', s: '#8fd4ff' },
  spider: { b: '#7d6a4f', B: '#a08a63', d: '#4a3e2c', e: '#ff4040', l: '#5c5040', L: '#78694f' },
  // Hand-authored per-type overrides (Sprite Editor). Take precedence over the
  // archetype-base placeholder for these names only — see the skip check below.
  B1: { T: '#c9a86a', d: '#5b4a26', e: '#ff3b3b', a: '#232323', b: '#831100' },
  stap: { T: '#c9a86a', d: '#5b4a26', e: '#ff3b3b', a: '#232323', b: '#002e7a' },
  b00m: { T: '#c9a86a', d: '#5b4a26', e: '#ff3b3b', a: '#232323', b: '#fffc41' },
  b00m2: { T: '#c9a86a', d: '#5b4a26', e: '#ff3b3b', a: '#232323', b: '#831100' },
  B2: { G: '#7b8592', d: '#333a44', e: '#b51a00', C: '#1c1f24' },
  commando: { T: '#606060', d: '#5b4a26', e: '#b51a00', a: '#232323', b: '#583400', c: '#aaaaaa' },
  pdroideka: { t: '#7a7a7a', T: '#232323', d: '#606060', e: '#ff4040' },
  qdroideka: { t: '#7a7a7a', T: '#232323', d: '#606060', e: '#ff4040', a: '#10718b' },
  ig86: { t: '#444444', T: '#606060', d: '#000000', e: '#ff4040' },
  sdk4: { b: '#606060', B: '#7a7a7a', d: '#444444', e: '#ff4040', l: '#435945', L: '#4f786c' },
  octuptarra: { b: '#4f7d6e', B: '#63a08f', d: '#2c4a41', e: '#ff4040', l: '#435945', L: '#4f786c' },
  dwarf: { b: '#7a7a7a', B: '#606060', e: '#ff4040', l: '#2f2f2f', L: '#444444' },
  ig100: { p: '#d8dadd', g: '#5a6068', G: '#767d86', d: '#2c2f33', e: '#ff2b2b', s: '#8a8f96', a: '#7b219f', b: '#d357fe' },
  // Ally jedi (PRD §19). S must equal the matching ALLY_JEDI saberColor.
  yoda: { S: '#5fe86f', s: '#9fd18a', r: '#4a3c22', R: '#6b5730', b: '#2a3550', k: '#1a1208' },
  // Power-up pickup icons — o outline, f fill, h highlight.
  powerup: { o: '#3a3f46', f: '#c9d3de', h: '#ffffff' },
  forceFull: { o: '#1d6b3a', f: '#3bf07a', h: '#d6ffe6', a: '#fffb00' },
  forceHalf: { o: '#1d6b3a', f: '#3bf07a', h: '#d6ffe6', a: '#f5ec00' },
  healAll: { o: '#7a1f1f', f: '#ff6b6b', h: '#ffd6d6' },
  empower: { o: '#7a5a10', f: '#ffc63b', h: '#fff0c0' },
  secondYoda: { o: '#2a3550', f: '#5fe86f', h: '#d6ffd8' },
  ultimate: { o: '#5a1f7a', f: '#c86bff', h: '#f0d6ff' },
  badBatch: { o: '#20242a', f: '#9aa6b2', h: '#dfe6ee', a: '#831100' },
};

export const MAPS = {
  // Slim jedi with a raised right arm holding the saber on a diagonal (no white tip).
  // Cells: S saber, b hilt, s skin, r robe-dark, R robe-light. Recolored per skin (bakeJedi).
  jedi: [
    '.............S',
    '............SS',
    '...........SS.',
    '....sss...SS..',
    '....sss..SS...',
    '....rrr..S....',
    '...rrrR..b....',
    '..rrrRRRsb....',
    '..rrRRRRs.....',
    '..rrRRRR......',
    '..ssRRRR......',
    '...rrRRR......',
    '...rrRRr......',
    '...rr.rr......',
    '...rr.rr......',
  ],
  // Ally jedi: short, broad-eared, green blade held high (PRD §19). Same 14x15 frame as
  // `jedi` so it drops into the same draw path, but it is never recolored by a skin.
  yoda: [
    '.............S',
    '............S.',
    '...........S..',
    '..........S...',
    '.........S....',
    '........b.....',
    '..s.....s.....',
    '..sssssss.....',
    '...skssks.....',
    '....sss..s....',
    '...rRRRr......',
    '..rRRRRRr.....',
    '..rRRRRRr.....',
    '...rRRRr......',
    '...ss.ss......',
  ],
  clone: [
    '.....W........',
    '...WWWWW......',
    '..WvvvvvW.....',
    '..WWVVVWW.....',
    '..WWWVWWW.....',
    '...wwwww......',
    '..wgggggw.....',
    '.wWWWwWWw.....',
    '.wWWWwWWw.....',
    '.kkkkWWWW.....',
    '..kWWWWW......',
    '..WW..WW......',
    '..WW..WW......',
    '..WW..WW......',
    '..............',
  ],
  // BATTLE archetype base — thin flat-headed chassis, red visor (Sprite Editor).
  battle: [
    '......TTT......',
    '......TTT......',
    '......TTT......',
    '......TTT......',
    '.......T.......',
    '....TdddddT....',
    '....T.d.d.T....',
    '....aaaaT.d....',
    '....a..T.......',
    '.....TdddT.....',
    '.....dTTTd.....',
    '.....d...d.....',
    '.....d...d.....',
    '.....d...d.....',
    '....dd...dd....',
  ],
  // SUPER archetype base — B2 super battle droid: chevron head, forearm cannons.
  super: [
    '......GGG......',
    '.....GGdGG.....',
    '....GGGdGGG....',
    '...dGGGGGeGd...',
    '..CdGGGGGGGdC..',
    '..CdGGCdCGGdC..',
    '.CC.G.d.d.G.CC.',
    '.C...dCdCd...C.',
    '.....GGGGG.....',
    '......ddd......',
    '......ddd......',
    '......d.d......',
    '......d.d......',
    '......d.d......',
    '.....dd.dd.....',
  ],
  // Sniper droid — B1-thin silhouette with a full-width rifle and scope glint.
  sniper: [
    '.....TT.......',
    '.....TT.......',
    '.....dd.......',
    '....eTTe......',
    '.....TT.......',
    '..s..TT.......',
    'rrrrrTTrrrrrr.',
    '....dTTd......',
    '.....TT.......',
    '....dTTd......',
    '....t..t......',
    '.....dd.......',
    '....TTTT......',
    '...dT..Td.....',
    '...t....t.....',
  ],
  // Spider droid — wide low dome with red eye cluster and four splayed legs.
  spider: [
    '.....BBBBBB.....',
    '....BbbbbbbB....',
    '...BbbdeedbbB...',
    '...bbbbbbbbbb...',
    '....dbbbbbbd....',
    '..Ll.dbbbbd.lL..',
    '.Ll..d....d..lL.',
    '.l...L....L...l.',
    'll...L....L...ll',
    'l...lL....Ll...l',
    'l...l......l...l',
    '....l......l....',
  ],

  // Hand-authored per-type overrides (Sprite Editor) — paired with the PALETTES
  // entries above. Precedence handled by the skip check in the placeholder loop below.
  B1: [
    '......TTT......',
    '......TTT......',
    '......TTT......',
    '......TTT......',
    '.......T.......',
    '....TTdddTT....',
    '....T.TTT.T....',
    '....d.TTT.d....',
    '.......T.......',
    '.....TdddT.....',
    '.....dTTTd.....',
    '.....d...d.....',
    '.....d...d.....',
    '.....d...d.....',
    '....dd...dd....',
  ],
  stap: [
    '......TbT......',
    '......Tbb......',
    '......TTb......',
    '......TTT......',
    '.......T.......',
    '....TdddddT....',
    '....T.TTT.T....',
    '....d.TTT.d....',
    '.......T.......',
    '.....bbbbb.....',
    '.....bbTTd.....',
    '.....d...d.....',
    '.....d...d.....',
    '.....d...d.....',
    '....dd...dd....',
  ],
  b00m: [
    '......bbb......',
    '......TbT......',
    '......TTT......',
    '......TTT......',
    '.......T.......',
    '....TdddddT....',
    '....T.TbT.T....',
    '....d.bbb.d....',
    '.......b.......',
    '.....TdddT.....',
    '.....dTTTd.....',
    '.....d...d.....',
    '.....d...d.....',
    '.....d...d.....',
    '....dd...dd....',
  ],
  b00m2: [
    '......TTT......',
    '......TTT......',
    '......TTT......',
    '......TTT......',
    '.......T.......',
    '....bbbbbbb....',
    '....T.bbb.T....',
    '....d.TTT.d....',
    '.......T.......',
    '.....TdddT.....',
    '.....dTTTd.....',
    '.....d...d.....',
    '.....d...d.....',
    '.....d...d.....',
    '....dd...dd....',
  ],
  B2: [
    '......GGG......',
    '.....GGdGG.....',
    '....GGGdGGG....',
    '.GGdGGGGGeGd...',
    '.GGdGGGGGGGdG..',
    '...dGGCdCGGdG..',
    '....G.d.d.G.GG.',
    '.....dCdCd...G.',
    '.....GGGGG...G.',
    '......ddd......',
    '......ddd......',
    '......d.d......',
    '......d.d......',
    '......d.d......',
    '.....dd.dd.....',
  ],
  commando: [
    '......TTT......',
    '......cTc......',
    '......TTT......',
    '......TbT......',
    '.......T.......',
    '....TbTTebT....',
    '....T.TTT.T....',
    '....b.aaa.b....',
    '.......a.......',
    '.....TbaaT.....',
    '.....TaabT.....',
    '.....T...T.....',
    '.....b...b.....',
    '.....T...T.....',
    '....TT...TT....',
  ],
  pdroideka: [
    '......TT......',
    '......TT......',
    '......dd......',
    '.....eTTe.....',
    '......TT......',
    '......Te......',
    '..ddddTTdddd..',
    '.dT..TTTT..Td.',
    '.d....TT....d.',
    '.T....TT....T.',
    '......dd......',
    '......dd......',
    '.....TTTT.....',
    '....dT..Td....',
    '....t....t....',
  ],
  qdroideka: [
    '.....aaaa.....',
    '...a..TT..a...',
    '......dd...a..',
    '.a...eTTe...a.',
    '......TT......',
    'a.....Te.....a',
    'a.ddddTTdddd.a',
    '.dT..TTTT..Td.',
    '.d....TT....da',
    'aT....TT....T.',
    'a.....dd.....a',
    '......dd......',
    '.a...TTTT...a.',
    '....dT..Td.a..',
    '...ad....d....',
  ],
  ig86: [
    '......T.......',
    '.....ttt......',
    '.....TTT......',
    '.....ttt......',
    '.....ete......',
    '.....ttt......',
    '......T.......',
    '...TtTTTtT....',
    '...TtTTTtT....',
    '...T.TTT.T....',
    '...ddddT.T....',
    '...d.tTt.T....',
    '.....tTt......',
    '...ttttttt....',
    '...ttTTttt....',
    '...T.....T....',
    '...T.....T....',
    '...T.....T....',
    '...t.....t....',
    '..ttt...ttt...',
  ],
  sdk4: [
    '......bbbb......',
    '.....bdeedb.....',
    '.....bbbbbb.....',
    '.....bbbbbb.BBBB',
    '.BBBB.bbbb.Bb...',
    'Bb...B.B..B.....',
    '....Bb.B..bB....',
    '...Bb..B.B.bB...',
    '..Bb..Bb.B..bB..',
    '..B...B..B...B..',
    '..b...b..b...b..',
    '................',
  ],
  octuptarra: [
    '......bbbb......',
    '.....bdeedb.....',
    '.....bbbbbb.....',
    '.....bbbbbb.....',
    '......bbbb......',
    '.....B.B..B.....',
    '....Bb.B..bB....',
    '...Bb..B...bB...',
    '..Bb...bB...bB..',
    '..B.....B....B..',
    '..b.....b....b..',
    '................',
  ],
  dwarf: [
    '.....BBBBBB.....',
    '....BbbbbbbB....',
    '....blellelb....',
    '....bbbbbbbb....',
    '....lbbBbbbl....',
    '..Ll.bbbbbb.lL..',
    '.Ll..lbbbbl..lL.',
    'bl...L....L...lb',
    'll...L....L...ll',
    'l...lL....Ll...l',
    'l...l......l...l',
    '....l......l....',
  ],
  ig100: [
    '......ppp......',
    '......eGe......',
    '......ggg......',
    '.....GgggG.....',
    '.b..gg.g.gg..ab',
    'asssssssssssasb',
    'b.a.gg.g.gg.b.a',
    '.....GgggG.....',
    '......ggg......',
    '......g.g......',
    '......g.g......',
    '.....gg.gg.....',
    '.....d...d.....',
    '.....d...d.....',
    '....dd...dd....',
  ],

  // --- Power-up pickup icons (PRD §19), 12x12. `powerup` is the fallback for any key in
  // src/config/powerups.js that has no hand-authored icon yet.
  powerup: [
    '....oooo....',
    '..oohhhhoo..',
    '.ohffffffho.',
    '.offfffffo..',
    'ohffffffffho',
    'ohffffffffho',
    'ohffffffffho',
    'ohffffffffho',
    '.offfffffo..',
    '.ohffffffho.',
    '..oohhhhoo..',
    '....oooo....',
  ],
  // Full meter, brimming over the top.
  forceFull: [
    '.....hhh....',
    '....hhfhh...',
    '...ooooooo..',
    '...offfffo..',
    '...ofaaafo..',
    '...ofafffo..',
    '...ofaaffo..',
    '...ofafffo..',
    '...ofafffo..',
    '...offfffo..',
    '...ooooooo..',
    '............',
  ],
  // Same meter, filled to the halfway mark.
  forceHalf: [
    '............',
    '............',
    '...ooooooo..',
    '...o.....o..',
    '...o.aaa.o..',
    '...o.a...o..',
    '...ohaahho..',
    '...ofafffo..',
    '...ofafffo..',
    '...offfffo..',
    '...ooooooo..',
    '............',
  ],
  healAll: [
    '....ooo.....',
    '....ofo..oo.',
    '....ofo..oo.',
    '.oooofo.o...',
    '.offffoo....',
    '.oooooooooo.',
    '.....o.oo...',
    '....o..oo...',
    '..oo...oo...',
    '..oo...o....',
    '............',
    '............',
  ],
  // Double chevron — the surge of a battle meditation.
  empower: [
    '.....f......',
    '..f.fff.f...',
    '.fo.fff..f..',
    '.fo..fo..f..',
    'ff...f...ff.',
    'ff...f...ff.',
    'fff..f..ffo.',
    '.fffffffff..',
    '.ffffffffo..',
    '..ffffffo...',
    '...ooooo....',
    '............',
  ],
  // A second blade, ignited.
  secondYoda: [
    '..............',
    '............f.',
    '...........ff.',
    '.....oo...ff..',
    '....oooo.ff...',
    '.....oo..f....',
    '....oooo.h....',
    '....oooooh....',
    '....oooo......',
    '....oooo......',
    '....ooo.......',
    '..............',
  ],
  ultimate: [
    'h.........h.',
    '.ff...h...f.',
    '.f.....f..f.',
    '.f.f...f...f',
    'f...f.f...f.',
    'fh...ff..f..',
    '.f...f...f..',
    '..f..f..f...',
    '..f..f..f...',
    '..f.....f...',
    '...fff..f...',
    '...fhh.fh...',
  ],
  badBatch: [
    '...oooooo...',
    '..ohhoohho..',
    '.ohhhhhhhho.',
    '.ohaahhaaho.',
    '.ohhhhhhhho.',
    '.oooohhoooo.',
    '.ohoohhooho.',
    '.ohhhhhhhho.',
    '.ohhhoohhho.',
    '..ohohhoho..',
    '..oohhhhoo..',
    '...oooooo...',
  ],
};

// ---------------------------------------------------------------------------
// Per-type sprite registry. Every named clone/droid type across the 15 planets
// gets its OWN editable MAPS + PALETTES entry (keyed by its config type name),
// so the sprite editor can paint each one independently and each renders distinct
// art. Entries start as a deep copy of the type's archetype-family base art with a
// deterministic per-name hue tint — placeholder identity that can then be hand-
// authored in the Sprite Editor Artifact (see CLAUDE.md). `archetype` (config) stays the badge/tier
// bucket only; ART is keyed by the type name, not the archetype.

// droid type name → archetype-family base art (one of the 4 literal maps above)
export const DROID_ARCH = {
  B1: 'battle', stap: 'battle', b00m: 'battle', b00m2: 'battle',
  B2: 'super', commando: 'super', ig100: 'super',
  pdroideka: 'sniper', qdroideka: 'sniper', ig86: 'sniper',
  dwarf: 'spider', sdk4: 'spider', octuptarra: 'spider',
};
// clone type names (all share the base `clone` silhouette until hand-authored).
// `badbatch` is the temporary squad the badBatch power-up deploys (PRD §19) — a clone type
// for art purposes only; it never appears in a planet roster.
export const CLONE_TYPES = ['shiny', 'trooper', 'veteran', 'scuba', 'arc', 'rebel', 'cguard', 'badbatch'];

function hashName(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
// Tint every palette color by `deg` so each named type reads distinct. Hazard reds
// (eyes) are left alone so the archetype "danger" cue stays readable. Neutral greys
// (e.g. the all-gunmetal `super` palette) get a faint injected tint rather than being
// skipped, so grey-based units still vary per name. Returns a new palette object.
function hueTint(pal, deg) {
  const out = {};
  for (const [k, hex] of Object.entries(pal)) {
    const [h, s, l] = rgbToHsl(...hexToRgb(hex));
    const isRed = s >= 0.35 && (h < 20 || h > 340); // eyes/hazard — keep
    if (isRed) { out[k] = hex; continue; }
    if (s < 0.18) { out[k] = rgbToHex(...hslToRgb(deg % 360, 0.14, l)); continue; } // faint tint on greys
    out[k] = rgbToHex(...hslToRgb((h + deg) % 360, s, l));
  }
  return out;
}
// Desaturated, darkened palette for a dead unit (PRD §2: dead clones stay on field).
function desaturate(pal) {
  const out = {};
  for (const [k, hex] of Object.entries(pal)) {
    const [h, s, l] = rgbToHsl(...hexToRgb(hex));
    out[k] = rgbToHex(...hslToRgb(h, s * 0.15, l * 0.55));
  }
  return out;
}
function cloneMap(map) {
  return map.slice();
}

// Build the per-type MAPS + PALETTES entries as placeholders derived from the archetype
// base. Skip a name that already has a literal MAPS entry above — once art is hand-authored
// in the sprite editor and pasted back as a literal, that literal wins over the placeholder.
// Also skip names that already ARE a base key (e.g. the droid literally named `sniper`
// reuses the base sniper art untouched).
for (const [name, arch] of Object.entries(DROID_ARCH)) {
  if (name === arch || MAPS[name]) continue;
  const deg = 20 + (hashName(name) % 300); // deterministic 20–319° shift
  MAPS[name] = cloneMap(MAPS[arch]);
  PALETTES[name] = hueTint(PALETTES[arch], deg);
}
for (const name of CLONE_TYPES) {
  if (MAPS[name]) continue;
  const deg = 20 + (hashName(name) % 300);
  MAPS[name] = cloneMap(MAPS.clone);
  PALETTES[name] = hueTint(PALETTES.clone, deg);
}
// Any power-up type without hand-authored art gets the generic pickup icon, hue-shifted —
// so adding a key to src/config/powerups.js can never crash the renderer.
for (const name of POWERUP_TYPES) {
  if (MAPS[name]) continue;
  const deg = 20 + (hashName(name) % 300);
  MAPS[name] = cloneMap(MAPS.powerup);
  PALETTES[name] = hueTint(PALETTES.powerup, deg);
}

function mkSprite(map, pal, scale) {
  const c = document.createElement('canvas');
  c.width = map[0].length * scale;
  c.height = map.length * scale;
  const x = c.getContext('2d');
  for (let j = 0; j < map.length; j++) {
    const row = map[j];
    for (let i = 0; i < row.length; i++) {
      const col = pal[row[i]];
      if (col) {
        x.fillStyle = col;
        x.fillRect(i * scale, j * scale, scale, scale);
      }
    }
  }
  return c;
}

/**
 * Bake every sprite at an integer canvas-pixels-per-cell scale (crisp pixels;
 * the renderer re-bakes on resize instead of stretching at draw time).
 * → offscreen canvases keyed by every MAPS entry (jedi, clone, the 4 archetype
 * bases, and every per-type clone/droid name) plus a `<name>Dead` per clone type.
 */
/**
 * Bake the jedi sprite for a skin (CONTRACTS "Renderer"; skins are cosmetic). `palette` is the
 * skin's full char→hex map (S/s/r/R/b/k plus optional extras like `a`); missing b/k fall back to
 * the default jedi palette. `map` is the skin's pixel silhouette (defaults to MAPS.jedi). Returns
 * an offscreen canvas.
 */
export function bakeJedi(scale, palette = null, map = MAPS.jedi) {
  const d = PALETTES.jedi;
  const pal = palette ? { b: d.b, k: d.k, ...palette } : d;
  return mkSprite(map && map.length ? map : MAPS.jedi, pal, scale);
}

export function createSprites(scale) {
  const out = {};
  // Bake every map that has a matching palette (jedi, clone, 4 archetype bases,
  // and every per-type entry added to MAPS/PALETTES above).
  for (const key of Object.keys(MAPS)) {
    if (PALETTES[key]) out[key] = mkSprite(MAPS[key], PALETTES[key], scale);
  }
  // Dead variants: base cloneDead + one per clone type (same map, desaturated palette).
  out.cloneDead = mkSprite(MAPS.clone, PALETTES.cloneDead, scale);
  for (const name of CLONE_TYPES) {
    out[name + 'Dead'] = mkSprite(MAPS[name], desaturate(PALETTES[name]), scale);
  }
  return out;
}
