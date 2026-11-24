---
id: retour-au-calme-course
domaine: etirements
titre: Retour au calme et étirements après une séance de course
niveau_preuve: B
sources:
  - titre: "Do we need a cool-down after exercise? A narrative review of the psychophysiological effects and the effects on performance, injuries and the long-term adaptive response"
    auteurs: "Van Hooren B, Peake JM."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-018-0916-2"
  - titre: "American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise"
    auteurs: "Garber CE, Blissmer B, Deschenes MR, et al."
    annee: 2011
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb"
  - titre: "The effectiveness of post-exercise stretching in short-term and delayed recovery of strength, range of motion and delayed onset muscle soreness: a systematic review and meta-analysis of randomized controlled trials"
    auteurs: "Afonso J, Clemente FM, Nakamura FY, et al."
    annee: 2021
    url: "https://doi.org/10.3389/fphys.2021.677581"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Après une séance intense de course, on redescend progressivement : footing très lent ou marche, puis étirements doux des mollets, des cuisses et des hanches. Après une sortie facile, la fin de la sortie fait office de retour au calme : on garde seulement quelques étirements si l'utilisateur le souhaite. Le footing de retour au calme sert au confort ; son effet sur la récupération est faible (Van Hooren et Peake 2018).

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| RAC-C1 | Séance intense : 8 min de footing très lent ou de marche (fourchette 5–10), RPE 2–3. Version courte : 5 min. Si le plan de expert-course prévoit déjà un retour au calme couru, on ne l'ajoute pas une seconde fois. | Skill `seance-complete` ; Van Hooren et Peake 2018 ; durées = heuristique à valider |
| RAC-C2 | Sortie facile : pas de cardio supplémentaire ; les 3 à 5 dernières minutes sont courues plus lentement ou marchées. | Heuristique à valider |
| RAC-C3 | Étirements : liste fixe (JSON), 5 groupes en standard, 3 en courte, dosage ETI-2. | Garber 2011 ; liste = heuristique à valider |
| RAC-C4 | Après une course longue ou une compétition, aiiron ne prescrit pas d'étirement intense : 1 × 30 s, tension légère. | Heuristique à valider |

Durée indicative séance intense : 13 min standard (8 + 5), 8 min courte (5 + 3).

```json
{
  "id": "retour-au-calme-course",
  "type_seance": "course",
  "versions": {
    "standard": { "duree_min": 13, "etapes": [
      { "bloc": "retour_au_calme", "nature": "cardio", "duree_min": 8, "si": { "seance": ["intense"] },
        "items": [ { "ex": "mq-footing", "nom_fr": "Footing très lent ou marche", "duree_s": 480, "intensite": "RPE 2-3" } ] },
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 5, "nb_groupes": 5,
        "groupes": ["mollets", "soleaire", "ischio_jambiers", "quadriceps", "flechisseurs_hanche"],
        "dosage": "etirements-regles#dosage.apres_confort" }
    ] },
    "courte": { "duree_min": 8, "etapes": [
      { "bloc": "retour_au_calme", "nature": "cardio", "duree_min": 5, "si": { "seance": ["intense"] },
        "items": [ { "ex": "mq-footing", "nom_fr": "Footing très lent ou marche", "duree_s": 300, "intensite": "RPE 2-3" } ] },
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 3, "nb_groupes": 3,
        "groupes": ["mollets", "ischio_jambiers", "quadriceps"],
        "dosage": "etirements-regles#dosage.apres_confort" }
    ] }
  },
  "variantes": {
    "trail_ou_cotes": { "remplacer_groupe": { "soleaire": "fessiers" } }
  },
  "interdits": [
    { "regle": "RAC-C4", "texte": "Pas d'étirement poussé après une course longue ou une compétition." },
    { "regle": "ETI-3", "texte": "Ne pas annoncer que les étirements éviteront les courbatures." }
  ]
}
```

## Limites et contre-indications

- Douleur qui apparaît pendant ou après la séance et persiste en marchant : pas d'étirement de la zone ; orientation vers un professionnel si elle persiste ou revient.
- Malaise, essoufflement anormal, douleur thoracique, palpitations à la fin de l'effort : arrêt et orientation médicale immédiate (urgences si nécessaire).

## Exemple

Séance de seuil 3 × 10 min, version standard, plan sans retour au calme couru.
Résultat attendu : footing très lent 8 min → mollets, soléaire, ischio-jambiers, quadriceps, fléchisseurs de hanche, 1 × 30 s par côté.
