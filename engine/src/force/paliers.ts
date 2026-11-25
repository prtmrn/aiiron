// Paliers de montée en charge et séries d'approche : knowledge/force/paliers-montee-en-charge.md
// (règle commune avec knowledge/echauffement/echauffement-force.md, ECH-F4)
import { arrondirCharge, type Materiel } from "./arrondi";
import { pct } from "./rpe";
import { estGuide, schemaExercice } from "./schemas";
import { normaliserExercice } from "./variantes";
import { donneesVolume } from "../volume/donnees";
import { resoudreExercice } from "../volume/resolution";

export type TypeSeance = "force" | "musculation" | "hyrox_crossfit";
export type Echelle = "leger" | "modere" | "lourd" | "tres_lourd";

// R2 : seuils d'intensité
const SEUIL_LOURD = 0.8;
const SEUIL_TRES_LOURD = 0.9;
const SEUIL_MODERE = 0.7;
// R2 : échelles (% de la charge de travail × reps), barre vide à part
const BARRE_REPS = 10;
const ECHELLES: Record<Echelle, [number, number][]> = {
  leger: [[0.5, 5], [0.75, 3]],
  modere: [[0.45, 5], [0.65, 3], [0.85, 2]],
  lourd: [[0.4, 5], [0.6, 3], [0.75, 2], [0.85, 1]],
  tres_lourd: [[0.4, 5], [0.6, 3], [0.75, 2], [0.85, 1], [0.92, 1]],
};
// R5 : mouvement déjà chauffé → départ à 60 %
const DEPART_DEJA_CHAUFFE = 0.6;
// R4 : repos (s)
const REPOS_BARRE = 30;
const REPOS_LEGER = 60;
const REPOS_LOURD = 90;
const SEUIL_REPOS = 0.7;
const REPOS_AVANT_TRAVAIL_LOURD = 180;
const REPOS_AVANT_TRAVAIL = 120;
// R6 : durée estimée, 4 s par rep
const SECONDES_PAR_REP = 4;
// M2 : règle courte musculation [reps max prescrites, séries (% , reps, repos)]
const M2: [number, [number, number, number][]][] = [
  [6, [[0.5, 5, 60], [0.75, 3, 90]]],
  [12, [[0.5, 8, 60], [0.75, 4, 90]]],
  [Infinity, [[0.6, 8, 90]]],
];

export type Palier = { exercice: string; palier: number; charge_kg: number; reps: number; pct_travail: number | null; repos_s: number };
export type PaliersEntree = {
  exercice: string;
  chargeTravail: number; // charge arrondie de la première série de travail
  e1rm: number | null; // e1RM effectif du slot
  reps: number;
  rpe?: number;
  typeSeance: TypeSeance;
  materiel: Materiel;
  premierDuSchema?: boolean; // défaut vrai ; faux si le même schéma a déjà eu une échelle R2 dans la séance
  premierDuGroupe?: boolean; // défaut vrai (musculation, M1)
  depuisSol?: boolean; // soulevé de terre et variantes depuis le sol
};
export type PaliersSortie = { regle: "R2" | "M2" | "ECH-H4"; echelle?: Echelle; I: number | null; items: Palier[]; dureeS: number };

/** R2, point 1 : I = charge / e1RM, sinon pct(reps, RPE), sinon null (indéterminable). */
export function intensite(chargeTravail: number, e1rm: number | null, reps: number, rpe?: number): number | null {
  if (e1rm) return chargeTravail / e1rm;
  return rpe === undefined ? null : pct(reps, rpe);
}

/** R2, points 2 à 4. */
function choisir(I: number | null, type: TypeSeance): { regle: PaliersSortie["regle"]; echelle?: Echelle } {
  if (I !== null && I >= SEUIL_TRES_LOURD) return { regle: "R2", echelle: "tres_lourd" };
  if (I !== null && I >= SEUIL_LOURD) return { regle: "R2", echelle: "lourd" };
  if (type === "musculation") return { regle: "M2" };
  if (type === "hyrox_crossfit") return { regle: "ECH-H4" };
  if (I === null) return { regle: "R2", echelle: "lourd" };
  return { regle: "R2", echelle: I < SEUIL_MODERE ? "leger" : "modere" };
}

