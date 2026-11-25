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
| MOB-C1 | Séance intense : **4 exercices**, liste `avant` (JSON) : balanciers avant-arrière, balanciers latéraux, rebonds de cheville (`jambes-course-dynamique`), world's greatest stretch (`hanche-dynamique`), environ 3 min. | Opplert et Babault 2018 ; composition jambes + hanche validée par Pierrot le 25/11/2026 ; 4 exercices : décision de Pierrot du 25/11/2026 ; choix des 4 exercices = heuristique à valider |
| MOB-C2 | Version courte : **2 exercices**, balanciers avant-arrière et latéraux (liste `avant-courte`), avec le dosage de `jambes-course-dynamique`. | 2 exercices et choix des 2 exercices : validés par Pierrot le 25/11/2026 |
| MOB-C3 | Trail, terrain accidenté, côtes : le genou au mur (`cheville-dynamique`) remplace le world's greatest stretch, pour rester à 4 exercices. | Ajout de la cheville validé par Pierrot le 25/11/2026 ; remplacement du world's greatest stretch = heuristique à valider |
| MOB-C4 | Sortie facile : mobilité facultative, `jambes-course-dynamique` si l'utilisateur le souhaite. | Validé par Pierrot le 25/11/2026 |
| MOB-C5 | Routine autonome conseillée aux coureurs les jours de repos : `hanche-autonome` + `cheville-autonome` (10 min), 2 à 3 fois par semaine. | Garber 2011 ; choix des modules validé par Pierrot le 25/11/2026 |

```json
{
  "id": "mobilite-course",
  "type_seance": "course",
  "avant": {
    "intense": [ { "module": "jambes-course-dynamique", "ex": "mq-balancier-avant" }, { "module": "jambes-course-dynamique", "ex": "mq-balancier-lateral" }, { "module": "jambes-course-dynamique", "ex": "mq-pogo" }, { "module": "hanche-dynamique", "ex": "1604" } ],
    "facile": { "facultatif": true, "modules": ["jambes-course-dynamique"] },
    "remplacement_si": { "terrain": ["trail", "cotes"], "remplacer": "1604", "par": { "module": "cheville-dynamique", "ex": "mq-genou-mur" } }
  },
  "avant-courte": {
    "intense": [ { "module": "jambes-course-dynamique", "ex": "mq-balancier-avant" }, { "module": "jambes-course-dynamique", "ex": "mq-balancier-lateral" } ]
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
Résultat attendu : footing → balanciers avant-arrière 1 × 10 par côté, balanciers latéraux 1 × 10 par côté, pogos 1 × 20, genou au mur 1 × 10 par côté (MOB-C3 : remplace le world's greatest stretch ; ≈ 3 min) → gammes → accélérations.

Durées estimées (environ 45 s par exercice) : 3 min en standard (4 exercices), 2 min en version courte (2 exercices). Les 2 exercices de `avant-courte` sont toujours les 2 premiers de `avant`.
