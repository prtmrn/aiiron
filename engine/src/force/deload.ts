// Deload : knowledge/force/deload.md
import type { Materiel } from "./arrondi";
import { chargeLigne } from "./charge";
import { pct } from "./rpe";
import type { Drapeau } from "./types";

// R2 : plafonds d'une semaine de deload
const RPE_MAX = 7;
const PCT_MAX = 0.8;
const RPE_SINGLE_LOURD = 8;
const SERIES_EXERCICE_ABSENT = 2;
// R4, étape 4 : ligne de remplacement 3 reps @ RPE 6
const REMPLACEMENT_REPS = 3;
const REMPLACEMENT_RPE = 6;
// R1 : déclencheurs
const SEMAINES_PLANIFIEES = { debutant: 6, intermediaire: 5, avance: 4 } as const;
const SEUIL_REGRESSION = 0.95;
const FENETRE_REGRESSION = 4; // semaines, en cours comprise
const RECUL_STAGNATION = 3; // semaines
const SERIES_DURES_FATIGUE = 3;
const DELAI_MIN_ENTRE_DELOADS = 3; // semaines

export type Ligne = { series: number; reps: number; rpe?: number; pct?: number; charge?: number; amrap?: boolean; test1rm?: boolean };
export type Semaine = { deload: boolean; exercices: { exercice: string; lignes: Ligne[] }[] };
export type Violation = { code: Drapeau; exercice: string; ligne?: number };

const total = (lignes: Ligne[]) => lignes.reduce((s, l) => s + l.series, 0);

/** R2 : séries maximales d'un exercice ; null = non vérifiable (pas de semaine de référence). */
function limiteSeries(ex: string, ref: Semaine | null): number | null {
  if (!ref) return null;
  const e = ref.exercices.find((x) => x.exercice === ex);
  return e ? Math.ceil(total(e.lignes) / 2) : SERIES_EXERCICE_ABSENT;
}

/** R3 */
export function validerDeload(semaine: Semaine, ref: Semaine | null, e1rm: Record<string, number>): { violations: Violation[]; drapeaux: Drapeau[] } {
  const violations: Violation[] = [];
  if (!semaine.deload) return { violations, drapeaux: [] };
  for (const { exercice, lignes } of semaine.exercices) {
    lignes.forEach((l, ligne) => {
      const v = (code: Drapeau) => violations.push({ code, exercice, ligne });
      if (l.rpe !== undefined && l.rpe > RPE_MAX) v("DELOAD_RPE_TROP_HAUT");
      if (l.reps === 1 && l.rpe !== undefined && l.rpe >= RPE_SINGLE_LOURD) v("DELOAD_SINGLE_LOURD");
      const p = l.rpe !== undefined ? pct(l.reps, l.rpe) : null;
      const e = e1rm[exercice];
      if ((p !== null && p > PCT_MAX) || (l.pct !== undefined && l.pct > PCT_MAX) || (l.charge !== undefined && e !== undefined && l.charge > PCT_MAX * e))
        v("DELOAD_INTENSITE_TROP_HAUTE");
      if (l.amrap || l.test1rm) v("DELOAD_TEST_INTERDIT");
    });
    const lim = limiteSeries(exercice, ref);
    if (lim !== null && total(lignes) > lim) violations.push({ code: "DELOAD_VOLUME_TROP_HAUT", exercice });
  }
  return { violations, drapeaux: ref ? [] : ["DELOAD_VOLUME_NON_VERIFIABLE"] };
}

