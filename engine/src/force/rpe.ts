// Table RPE : knowledge/force/table-rpe.md

// R1 : demi-rep de marge de prudence
const MARGE_REPS = 0.5;
// R3 : domaine de prescription
const REPS_MIN = 1;
const REPS_MAX = 15;
const RPE_PRESCRIT_MIN = 6;
const RPE_MAX = 10;
// R2 : bascule Epley / Brzycki en n = 7 (30/36 des deux côtés)
const PCT_BASCULE = 30 / 36;

/** moteur-force.md, convention 4 : RPE entre 1 et 10, ramené au demi-point (égalité vers le haut). null = RPE_INVALIDE. */
export function normaliserRpe(x: unknown): number | null {
  if (typeof x !== "number" || !Number.isFinite(x) || x < 1 || x > RPE_MAX) return null;
  return Math.round(x * 2) / 2; // Math.round arrondit .5 vers le haut
}

/** R2 : min(Epley recalé, Brzycki) sur n = reps + 10 − RPE + 0,5. null = HORS_DOMAINE (R3). */
export function pct(reps: number, rpe: number): number | null {
  if (!Number.isInteger(reps) || reps < REPS_MIN || reps > REPS_MAX) return null;
  if (rpe < RPE_PRESCRIT_MIN || rpe > RPE_MAX) return null;
  const n = reps + 10 - rpe + MARGE_REPS;
  return Math.min(30 / (29 + n), (37 - n) / 36);
}

/** R4 : RPE implicite d'un % saisi, non arrondi. */
export function rpeDepuisPct(p: number, reps: number): number {
  const n = p >= PCT_BASCULE ? 30 / p - 29 : 37 - 36 * p;
  return reps + 10 + MARGE_REPS - n;
}
