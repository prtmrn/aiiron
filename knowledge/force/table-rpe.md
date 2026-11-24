---
id: force-table-rpe
domaine: force
titre: Table RPE — reps × RPE → % e1RM
niveau_preuve: C
sources:
  - titre: "Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve"
    auteurs: "Zourdos MC, Klemp A, Dolan C et al."
    annee: 2016
    url: "https://openrepository.aut.ac.nz/items/efef3b25-6701-4fb5-bb82-55fcd2a26027/full"
  - titre: "Application of the Repetitions in Reserve-Based Rating of Perceived Exertion Scale for Resistance Training"
    auteurs: "Helms ER, Cronin J, Storey A, Zourdos MC"
    annee: 2016
    url: "https://openrepository.aut.ac.nz/items/92cefeac-7c32-44f1-bfbc-f48f4a5dd8cf/full"
  - titre: "Strength Testing — Predicting a One-Rep Max from Reps-to-Fatigue (JOPERD 64(1):88-90)"
    auteurs: "Brzycki M"
    annee: 1993
    url: "https://brzycki.scholar.princeton.edu/publications/strength-testing-%E2%80%93-predicting-one-rep-max-reps-fatigue"
  - titre: "Poundage Chart. Boyd Epley Workout. Lincoln, NE: Body Enterprises"
    auteurs: "Epley B"
    annee: 1985
    url: ""
  - titre: "Prediction of One Repetition Maximum Strength from Multiple Repetition Maximum Testing and Anthropometry (JSCR 20(3):584-592)"
    auteurs: "Reynolds JM, Gordon TJ, Robergs RA"
    annee: 2006
    url: "https://www.unm.edu/~rrobergs/478RMStrengthPrediction.pdf"
  - titre: "Accuracy in Predicting Repetitions to Task Failure in Resistance Exercise: A Scoping Review and Exploratory Meta-analysis (Sports Med 52(2):377-390)"
    auteurs: "Halperin I, Malleron T, Har-Nir I et al."
    annee: 2022
    url: "https://pubmed.ncbi.nlm.nih.gov/34542869/"
  - titre: "The Reactive Training Manual (principe de la table RPE en powerlifting ; valeurs non reprises)"
    auteurs: "Tuchscherer M"
    annee: 2008
    url: ""
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Table RPE

## Principe

L'échelle RPE basée sur les répétitions en réserve (RIR) associe chaque note à un nombre de reps encore possibles : RPE 10 = 0 RIR, RPE 9 = 1 RIR, RPE 8 = 2 RIR, etc. (Zourdos 2016 ; Helms 2016). Une série de r reps à RPE x équivaut donc à une série menée à l'échec d'environ r + (10 − x) reps ; on y ajoute une demi-rep de marge de prudence. Il reste à relier ce nombre au % du 1RM : on utilise deux formules publiques de prédiction du 1RM (Epley 1985, Brzycki 1993) et on garde, pour chaque n, la plus prudente des deux (le % le plus bas). Nos valeurs sont calculées par formule : rien n'est recopié d'un tableur existant. L'idée d'une table reps × RPE pour le powerlifting vient de Tuchscherer (RTS), seul le principe est repris.

## Règles pour aiiron

### R1 — Reps jusqu'à l'échec équivalentes

```
RIR = 10 − RPE
n   = reps + RIR + 0,5 = reps + 10 − RPE + 0,5
```
- Correspondance RPE ↔ RIR : Zourdos 2016, Helms 2016.
- Demi-rep de marge (+0,5) : validé par Pierrot le 25/11/2026. Elle va dans le sens de l'erreur moyenne de notation : les pratiquants sous-estiment leurs reps en réserve d'environ 1 rep (Halperin 2022). Effet : chaque cellule vaut celle d'un demi-point de RPE plus bas sans la marge.
- Les demi-points de RPE sont traités linéairement (RPE 8,5 = 1,5 RIR) : choix de conception à valider, cohérent avec la lecture « 1 ou 2 reps en réserve » des demi-points dans Helms 2016.

### R2 — Fonction % (normative, pas d'interpolation tabulée)

