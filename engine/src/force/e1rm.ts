// e1RM : knowledge/force/e1rm.md
import { normaliserRpe, pct } from "./rpe";
import type { Drapeau } from "./types";

// R2 : série valide pour l'e1RM
const REPS_MAX_E1RM = 10;
const RPE_MIN_E1RM = 7;
// R5 : garde-fou ±10 % ; R7 : +20 % en test de 1RM
const GARDE_FOU = 0.1;
const GARDE_FOU_TEST = 0.2;
// R6 : lissage
const ALPHA = 0.5;
// R8 : initialisation
const SEMAINES_1RM_RECENT = 8;
const COEF_1RM_ANCIEN = 0.95;

/** R2 : motif d'exclusion d'une série (reps et RPE), null si valide. */
export function motifSerieInvalide(reps: number, rpe: number): Drapeau | null {
  if (reps > REPS_MAX_E1RM) return "SERIE_TROP_LONGUE";
  if (rpe < RPE_MIN_E1RM) return "RPE_TROP_BAS_POUR_E1RM";
  return null;
}

/** R1 et R1 bis. null si la série n'est pas valide pour l'e1RM (R2). */
export function e1rmSerie(charge: number, reps: number, rpe: number): number | null {
  if (charge <= 0 || reps < 1 || motifSerieInvalide(reps, rpe)) return null;
  if (reps === 1 && rpe === 10) return charge; // R1 bis : single à fond = 1RM du jour
  const p = pct(reps, rpe);
  return p === null ? null : charge / p;
}

export type SerieLoguee = {
  type?: "travail" | "palier"; // défaut : travail
  charge: number;
  reps: number;
  repsPrescrites?: number;
  rpe?: unknown; // saisie brute, normalisée ici
  douleur?: boolean;
};

/** R3 : RPE retenu pour une série loguée ; null = série inutilisable. */
export function rpeRetenu(s: SerieLoguee, drapeaux: Drapeau[]): number | null {
  if (s.rpe !== undefined && s.rpe !== null) {
    const r = normaliserRpe(s.rpe);
    if (r !== null) return r;
    drapeaux.push("RPE_INVALIDE");
  }
  if (s.reps >= 1 && s.repsPrescrites !== undefined && s.reps < s.repsPrescrites) return 10; // échec supposé
  drapeaux.push("RPE_MANQUANT");
  return null;
}

/** R4 à R7 : mise à jour de la référence après une séance. ref null = séance d'étalonnage (R8). */
export function mettreAJourReference(
  ref: number | null,
  series: SerieLoguee[],
  ctx: { remise?: number; test1rm?: boolean; confirme?: boolean } = {},
): { ref: number | null; e1rmJour: number | null; drapeaux: Drapeau[] } {
  const drapeaux: Drapeau[] = [];
  const valides: { rpe: number; charge: number; e1rm: number }[] = [];
  for (const s of series) {
    if ((s.type ?? "travail") !== "travail") continue;
    if (s.douleur) { drapeaux.push("DOULEUR"); continue; }
    if (s.reps === 0) { drapeaux.push("ECHEC_TOTAL"); continue; }
    const rpe = rpeRetenu(s, drapeaux);
    if (rpe === null) continue;
    const motif = motifSerieInvalide(s.reps, rpe);
    if (motif) { drapeaux.push(motif); continue; }
    const e = e1rmSerie(s.charge, s.reps, rpe);
    if (e !== null) valides.push({ rpe, charge: s.charge, e1rm: e });
  }
  const fin = (r: number | null, e: number | null) => ({ ref: r, e1rmJour: e, drapeaux: [...new Set(drapeaux)] });

  if (ctx.test1rm) {
    const singles = series.filter((s) => s.reps === 1 && !s.douleur && (s.type ?? "travail") === "travail");
    if (singles.length === 0) { drapeaux.push("PAS_DE_DONNEE_FIABLE"); return fin(ref, null); }
    const meilleur = Math.max(...singles.map((s) => s.charge));
    if (ref !== null && !ctx.confirme && meilleur / ref > 1 + GARDE_FOU_TEST) { drapeaux.push("A_CONFIRMER"); return fin(ref, meilleur); }
    return fin(meilleur, meilleur);
  }

  if (valides.length === 0) { drapeaux.push("PAS_DE_DONNEE_FIABLE"); return fin(ref, null); }
  // R4 : RPE le plus haut, puis charge la plus lourde, puis la première
  const refSerie = valides.reduce((a, b) => (b.rpe > a.rpe || (b.rpe === a.rpe && b.charge > a.charge) ? b : a));
  const e1rmJour = refSerie.e1rm / (ctx.remise ?? 1);
  if (ref === null) return fin(e1rmJour, e1rmJour);
  const ratio = e1rmJour / ref;
  if (!ctx.confirme && (ratio > 1 + GARDE_FOU || ratio < 1 - GARDE_FOU)) { drapeaux.push("A_CONFIRMER"); return fin(ref, e1rmJour); }
  return fin(ref + ALPHA * (e1rmJour - ref), e1rmJour);
}

/** R8 : référence initiale. null = séance d'étalonnage. */
export function referenceInitiale(
  d: { type: "1rm"; valeur: number; semaines?: number } | { type: "reps_a_fond"; charge: number; reps: number },
): number | null {
  if (d.type === "1rm") return d.semaines !== undefined && d.semaines <= SEMAINES_1RM_RECENT ? d.valeur : COEF_1RM_ANCIEN * d.valeur;
  return e1rmSerie(d.charge, d.reps, 10);
}
