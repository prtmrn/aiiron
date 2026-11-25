---
name: seance-complete
description: Structure obligatoire de toute séance proposée par aiiron - échauffement général et spécifique, corps de séance, retour au calme, mobilité et étirements. À utiliser dès qu'on écrit, modifie, génère ou vérifie une séance ou un modèle de semaine, quelle que soit la discipline (force, musculation, course, Hyrox, CrossFit).
---

# Séance complète

Une séance aiiron a toujours quatre blocs. Un modèle ou une séance qui en oublie un est refusé.

| Bloc | Durée indicative | Contenu |
| --- | --- | --- |
| 1. Échauffement général | 5–10 min | Cardio léger qui élève la température (vélo, rameur, footing, corde), intensité facile |
| 2. Préparation spécifique | 5–15 min | Mobilité dynamique des articulations sollicitées, activation, puis montée en charge ou gammes propres à la séance |
| 3. Corps de séance | selon le plan | Ce que prescrivent les moteurs |
| 4. Retour au calme + mobilité | 5–10 min | Retour progressif au calme, étirements statiques ou routine de mobilité ciblée |

**Version courte** (l'utilisateur manque de temps). Peuvent être réduits : le cardio d'échauffement, la mobilité dynamique (2 exercices au lieu de 4), l'activation, et les gammes, accélérations ou passages de répétition selon la dose courte de chaque protocole (`knowledge/echauffement/`). Ne sont jamais supprimés ni raccourcis : les paliers de montée en charge et les séries d'approche. Si ça ne suffit pas, on raccourcit le corps de séance.

## Préparation spécifique par type de séance

**Mobilité dynamique** — 4 exercices avant la séance (2 en version courte), choisis par type de séance dans `knowledge/mobilite/`.

**Force (séries lourdes)** — montée en charge par paliers avant chaque mouvement principal, y compris le deuxième mouvement lourd de la séance. Échelles, % et reps : `knowledge/force/paliers-montee-en-charge.md` (expert-force), jamais recopiés ici. Si le même schéma (squat, charnière, poussée horizontale, poussée verticale, tirage) a déjà eu ses paliers dans la séance, départ réduit selon cette fiche ; sinon paliers complets. Même règle en musculation pour un exercice à I ≥ 0,80. Les paliers sont calculés par le moteur force, arrondis comme les séries de travail.

**Musculation** — 1 à 2 séries d'approche légères sur le premier exercice de chaque groupe musculaire ; les exercices suivants du même groupe n'en demandent pas forcément.

**Course** — avant toute séance intense (fractionné, seuil, côtes, sprint) : 10–15 min de footing facile, 5–10 min de gammes (montées de genoux, talons-fesses, pas chassés, skippings), 2 à 4 accélérations progressives. Sortie facile : départ simplement plus lent.

**Hyrox / CrossFit** — échauffement général, puis répétition des mouvements du jour à faible intensité (stations, mouvements gymniques, haltérophilie à vide), montée en intensité progressive avant le premier bloc chronométré.

## Étirements

- Avant l'effort : étirements dynamiques et mobilité, pas d'étirements statiques longs juste avant un effort de force ou de puissance (30 s cumulées par groupe au plus si l'utilisateur y tient, règle ETI-1 de `knowledge/etirements/etirements-regles.md`).
- Après l'effort ou en séance dédiée : étirements statiques de 20 à 60 s par groupe, sans douleur, si l'objectif est la souplesse ou le confort.
- Routines de mobilité de 5 à 15 min proposées les jours de repos selon les zones raides déclarées par l'utilisateur.

## Sécurité

- Douleur pendant l'échauffement → on n'enchaîne pas sur la séance prévue : alternative indolore ou séance allégée, et orientation si ça persiste.
- Drapeaux rouges (douleur thoracique, malaise, essoufflement anormal…) → arrêt et orientation médicale (voir `expert-sante-physique`).

## Format machine (pour les modèles et le moteur)

```json
{
  "blocs": [
    { "type": "echauffement_general", "duree_min": 8, "items": [] },
    { "type": "preparation_specifique", "duree_min": 10, "items": [] },
    { "type": "corps", "items": [] },
    { "type": "retour_au_calme", "duree_min": 6, "items": [] }
  ]
}
```

Checklist avant de valider une séance :
- [ ] Les quatre blocs sont présents.
- [ ] La préparation spécifique cible les articulations et mouvements du corps de séance.
- [ ] Toute série lourde est précédée de paliers.
- [ ] Toute séance de course intense est précédée de footing, gammes et accélérations.
- [ ] La durée totale tient dans le créneau déclaré par l'utilisateur.
