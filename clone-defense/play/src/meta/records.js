// Run records — trophy, not checkpoint (PRD §9).
// Best = furthest planet, then furthest wave, then best score.
// Full run shape stored for leaderboard-readiness (PRD §14).

export const MAX_RUNS = 50;

/**
 * Normalize a run shape into the persisted record.
 * Accepts 1-based { planet, wave } (profile convention) and fills endedAt.
 */
export function makeRun(shape) {
  return {
    endedAt: shape.endedAt || new Date().toISOString(),
    planet: Number(shape.planet) || 1,
    wave: Number(shape.wave) || 1,
    score: Number(shape.score) || 0,
    durationSec: Number(shape.durationSec) || 0,
    cause: shape.cause === 'finale' ? 'finale' : 'death',
  };
}

/** true if run beats best: planet, then wave, then score (PRD §9). */
export function isBetter(run, best) {
  if (run.planet !== best.planet) return run.planet > best.planet;
  if (run.wave !== best.wave) return run.wave > best.wave;
  return run.score > best.score;
}

/** Mutates best in place if run beats it. Returns true if best changed. */
export function updateBest(best, run) {
  if (!isBetter(run, best)) return false;
  best.planet = run.planet;
  best.wave = run.wave;
  best.score = run.score;
  return true;
}

/** Append run to runs, keeping only the most recent MAX_RUNS. */
export function appendRun(runs, run) {
  runs.push(run);
  if (runs.length > MAX_RUNS) runs.splice(0, runs.length - MAX_RUNS);
  return run;
}
