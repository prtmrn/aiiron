// Chargeur : mapping v3 et exercices (dataset MIT + mq-…), importés tels quels, jamais modifiés.
// corrections.json : seules les corrections portant `validee` sont appliquées, en surcouche à la lecture.
import mapping from "../../../knowledge/hypertrophie/mapping-muscles.json";
import dataset from "../../../data/exercises/exercises.json";
import aiiron from "../../../data/exercises/exercices-aiiron.json";
import corrections from "../../../data/exercises/corrections.json";
import type { DonneesVolume, Exercice, Mapping } from "./resolution";

interface Correction {
  ids: string[];
  champ: string;
  correction_proposee: unknown;
  validee?: string;
}

/** « champ » et « correction_proposee » listent les champs et les valeurs dans le même ordre, séparés par « , ». */
export function appliquerCorrections(exercices: Map<string, Exercice>, liste: Correction[]): Map<string, Exercice> {
  const out = new Map(exercices);
  for (const c of liste.filter((c) => c.validee)) {
    const champs = c.champ.split(", ");
    const valeurs = String(c.correction_proposee).split(", ");
    if (typeof c.correction_proposee !== "string" || champs.length !== valeurs.length)
      throw new Error(`Correction validée illisible : ${c.ids.join(", ")}`);
    for (const id of c.ids) {
      const ex = out.get(id);
      if (!ex) throw new Error(`Correction validée sur un exercice absent : ${id}`);
      out.set(id, { ...ex, ...Object.fromEntries(champs.map((ch, i) => [ch, valeurs[i]])) });
    }
  }
  return out;
}

export const donneesVolume: DonneesVolume = {
  mapping: mapping as Mapping,
  exercices: appliquerCorrections(
    new Map<string, Exercice>([...dataset.exercises, ...aiiron.exercises].map((e) => [e.id, e])),
    corrections.corrections as Correction[],
  ),
};
