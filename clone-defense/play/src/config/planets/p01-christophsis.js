// Planet 1 — Christophsis (PRD §16). Stats ported from the prototype's tuned CFG. Feel: plain B1 lines in the crystal city — the war's opening ground battle.
export default {
  id: 'christophsis', name: 'CHRISTOPHSIS',
  floorSeed: 1234,
  deflectAccuracy: 0.47,
  deflectMultiplier: 1.00,
  deflectJitterDeg: 1.00,
  palette: { bgGradient: ['#060910', '#000000'], terrain: '#3E5C8E', accent: '#2E8B9E' },
  artOverlay: [],
  roster: { shiny: 12 },
  clones: { shiny: { hp: 3, damage: 1, accuracy: 0.4, fireRate: 0.5, jitter: 0.25 } },
  droids: {
    B1: { hp: 2.5, boltSpeed: 150, damage: 1, accuracy: 0.5, fireRate: 0.45, jitter: 0.5, archetype: 'battle' },
  },
  waves: [
    { B1: 7 },
    { B1: 7 },
    { B1: 8 },
    { B1: 9 },
    { B1: 10 },
    { B1: 10 },
    { B1: 11 },
    { B1: 11 },
    { B1: 12 },
    { B1: 15 },
  ],
  // Planet 1 stays sparse on purpose: a single Force drop, halfway in. The opening ground
  // battle teaches the saber and the Force bar; the catalog opens up from Tatooine on.
  powerups: [
    { wave: 5, kill: 2, type: 'forceHalf' },
  ],
};
