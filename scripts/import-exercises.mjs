// Importe la base d'exercices de hasaneyldrm/exercises-dataset (données MIT, sans médias)
// et écrit une version allégée en français dans data/exercises/exercises.json.
//
// Usage :
//   node scripts/import-exercises.mjs                 # télécharge la version épinglée
//   node scripts/import-exercises.mjs chemin/exercises.json   # depuis un fichier local
//
// Les médias (© Gym visual) ne sont pas copiés : usage commercial soumis à licence.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const COMMIT = "7455efae41b330c265e7cd4b78dfa848e7ce5ebd";
const URL = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/${COMMIT}/data/exercises.json`;
const OUT = "data/exercises/exercises.json";

const source = process.argv[2];
const raw = source
  ? JSON.parse(await readFile(source, "utf8"))
  : await (await fetch(URL)).json();

const exercises = raw.map((e) => ({
  id: e.id,
  nom_en: e.name,
  partie_du_corps: e.body_part,
  materiel: e.equipment,
  muscle_cible: e.target,
  groupe_musculaire: e.muscle_group,
  muscles_secondaires: e.secondary_muscles,
  etapes_fr: e.instruction_steps?.fr ?? [],
  media_id: e.media_id,
  attribution_media: e.attribution,
}));

await mkdir("data/exercises", { recursive: true });
await writeFile(OUT, JSON.stringify({ source: `hasaneyldrm/exercises-dataset@${COMMIT}`, licence: "MIT (données) — médias © Gym visual non inclus", exercises }, null, 1) + "\n");
console.log(`${exercises.length} exercices écrits dans ${OUT}`);
