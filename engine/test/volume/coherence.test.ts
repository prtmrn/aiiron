// Cohérence de knowledge/hypertrophie/mapping-muscles.json (v3) avec data/exercises/
import { describe, expect, it } from "vitest";
import dataset from "../../../data/exercises/exercises.json";
import aiiron from "../../../data/exercises/exercices-aiiron.json";
import { donneesVolume as d } from "../../src/volume/donnees";

const { mapping, exercices } = d;
const muscles = new Set(mapping.muscles.map((m) => m.id));
const horsVolume = Object.values(mapping.exercices_hors_volume).flatMap((c) => c.ids);

describe("cohérence du mapping", () => {
  it("tout muscle cité dans surcharges et libelles existe dans muscles", () => {
    const cites = [
      ...Object.values(mapping.surcharges).flatMap((s) => [...s.principaux, ...s.secondaires]),
      ...Object.values(mapping.libelles).flatMap((l) => (l.muscle === null ? [] : [l.muscle])),
    ];
    expect(cites.filter((m) => !muscles.has(m))).toEqual([]);
  });

  it("tout identifiant de surcharges et exercices_hors_volume existe dans le dataset ou exercices-aiiron.json", () => {
    expect([...Object.keys(mapping.surcharges), ...horsVolume].filter((id) => !exercices.has(id))).toEqual([]);
  });

  it("un identifiant n'apparaît que dans une catégorie hors volume", () => {
    expect(horsVolume.length).toBe(new Set(horsVolume).size);
  });

  it("MAP-2 : tout libellé du dataset et de exercices-aiiron.json est dans la table", () => {
    const libelles = [...exercices.values()].flatMap((e) => [e.muscle_cible, e.groupe_musculaire, ...e.muscles_secondaires]);
    expect([...new Set(libelles)].filter((l) => !Object.hasOwn(mapping.libelles, l))).toEqual([]);
  });

  it("aucun identifiant mq-… ne masque un identifiant du dataset", () => {
    expect(exercices.size).toBe(dataset.exercises.length + aiiron.exercises.length);
  });

  it("fiche : 40 exercices dans exercices-aiiron.json", () => {
    expect(aiiron.exercises).toHaveLength(40);
  });
});
