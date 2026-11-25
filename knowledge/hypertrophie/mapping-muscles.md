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
  - titre: "Is There Too Much of a Good Thing? Meta-Regressions of the Effect of Per-Session Volume on Hypertrophy and Strength (préprint SportRxiv)"
    auteurs: "Remmert J, Pelland J, Robinson Z, Hinson S, Zourdos M."
    annee: 2025
    url: "https://sportrxiv.org/index.php/server/preprint/view/537"
  - titre: "Different Shoulder Exercises Affect the Activation of Deltoid Portions in Resistance-Trained Individuals"
    auteurs: "Campos YAC, Vianna JM, Guimarães MP, Oliveira JLD, Hernández-Mosqueira C, da Silva SF, Marchetti PH."
    annee: 2020
    url: "https://doi.org/10.2478/hukin-2020-0033"
  - titre: "No Time to Lift? Designing Time-Efficient Training Programs for Strength and Hypertrophy: A Narrative Review"
    auteurs: "Iversen VM, Norum M, Schoenfeld BJ, Fimland MS."
    annee: 2021
    url: "https://doi.org/10.1007/s40279-021-01490-1"
  - titre: "Effects of squat training with different depths on lower limb muscle volumes"
    auteurs: "Kubo K, Ikebukuro T, Yata H."
    annee: 2019
    url: "https://doi.org/10.1007/s00421-019-04181-y"
  - titre: "Hip thrust and back squat training elicit similar gluteus muscle hypertrophy and transfer similarly to the deadlift"
    auteurs: "Plotkin DL, Rodas MA, Vigotsky AD, et al."
    annee: 2023
    url: "https://doi.org/10.3389/fphys.2023.1279170"
  - titre: "Impact of the Nordic hamstring and hip extension exercises on hamstring architecture and morphology: implications for injury prevention"
    auteurs: "Bourne MN, Duhig SJ, Timmins RG, et al."
    annee: 2017
    url: "https://doi.org/10.1136/bjsports-2016-096130"
  - titre: "exercises-dataset (données MIT), version épinglée dans data/exercises/exercises.json"
    auteurs: "hasaneyldrm"
    annee: 2025
    url: "https://github.com/hasaneyldrm/exercises-dataset"
statut: brouillon
auteur_agent: expert-hypertrophie
derniere_revue: 2026-11-25
---

# Muscles aiiron et mapping du dataset

Données : `mapping-muscles.json` (même dossier, version 3). Utilisé par le moteur volume (séries par muscle) et par les séries d'approche (`force-paliers-montee-en-charge#musculation`).

## Principe

