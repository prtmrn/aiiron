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
  - titre: "RAMP warm-ups: more than simply short-term preparation"
    auteurs: "Jeffreys I."
    annee: 2017
    url: "https://cdn.uksca.org.uk/assets/pdfs/UkscaIqPdfs/ramp-warmups-more-than-simply-shortterm-preparation-636825390373342631.pdf"
  - titre: "Low load exercises targeting the gluteal muscle group acutely enhance explosive power output in elite athletes"
    auteurs: "Crow JF, Buttifant D, Kearny SG, Hrysomallis C."
    annee: 2012
    url: "https://doi.org/10.1519/JSC.0b013e318220dfab"
  - titre: "Effect of a gluteal activation warm-up on explosive exercise performance"
    auteurs: "Parr M, Price PD, Cleather DJ."
    annee: 2017
    url: "https://doi.org/10.1136/bmjsem-2017-000245"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Avant des séries lourdes, on monte la température avec un peu de cardio, on mobilise les articulations du mouvement du jour, on active les muscles stabilisateurs, puis on monte en charge par paliers. Un échauffement actif améliore la performance dans la majorité des critères étudiés (Fradkin 2010). Pour la force, la partie la plus spécifique, et donc la plus utile, est la montée en charge sur le mouvement lui-même : elle prépare le geste et sert de phase « potentialiser » du modèle RAMP. Les étirements statiques n'ont pas leur place ici (règle ETI-1).

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| ECH-F1 | Cardio facile 5 min (RPE 3–4), 3 min en version courte. Rameur, vélo, vélo à air, corde ou marche inclinée. | Bishop 2003 (5–10 min à intensité modérée) ; 3 min validé par Pierrot le 25/11/2026 |
| ECH-F2 | Mobilité dynamique ciblée sur le premier mouvement principal : **4 exercices**, liste `mobilite-force#avant` (environ 3 min). Version courte : **2 exercices**, liste `mobilite-force#avant-courte`. | 4 exercices en standard et 2 en courte : décision de Pierrot du 25/11/2026 ; sources et statut du nombre d'exercices : MOB-1 de `mobilite-modules` (heuristique de coach) |
| ECH-F3 | Activation : 2 exercices légers (1 en version courte), choisis selon le mouvement, loin de la fatigue (RPE ≤ 5). | Heuristique de coach, validée par Pierrot le 25/11/2026. Sources partielles : activation légère intégrée à la mobilisation (Jeffreys 2017, qui réserve les exercices d'activation ciblés à des besoins précis) ; pont fessier : effet discordant des exercices fessiers à faible charge (gain de puissance : Crow 2012 ; pas de gain de force : Parr 2017) ; rester loin de la fatigue (Bishop 2003). Élastique pour l'épaule avant les développés, dead bug, nombre d'exercices et RPE ≤ 5 : aucune source trouvée |
| ECH-F4 | Montée en charge obligatoire avant chaque mouvement principal, y compris le deuxième mouvement lourd de la séance. Échelle choisie par l'intensité I (règle ECH-6) : I ≥ 0,80 → paliers complets ; I < 0,80 → échelles « Léger » / « Modéré » ; I indéterminable → échelle « Lourd ». Si le même schéma (squat, charnière, poussée horizontale, poussée verticale, tirage) a déjà eu ses paliers dans la séance : départ réduit selon R5, « Mouvement déjà chauffé », de la fiche force ; sinon paliers complets. Paliers, % et reps : `knowledge/force/paliers-montee-en-charge.md`. Jamais supprimée ni raccourcie en version courte. | Skill `seance-complete` ; règle ECH-6 ; règle « Mouvement déjà chauffé » : décision de Pierrot du 25/11/2026, détaillée par expert-force ; sources (partielles : Ribeiro 2020, Rhea 2003, Neves 2025, Wolf 2026) et part d'heuristique : `knowledge/force/paliers-montee-en-charge.md`, R2 et R5 |
| ECH-F5 | Deuxième mouvement principal de la séance : on saute le cardio et on refait seulement la liste `avant-courte` de ce mouvement (2 exercices), puis ses paliers (ECH-F4). | Heuristique de coach, validée par Pierrot le 25/11/2026 |
| ECH-F6 | Premier palier de travail dans les 10 min qui suivent la fin des paliers (règle ECH-4). | McGowan 2015 ; validé par Pierrot le 25/11/2026 |

Durée totale indicative hors paliers : 10 min standard (5 + 3 + 2), 6 min courte (3 + 2 + 1). La durée des paliers est fournie par le moteur force.

```json
{
  "id": "echauffement-force",
  "type_seance": "force",
  "versions": {
    "standard": {
      "duree_min": 10,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 5,
          "items": [ { "ex": "mq-rameur", "nom_fr": "Rameur", "duree_s": 300, "intensite": "RPE 3-4" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 3, "nb_exercices": 4,
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
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 2, "nb_exercices": 2,
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
Résultat attendu (version courte) : rameur 3 min RPE 3–4 → `mobilite-force#avant-courte` filtré sur `squat` (2 exercices : genou au mur, bascules 90/90) → pont fessier 1 × 10 → paliers squat complets, non raccourcis malgré la version courte (moteur force, échelle selon I) → séries de squat → `avant-courte` de `developpe_couche` (2 exercices, règle ECH-F5) → paliers développé couché, échelle entière selon I avec barre vide (schéma poussée horizontale pas encore préparé dans la séance, ECH-F4) → séries. Aucun étirement statique avant la première série.
