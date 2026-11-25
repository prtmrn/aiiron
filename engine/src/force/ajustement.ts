// Ajustement en séance selon le RPE réel : knowledge/force/ajustement-rpe.md
import { arrondirCharge, arrondirSousPlafond, type Materiel } from "./arrondi";
import { e1rmSerie, motifSerieInvalide, rpeRetenu } from "./e1rm";
import { pct } from "./rpe";
import type { Drapeau } from "./types";

// R3 : zone morte
const ZONE_MORTE = 0.5;
// R5 : série dure si écart ≥ +2 ; RPE suivant −1, minimum 6
const ECART_SERIE_DURE = 2;
const RPE_MIN = 6;
// R6 : échec total → 90 % de la charge tentée
const COEF_ECHEC_TOTAL = 0.9;
// R7 : hausse ≤ +5 % de la charge prévue ; refusée si e1rmSerie > 1,10 × ref
const HAUSSE_MAX = 1.05;
const GARDE_FOU = 1.1;

export type SeriePrevue = { reps: number; rpe: number; charge: number | null; annulee?: boolean };
export type SerieFaite = { charge: number; reps: number; rpe?: unknown; douleur?: boolean };

/**
 * Rejoue les séries faites dans l'ordre et renvoie le plan complet ajusté (même slot pour toutes les séries,
 * rapport des remises = 1 en R2).
 */
export function ajusterSeance(
  prevues: SeriePrevue[],
  faites: SerieFaite[],
  ctx: { ref: number; materiel: Materiel; debutant?: boolean; deload?: boolean },
): { series: SeriePrevue[]; drapeaux: Drapeau[] } {
  const plan = prevues.map((s) => ({ ...s }));
  const drapeaux: Drapeau[] = [];
  const annuler = (depuis: number) => plan.slice(depuis).forEach((s) => Object.assign(s, { charge: null, annulee: true }));
  let precedenteDure = false;

  for (let i = 0; i < faites.length && i < plan.length; i++) {
    const f = faites[i];
    const prescrite = plan[i];
    const suivantes = plan.slice(i + 1);
    if (f.douleur) { drapeaux.push("DOULEUR"); annuler(i + 1); break; } // R1

    if (f.reps === 0) { // R6
      drapeaux.push("ECHEC_TOTAL", "SERIE_DURE");
      if (precedenteDure) { drapeaux.push("ARRET_EXERCICE"); annuler(i + 1); break; }
      const charge = arrondirCharge(COEF_ECHEC_TOTAL * f.charge, ctx.materiel).charge;
      suivantes.forEach((s) => Object.assign(s, { charge, rpe: Math.max(RPE_MIN, s.rpe - 1) }));
      precedenteDure = true;
      continue;
    }

    const local: Drapeau[] = [];
    const rpe = rpeRetenu({ ...f, repsPrescrites: prescrite.reps }, local);
    drapeaux.push(...local);
    if (rpe === null || motifSerieInvalide(f.reps, rpe)) { precedenteDure = false; continue; } // R1

    const ecart = rpe - prescrite.rpe;
    const dure = ecart >= ECART_SERIE_DURE || (rpe === 10 && prescrite.rpe <= 9) || f.reps < prescrite.reps; // R5
    if (dure) {
      drapeaux.push("SERIE_DURE");
      if (precedenteDure) { drapeaux.push("ARRET_EXERCICE"); annuler(i + 1); break; }
      suivantes.forEach((s) => (s.rpe = Math.max(RPE_MIN, s.rpe - 1)));
    }
    precedenteDure = dure;
    if (!dure && Math.abs(ecart) <= ZONE_MORTE) continue; // R3

    // R2 + R7
    const e = e1rmSerie(f.charge, f.reps, rpe)!;
    const hausseInterdite = ctx.debutant || ctx.deload || e > GARDE_FOU * ctx.ref;
    for (const s of suivantes) {
      const j = plan.indexOf(s);
      const prevue = prevues[j].charge;
      const p = pct(s.reps, s.rpe);
      if (p === null) continue;
      const plafond = prevue === null ? Infinity : hausseInterdite ? prevue : HAUSSE_MAX * prevue;
      s.charge = arrondirSousPlafond(e * p, plafond, ctx.materiel).charge;
    }
  }
  return { series: plan, drapeaux };
}