const duree = (items: Palier[]) => items.reduce((s, i) => s + i.reps * SECONDES_PAR_REP + i.repos_s, 0);

export function paliers(entree: PaliersEntree): PaliersSortie {
  const e = { ...entree, exercice: normaliserExercice(entree.exercice) };
  const I = intensite(e.chargeTravail, e.e1rm, e.reps, e.rpe);
  const { regle, echelle } = choisir(I, e.typeSeance);
  const items: Palier[] = [];
  const garder = (charge: number, reps: number, pctTravail: number, repos: number, minimum: number) => {
    const dernier = items.length ? items[items.length - 1].charge_kg : -Infinity;
    if (charge <= minimum || charge >= e.chargeTravail || charge <= dernier) return; // R3 2-4, M3 2-3
    items.push({ exercice: e.exercice, palier: items.length, charge_kg: charge, reps, pct_travail: pctTravail, repos_s: repos });
  };

  if (regle === "M2") {
    if (e.premierDuGroupe ?? true) {
      const ligne = M2.find(([max]) => e.reps <= max)![1];
      for (const [p, reps, repos] of ligne) garder(arrondirCharge(p * e.chargeTravail, e.materiel).charge, reps, p, repos, -Infinity);
    }
    return { regle, I, items, dureeS: duree(items) };
  }
  if (regle === "ECH-H4") return { regle, I, items, dureeS: 0 };

  const barre = e.materiel.type === "barre" ? e.materiel.barre_kg : null;
  if (barre !== null && e.chargeTravail <= barre) return { regle, echelle, I, items, dureeS: 0 }; // R3 5
  const premier = e.premierDuSchema ?? true;
  if (barre !== null && premier) {
    items.push({ exercice: e.depuisSol ? "sdt_roumain" : e.exercice, palier: 0, charge_kg: barre, reps: BARRE_REPS, pct_travail: null, repos_s: REPOS_BARRE });
  }
  for (const [p, reps] of ECHELLES[echelle!]) {
    if (!premier && p < DEPART_DEJA_CHAUFFE) continue;
    garder(arrondirCharge(p * e.chargeTravail, e.materiel).charge, reps, p, p < SEUIL_REPOS ? REPOS_LEGER : REPOS_LOURD, barre ?? -Infinity);
  }
  // R4 : dernier palier avant la première série de travail (I indéterminable en force → échelle « Lourd »)
  if (items.length) items[items.length - 1].repos_s = I === null || I >= SEUIL_LOURD ? REPOS_AVANT_TRAVAIL_LOURD : REPOS_AVANT_TRAVAIL;
  return { regle, echelle, I, items, dureeS: duree(items) };
}

export type ExerciceSeance = Omit<PaliersEntree, "typeSeance" | "premierDuSchema" | "premierDuGroupe">;

/**
 * Séance entière, dans l'ordre : R5 « Mouvement déjà chauffé » (schéma lu dans data/exercises/schemas.json) et M1 « premier exercice du groupe ».
 * Groupe = resoudreExercice(id).groupe du moteur volume (MAP-6). Groupe inconnu (identifiant du moteur force hors catalogue,
 * exercice sans muscle principal compté) : l'exercice est traité comme premier de son groupe et reçoit ses séries d'approche.
 */
export function echauffementSeance(type: TypeSeance, exercices: ExerciceSeance[]): PaliersSortie[] {
  const chauffesLibre = new Set<string>();
  const chauffesGuide = new Set<string>();
  const groupes = new Set<string>();
  return exercices.map((ex) => {
    const groupe = resoudreExercice(normaliserExercice(ex.exercice), donneesVolume).groupe;
    const cle = schemaExercice(ex.exercice) ?? normaliserExercice(ex.exercice); // sans schéma : le mouvement est l'exercice lui-même
    const guide = estGuide(ex.exercice);
    const sortie = paliers({
      ...ex,
      typeSeance: type,
      premierDuSchema: !chauffesLibre.has(cle) && !(guide && chauffesGuide.has(cle)), // machine puis barre libre : paliers complets
      premierDuGroupe: groupe === null || !groupes.has(groupe),
    });
    if (sortie.regle === "R2") (guide ? chauffesGuide : chauffesLibre).add(cle); // M2 et ECH-H4 ne comptent pas comme paliers
    if (groupe !== null) groupes.add(groupe);
    return sortie;
  });
}
