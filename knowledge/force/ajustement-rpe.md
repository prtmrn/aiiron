---
id: force-ajustement-rpe
domaine: force
titre: Ajustement de charge selon RPE réel vs prescrit
niveau_preuve: E
sources:
  - titre: "RPE vs. Percentage 1RM Loading in Periodized Programs Matched for Sets and Repetitions"
    auteurs: "Helms ER, Byrnes RK, Cooke DM et al."
    annee: 2018
    url: "https://pubmed.ncbi.nlm.nih.gov/29628895/"
  - titre: "Autoregulation by 'Repetitions in Reserve' Leads to Greater Improvements in Strength Over a 12-Week Training Program Than Fixed Loading (JSCR 35(9):2451-2456)"
    auteurs: "Graham T, Cleather DJ"
    annee: 2021
    url: "https://research.stmarys.ac.uk/id/eprint/3067"
  - titre: "Accuracy in Predicting Repetitions to Task Failure in Resistance Exercise: A Scoping Review and Exploratory Meta-analysis"
    auteurs: "Halperin I, Malleron T, Har-Nir I et al."
    annee: 2022
    url: "https://pubmed.ncbi.nlm.nih.gov/34542869/"
  - titre: "Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve"
    auteurs: "Zourdos MC, Klemp A, Dolan C et al."
    annee: 2016
    url: "https://openrepository.aut.ac.nz/items/efef3b25-6701-4fb5-bb82-55fcd2a26027/full"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Ajustement RPE réel vs prescrit

## Principe

Ajuster la charge série après série et séance après séance selon le RPE réellement ressenti est au moins aussi efficace qu'une charge fixe en % (Helms 2018 ; Graham et Cleather 2021). Le moteur n'utilise pas de table « écart → % » à part : il recalcule l'e1RM depuis la dernière série et en redérive la charge suivante avec la même table RPE. Les règles ci-dessous ajoutent une zone morte (bruit de notation), des plafonds à la hausse et des arrêts de sécurité. La baisse de charge n'est jamais plafonnée : alléger est toujours permis.

## Règles pour aiiron

Notations : `écart = RPE réel − RPE prescrit` de la dernière série loguée de l'exercice. `prévue` = charge calculée pour la série suivante avant la séance.

### R1 — Préalables

- Série avec `DOULEUR` → plus aucune série de cet exercice (`DOULEUR`). La conversation propose une alternative indolore simple et oriente vers `expert-sante-physique`.
- RPE absent, reps faites = reps prescrites → pas d'ajustement (`RPE_MANQUANT`).
- RPE absent, reps manquées → RPE := 10 aux reps faites (comme `e1rm.md`, R3), puis R5.
- 0 rep → R6.
- Série non valide pour l'e1RM (reps > 10 ou RPE < 7, voir `e1rm.md`, R2) → pas d'ajustement.

### R2 — Recalcul (utilisé par R4 et R5)

```
e1rmSerie = charge / pct(reps faites, RPE réel)
brute     = e1rmSerie × (remise du slot suivant / remise du slot de la série faite) × pct(reps suivantes, RPE suivant)
```
Dans le cas courant (même slot), le rapport des remises vaut 1. Puis plafonds (R7), puis arrondi.

### R3 — |écart| ≤ 0,5 : zone morte

