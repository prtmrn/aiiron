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
| 1 × 1 @ 9 | `DELOAD_RPE_TROP_HAUT`, `DELOAD_SINGLE_LOURD`, `DELOAD_INTENSITE_TROP_HAUTE` (n = 2,5 : 95,2 %) |
| 1 × 1 @ 10 | `DELOAD_RPE_TROP_HAUT`, `DELOAD_SINGLE_LOURD`, `DELOAD_INTENSITE_TROP_HAUTE` (n = 1,5 : 98,4 %) |
| 3 × 3 @ 7 | `DELOAD_INTENSITE_TROP_HAUTE` (n = 6,5 : 84,5 %) |
| exercice | `DELOAD_VOLUME_TROP_HAUT` (5 séries > ceil(5/2) = 3) |

`corrigerDeload(S4, S3)` attendu : **squat 3 × 4 @ 6 à 117,5 kg** (3 reps : aucun RPE ≥ 6 sous 80 %, donc 4 reps @ 6 ; 150 × 0,791667 = 118,75 → 117,5), 2 singles supprimés, liste de changements non vide. Et `validerDeload` de la semaine corrigée ne renvoie aucune violation (`deload.md`, R4 étape 2).

Propriété : toute semaine `deload` produite par le moteur a RPE max ≤ 7, pct(reps, RPE) ≤ 0,80, charge max ≤ 0,80 × e1RM effectif, aucun single à RPE ≥ 8, aucun AMRAP, et passe `validerDeload`.

Comportement bugué à faire échouer : semaine acceptée telle quelle.

### T2 — Lvl1/Lvl2 : % saisis à la main, incohérents avec les RPE ; RPE manquants

Entrée : squat, e1RM 140. Lignes du modèle (le % saisi = charge d'origine / 1RM d'origine, figé) :

| Ligne | Reps | RPE | % saisi | Sortie attendue | Drapeaux |
| --- | --- | --- | --- | --- | --- |
| L1 | 5 | 8 | 85 | 140 × 0,819444 = 114,722 → **115** | `INCOHERENCE_PCT_RPE` (RPE implicite 9,21, écart +1,21) |
| L2 | 5 | 7 | 87 | 140 × 0,791667 = 110,833 → **110** | `INCOHERENCE_PCT_RPE` (RPE implicite 10,02, écart +3,02 ; pas `PCT_IMPOSSIBLE` car le RPE prescrit fait foi, `table-rpe.md` R5) |
| L3 | 3 | absent | 85 | RPE implicite 7,206 → 7 ; n = 6,5 ; 140 × 0,845070 = 118,31 → **117,5** | `RPE_DEDUIT_DU_PCT` |
| L4 | 5 | absent | 92 | **aucune charge** | `PCT_IMPOSSIBLE` (RPE implicite 11,89) |
| L5 | 4 | absent | absent | **aucune charge** | `PRESCRIPTION_INCOMPLETE` |
| L6 | 1 | 8 | 80 | n = 3,5 ; 140 × 0,923077 = 129,231 → **130** | `INCOHERENCE_PCT_RPE` (RPE implicite 3,3, écart −4,7) |

Puis e1RM 140 → 150, même modèle : L1 → 150 × 0,819444 = 122,917 → **122,5** (la charge suit l'e1RM ; le % saisi n'est jamais stocké comme prescription).

Comportement bugué à faire échouer : L1 = 140 × 0,85 = 119 → 120 ; L1 après passage à 150 = 120 (% figé et charge figée).

### T3 — Push/Pull : discount OHP annoncé −6 %, appliqué ≈ −2 % et pas partout

Entrée : OHP, ref 70. Slot « OHP après couché » avec `remise_contexte` 0,94 dans les séances A, B, C de chaque semaine, sur 4 semaines.

| Séance | Prescription | Brute (70 × 0,94 × pct) | Attendu | Bugué −2 % | Bugué sans discount |
| --- | --- | --- | --- | --- | --- |
| A | 5 @ 8 | 53,919 | **55** | 55 | 57,5 |
| B | 3 @ 8 | 57,217 | **57,5** | 60 | 60 |
| C | 8 @ 7 | 46,608 | **47,5** | 47,5 | 50 |

