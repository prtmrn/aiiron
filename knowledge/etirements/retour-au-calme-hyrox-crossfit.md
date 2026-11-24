---
id: retour-au-calme-hyrox-crossfit
domaine: etirements
titre: Retour au calme et étirements après une séance Hyrox ou CrossFit
niveau_preuve: C
sources:
  - titre: "Do we need a cool-down after exercise? A narrative review of the psychophysiological effects and the effects on performance, injuries and the long-term adaptive response"
    auteurs: "Van Hooren B, Peake JM."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-018-0916-2"
  - titre: "American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise"
    auteurs: "Garber CE, Blissmer B, Deschenes MR, et al."
    annee: 2011
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Une séance Hyrox ou CrossFit finit souvent à très haute intensité : on ne s'arrête pas net, on marche ou on rame doucement quelques minutes, puis on étire les groupes les plus sollicités. La liste dépend des mouvements du jour ; à défaut, une liste « corps entier » s'applique. Le niveau C reflète l'absence d'étude propre à ces disciplines.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| RAC-H1 | Cardio de retour au calme : 4 min à RPE 2–3 (marche, rameur, vélo), 3 min en version courte. Non supprimé en version courte, car la séance se termine en général à haute intensité. | Van Hooren et Peake 2018 (ETI-6) ; durées validées par Pierrot le 25/11/2026 |
| RAC-H2 | Étirements : on additionne les groupes des familles de mouvements du jour (JSON) et on garde les plus fréquents, 5 en standard, 3 en courte ; à égalité, ordre de la liste `corps_entier`. | Garber 2011 ; tableau des familles validé par Pierrot le 25/11/2026 ; règle de comptage = heuristique à valider |
| RAC-H3 | Dosage ETI-2 : 1 × 30 s par côté. | Garber 2011 |

Durée indicative : 9 min standard (4 + 5), 6 min courte (3 + 3).

```json
{
  "id": "retour-au-calme-hyrox-crossfit",
  "type_seance": "hyrox_crossfit",
  "versions": {
    "standard": { "duree_min": 9, "etapes": [
      { "bloc": "retour_au_calme", "nature": "cardio", "duree_min": 4,
        "items": [ { "ex": "mq-marche", "nom_fr": "Marche ou rameur très facile", "duree_s": 240, "intensite": "RPE 2-3" } ] },
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 5, "nb_groupes": 5,
        "dosage": "etirements-regles#dosage.apres_confort" }
    ] },
    "courte": { "duree_min": 6, "etapes": [
      { "bloc": "retour_au_calme", "nature": "cardio", "duree_min": 3,
        "items": [ { "ex": "mq-marche", "nom_fr": "Marche ou rameur très facile", "duree_s": 180, "intensite": "RPE 2-3" } ] },
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 3, "nb_groupes": 3,
        "dosage": "etirements-regles#dosage.apres_confort" }
    ] }
  },
  "groupes_par_famille": {
    "course": ["mollets", "ischio_jambiers", "flechisseurs_hanche"],
    "rameur_ski": ["dorsaux", "ischio_jambiers", "lombaires"],
    "traineau": ["quadriceps", "mollets", "fessiers"],
    "fentes": ["flechisseurs_hanche", "quadriceps", "fessiers"],
    "wall_ball_squat": ["quadriceps", "fessiers", "epaules_arriere"],
    "halterophilie": ["quadriceps", "ischio_jambiers", "avant_bras"],
    "gymnastique_tirage": ["dorsaux", "avant_bras", "pectoraux"],
    "gymnastique_appui": ["pectoraux", "triceps", "avant_bras"],
    "burpees": ["pectoraux", "flechisseurs_hanche", "mollets"],
    "corps_entier": ["flechisseurs_hanche", "ischio_jambiers", "dorsaux", "quadriceps", "mollets"]
  },
  "interdits": [
    { "regle": "RAC-H1", "texte": "Ne pas s'arrêter net et s'allonger juste après un bloc maximal : marcher d'abord." },
    { "regle": "ETI-3", "texte": "Ne pas annoncer que les étirements accéléreront la récupération." }
  ]
}
```

## Limites et contre-indications

- Malaise, vertige qui ne passe pas, douleur thoracique, palpitations, essoufflement anormal après le bloc : arrêt et orientation médicale immédiate (urgences si nécessaire).
- Douleur localisée apparue pendant la séance : pas d'étirement de la zone, orientation si elle persiste.

## Exemple

Séance Hyrox « course + traîneau + fentes », version standard.
Résultat attendu : comptage : fléchisseurs de hanche 2, quadriceps 2, fessiers 2, mollets 2, ischio-jambiers 1. Les quatre groupes à 2 sont gardés et départagés par l'ordre `corps_entier` : fléchisseurs de hanche, quadriceps, mollets, puis fessiers (absent de `corps_entier`, il passe après) ; 5e groupe : ischio-jambiers. Marche 4 min puis 5 étirements de 30 s par côté.
