---
id: retour-au-calme-force
domaine: etirements
titre: Retour au calme et étirements après une séance de force
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

Après une séance de force, le cœur redescend vite : quelques minutes de marche ou de vélo sont facultatives. Le bloc 4 sert surtout à étirer, sans douleur, les groupes qui ont travaillé, pour le confort et l'amplitude. On ne promet pas une meilleure récupération (règle ETI-3). Les règles de dosage sont dans `etirements-regles.md`.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| RAC-F1 | Cardio de retour au calme facultatif : 3 min de marche ou vélo à RPE 2–3 en standard, supprimé en version courte. | Van Hooren et Peake 2018 (ETI-6) |
| RAC-F2 | Étirements : 5 groupes en standard, 3 en version courte, pris dans l'ordre de la liste du mouvement principal (JSON). Dosage ETI-2 : 1 × 30 s par côté, 2 × 30 s si objectif souplesse. | Garber 2011 ; listes validées par Pierrot le 25/11/2026 |
| RAC-F3 | Séance avec deux mouvements principaux : on fusionne les listes en alternant (1er du mouvement A, 1er du mouvement B, etc.), sans doublon. | Heuristique à valider |
| RAC-F4 | Respiration lente 1 min en fin de bloc : facultative (ETI-8). | Validé par Pierrot le 25/11/2026 |

Durée indicative : 8 min standard (3 + 5), 3 min courte.

```json
{
  "id": "retour-au-calme-force",
  "type_seance": "force",
  "versions": {
    "standard": { "duree_min": 8, "etapes": [
      { "bloc": "retour_au_calme", "nature": "cardio", "duree_min": 3, "facultatif": true,
        "items": [ { "ex": "0798", "nom_fr": "Vélo ou marche", "duree_s": 180, "intensite": "RPE 2-3" } ] },
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 5, "nb_groupes": 5,
        "dosage": "etirements-regles#dosage.apres_confort" },
      { "bloc": "retour_au_calme", "nature": "respiration", "duree_min": 1, "facultatif": true,
        "items": [ { "ex": "mq-respiration", "nom_fr": "Respiration lente allongé", "duree_s": 60 } ] }
    ] },
    "courte": { "duree_min": 3, "etapes": [
      { "bloc": "retour_au_calme", "nature": "etirements_statiques", "duree_min": 3, "nb_groupes": 3,
        "dosage": "etirements-regles#dosage.apres_confort" }
    ] }
  },
  "groupes_par_mouvement": {
    "squat": ["quadriceps", "fessiers", "adducteurs", "flechisseurs_hanche", "mollets"],
    "souleve_de_terre": ["ischio_jambiers", "fessiers", "lombaires", "dorsaux", "avant_bras"],
    "developpe_couche": ["pectoraux", "triceps", "epaules_arriere", "dorsaux", "avant_bras"],
    "developpe_militaire": ["dorsaux", "triceps", "pectoraux", "epaules_arriere", "cou"]
  },
  "interdits": [
    { "regle": "ETI-3", "texte": "Ne pas annoncer que les étirements réduiront les courbatures ou accéléreront la récupération." },
    { "regle": "ETI-5", "texte": "Pas d'étirement douloureux ni de rebonds." }
  ]
}
```

## Limites et contre-indications

- Douleur pendant un étirement : arrêt, et orientation vers un professionnel si elle persiste. Engourdissement ou faiblesse : arrêt et orientation médicale.

## Exemple

Séance « squat puis développé couché », version standard.
Résultat attendu : vélo 3 min (facultatif) → fusion RAC-F3 : quadriceps, pectoraux, fessiers, triceps, adducteurs (5 groupes, 1 × 30 s par côté) → respiration 1 min facultative.
