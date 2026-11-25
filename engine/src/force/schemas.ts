// Schéma moteur d'un exercice (R5 « Mouvement déjà chauffé », knowledge/force/paliers-montee-en-charge.md).
// Surcouche data/exercises/schemas.json, importée telle quelle ; exercises.json n'est jamais modifié.
import donnees from "../../../data/exercises/schemas.json";
import dataset from "../../../data/exercises/exercises.json";
import { normaliserExercice } from "./variantes";

export const SCHEMAS_R5 = ["squat", "charniere", "poussee_horizontale", "poussee_verticale", "tirage"] as const;
export type Schema = (typeof SCHEMAS_R5)[number];

export const SCHEMAS = donnees.schemas as Record<string, Schema>;
for (const [id, s] of Object.entries(SCHEMAS)) {
  if (!SCHEMAS_R5.includes(s)) throw new Error(`Schéma inconnu pour ${id} : ${s}`); // bug de données
}

// R5, sens unique : chauffé sur machine guidée ne vaut pas pour la barre libre (champ materiel du catalogue)
const MATERIELS_GUIDES = new Set(["sled machine", "smith machine", "leverage machine"]);
const GUIDES = new Set(dataset.exercises.filter((e) => MATERIELS_GUIDES.has(e.materiel)).map((e) => e.id));
export const estGuide = (id: string): boolean => GUIDES.has(normaliserExercice(id));

/** Identifiant exact (alias normalisé) ; undefined si l'exercice n'a pas de schéma. */
export const schemaExercice = (id: string): Schema | undefined => {
  const ex = normaliserExercice(id);
  return Object.hasOwn(SCHEMAS, ex) ? SCHEMAS[ex] : undefined;
};
