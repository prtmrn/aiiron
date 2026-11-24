---
id: echauffement-force
domaine: echauffement
titre: Échauffement d'une séance de force (séries lourdes)
niveau_preuve: B
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
  - titre: "Acute effects of static stretching on muscle strength and power: an attempt to clarify previous caveats"
    auteurs: "Chaabene H, Behm DG, Negra Y, Granacher U."
    annee: 2019
    url: "https://doi.org/10.3389/fphys.2019.01468"
  - titre: "Warm-up revisited: the ramp method of optimizing warm-ups"
    auteurs: "Jeffreys I."
    annee: 2007
    url: "non disponible en libre accès (Professional Strength and Conditioning, UKSCA, n° 6)"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-24
---

## Principe

Avant des séries lourdes, on monte la température avec un peu de cardio, on mobilise les articulations du mouvement du jour, on active les muscles stabilisateurs, puis on monte en charge par paliers. Un échauffement actif améliore la performance dans la majorité des critères étudiés (Fradkin 2010). Pour la force, la partie la plus spécifique, et donc la plus utile, est la montée en charge sur le mouvement lui-même : elle prépare le geste et sert de phase « potentialiser » du modèle RAMP. Les étirements statiques n'ont pas leur place ici (règle ETI-1).

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| ECH-F1 | Cardio facile 5 min (RPE 3–4), 3 min en version courte. Rameur, vélo, vélo à air, corde ou marche inclinée. | Bishop 2003 (5–10 min à intensité modérée) ; 3 min = heuristique à valider |
| ECH-F2 | Mobilité dynamique ciblée sur le premier mouvement principal : items de `mobilite-force#avant`. 4 min standard, 2 min en version courte. | Heuristique à valider |
| ECH-F3 | Activation : 2 exercices légers (1 en version courte), choisis selon le mouvement, loin de la fatigue (RPE ≤ 5). | Heuristique à valider |
| ECH-F4 | Montée en charge obligatoire avant chaque mouvement principal lourd, y compris le deuxième mouvement lourd de la séance. Nombre de paliers, % et reps : `knowledge/force/paliers-montee-en-charge.md`. Jamais raccourcie en version courte. | Skill `seance-complete` ; règle détaillée : expert-force |
| ECH-F5 | Deuxième mouvement principal de la séance : on saute le cardio et on refait seulement les items de mobilité propres à ce mouvement (1–2 min), puis ses paliers. | Heuristique à valider |
| ECH-F6 | Premier palier de travail dans les 10 min qui suivent la fin des paliers (règle ECH-4). | McGowan 2015 ; heuristique à valider |

Durée totale indicative hors paliers : 11 min standard, 6 min courte. La durée des paliers est fournie par le moteur force.

```json
{
  "id": "echauffement-force",
  "type_seance": "force",
  "versions": {
    "standard": {
      "duree_min": 11,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 5,
          "items": [ { "ex": "mq-rameur", "nom_fr": "Rameur", "duree_s": 300, "intensite": "RPE 3-4" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 4,
          "ref": "mobilite-force#avant" },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 2,
          "si": { "mouvement": ["squat", "souleve_de_terre"] },
          "items": [
            { "ex": "3013", "nom_fr": "Pont fessier au sol", "series": 1, "reps": 10, "intensite": "RPE 4-5" },
            { "ex": "0276", "nom_fr": "Dead bug", "series": 1, "reps": 6, "par_cote": true, "intensite": "lent, bas du dos au sol" }
          ] },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 2,
          "si": { "mouvement": ["developpe_couche", "developpe_militaire"] },
          "items": [
            { "ex": "mq-ecartes-elastique", "nom_fr": "Écartés à l'élastique", "series": 1, "reps": 15, "intensite": "élastique léger" },
            { "ex": "mq-rotation-externe-elastique", "nom_fr": "Rotation externe d'épaule à l'élastique", "series": 1, "reps": 10, "par_cote": true, "intensite": "élastique léger" }
          ] },
        { "bloc": "preparation_specifique", "nature": "montee_en_charge", "duree_min": null,
          "ref": "force-paliers-montee-en-charge" }
      ]
    },
    "courte": {
      "duree_min": 6,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 3,
          "items": [ { "ex": "mq-rameur", "nom_fr": "Rameur", "duree_s": 180, "intensite": "RPE 3-4" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 2,
          "ref": "mobilite-force#avant-courte" },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 1,
          "si": { "mouvement": ["squat", "souleve_de_terre"] },
          "items": [ { "ex": "3013", "nom_fr": "Pont fessier au sol", "series": 1, "reps": 10, "intensite": "RPE 4-5" } ] },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 1,
          "si": { "mouvement": ["developpe_couche", "developpe_militaire"] },
          "items": [ { "ex": "mq-ecartes-elastique", "nom_fr": "Écartés à l'élastique", "series": 1, "reps": 15, "intensite": "élastique léger" } ] },
        { "bloc": "preparation_specifique", "nature": "montee_en_charge", "duree_min": null,
          "ref": "force-paliers-montee-en-charge" }
      ]
    }
  },
  "substitutions": [
    { "si_absent": "rameur", "remplacer": "mq-rameur", "par": ["0798", "mq-air-bike", "2612", "3666"] },
    { "si_absent": "elastique", "remplacer": "mq-ecartes-elastique", "par": ["3021"] },
    { "si_absent": "elastique", "remplacer": "mq-rotation-externe-elastique", "par": ["0235", "0863"] }
  ],
  "interdits": [
    { "regle": "ETI-1", "texte": "Pas d'étirement statique dans l'échauffement. Si l'utilisateur y tient : 30 s cumulées par groupe au plus, avant la mobilité dynamique." },
    { "regle": "ECH-F4", "texte": "Ne jamais attaquer une série lourde sans paliers, même en version courte." },
    { "regle": "ECH-F3", "texte": "Pas d'activation jusqu'à la fatigue (gainage long, séries à l'échec) avant les séries lourdes." }
  ]
}
```

Substitutions : `0798` vélo d'appartement, `2612` corde à sauter, `3666` marche sur tapis incliné, `3021` pompe scapulaire, `0235` rotation externe à la poulie, `0863` rotation externe allongé à l'haltère.

## Limites et contre-indications

- Douleur pendant l'échauffement ou les paliers (pas une raideur qui s'efface en bougeant) : on ne continue pas la montée en charge. Alternative indolore ou séance allégée, orientation vers un professionnel si ça persiste (règle ECH-5).
- Drapeaux rouges (douleur thoracique, malaise, essoufflement anormal, palpitations, engourdissement) : arrêt et orientation médicale.
- Les durées de mobilité et d'activation sont des choix de coach : aucune étude ne fixe la durée optimale de ces étapes pour la force.

## Exemple

Athlète, séance « squat 4 × 5 lourd puis développé couché 3 × 6 », créneau serré, salle avec rameur et élastique.
Résultat attendu (version courte) : rameur 3 min RPE 3–4 → `mobilite-force#avant-courte` filtré sur `squat` (2 min) → pont fessier 1 × 10 → paliers squat (moteur force) → séries de squat → mobilité `developpe_couche` seule (1–2 min, règle ECH-F5) → paliers développé couché → séries. Aucun étirement statique avant la première série.
