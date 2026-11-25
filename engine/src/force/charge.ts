// Charge de travail : knowledge/force/moteur-force.md (ordre des opérations, convention 6)
import { arrondirSousPlafond, type Materiel } from "./arrondi";
import { normaliserRpe, pct, rpeDepuisPct } from "./rpe";
import type { Drapeau, Phase } from "./types";

// ajustement-rpe.md R7 : RPE prescrit jamais > 9,5 hors séance test_1rm
const RPE_PRESCRIT_MAX = 9.5;
// deload.md R2 : RPE ≤ 7 et charge ≤ 0,80 × e1RM effectif
const DELOAD_RPE_MAX = 7;
const DELOAD_PCT_MAX = 0.8;
// table-rpe.md R4/R5 : bornes du RPE implicite et seuil de cohérence
const RPE_IMPLICITE_MAX = 10;
const RPE_IMPLICITE_MIN = 6;
const SEUIL_COHERENCE = 0.5;

export type Resultat = { charge: number | null; brute: number | null; rpe: number | null; drapeaux: Drapeau[] };

/** Arrondi (et conversion en lest, arrondi-charges.md R6) d'une charge système brute, sous plafond. */
function finaliser(brute: number, plafond: number, m: Materiel, rpe: number | null, drapeaux: Drapeau[]): Resultat {
  const dec = m.type === "lest" ? m.poids_corps_kg : 0;
  if (brute - dec < 0) return { charge: null, brute, rpe, drapeaux: [...drapeaux, "LEST_NEGATIF"] };
  const r = arrondirSousPlafond(brute - dec, plafond - dec, m);
  return { charge: r.charge, brute, rpe, drapeaux: [...drapeaux, ...r.drapeaux] };
}

/** Seule fonction qui calcule une charge de travail. e1rm = e1RM effectif du slot (système pour un lesté). */
export function chargeCible(e1rm: number, m: Materiel, reps: number, rpe: number, phase: Phase = "normale"): Resultat & { rpe: number } {
  let r = phase === "test_1rm" ? rpe : Math.min(rpe, RPE_PRESCRIT_MAX);
  if (phase === "deload") r = Math.min(r, DELOAD_RPE_MAX);
  const p = pct(reps, r);
  if (p === null) return { charge: null, brute: null, rpe: r, drapeaux: ["HORS_DOMAINE"] };
  const plafond = phase === "deload" ? DELOAD_PCT_MAX * e1rm : Infinity;
  return { ...finaliser(e1rm * p, plafond, m, r, []), rpe: r };
}

/** Ligne de modèle (reps, RPE et/ou % saisi) : table-rpe.md R4 et R5. pctSaisi en fraction (0,85). */
export function chargeLigne(e1rm: number, m: Materiel, ligne: { reps: number; rpe?: number; pct?: number }, phase: Phase = "normale"): Resultat {
  const rpe = ligne.rpe === undefined ? null : normaliserRpe(ligne.rpe);
  if (rpe !== null) {
    const drapeaux: Drapeau[] = [];
    if (ligne.pct !== undefined && Math.abs(rpeDepuisPct(ligne.pct, ligne.reps) - rpe) > SEUIL_COHERENCE) drapeaux.push("INCOHERENCE_PCT_RPE");
    const r = chargeCible(e1rm, m, ligne.reps, rpe, phase);
    return { ...r, drapeaux: [...drapeaux, ...r.drapeaux] };
  }
  if (ligne.pct === undefined) return { charge: null, brute: null, rpe: null, drapeaux: ["PRESCRIPTION_INCOMPLETE"] };
  const implicite = rpeDepuisPct(ligne.pct, ligne.reps);
  if (implicite > RPE_IMPLICITE_MAX) return { charge: null, brute: null, rpe: null, drapeaux: ["PCT_IMPOSSIBLE"] };
  if (implicite >= RPE_IMPLICITE_MIN) {
    const r = chargeCible(e1rm, m, ligne.reps, normaliserRpe(implicite)!, phase);
    return { ...r, drapeaux: ["RPE_DEDUIT_DU_PCT", ...r.drapeaux] };
  }
  // Série légère (technique) : charge = e1RM × % saisi
  const p = phase === "deload" ? Math.min(ligne.pct, DELOAD_PCT_MAX) : ligne.pct;
  return finaliser(e1rm * p, Infinity, m, null, ["HORS_DOMAINE"]);
}
