---
id: echauffement-musculation
domaine: echauffement
titre: Échauffement d'une séance de musculation (hypertrophie)
niveau_preuve: C
sources:
  - titre: "Warm up II: performance changes following active warm up and how to structure the warm up"
    auteurs: "Bishop D."
    annee: 2003
    url: "https://doi.org/10.2165/00007256-200333070-00002"
  - titre: "Warm-up strategies for sport and exercise: mechanisms and applications"
    auteurs: "McGowan CJ, Pyne DB, Thompson KG, Rattray B."
    annee: 2015
    url: "https://doi.org/10.1007/s40279-015-0376-x"
  - titre: "Effects of warming-up on physical performance: a systematic review with meta-analysis"
    auteurs: "Fradkin AJ, Zazryn TR, Smoliga JM."
    annee: 2010
    url: "https://doi.org/10.1519/JSC.0b013e3181c643a0"
  - titre: "Acute effects of muscle stretching on physical performance, range of motion, and injury incidence in healthy active individuals: a systematic review"
    auteurs: "Behm DG, Blazevich AJ, Kay AD, McHugh M."
    annee: 2016
    url: "https://doi.org/10.1139/apnm-2015-0235"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-24
---

## Principe

En musculation, les charges sont modérées et les séries proches de l'échec : l'échauffement doit être court, ciblé sur la région travaillée, et ne pas fatiguer. Cardio léger, mobilité dynamique de la région du jour, une activation brève facultative, puis une à deux séries d'approche sur le premier exercice de chaque groupe musculaire. Les exercices suivants du même groupe profitent déjà de cet échauffement. Le niveau de preuve est C : peu d'études portent sur l'échauffement spécifique de l'hypertrophie, on transpose les données générales.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| ECH-M1 | Cardio facile 5 min (RPE 3–4), 3 min en version courte. | Bishop 2003 ; 3 min = heuristique à valider |
| ECH-M2 | Mobilité dynamique selon la région du jour (`haut`, `bas`, `full`) : items de `mobilite-musculation#avant`. 3 min standard (4 min en `full`), 2 min courte. | Heuristique à valider |
| ECH-M3 | Activation facultative : 1 exercice, 1 série, RPE ≤ 5. Supprimée en version courte. | Heuristique à valider |
| ECH-M4 | Séries d'approche : 1 à 2 sur le premier exercice de chaque groupe musculaire ; 0 sur les exercices suivants du même groupe. Charges et reps : `knowledge/force/paliers-montee-en-charge.md` (section musculation). Si l'exercice est un mouvement lourd à la barre (≤ 6 reps), c'est la règle force complète qui s'applique. | Skill `seance-complete` ; valeurs : expert-force |
| ECH-M5 | Les séries d'approche ne sont jamais supprimées en version courte. | Skill `seance-complete` |

Durée totale indicative hors séries d'approche : 9 min standard, 5 min courte.

```json
{
  "id": "echauffement-musculation",
  "type_seance": "musculation",
  "versions": {
    "standard": {
      "duree_min": 9,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 5,
          "items": [ { "ex": "0798", "nom_fr": "Vélo d'appartement", "duree_s": 300, "intensite": "RPE 3-4" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 3,
          "ref": "mobilite-musculation#avant" },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 1,
          "si": { "region": ["haut"] },
          "items": [ { "ex": "mq-ecartes-elastique", "nom_fr": "Écartés à l'élastique", "series": 1, "reps": 15, "intensite": "élastique léger" } ] },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 1,
          "si": { "region": ["bas", "full"] },
          "items": [ { "ex": "3013", "nom_fr": "Pont fessier au sol", "series": 1, "reps": 10, "intensite": "RPE 4-5" } ] },
        { "bloc": "preparation_specifique", "nature": "series_approche", "duree_min": null,
          "si": { "premier_exercice_du_groupe": true },
          "ref": "force-paliers-montee-en-charge#musculation" }
      ]
    },
    "courte": {
      "duree_min": 5,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 3,
          "items": [ { "ex": "0798", "nom_fr": "Vélo d'appartement", "duree_s": 180, "intensite": "RPE 3-4" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 2,
          "ref": "mobilite-musculation#avant-courte" },
        { "bloc": "preparation_specifique", "nature": "series_approche", "duree_min": null,
          "si": { "premier_exercice_du_groupe": true },
          "ref": "force-paliers-montee-en-charge#musculation" }
      ]
    }
  },
  "substitutions": [
    { "si_absent": "velo", "remplacer": "0798", "par": ["mq-rameur", "2141", "2612", "3666"] },
    { "si_absent": "elastique", "remplacer": "mq-ecartes-elastique", "par": ["3021"] }
  ],
  "interdits": [
    { "regle": "ETI-1", "texte": "Pas d'étirement statique long avant la séance : 30 s cumulées par groupe au plus si l'utilisateur y tient." },
    { "regle": "ECH-M3", "texte": "Pas d'activation qui fatigue le muscle cible avant ses séries de travail (pas de série à l'échec en échauffement)." },
    { "regle": "ECH-M5", "texte": "Ne pas supprimer les séries d'approche pour gagner du temps : on retire plutôt une série du corps de séance." }
  ]
}
```

Substitutions : `2141` elliptique, `2612` corde à sauter, `3666` marche sur tapis incliné, `3021` pompe scapulaire.

## Limites et contre-indications

- Douleur pendant les séries d'approche : on n'enchaîne pas sur les séries de travail de cet exercice. Variante indolore ou exercice remplacé, orientation vers un professionnel si ça persiste (règle ECH-5).
- Le choix 1 ou 2 séries d'approche dépend de la charge relative de l'exercice : c'est le moteur qui tranche à partir de la fiche force.

## Exemple

Séance « bas du corps » : presse à cuisses, fentes, leg curl, mollets. 60 min disponibles.
Résultat attendu : vélo 5 min → `mobilite-musculation#avant` région `bas` (3 min) → pont fessier 1 × 10 → séries d'approche sur la presse (premier exercice quadriceps et fessiers) , sur le leg curl (premier exercice ischio-jambiers) et sur les mollets → aucune série d'approche sur les fentes ni sur un deuxième exercice de quadriceps.
