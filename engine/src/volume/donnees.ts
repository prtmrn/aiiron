// Chargeur : mapping v3 et exercices (dataset MIT + mq-…), importés tels quels, jamais modifiés.
// corrections.json n'est pas appliqué : propositions non validées (voir docs/contexte.md, choix techniques mineurs).
import mapping from "../../../knowledge/hypertrophie/mapping-muscles.json";
import dataset from "../../../data/exercises/exercises.json";
import aiiron from "../../../data/exercises/exercices-aiiron.json";
import type { DonneesVolume, Exercice, Mapping } from "./resolution";

export const donneesVolume: DonneesVolume = {
  mapping: mapping as Mapping,
  exercices: new Map<string, Exercice>([...dataset.exercises, ...aiiron.exercises].map((e) => [e.id, e])),
};
