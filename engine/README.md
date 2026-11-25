# Moteurs déterministes

Bibliothèque TypeScript pure, sans I/O, testée (Vitest). Charges, allures, zones, cibles nutritionnelles, volumes et readiness sont calculés ici, jamais par le LLM. Chaque règle renvoie à une fiche de `knowledge/`. Propriétaire : `developpeur`.

Tests : `cd engine && npm install && npm test` (Vitest) ; types : `npm run typecheck`.
Moteur force : `src/force/` (spec `knowledge/force/`), tests `test/force/`. Un test `it.fails` signale un écart entre une fiche et le recalcul, à arbitrer.
