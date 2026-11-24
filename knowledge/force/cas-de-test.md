---
id: force-cas-de-test
domaine: force
titre: Cas de test du moteur force (erreurs des Excel de Pierrot + cas limites)
niveau_preuve: E
sources:
  - titre: "Audit des Excel de Pierrot (aiiron-sources-muscu.md, projet Claude aiiron) ; résumé dans docs/contexte.md"
    auteurs: "Pierrot, Claude"
    annee: 2026
    url: ""
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Cas de test du moteur force

## Principe

Chaque erreur trouvée dans les Excel de Pierrot devient un test : l'entrée reproduit la situation, la sortie attendue est chiffrée. Les entrées sont **reconstituées** à partir de la description des erreurs (les fichiers d'origine ne sont pas dans le repo) : elles reproduisent le mécanisme de l'erreur, pas le contenu exact des tableurs. Les tests T4 et T5 concernent aussi le moteur volume (`expert-hypertrophie`).

## Règles pour aiiron

- Conventions communes à tous les tests : kg ; barre 20 kg ; incrément 2,5 kg ; niveau intermédiaire ; phase normale ; remise de contexte 1 ; sauf mention contraire.
- Comparaison des % et e1RM à 1e-6 près ; comparaison des charges arrondies à l'égalité exacte (en grammes).
- Un test qui passe avec le comportement bugué décrit est un test mal écrit : chaque test ci-dessous donne aussi la sortie buguée pour vérifier qu'elle échoue.

## Erreurs des Excel de Pierrot

### T1 — Lvl1 : semaine « DELOAD » avec singles à RPE 9–10

Entrée : squat, e1RM 150. Semaine de référence (S3) : 1 × 1 @ 8 + 4 × 3 @ 8 (5 séries). Semaine S4 marquée `deload` : 1 × 1 @ 9, 1 × 1 @ 10, 3 × 3 @ 7.

`validerDeload(S4, S3)` attendu (refus) :

| Ligne | Violations |
| --- | --- |
| 1 × 1 @ 9 | `DELOAD_RPE_TROP_HAUT`, `DELOAD_SINGLE_LOURD`, `DELOAD_INTENSITE_TROP_HAUTE` (96,8 %) |
| 1 × 1 @ 10 | `DELOAD_RPE_TROP_HAUT`, `DELOAD_SINGLE_LOURD`, `DELOAD_INTENSITE_TROP_HAUTE` (100 %) |
| 3 × 3 @ 7 | `DELOAD_INTENSITE_TROP_HAUTE` (85,7 %) |
| exercice | `DELOAD_VOLUME_TROP_HAUT` (5 séries > ceil(5/2) = 3) |

`corrigerDeload(S4, S3)` attendu : **squat 3 × 3 à 120 kg** (150 × min(0,857143 ; 0,80) = 120), 2 singles supprimés, liste de changements non vide.

Propriété : toute semaine `deload` produite par le moteur a RPE max ≤ 7, charge max ≤ 0,80 × e1RM effectif, aucun single à RPE ≥ 8, aucun AMRAP.

Comportement bugué à faire échouer : semaine acceptée telle quelle.

### T2 — Lvl1/Lvl2 : % saisis à la main, incohérents avec les RPE ; RPE manquants

Entrée : squat, e1RM 140. Lignes du modèle (le % saisi = charge d'origine / 1RM d'origine, figé) :

| Ligne | Reps | RPE | % saisi | Sortie attendue | Drapeaux |
| --- | --- | --- | --- | --- | --- |
| L1 | 5 | 8 | 85 | 140 × 0,833333 = 116,667 → **117,5** | `INCOHERENCE_PCT_RPE` (RPE implicite 8,71, écart +0,71) |
| L2 | 5 | 7 | 87 | 140 × 0,805556 = 112,778 → **112,5** | `INCOHERENCE_PCT_RPE` (RPE implicite 9,52, écart +2,52) |
| L3 | 3 | absent | 85 | RPE implicite 6,706 → 6,5 ; 140 × 0,845070 = 118,31 → **117,5** | `RPE_DEDUIT_DU_PCT` |
| L4 | 5 | absent | 92 | **aucune charge** | `PCT_IMPOSSIBLE` (RPE implicite 11,39) |
| L5 | 4 | absent | absent | **aucune charge** | `PRESCRIPTION_INCOMPLETE` |
| L6 | 1 | 8 | 80 | 140 × 0,9375 = 131,25 → **130** (égalité → bas) | `INCOHERENCE_PCT_RPE` (RPE implicite 2,8) |