/** R4 : correction automatique. e1rm = e1RM effectif par exercice. */
export function corrigerDeload(
  semaine: Semaine,
  ref: Semaine | null,
  e1rm: Record<string, number>,
  materiel: Record<string, Materiel>,
): { semaine: Semaine; changements: string[] } {
  const changements: string[] = [];
  const exercices = semaine.exercices.map(({ exercice, lignes }) => {
    const e = e1rm[exercice];
    const m = materiel[exercice];
    const charge = (l: Ligne) => chargeLigne(e, m, l, "deload");
    // 1. lignes interdites
    let gardees = lignes.filter((l) => {
      const interdite = (l.reps === 1 && (l.rpe ?? 0) >= RPE_SINGLE_LOURD) || l.amrap || l.test1rm;
      if (interdite) changements.push(`${exercice} : ${l.series} × ${l.reps}${l.rpe ? ` @ ${l.rpe}` : ""} supprimé (interdit en deload)`);
      return !interdite;
    });
    const lim = limiteSeries(exercice, ref) ?? Math.ceil(total(lignes) / 2);
    // 4. tout supprimé : ligne de remplacement
    if (gardees.length === 0) {
      gardees = [{ series: lim, reps: REMPLACEMENT_REPS, rpe: REMPLACEMENT_RPE }];
      changements.push(`${exercice} : remplacé par ${lim} × ${REMPLACEMENT_REPS} @ ${REMPLACEMENT_RPE}`);
    }
    // 2. plafonds RPE et charge
    gardees = gardees.map((l) => {
      const r = charge(l);
      const out: Ligne = { series: l.series, reps: l.reps, rpe: r.rpe ?? undefined, charge: r.charge ?? undefined };
      if (out.rpe === undefined) delete out.rpe;
      if (out.charge === undefined) delete out.charge;
      if (l.rpe !== out.rpe || l.charge !== out.charge) changements.push(`${exercice} : ${l.series} × ${l.reps} → RPE ${out.rpe ?? "—"}, ${out.charge ?? "—"} kg`);
      return out;
    });
    // 3. volume, en retirant depuis la dernière ligne ; minimum 1 série
    while (total(gardees) > Math.max(lim, 1)) {
      const derniere = gardees[gardees.length - 1];
      if (derniere.series > 1) derniere.series--;
      else gardees.pop();
    }
    if (total(gardees) < total(lignes)) changements.push(`${exercice} : volume ramené à ${total(gardees)} séries`);
    return { exercice, lignes: gardees };
  });
  return { semaine: { deload: true, exercices }, changements };
}

/** R1 : décision hebdomadaire. refsHebdo : refs de fin de semaine, chronologiques, la dernière = semaine en cours. */
export function evaluerDeload(h: {
  niveau: keyof typeof SEMAINES_PLANIFIEES;
  semaineDeloadDuModele?: boolean; // absent : le modèle ne place pas de deload
  semainesDeCharge: number; // semaines de charge depuis le dernier deload
  semainesDepuisDernierDeload: number;
  refsHebdo: Record<string, number[]>; // mouvements principaux seulement
  seriesDures7j?: number;
  arrets7j?: number;
  topSetsDursConsecutifs?: boolean;
  readinessBassePersistante?: boolean;
}): { deload: boolean; raisons: string[]; drapeaux: Drapeau[] } {
  const planifie = h.semaineDeloadDuModele ?? h.semainesDeCharge >= SEMAINES_PLANIFIEES[h.niveau];
  if (planifie) return { deload: true, raisons: ["planifie"], drapeaux: [] };

  const series = Object.values(h.refsHebdo);
  const regression = series.some((r) => r.length > 0 && r[r.length - 1] <= SEUIL_REGRESSION * Math.max(...r.slice(-FENETRE_REGRESSION)));
  const stagnation = series.some((r) => r.length > RECUL_STAGNATION && r[r.length - 1] <= r[r.length - 1 - RECUL_STAGNATION]);
  const fatigue = (h.seriesDures7j ?? 0) >= SERIES_DURES_FATIGUE || (h.arrets7j ?? 0) >= 1 || !!h.topSetsDursConsecutifs;
  const readiness = !!h.readinessBassePersistante;

  const signaux = [stagnation && "stagnation", fatigue && "fatigue", readiness && "readiness_basse"].filter(Boolean) as string[];
  const raisons = regression ? ["regression"] : signaux.length >= 2 ? signaux : [];
  if (raisons.length === 0) return { deload: false, raisons: [], drapeaux: stagnation ? ["STAGNATION"] : [] };
  if (h.semainesDepuisDernierDeload < DELAI_MIN_ENTRE_DELOADS) return { deload: false, raisons, drapeaux: ["FATIGUE_PERSISTANTE_APRES_DELOAD"] };
  return { deload: true, raisons, drapeaux: [] };
}
