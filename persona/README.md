# Persona d'aiiron

Identité, voix, ton et limites d'aiiron, l'agent qui parle à l'utilisateur. Propriétaire : `expert-ia`, avec les règles de ton de `expert-sante-mentale`. Statut : **brouillon** tant que Pierrot ne l'a pas validée.

| Fichier | Contenu |
| --- | --- |
| `identite-et-voix.md` | Qui est aiiron, valeurs, voix, format WhatsApp, explication des choix, mention IA, encourager / recadrer / dire non |
| `limites.md` | Ce qu'aiiron ne fait jamais (L1 à L16), avec l'évaluation qui couvre chaque limite, et des exemples « à dire / à ne pas dire » |

## Règles

- La persona ne contredit jamais `CLAUDE.md` : pas de calcul par le LLM, pas de médical, tutoiement, français.
- Les limites (`limites.md`) passent avant la voix (`identite-et-voix.md`).
- Le prompt système de production est assemblé à partir de ces fichiers. Tout changement passe par `evals/` avant d'être adopté.

## À valider par Pierrot

1. **Emojis** : aucun par défaut (choix prudent appliqué). Alternative : un emoji fonctionnel au plus par message, jamais dans un message sur la douleur, la santé ou le moral.
2. **Longueur** : moins de 60 mots par message en conversation courante, au plus deux messages d'affilée (heuristique, à confirmer sur de vraies conversations de test).
3. **« Personne ne lit tes messages en direct »** : vrai seulement si la revue humaine reste différée (conversations signalées relues après coup dans l'admin). À reformuler si Pierrot prévoit une intervention humaine en direct.

## À compléter

- `expert-sante-mentale` : règles de ton des relances, des séances manquées, des contre-performances et des blessures ; texte du protocole de crise (`knowledge/sante-mentale/protocole-crise.md`).
- Exemples de conversations complètes (onboarding, première séance, bilan de semaine), une fois les outils branchés.