Puis e1RM 140 → 150, même modèle : L1 → 150 × 0,833333 = **125** (la charge suit l'e1RM ; le % saisi n'est jamais stocké comme prescription).

Comportement bugué à faire échouer : L1 = 140 × 0,85 = 119 → 120 ; L1 après passage à 150 = 120 (% figé et charge figée).

### T3 — Push/Pull : discount OHP annoncé −6 %, appliqué ≈ −2 % et pas partout

Entrée : OHP, ref 70. Slot « OHP après couché » avec `remise_contexte` 0,94 dans les séances A, B, C de chaque semaine, sur 4 semaines.

| Séance | Prescription | Brute (70 × 0,94 × pct) | Attendu | Bugué −2 % | Bugué sans discount |
| --- | --- | --- | --- | --- | --- |
| A | 5 @ 8 | 54,833 | **55** | 57,5 | 57,5 |
| B | 3 @ 8 | 58,059 | **57,5** | 60 | 62,5 |
| C | 8 @ 7 | 47,522 | **47,5** | 50 | 50 |

Paliers séance A (charge de travail 55, e1RM effectif 65,8, I = 0,836 → lourd) : barre × 10 · 22,5 × 5 · 32,5 × 3 · 40 × 2 · 47,5 × 1.

Assertions :
1. Pour chaque série et chaque palier généré dans le slot, sur les 4 semaines : `brute / (70 × pct)` = 0,94 à 1e-9 près (paliers : rapport à la charge de travail inchangé).
2. Après arrondi : |charge − brute| < 2,5 (un incrément) et charge − brute ≤ 0,025 × brute (règle d'arrondi, `arrondi-charges.md`, R3).
3. Une seule source du multiplicateur : modifier `remise_contexte` à 0,90 modifie toutes les séries du slot et aucune autre.
4. Retour : séance A faite 55 × 5 @ 8 → e1rmSerie 66,0 → e1rmJour = 66,0 / 0,94 = 70,213 → ref = **70,106**.

### T4 — Set counts « Semaine libre » : double comptage par sous-chaîne (moteur volume)

Entrée (reconstituée) : squat (`0043`) 3 séries, presse à cuisses 3 séries ; les deux exercices sont associés par clé à {`quadriceps`, `fessiers`}. Dans le tableur, chaque ligne contenait le libellé du muscle deux fois (colonne muscle principal + colonne liste des muscles), et le comptage cherchait le libellé comme sous-chaîne dans la ligne.

Attendu : **quadriceps 6, fessiers 6**. Bugué : 12 et 12.

Règle : `compte(m) = Σ séries(ex) × poids(ex, m)` sur l'ensemble **dédoublonné** des identifiants de muscles exacts de l'exercice. Le poids (1 pour un muscle principal, fraction pour un secondaire…) est une décision d'`expert-hypertrophie` ; ce test utilise poids 1 et vérifie seulement qu'aucun couple (exercice, muscle) n'est compté deux fois.

Cas réels de notre propre base `data/exercises/exercises.json`, à ajouter :
- `0025` (barbell bench press) : `groupe_musculaire` = "triceps" et `muscles_secondaires` contient aussi "triceps". Concaténer les champs compte triceps deux fois. Attendu : triceps compté une fois par série.
- Synonymes : `muscle_cible` = "quads" pour `2287`, "quadriceps" dans les secondaires de `0043`. Attendu : les deux normalisés vers le même identifiant (`quadriceps`) via `knowledge/hypertrophie/mapping-muscles.json`, un seul compteur.
- Faux positif de sous-chaîne (construit) : chercher "biceps" ne doit pas compter un muscle `biceps_femoral`. Attendu : correspondance exacte d'identifiant uniquement.

### T5 — Set counts « Workout » : colonne Muscles décalée d'une ligne (moteur volume)

Entrée : séance de 3 exercices. Mapping (hypothèse simplifiée en attendant `mapping-muscles.json`) : `0025` couché → {pectoraux, triceps, epaules} ; `0027` rowing barre → {dos_haut, biceps} ; `0043` squat → {quadriceps, fessiers}.

| Ordre | Exercice | Séries |
| --- | --- | --- |
| 1 | `0025` | 4 |
| 2 | `0027` | 3 |
| 3 | `0043` | 5 |

| Muscle | Attendu (jointure par clé) | Bugué (ligne i ← muscles de la ligne i−1) |
| --- | --- | --- |
| pectoraux | **4** | 3 |
| triceps | **4** | 3 |
| epaules | **4** | 3 |
| dos_haut | **3** | 5 |
| biceps | **3** | 5 |
| quadriceps | **5** | 0 |
| fessiers | **5** | 0 |

Assertions : mélanger l'ordre des lignes ne change aucun total ; un exercice sans mapping lève `EXERCICE_SANS_MAPPING` (jamais de reprise des muscles d'une ligne voisine).

