// Planet 15 — Oba Diah (PRD §16, finale). Feel: everything at once on the Pyke world — hardest mix, but high deflectAccuracy keeps it winnable.
export default {
  id: 'oba-diah', name: 'OBA DIAH',
  floorSeed: 9999,
  deflectAccuracy: 0.82,
  deflectMultiplier: 1.80,
  deflectJitterDeg: 3.10,
  palette: { bgGradient: ['#101315', '#000000'], terrain: '#3E4A52', accent: '#8A7A66' },
  artOverlay: [],
  roster: { arc: 3, veteran: 12 },
  clones: {
    arc: { hp: 6.5, damage: 1.8, accuracy: 0.6, fireRate: 0.68, jitter: 0.2 },
    veteran: { hp: 6, damage: 1.7, accuracy: 0.55, fireRate: 0.62, jitter: 0.2 },
  },
  droids: {
    b00m2: { hp: 5, boltSpeed: 150, damage: 2, accuracy: 0.67, fireRate: 0.8, jitter: 0.2, archetype: 'battle' },
    ig100: { hp: 8.125, boltSpeed: 165, damage: 2.5, accuracy: 0.67, fireRate: 0.6, jitter: 0.15, archetype: 'super' },
    qdroideka: { hp: 5.625, boltSpeed: 190, damage: 3, accuracy: 0.88, fireRate: 0.32, jitter: 0.1, archetype: 'sniper' },
    octuptarra: { hp: 17.5, boltSpeed: 140, damage: 4, accuracy: 0.7, fireRate: 0.26, jitter: 0.15, archetype: 'spider' },
  },
  waves: [
    { b00m2: 15 },
    { b00m2: 15 },
    { b00m2: 18, ig100: 5, qdroideka: 3 },
    { b00m2: 18, ig100: 5, qdroideka: 5, octuptarra: 3 },
    { b00m2: 25, ig100: 13, qdroideka: 10, octuptarra: 5 },
    { b00m2: 20, ig100: 8, qdroideka: 5, octuptarra: 3 },
    { b00m2: 20, ig100: 8, qdroideka: 5, octuptarra: 3 },
    { b00m2: 20, ig100: 8, qdroideka: 8, octuptarra: 3 },
    { b00m2: 23, ig100: 8, qdroideka: 8, octuptarra: 3 },
    { b00m2: 25, ig100: 13, qdroideka: 10, octuptarra: 5 },
  ],
  powerups: [
    { wave: 3, kill: 3, type: 'forceFull', droidType: 'qdroideka' },
    { wave: 5, kill: 10, type: 'badBatch', droidType: 'ig100' },
    { wave: 7, kill: 5, type: 'ultimate', droidType: 'qdroideka' },
    { wave: 10, kill: 5, type: 'secondYoda', droidType: 'octuptarra' },
  ],
};
