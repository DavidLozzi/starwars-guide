// Planet 2 — Tatooine (PRD §16). Feel: the B2 super droid arrives over the dunes — first taste of a bolt that hurts.
export default {
  id: 'tatooine', name: 'TATOOINE',
  floorSeed: 5678,
  deflectAccuracy: 0.5,
  deflectMultiplier: 1.00,
  deflectJitterDeg: 1.15,
  palette: { bgGradient: ['#23130c', '#000000'], terrain: '#8C4A2F', accent: '#D9A566' },
  artOverlay: [],
  roster: { shiny: 12 },
  clones: { shiny: { hp: 3, damage: 1, accuracy: 0.4, fireRate: 0.5, jitter: 0.25 } },
  droids: {
    B1: { hp: 2.5, boltSpeed: 150, damage: 1, accuracy: 0.5, fireRate: 0.6, jitter: 0.2, archetype: 'battle' },
    B2: { hp: 5.625, boltSpeed: 165, damage: 2, accuracy: 0.58, fireRate: 0.52, jitter: 0.15, archetype: 'super' },
  },
  // B2 now holds off until wave 5, so the first four waves stay a pure B1 line and the super
  // battle droid lands as a distinct beat rather than arriving with the planet.
  waves: [
    { B1: 8 },
    { B1: 8 },
    { B1: 9 },
    { B1: 9 },
    { B1: 8, B2: 2 },
    { B1: 10, B2: 2 },
    { B1: 10, B2: 3 },
    { B1: 10, B2: 4 },
    { B1: 9, B2: 5 },
    { B1: 8, B2: 6 },
  ],
  powerups: [
    { wave: 7, kill: 2, type: 'forceHalf' },
  ],
};