## Cas supplémentaires

### T6 — Arrondi

| Matériel | Cible | Attendu |
| --- | --- | --- |
| barre 20 / 2,5 | 101,2 | 100 |
| barre 20 / 2,5 | 101,3 | 102,5 |
| barre 20 / 2,5 | 101,25 | 100 (égalité → bas) |
| barre 20 / 2,5 | 31,5 | 30 (+3,17 % refusé) |
| barre 20 / 2,5 | 15 | 20, `CIBLE_SOUS_MINIMUM` |
| barre 20 / 1 | 101,5 | 101 |
| barre 20 / 0,5 | 101,3 | 101,5 |
| haltères 10 à 30 pas 2 | 23,2 | 22 |
| kettlebells 8 à 32 pas 4 | 19 | 16, `ECART_ARRONDI_IMPORTANT` |
| barre 20 / 2,5, max 100 | 110 | 100, `CIBLE_AU_DESSUS_MAX` |

Propriété (barre) : pour toute cible dans [barre, max], résultat ∈ charges disponibles ; résultat − cible ≤ 0,025 × cible ; |résultat − cible| < un incrément.

### T7 — RPE absent sur toute la séance

Ref squat 150 ; 3 × 5 prévues à 125, loguées 125 × 5 × 3 sans RPE. Attendu : pas d'ajustement en séance, `RPE_MANQUANT`, `PAS_DE_DONNEE_FIABLE`, ref = **150**, séance suivante 5 @ 8 = **125**.

### T8 — e1RM aberrant (faute de frappe)

Ref squat 150 ; logué 185 × 1 @ 8 → e1rmSerie = 185 / 0,9375 = 197,33 → ratio 1,316. Attendu : `A_CONFIRMER`, ref = **150**, aucune hausse des séries suivantes. L'utilisateur corrige en 135 × 1 @ 8 → 144 → ratio 0,96 → ref = **147**.

### T9 — Baisse forte en séance

Ref 150 ; 125 × 3 sur 5 prescrites, RPE absent. Attendu en séance : série suivante 5 @ 7 à **107,5** (`SERIE_DURE`). Après séance : e1rmJour 133,33, ratio 0,889 → `A_CONFIRMER`, ref inchangée tant que non confirmé.

### T10 — Aller-retour (propriété)

Pour toute ref ∈ [20, 400], reps ∈ [1, 10], RPE ∈ {7 ; 7,5 ; … ; 10} : loguer la charge brute (non arrondie) prescrite au RPE prescrit laisse la ref inchangée à 1e-9 près. Avec la charge arrondie : e1rmJour = ref × charge / brute.

### T11 — Variante sans historique

Ref squat 150 ; pause squat jamais loguée, 4 @ 7 → **112,5**. Logué 112,5 × 4 @ 8 → ref pause squat **133,125** ; ref squat **150**.

### T12 — Déclencheurs de deload

