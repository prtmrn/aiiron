# aiiron

Coach IA multisport et santé, en français, qui vit dans WhatsApp. aiiron est aussi le prénom de l'agent qui parle à l'utilisateur.
Modèle d'inspiration : Standout (standout.work) — profil vivant construit en conversation, agent proactif qui travaille en arrière-plan, actions concrètes, présence là où vit l'utilisateur.

Disciplines : force / powerlifting, musculation / hypertrophie, course (sprint → marathon, trail), Hyrox, CrossFit, nutrition, santé physique (échauffement, mobilité, étirements, récupération, sommeil, métriques wearables), santé mentale du sportif.

Documents de référence (projet Claude « aiiron ») : rapport Standout → aiiron, `aiiron-decisions.md`, `aiiron-sources-muscu.md`.

## La session principale est l'orchestrateur

Dans ce repo, la session principale de Claude Code joue le rôle d'orchestrateur. Elle :
1. découpe la demande en tâches et choisit le ou les sous-agents (`.claude/agents/`) ;
2. leur donne un brief complet (les sous-agents ne voient pas la conversation) ;
3. relit, vérifie et intègre leurs livrables ;
4. arbitre quand deux experts se contredisent, et remonte à Pierrot ce qui relève d'un choix produit.

Les sous-agents ne peuvent pas se déléguer entre eux : toute coordination passe par la session principale.

| Sous-agent | Périmètre |
| --- | --- |
| `expert-force` | Powerlifting, force, haltérophilie de base, mouvements lourds du Hyrox et du CrossFit |
| `expert-hypertrophie` | Musculation, volume par muscle, sélection d'exercices, splits |
| `expert-course` | Course de 100 m au marathon, trail, conditionnement (ergos, metcons, partie cardio du Hyrox) |
| `expert-nutrition` | Besoins énergétiques, macros, timing, hydratation, compléments, garde-fous TCA |
| `expert-sante-physique` | Échauffement, mobilité, étirements, prévention, douleur, récupération, sommeil, wearables |
| `expert-sante-mentale` | Motivation, adhérence, stress, anxiété de performance, protocole de crise |
| `expert-ia` | Identité et voix d'aiiron, prompts, architecture agent, mémoire, évaluations |
| `developpeur` | Moteurs déterministes, données, interface admin, application |

Hyrox et CrossFit : l'orchestrateur combine `expert-force` + `expert-course` (+ `expert-sante-physique` pour l'échauffement).

## Principes non négociables

1. **Le code calcule, le LLM converse.** Charges, allures, zones cardio, cibles nutritionnelles et volumes sont calculés par les moteurs de `engine/`, testés. Jamais par un LLM.
2. **Bien-être et performance, jamais médical.** Pas de diagnostic, pas de programme par pathologie, pas d'interprétation clinique des métriques. Douleur, symptôme, pathologie ou détresse → aiiron arrête de prescrire sur ce point et oriente vers un professionnel.
3. **Toute séance est complète** : échauffement (général puis spécifique), corps de séance, retour au calme, mobilité. Voir le skill `seance-complete`.
4. **Inspiration, jamais copie.** On ne reproduit ni programmes, ni tableurs, ni textes de sources payantes (Nippard, Buttermore, Delavier, Helms, etc.). On en tire des principes et on écrit nos propres modèles. Les formules scientifiques publiques sont utilisables, avec leur source.
5. **Tout est sourcé.** Chaque fiche de `knowledge/` suit le skill `fiche-connaissance` : sources, niveau de preuve, statut de validation.
6. **Français, tutoiement** côté utilisateur.
7. **Données de santé (RGPD art. 9).** Aucune donnée réelle d'utilisateur dans le repo. Aucun secret commité : clés dans `.env` (ignoré) ou variables d'environnement.
8. **Médias d'exercices.** `data/exercises/` reprend les données MIT du dataset hasaneyldrm/exercises-dataset. Les images et GIF (© Gym visual) ne sont pas commités : usage commercial soumis à une licence Gym visual.

## Mécanique produit centrale : « semaine type → programme »

L'utilisateur donne sa semaine type (créneaux, durée, matériel, lieu) et ses contraintes (objectif, niveau, discipline, blessures, préférences).
aiiron cherche dans `knowledge/modeles/` les modèles de semaines les plus proches, les adapte avec les moteurs (charges, allures, volumes), ajoute échauffement et mobilité, puis explique ses choix en une ou deux phrases.
Les modèles sont écrits par les experts, inspirés de programmes existants, sans copie.

## Structure

```
CLAUDE.md                 ce fichier
.claude/agents/           l'équipe de construction (sous-agents)
.claude/skills/           méthodes partagées (seance-complete, fiche-connaissance)
.claude/settings.json     plugins à installer pour ce repo
.mcp.json                 serveurs MCP (Hevy) — clés via variables d'environnement
knowledge/                bases de connaissances rédigées par les experts
persona/                  identité et voix d'aiiron (expert-ia)
data/exercises/           base d'exercices (données MIT, sans médias)
engine/                   moteurs déterministes TypeScript + tests
app/                      interface admin puis application (plus tard)
evals/                    conversations de test (douleur, crise, hors sujet, log ambigu…)
scripts/                  imports et outils
docs/                     architecture et décisions techniques
```

## Façon de travailler

- Commits petits, messages en français, un sujet par commit.
- Moteurs : tests d'abord, puis code. Pas de nombre magique sans source dans `knowledge/`.
- Une fiche ou un modèle reste au statut `brouillon` tant que Pierrot ne l'a pas validé.
- En cas de doute sur un choix produit, demander à Pierrot plutôt que décider.
