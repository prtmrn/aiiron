---
id: echauffement-course
domaine: echauffement
titre: Échauffement d'une séance de course (facile et intense)
niveau_preuve: C
sources:
  - titre: "Warm-up strategies for sport and exercise: mechanisms and applications"
    auteurs: "McGowan CJ, Pyne DB, Thompson KG, Rattray B."
    annee: 2015
    url: "https://doi.org/10.1007/s40279-015-0376-x"
  - titre: "Acute effects of dynamic stretching on muscle flexibility and performance: an analysis of the current literature"
    auteurs: "Opplert J, Babault N."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-017-0797-9"
  - titre: "Effect of acute static stretch on maximal muscle performance: a systematic review"
    auteurs: "Kay AD, Blazevich AJ."
    annee: 2012
    url: "https://doi.org/10.1249/MSS.0b013e318225cb27"
  - titre: "Post-activation potentiation versus post-activation performance enhancement in humans: historical perspective, underlying mechanisms, and current issues"
    auteurs: "Blazevich AJ, Babault N."
    annee: 2019
    url: "https://doi.org/10.3389/fphys.2019.01359"
  - titre: "Warm up II: performance changes following active warm up and how to structure the warm up"
    auteurs: "Bishop D."
    annee: 2003
    url: "https://doi.org/10.2165/00007256-200333070-00002"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Une sortie facile s'échauffe en courant : on part simplement plus lentement. Une séance intense (fractionné, VMA, seuil, côtes, sprint, compétition) demande un vrai échauffement : footing facile, mobilité dynamique des jambes, gammes, puis quelques accélérations progressives qui amènent le corps à l'allure de la séance. Les étirements dynamiques sont neutres ou favorables à la performance qui suit, alors que les étirements statiques longs peuvent la réduire (Opplert et Babault 2018 ; Kay et Blazevich 2012). Les accélérations jouent le rôle de « potentialiser » : un effort bref et intense améliore l'effort qui suit quelques minutes plus tard (Blazevich et Babault 2019). Le niveau C vient des dosages (distances, nombre de gammes), qui sont des pratiques de coach.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| ECH-C1 | Sortie facile, endurance fondamentale, sortie longue : pas d'échauffement séparé. Les 5 à 10 premières minutes sont courues plus lentement que l'allure prévue. | Skill `seance-complete` ; 5–10 min validé par Pierrot le 25/11/2026 |
| ECH-C2 | Séance intense : footing facile 12 min (fourchette 10–15), 10 min en version courte. Allure conversation possible. | Skill `seance-complete` ; Bishop 2003 ; validé par Pierrot le 25/11/2026 |
| ECH-C3 | Mobilité dynamique 3 min : **4 exercices**, liste `mobilite-course#avant`. Version courte : **2 exercices**, liste `mobilite-course#avant-courte`. | Opplert et Babault 2018 ; durée validée par Pierrot le 25/11/2026 ; 4 exercices en standard et 2 en courte : décision de Pierrot du 25/11/2026 |
| ECH-C4 | Gammes : 2 × 20 m par exercice, retour en marchant, 6 exercices en standard (environ 7 min). Version courte : 3 exercices × 1 × 20 m (environ 3 min). Skipping B et foulées bondissantes seulement si `niveau` ≠ débutant. | Skill `seance-complete` (5–10 min) ; distances validées par Pierrot le 25/11/2026 |
| ECH-C5 | Accélérations progressives sur 80 m (fourchette 60–100 m), de l'allure footing jusqu'à environ 90 % de l'effort maximal sur les 20 derniers mètres, retour en marchant ou en trottinant (60 s environ). Nombre : seuil 2, fractionné/VMA/côtes 3, sprint ou compétition 4. Version courte : 2 pour tous. | Skill `seance-complete` (2–4) ; Blazevich et Babault 2019 ; dosage validé par Pierrot le 25/11/2026 |
| ECH-C6 | Sprint et compétition courte : la dernière accélération se termine à l'allure cible de la séance ; le premier effort de travail démarre entre 3 et 10 min après. | Blazevich et Babault 2019 ; McGowan 2015 ; fenêtre validée par Pierrot le 25/11/2026 |
| ECH-C7 | Trail, terrain accidenté ou côtes : la mobilité inclut le genou au mur (`mobilite-modules#cheville-dynamique`), à la place du world's greatest stretch (règle MOB-C3), pour rester à 4 exercices. | Ajout de la cheville validé par Pierrot le 25/11/2026 ; remplacement validé par Pierrot le 25/11/2026 (MOB-C3) |

Durée totale indicative séance intense : 22 min standard hors accélérations (12 + 3 + 7), soit 25 à 28 min avec 2 à 4 accélérations ; 18 min en version courte (10 + 2 + 3 + 3). Une accélération prend environ 1 min 30, récupération comprise (heuristique). Talons-fesses et montées de genoux se font sur place si l'espace manque.

