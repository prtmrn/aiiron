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

L'échelle RPE basée sur les répétitions en réserve (RIR) associe chaque note à un nombre de reps encore possibles : RPE 10 = 0 RIR, RPE 9 = 1 RIR, RPE 8 = 2 RIR, etc. (Zourdos 2016 ; Helms 2016). Une série de r reps à RPE x équivaut donc à une série menée à l'échec de n = r + (10 − x) reps. Il reste à relier n au % du 1RM : on utilise deux formules publiques de prédiction du 1RM (Epley 1985, Brzycki 1993) et on garde, pour chaque n, la plus prudente des deux pour la prescription (le % le plus bas). Nos valeurs sont calculées par formule : rien n'est recopié d'un tableur existant. L'idée d'une table reps × RPE pour le powerlifting vient de Tuchscherer (RTS), seul le principe est repris.

## Règles pour aiiron

### R1 — Reps jusqu'à l'échec équivalentes

```
RIR = 10 − RPE
n   = reps + RIR = reps + 10 − RPE
```
Source : correspondance RPE ↔ RIR (Zourdos 2016, Helms 2016). Les demi-points sont traités linéairement (RPE 8,5 = 1,5 RIR) : choix de conception à valider, cohérent avec la lecture « 1 ou 2 reps en réserve » des demi-points dans Helms 2016.

### R2 — Fonction % (normative, pas d'interpolation tabulée)

```
pct(n) = min( 30 / (29 + n) , (37 − n) / 36 )
```
- `30 / (29 + n)` est Epley (1RM = w × (1 + r/30)) recalé pour que n = 1 donne 100 % : 1RM = w × (1 + (n − 1)/30).
- `(37 − n) / 36` est Brzycki (1RM = w × 36 / (37 − r)).
- Les deux branches sont égales en n = 7 (30/36) : la fonction est continue et décroissante. Epley est retenue pour n ≤ 7, Brzycki pour n ≥ 7.
- Le minimum des deux est le choix prudent pour la prescription (choix de conception à valider).
- La fonction s'applique directement aux n fractionnaires (demi-points) : **il n'y a pas d'interpolation**, la formule est la vérité. La table ci-dessous n'est qu'un affichage arrondi à 0,1 point.

### R3 — Domaine

| Grandeur | Domaine de prescription | Hors domaine |
| --- | --- | --- |
| reps | entier 1 à 15 | `HORS_DOMAINE`, pas de charge |
| RPE prescrit | 6 à 10 par pas de 0,5 | `HORS_DOMAINE`, pas de charge |
| n | 1 à 19 | — |

Reps 13 à 15 acceptées pour prescrire (la formule donne 50 % à n = 19), mais ces séries ne servent jamais à estimer l'e1RM (voir `e1rm.md`) : la précision des formules se dégrade au-delà de 10 reps (Brzycki 1993 ; Reynolds 2006).

### R4 — Fonction inverse (RPE déduit d'un %)

