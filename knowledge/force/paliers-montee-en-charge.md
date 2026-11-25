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

Avant la première série lourde d'un mouvement, on monte progressivement : barre vide, puis des paliers de plus en plus lourds avec de moins en moins de reps, sans jamais atteindre la charge de travail. Un échauffement spécifique associé à un échauffement général améliore la performance maximale par rapport à l'échauffement spécifique seul (Abad 2011) : les paliers viennent après le bloc d'échauffement général du skill `seance-complete`, jamais à sa place. Les paliers sont exprimés en % de la **charge de travail du jour** (pas du 1RM) : convention commune avec `expert-sante-physique`. Leur nombre dépend de l'intensité relative du jour (I), jamais du nombre de reps : plus la série de travail est proche du maximum, plus il y a de paliers. Les valeurs ci-dessous sont des heuristiques de coach ; échelles, repos et règle courte musculation sont validés par Pierrot le 25/11/2026, sauf mention contraire.

## Règles pour aiiron

### R1 — Entrées

- `charge_travail` : charge **arrondie** de la première série de travail de l'exercice (top set ou première série), sortie de `chargeCible`.
- `e1rm` : e1RM effectif du slot (`variantes-discounts.md`), ou `null` s'il est inconnu (séance d'étalonnage, exercice jamais logué).
- `reps`, `rpe` : prescription de la première série de travail (`rpe` peut être absent).
- `type_seance` : `force`, `musculation` ou `hyrox_crossfit`.
- `materiel` (`arrondi-charges.md`).
- `premier_du_schema` : vrai si aucun exercice précédent de la séance ayant le même schéma moteur (`squat`, `charniere`, `poussee_horizontale`, `poussee_verticale`, `tirage`) n'a eu ses paliers (R5, « Mouvement déjà chauffé »). Le schéma est un champ du catalogue d'exercices, à fournir par `developpeur`. Exercice sans schéma : voir R5.

### R2 — Choix de l'échelle (règle commune avec `expert-sante-physique`)

Pour tout exercice chargé :

1. **Intensité du jour.** I = charge de travail / e1RM effectif. Si l'e1RM est inconnu, I = pct(reps prescrites, RPE prescrit) de la table RPE (`table-rpe.md`).
2. **I ≥ 0,80 → paliers complets**, quel que soit le type de séance (force, musculation, Hyrox/CrossFit) et quel que soit le nombre de reps : échelle « Lourd » si 0,80 ≤ I < 0,90, échelle « Très lourd » si I ≥ 0,90.
3. **I < 0,80** → mouvement principal d'une séance de force : échelle « Léger » (I < 0,70) ou « Modéré » (0,70 ≤ I < 0,80) ; musculation : règle courte M2 ; Hyrox/CrossFit : répétition des mouvements ECH-H4 (`knowledge/echauffement/echauffement-hyrox-crossfit.md`).
4. **I indéterminable** (ni e1RM ni RPE prescrit) : séance de force → échelle « Lourd » ; musculation → règle courte M2 ; Hyrox/CrossFit → ECH-H4. Choix de conception validé par Pierrot le 25/11/2026.
5. Aucun critère en nombre de reps.

Seuil 0,80 et règle commune : validés par Pierrot le 25/11/2026. Exercice d'assistance d'une séance de force à I < 0,80 : non couvert par le point 3 ; échelles « Léger » / « Modéré » comme le mouvement principal (comportement actuel du moteur), validé par Pierrot le 25/11/2026.

| Échelle | Condition | Paliers (% de la charge de travail × reps) |
| --- | --- | --- |
| Léger | I < 0,70 (force) | barre × 10 · 50 % × 5 · 75 % × 3 |
| Modéré | 0,70 ≤ I < 0,80 (force) | barre × 10 · 45 % × 5 · 65 % × 3 · 85 % × 2 |
| Lourd | 0,80 ≤ I < 0,90 (tout type de séance) ; I indéterminable en force | barre × 10 · 40 % × 5 · 60 % × 3 · 75 % × 2 · 85 % × 1 |
| Très lourd | I ≥ 0,90 (tout type de séance) | barre × 10 · 40 % × 5 · 60 % × 3 · 75 % × 2 · 85 % × 1 · 92 % × 1 |