```
pct = min( 30 / (29 + n) , (37 − n) / 36 )        avec n de R1
```
- `30 / (29 + n)` est Epley (1RM = w × (1 + r/30)) recalé pour que n = 1 donne 100 % : 1RM = w × (1 + (n − 1)/30).
- `(37 − n) / 36` est Brzycki (1RM = w × 36 / (37 − r)).
- Continuité, vérifiée : les deux branches sont égales quand (37 − n)(29 + n) = 1080, soit n² − 8n + 7 = 0, donc en n = 1 et n = 7. Entre 1 et 7, Epley est la plus basse ; au-delà de 7, Brzycki. Le +0,5 décale n avant la fonction et ne touche pas aux branches : la bascule reste en n = 7 (30/36 des deux côtés), la fonction reste continue et strictement décroissante sur tout le domaine n ∈ [1,5 ; 19,5]. Seul changement : n = 1 n'est plus atteint, donc **aucune cellule ne vaut 100 %** (1 rep @ RPE 10 = 30/30,5 = 98,4 %).
- Le minimum des deux formules et la marge +0,5 : validés par Pierrot le 25/11/2026.
- La fonction s'applique directement aux n fractionnaires (demi-points) : **il n'y a pas d'interpolation**, la formule est la vérité. La table ci-dessous n'est qu'un affichage arrondi à 0,1 point.

### R3 — Domaine

| Grandeur | Domaine de prescription | Hors domaine |
| --- | --- | --- |
| reps | entier 1 à 15 | `HORS_DOMAINE`, pas de charge |
| RPE prescrit | 6 à 10 par pas de 0,5 | `HORS_DOMAINE`, pas de charge |
| n | 1,5 à 19,5 | — |

Reps 13 à 15 acceptées pour prescrire (la formule donne 48,6 % à n = 19,5), mais ces séries ne servent jamais à estimer l'e1RM (voir `e1rm.md`) : la précision des formules se dégrade au-delà de 10 reps (Brzycki 1993 ; Reynolds 2006).

### R4 — Fonction inverse (RPE déduit d'un %)

Sert à relire un modèle qui donne un % au lieu d'un RPE.
```
si pct ≥ 30/36 : n = 30 / pct − 29
sinon          : n = 37 − 36 × pct
RPE_implicite  = reps + 10,5 − n          // non arrondi
```
- RPE_implicite > 10 → `PCT_IMPOSSIBLE` (le % dépasse ce que ces reps permettent avec la table) : ligne refusée.
- 6 ≤ RPE_implicite ≤ 10 → arrondi au demi-point (égalité vers le haut) et utilisé, drapeau `RPE_DEDUIT_DU_PCT`.
- RPE_implicite < 6 → série légère (technique) : charge = e1RM × pct saisi, drapeau `HORS_DOMAINE` informatif. Choix de conception à valider.

### R5 — Contrôle de cohérence % ↔ RPE

Si un modèle donne à la fois un % et un RPE : calculer RPE_implicite(% saisi, reps). Si |RPE_implicite − RPE prescrit| > 0,5 → `INCOHERENCE_PCT_RPE`. Dans tous les cas, la charge est calculée depuis (reps, RPE), jamais depuis le % saisi. Un RPE_implicite > 10 donne ici `INCOHERENCE_PCT_RPE` et non `PCT_IMPOSSIBLE` : le RPE prescrit fait foi, la ligne n'est pas refusée. Seuil 0,5 : heuristique de coach à valider (la notation RPE a elle-même une erreur d'environ 1 rep, Halperin 2022).

### R6 — Single à RPE 10 (conséquence de la marge +0,5)

- pct(1, 10) = 0,983607 : un single réussi à RPE 10 donnerait un e1RM 1,67 % au-dessus de la charge (100 kg → 101,67). Règle proposée pour l'e1RM : voir `e1rm.md`, R1 bis (e1RM = charge). À valider.
- Côté prescription, rien ne change : RPE 10 n'est jamais prescrit hors séance `test_1rm` (`ajustement-rpe.md`, R7).
- Côté lecture de modèle (R4) : une ligne « 1 rep à 100 % » donne RPE_implicite 10,5 → `PCT_IMPOSSIBLE`. Toute ligne à 1 rep au-dessus de 98,4 % est refusée hors test : elle relève du futur protocole de test de 1RM. Choix de conception à valider.

### Table d'affichage (% e1RM, arrondi à 0,1)

