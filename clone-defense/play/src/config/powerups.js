// Power-up catalog — the canonical key list, shared by config validation, the sim, the
// sprite registry and dev/sprite-editor.html so a type name exists in exactly one place.
// Pure data: no imports, no DOM. Magnitudes live in GLOBALS.powerups.types (src/config/globals.js);
// per-planet drop scripts live on each planet's `powerups` array.
//
// Adding a type = a key here + a GLOBALS.powerups.types block + a MAPS/PALETTES icon in
// src/render/sprites.js + POWERUP_HELP copy in src/ui/screens.js + an applyPowerup branch.

export const POWERUP_KEYS = [
  'forceFull',
  'forceHalf',
  'healAll',
  'empower',
  'secondYoda',
  'ultimate',
  'badBatch',
];

// Display names — HUD buff chips and the first-catch helper card title.
export const POWERUP_LABELS = {
  forceFull: 'FORCE SURGE',
  forceHalf: 'FORCE FLOW',
  healAll: 'FIELD MEDIC',
  empower: 'BATTLE MEDITATION',
  secondYoda: 'MASTER YODA',
  ultimate: 'THE HIGH GROUND',
  badBatch: 'BAD BATCH',
};