| Données | Attendu |
| --- | --- |
| Refs squat fin de semaine S−3..S0 : 150, 152, 151, 143 | deload recommandé, raison régression (143 ≤ 0,95 × 152 = 144,4) |
| Ref squat S−3 = 150, S0 = 149,5 ; 3 `SERIE_DURE` sur 7 jours | deload recommandé (stagnation + fatigue) |
| Ref squat S−3 = 150, S0 = 149,5 ; aucun autre signal | pas de deload, `STAGNATION` |
| Cas « régression » mais dernier deload il y a 2 semaines | pas de deload, `FATIGUE_PERSISTANTE_APRES_DELOAD` |
| Intermédiaire, 5 semaines de charge depuis le dernier deload, modèle sans semaine deload | semaine 6 = deload planifié |

### T13 — Paliers (propriétés)

Pour toute charge de travail disponible de 20 à 300 kg (barre 20, incrément 2,5) et toute valeur de I : premier palier = barre si charge > barre et `premier_du_schema` vrai ; reps non croissantes ; charges strictement croissantes ; toutes < charge de travail ; toutes ∈ charges disponibles. Exemples chiffrés A à G de `paliers-montee-en-charge.md`.

### T14 — Domaine et saisie du RPE

| Entrée | Attendu |
| --- | --- |
| pct(0, 8) | `HORS_DOMAINE` |
| pct(16, 8) | `HORS_DOMAINE` |
| pct(5, 5,5) en prescription | `HORS_DOMAINE` |
| RPE saisi 8,25 | 8,5 |
| RPE saisi 8,74 | 8,5 |
| RPE saisi 8,75 | 9 |
| RPE saisi 11 ou « dur » | `RPE_INVALIDE`, traité comme absent |

### T15 — Douleur

Ref couché 96 ; série 1 loguée 80 × 5 @ 8 (e1RM 96) ; série 2 loguée 80 × 5 @ 9 avec douleur déclarée à l'épaule. Attendu : `DOULEUR`, série 3 sans charge, série 2 exclue, série de référence = série 1, ref = **96**. Bugué (série 2 prise comme série de référence car RPE plus haut) : e1rmJour 93,33, ref 94,67.

### T16 — Exercice lesté

Poids du corps 80 ; e1RM système traction 120 ; 5 @ 8 → lest **20**. Poids du corps 80, e1RM système 90, 5 @ 8 → 75 − 80 < 0 → `LEST_NEGATIF`.

### T17 — Séries d'approche en musculation (`paliers-montee-en-charge.md#musculation`)

Séance dans l'ordre : presse à cuisses 3 × 10 à 140 kg (pile 5 à 300, pas 5) ; fentes haltères 3 × 10 à 16 kg ; curl haltères 3 × 12 à 12 kg (haltères 2 à 40, pas 2) ; leg curl 3 × 15 à 40 kg (pile pas 5) ; rowing barre 4 × 6 à 80 kg, e1RM 100.

| Exercice | Attendu |
| --- | --- |
| Presse (1er quadriceps, 10 reps) | 70 × 8 (60 s) · 105 × 4 (90 s) |
| Fentes (2e quadriceps) | aucune série d'approche |
| Curl (1er biceps, 12 reps) | 6 × 8 (60 s) · 8 × 4 (90 s) |
| Leg curl (1er ischio-jambiers, 15 reps) | 20 × 8 (90 s) |
| Rowing barre (6 reps, barre) | échelle R2 : I = 0,80 → « Lourd » : 20 × 10 · 32,5 × 5 · 47,5 × 3 · 60 × 2 · 67,5 × 1 |

Assertions : aucune série d'approche ≥ charge de travail ; reps non croissantes ; changer l'ordre (fentes avant la presse) déplace les séries d'approche sur les fentes et en retire à la presse. Bugué à faire échouer : séries d'approche sur chaque exercice, ou règle courte appliquée au rowing 6 reps.

## Limites et contre-indications

- T4 et T5 dépendent de `knowledge/hypertrophie/mapping-muscles.json`, pas encore écrit : identifiants de muscles provisoires.
- Les entrées T1 à T3 sont reconstituées ; Pierrot peut fournir les lignes exactes des tableurs pour des tests encore plus fidèles.

## Exemple

Voir T1 : c'est le test le plus important pour la sécurité (un deload qui contient des singles à RPE 10 doit être refusé).
