# Moteurs déterministes

Bibliothèque TypeScript pure, sans I/O, testée (Vitest). Charges, allures, zones, cibles nutritionnelles, volumes et readiness sont calculés ici, jamais par le LLM. Chaque règle renvoie à une fiche de `knowledge/`. Propriétaire : `developpeur`.

Tests : `cd engine && npm install && npm test` (Vitest) ; types : `npm run typecheck`.
Moteur force : `src/force/` (spec `knowledge/force/`), tests `test/force/`. Le développé couché s'écrit `developpe_couche` ; `couche` est accepté en entrée et normalisé (`normaliserExercice`). Le schéma R5 de chaque exercice vient de `data/exercises/schemas.json` (`schemaExercice`). Un test `it.fails` signale un écart entre une fiche et le recalcul, à arbitrer.
Moteur volume : `src/volume/` (spec `knowledge/hypertrophie/mapping-muscles.md` et `.json`), tests `test/volume/`. `resoudreExercice` donne principaux, secondaires et groupe ; `compterVolume` compte une séance ou une semaine en volume par muscle, agrégat `deltoides` et compteur `core` à part. Les données (mapping, dataset, `mq-…`) sont chargées par `src/volume/donnees.ts` et passées en paramètre.
Évaluations : `test/evals/` vérifie la forme des fichiers `evals/*.yaml` (champs obligatoires du README, regex qui compilent, `(?i)` en tête converti en drapeau `i`), pas le comportement d'aiiron.