| Reps \ RPE | 10 | 9,5 | 9 | 8,5 | 8 | 7,5 | 7 | 6,5 | 6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 98,4 | 96,8 | 95,2 | 93,8 | 92,3 | 90,9 | 89,6 | 88,2 | 87,0 |
| 2 | 95,2 | 93,8 | 92,3 | 90,9 | 89,6 | 88,2 | 87,0 | 85,7 | 84,5 |
| 3 | 92,3 | 90,9 | 89,6 | 88,2 | 87,0 | 85,7 | 84,5 | 83,3 | 81,9 |
| 4 | 89,6 | 88,2 | 87,0 | 85,7 | 84,5 | 83,3 | 81,9 | 80,6 | 79,2 |
| 5 | 87,0 | 85,7 | 84,5 | 83,3 | 81,9 | 80,6 | 79,2 | 77,8 | 76,4 |
| 6 | 84,5 | 83,3 | 81,9 | 80,6 | 79,2 | 77,8 | 76,4 | 75,0 | 73,6 |
| 7 | 81,9 | 80,6 | 79,2 | 77,8 | 76,4 | 75,0 | 73,6 | 72,2 | 70,8 |
| 8 | 79,2 | 77,8 | 76,4 | 75,0 | 73,6 | 72,2 | 70,8 | 69,4 | 68,1 |
| 9 | 76,4 | 75,0 | 73,6 | 72,2 | 70,8 | 69,4 | 68,1 | 66,7 | 65,3 |
| 10 | 73,6 | 72,2 | 70,8 | 69,4 | 68,1 | 66,7 | 65,3 | 63,9 | 62,5 |
| 11 | 70,8 | 69,4 | 68,1 | 66,7 | 65,3 | 63,9 | 62,5 | 61,1 | 59,7 |
| 12 | 68,1 | 66,7 | 65,3 | 63,9 | 62,5 | 61,1 | 59,7 | 58,3 | 56,9 |

Propriété utile pour les tests : la table ne dépend que de n, donc chaque diagonale (reps + 1, RPE + 1) est constante (ex. 3 @ 8 = 4 @ 9 = 5 @ 10 = 87,0 %, n = 5,5).

## Limites et contre-indications

- Les formules de prédiction varient selon le mouvement : elles sous-estiment souvent le 1RM au soulevé de terre (LeSuer 1997, voir `e1rm.md`). Comme la même table sert à estimer l'e1RM et à prescrire, l'erreur s'annule en grande partie (aller-retour cohérent) ; elle compte surtout pour l'affichage de l'e1RM et pour une tentative de 1RM.
- Effet réel de la marge +0,5 : l'aller-retour reste exact (une charge loguée au RPE prescrit laisse la référence inchangée). La marge joue donc surtout sur les charges calculées depuis un 1RM testé ou déclaré (de 1,5 à 3 % plus légères qu'avec n sans marge, selon n) et sur l'e1RM affiché depuis une série (de 1,5 à 3 % plus haut). La marge rapproche nos valeurs de la table RTS diffusée dans la communauté, sans comparaison cellule par cellule ni reprise de ses valeurs.
- Les débutants notent le RPE moins bien près du maximum (Zourdos 2016) ; une méta-analyse ne trouve pas d'effet du niveau d'entraînement (Halperin 2022). Choix prudent retenu : garde-fous spécifiques débutant dans `ajustement-rpe.md`.
- RPE < 6 : la notation est peu fiable loin de l'échec (Zourdos 2021) ; ces séries ne sont pas pilotées par la table.

## Exemple (réutilisable comme test)

| Entrée | n | pct (6 décimales) |
| --- | --- | --- |
| pct(1, 10) | 1,5 | 0,983607 (pas 1) |
| pct(1, 9,5) | 2 | 0,967742 |
| pct(3, 8) | 5,5 | 0,869565 |
| pct(5, 8) | 7,5 | 0,819444 |
| pct(5, 8,5) | 7 | 0,833333 (bascule Epley/Brzycki) |
| pct(8, 7) | 11,5 | 0,708333 |
| pct(12, 6) | 16,5 | 0,569444 |
| pct(15, 6) | 19,5 | 0,486111 |
| pct(16, 8) | — | `HORS_DOMAINE` |

| Entrée | n | RPE_implicite |
| --- | --- | --- |
| rpeDepuisPct(0,85, 5) | 6,294118 | 9,205882 |
| rpeDepuisPct(0,92, 5) | 3,608696 | 11,891304 → `PCT_IMPOSSIBLE` |
| rpeDepuisPct(0,75, 5) | 10 | 5,5 → < 6 |
| rpeDepuisPct(1,00, 1) | 1 | 10,5 → `PCT_IMPOSSIBLE` |