Repères sans e1RM (table RPE) : 5 reps franchissent le seuil à partir de RPE 7,5 (80,6 %) ; 5 @ 7 = 79,2 % reste sous le seuil ; 10 reps ne l'atteignent jamais par la table (10 @ 10 = 73,6 %), seulement avec un e1RM connu.

Invariants vérifiés par les tests : barre vide en premier (exercices à la barre, premier du schéma) ; reps non croissantes ; % strictement croissants ; dernier palier < charge de travail.

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

Le repos avant la série de travail suit l'ordre de grandeur de 3 à 5 min entre séries lourdes (de Salles 2009), raccourci ici parce que le dernier palier est léger en reps. Valeurs : heuristiques, validées par Pierrot le 25/11/2026.

### R5 — Cas particuliers

- **Haltères, kettlebells, machines** : pas de palier « barre vide » ; même échelle, mêmes filtres (sans l'étape 2).
- **Soulevé de terre et variantes depuis le sol** : le palier barre vide se fait en soulevé de terre roumain depuis la position debout (la barre sans disques est trop basse). Validé par Pierrot le 25/11/2026.
- **Mouvement déjà chauffé** (règle unique, identique en force, musculation et Hyrox/CrossFit ; validée par Pierrot le 25/11/2026) : si le même mouvement (même `schema` : `squat`, `charniere`, `poussee_horizontale`, `poussee_verticale`, `tirage`) a déjà eu ses paliers dans la séance (`premier_du_schema` faux), la montée commence à 60 % : seuls les paliers ≥ 60 % de l'échelle choisie par I sont gardés, sans barre vide. Sinon (`premier_du_schema` vrai), paliers complets. Le groupe musculaire n'intervient pas dans ce choix. Exemples : pause squat après squat, presse à cuisses (schéma `squat`) après squat → départ à 60 % ; rowing (`tirage`) après développé couché (`poussee_horizontale`) → paliers complets. Écart volontaire à la convention « barre vide en premier palier », qui vaut pour le premier mouvement du schéma.
  - « A eu ses paliers » = a reçu une échelle de R2 (« Léger », « Modéré », « Lourd » ou « Très lourd »), complète ou à partir de 60 %. Les séries d'approche courtes M2 et la répétition ECH-H4 ne comptent pas : un exercice à I ≥ 0,80 placé après un exercice du même schéma qui n'a eu que M2 a ses paliers complets. Validé par Pierrot le 25/11/2026.
  - **Exercice à I ≥ 0,80 sans `schema`** (ex. curl lourd, extension triceps lourde) : le mouvement est l'exercice lui-même (même identifiant). Paliers complets la première fois dans la séance (sans palier barre si haltères, machine ou kettlebell), départ à 60 % si le même exercice a déjà eu ses paliers dans la séance. Jamais 0 série d'approche au-dessus du seuil, même si le groupe musculaire est déjà préparé. Validé par Pierrot le 25/11/2026.
- **Séries suivantes** du même exercice : pas de paliers ; si une série est ajustée à la hausse en séance (`ajustement-rpe.md`), pas de palier supplémentaire.
- **Deload** : même règle, calculée sur la charge de deload.
- **Douleur pendant les paliers** : on n'enchaîne pas sur la séance prévue (skill `seance-complete`) ; le moteur émet `DOULEUR` pour l'exercice.
- **Musculation** : R2 s'applique (I ≥ 0,80 → échelle « Lourd » ou « Très lourd », départ selon « Mouvement déjà chauffé » ci-dessus) ; sous le seuil ou si I est indéterminable, règle courte de la section [Musculation](#musculation).
- **Alignement Hyrox/CrossFit** : ECH-H5 de `knowledge/echauffement/echauffement-hyrox-crossfit.md` applique la même règle R2 : I ≥ 0,80 → paliers de cette fiche pour ce mouvement, règle « Mouvement déjà chauffé » comprise (paliers complets pour le premier mouvement chargé du schéma à I ≥ 0,80, départ à 60 % pour les suivants du même schéma ; validé par Pierrot le 25/11/2026) ; I < 0,80 ou indéterminable → ECH-H4, qui ne compte pas comme « a eu ses paliers ». Le départ à 60 % n'est pas un raccourci de version courte : en version courte, les paliers restent ceux de la version standard. Plus aucun critère en nombre de reps (l'ancien « série ≤ 5 reps » est supprimé des deux côtés). Cas chiffré : `cas-de-test.md`, T17 bis.

