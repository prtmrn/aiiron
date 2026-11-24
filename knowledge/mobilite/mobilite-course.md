---
id: mobilite-course
domaine: mobilite
titre: Mobilité avant et après une séance de course
niveau_preuve: C
sources:
  - titre: "Acute effects of dynamic stretching on muscle flexibility and performance: an analysis of the current literature"
    auteurs: "Opplert J, Babault N."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-017-0797-9"
  - titre: "Effect of acute static stretch on maximal muscle performance: a systematic review"
    auteurs: "Kay AD, Blazevich AJ."
    annee: 2012
    url: "https://doi.org/10.1249/MSS.0b013e318225cb27"
  - titre: "American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise"
    auteurs: "Garber CE, Blissmer B, Deschenes MR, et al."
    annee: 2011
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Avant une séance de course intense, la mobilité se place entre le footing et les gammes : balanciers de jambes, fentes marchées et rebonds de cheville préparent hanches, ischio-jambiers et tendons d'Achille au travail plus rapide, sans la baisse de performance associée aux étirements statiques longs (Opplert et Babault 2018 ; Kay et Blazevich 2012). Avant une sortie facile, rien n'est obligatoire. Après la séance ou les jours de repos, une routine autonome hanches + chevilles convient à la plupart des coureurs.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MOB-C1 | Séance intense : module `jambes-course-dynamique` (2 min) + `hanche-dynamique` sans la tenue de squat profond (environ 1 min 30), total 3 min. | Opplert et Babault 2018 ; composition = heuristique à valider |
| MOB-C2 | Version courte : `jambes-course-dynamique` seul (2 min). | Heuristique à valider |
| MOB-C3 | Trail, terrain accidenté, côtes : ajouter `cheville-dynamique` (1 min). | Heuristique à valider |
| MOB-C4 | Sortie facile : mobilité facultative, `jambes-course-dynamique` si l'utilisateur le souhaite. | Heuristique à valider |
| MOB-C5 | Routine autonome conseillée aux coureurs les jours de repos : `hanche-autonome` + `cheville-autonome` (10 min), 2 à 3 fois par semaine. | Garber 2011 ; choix des modules = heuristique à valider |

```json
{
  "id": "mobilite-course",
  "type_seance": "course",
  "avant": {
    "intense": ["jambes-course-dynamique", { "module": "hanche-dynamique", "exclure": ["mq-squat-profond"] }],
    "facile": { "facultatif": true, "modules": ["jambes-course-dynamique"] },
    "ajout_si": { "terrain": ["trail", "cotes"], "modules": ["cheville-dynamique"] }
  },
  "avant-courte": {
    "intense": ["jambes-course-dynamique"]
  },
  "apres": {
    "facultatif": true,
    "jour_de_repos": ["hanche-autonome", "cheville-autonome"],
    "frequence_par_semaine": { "min": 2, "max": 3 }
  },
  "interdits": [
    { "regle": "MOB-1", "texte": "Pas de maintien statique de plus de 5 s entre le footing et les gammes." },
    { "regle": "MOB-C1", "texte": "Pas de rebonds (pogos) pour un débutant en reprise : les remplacer par 1368 cercles de cheville." }
  ]
}
```

## Limites et contre-indications

- Rebonds de cheville : impact, à retirer en cas de gêne au mollet ou au tendon d'Achille, et dans ce cas orientation vers un professionnel si la gêne persiste.

## Exemple

Trailer, séance de côtes, version standard.
Résultat attendu : footing → `jambes-course-dynamique` + `hanche-dynamique` sans squat profond + `cheville-dynamique` (≈ 4 min 30) → gammes → accélérations.
