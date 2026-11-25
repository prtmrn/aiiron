---
id: force-e1rm
domaine: force
titre: e1RM — estimation par série et mise à jour de la référence
niveau_preuve: C
sources:
  - titre: "Accuracy in Predicting Repetitions to Task Failure in Resistance Exercise: A Scoping Review and Exploratory Meta-analysis (Sports Med 52(2):377-390)"
    auteurs: "Halperin I, Malleron T, Har-Nir I et al."
    annee: 2022
    url: "https://pubmed.ncbi.nlm.nih.gov/34542869/"
  - titre: "Proximity to Failure and Total Repetitions Performed in a Set Influences Accuracy of Intraset Repetitions in Reserve-Based Rating of Perceived Exertion (JSCR 35(Suppl 1):S158-S165)"
    auteurs: "Zourdos MC, Goldsmith JA, Helms ER et al."
    annee: 2021
    url: "https://pubmed.ncbi.nlm.nih.gov/30747900/"
  - titre: "Prediction of One Repetition Maximum Strength from Multiple Repetition Maximum Testing and Anthropometry"
    auteurs: "Reynolds JM, Gordon TJ, Robergs RA"
    annee: 2006
    url: "https://www.unm.edu/~rrobergs/478RMStrengthPrediction.pdf"
  - titre: "The Accuracy of Prediction Equations for Estimating 1-RM Performance in the Bench Press, Squat, and Deadlift (JSCR 11(4):211-213)"
    auteurs: "LeSuer DA, McCormick JH, Mayhew JL et al."
    annee: 1997
    url: "https://www.unm.edu/~rrobergs/478PredictionAccuracy.pdf"
  - titre: "Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve"
    auteurs: "Zourdos MC, Klemp A, Dolan C et al."
    annee: 2016
    url: "https://openrepository.aut.ac.nz/items/efef3b25-6701-4fb5-bb82-55fcd2a26027/full"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# e1RM

## Principe

Chaque série loguée (charge, reps, RPE) donne un e1RM : la charge divisée par le % de la table RPE. Les estimations sont plus justes près de l'échec et sur des séries courtes (Halperin 2022 ; Zourdos 2021), et les formules perdent en précision au-delà de 10 reps (Reynolds 2006). On distingue deux grandeurs : l'**e1RM de série**, brut, qui sert dans la séance ; la **référence**, persistante par exercice, qui sert à prescrire la séance suivante et qu'on met à jour avec un lissage et des garde-fous contre les erreurs de saisie.

## Règles pour aiiron

### R1 — e1RM d'une série

```
e1rmSerie(charge, reps, rpe) = charge / pct(reps, rpe)      // pct : table-rpe.md
```
`charge` = charge déplacée (kg). Exercice lesté (tractions, dips) : charge = poids du corps + lest (voir `arrondi-charges.md`, R6).

### R1 bis — Single réussi à RPE 10 (validé par Pierrot le 25/11/2026)

Avec la marge +0,5 de la table, pct(1, 10) = 30/30,5 = 0,983607 : R1 donnerait un e1RM 1,67 % au-dessus de la charge (100 kg × 1 @ 10 → 101,67). Règle :
```
reps = 1 et RPE = 10 → e1rmSerie = charge
```
- Raison : un single à fond est, par définition, le 1RM du jour. Afficher « environ 101,7 kg » après un 100 kg à fond serait incohérent.
- Cohérence : même valeur que R7 (test de 1RM : ref = charge) et R8 (1RM déclaré = valeur).
- Sans effet sur la prescription : RPE 10 n'est jamais prescrit hors séance `test_1rm` (`ajustement-rpe.md`, R7).
- Effet de bord : entre 1 @ 9,5 (e1RM = charge × 1,0333) et 1 @ 10 (e1RM = charge), l'écart passe à 3,3 % au lieu de 1,6 %. Acceptable : on reste du côté prudent (e1RM plus bas).
- Sans R1 bis, la règle générale R1 s'appliquerait (101,67). Choix de conception validé par Pierrot le 25/11/2026.

### R2 — Série valide pour l'e1RM

