// Résolution d'un exercice en muscles : knowledge/hypertrophie/mapping-muscles.md (MAP-2, MAP-3, MAP-6, MAP-11)

export type DrapeauVolume = "EXERCICE_SANS_MAPPING" | "LIBELLE_INCONNU" | "TETE_DELTOIDE_NON_PRECISEE";

/** Champs utilisés de data/exercises/exercises.json et exercices-aiiron.json. */
export interface Exercice {
  id: string;
  nom_en: string;
  muscle_cible: string;
  groupe_musculaire: string;
  muscles_secondaires: string[];
}

export interface Muscle {
  id: string;
  compte_volume: boolean;
  compteur_separe?: boolean;
  agregat_de?: string[];
}

/** Champs utilisés de knowledge/hypertrophie/mapping-muscles.json. */
export interface Mapping {
  regle_comptage: { poids_principal: number; poids_secondaire: number };
  muscles: Muscle[];
  libelles: Record<string, { muscle: string | null }>;
  surcharges: Record<string, { principaux: string[]; secondaires: string[] }>;
  exercices_hors_volume: Record<string, { ids: string[] }>;
}

export interface DonneesVolume {
  mapping: Mapping;
  exercices: Map<string, Exercice>;
}

export interface Resolution {
  principaux: string[];
  secondaires: string[];
  groupe: string | null; // MAP-6, pour les séries d'approche
  hors_volume: string | null; // catégorie MAP-11 (etirement, mobilite, saut, gamme_course, activation)
  drapeaux: DrapeauVolume[];
  cible_inconnue?: true; // MAP-2 : libellé cible hors table ; les secondaires connus comptent quand même
}

const vide = (drapeau: DrapeauVolume): Resolution => ({ principaux: [], secondaires: [], groupe: null, hors_volume: null, drapeaux: [drapeau] });

/** MAP-3 : hors volume → surcharge (identifiant exact) → libellés (libellé entier, jamais par sous-chaîne). */
export function resoudreExercice(id: string, { mapping, exercices }: DonneesVolume): Resolution {
  const ex = exercices.get(id);
  if (!ex) return vide("EXERCICE_SANS_MAPPING");

  const hors_volume = Object.entries(mapping.exercices_hors_volume).find(([, c]) => c.ids.includes(id))?.[0] ?? null;

  let principaux: string[];
  let secondaires: string[];
  const drapeaux: DrapeauVolume[] = [];
  let cible_inconnue: true | undefined;
  if (Object.hasOwn(mapping.surcharges, id)) {
    ({ principaux, secondaires } = mapping.surcharges[id]);
  } else {
    // Object.hasOwn : un libellé « constructor » ne doit pas trouver Object.prototype
    // MAP-2 : un libellé hors table est ignoré (avertissement LIBELLE_INCONNU), les autres comptent
    const connu = (l: string) => Object.hasOwn(mapping.libelles, l);
    const libelles = [ex.muscle_cible, ex.groupe_musculaire, ...ex.muscles_secondaires];
    if (libelles.some((l) => !connu(l))) drapeaux.push("LIBELLE_INCONNU");
    if (!connu(ex.muscle_cible)) cible_inconnue = true;
    const muscle = (l: string) => (connu(l) ? mapping.libelles[l].muscle : null);
    principaux = [muscle(ex.muscle_cible)].filter((m) => m !== null);
    secondaires = libelles.slice(1).map(muscle).filter((m) => m !== null);
  }

  // MAP-5 : chaque muscle une seule fois, le principal l'emporte
  principaux = [...new Set(principaux)];
  secondaires = [...new Set(secondaires)].filter((m) => !principaux.includes(m));

  const comptes = new Set(mapping.muscles.filter((m) => m.compte_volume).map((m) => m.id));
  const groupe = hors_volume === null ? (principaux.find((m) => comptes.has(m)) ?? null) : null;

  return { principaux, secondaires, groupe, hors_volume, drapeaux, ...(cible_inconnue && { cible_inconnue }) };
}
