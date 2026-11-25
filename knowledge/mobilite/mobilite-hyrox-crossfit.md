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
| MOB-H1 | Avant séance : **4 exercices**, environ 3 min. On construit la liste dans cet ordre et on garde les 4 premiers : world's greatest stretch (hanche et thoracique) ; un exercice par ajout applicable (MOB-H2), dans l'ordre poignet > épaule > cheville ; puis, pour compléter, bascules de hanche 90/90, chat-vache, open book. | Opplert et Babault 2018 ; base hanche + thoracique validée par Pierrot le 25/11/2026 ; 4 exercices : décision de Pierrot du 25/11/2026, sources et statut dans MOB-1 de `mobilite-modules` (heuristique de coach) ; ordre de remplissage validé par Pierrot le 25/11/2026 |
| MOB-H2 | Ajouts selon les mouvements du jour, un exercice chacun : bascules des poignets (`poignet-dynamique`) si appui, front rack ou overhead ; passages d'épaules (`epaule-dynamique`) si overhead ou gymnastique ; genou au mur (`cheville-dynamique`) si course, sauts, corde. Le plafond de 4 exercices remplace l'ancien plafond de 6 min. | Ajouts validés par Pierrot le 25/11/2026 ; 4 exercices : décision de Pierrot du 25/11/2026 |
| MOB-H3 | Version courte : **2 exercices** = les 2 premiers de la liste MOB-H1. Le world's greatest stretch, plus un exercice du premier ajout applicable dans l'ordre poignet > épaule > cheville (bascules des poignets, passages d'épaules, genou au mur). Sans ajout : bascules de hanche 90/90. Dosage de leur module. | 2 exercices et choix des 2 exercices : validés par Pierrot le 25/11/2026 ; nombre d'exercices : sources et statut dans MOB-1 de `mobilite-modules` (heuristique de coach) |
| MOB-H4 | Après : facultatif, 1 module `-autonome` de la zone la plus sollicitée ou déclarée raide. | Garber 2011 ; validé par Pierrot le 25/11/2026 |

```json
{
  "id": "mobilite-hyrox-crossfit",
  "type_seance": "hyrox_crossfit",
  "avant": {
    "nb_exercices": 4,
    "base": [ { "module": "hanche-dynamique", "ex": "1604" } ],
    "ajouts_selon_priorite": [
      { "si": { "mouvements_inclus": ["appui", "front_rack", "overhead"] }, "module": "poignet-dynamique", "ex": "mq-prep-poignets" },
      { "si": { "mouvements_inclus": ["overhead", "gymnastique_tirage", "gymnastique_appui"] }, "module": "epaule-dynamique", "ex": "mq-passage-epaules" },
      { "si": { "mouvements_inclus": ["course", "sauts", "corde"] }, "module": "cheville-dynamique", "ex": "mq-genou-mur" }
    ],
    "completer_avec": [
      { "module": "hanche-dynamique", "ex": "mq-90-90" },
      { "module": "thoracique-dynamique", "ex": "mq-chat-vache" },
      { "module": "thoracique-dynamique", "ex": "mq-open-book" }
    ],
    "duree_min": 3
  },
  "avant-courte": {
    "nb_exercices": 2,
    "base": [ { "module": "hanche-dynamique", "ex": "1604" } ],
    "ajout_selon_priorite": [
      { "module": "poignet-dynamique", "ex": "mq-prep-poignets" },
      { "module": "epaule-dynamique", "ex": "mq-passage-epaules" },
      { "module": "cheville-dynamique", "ex": "mq-genou-mur" }
    ],
    "sans_ajout": { "module": "hanche-dynamique", "ex": "mq-90-90" }
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
Résultat attendu : world's greatest stretch 1 × 3 par côté → bascules des poignets 1 × 10 (overhead des wall balls) → passages d'épaules 1 × 10 (overhead) → genou au mur 1 × 10 par côté (course) : 4 exercices, ≈ 3 min, pas de complément. Version courte : world's greatest stretch + bascules des poignets.

Variante : séance « rameur + traîneau + fentes » (aucun ajout applicable) → world's greatest stretch, 90/90, chat-vache, open book.
