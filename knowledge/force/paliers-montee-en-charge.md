---
id: force-paliers-montee-en-charge
domaine: force
titre: Paliers de montée en charge avant les séries lourdes
niveau_preuve: E
sources:
  - titre: "Combination of General and Specific Warm-Ups Improves Leg-Press One Repetition Maximum Compared With Specific Warm-Up in Trained Individuals (JSCR 25(8):2242-2245)"
    auteurs: "Abad CC, Prado ML, Ugrinowitsch C, Tricoli V, Barroso R"
    annee: 2011
    url: "https://pubmed.ncbi.nlm.nih.gov/21544000/"
  - titre: "Rest Interval between Sets in Strength Training (Sports Med 39(9):765-777)"
    auteurs: "de Salles BF, Simão R, Miranda F, Novaes JS, Lemos A, Willardson JM"
    annee: 2009
    url: "https://pubmed.ncbi.nlm.nih.gov/19691365/"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Paliers de montée en charge

## Principe

Avant la première série lourde d'un mouvement, on monte progressivement : barre vide, puis des paliers de plus en plus lourds avec de moins en moins de reps, sans jamais atteindre la charge de travail. Un échauffement spécifique associé à un échauffement général améliore la performance maximale par rapport à l'échauffement spécifique seul (Abad 2011) : les paliers viennent après le bloc d'échauffement général du skill `seance-complete`, jamais à sa place. Les paliers sont exprimés en % de la **charge de travail du jour** (pas du 1RM) : convention commune avec `expert-sante-physique`. Leur nombre dépend de l'intensité du jour : plus la série de travail est proche du maximum, plus il y a de paliers. Les valeurs ci-dessous sont des heuristiques de coach à valider ; elles partent du défaut du skill `seance-complete`.

## Règles pour aiiron

### R1 — Entrées

- `charge_travail` : charge **arrondie** de la première série de travail de l'exercice (top set ou première série), sortie de `chargeCible`.
- `e1rm` : e1RM effectif du slot (`variantes-discounts.md`), ou `null` en séance d'étalonnage.
- `materiel` (`arrondi-charges.md`).
- `premier_du_schema` : vrai si c'est le premier exercice de la séance pour ce schéma moteur (`squat`, `charniere`, `poussee_horizontale`, `poussee_verticale`, `tirage`). Le schéma est un champ du catalogue d'exercices, à fournir par `developpeur`.

### R2 — Choix de l'échelle selon l'intensité du jour

`I = charge_travail / e1rm` (si `e1rm` est `null` : échelle « lourd »).

| Échelle | Condition | Paliers (% de la charge de travail × reps) |
| --- | --- | --- |
| Léger | I < 0,70 | barre × 10 · 50 % × 5 · 75 % × 3 |
| Modéré | 0,70 ≤ I < 0,80 | barre × 10 · 45 % × 5 · 65 % × 3 · 85 % × 2 |
| Lourd | 0,80 ≤ I < 0,90 | barre × 10 · 40 % × 5 · 60 % × 3 · 75 % × 2 · 85 % × 1 |
| Très lourd | I ≥ 0,90 | barre × 10 · 40 % × 5 · 60 % × 3 · 75 % × 2 · 85 % × 1 · 92 % × 1 |

Invariants vérifiés par les tests : barre vide en premier (exercices à la barre) ; reps non croissantes ; % strictement croissants ; dernier palier < charge de travail.

### R3 — Calcul et filtrage (ordre normatif)

1. Pour chaque palier en % : `brute = pct × charge_travail`, puis `arrondirCharge(brute, materiel)` (même fonction que les séries de travail).
2. Supprimer le palier si sa charge arrondie ≤ poids de la barre (doublon de la barre vide).
3. Supprimer le palier si sa charge arrondie ≥ `charge_travail`.
4. Supprimer le palier si sa charge arrondie ≤ celle du palier gardé précédent (on garde la première occurrence).
5. Palier barre vide : présent seulement si `charge_travail` > poids de la barre. Si `charge_travail` = barre : aucun palier.

### R4 — Repos après chaque palier

| Après | Repos |
| --- | --- |
| barre vide | 30 s (le temps de charger) |
| palier < 70 % | 60 s |
| palier ≥ 70 % | 90 s |
| dernier palier, avant la 1re série de travail | 180 s si I ≥ 0,80, sinon 120 s |

