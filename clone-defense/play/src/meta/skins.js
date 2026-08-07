// Skins — ranked, skill-gated progression (PRD §11). Cosmetic ONLY: swapping a skin
// changes appearance (saber color, skin tone, robe), never balance.
// Named-Jedi roster ordered by fandom strength/popularity: iconic Jedi are the deepest
// unlocks (Yoda = GRAND MASTER, score-gated). PADAWAN (`default`) is the free starter and
// keeps its id so existing saves stay valid.
// Each skin carries its own `palette` (char → hex) and `map` (pixel silhouette), so every
// knight has a unique shape AND coloring, not just a recolor of one base. Maps use the palette
// chars S saber, s skin, r robe-dark, R robe-light, b hilt, k outline, plus optional extras
// (e.g. `a` for montrals/hair/armor) — any char with a palette entry renders; `.` is empty.
// bakeJedi() rasterizes map+palette. `saberColor` (== palette.S) is kept for the deflect-arc
// tint and the DOM skin-picker swatch. Unlock checks run on PLANET_STARTED / RUN_ENDED (index.js).
// Sprite art is authored in the sprite-editor artifact and pasted back here.
// Roster excludes Luke — not a Clone Wars-era Jedi.

export const SKINS = [
  {
    id: 'default', name: 'PADAWAN', saberColor: '#3b9dff', unlock: { type: 'default', value: 0 },
    palette: { S: '#3b9dff', s: '#e0b088', r: '#5a3a1e', R: '#7a5028', b: '#2a3550', k: '#1a1208' },
    map: [
      '.............S', '............SS', '...........SS.', '....sss...SS..', '....sss..SS...',
      '....rrr..S....', '...rrrR..b....', '..rrrRRRsb....', '..rrRRRRs.....', '..rrRRRR......',
      '..ssRRRR......', '...rrRRR......', '...rrRRr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'luminara', name: 'LUMINARA UNDULI', saberColor: '#45d17a', unlock: { type: 'planet', value: 1 },
    palette: { S: '#45d17a', s: '#b7a05a', r: '#3c081b', R: '#232323', b: '#2a3550', k: '#1a1208' },
    map: [
      '.............S', '............SS', '...rrrrr...SS.', '..rrsssrr.SS..', '..rrsssrrSS...',
      '..rrrrr..S....', '...rrRR..b....', '..rrRRRRsb....', '..rrRRRRs.....', '..rrRRRr......',
      '..ssRRRr......', '...rRRRr......', '...rrrrr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'plo-koon', name: 'PLO KOON', saberColor: '#4dd0e1', unlock: { type: 'planet', value: 4 },
    palette: { S: '#4dd0e1', s: '#b8563a', r: '#3c081b', R: '#aa7942', b: '#2a3550', k: '#1a1208', a: '#606060' },
    map: [
      '.............S', '............SS', '...........SS.', '....sss...SS..', '....sas..SS...',
      '....rar..S....', '...rrrr..b....', '..rrrRRRsb....', '..rrRRRRs.....', '..rrRRRR......',
      '..ssRRRR......', '...rrRRR......', '...rrRRr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'shaak-ti', name: 'SHAAK TI', saberColor: '#3b9dff', unlock: { type: 'score', value: 40000 },
    palette: { S: '#3b9dff', s: '#ff6251', r: '#5a2f35', R: '#7a4048', b: '#2a3550', k: '#1a1208', a: '#ebebeb' },
    map: [
      '....a.a......S', '...aa.aa....SS', '...aaaaa...SS.', '...asssa..SS..', '...asssa.SS...',
      '...arrra.S....', '...raraa.b....', '..rraRaRsb....', '..rraRaRs.....', '..rrRRRR......',
      '..ssRRRR......', '...rrRRR......', '...rrRRr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'qui-gon', name: 'QUI-GON JINN', saberColor: '#3bf07a', unlock: { type: 'planet', value: 6 },
    palette: { S: '#3bf07a', s: '#e0b088', r: '#7a4a00', R: '#b58b45', b: '#2a3550', k: '#1a1208' },
    map: [
      '.............S', '............SS', '...........SS.', '....sss...SS..', '....sss..SS...',
      '....rrr..S....', '...rRRR..b....', '..rrrRRrsb....', '..rrrRrrs.....', '..rrrRrr......',
      '..ssrrrr......', '...rrrrr......', '...rrrrr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'kit-fisto', name: 'KIT FISTO', saberColor: '#00f900', unlock: { type: 'score', value: 80000 },
    palette: { S: '#00f900', s: '#7cc042', r: '#482e19', R: '#654323', b: '#2a3550', k: '#1a1208' },
    map: [
      '.............S', '............SS', '...........SS.', '....sss...SS..', '...ssss..SS...',
      '...srrr..S....', '...ssrr..b....', '..rrsrrRsb....', '..rrrrRRs.....', '..rrrRrr......',
      '..ssrRrr......', '...rrRrr......', '...rrrrr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'ahsoka', name: 'AHSOKA TANO', saberColor: '#ffffff', unlock: { type: 'planet', value: 8 },
    palette: { S: '#ffffff', s: '#ff6251', r: '#1a0a53', R: '#11053b', b: '#444444', k: '#1a1208', a: '#ebebeb' },
    map: [
      '............S.', '.....a.a....S.', '....aaaaa..SS.', '....asssa..S..', '....asssa.SS..',
      '....arrra.S...', '....rara..b...', '...sraRaRsb...', '..bsraRaRs....', '..b.rRRRR.....',
      '..S.rRRRR.....', '.SS.rrRRR.....', 'SS..rrrrr.....', 'S...rr.rr.....', '....rr.rr.....',
    ],
  },
  {
    id: 'obi-wan', name: 'OBI-WAN KENOBI', saberColor: '#6db3ff', unlock: { type: 'planet', value: 10 },
    palette: { S: '#6db3ff', s: '#e0b088', r: '#6e5a3a', R: '#a08a5a', b: '#2a3550', k: '#1a1208' },
    map: [
      '.............S', '............SS', '...rrrr....SS.', '...rrss...SS..', '...rsss..SS...',
      '...rrrr..S....', '...rRRR..b....', '..rrRRRrsb....', '..rrrRrrs.....', '..rrrRrr......',
      '..ssrRrr......', '...rrrrr......', '...rrrrr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'anakin', name: 'ANAKIN SKYWALKER', saberColor: '#3b9dff', unlock: { type: 'score', value: 120000 },
    palette: { S: '#3b9dff', s: '#e0b088', r: '#232323', R: '#444444', b: '#2a3550', k: '#1a1208', a: '#232323' },
    map: [
      '.............S', '.....aa.....SS', '...aaaa....SS.', '..aasss...SS..', '..aasss..SS...',
      '....rrr..S....', '...rRRR..b....', '..rrrRRrsb....', '..rrrRRrs.....', '..rrrRRr......',
      '..ssrRrr......', '...rrrrr......', '...rrrrr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'mace-windu', name: 'MACE WINDU', saberColor: '#b26bff', unlock: { type: 'planet', value: 12 },
    palette: { S: '#b26bff', s: '#5a3d2a', r: '#2f2a26', R: '#4a4038', b: '#2a3550', k: '#1a1208' },
    map: [
      '.............S', '............SS', '...........SS.', '....sss...SS..', '....sss..SS...',
      '....rrr..S....', '...rRRR..b....', '..rrRRrrsb....', '..rrRRrrs.....', '..rrRrrr......',
      '..ssrrrr......', '...rrrrr......', '...rrrrr......', '...rr.rr......', '...rr.rr......',
    ],
  },
  {
    id: 'yoda', name: 'YODA', saberColor: '#8fe36a', unlock: { type: 'score', value: 250000 },
    palette: { S: '#8fe36a', s: '#9ab545', r: '#6a5a3a', R: '#8a7654', b: '#444444', k: '#1a1208', a: '#aa7942' },
    map: [
      '..............', '..............', '..............', '............S.', '...........SS.',
      '....sss...SS..', '...sssss.SS...', '....sss..S....', '...rrrr..b....', '..rrRRRrsb....',
      '..rrrRRrs.....', '..saarRr......', '...rarrr......', '...rarrr......', '..............',
    ],
  },
];

export function skinById(id) {
  for (const s of SKINS) if (s.id === id) return s;
  return null;
}

/**
 * Which locked skins become unlockable at this record?
 * record = { planet, score } — best-so-far, 1-based planet, where "planet" is
 * max(best.planet, furthest planet reached this run) and "score" is
 * max(best.score, this run's score).
 * Returns newly-unlockable skin ids (does not mutate).
 */
export function evaluateSkinUnlocks(record, unlockedIds) {
  const planet = Number(record.planet) || 0;
  const score = Number(record.score) || 0;
  const out = [];
  for (const s of SKINS) {
    if (unlockedIds.includes(s.id)) continue;
    const u = s.unlock;
    if (u.type === 'planet' && planet >= u.value) out.push(s.id);
    else if (u.type === 'score' && score >= u.value) out.push(s.id);
  }
  return out;
}
