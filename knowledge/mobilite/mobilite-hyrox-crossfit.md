---
id: mobilite-hyrox-crossfit
domaine: mobilite
titre: Mobilité avant et après une séance Hyrox ou CrossFit
niveau_preuve: E
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

Une séance Hyrox ou CrossFit sollicite tout le corps : la mobilité d'avant séance est globale (hanches, colonne thoracique) et s'enrichit des articulations propres aux mouvements du jour. Poignets pour les appuis, le front rack et l'overhead ; épaules pour la gymnastique et l'overhead ; chevilles pour la course, les sauts et la corde. Le niveau E signale que la composition est un choix de coach, appuyé sur les principes généraux de la mobilité dynamique.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MOB-H1 | Base avant séance : `hanche-dynamique` + `thoracique-dynamique` (3 min). | Opplert et Babault 2018 ; composition = heuristique à valider |
| MOB-H2 | Ajouts selon les mouvements du jour : `poignet-dynamique` si appui, front rack ou overhead ; `epaule-dynamique` si overhead ou gymnastique ; `cheville-dynamique` si course, sauts, corde. Plafond : 6 min au total. | Heuristique à valider |
| MOB-H3 | Version courte : `hanche-dynamique` + au plus un ajout, choisi dans l'ordre poignet > épaule > cheville. | Heuristique à valider |
| MOB-H4 | Après : facultatif, 1 module `-autonome` de la zone la plus sollicitée ou déclarée raide. | Garber 2011 ; heuristique à valider |

```json
{
  "id": "mobilite-hyrox-crossfit",
  "type_seance": "hyrox_crossfit",
  "avant": {
    "base": ["hanche-dynamique", "thoracique-dynamique"],
    "ajouts": [
      { "si": { "mouvements_inclus": ["appui", "front_rack", "overhead"] }, "module": "poignet-dynamique" },
      { "si": { "mouvements_inclus": ["overhead", "gymnastique_tirage", "gymnastique_appui"] }, "module": "epaule-dynamique" },
      { "si": { "mouvements_inclus": ["course", "sauts", "corde"] }, "module": "cheville-dynamique" }
    ],
    "duree_max_min": 6
  },
  "avant-courte": {
    "base": ["hanche-dynamique"],
    "ajouts_max": 1,
    "ordre_priorite_ajouts": ["poignet-dynamique", "epaule-dynamique", "cheville-dynamique"]
  },
  "apres": {
    "facultatif": true,
    "modules_max": 1,
    "source_modules": "mobilite-modules#routine_autonome.zone_vers_module"
  },
  "interdits": [
    { "regle": "MOB-1", "texte": "Pas de maintien statique de plus de 5 s avant un bloc chronométré." }
  ]
}
```

## Limites et contre-indications

- Poignets ou épaules douloureux en appui : retirer les mouvements d'appui de la séance (alternative sans appui), orientation vers un professionnel si ça persiste.

## Exemple

Séance Hyrox : course + wall balls + fentes avec sac, version standard.
Résultat attendu : base (3 min) + `poignet-dynamique` (overhead des wall balls, 1 min) + `epaule-dynamique` (overhead, 2 min) + `cheville-dynamique` (course, 1 min) = 7 min → dépasse le plafond de 6 min : on retire le dernier ajout (cheville), total 6 min.