Le repos avant la série de travail suit l'ordre de grandeur de 3 à 5 min entre séries lourdes (de Salles 2009), raccourci ici parce que le dernier palier est léger en reps. Valeurs : heuristiques à valider.

### R5 — Cas particuliers

- **Haltères, kettlebells, machines** : pas de palier « barre vide » ; même échelle, mêmes filtres (sans l'étape 2).
- **Soulevé de terre et variantes depuis le sol** : le palier barre vide se fait en soulevé de terre roumain depuis la position debout (la barre sans disques est trop basse). Choix à valider avec `expert-sante-physique`.
- **Deuxième exercice du même schéma dans la séance** (`premier_du_schema` faux, ex. pause squat après squat) : seuls les paliers ≥ 60 % de l'échelle sont gardés, pas de barre vide. Écart volontaire à la convention « barre vide en premier palier », qui vaut pour le premier mouvement du schéma ; à valider.
- **Séries suivantes** du même exercice : pas de paliers ; si une série est ajustée à la hausse en séance (`ajustement-rpe.md`), pas de palier supplémentaire.
- **Deload** : même règle, calculée sur la charge de deload.
- **Douleur pendant les paliers** : on n'enchaîne pas sur la séance prévue (skill `seance-complete`) ; le moteur émet `DOULEUR` pour l'exercice.
- **Musculation (séries de plus de 6 reps)** : règle courte de la section [Musculation](#musculation), pas cette échelle.
- **Alignement Hyrox/CrossFit** : le seuil ECH-H5 de `knowledge/echauffement/echauffement-hyrox-crossfit.md` (charge ≥ 80 % du 1RM estimé, ou série lourde ≤ 5 reps → paliers force) correspond à la frontière I ≥ 0,80 de l'échelle « Lourd » (R2) : même I = charge de travail / e1RM effectif. Les deux critères se recouvrent presque : 5 reps @ RPE 7 donnent déjà 80,6 % (`table-rpe.md`). Sous ce seuil, en Hyrox/CrossFit, c'est ECH-H4 qui s'applique et non les échelles « Léger » ou « Modéré ». Heuristique à valider.

### R6 — Durée estimée (pour tenir dans le créneau)

`durée_s = Σ reps × 4 s + Σ repos`. Heuristique à valider.

### R7 — Sortie

```json
{
  "type": "preparation_specifique",
  "items": [
    { "exercice": "squat", "palier": 0, "charge_kg": 20, "reps": 10, "pct_travail": null, "repos_s": 30 },
    { "exercice": "squat", "palier": 1, "charge_kg": 55, "reps": 5, "pct_travail": 0.40, "repos_s": 60 }
  ]
}
```

## Musculation

Séries d'approche des séances de musculation (référencée par ECH-M4 de `knowledge/echauffement/echauffement-musculation.md`, `ref: "force-paliers-montee-en-charge#musculation"`). Principe du skill `seance-complete` : 1 à 2 séries d'approche légères sur le premier exercice de chaque groupe musculaire, aucune sur les suivants. Toutes les valeurs de cette section sont des **heuristiques de coach à valider**.

### M1 — Quelle règle s'applique

| Exercice | Règle |
| --- | --- |
| Reps prescrites ≤ 6, exercice à la barre | échelle complète R2 à R5 (barre vide comprise) |
| Reps prescrites ≤ 6, haltères / machine / kettlebell | échelle R2, sans palier barre (R5) |
| Reps prescrites > 6, premier exercice de son groupe dans la séance | règle courte M2 |
| Exercice suivant du même groupe dans la séance | 0 série d'approche |
| Exercice au poids du corps sans charge | 0 série d'approche calculée par le moteur |

« Groupe » = muscle cible principal de l'exercice, selon `knowledge/hypertrophie/mapping-muscles.json` (identifiant exact, jamais par sous-chaîne). Le drapeau `premier_exercice_du_groupe` est calculé dans l'ordre de la séance.

### M2 — Règle courte (en % de la charge de travail du jour)

| Reps prescrites | Séries d'approche (% × reps) | Repos après chaque série |
| --- | --- | --- |
| 7 à 12 | 50 % × 8 · 75 % × 4 | 60 s puis 90 s |
| 13 et plus | 60 % × 8 | 90 s |

La charge de travail est celle de la première série de travail, déjà arrondie. Pas besoin d'e1RM : la règle ne dépend que des reps.

### M3 — Calcul et filtrage

1. `brute = pct × charge_travail`, puis `arrondirCharge` (même fonction que les séries de travail ; une cible sous le minimum du matériel donne le minimum, la barre vide par exemple).
2. Supprimer la série si sa charge arrondie ≥ `charge_travail`.
3. Supprimer la série si sa charge arrondie ≤ celle de la série d'approche gardée juste avant.
4. Reps non croissantes, jamais de série d'approche ≥ charge de travail (mêmes invariants que R2).

### M4 — Exemples chiffrés

- **Presse à cuisses 10 reps à 140 kg** (pile 5 à 300 kg, pas 5), premier exercice quadriceps : 70 × 8 (60 s) · 105 × 4 (90 s) · puis 140 × 10.
- **Curl haltères 12 reps à 12 kg** (haltères de 2 à 40 kg, pas 2), premier exercice biceps : 6 × 8 (60 s) · 8 × 4 (75 % = 9 : égalité entre 8 et 10, donc vers le bas) (90 s) · puis 12 × 12.
- **Leg curl 15 reps à 40 kg** (pile pas 5), premier exercice ischio-jambiers : 60 % = 24 → 20 (25 dépasserait la cible de 4,2 %) → 20 × 8 (90 s).
- **Fentes après la presse** (même groupe quadriceps) : 0 série d'approche.
- **Rowing barre 6 reps** : ≤ 6 reps à la barre, donc échelle complète R2.

## Limites et contre-indications

- Les % et nombres de paliers ne sont pas tirés d'un essai contrôlé : ce sont des usages de coach, à confirmer avec `expert-sante-physique`.
- La mobilité et l'activation spécifiques (avant les paliers) relèvent d'`expert-sante-physique`.

## Exemples (réutilisables comme tests)

Barre 20 kg, incrément 2,5, sauf mention.

**A. Squat 140 × 5 @ 8, e1RM 168** — I = 0,833 → lourd.
| Palier | Brute | Charge | Reps | Repos |
| --- | --- | --- | --- | --- |
| barre | — | 20 | 10 | 30 s |
| 40 % | 56 | 55 | 5 | 60 s |
| 60 % | 84 | 85 | 3 | 60 s |
| 75 % | 105 | 105 | 2 | 90 s |
| 85 % | 119 | 120 | 1 | 180 s |
Durée : 21 reps × 4 + 420 = 504 s.

**B. Couché 1 @ 9, e1RM 100** → 96,774 → 97,5 kg ; I = 0,975 → très lourd.
barre × 10 · 37,5 × 5 (39 : 40 serait +2,56 %, donc vers le bas) · 57,5 × 3 · 72,5 × 2 · 82,5 × 1 · 90 × 1 (89,7). Repos : 30, 60, 60, 90, 90, 180 s.

**C. OHP 8 @ 7, e1RM 60** → 43,333 → 42,5 kg ; I = 0,708 → modéré.
barre × 10 · (45 % = 19,125 → 20 → supprimé, doublon de la barre) · 27,5 × 3 · 35 × 2. Repos : 30, 60, 120 s.

**D. 10 @ 6, e1RM 40** → 25,556 → 25 kg ; I = 0,625 → léger.
50 % → 12,5 → 20 → supprimé ; 75 % → 18,75 → 20 → supprimé. Sortie : barre × 10 seulement.

**E. Charge de travail = 20 kg (barre)** → aucun palier.

**F. Développé couché haltères, 30 kg par haltère, e1RM 36, haltères de 2 à 40 kg par pas de 2** — I = 0,833 → lourd, pas de barre.
12 × 5 · 18 × 3 · 22 × 2 (22,5) · 26 × 1 (25,5 : 26 = +1,96 %).

**G. Pause squat après squat, 110 kg, e1RM 133,125** — I = 0,826 → lourd, deuxième du schéma.
65 × 3 (66) · 82,5 × 2 · 92,5 × 1 (93,5). Pas de barre vide.
