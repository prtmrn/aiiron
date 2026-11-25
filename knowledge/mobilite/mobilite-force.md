---
id: mobilite-force
domaine: mobilite
titre: Mobilité avant et après une séance de force
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
  - titre: "Lower extremity strength and the range of motion in relation to squat depth"
    auteurs: "Kim SH, Kwon OY, Park KN, Jeon IC, Weon JH."
    annee: 2015
    url: "https://doi.org/10.1515/hukin-2015-0007"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Avant une séance de force, on mobilise seulement les articulations du premier mouvement principal, en dynamique : chevilles et hanches pour le squat, charnière et hanches pour le soulevé de terre, colonne thoracique et épaules pour les développés. Les paliers de montée en charge complètent ensuite la préparation sur le geste lui-même. Après la séance, la mobilité est facultative : elle sert si l'utilisateur déclare une zone raide ou vise une amplitude (par exemple descendre plus bas au squat), et se fait alors en version autonome.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MOB-F1 | Avant : **4 exercices** selon le mouvement principal, liste `avant` (JSON), chacun avec le dosage de son module, environ 3 min. Si la séance a deux mouvements principaux, on fait la liste `avant` du premier ; pour le second, on fait sa liste `avant-courte` (2 exercices) juste avant ses paliers (ECH-F5). | Opplert et Babault 2018 ; association mouvement → modules validée par Pierrot le 25/11/2026 ; 4 exercices : décision de Pierrot du 25/11/2026, sources et statut dans MOB-1 de `mobilite-modules` ; choix des 4 exercices validé par Pierrot le 25/11/2026 |
| MOB-F2 | Version courte : **2 exercices** par mouvement, liste `avant-courte` (JSON), incluse dans la liste `avant`, chacun avec le dosage de son module. | 2 exercices et choix des 2 exercices : validés par Pierrot le 25/11/2026 ; nombre d'exercices : sources et statut dans MOB-1 de `mobilite-modules` (heuristique de coach). Squat, genou au mur : Kim 2015 (la flexion dorsale de cheville est associée à la profondeur du squat ; étude transversale, pas d'essai sur l'exercice lui-même). Squat, bascules 90/90 : aucune source trouvée, heuristique de coach (Kim 2015 relie la flexion de hanche à la profondeur chez les hommes, pas la rotation travaillée par le 90/90) |
| MOB-F3 | Après : facultatif. Module `-autonome` de la zone raide déclarée, 1 module, 3 à 5 min, placé après les étirements du retour au calme. | Garber 2011 ; validé par Pierrot le 25/11/2026 |

```json
{
  "id": "mobilite-force",
  "type_seance": "force",
  "avant": {
    "squat": [ { "module": "cheville-dynamique", "ex": "mq-genou-mur" }, { "module": "hanche-dynamique", "ex": "mq-90-90" }, { "module": "hanche-dynamique", "ex": "1604" }, { "module": "hanche-dynamique", "ex": "mq-squat-descentes-lentes" } ],
    "souleve_de_terre": [ { "module": "charniere-dynamique", "ex": "mq-charniere-baton" }, { "module": "hanche-dynamique", "ex": "1604" }, { "module": "hanche-dynamique", "ex": "mq-90-90" }, { "module": "charniere-dynamique", "ex": "1471" } ],
    "developpe_couche": [ { "module": "thoracique-dynamique", "ex": "mq-open-book" }, { "module": "epaule-dynamique", "ex": "mq-passage-epaules" }, { "module": "thoracique-dynamique", "ex": "mq-chat-vache" }, { "module": "epaule-dynamique", "ex": "mq-cercles-bras" } ],
    "developpe_militaire": [ { "module": "epaule-dynamique", "ex": "mq-passage-epaules" }, { "module": "epaule-dynamique", "ex": "mq-wall-slide" }, { "module": "thoracique-dynamique", "ex": "mq-chat-vache" }, { "module": "poignet-dynamique", "ex": "1428" } ]
  },
  "avant-courte": {
    "squat": [ { "module": "cheville-dynamique", "ex": "mq-genou-mur" }, { "module": "hanche-dynamique", "ex": "mq-90-90" } ],
    "souleve_de_terre": [ { "module": "charniere-dynamique", "ex": "mq-charniere-baton" }, { "module": "hanche-dynamique", "ex": "1604" } ],
    "developpe_couche": [ { "module": "thoracique-dynamique", "ex": "mq-open-book" }, { "module": "epaule-dynamique", "ex": "mq-passage-epaules" } ],
    "developpe_militaire": [ { "module": "epaule-dynamique", "ex": "mq-passage-epaules" }, { "module": "epaule-dynamique", "ex": "mq-wall-slide" } ]
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

Durées estimées (dosage des modules de `mobilite-modules`, environ 45 s par exercice) : 3 min pour chaque mouvement en standard (4 exercices), 2 min en version courte (2 exercices). Les 2 exercices de `avant-courte` sont toujours les 2 premiers de `avant`.

## Limites et contre-indications

- Si une amplitude manque nettement pour le mouvement (par exemple impossible de descendre au squat sans douleur), aiiron n'insiste pas en mobilité : il propose une variante du mouvement adaptée à l'amplitude disponible et oriente vers un professionnel si la limitation s'accompagne de douleur.

## Exemple

Séance « soulevé de terre 5 × 3 puis développé militaire 4 × 6 », version standard.
Résultat attendu : avant le soulevé : liste `avant` (charnière au bâton 1 × 8, world's greatest stretch 1 × 3 par côté, bascules 90/90 1 × 6 par côté, inchworm 1 × 5 ; 3 min) ; avant le développé militaire (second mouvement) : sa liste `avant-courte`, soit passages d'épaules 1 × 10 et glissés au mur 1 × 8, puis ses paliers. Après la séance : rien, sauf zone raide déclarée.