Séries suivantes inchangées. Seuil : heuristique de coach à valider (erreur moyenne de notation d'environ 1 rep, Halperin 2022, ce qui rend un demi-point non significatif).

### R4 — écart ≤ −1 (trop facile) ou +1 ≤ écart < +2 (trop dur)

Recalcul R2 pour toutes les séries restantes de l'exercice. Ordre de grandeur dérivé de la table : un point de RPE ≈ 3 % de charge à n ≤ 7, ≈ 3,5 à 4 % à n ≈ 10.

### R5 — Série dure : écart ≥ +2, ou RPE 10 alors que prescrit ≤ 9, ou reps manquées

1. Drapeau `SERIE_DURE`.
2. RPE prescrit de toutes les séries restantes de l'exercice : −1 (minimum 6).
3. Recalcul R2 avec ce nouveau RPE.
4. Si la série suivante de l'exercice est elle aussi une série dure → `ARRET_EXERCICE` : séries restantes annulées.

### R6 — Échec total (0 rep)

Série suivante = 0,90 × charge tentée, arrondie, RPE prescrit −1. Compte comme série dure (R5, point 4). Heuristique de coach à valider.

### R7 — Bornes de sécurité en séance

| Borne | Valeur | Statut |
| --- | --- | --- |
| Hausse maximale par série | brute ≤ 1,05 × prévue | heuristique à valider |
| Hausse refusée si e1rmSerie > 1,10 × ref | pas de hausse (garde-fou `A_CONFIRMER` de `e1rm.md`) | heuristique à valider |
| Hausse en deload | interdite ; plafonds deload toujours prioritaires | règle `deload.md` |
| Hausse pour un débutant | interdite en séance (seulement à la séance suivante) | heuristique à valider, Zourdos 2016 |
| Baisse | non plafonnée ; un e1rmSerie hors garde-fou est utilisé pour baisser | choix prudent |
| RPE prescrit | jamais > 9,5 hors séance `test_1rm` | heuristique à valider |

### R8 — Séance suivante

La séance suivante est prescrite depuis la référence mise à jour (`e1rm.md`, R4 à R6 : série de référence, garde-fou ±10 %, lissage α = 0,5). Effet attendu sur un top set à n ≈ 7 : écart +1 → environ −1,5 % ; écart +2 → environ −3 % ; écart −1 → environ +1,5 %. Pas de règle supplémentaire.

### R9 — Signal pour le deload

Chaque `SERIE_DURE` et chaque `ARRET_EXERCICE` est historisé : ce sont les signaux de fatigue utilisés par `deload.md`.

## Limites et contre-indications

- L'utilisateur sous-estime en moyenne ses reps en réserve d'environ 1 rep (Halperin 2022) : il annonce souvent un RPE plus haut que la réalité. L'effet va dans le sens prudent (charges un peu plus légères).
- Le moteur ne distingue pas une série dure par fatigue d'une série dure par douleur : seule la déclaration de douleur déclenche `DOULEUR`. La conversation doit poser la question en cas de `ARRET_EXERCICE`.

## Exemple (réutilisable comme test)

Squat, ref 150, 3 séries prévues 5 @ 8 à 125 kg, barre 20 / incrément 2,5, intermédiaire, phase normale.

| Série 1 loguée | Règle | Calcul | Séries 2–3 |
| --- | --- | --- | --- |
| 125 × 5 @ 8,5 | R3 | — | 125 |
| 125 × 5 @ 9 | R4 | 125 / 0,857143 = 145,833 ; × 0,833333 = 121,53 | 122,5 |
| 125 × 5 @ 7 | R4 + R7 | 125 / 0,805556 = 155,172 ; × 0,833333 = 129,31 ≤ 131,25 | 130 |
| 125 × 5 @ 10 | R5 | 125 / 0,882353 = 141,667 ; 5 @ 7 : × 0,805556 = 114,12 | 115, RPE 7 |
| 125 × 3, RPE absent | R1 + R5 | RPE := 10 ; 125 / 0,9375 = 133,33 ; 5 @ 7 : 107,41 | 107,5, RPE 7 |
| 125 × 0 | R6 | 0,90 × 125 = 112,5 | 112,5, RPE 7 |
| 125 × 5 @ 7, débutant | R7 | hausse interdite | 125 |

Suite du cas « @ 10 » : série 2 loguée 115 × 5 @ 9 (prescrit 7, écart +2) → série dure consécutive → `ARRET_EXERCICE`, série 3 annulée.