Après arrondi, le bug « −2 % » donne la même charge que l'attendu en A et C (56,214 → 55 ; 48,592 → 47,5) : seule la séance B le révèle sur la charge finale. C'est l'assertion 1, sur la charge brute, qui le détecte sur toutes les séries.

Paliers séance A (charge de travail 55, e1RM effectif 65,8, I = 0,836 → lourd) : barre × 10 · 22,5 × 5 · 32,5 × 3 · 40 × 2 · 47,5 × 1.

Assertions :
1. Pour chaque série et chaque palier généré dans le slot, sur les 4 semaines : `brute / (70 × pct)` = 0,94 à 1e-9 près (paliers : rapport à la charge de travail inchangé).
2. Après arrondi : |charge − brute| < 2,5 (un incrément) et charge − brute ≤ 0,025 × brute (règle d'arrondi, `arrondi-charges.md`, R3).
3. Une seule source du multiplicateur : modifier `remise_contexte` à 0,90 modifie toutes les séries du slot et aucune autre.
4. Retour : séance A faite 55 × 5 @ 8 → e1rmSerie = 55 / 0,819444 = 67,119 → e1rmJour = 67,119 / 0,94 = 71,403 → ratio 1,020 → ref = **70,701**.

### T4 — Set counts « Semaine libre » : double comptage par sous-chaîne (moteur volume)

Mapping : `knowledge/hypertrophie/mapping-muscles.json` (identifiants snake_case). Deux modes de comptage sont testés :
- **poids réels** (règle du mapping, validée par Pierrot le 25/11/2026) : muscle principal = 1, secondaire = 0,5, dédoublonnage par exercice (un identifiant une seule fois, avec le poids le plus élevé) ;
- **poids 1** (mode de test explicite) : tout muscle associé à l'exercice compte 1. Il isole le bug de double comptage, indépendamment des poids.

Entrée (reconstituée) : squat `0043` 3 séries, presse à cuisses `0739` 3 séries. Selon les surcharges du mapping (v3) : squat `0043` principaux {`quadriceps`, `fessiers`}, secondaires {`adducteurs`, `core`} ; presse `0739` principal {`quadriceps`}, secondaires {`fessiers`, `adducteurs`}. Dans le tableur, chaque ligne contenait le libellé du muscle deux fois (colonne muscle principal + colonne liste des muscles), et le comptage cherchait le libellé comme sous-chaîne dans la ligne.

| Muscle | Attendu, poids réels | Attendu, poids 1 | Bugué (double comptage), poids réels | Bugué, poids 1 |
| --- | --- | --- | --- | --- |
| quadriceps | **6** | **6** | 12 | 12 |
| fessiers | **4,5** | **6** | 9 | 12 |
| adducteurs | **3** | **6** | 6 | 12 |

Compteur séparé (hors volume hypertrophie, affiché à part) : `core` **1,5** en poids réels, **3** en poids 1 (secondaire de `0043` seulement). Il ne doit jamais apparaître dans les totaux de volume.

Règle : `compte(m) = Σ séries(ex) × poids(ex, m)` sur l'ensemble **dédoublonné** des identifiants de muscles exacts de l'exercice. Les poids sont une décision d'`expert-hypertrophie` (portée par le mapping) ; ce test vérifie surtout qu'aucun couple (exercice, muscle) n'est compté deux fois.

Cas réels de notre propre base `data/exercises/exercises.json`, à ajouter :
- Doublon entre champs : `0027` (barbell bent over row, résolu par libellés, sans surcharge) a "biceps" à la fois dans `groupe_musculaire` et dans `muscles_secondaires`. Attendu par série : `haut_du_dos` 1 (« upper back », cible), `biceps` 0,5 une seule fois, `avant_bras` 0,5. Bugué : `biceps` 1 (compté deux fois). (`0025` avait le même doublon sur « triceps » ; il est maintenant résolu par surcharge.)
- Synonymes : « quads » (`muscle_cible` de `2287`) et « quadriceps » (libellé du dataset) → même identifiant `quadriceps`, un seul compteur. Le test porte sur la table des libellés (`quads` et `quadriceps` → `quadriceps`) ; `2287` est par ailleurs surchargé (presse) : par série `quadriceps` 1, `fessiers` 0,5, `adducteurs` 0,5.
- Pièges de sous-chaîne, tirés des libellés réels du dataset. Attendu : correspondance par libellé entier uniquement.

| Libellé | Attendu | Bugué si recherche par sous-chaîne |
| --- | --- | --- |
| « rear deltoids » | `deltoides_posterieurs` seulement | compté aussi sous « deltoids » → `deltoides` |
| « deltoids » | `deltoides` (agrégat, avertissement `TETE_DELTOIDE_NON_PRECISEE`) | — |
| « lower back » | `lombaires` | « back » trouvé dedans |
| « upper back » | `haut_du_dos` | « back » trouvé dedans |
| « back » | aucun muscle (libellé ambigu, non compté) | — |
| « lower abs » | `abdominaux`, une fois | compté aussi sous « abs » (2 fois) |
| « upper chest » | `pectoraux`, une fois | compté aussi sous « chest » (2 fois) |

### T5 — Set counts « Workout » : colonne Muscles décalée d'une ligne (moteur volume)

Entrée : séance de 3 exercices, mapping `knowledge/hypertrophie/mapping-muscles.json`.
- `0025` couché (surcharge) : principal `pectoraux` ; secondaires `triceps`, `deltoides_anterieurs`.
- `0027` rowing barre (surcharge du mapping v4, MAP-13) : principal `haut_du_dos` ; secondaires `dorsaux`, `biceps`, `avant_bras`.
- `0043` squat (surcharge) : principaux `quadriceps`, `fessiers` ; secondaires `adducteurs`, `core` (compteur séparé).

| Ordre | Exercice | Séries |
| --- | --- | --- |
| 1 | `0025` | 4 |
| 2 | `0027` | 3 |
| 3 | `0043` | 5 |

| Muscle | Attendu, poids réels | Attendu, poids 1 | Bugué (ligne i ← muscles de la ligne i−1), poids réels | Bugué, poids 1 |
| --- | --- | --- | --- | --- |
| pectoraux | **4** | **4** | 3 | 3 |
| triceps | **2** | **4** | 1,5 | 3 |
| deltoides_anterieurs | **2** | **4** | 1,5 | 3 |
| haut_du_dos | **3** | **3** | 5 | 5 |
| dorsaux | **1,5** | **3** | 2,5 | 5 |
| biceps | **1,5** | **3** | 2,5 | 5 |
| avant_bras | **1,5** | **3** | 2,5 | 5 |
| quadriceps | **5** | **5** | 0 | 0 |
| fessiers | **5** | **5** | 0 | 0 |
| adducteurs | **2,5** | **5** | 0 | 0 |

Compteur séparé : `core` **2,5** en poids réels, **5** en poids 1 (secondaire de `0043`) ; bugué : 0. Jamais dans les totaux de volume.

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
| haltères 10 à 30 pas 2 | 23,2 | 22, `ECART_ARRONDI_IMPORTANT` (−5,17 %) |
| kettlebells 8 à 32 pas 4 | 19 | 16, `ECART_ARRONDI_IMPORTANT` |
| barre 20 / 2,5, max 100 | 110 | 100, `CIBLE_AU_DESSUS_MAX` |

Propriété (barre) : pour toute cible dans [barre, max], résultat ∈ charges disponibles ; résultat − cible ≤ 0,025 × cible ; |résultat − cible| < un incrément.

### T7 — RPE absent sur toute la séance

Ref squat 150 ; 3 × 5 @ 8 prévues à 122,5 (150 × 0,819444 = 122,917), loguées 122,5 × 5 × 3 sans RPE. Attendu : pas d'ajustement en séance, `RPE_MANQUANT`, `PAS_DE_DONNEE_FIABLE`, ref = **150**, séance suivante 5 @ 8 = **122,5**.

### T8 — e1RM aberrant (faute de frappe)

Ref squat 150 ; logué 185 × 1 @ 8 → n = 3,5 ; e1rmSerie = 185 / 0,923077 = 200,42 → ratio 1,336. Attendu : `A_CONFIRMER`, ref = **150**, aucune hausse des séries suivantes. L'utilisateur corrige en 135 × 1 @ 8 → 146,25 → ratio 0,975 → ref = **148,125**.

### T9 — Baisse forte en séance

Ref 150 ; 5 @ 8 prescrites à 122,5 ; logué 122,5 × 3, RPE absent. Attendu en séance : RPE := 10 aux 3 reps, e1rmSerie = 122,5 / 0,923077 = 132,708 ; série suivante 5 @ 7 : 132,708 × 0,791667 = 105,06 → **105** (`SERIE_DURE`). Après séance : e1rmJour 132,708, ratio 0,885 → `A_CONFIRMER`, ref inchangée tant que non confirmé.

### T10 — Aller-retour (propriété)

Pour toute ref ∈ [20, 400], reps ∈ [1, 10], RPE ∈ {7 ; 7,5 ; … ; 10} : loguer la charge brute (non arrondie) prescrite au RPE prescrit laisse la ref inchangée à 1e-9 près. Avec la charge arrondie : e1rmJour = ref × charge / brute. Avec `e1rm.md` R1 bis (single @ 10 → e1RM = charge, validée par Pierrot le 25/11/2026), le couple (1 rep, RPE 10) sort de la propriété : il donne e1rmJour = ref × 0,983607. Sans conséquence en pratique, RPE 10 n'étant jamais prescrit hors test.

### T10 bis — Single @ 10 (`e1rm.md`, R1 bis, validée par Pierrot le 25/11/2026)

| Entrée | Sans R1 bis | Avec R1 bis |
| --- | --- | --- |
| e1rmSerie(100, 1, 10) | 101,667 | **100** |
| e1rmSerie(100, 1, 9,5) | 103,333 | 103,333 (inchangé) |
| rpeDepuisPct(1,00, 1) | 10,5 → `PCT_IMPOSSIBLE` | idem |

### T11 — Variante sans historique

Ref squat 150 ; pause squat jamais loguée (e1RM initial 135), 4 @ 7 → 135 × 0,819444 = 110,625 → **110**. Logué 110 × 4 @ 8 → e1rmJour 130,167 → ref pause squat **132,583** ; ref squat **150**.

### T12 — Déclencheurs de deload

| Données | Attendu |
| --- | --- |
| Refs squat fin de semaine S−3..S0 : 150, 152, 151, 143 | deload recommandé, raison régression (143 ≤ 0,95 × 152 = 144,4) |
| Ref squat S−3 = 150, S0 = 149,5 ; 3 `SERIE_DURE` sur 7 jours | deload recommandé (stagnation + fatigue) |
| Ref squat S−3 = 150, S0 = 149,5 ; aucun autre signal | pas de deload, `STAGNATION` |
| Cas « régression » mais dernier deload il y a 2 semaines | pas de deload, `FATIGUE_PERSISTANTE_APRES_DELOAD` |
| Intermédiaire, 5 semaines de charge depuis le dernier deload, modèle sans semaine deload | semaine 6 = deload planifié |

### T13 — Paliers (propriétés)

Pour toute charge de travail disponible de 20 à 300 kg (barre 20, incrément 2,5) et toute valeur de I : premier palier = barre si charge > barre et `premier_du_schema` vrai ; reps non croissantes ; charges strictement croissantes ; toutes < charge de travail ; toutes ∈ charges disponibles. Exemples chiffrés A à G de `paliers-montee-en-charge.md` (H : choix d'échelle seulement).

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

Ref couché 96 ; série 1 loguée 80 × 5 @ 8 (e1RM 80 / 0,819444 = 97,627) ; série 2 loguée 80 × 5 @ 9 avec douleur déclarée à l'épaule. Attendu : `DOULEUR`, série 3 sans charge, série 2 exclue, série de référence = série 1, ratio 1,017, ref = **96,814**. Bugué (série 2 prise comme série de référence car RPE plus haut) : e1rmJour 80 / 0,845070 = 94,667, ref 95,333.

### T16 — Exercice lesté

Matériel lest, incrément 1,25. Poids du corps 80 ; e1RM système traction 120 ; 5 @ 8 → 120 × 0,819444 = 98,333 → lest cible 18,333 → lest **18,75**. Poids du corps 80, e1RM système 90, 5 @ 8 → 73,75 − 80 < 0 → `LEST_NEGATIF`.

### T17 — Séries d'approche en musculation (`paliers-montee-en-charge.md#musculation`)

Séance de musculation, dans l'ordre : presse à cuisses 3 × 10 à 140 kg (pile 5 à 300, pas 5) ; fentes haltères 3 × 10 à 16 kg ; curl haltères 3 × 12 à 12 kg (haltères 2 à 40, pas 2) ; leg curl 3 × 15 à 40 kg (pile pas 5) ; rowing barre 4 × 6 à 80 kg, e1RM 100. Sauf le rowing, aucun exercice n'a d'e1RM ni de RPE prescrit : I indéterminable → règle courte M2.

| Exercice | Attendu |
| --- | --- |
| Presse (1er `quadriceps`, 10 reps, I indéterminable) | 70 × 8 (60 s) · 105 × 4 (90 s) |
| Fentes (2e `quadriceps`) | aucune série d'approche |
| Curl (1er `biceps`, 12 reps, I indéterminable) | 6 × 8 (60 s) · 8 × 4 (90 s) |
| Leg curl (1er `ischio_jambiers`, 15 reps, I indéterminable) | 20 × 8 (90 s) |
| Rowing barre (6 reps, 80 / 100) | I = 0,80 ≥ 0,80 → échelle R2 « Lourd » : 20 × 10 · 32,5 × 5 · 47,5 × 3 · 60 × 2 · 67,5 × 1 |

Cas ajoutés, chacun à la place du rowing 4 × 6 (rowing premier exercice de son groupe, barre 20 / 2,5) :

| Variante | I | Attendu |
| --- | --- | --- |
| Rowing 4 × 10 à 80 kg, e1RM 100 | 0,80 | paliers complets « Lourd », identiques au cas 4 × 6 : 20 × 10 · 32,5 × 5 · 47,5 × 3 · 60 × 2 · 67,5 × 1 |
| Rowing 4 × 5 à 70 kg, e1RM 100 | 0,70 | règle courte M2, ligne « 1 à 6 » : 35 × 5 (60 s) · 52,5 × 3 (90 s) |
| Rowing 4 × 5 @ 7,5, e1RM inconnu | pct(5 ; 7,5) = 0,8056 | échelle « Lourd » |
| Rowing 4 × 5 @ 7, e1RM inconnu | pct(5 ; 7) = 0,7917 | règle courte M2, ligne « 1 à 6 » |

Cas ajoutés, mouvement déjà chauffé (`paliers-montee-en-charge.md`, R5 « Mouvement déjà chauffé ») ; séances de musculation séparées, barre 20 / 2,5, presse pile 5 à 300 pas 5. Le catalogue donne `schema` = `squat` pour le squat et la presse, `poussee_horizontale` pour le couché, `tirage` pour le rowing.

| Séance | Exercice | I | Attendu | Bugué à faire échouer |
| --- | --- | --- | --- | --- |
| 1 | Squat 4 × 6 à 100 kg, e1RM 120 (1er du schéma `squat`) | 0,833 | « Lourd » complet : 20 × 10 (30 s) · 40 × 5 (60 s) · 60 × 3 (60 s) · 75 × 2 (90 s) · 85 × 1 (180 s) | — |
| 1 | Presse 3 × 8 à 200 kg, e1RM 240 (schéma `squat` déjà chauffé, 2e `quadriceps`) | 0,833 | départ à 60 % : 120 × 3 (60 s) · 150 × 2 (90 s) · 170 × 1 (180 s) | 0 série d'approche (règle des groupes) ; ou paliers complets 80 × 5 · 120 × 3 · 150 × 2 · 170 × 1 |
| 2 | Couché 4 × 5 à 85 kg, e1RM 100 (1er du schéma `poussee_horizontale`) | 0,85 | « Lourd » complet : 20 × 10 · 32,5 × 5 (34 : 35 serait +2,94 %) · 50 × 3 (51) · 62,5 × 2 (63,75 : égalité, vers le bas) · 72,5 × 1 (72,25) ; repos 30, 60, 60, 90, 180 s | — |
| 2 | Rowing barre 4 × 6 à 80 kg, e1RM 100 (1er du schéma `tirage`) | 0,80 | « Lourd » complet : 20 × 10 · 32,5 × 5 · 47,5 × 3 · 60 × 2 · 67,5 × 1 ; repos 30, 60, 60, 90, 180 s | départ à 60 % (47,5 × 3 · 60 × 2 · 67,5 × 1) parce qu'un exercice lourd à la barre a déjà été fait |

Assertions : aucune série d'approche ≥ charge de travail ; reps non croissantes ; changer l'ordre (fentes avant la presse) déplace les séries d'approche sur les fentes et en retire à la presse ; à charge et e1RM égaux, changer le nombre de reps ne change pas l'échelle. Bugué à faire échouer : séries d'approche sur chaque exercice ; choix de l'échelle par le nombre de reps (règle courte au rowing 4 × 10 à I = 0,80, ou échelle complète au rowing 4 × 5 à I = 0,70).

### T17 bis — Mouvement déjà chauffé en Hyrox/CrossFit (`paliers-montee-en-charge.md`, R5)

Séance `hyrox_crossfit`, bloc force avant le metcon, barre 20 / 2,5. Le catalogue donne `schema` = `squat` aux deux exercices. I calculé depuis l'e1RM du slot (R2, point 1).

| Ordre | Exercice | I | Attendu | Bugué à faire échouer |
| --- | --- | --- | --- | --- |
| 1 | Front squat 5 × 3 à 85 kg, e1RM 100 (1er du schéma `squat`) | 0,85 | « Lourd » complet : 20 × 10 (30 s) · 32,5 × 5 (60 s ; 34 : 35 serait +2,94 %) · 50 × 3 (60 s ; 51) · 62,5 × 2 (90 s ; 63,75 : égalité, vers le bas) · 72,5 × 1 (180 s ; 72,25) | ECH-H4 à la place des paliers (type de séance pris pour critère au lieu de I) |
| 2 | Back squat 3 × 5 à 110 kg, e1RM 130 (schéma `squat` déjà chauffé) | 0,846 | départ à 60 % : 65 × 3 (60 s ; 66) · 82,5 × 2 (90 s) · 92,5 × 1 (180 s ; 93,5) ; pas de barre vide | paliers complets 20 × 10 · 45 × 5 (44 : 45 = +2,27 %) · 65 × 3 · 82,5 × 2 · 92,5 × 1 (règle limitée à force et musculation) ; ou ECH-H4 |

Durées (R6) : front squat 21 reps × 4 + 420 = 504 s ; back squat 6 reps × 4 + 330 = 354 s.

Variante : si le front squat est prescrit à 60 kg (I = 0,60 < 0,80 → ECH-H4), il n'« a pas eu ses paliers » : le back squat a ses paliers complets (colonne « bugué » ci-dessus devient l'attendu).

## Limites et contre-indications

- T4 et T5 utilisent les identifiants et surcharges de `knowledge/hypertrophie/mapping-muscles.json` (brouillon, version 4). Les attendus « poids réels » suivent sa règle de comptage (principal 1, secondaire 0,5), validée par Pierrot le 25/11/2026 ; les attendus « poids 1 » n'en dépendent pas. Toute modification du mapping (surcharges de `0025`, `0043`, `0739`, libellés de `0027`, `2287`) impose de revoir ces deux tests.
- Groupe d'un exercice pour les séries d'approche (T17) = premier muscle principal compté en volume, sinon aucun (MAP-6), lu par le moteur dans la résolution du moteur volume (`resoudreExercice(id).groupe`), jamais donné par l'appelant. Groupe inconnu (identifiant du moteur force absent du catalogue, comme `squat` ou `developpe_couche`, ou exercice sans principal compté) : l'exercice est traité comme premier de son groupe et reçoit ses séries d'approche (choix prudent).
- Les entrées T1 à T3 sont reconstituées et définitives : aucune ligne des tableurs d'origine n'entrera dans le repo. Seuls les mécanismes d'erreur sont décrits, pas la structure des programmes d'origine.
- Toutes les valeurs dépendant de la table RPE utilisent la variante n = reps + 10 − RPE + 0,5 (`table-rpe.md`).

## Exemple

Voir T1 : c'est le test le plus important pour la sécurité (un deload qui contient des singles à RPE 10 doit être refusé).