### R6 — Durée estimée (pour tenir dans le créneau)

`durée_s = Σ reps × 4 s + Σ repos`. Heuristique validée par Pierrot le 25/11/2026.

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

Séries d'approche des séances de musculation (référencée par ECH-M4 de `knowledge/echauffement/echauffement-musculation.md`, `ref: "force-paliers-montee-en-charge#musculation"`). Principe du skill `seance-complete` : 1 à 2 séries d'approche légères sur le premier exercice de chaque groupe musculaire, aucune sur les suivants. Valeurs de cette section : heuristiques de coach, validées par Pierrot le 25/11/2026 (ligne « 1 à 6 reps » de M2 comprise).

Sources de cette section (à reporter dans l'en-tête `sources:` de la fiche) :
- **Échauffement spécifique limité au premier exercice de chaque groupe musculaire** (M1) : recommandation de la revue narrative Iversen VM, Norum M, Schoenfeld BJ, Fimland MS, « No Time to Lift? Designing Time-Efficient Training Programs for Strength and Hypertrophy: A Narrative Review », Sports Medicine 51(10):2079-2095, 2021, https://doi.org/10.1007/s40279-021-01490-1 (conclusion : échauffement spécifique réservé au premier exercice de chaque groupe ; utile surtout au-dessus de 80 % du 1RM). Niveau E (avis d'experts appuyé sur des études aiguës). Le nombre « 0 sur les suivants » est notre lecture de cette recommandation, pas un résultat d'essai.
- **1 à 2 séries suffisent sous le seuil** (M1, M2) : Ribeiro AS, Romanzini M, Schoenfeld BJ, Souza MF, Avelar A, Cyrino ES, « Effect of different warm-up procedures on the performance of resistance training exercises », Perceptual and Motor Skills 119(1):133-145, 2014, https://doi.org/10.2466/25.29.pms.119c17z7 (4 séries à l'échec à 80 % du 1RM : aucune différence de reps totales entre sans échauffement, échauffement spécifique, général ou combiné) ; Enes A, Mohan AE, Piñero A, Hermann T, Sapuppo M, Coleman M, Androulakis Korakakis P, Wolf M, Souza-Junior TP, Swinton PA, Schoenfeld BJ, « Warming up to improved performance? Effects of different specific warm-up protocols on neuromuscular performance in trained individuals », Sports Medicine and Health Science, 2025 (vol. 8(6):691-697, 2026), https://doi.org/10.1016/j.smhs.2025.08.002 (0, 1 série à 75 % ou 2 séries à 55 % puis 75 % de la charge 10RM, 3 à 4 reps, avant 4 séries à l'échec : peu ou pas de différence de reps). Niveau C : études aiguës, petits effectifs, performance mesurée, pas l'hypertrophie.
- **Valeurs M2, ligne « 1 à 6 » (50 % × 5 · 75 % × 3)** : structure (deux séries en % de la charge de travail, la seconde vers 75-80 %, peu de reps) cohérente avec les protocoles testés : Ribeiro B, Pereira A, Neves PP, Sousa AC, Ferraz R, Marques MC, Marinho DA, Neiva HP, « The Role of Specific Warm-up during Bench Press and Squat Exercises: A Novel Approach », Int J Environ Res Public Health 17(18):6882, 2020, https://doi.org/10.3390/ijerph17186882 (deux séries à 40 % puis 80 % de la charge d'entraînement avant 3 × 6 à 80 % du 1RM ; un échauffement seulement léger ne suffit pas) ; Enes 2025 ci-dessus (55 % puis 75 %). Les valeurs exactes 50 / 75 % et 5 / 3 reps ne viennent d'aucune étude : heuristique de coach. Niveau C pour la structure, E pour les chiffres.
- Nuance : Viveiros L, Gioia K, Nasser I, Acetto V, Farias D, Willardson JM, Miranda H, « High-load and low-volume warm-up increases performance in a resistance training session », Journal of Bodywork and Movement Therapies 40:1487-1491, 2024, https://doi.org/10.1016/j.jbmt.2024.08.004 : une série à 80 % de la charge 10RM × 5 donne plus de volume total qu'à 40 % × 15 ou 60 % × 10, et les auteurs conseillent un échauffement à 80 % pour chaque exercice (ici, trois exercices de groupes différents). Ne contredit pas la règle des groupes ; suggère que la dernière série d'approche gagne à être assez lourde.

### M1 — Quelle règle s'applique

I est calculé comme en R2 (point 1).

| Exercice | Règle |
| --- | --- |
| I ≥ 0,80, quel que soit le nombre de reps, exercice à la barre | échelle R2 (« Lourd » ou « Très lourd ») ; paliers complets avec barre vide si le schéma n'a pas encore eu ses paliers dans la séance, sinon départ à 60 % sans barre vide (R5, « Mouvement déjà chauffé ») |
| I ≥ 0,80, quel que soit le nombre de reps, haltères / machine / kettlebell | idem, sans palier barre (R5) |
| I ≥ 0,80, exercice sans `schema` | R5, « Exercice à I ≥ 0,80 sans `schema` » (validé par Pierrot le 25/11/2026) |
| I < 0,80 ou indéterminable, premier exercice de son groupe dans la séance | règle courte M2 |
| I < 0,80 ou indéterminable, exercice suivant du même groupe dans la séance | 0 série d'approche |
| Exercice au poids du corps sans charge | 0 série d'approche calculée par le moteur |

« Groupe » = premier muscle principal de l'exercice dans `knowledge/hypertrophie/mapping-muscles.json` (`groupe_series_approche` : `principaux[0]`, identifiant snake_case exact, jamais par sous-chaîne). Le drapeau `premier_exercice_du_groupe` est calculé dans l'ordre de la séance.

### M2 — Règle courte (en % de la charge de travail du jour)

| Reps prescrites | Séries d'approche (% × reps) | Repos après chaque série |
| --- | --- | --- |
| 1 à 6 (seulement si I < 0,80) | 50 % × 5 · 75 % × 3 | 60 s puis 90 s |
| 7 à 12 | 50 % × 8 · 75 % × 4 | 60 s puis 90 s |
| 13 et plus | 60 % × 8 | 90 s |

La charge de travail est celle de la première série de travail, déjà arrondie. Le choix entre R2 et M2 dépend de I (M1) ; le contenu de M2 ne dépend que des reps prescrites. Ligne « 1 à 6 » : heuristique validée par Pierrot le 25/11/2026 (deux séries, comme pour 7 à 12, avec moins de reps pour ne pas fatiguer avant des séries courtes). Structure cohérente avec Ribeiro 2020 et Enes 2025, chiffres exacts sans source (voir « Sources de cette section »).

### M3 — Calcul et filtrage

1. `brute = pct × charge_travail`, puis `arrondirCharge` (même fonction que les séries de travail ; une cible sous le minimum du matériel donne le minimum, la barre vide par exemple).
2. Supprimer la série si sa charge arrondie ≥ `charge_travail`.
3. Supprimer la série si sa charge arrondie ≤ celle de la série d'approche gardée juste avant.
4. Reps non croissantes, jamais de série d'approche ≥ charge de travail (mêmes invariants que R2).

### M4 — Exemples chiffrés

- **Presse à cuisses 10 reps à 140 kg** (pile 5 à 300 kg, pas 5), premier exercice `quadriceps`, ni e1RM ni RPE prescrit (I indéterminable) : 70 × 8 (60 s) · 105 × 4 (90 s) · puis 140 × 10.
- **Curl haltères 12 reps à 12 kg** (haltères de 2 à 40 kg, pas 2), premier exercice `biceps`, I indéterminable : 6 × 8 (60 s) · 8 × 4 (75 % = 9 : égalité entre 8 et 10, donc vers le bas) (90 s) · puis 12 × 12.
- **Leg curl 15 reps à 40 kg** (pile pas 5), premier exercice `ischio_jambiers`, I indéterminable : 60 % = 24 → 20 (25 dépasserait la cible de 4,2 %) → 20 × 8 (90 s).
- **Fentes après la presse** (même groupe `quadriceps`, I indéterminable) : 0 série d'approche.
- **Rowing barre 6 reps à 80 kg, e1RM 100** : I = 0,80, donc échelle complète R2 (« Lourd »).
- **Rowing barre 10 reps à 80 kg, e1RM 100** : I = 0,80, donc échelle complète R2 (« Lourd ») malgré les 10 reps, mêmes paliers que ci-dessus.
- **Rowing barre 5 reps à 70 kg, e1RM 100**, premier exercice de son groupe : I = 0,70 < 0,80, donc règle courte ligne « 1 à 6 » : 35 × 5 (60 s) · 52,5 × 3 (90 s) · puis 70 × 5.
- **Presse à cuisses 8 reps à 200 kg, e1RM 240, après un squat lourd** (pile 5 à 300, pas 5) : I = 0,833 → « Lourd » ; schéma `squat` déjà chauffé → départ à 60 % : 120 × 3 (60 s) · 150 × 2 (90 s) · 170 × 1 (180 s). Ni 0 série d'approche (règle des groupes), ni paliers complets.
- **Rowing barre 6 reps à 80 kg, e1RM 100, après un développé couché lourd** : schéma `tirage` pas encore chauffé → paliers complets « Lourd » avec barre vide, comme s'il était seul.

## Limites et contre-indications

- Les % et nombres de paliers ne sont pas tirés d'un essai contrôlé : ce sont des usages de coach (validés par Pierrot le 25/11/2026), alignés avec `expert-sante-physique`.
- La mobilité et l'activation spécifiques (avant les paliers) relèvent d'`expert-sante-physique`.
- Une série de 10 reps à I ≥ 0,80 n'est possible que si l'e1RM est sous-estimé (la table donne au plus 73,6 % pour 10 reps) : la règle s'applique quand même, et l'autorégulation corrige l'e1RM.

## Exemples (réutilisables comme tests)

Barre 20 kg, incrément 2,5, séance de force, sauf mention.

**A. Squat, charge de travail 140 kg (5 reps), e1RM 168** (entrées directes de `paliers`) — I = 0,833 → lourd.
| Palier | Brute | Charge | Reps | Repos |
| --- | --- | --- | --- | --- |
| barre | — | 20 | 10 | 30 s |
| 40 % | 56 | 55 | 5 | 60 s |
| 60 % | 84 | 85 | 3 | 60 s |
| 75 % | 105 | 105 | 2 | 90 s |
| 85 % | 119 | 120 | 1 | 180 s |
Durée : 21 reps × 4 + 420 = 504 s.

**B. Couché 1 @ 9,5, e1RM 100** → n = 2, 96,774 → 97,5 kg ; I = 0,975 → très lourd.
barre × 10 · 37,5 × 5 (39 : 40 serait +2,56 %, donc vers le bas) · 57,5 × 3 · 72,5 × 2 · 82,5 × 1 · 90 × 1 (89,7). Repos : 30, 60, 60, 90, 90, 180 s.

**C. OHP 8 @ 7, e1RM 60** → n = 11,5, 60 × 0,708333 = 42,5 kg (exact) ; I = 0,708 → modéré.
barre × 10 · (45 % = 19,125 → 20 → supprimé, doublon de la barre) · 27,5 × 3 · 35 × 2. Repos : 30, 60, 120 s.

**D. 10 @ 6, e1RM 40** → n = 14,5, 40 × 0,625 = 25 kg (exact) ; I = 0,625 → léger.
50 % → 12,5 → 20 → supprimé ; 75 % → 18,75 → 20 → supprimé. Sortie : barre × 10 seulement.

**E. Charge de travail = 20 kg (barre)** → aucun palier.

**F. Développé couché haltères, 30 kg par haltère, e1RM 36, haltères de 2 à 40 kg par pas de 2** — I = 0,833 → lourd, pas de barre.
12 × 5 · 18 × 3 · 22 × 2 (22,5) · 26 × 1 (25,5 : 26 = +1,96 %).

**G. Pause squat après squat, 110 kg, e1RM 132,583** — I = 0,830 → lourd, schéma `squat` déjà chauffé → départ à 60 %.
65 × 3 (66) · 82,5 × 2 · 92,5 × 1 (93,5). Pas de barre vide.

**H. Séance de force, e1RM inconnu, 5 @ 8 prescrit** → I = pct(5, 8) = 0,819 → lourd. **Séance de force, ni e1RM ni RPE** → lourd (I indéterminable).
