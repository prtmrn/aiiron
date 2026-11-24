---
id: retour-au-calme-musculation
domaine: etirements
titre: Retour au calme et étirements après une séance de musculation
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
  - titre: "Stretching to prevent or reduce muscle soreness after exercise"
    auteurs: "Herbert RD, de Noronha M, Kamper SJ."
    annee: 2011
    url: "https://doi.org/10.1002/14651858.CD004577.pub3"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Après une séance de musculation, on étire les groupes qui ont reçu le plus de séries, sans douleur et sans chercher à « éliminer » les courbatures, ce que les étirements ne font pas de façon utile (Herbert 2011). Le cardio de retour au calme est facultatif. Dosage : `etirements-regles.md`.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| RAC-M1 | Cardio facultatif : 3 min à RPE 2–3 en standard, supprimé en version courte. | Van Hooren et Peake 2018 (ETI-6) |
| RAC-M2 | Groupes étirés : les groupes du corps de séance classés par nombre de séries réalisées (le moteur hypertrophie fournit le compte), 5 en standard, 3 en courte. Correspondance muscle → groupe d'étirement dans le JSON. | Garber 2011 ; classement = heuristique à valider |
| RAC-M3 | Dosage ETI-2 : 1 × 30 s par côté ; 2 × 30 s si objectif souplesse. | Garber 2011 |

Durée indicative : 8 min standard, 3 min courte.

```json
{
  "id": "retour-au-calme-musculation",
  "type_seance": "musculation",
  "versions": {
    "standard": { "duree_min": 8, "etapes": [
      { "bloc": "retour_au_calme", "nature": "cardio", "duree_min": 3, "facultatif": true,
        "items": [ { "ex": "0798", "nom_fr": "Vélo ou marche", "duree_s": 180, "intensite": "RPE 2-3" } ] },
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 5, "nb_groupes": 5,
        "tri": "series_realisees_desc", "dosage": "etirements-regles#dosage.apres_confort" }
    ] },
    "courte": { "duree_min": 3, "etapes": [
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 3, "nb_groupes": 3,
        "tri": "series_realisees_desc", "dosage": "etirements-regles#dosage.apres_confort" }
    ] }
  },
  "muscle_vers_groupe_etirement": {
    "pectoraux": "pectoraux", "dos": "dorsaux", "trapezes": "cou", "deltoides_anterieurs": "pectoraux",
    "deltoides_lateraux": "epaules_arriere", "deltoides_posterieurs": "epaules_arriere",
    "biceps": "pectoraux", "triceps": "triceps", "avant_bras": "avant_bras",
    "quadriceps": "quadriceps", "ischio_jambiers": "ischio_jambiers", "fessiers": "fessiers",
    "adducteurs": "adducteurs", "mollets": "mollets", "abdominaux": "flancs", "lombaires": "lombaires"
  },
  "interdits": [
    { "regle": "ETI-3", "texte": "Ne pas annoncer que les étirements réduiront les courbatures." }
  ]
}
```

Note : la liste des muscles doit être alignée sur `knowledge/hypertrophie/mapping-muscles.json` (expert-hypertrophie) quand il existera. Biceps → pectoraux : l'étirement à l'encadrement de porte bras tendu étire aussi l'avant du bras (choix de conception).

## Limites et contre-indications

- Douleur pendant un étirement : arrêt, orientation si elle persiste. Engourdissement ou faiblesse : arrêt et orientation médicale.

## Exemple

Séance « dos et biceps » : 10 séries dos, 6 séries biceps, 3 séries arrière d'épaule. Version courte.
Résultat attendu : 3 groupes : dorsaux (dos, 10), pectoraux (biceps, 6), arrière d'épaule (3), 1 × 30 s par côté.
