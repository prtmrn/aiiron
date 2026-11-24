---
id: mobilite-musculation
domaine: mobilite
titre: Mobilité avant et après une séance de musculation
niveau_preuve: C
sources:
  - titre: "Acute effects of dynamic stretching on muscle flexibility and performance: an analysis of the current literature"
    auteurs: "Opplert J, Babault N."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-017-0797-9"
  - titre: "American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise"
    auteurs: "Garber CE, Blissmer B, Deschenes MR, et al."
    annee: 2011
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

En musculation, la mobilité d'avant séance dépend de la région travaillée, pas d'un mouvement unique : haut du corps (colonne thoracique, épaules), bas du corps (hanches, chevilles), corps entier (hanches, épaules). Elle est courte, parce que les séries d'approche préparent ensuite chaque groupe musculaire. Après la séance, une routine autonome est facultative et ne sert que si une zone raide est déclarée.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MOB-M1 | Avant : modules dynamiques selon la région (JSON), 2 à 3 min. | Opplert et Babault 2018 ; association région → modules validée par Pierrot le 25/11/2026 |
| MOB-M2 | Version courte : **2 exercices** par région, liste `avant-courte` (JSON), chacun avec le dosage de son module. | 2 exercices : décision de Pierrot du 25/11/2026 ; choix des 2 exercices = heuristique à valider |
| MOB-M3 | Après : facultatif, 1 module `-autonome` de la zone raide déclarée, après les étirements. | Garber 2011 ; validé par Pierrot le 25/11/2026 |

```json
{
  "id": "mobilite-musculation",
  "type_seance": "musculation",
  "avant": {
    "haut": ["thoracique-dynamique", "epaule-dynamique"],
    "bas": ["hanche-dynamique", "cheville-dynamique"],
    "full": ["hanche-dynamique", "epaule-dynamique"]
  },
  "avant-courte": {
    "haut": [ { "module": "thoracique-dynamique", "ex": "mq-open-book" }, { "module": "epaule-dynamique", "ex": "mq-passage-epaules" } ],
    "bas": [ { "module": "hanche-dynamique", "ex": "mq-90-90" }, { "module": "cheville-dynamique", "ex": "mq-genou-mur" } ],
    "full": [ { "module": "hanche-dynamique", "ex": "mq-90-90" }, { "module": "epaule-dynamique", "ex": "mq-passage-epaules" } ]
  },
  "apres": {
    "facultatif": true,
    "si": { "zone_raide_declaree": true },
    "modules_max": 1,
    "source_modules": "mobilite-modules#routine_autonome.zone_vers_module"
  },
  "interdits": [
    { "regle": "MOB-1", "texte": "Pas de maintien statique de plus de 5 s dans la mobilité d'avant séance." }
  ]
}
```

Durées : haut 3 min, bas 3 min, full 4 min (somme des modules). Versions courtes : 2 exercices.

## Limites et contre-indications

- Douleur dans une amplitude : on n'insiste pas, l'exercice de musculation concerné est remplacé par une variante indolore ; orientation si ça persiste.

## Exemple

Séance « haut du corps » (développé incliné, tirage, élévations latérales), version courte.
Résultat attendu : open book 1 × 6 par côté et passages d'épaules 1 × 10 (liste `avant-courte` de `haut`), puis séries d'approche sur le premier exercice de pectoraux et de dos, non raccourcies malgré la version courte.
