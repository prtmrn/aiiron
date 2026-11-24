# Base d'exercices

`exercises.json` : 1 324 exercices issus de [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (version épinglée dans le fichier), allégés et en français (`etapes_fr`).

- **Données** (noms, catégories, muscles, matériel, instructions) : licence MIT, voir `LICENSE-upstream.txt`.
- **Médias** (images et GIF) : © Gym visual — https://gymvisual.com/. Non inclus. Redistribués par le dépôt source avec une permission qui ne s'étend pas à nous : pour les afficher dans l'app commerciale, il faut notre propre licence Gym visual (voir `NOTICE-upstream.md`). En développement, `media_id` permet de retrouver le visuel.

Trous connus, à combler par les experts : peu d'exercices de mobilité et d'échauffement (≈57 étirements), pas de gammes de course, stations Hyrox incomplètes, noms uniquement en anglais.

Régénérer : `node scripts/import-exercises.mjs`.
