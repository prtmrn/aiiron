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
  - titre: "Hip thrust and back squat training elicit similar gluteus muscle hypertrophy and transfer similarly to the deadlift"
    auteurs: "Plotkin DL, Rodas MA, Vigotsky AD, et al."
    annee: 2023
    url: "https://doi.org/10.3389/fphys.2023.1279170"
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
| MAP-1 | 21 muscles suivis en volume (dont `haut_du_dos` séparé de `trapezes`, et `cou`), plus un agrégat provisoire `deltoides` et 3 muscles hors volume (`core`, `coiffe_rotateurs`, `dentele_anterieur`, voir MAP-9). Identifiants en `snake_case`, comme dans `knowledge/etirements/`. | Validé par Pierrot le 25/11/2026 |
| MAP-2 | Une seule table pour les trois champs du dataset. Clé = libellé entier, comparaison exacte. Les 50 libellés distincts du dataset sont tous dans la table : 44 associés, 6 à `null` avec motif (plus `diaphragm`, venu de `exercices-aiiron.json`, à `null`). Libellé hors table : erreur `LIBELLE_INCONNU`, jamais de rapprochement. | Choix de conception |
| MAP-3 | Résolution d'un exercice : surcharge par identifiant si elle existe (elle remplace les trois champs, et garde `core` quand le dataset le liste), sinon principaux = `muscle_cible`, secondaires = `groupe_musculaire` + `muscles_secondaires`. Exercice inconnu : `EXERCICE_SANS_MAPPING`. Principaux vides (cardio, étirement) : aucune série comptée. | Choix de conception |
| MAP-4 | Poids : principal 1, secondaire 0,5. | Pelland 2024 (préprint), niveau de preuve C ; validé par Pierrot le 25/11/2026 |
| MAP-5 | Dédoublonnage : par exercice, chaque muscle aiiron n'apparaît qu'une fois, avec son poids le plus élevé. `compte(m) = Σ séries × poids(ex, m)`. Seules les séries de travail comptent, jamais les séries d'approche. | Corrige T4 de `force/cas-de-test.md` |
| MAP-6 | Groupe pour les séries d'approche = `principaux[0]`, le premier muscle principal. | Validé par Pierrot le 25/11/2026 (nécessaire pour T17) |
| MAP-7 | Séries sur `deltoides` (tête non précisée) : compteur à part et avertissement `TETE_DELTOIDE_NON_PRECISEE`. Jamais réparties sur les trois têtes. | Validé par Pierrot le 25/11/2026 |
| MAP-8 | Exercices du dataset en cible `glutes` : mouvement **dominante genou** (le genou s'étend sous charge en même temps que la hanche : squat, presse, hack, fente, step-up, pistol, squat sauté) → principaux `quadriceps` puis `fessiers`, secondaire `adducteurs`, ischio-jambiers et mollets retirés (mollets gardés pour les sauts). Mouvement **dominante hanche** (le genou reste fixe ou presque : hip thrust, pont, kickback, extension de hanche, soulevé roumain) → `fessiers` principal, secondaires revus au cas par cas. | Kubo 2019 et Plotkin 2023 (niveau B : ECR, IRM) ; classement par nom et étapes : choix de conception, à valider |
| MAP-9 | `compte_volume: false` : le muscle n'entre jamais dans le volume hypertrophie (totaux, fourchettes, groupe des séries d'approche). `compteur_separe: true` : il est compté avec les mêmes poids et le même dédoublonnage dans un compteur affiché à part. Seul `core` est dans ce cas ; `coiffe_rotateurs` et `dentele_anterieur` ont `compteur_separe: false` (listés pour la sélection d'exercices, pas de compteur). | Validé par Pierrot le 25/11/2026 (core compté à part) |

### Muscles

| Groupe | Identifiants |
| --- | --- |
| jambes | `quadriceps`, `ischio_jambiers`, `fessiers`, `adducteurs`, `abducteurs`, `mollets`, `flechisseurs_hanche` |
| poussee | `pectoraux`, `deltoides_anterieurs`, `deltoides_lateraux`, `triceps` (+ agrégat `deltoides`) |
| tirage | `dorsaux` (tirage vertical), `haut_du_dos` (rhomboïdes, trapèzes moyens et inférieurs : tirage horizontal), `trapezes`, `deltoides_posterieurs`, `biceps` (avec le brachial), `avant_bras` |
| tronc | `abdominaux`, `obliques`, `lombaires` ; hors volume, compteur séparé : `core` (« Gainage / tronc profond ») |
| autres | `cou` ; hors volume, sans compteur : `coiffe_rotateurs`, `dentele_anterieur` |

Représentation de `core` dans le JSON : `{ "id": "core", "nom": "Gainage / tronc profond", "groupe": "tronc", "compte_volume": false, "compteur_separe": true }`, et le libellé `core` du dataset pointe dessus. `core` n'apparaît jamais en cible dans le dataset (0 en `muscle_cible`, 7 en `groupe_musculaire`, 94 en secondaire) : il reçoit donc des demi-séries, affichées à part (« gainage pendant tes squats : 7,5 séries »), sans toucher aux fourchettes d'abdominaux.

### Choix notables sur les libellés

- Synonymes : `quads` et `quadriceps` → `quadriceps` ; `lats` et `latissimus dorsi` → `dorsaux` ; `traps` et `trapezius` → `trapezes` ; `abs`, `abdominals`, `lower abs` → `abdominaux` ; `spine` et `lower back` → `lombaires`.
- `shoulders`, `delts`, `deltoids` → agrégat `deltoides` : le dataset ne dit jamais quelle tête travaille (`shoulders` apparaît 400 fois en secondaire, 143 exercices ont la cible `delts`). Seul `rear deltoids` donne une tête.
- `brachialis` → `biceps` : les deux fléchissent le coude et se travaillent ensemble.
- `core` → muscle `core`, hors volume avec compteur séparé (MAP-9).
- `null` : `cardiovascular system` (29 exercices cardio, sans muscle principal), `back` (ambigu, surtout sur des kickbacks), `ankles`, `ankle stabilizers`, `feet`, `shins`.

### Surcharges (76)

**Les 8 premières, validées par Pierrot le 25/11/2026.** `0043` squat, `0739` presse 45°, `0336` fentes haltères → principaux quadriceps et fessiers, secondaire adducteurs ; `0085` soulevé roumain → ischio-jambiers et fessiers ; `0025` couché, `0091` développé assis, `0334` élévations latérales, `0075` oiseau barre → tête du deltoïde explicite. Seul changement en version 2 : `core` ajouté aux secondaires de `0043` (le dataset le liste, MAP-3). Les totaux de volume de T4 et T5 ne bougent pas ; leur compteur séparé affiche `core` 1,5 (T4) et 2,5 (T5).

**Les 69 autres exercices « cible `glutes`, premier secondaire `quadriceps` » (MAP-8), heuristique à valider.** Le dataset désigne les fessiers comme cible des squats, presses et fentes et ajoute partout ischio-jambiers et mollets. Or le squat fait grossir quadriceps, adducteurs et grand fessier, pas les ischio-jambiers (Kubo 2019, IRM), et il fait grossir la cuisse davantage que le hip thrust pour un gain de fessiers comparable (Plotkin 2023, IRM). Sans correction, le quadriceps ne recevrait que des demi-séries sur un squat. Critère, lu dans le nom puis les étapes : le genou s'étend-il sous charge pendant la phase concentrique ? Oui → dominante genou. Non, le genou reste à angle fixe pendant que la hanche s'étend → dominante hanche.

| Classement | Nombre | Surcharge |
| --- | --- | --- |
| Genou : squats (barre, haltères, kettlebell, Smith, élastique, zercher, avant, hack, sumo, cossack, pistol, curtsey, box), presses, fentes, step-ups | 57 | principaux `quadriceps`, `fessiers` ; secondaire `adducteurs` (+ `core` si le dataset le liste : 9 cas) ; `3644` fente avec balancier : + `deltoides_anterieurs` |
| Genou, saut : `0053`, `3543`, `0371`, `0514`, `0513`, `3582` | 6 | idem, `mollets` gardés en secondaire (poussée de cheville) |
| Hanche : `1420` squat sauté depuis les genoux (extension de hanche explosive, genoux fléchis) | 1 | aucune : le dataset (fessiers ; quadriceps, ischios, mollets en secondaires) est plausible |
| Douteux | 5 | voir ci-dessous |

Aucun autre exercice dominante hanche n'est dans ce lot : hip thrusts, ponts et kickbacks du dataset ont un autre premier secondaire (souvent `hamstrings`) et restent à revoir.

Cas douteux, surcharge écrite mais à valider :
- `1559` étirement des fléchisseurs de hanche sur ballon : étirement statique → aucun muscle, aucune série. Le dataset compte d'autres étirements comme du volume (ex. `1709`, `1710`, cible `glutes`) : problème général, non traité ici.
- `0624` chaise contre le mur avec montées de genou : `quadriceps` principal (isométrie), `flechisseurs_hanche` et `fessiers` secondaires. Faut-il compter de l'isométrie en volume ?
- `0642` et `0661` pompes avec coup de pied latéral : `pectoraux` principal ; `triceps`, `deltoides_anterieurs`, `abducteurs` secondaires (+ `core` pour `0661`). Le nom de `0661` dit « inside », ses étapes décrivent un coup de pied sur le côté.
- `0551` relevé turc : `fessiers` principal ; `quadriceps`, `core` secondaires. Exercice de stabilité globale ; l'épaule tenue en isométrie n'est pas comptée.

Appliqués mais discutables :
- Sauts (6 exercices ci-dessus, et `1420`) : stimulus d'hypertrophie faible à charge légère ; ils sont comptés comme des séries normales. À trancher : les sortir du volume ?
- `fessiers` en principal sur les mouvements très quadriceps (hack squats `0046`, `0741`, `0743`, `0755`, squat serré `0063`, presses) : on suit le précédent `0739`.
- Fentes latérales et squats larges (`1410`, `3643`, `3142`, `0740`) : `adducteurs` sans doute plus qu'un demi. `3769` curtsey : `abducteurs` non ajoutés faute de données d'hypertrophie.
- `3132` squat avec appui : version débutant ou mobilité ? Compté comme un squat.
- `1464`, `0740` : `nom_en` source corrompu (`45в°`), corrigé dans la surcharge.

## Limites et contre-indications

- Le mapping compte des séries, il ne juge pas la qualité d'un exercice ni sa tolérance : douleur ou gêne → on arrête de prescrire sur ce point et on oriente (voir `expert-sante-physique`).
- Le poids 0,5 vient d'un préprint et sert de moyenne : un secondaire peut travailler beaucoup (triceps au couché) ou presque pas.
- Restent sans surcharge : les charnières et hip thrusts (cible `glutes`, autre premier secondaire), les étirements comptés comme du volume, et la plupart des exercices d'épaule (séries affichées sous `deltoides`).
- Défauts du dataset relevés : `groupe_musculaire` recopie le premier muscle secondaire (vrai pour les 10 libellés les plus fréquents, soit 1 175 exercices sur 1 324) ; leg extension `0585` avec ischios en secondaire ; nom corrompu `0739` (`45в°`).
- `data/exercises/exercices-aiiron.json` (39 exercices `mq-…`, expert-sante-physique) reprend les libellés anglais du dataset. Ils sont tous dans la table, plus un nouveau libellé, `diaphragm` (`mq-respiration`), associé à `null`. Tout nouveau libellé ajouté là-bas doit d'abord entrer dans la table.

## Exemple

Semaine « libre » (T4) : squat `0043` 3 séries + presse `0739` 3 séries.
Attendu : quadriceps 6, fessiers 6, adducteurs 3 (2 × 3 × 0,5). Bugué (sous-chaîne, `quadriceps` lu dans `groupe_musculaire` puis dans `muscles_secondaires`) : 12. Compteur séparé : core 1,5 (`0043` seul, 3 × 0,5).

Séance T5 : `0025` × 4, `0027` × 3, `0043` × 5, poids réels.
Attendu : pectoraux 4, triceps 2, deltoïdes antérieurs 2, haut du dos 3, biceps 1,5, avant-bras 1,5, quadriceps 5, fessiers 5, adducteurs 2,5. Les mêmes totaux dans n'importe quel ordre. Compteur séparé : core 2,5.
