// Planet 4 — Kamino (PRD §16). Feel: the cloning spires under siege — the count plateau (~18) arrives, B2s become a fixture.
export default {
  id: 'kamino', name: 'KAMINO',
  floorSeed: 4172,
  deflectAccuracy: 0.55,
  deflectMultiplier: 1.10,
  deflectJitterDeg: 1.45,
  palette: { bgGradient: ['#1c2328', '#000000'], terrain: '#6E8CA0', accent: '#E6EDF2' },
  artOverlay: [],
  roster: { trooper: 12 },
  clones: { trooper: { hp: 3.5, damage: 1, accuracy: 0.4, fireRate: 0.55, jitter: 0.25 } },
  droids: {
    B1: { hp: 2.5, boltSpeed: 150, damage: 1, accuracy: 0.5, fireRate: 0.6, jitter: 0.2, archetype: 'battle' },
    stap: { hp: 1.5, boltSpeed: 150, damage: 0.75, accuracy: 0.42, fireRate: 1, jitter: 0.25, archetype: 'battle' },
    B2: { hp: 5.625, boltSpeed: 165, damage: 2, accuracy: 0.58, fireRate: 0.52, jitter: 0.15, archetype: 'super' },
  },
  waves: [
    { B1: 5, stap: 3 },
    { B1: 5, stap: 3 },
    { B1: 5, stap: 3, B2: 3 },
    { B1: 6, stap: 3, B2: 4 },
    { B1: 9, stap: 4, B2: 9 },
    { B1: 6, stap: 4, B2: 5 },
    { B1: 6, stap: 4, B2: 5 },
    { B1: 8, stap: 4, B2: 6 },
    { B1: 8, stap: 4, B2: 6 },
    { B1: 9, stap: 4, B2: 9 },
  ],
  powerups: [
    { wave: 3, kill: 3, type: 'secondYoda', droidType: 'B2' },
    { wave: 5, kill: 9, type: 'healAll' },
    { wave: 10, kill: 4, type: 'forceFull', droidType: 'stap' },
  ],
};
