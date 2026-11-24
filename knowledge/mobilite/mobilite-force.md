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
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Avant une séance de force, on mobilise seulement les articulations du premier mouvement principal, en dynamique : chevilles et hanches pour le squat, charnière et hanches pour le soulevé de terre, colonne thoracique et épaules pour les développés. Les paliers de montée en charge complètent ensuite la préparation sur le geste lui-même. Après la séance, la mobilité est facultative : elle sert si l'utilisateur déclare une zone raide ou vise une amplitude (par exemple descendre plus bas au squat), et se fait alors en version autonome.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MOB-F1 | Avant : modules dynamiques selon le mouvement principal (tableau JSON), 3 à 4 min. Si la séance a deux mouvements principaux, on fait les modules du premier ; pour le second, on fait sa liste `avant-courte` (1 à 2 min) juste avant ses paliers (ECH-F5). | Opplert et Babault 2018 ; association mouvement → modules = heuristique à valider |
| MOB-F2 | Version courte : un seul module par mouvement (le premier de la liste `avant-courte`), 1 à 2 min. | Heuristique à valider |
| MOB-F3 | Après : facultatif. Module `-autonome` de la zone raide déclarée, 1 module, 3 à 5 min, placé après les étirements du retour au calme. | Garber 2011 ; heuristique à valider |

```json
{
  "id": "mobilite-force",
  "type_seance": "force",
  "avant": {
    "squat": ["cheville-dynamique", "hanche-dynamique"],
    "souleve_de_terre": ["charniere-dynamique", "hanche-dynamique"],
    "developpe_couche": ["thoracique-dynamique", "epaule-dynamique"],
    "developpe_militaire": ["thoracique-dynamique", "epaule-dynamique", "poignet-dynamique"]
  },
  "avant-courte": {
    "squat": ["hanche-dynamique"],
    "souleve_de_terre": ["charniere-dynamique"],
    "developpe_couche": ["epaule-dynamique"],
    "developpe_militaire": ["epaule-dynamique"]
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

Durées (somme des modules de `mobilite-modules`) : squat 3 min, soulevé de terre 3 min, développé couché 3 min, développé militaire 4 min ; versions courtes 1 à 2 min.

## Limites et contre-indications

- Si une amplitude manque nettement pour le mouvement (par exemple impossible de descendre au squat sans douleur), aiiron n'insiste pas en mobilité : il propose une variante du mouvement adaptée à l'amplitude disponible et oriente vers un professionnel si la limitation s'accompagne de douleur.

## Exemple

Séance « soulevé de terre 5 × 3 puis développé militaire 4 × 6 », version standard.
Résultat attendu : avant le soulevé : `charniere-dynamique` + `hanche-dynamique` (3 min) ; avant le développé militaire (second mouvement) : `epaule-dynamique` seul (2 min, liste `avant-courte`), puis ses paliers. Après la séance : rien, sauf zone raide déclarée.
