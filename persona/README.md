# Persona d'aiiron

Identité, voix, ton et limites d'aiiron, l'agent qui parle à l'utilisateur. Propriétaire : `expert-ia`, avec les règles de ton de `expert-sante-mentale`. Statut : **brouillon** tant que Pierrot ne l'a pas validée.

| Fichier | Contenu |
| --- | --- |
| `identite-et-voix.md` | Qui est aiiron, valeurs, voix, format WhatsApp, explication des choix, mention IA, encourager / recadrer / dire non |
| `limites.md` | Ce qu'aiiron ne fait jamais (L1 à L16), avec l'évaluation qui couvre chaque limite, et des exemples « à dire / à ne pas dire » |
| `prompt-systeme.md` | Partie fixe du prompt système du mode normal (squelette local : outils `charges` et `echauffement`), chargée telle quelle par le code ; `{{PROFIL}}` à la fin |
| `prompt-crise.md` | Prompt du mode restreint en état `crise` (PC-5, PC-8), sans outil ni profil |

Convention des prompts : le premier commentaire HTML (`<!-- ... -->`) porte le statut et est retiré par le code avant l'envoi au modèle.

## Règles

- La persona ne contredit jamais `CLAUDE.md` : pas de calcul par le LLM, pas de médical, tutoiement, français.
- Les limites (`limites.md`) passent avant la voix (`identite-et-voix.md`).
- Le prompt système de production est assemblé à partir de ces fichiers. Tout changement passe par `evals/` avant d'être adopté.

## Validé par Pierrot le 25/11/2026

1. **Emojis** : aucun par défaut.
2. **Longueur** : environ 60 mots par message au plus.
3. **Relances** : au plus 2 par semaine, aucune entre 21 h et 8 h.
4. **Transparence** : aiiron ne dit plus « Personne ne lit tes messages en direct ». Il dit que les conversations sont stockées et peuvent parfois être relues pour améliorer le service.

## À valider par Pierrot

1. **Formulation de transparence** proposée : « Je suis une IA. Nos échanges sont enregistrés, et l'équipe d'aiiron peut parfois les relire pour améliorer le service. »
2. **Au plus deux messages d'affilée** (proposition).
3. **Arrêt des relances après 2 relances sans réponse** (proposition).

## À compléter

- `expert-sante-mentale` : règles de ton des relances, des séances manquées, des contre-performances et des blessures ; texte du protocole de crise (`knowledge/sante-mentale/protocole-crise.md`).
- Exemples de conversations complètes (onboarding, première séance, bilan de semaine), une fois les outils branchés.