Une série compte seulement si toutes ces conditions sont vraies :
- type `travail` (jamais un palier d'échauffement) ;
- 1 ≤ reps réalisées ≤ 10, sinon `SERIE_TROP_LONGUE` (Reynolds 2006 : pas plus de 10 reps pour une prédiction linéaire) ;
- 7 ≤ RPE ≤ 10, sinon `RPE_TROP_BAS_POUR_E1RM` (Zourdos 2021 : erreur plus grande loin de l'échec ; seuil 7 = heuristique de coach, validée par Pierrot le 25/11/2026) ;
- pas de drapeau `DOULEUR` sur la série ;
- charge > 0.

### R3 — RPE absent ou invalide

| Situation | Traitement |
| --- | --- |
| RPE non numérique, < 1 ou > 10 | `RPE_INVALIDE`, traité comme absent |
| RPE non multiple de 0,5 | arrondi au demi-point, égalité vers le haut |
| RPE absent, reps réalisées = reps prescrites | série non utilisée, `RPE_MANQUANT` ; la référence ne bouge pas grâce à cette série |
| RPE absent, 1 ≤ reps réalisées < reps prescrites | on suppose l'échec : RPE = 10 aux reps réalisées (heuristique prudente : donne l'e1RM le plus bas compatible avec l'échec ; validé par Pierrot le 25/11/2026) |
| 0 rep réalisée | pas d'e1RM, `ECHEC_TOTAL` (voir `ajustement-rpe.md`) |

### R4 — Série de référence de la séance

Parmi les séries valides d'un exercice dans la séance : celle au RPE le plus élevé ; à égalité, la charge la plus lourde ; à égalité, la première dans l'ordre chronologique.
`e1rmJour = e1rmSerie(série de référence) / remise_contexte(slot)` (la remise de contexte, 1 par défaut, est définie dans `variantes-discounts.md`).
Justification : la notation est plus juste près de l'échec (Halperin 2022, Zourdos 2021). Validé par Pierrot le 25/11/2026.
Aucune série valide → référence inchangée, `PAS_DE_DONNEE_FIABLE`.

### R5 — Garde-fou « aberrant »

```
ratio = e1rmJour / ref
si ratio > 1,10 ou ratio < 0,90 → A_CONFIRMER, non intégré
```
aiiron demande à l'utilisateur de confirmer la saisie (charge, reps, RPE). Confirmé → intégré par R6 sans garde-fou. Corrigé → recalcul avec les valeurs corrigées. Seuil ±10 % : heuristique de coach, validé par Pierrot le 25/11/2026.

### R6 — Mise à jour de la référence (lissage)

```
ref_nouvelle = ref + α × (e1rmJour − ref)      avec α = 0,5
```
Avec R5, une séance déplace la référence d'au plus ±5 %. α = 0,5 : choix de conception validé par Pierrot le 25/11/2026 (amortit le bruit de notation d'environ 1 rep, Halperin 2022, tout en suivant une vraie progression en 2 à 3 séances).

### R7 — Séance de test de 1RM (planifiée)

Si la séance est marquée `test_1rm` : ref = charge du meilleur single réussi (reps = 1), sans lissage. Garde-fou réduit : ratio > 1,20 → `A_CONFIRMER`. Le protocole de test sécurisé fera l'objet d'une fiche dédiée.

### R8 — Initialisation de la référence (nouvel utilisateur ou nouvel exercice)

| Donnée disponible | Référence initiale |
| --- | --- |
| 1RM testé il y a ≤ 8 semaines | valeur déclarée |
| 1RM plus ancien ou « estimé » | 0,95 × valeur déclarée |
| « x kg pour r reps à fond », r ≤ 10 | e1rmSerie(x, r, 10) (r = 1 : x, R1 bis) |
| variante sans historique | e1RM de la base × coefficient (voir `variantes-discounts.md`) |
| rien | séance d'étalonnage : montée par paliers jusqu'à un 5 @ RPE 8 choisi en séance, puis R4 |

Valeurs 8 semaines et 0,95 : heuristiques de coach, validées par Pierrot le 25/11/2026.

### R9 — Ce que les séries d'une variante mettent à jour

Une série met à jour uniquement la référence de son propre exercice. Une pause squat ne modifie pas la référence du squat. Choix de conception validé par Pierrot le 25/11/2026 (évite qu'un exercice secondaire mal noté contamine le mouvement principal).

## Limites et contre-indications

- Les équations sous-estiment souvent le 1RM au soulevé de terre (LeSuer 1997). L'e1RM affiché est une estimation, à présenter comme telle (« environ »).
- Débutants : notation moins fiable près du maximum (Zourdos 2016). Voir les garde-fous débutant dans `ajustement-rpe.md`.
- Douleur sur une série : la série n'est pas utilisée, l'exercice est arrêté (`DOULEUR`), orientation `expert-sante-physique`.

## Exemple (réutilisable comme test)

| Entrée | Calcul | Sortie |
| --- | --- | --- |
| 100 kg × 5 @ 8 | n = 7,5 ; 100 / 0,819444 | 122,03 |
| 100 kg × 3 @ 9 | n = 4,5 ; 100 / (30/33,5) | 111,67 |
| 100 kg × 1 @ 10 | n = 1,5 ; 100 / 0,983607 | 101,67 (R1) ; **100,0** avec R1 bis |
| 140 kg × 8 @ 7,5 | n = 11 ; 140 / 0,722222 | 193,85 |
| 80 kg × 12 @ 8 | reps > 10 | null, `SERIE_TROP_LONGUE` |
| 100 kg × 5 @ 6 | RPE < 7 | null, `RPE_TROP_BAS_POUR_E1RM` |
| 125 kg × 3 (5 prescrites), RPE absent | RPE := 10, n = 3,5 ; 125 / 0,923077 | 135,42 |

Mise à jour : ref 150, top set prescrit 5 @ 8 = 122,5 kg, fait 122,5 × 5 @ 9 → e1rmJour = 122,5 / 0,845070 = 144,958 → ratio 0,966 → ref = 150 + 0,5 × (144,958 − 150) = **147,479**.
