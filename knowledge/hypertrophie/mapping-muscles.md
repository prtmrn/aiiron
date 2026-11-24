---
id: hypertrophie-mapping-muscles
domaine: hypertrophie
titre: Muscles aiiron, correspondance avec le dataset d'exercices et règle de comptage des séries
niveau_preuve: C
sources:
  - titre: "Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis"
    auteurs: "Schoenfeld BJ, Ogborn D, Krieger JW."
    annee: 2017
    url: "https://doi.org/10.1080/02640414.2016.1210197"
  - titre: "The Resistance Training Dose-Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gain (préprint SportRxiv)"
    auteurs: "Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC."
    annee: 2024
    url: "https://sportrxiv.org/index.php/server/preprint/view/460"
  - titre: "Effects of squat training with different depths on lower limb muscle volumes"
    auteurs: "Kubo K, Ikebukuro T, Yata H."
    annee: 2019
    url: "https://doi.org/10.1007/s00421-019-04181-y"
  - titre: "exercises-dataset (données MIT), version épinglée dans data/exercises/exercises.json"
    auteurs: "hasaneyldrm"
    annee: 2025
    url: "https://github.com/hasaneyldrm/exercises-dataset"
statut: brouillon
auteur_agent: expert-hypertrophie
derniere_revue: 2026-11-25
---

# Muscles aiiron et mapping du dataset

Données : `mapping-muscles.json` (même dossier). Utilisé par le moteur volume (séries par muscle) et par les séries d'approche (`force-paliers-montee-en-charge#musculation`).

## Principe

Le volume hebdomadaire se pilote muscle par muscle : les études dose-réponse mesurent l'hypertrophie par muscle (Schoenfeld 2017). On garde donc une liste fermée de muscles, assez fine pour orienter le choix d'exercices (têtes du deltoïde, tirage vertical contre horizontal), mais pas plus fine que ce que le dataset et la littérature permettent (pas de chefs du quadriceps ni de faisceaux du pectoral). Les libellés anglais du dataset sont traduits vers ces identifiants par une table à clé exacte. Quand le dataset se trompe sur un exercice courant, une surcharge par identifiant d'exercice le corrige. Une série indirecte compte pour une demi-série : c'est la méthode qui décrit le mieux les données dans la méta-régression de Pelland 2024.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MAP-1 | 21 muscles suivis en volume, plus un agrégat provisoire `deltoides` et 2 muscles listés mais non comptés (`coiffe_rotateurs`, `dentele_anterieur`). Identifiants en `snake_case`, comme dans `knowledge/etirements/`. | Granularité : choix de conception à valider (aligner sur les 21 muscles de Pierrot) |
| MAP-2 | Une seule table pour les trois champs du dataset. Clé = libellé entier, comparaison exacte. Les 50 libellés distincts du dataset sont tous dans la table : 43 associés, 7 à `null` avec motif (plus `diaphragm`, venu de `exercices-aiiron.json`, à `null`). Libellé hors table : erreur `LIBELLE_INCONNU`, jamais de rapprochement. | Choix de conception |
| MAP-3 | Résolution d'un exercice : surcharge par identifiant si elle existe (elle remplace les trois champs), sinon principaux = `muscle_cible`, secondaires = `groupe_musculaire` + `muscles_secondaires`. Exercice inconnu : `EXERCICE_SANS_MAPPING`. | Choix de conception |
| MAP-4 | Poids : principal 1, secondaire 0,5. | Pelland 2024 (préprint) ; à valider |
| MAP-5 | Dédoublonnage : par exercice, chaque muscle aiiron n'apparaît qu'une fois, avec son poids le plus élevé. `compte(m) = Σ séries × poids(ex, m)`. Seules les séries de travail comptent, jamais les séries d'approche. | Corrige T4 de `force/cas-de-test.md` |
| MAP-6 | Groupe pour les séries d'approche = `principaux[0]`, le premier muscle principal. | Choix de conception, nécessaire pour T17 |
| MAP-7 | Séries sur `deltoides` (tête non précisée) : compteur à part et avertissement `TETE_DELTOIDE_NON_PRECISEE`. Jamais réparties sur les trois têtes. | Choix de conception |

### Muscles

