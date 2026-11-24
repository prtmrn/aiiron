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

### R2 — Série valide pour l'e1RM

Une série compte seulement si toutes ces conditions sont vraies :
- type `travail` (jamais un palier d'échauffement) ;
- 1 ≤ reps réalisées ≤ 10, sinon `SERIE_TROP_LONGUE` (Reynolds 2006 : pas plus de 10 reps pour une prédiction linéaire) ;
- 7 ≤ RPE ≤ 10, sinon `RPE_TROP_BAS_POUR_E1RM` (Zourdos 2021 : erreur plus grande loin de l'échec ; seuil 7 = heuristique de coach à valider) ;
- pas de drapeau `DOULEUR` sur la série ;
- charge > 0.

### R3 — RPE absent ou invalide

| Situation | Traitement |
| --- | --- |
| RPE non numérique, < 1 ou > 10 | `RPE_INVALIDE`, traité comme absent |
| RPE non multiple de 0,5 | arrondi au demi-point, égalité vers le haut |
| RPE absent, reps réalisées = reps prescrites | série non utilisée, `RPE_MANQUANT` ; la référence ne bouge pas grâce à cette série |
| RPE absent, 1 ≤ reps réalisées < reps prescrites | on suppose l'échec : RPE = 10 aux reps réalisées (heuristique prudente : donne l'e1RM le plus bas compatible avec l'échec) |
| 0 rep réalisée | pas d'e1RM, `ECHEC_TOTAL` (voir `ajustement-rpe.md`) |

### R4 — Série de référence de la séance

Parmi les séries valides d'un exercice dans la séance : celle au RPE le plus élevé ; à égalité, la charge la plus lourde ; à égalité, la première dans l'ordre chronologique.
`e1rmJour = e1rmSerie(série de référence) / remise_contexte(slot)` (la remise de contexte, 1 par défaut, est définie dans `variantes-discounts.md`).
Justification : la notation est plus juste près de l'échec (Halperin 2022, Zourdos 2021).
Aucune série valide → référence inchangée, `PAS_DE_DONNEE_FIABLE`.

### R5 — Garde-fou « aberrant »

```
ratio = e1rmJour / ref
si ratio > 1,10 ou ratio < 0,90 → A_CONFIRMER, non intégré
```
aiiron demande à l'utilisateur de confirmer la saisie (charge, reps, RPE). Confirmé → intégré par R6 sans garde-fou. Corrigé → recalcul avec les valeurs corrigées. Seuil ±10 % : heuristique de coach à valider.

### R6 — Mise à jour de la référence (lissage)

```
ref_nouvelle = ref + α × (e1rmJour − ref)      avec α = 0,5
```
Avec R5, une séance déplace la référence d'au plus ±5 %. α = 0,5 : choix de conception à valider (amortit le bruit de notation d'environ 1 rep, Halperin 2022, tout en suivant une vraie progression en 2 à 3 séances).

### R7 — Séance de test de 1RM (planifiée)

Si la séance est marquée `test_1rm` : ref = charge du meilleur single réussi (reps = 1), sans lissage. Garde-fou réduit : ratio > 1,20 → `A_CONFIRMER`. Le protocole de test sécurisé fera l'objet d'une fiche dédiée.

### R8 — Initialisation de la référence (nouvel utilisateur ou nouvel exercice)

| Donnée disponible | Référence initiale |
| --- | --- |
| 1RM testé il y a ≤ 8 semaines | valeur déclarée |
| 1RM plus ancien ou « estimé » | 0,95 × valeur déclarée |
| « x kg pour r reps à fond », r ≤ 10 | e1rmSerie(x, r, 10) |
| variante sans historique | e1RM de la base × coefficient (voir `variantes-discounts.md`) |
| rien | séance d'étalonnage : montée par paliers jusqu'à un 5 @ RPE 8 choisi en séance, puis R4 |

Valeurs 8 semaines et 0,95 : heuristiques de coach à valider.

### R9 — Ce que les séries d'une variante mettent à jour

Une série met à jour uniquement la référence de son propre exercice. Une pause squat ne modifie pas la référence du squat. Choix de conception à valider (évite qu'un exercice secondaire mal noté contamine le mouvement principal).

## Limites et contre-indications

- Les équations sous-estiment souvent le 1RM au soulevé de terre (LeSuer 1997). L'e1RM affiché est une estimation, à présenter comme telle (« environ »).
- Débutants : notation moins fiable près du maximum (Zourdos 2016). Voir les garde-fous débutant dans `ajustement-rpe.md`.
- Douleur sur une série : la série n'est pas utilisée, l'exercice est arrêté (`DOULEUR`), orientation `expert-sante-physique`.

## Exemple (réutilisable comme test)

| Entrée | Calcul | Sortie |
| --- | --- | --- |
| 100 kg × 5 @ 8 | 100 / 0,833333 | 120,0 |
| 100 kg × 3 @ 9 | 100 / (30/33) | 110,0 |
| 100 kg × 1 @ 10 | 100 / 1 | 100,0 |
| 140 kg × 8 @ 7,5 | 140 / 0,736111 | 190,19 |
| 80 kg × 12 @ 8 | reps > 10 | null, `SERIE_TROP_LONGUE` |
| 100 kg × 5 @ 6 | RPE < 7 | null, `RPE_TROP_BAS_POUR_E1RM` |
| 125 kg × 3 (5 prescrites), RPE absent | RPE := 10 ; 125 / 0,9375 | 133,33 |

Mise à jour : ref 150, top set 125 × 5 @ 9 (prescrit @ 8) → e1rmJour = 125 / 0,857143 = 145,833 → ratio 0,972 → ref = 150 + 0,5 × (145,833 − 150) = **147,917**.