Sert à relire un modèle qui donne un % au lieu d'un RPE.
```
si pct ≥ 30/36 : n = 30 / pct − 29
sinon          : n = 37 − 36 × pct
RPE_implicite  = 10 − (n − reps)          // non arrondi
```
- RPE_implicite > 10 → `PCT_IMPOSSIBLE` (le % dépasse ce que ces reps permettent à l'échec) : ligne refusée.
- 6 ≤ RPE_implicite ≤ 10 → arrondi au demi-point (égalité vers le haut) et utilisé, drapeau `RPE_DEDUIT_DU_PCT`.
- RPE_implicite < 6 → série légère (technique) : charge = e1RM × pct saisi, drapeau `HORS_DOMAINE` informatif. Choix de conception à valider.

### R5 — Contrôle de cohérence % ↔ RPE

Si un modèle donne à la fois un % et un RPE : calculer RPE_implicite(% saisi, reps). Si |RPE_implicite − RPE prescrit| > 0,5 → `INCOHERENCE_PCT_RPE`. Dans tous les cas, la charge est calculée depuis (reps, RPE), jamais depuis le % saisi. Seuil 0,5 : heuristique de coach à valider (la notation RPE a elle-même une erreur d'environ 1 rep, Halperin 2022).

### Table d'affichage (% e1RM, arrondi à 0,1)

| Reps \ RPE | 10 | 9,5 | 9 | 8,5 | 8 | 7,5 | 7 | 6,5 | 6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 100,0 | 98,4 | 96,8 | 95,2 | 93,8 | 92,3 | 90,9 | 89,6 | 88,2 |
| 2 | 96,8 | 95,2 | 93,8 | 92,3 | 90,9 | 89,6 | 88,2 | 87,0 | 85,7 |
| 3 | 93,8 | 92,3 | 90,9 | 89,6 | 88,2 | 87,0 | 85,7 | 84,5 | 83,3 |
| 4 | 90,9 | 89,6 | 88,2 | 87,0 | 85,7 | 84,5 | 83,3 | 81,9 | 80,6 |
| 5 | 88,2 | 87,0 | 85,7 | 84,5 | 83,3 | 81,9 | 80,6 | 79,2 | 77,8 |
| 6 | 85,7 | 84,5 | 83,3 | 81,9 | 80,6 | 79,2 | 77,8 | 76,4 | 75,0 |
| 7 | 83,3 | 81,9 | 80,6 | 79,2 | 77,8 | 76,4 | 75,0 | 73,6 | 72,2 |
| 8 | 80,6 | 79,2 | 77,8 | 76,4 | 75,0 | 73,6 | 72,2 | 70,8 | 69,4 |
| 9 | 77,8 | 76,4 | 75,0 | 73,6 | 72,2 | 70,8 | 69,4 | 68,1 | 66,7 |
| 10 | 75,0 | 73,6 | 72,2 | 70,8 | 69,4 | 68,1 | 66,7 | 65,3 | 63,9 |
| 11 | 72,2 | 70,8 | 69,4 | 68,1 | 66,7 | 65,3 | 63,9 | 62,5 | 61,1 |
| 12 | 69,4 | 68,1 | 66,7 | 65,3 | 63,9 | 62,5 | 61,1 | 59,7 | 58,3 |

Propriété utile pour les tests : la table ne dépend que de n, donc chaque diagonale (reps + 1, RPE + 1) est constante (ex. 3 @ 8 = 4 @ 9 = 5 @ 10 = 88,2 %).

## Limites et contre-indications

- Les formules de prédiction varient selon le mouvement : elles sous-estiment souvent le 1RM au soulevé de terre (LeSuer 1997, voir `e1rm.md`). Comme la même table sert à estimer l'e1RM et à prescrire, l'erreur s'annule en grande partie (aller-retour cohérent) ; elle compte surtout pour l'affichage de l'e1RM et pour une tentative de 1RM.
- Notre table est un peu plus haute que la table RTS diffusée dans la communauté (à vérifier cellule par cellule par Pierrot si besoin) : à reps × RPE égaux, nos charges sont légèrement plus lourdes. L'autorégulation corrige dès la première séance loguée. Alternative plus prudente si Pierrot le souhaite : utiliser n + 0,5.
- Les débutants notent le RPE moins bien près du maximum (Zourdos 2016) ; une méta-analyse ne trouve pas d'effet du niveau d'entraînement (Halperin 2022). Choix prudent retenu : garde-fous spécifiques débutant dans `ajustement-rpe.md`.
- RPE < 6 : la notation est peu fiable loin de l'échec (Zourdos 2021) ; ces séries ne sont pas pilotées par la table.

## Exemple (réutilisable comme test)

| Entrée | n | pct (6 décimales) |
| --- | --- | --- |
| pct(1, 10) | 1 | 1,000000 |
| pct(1, 9,5) | 1,5 | 0,983607 |
| pct(3, 8) | 5 | 0,882353 |
| pct(5, 8) | 7 | 0,833333 |
| pct(5, 8,5) | 6,5 | 0,845070 |
| pct(8, 7) | 11 | 0,722222 |
| pct(12, 6) | 16 | 0,583333 |
| pct(15, 6) | 19 | 0,500000 |
| pct(16, 8) | — | `HORS_DOMAINE` |
| rpeDepuisPct(0,85, 5) | 6,294118 | 8,705882 |
| rpeDepuisPct(0,92, 5) | 3,608696 | 11,391304 → `PCT_IMPOSSIBLE` |
| rpeDepuisPct(0,75, 5) | 10 | 5 → < 6 |