| Groupe | Identifiants |
| --- | --- |
| jambes | `quadriceps`, `ischio_jambiers`, `fessiers`, `adducteurs`, `abducteurs`, `mollets`, `flechisseurs_hanche` |
| poussee | `pectoraux`, `deltoides_anterieurs`, `deltoides_lateraux`, `triceps` (+ agrégat `deltoides`) |
| tirage | `dorsaux` (tirage vertical), `haut_du_dos` (rhomboïdes, trapèzes moyens et inférieurs : tirage horizontal), `trapezes`, `deltoides_posterieurs`, `biceps` (avec le brachial), `avant_bras` |
| tronc | `abdominaux`, `obliques`, `lombaires` |
| autres | `cou` ; non comptés : `coiffe_rotateurs`, `dentele_anterieur` |

### Choix notables sur les libellés

- Synonymes : `quads` et `quadriceps` → `quadriceps` ; `lats` et `latissimus dorsi` → `dorsaux` ; `traps` et `trapezius` → `trapezes` ; `abs`, `abdominals`, `lower abs` → `abdominaux` ; `spine` et `lower back` → `lombaires`.
- `shoulders`, `delts`, `deltoids` → agrégat `deltoides` : le dataset ne dit jamais quelle tête travaille (`shoulders` apparaît 400 fois en secondaire, 143 exercices ont la cible `delts`). Seul `rear deltoids` donne une tête.
- `brachialis` → `biceps` : les deux fléchissent le coude et se travaillent ensemble.
- `null` : `cardiovascular system` (29 exercices cardio, sans muscle principal), `core` (gainage pendant squats ou fentes : non compté), `back` (ambigu, surtout sur des kickbacks), `ankles`, `ankle stabilizers`, `feet`, `shins`.

### Surcharges (8, toutes heuristiques à valider)

Le dataset désigne les fessiers comme cible des squats, presses, fentes et soulevés (72 exercices ont `glutes` en cible et `quadriceps` en premier secondaire). Sans correction, le quadriceps ne recevrait que des demi-séries sur un squat, et il ajoute les ischio-jambiers, qui grossissent peu au squat (Kubo 2019). Surcharges écrites : `0043` squat, `0739` presse 45°, `0336` fentes haltères → principaux quadriceps et fessiers, secondaire adducteurs ; `0085` soulevé roumain → ischio-jambiers et fessiers ; `0025` couché, `0091` développé assis, `0334` élévations latérales, `0075` oiseau barre → tête du deltoïde explicite.

## Limites et contre-indications

- Le mapping compte des séries, il ne juge pas la qualité d'un exercice ni sa tolérance : douleur ou gêne → on arrête de prescrire sur ce point et on oriente (voir `expert-sante-physique`).
- Le poids 0,5 vient d'un préprint et sert de moyenne : un secondaire peut travailler beaucoup (triceps au couché) ou presque pas.
- Il reste 69 exercices « cible `glutes`, premier secondaire `quadriceps` » sans surcharge, plus les charnières et la plupart des exercices d'épaule. En attendant, leurs séries s'affichent sous `deltoides` ou avec un quadriceps sous-compté.
- Défauts du dataset relevés : `groupe_musculaire` recopie le premier muscle secondaire (vrai pour les 10 libellés les plus fréquents, soit 1 175 exercices sur 1 324) ; leg extension `0585` avec ischios en secondaire ; nom corrompu `0739` (`45в°`).
- `data/exercises/exercices-aiiron.json` (39 exercices `mq-…`, expert-sante-physique) reprend les libellés anglais du dataset. Ils sont tous dans la table, plus un nouveau libellé, `diaphragm` (`mq-respiration`), associé à `null`. Tout nouveau libellé ajouté là-bas doit d'abord entrer dans la table.

## Exemple

Semaine « libre » (T4) : squat `0043` 3 séries + presse `0739` 3 séries.
Attendu : quadriceps 6, fessiers 6, adducteurs 3 (2 × 3 × 0,5). Bugué (sous-chaîne, `quadriceps` lu dans `groupe_musculaire` puis dans `muscles_secondaires`) : 12.

Séance T5 : `0025` × 4, `0027` × 3, `0043` × 5, poids réels.
Attendu : pectoraux 4, triceps 2, deltoïdes antérieurs 2, haut du dos 3, biceps 1,5, avant-bras 1,5, quadriceps 5, fessiers 5, adducteurs 2,5. Les mêmes totaux dans n'importe quel ordre.