Le volume hebdomadaire se pilote muscle par muscle : les études dose-réponse mesurent l'hypertrophie par muscle (Schoenfeld 2017). On garde donc une liste fermée de muscles, assez fine pour orienter le choix d'exercices (têtes du deltoïde, tirage vertical contre horizontal), mais pas plus fine que ce que le dataset et la littérature permettent (pas de chefs du quadriceps ni de faisceaux du pectoral). Les libellés anglais du dataset sont traduits vers ces identifiants par une table à clé exacte. Quand le dataset se trompe sur un exercice courant, une surcharge par identifiant d'exercice le corrige. Les exercices qui ne font pas travailler un muscle contre une charge (étirements, mobilité, sauts, gammes de course) sont listés à part et ne comptent jamais. Une série indirecte compte pour une demi-série : c'est la méthode qui décrit le mieux les données dans la méta-régression de Pelland 2024 (67 études, 2 058 participants ; trois comptages comparés : 0, 0,5 ou 1 par série indirecte), confirmée pour l'hypertrophie par Remmert 2025 (volume par séance). Les deux sont des préprints non relus par les pairs, d'où le niveau C ; 0,5 est une convention testée parmi trois, pas un poids mesuré.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MAP-1 | 21 muscles suivis en volume (dont `haut_du_dos` séparé de `trapezes`, et `cou`), plus un agrégat provisoire `deltoides` et 3 muscles hors volume (`core`, `coiffe_rotateurs`, `dentele_anterieur`, voir MAP-9). Identifiants en `snake_case`, comme dans `knowledge/etirements/`. | Validé par Pierrot le 25/11/2026. Liste : taxonomie de Pierrot, choix de conception ; aucune source trouvée pour une liste de référence. Suivi par muscle : Schoenfeld 2017 (l'hypertrophie se mesure muscle par muscle) |
| MAP-2 | Une seule table pour les trois champs du dataset. Clé = libellé entier, comparaison exacte. Les 50 libellés distincts du dataset sont tous dans la table : 44 associés, 6 à `null` avec motif (plus `diaphragm`, venu de `exercices-aiiron.json`, à `null`). Libellé hors table : avertissement `LIBELLE_INCONNU`, jamais de rapprochement ; ce libellé est ignoré et les autres muscles de l'exercice comptent (décision de Pierrot du 25/11/2026). Si c'est la cible qui est hors table, les secondaires connus comptent et l'exercice n'a pas de groupe pour les séries d'approche ; un exercice cardio (cible connue à `null`) ne compte toujours rien. | Choix de conception |
| MAP-3 | Résolution d'un exercice, dans l'ordre : 1) identifiant dans `exercices_hors_volume` → rien n'est compté (MAP-11) ; 2) surcharge par identifiant (elle remplace les trois champs, et garde `core` quand le dataset le liste) ; 3) sinon principaux = `muscle_cible`, secondaires = `groupe_musculaire` + `muscles_secondaires`. Exercice inconnu : `EXERCICE_SANS_MAPPING`. Principaux vides (cardio) : aucune série comptée, même sur les secondaires. Les identifiants `mq-…` de `exercices-aiiron.json` se résolvent de la même façon. | Choix de conception |
| MAP-4 | Poids : principal 1, secondaire 0,5. | Pelland 2024 (préprint, comptage « fractionnaire » = meilleur ajustement) et Remmert 2025 (préprint, idem pour l'hypertrophie), niveau de preuve C ; validé par Pierrot le 25/11/2026 |
| MAP-5 | Dédoublonnage : par exercice, chaque muscle aiiron n'apparaît qu'une fois, avec son poids le plus élevé. `compte(m) = Σ séries × poids(ex, m)`. Seules les séries de travail comptent, jamais les séries d'approche. | Corrige T4 de `force/cas-de-test.md` |
| MAP-6 | Groupe pour les séries d'approche = premier muscle de `principaux` qui compte en volume (`compte_volume: true`). Aucun (exercice hors volume, ou seul principal `core` comme `0624` et `0551`) → pas de groupe. Pour tous les exercices des cas de test, c'est `principaux[0]`. | Validé par Pierrot le 25/11/2026 (nécessaire pour T17). Notion de « premier exercice de chaque groupe musculaire » : Iversen 2021 (revue narrative, niveau E). Règle du premier principal : choix de conception, aucune source trouvée |
| MAP-7 | Séries sur `deltoides` (tête non précisée) : compteur à part et avertissement `TETE_DELTOIDE_NON_PRECISEE`. Jamais réparties sur les trois têtes. | Validé par Pierrot le 25/11/2026. Pas de répartition fixe : la part de chaque tête change selon l'exercice (Campos 2020, EMG, niveau C : antérieur dominant au couché, latéral à l'élévation latérale). Agrégat : choix de conception imposé par le dataset |
| MAP-8 | Exercices du dataset en cible `glutes` : mouvement **dominante genou** (le genou s'étend sous charge en même temps que la hanche) → squats, fentes, step-ups, pistols : principaux `quadriceps` puis `fessiers`, secondaire `adducteurs` ; **presses et hack squats** : `quadriceps` principal, `fessiers` et `adducteurs` secondaires. Ischio-jambiers et mollets retirés dans les deux cas. Les charnières suivent MAP-10. | Kubo 2019 (IRM, niveau B) porte sur le **squat profond** à la barre : quadriceps, adducteurs et grand fessier grossissent, pas les ischio-jambiers ; il ne dit rien de la presse ni du hack squat. Plotkin 2023 (IRM, niveau B) : le squat fait grossir quadriceps et adducteurs plus que le hip thrust. Fessiers secondaire sur presse et hack : décision de Pierrot du 25/11/2026, sans étude d'hypertrophie par exercice. Extension aux fentes, step-ups et pistols : extrapolation, choix de conception |
| MAP-9 | `compte_volume: false` : le muscle n'entre jamais dans le volume hypertrophie (totaux, fourchettes, groupe des séries d'approche). `compteur_separe: true` : il est compté avec les mêmes poids et le même dédoublonnage dans un compteur affiché à part. Seul `core` est dans ce cas ; `coiffe_rotateurs` et `dentele_anterieur` ont `compteur_separe: false` (listés pour la sélection d'exercices, pas de compteur). | Validé par Pierrot le 25/11/2026 (core compté à part ; coiffe et dentelé sans compteur). Choix de conception : aucune source trouvée (les méta-analyses de volume ne mesurent pas un « core ») |
| MAP-10 | **Charnières** (la hanche s'étend, le genou reste à angle fixe ou presque). Jambes tendues ou presque, debout ou au banc à lombaires (soulevés de terre roumains et jambes tendues, soulevés sur une jambe, good mornings debout, hyperextensions dos droit) → principaux `ischio_jambiers`, `fessiers` ; secondaire `lombaires`. Genou fléchi fixe, dos au sol ou sur banc (ponts, hip thrusts) → `fessiers` principal ; ischio-jambiers, quadriceps et lombaires retirés (`core` gardé si le dataset le liste). Le reste garde le dataset (voir ci-dessous). | Ponts : Plotkin 2023 (ECR, IRM, niveau B) : hip thrust → grand fessier comme le squat, ischio-jambiers « peu ou pas » de croissance. Jambes tendues : Bourne 2017 (ECR, IRM, niveau B) : l'extension de hanche à 45° fait grossir les ischio-jambiers (biceps fémoral long chef, semi-tendineux) ; extension au soulevé roumain : extrapolation, précédent `0085` validé. Classement par nom et étapes : choix de conception |
| MAP-11 | **Exercices hors volume** : étirements, mobilité, sauts et gammes de course sont listés par identifiant dans `exercices_hors_volume`. Ils ne comptent nulle part : ni volume, ni compteur séparé, ni groupe de séries d'approche. Leurs muscles restent résolus (MAP-3, étapes 2 et 3) pour la sélection d'exercices (« étirement des fessiers »). | Étirements à zéro et sauts hors volume : validés par Pierrot le 25/11/2026 (pas de compteur `pliometrie` pour l'instant, à revoir avec le moteur course). Mobilité et gammes : choix prudent de l'expert. Critères de repérage : choix de conception |

### Muscles

| Groupe | Identifiants |
| --- | --- |
| jambes | `quadriceps`, `ischio_jambiers`, `fessiers`, `adducteurs`, `abducteurs`, `mollets`, `flechisseurs_hanche` |
| poussee | `pectoraux`, `deltoides_anterieurs`, `deltoides_lateraux`, `triceps` (+ agrégat `deltoides`) |
| tirage | `dorsaux` (tirage vertical), `haut_du_dos` (rhomboïdes, trapèzes moyens et inférieurs : tirage horizontal), `trapezes`, `deltoides_posterieurs`, `biceps` (avec le brachial), `avant_bras` |
| tronc | `abdominaux`, `obliques`, `lombaires` ; hors volume, compteur séparé : `core` (« Gainage / tronc profond ») |
| autres | `cou` ; hors volume, sans compteur : `coiffe_rotateurs`, `dentele_anterieur` |

Représentation de `core` dans le JSON : `{ "id": "core", "nom": "Gainage / tronc profond", "groupe": "tronc", "compte_volume": false, "compteur_separe": true }`, et le libellé `core` du dataset pointe dessus. `core` n'apparaît jamais en cible dans le dataset (0 en `muscle_cible`, 7 en `groupe_musculaire`, 94 en secondaire) : il reçoit des demi-séries, affichées à part (« gainage pendant tes squats : 7,5 séries »), sans toucher aux fourchettes d'abdominaux. Seules exceptions : `0624` (chaise contre le mur avec montées de genou) et `0551` (relevé turc), dont la surcharge met `core` seul en principal : toutes leurs séries vont au compteur `core`, rien au volume.

`coiffe_rotateurs` et `dentele_anterieur` : `compte_volume: false`, `compteur_separe: false`, inchangés.

### Choix notables sur les libellés

- Synonymes : `quads` et `quadriceps` → `quadriceps` ; `lats` et `latissimus dorsi` → `dorsaux` ; `traps` et `trapezius` → `trapezes` ; `abs`, `abdominals`, `lower abs` → `abdominaux` ; `spine` et `lower back` → `lombaires`.
- `shoulders`, `delts`, `deltoids` → agrégat `deltoides` : le dataset ne dit jamais quelle tête travaille (`shoulders` apparaît 400 fois en secondaire, 143 exercices ont la cible `delts`). Seul `rear deltoids` donne une tête.
- `brachialis` → `biceps` : les deux fléchissent le coude et se travaillent ensemble.
- `core` → muscle `core`, hors volume avec compteur séparé (MAP-9).
- `null` : `cardiovascular system` (29 exercices cardio, sans muscle principal), `back` (ambigu, surtout sur des kickbacks), `ankles`, `ankle stabilizers`, `feet`, `shins`.

### Surcharges (105)

**Les 8 premières, validées par Pierrot le 25/11/2026.** `0043` squat, `0336` fentes haltères → principaux quadriceps et fessiers, secondaires adducteurs (+ `core` pour `0043`) ; `0739` presse 45° → quadriceps principal, fessiers et adducteurs secondaires (changement v3, validé) ; `0085` soulevé roumain → ischio-jambiers et fessiers ; `0025` couché, `0091` développé assis, `0334` élévations latérales, `0075` oiseau barre → tête du deltoïde explicite.

**MAP-8, exercices « cible `glutes`, premier secondaire `quadriceps` » (72 dans le dataset).** Le dataset désigne les fessiers comme cible des squats, presses et fentes et ajoute partout ischio-jambiers et mollets. Critère, lu dans le nom puis les étapes : le genou s'étend-il sous charge pendant la phase concentrique ?

| Classement | Nombre | Traitement |
| --- | --- | --- |
| Genou : squats (barre, haltères, kettlebell, Smith, élastique, zercher, avant, sumo, cossack, pistol, curtsey, box), fentes, step-ups (dont `0043`, `0336`) | 47 | principaux `quadriceps`, `fessiers` ; secondaire `adducteurs` (+ `core` si le dataset le liste : 10 cas) ; `3644` fente avec balancier : + `deltoides_anterieurs` |
| Presses et hack squats : `0739`, `1464`, `1463`, `0740`, `1425`, `2611`, `0760`, `0046`, `0741`, `0743`, `0755`, `0744` (squat machine allongé, assimilé) | 12 | `quadriceps` principal ; `fessiers`, `adducteurs` secondaires |
| Sauts : `0053`, `3543`, `0371`, `0514`, `0513`, `3582`, `1420` | 7 | hors volume (MAP-11) ; les 6 premières gardent leur surcharge (quadriceps, fessiers ; adducteurs, mollets) pour la sélection |
| `0624` chaise murale avec montées de genou, `0551` relevé turc | 2 | `core` seul principal : séries au compteur `core`, rien au volume (décision de Pierrot) |
| `0642`, `0661` pompes avec coup de pied latéral | 2 | `pectoraux` principal ; `triceps`, `deltoides_anterieurs`, `abducteurs` (+ `core` pour `0661`) : restent dans le volume (décision de Pierrot) |
| `1559` étirement des fléchisseurs de hanche | 1 | hors volume, étirement (MAP-11) ; surcharge supprimée |
| `3642` « weighted stretch lunge » | 1 | dans la ligne Genou : c'est une fente lestée, pas un étirement |

Hors de ce lot, la même règle presse s'applique à `2287` (presse alternée à levier, cible `quads`, ischios et fessiers en secondaires) → `quadriceps` ; `fessiers`, `adducteurs`.

**MAP-10, charnières (29 surcharges).** Repérage : cible `glutes` avec premier secondaire `hamstrings` (67 exercices dans le dataset : 22 surchargés, 21 gardés tels quels, 13 hors volume, 10 sans rapport, plus `0085` déjà validé), plus les charnières nommées comme telles avec une autre cible (`0044`, `0116`, `1010`, `0489`, `0488`, `0484`, `0756`). Chaque exercice est classé par son nom puis ses étapes.

| Classement | Nombre | Identifiants | Traitement |
| --- | --- | --- | --- |
| Jambes tendues ou presque | 15 | `1459`, `0432`, `0434`, `1009`, `1023`, `1010`, `0116`, `1756`, `1757`, `2805`, `0044`, `0115`, `0749`, `0489`, `0488` | principaux `ischio_jambiers`, `fessiers` ; secondaire `lombaires` |
| Ponts et hip thrusts | 14 | `1409`, `3562`, `3523`, `3013`, `3561`, `1408`, `0058`, `3236`, `0668`, `1422`, `3645`, `0130`, `0484`, `0756` | `fessiers` principal (+ `core` si listé : `3562`, `3523`, `3013`, `1422`) |
| Soulevés de terre depuis le sol (`0032`, `0074`, `0117`, `0811`, `0752`, `0578`, `0157`, `0300`, `0066`) | 0 | | dataset gardé : `fessiers` ; `ischio_jambiers`, `lombaires` (+ `quadriceps` pour sumo, trap bar, Smith, câble, levier, côté). Le genou s'étend aussi, et aucune étude d'hypertrophie par muscle n'a été trouvée |
| Tirages entre les jambes, reverse hypers, extensions de hanche debout ou machine, kettlebell swing, good mornings assis (`0991`, `0196`, `2808`, `0593`, `0675`, `1423`, `0980`, `0228`, `2286`, `0549`, `0090`, `3759`) | 0 | | dataset gardé : `fessiers` ; `ischio_jambiers` (+ `lombaires` ou `quadriceps` selon le dataset) |

Restent dans le lot « premier secondaire `hamstrings` » des exercices sans rapport avec une charnière, non revus : `0984`, `0996` (rotations internes de hanche), `1003` (squat + tirage élastique), `0628` (marche latérale élastique), `1416`, `1417` (ballon), `3433` (battements de jambes), `2459` (retournement de pneu), `0295`, `3888` (épaulé et arraché haltère). Les étirements et mouvements de mobilité de ce lot sont hors volume (MAP-11).

Appliqués mais discutables :
- Fentes latérales et squats larges (`1410`, `3643`, `3142`, `0740`) : `adducteurs` sans doute plus qu'un demi. `3769` curtsey : `abducteurs` non ajoutés faute de données d'hypertrophie.
- `3132` squat avec appui : version débutant ou mobilité ? Compté comme un squat.
- `0749` good morning genoux fléchis : classé jambes tendues (debout, genoux peu fléchis, comme un roumain).
- `0130` « bench hip extension » : ses étapes décrivent un pont dos au banc, classé pont.
- `1464`, `0740` : `nom_en` source corrompu (`45в°`), corrigé dans la surcharge.

### Exercices hors volume (130)

Représentation dans le JSON : un objet `exercices_hors_volume` au même niveau que `surcharges`, une clé par catégorie, chacune avec `critere`, `validation` et `ids` (identifiants exacts, dataset et `exercices-aiiron.json`). Un identifiant n'apparaît que dans une catégorie. Pas d'attribut sur les muscles ni de pseudo-muscle : c'est l'exercice qui sort du comptage, quels que soient ses muscles.

| Catégorie | Critère de repérage | Dataset | `mq-…` | Total |
| --- | --- | --- | --- | --- |
| `etirement` | nom contenant « stretch » (sauf « outstretched » et la fente lestée `3642`), « pose » ou « yoga » ; ou étapes décrivant une position tenue pour sentir un étirement, sans charge externe | 61 | 5 | 66 |
| `mobilite` | mobilité articulaire ou échauffement sans charge : cercles, toe touches debout, inchworm, genoux à la poitrine ; mobilité et respiration de `exercices-aiiron.json` | 9 | 15 | 24 |
| `saut` | nom contenant jump, plyo, hop, burpee, clap ; ou étapes où les pieds (les mains pour les pompes) quittent le sol de façon explosive à chaque répétition. Exclus : épaulés, arrachés, lancers de médecine-ball | 27 | 3 | 30 |
| `gamme_course` | éducatifs de course : montées de genoux, talons-fesses, skippings, pas chassés et croisés, accélérations | 1 | 7 | 8 |
| `activation` | exercices d'activation de l'échauffement, légers, loin de la fatigue (ECH-F3, ECH-H3) ; validé par Pierrot le 25/11/2026 | 0 | 2 | 2 |

- Étirements, par le nom (58) : `1512`, `1708`, `1709`, `1710`, `1713`, `1714`, `1716`, `1712`, `1405`, `1259`, `1494`, `1407`, `1377`, `1378`, `1548`, `1271`, `1272`, `0257`, `1167`, `1559`, `1339`, `1341`, `1342`, `1560`, `1745`, `1511`, `1564`, `1419`, `1346`, `1576`, `0613`, `1403`, `0643`, `1388`, `1389`, `0669`, `1582`, `2571`, `2208`, `2205`, `2202`, `2207`, `1585`, `1390`, `1424`, `0690`, `2567`, `1587`, `1358`, `0716`, `0721`, `1363`, `1398`, `1599`, `0794`, `0817`, `1365`, `1604`. Par les étapes (3) : `1338` (ballon serré contre la poitrine, penché en arrière), `1362` (sphinx), `1366` (chien tête en haut). `exercices-aiiron.json` (5) : `mq-pigeon`, `mq-fente-basse`, `mq-enfant`, `mq-soleaire`, `mq-pec-porte`.
- Mobilité : `1368` et `1428` (cercles de chevilles, de poignets), `3212`, `3214`, `3215`, `3218`, `3231` (toe touches debout), `1418` (genoux à la poitrine), `1471` (inchworm) ; `mq-genou-mur`, `mq-90-90`, `mq-squat-profond`, `mq-squat-descentes-lentes`, `mq-charniere-baton`, `mq-chat-vache`, `mq-open-book`, `mq-rouleau-thoracique`, `mq-cercles-bras`, `mq-passage-epaules`, `mq-wall-slide`, `mq-prep-poignets`, `mq-balancier-avant`, `mq-balancier-lateral`, `mq-respiration`.
- Sauts, jambes : `0053`, `3543`, `0371`, `0514`, `0513`, `3582`, `1420`, `1473`, `1472`, `2798`, `1374`, `3361`, `3671` ; cardio sautés (déjà sans principal) : `3220`, `3224`, `3219`, `3222`, `3223`, `2612`, `1160`, `1201`, `0501` ; pompes pliométriques : `1273`, `1306`, `0545`, `0492`, `1310` ; `mq-foulees-bondissantes`, `mq-pogo`, `mq-burpee-saut-longueur`.
- Gammes : `3552` (quick feet), `mq-acceleration`, `mq-montees-genoux`, `mq-talons-fesses`, `mq-pas-chasses`, `mq-skipping-a`, `mq-skipping-b`, `mq-pas-croises`.
- Activation : `mq-ecartes-elastique`, `mq-rotation-externe-elastique`.

Avant la v3, `1709` et `1710` (étirements) comptaient 1 série de fessiers et 0,5 d'ischio-jambiers par série : c'était un bug, corrigé ici et vérifié par le script.

## Limites et contre-indications

- Le mapping compte des séries, il ne juge pas la qualité d'un exercice ni sa tolérance : douleur ou gêne → on arrête de prescrire sur ce point et on oriente (voir `expert-sante-physique`).
- Le poids 0,5 vient d'un préprint et sert de moyenne : un secondaire peut travailler beaucoup (triceps au couché) ou presque pas.
- Les sauts ne comptent pas en volume, mais ils fatiguent : leur charge devra être suivie par le moteur course ou un futur compteur, pas ignorée dans la planification.
- Restent sans surcharge : la plupart des exercices d'épaule (séries affichées sous `deltoides`), les soulevés de terre depuis le sol, les kickbacks, et les rotations d'épaule (`0216`, `0235`, `0863`, `0864`, `mq-rotation-externe-elastique`), à revoir vers `coiffe_rotateurs` (hors volume).
- Non classés : `3639` (torsion allongé genoux fléchis, cible `glutes` peu plausible), courses et sprints du dataset (`run`, `wind sprints`, `short stride run`), lancers de médecine-ball.
- Défauts du dataset relevés : `groupe_musculaire` recopie le premier muscle secondaire (vrai pour les 10 libellés les plus fréquents, soit 1 175 exercices sur 1 324) ; leg extension `0585` avec ischios en secondaire ; ponts `0484` et `0756` en cible `abs` ; hyperextensions `0489`, `0488` en cible `spine` ; nom corrompu `0739` (`45в°`). Le dataset manque d'exercices de mobilité, d'échauffement et de course : `exercices-aiiron.json` en comble une partie.
- `data/exercises/exercices-aiiron.json` (40 exercices `mq-…`, expert-sante-physique) reprend les libellés anglais du dataset. Ils sont tous dans la table, plus un nouveau libellé, `diaphragm` (`mq-respiration`), associé à `null`. Tout nouvel exercice ajouté là-bas doit d'abord entrer dans la table (libellés) et, si c'est un étirement, de la mobilité, un saut ou une gamme, dans `exercices_hors_volume`.

## Exemple

Semaine « libre » (T4) : squat `0043` 3 séries + presse `0739` 3 séries.
Attendu, poids réels : quadriceps 6, fessiers 4,5 (3 × 1 + 3 × 0,5), adducteurs 3. Compteur séparé : core 1,5 (`0043` seul, 3 × 0,5).
Poids 1 : quadriceps 6, fessiers 6, adducteurs 6 ; core 3. Bugué (sous-chaîne, `quadriceps` lu dans `groupe_musculaire` puis dans `muscles_secondaires`) : 12.

Séance T5 : `0025` × 4, `0027` × 3, `0043` × 5.
Attendu, poids réels : pectoraux 4, triceps 2, deltoïdes antérieurs 2, haut du dos 3, biceps 1,5, avant-bras 1,5, quadriceps 5, fessiers 5, adducteurs 2,5 ; core 2,5. Les mêmes totaux dans n'importe quel ordre.
Poids 1 : pectoraux 4, triceps 4, deltoïdes antérieurs 4, haut du dos 3, biceps 3, avant-bras 3, quadriceps 5, fessiers 5, adducteurs 5 ; core 5.

Séries d'approche (T17) : `0739`, `0336`, `0294`, `0586`, `0027`. Groupes : quadriceps (premier), quadriceps (déjà vu), biceps, ischio-jambiers, haut du dos. Approche complète sur `0739`, `0294`, `0586`, `0027` ; pas sur `0336`. Avec une série de chaque, poids réels : quadriceps 2, fessiers 1,5, adducteurs 1, biceps 1,5, avant-bras 1, ischio-jambiers 1, mollets 0,5, haut du dos 1 ; aucun core. Poids 1 : quadriceps 2, fessiers 2, adducteurs 2, biceps 2, avant-bras 2, ischio-jambiers 1, mollets 1, haut du dos 1.

Étirement `1709` × 3 : rien, ni volume ni compteur séparé (fessiers 3 et ischio-jambiers 1,5 avant la v3).
