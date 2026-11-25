// Schéma moteur des exercices (R5 « Mouvement déjà chauffé », knowledge/force/paliers-montee-en-charge.md) :
// surcouche data/exercises/schemas.json, cohérence avec le catalogue et variantes.ts
import { describe, expect, it } from "vitest";
import dataset from "../../../data/exercises/exercises.json";
import aiiron from "../../../data/exercises/exercices-aiiron.json";
import { SCHEMAS, SCHEMAS_R5, estGuide, schemaExercice } from "../../src/force/schemas";
import { ALIAS_EXERCICES, COEFS_VARIANTES } from "../../src/force/variantes";

const idsMoteur = new Set(Object.entries(COEFS_VARIANTES).flatMap(([id, { base }]) => [id, base]));
const idsCatalogue = new Set([...dataset.exercises, ...aiiron.exercises].map((e) => e.id));

describe("schemas.json", () => {
  it("valeurs dans la liste de R5", () => {
    for (const s of Object.values(SCHEMAS)) expect(SCHEMAS_R5).toContain(s);
  });

  it("chaque identifiant existe (catalogue ou moteur force), aucun alias en clé", () => {
    for (const id of Object.keys(SCHEMAS)) {
      expect(idsCatalogue.has(id) || idsMoteur.has(id), id).toBe(true);
      expect(Object.hasOwn(ALIAS_EXERCICES, id), id).toBe(false);
    }
  });

  it("toutes les variantes de variantes.ts et leurs bases ont un schéma", () => {
    for (const id of idsMoteur) expect(schemaExercice(id), id).toBeDefined();
  });

  it.each([
    ["0043", "squat"], // back squat (T17, T17 bis)
    ["0042", "squat"], // front squat (T17 bis)
    ["0739", "squat"], // presse à cuisses (T17)
    ["0025", "poussee_horizontale"], // couché barre (T17)
    ["0027", "tirage"], // rowing barre (T17)
    ["0743", "squat"], // hack squat machine, aligné sur la presse
    ["0770", "squat"], // squat à la Smith
    ["squat_avant", "squat"],
    ["developpe_militaire", "poussee_verticale"],
    ["sdt_roumain", "charniere"],
    ["couche", "poussee_horizontale"], // alias
  ])("%s → %s", (id, schema) => {
    expect(schemaExercice(id)).toBe(schema);
  });

  it("machines guidées (sens unique de R5) : presse, hack squat, Smith ; barre libre et variantes moteur non", () => {
    for (const id of ["0739", "0743", "0760", "0770"]) expect(estGuide(id), id).toBe(true);
    for (const id of ["0043", "0042", "squat", "couche", "souleve_de_terre"]) expect(estGuide(id), id).toBe(false);
  });

  it("exercice sans schéma : undefined (R5, le mouvement est l'exercice lui-même)", () => {
    expect(schemaExercice("curl_halteres")).toBeUndefined();
    expect(schemaExercice("0336")).toBeUndefined(); // fentes : unilatéral, pas de schéma (R5, critère 2)
    expect(schemaExercice("0046")).toBeUndefined(); // barbell hack squat : entre squat et charnière (R5, critère 3)
    expect(schemaExercice("0047")).toBeUndefined(); // incliné à 45° : entre horizontal et vertical (R5, critère 3)
    expect(schemaExercice("constructor")).toBeUndefined();
  });
});