```json
{
  "id": "echauffement-course",
  "type_seance": "course",
  "versions": {
    "standard": {
      "duree_min": 22,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 12,
          "si": { "seance": ["intense"] },
          "items": [ { "ex": "mq-footing", "nom_fr": "Footing facile", "duree_s": 720, "intensite": "RPE 3-4, conversation possible" } ] },
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": null,
          "si": { "seance": ["facile"] },
          "items": [ { "ex": "mq-footing", "nom_fr": "Départ plus lent que l'allure prévue", "duree_s": 420, "intensite": "plus lent que l'allure de la séance" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 3, "nb_exercices": 4,
          "si": { "seance": ["intense"] },
          "ref": "mobilite-course#avant" },
        { "bloc": "preparation_specifique", "nature": "gammes", "duree_min": 7,
          "si": { "seance": ["intense"] },
          "items": [
            { "ex": "mq-montees-genoux", "nom_fr": "Montées de genoux", "series": 2, "distance_m": 20, "intensite": "fréquence élevée, buste droit" },
            { "ex": "mq-talons-fesses", "nom_fr": "Talons-fesses", "series": 2, "distance_m": 20, "intensite": "fréquence élevée" },
            { "ex": "mq-pas-chasses", "nom_fr": "Pas chassés", "series": 2, "distance_m": 20, "intensite": "un aller face à gauche, un aller face à droite" },
            { "ex": "mq-skipping-a", "nom_fr": "Skipping A", "series": 2, "distance_m": 20, "intensite": "appuis actifs sous le bassin" },
            { "ex": "mq-skipping-b", "nom_fr": "Skipping B", "series": 2, "distance_m": 20, "intensite": "griffé de la jambe", "si": { "niveau_min": "intermediaire" } },
            { "ex": "mq-foulees-bondissantes", "nom_fr": "Foulées bondissantes", "series": 2, "distance_m": 20, "intensite": "amplitude, réception souple", "si": { "niveau_min": "intermediaire" } },
            { "ex": "mq-pas-croises", "nom_fr": "Pas croisés", "series": 2, "distance_m": 20, "intensite": "remplace skipping B et foulées pour un débutant", "si": { "niveau_max": "debutant" } }
          ] },
        { "bloc": "preparation_specifique", "nature": "accelerations", "duree_min": null,
          "si": { "seance": ["intense"] },
          "items": [
            { "ex": "mq-acceleration", "nom_fr": "Accélération progressive", "distance_m": 80, "intensite": "de l'allure footing à ~90 % de l'effort max", "series_selon_seance": { "seuil": 2, "fractionne": 3, "vma": 3, "cotes": 3, "sprint": 4, "competition": 4 } }
          ] }
      ]
    },
    "courte": {
      "duree_min": 18,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 10,
          "si": { "seance": ["intense"] },
          "items": [ { "ex": "mq-footing", "nom_fr": "Footing facile", "duree_s": 600, "intensite": "RPE 3-4, conversation possible" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 2, "nb_exercices": 2,
          "si": { "seance": ["intense"] },
          "ref": "mobilite-course#avant-courte" },
        { "bloc": "preparation_specifique", "nature": "gammes", "duree_min": 3,
          "si": { "seance": ["intense"] },
          "items": [
            { "ex": "mq-montees-genoux", "nom_fr": "Montées de genoux", "series": 1, "distance_m": 20, "intensite": "fréquence élevée" },
            { "ex": "mq-talons-fesses", "nom_fr": "Talons-fesses", "series": 1, "distance_m": 20, "intensite": "fréquence élevée" },
            { "ex": "mq-skipping-a", "nom_fr": "Skipping A", "series": 1, "distance_m": 20, "intensite": "appuis actifs" }
          ] },
        { "bloc": "preparation_specifique", "nature": "accelerations", "duree_min": 3,
          "si": { "seance": ["intense"] },
          "items": [ { "ex": "mq-acceleration", "nom_fr": "Accélération progressive", "series": 2, "distance_m": 80, "intensite": "de l'allure footing à ~90 % de l'effort max" } ] }
      ]
    }
  },
  "substitutions": [
    { "si_absent": "espace_20m", "remplacer": "mq-montees-genoux", "par": ["3636"] },
    { "si_absent": "exterieur", "remplacer": "mq-footing", "par": ["3666"] }
  ],
  "interdits": [
    { "regle": "ETI-1", "texte": "Pas d'étirement statique entre le footing et les accélérations ou le corps de séance ; 30 s cumulées par groupe au plus si l'utilisateur y tient, avant les gammes." },
    { "regle": "ECH-C5", "texte": "Pas d'accélération à 100 % : la vitesse maximale est réservée au corps de séance." },
    { "regle": "ECH-C1", "texte": "Ne pas imposer gammes et accélérations avant une sortie facile : un départ plus lent suffit." }
  ]
}
```

Substitution `3636` : montées de genoux contre un mur (sur place). `3666` : marche ou course sur tapis.

## Limites et contre-indications

- Douleur pendant les gammes ou les accélérations (pas une raideur qui disparaît en courant) : pas de séance intense ce jour-là. Footing facile indolore ou repos, orientation vers un professionnel si ça persiste (règle ECH-5).
- Foulées bondissantes : impact élevé, exclues pour un débutant et en période de reprise.
- Chaleur forte : footing plus court possible ; à préciser par expert-course.

## Exemple

Coureuse intermédiaire, séance 10 × 400 m (fractionné), 70 min disponibles.
Résultat attendu (standard) : footing 12 min → mobilité course 3 min → 6 gammes × 2 × 20 m (montées de genoux, talons-fesses, pas chassés, skipping A, skipping B, foulées bondissantes) → 3 accélérations de 80 m → premier 400 m dans les 10 min. Durée de l'échauffement ≈ 26 min, accélérations comprises.
