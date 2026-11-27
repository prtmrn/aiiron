---
id: hypertrophie-volume-cibles
domaine: hypertrophie
titre: Volume hebdomadaire par muscle, fréquence, ajustements et progression en hypertrophie
niveau_preuve: C
sources:
  - titre: "Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis"
    auteurs: "Schoenfeld BJ, Ogborn D, Krieger JW"
    annee: 2017
    url: "https://doi.org/10.1080/02640414.2016.1210197"
  - titre: "The resistance training dose response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains"
    auteurs: "Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC"
    annee: 2026
    url: "https://doi.org/10.1007/s40279-025-02344-w"
  - titre: "Is There Too Much of a Good Thing? Meta-Regressions of the Effect of Per-Session Volume on Hypertrophy and Strength (préprint SportRxiv)"
    auteurs: "Remmert J, Pelland J, Robinson Z, Hinson S, Zourdos M"
    annee: 2025
    url: "https://sportrxiv.org/index.php/server/preprint/view/537"
  - titre: "A Systematic Review of The Effects of Different Resistance Training Volumes on Muscle Hypertrophy"
    auteurs: "Baz-Valle E, Balsalobre-Fernández C, Alix-Fages C, Santos-Concejero J"
    annee: 2022
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/"
  - titre: "American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews"
    auteurs: "Currier BS, D'Souza AC, Fiatarone Singh MA, et al."
    annee: 2026
    url: "https://doi.org/10.1249/MSS.0000000000003897"
  - titre: "Effects of Resistance Training Frequency on Measures of Muscle Hypertrophy: A Systematic Review and Meta-Analysis"
    auteurs: "Schoenfeld BJ, Ogborn D, Krieger JW"
    annee: 2016
    url: "https://doi.org/10.1007/s40279-016-0543-8"
  - titre: "Exploring the Dose-Response Relationship Between Estimated Resistance Training Proximity to Failure, Strength Gain, and Muscle Hypertrophy: A Series of Meta-Regressions"
    auteurs: "Robinson ZP, Pelland JC, Remmert JF, Refalo MC, Jukic I, Steele J, Zourdos MC"
    annee: 2024
    url: "https://doi.org/10.1007/s40279-024-02069-2"
  - titre: "Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy: A Systematic Review with Meta-analysis"
    auteurs: "Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ"
    annee: 2023
    url: "https://doi.org/10.1007/s40279-022-01784-y"
  - titre: "Progressive overload without progressing load? The effects of load or repetition progression on muscular adaptations"
    auteurs: "Plotkin D, Coleman M, Van Every D, et al."
    annee: 2022
    url: "https://doi.org/10.7717/peerj.14142"
  - titre: "Training volume increases or maintenance based on previous volume: the effects on muscular adaptations in trained males"
    auteurs: "Barsuhn A, et al."
    annee: 2024
    url: "https://pubmed.ncbi.nlm.nih.gov/39665246/"
  - titre: "Muscle Hypertrophy Response Is Affected by Previous Resistance Training Volume in Trained Individuals"
    auteurs: "Scarpelli MC, et al."
    annee: 2022
    url: "https://pubmed.ncbi.nlm.nih.gov/32108724/"
  - titre: "Give it a rest: a systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy"
    auteurs: "Singer A, Wolf M, Generoso L, et al."
    annee: 2024
    url: "https://doi.org/10.3389/fspor.2024.1429789"
statut: brouillon
auteur_agent: expert-hypertrophie
derniere_revue: 2026-11-27
---

# Volume hebdomadaire par muscle et ajustements

Comptage : `mapping-muscles.md` (MAP-3 à MAP-11). Modèles : `knowledge/modeles/hypertrophie-*.json`. Format des modèles et adaptation générale : `knowledge/modeles/README.md` et `knowledge/modeles/selection-et-adaptation.md` (expert-force), qui renvoient ici pour le volume.

## Principe

Plus de séries par muscle et par semaine donnent plus d'hypertrophie, avec des gains qui diminuent à mesure qu'on en ajoute (Schoenfeld 2017 ; Pelland 2026, 67 études, comptage où une série indirecte vaut une demi-série). L'ACSM (2026) retient au moins 10 séries par semaine et par muscle pour la croissance musculaire, avec des retours décroissants vers 18 à 20. Chez des pratiquants entraînés, plus de 20 séries par semaine ne font pas mieux que 12 à 20 pour le quadriceps et le biceps (seul le triceps a profité du volume élevé), d'où une zone de 12 à 20 proposée par Baz-Valle 2022. À volume égal, la fréquence change peu l'hypertrophie (Pelland 2026) ; on garde au moins deux séances par muscle pour répartir le volume et limiter le volume par séance, au-delà duquel les gains plafonnent (environ 11 séries fractionnaires par séance, Remmert 2025, préprint). Les séries comptées sont des séries effectives : proches de l'échec, sans l'atteindre obligatoirement (Robinson 2024 ; Refalo 2023). Les chiffres de cette fiche sont nos bornes de prudence tirées de ces travaux, pas des seuils mesurés.

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| VOL-1 | **Comptage.** Séries de travail de la semaine, poids principal 1, secondaire 0,5, dédoublonnage par exercice, exercices hors volume exclus (`compterVolume`, MAP-3 à MAP-5, MAP-11). Seule une série à RPE ≥ 6 (prescrite ou réalisée) compte comme série effective ; les séries d'approche et les paliers ne comptent jamais. `core` (compteur séparé) et `deltoides` (agrégat, MAP-7) sont affichés mais **jamais comparés aux bornes** : l'agrégat n'est jamais réparti sur les trois têtes. | Poids : Pelland 2026 (publié ; comptage fractionnaire le mieux soutenu), niveau B. RPE ≥ 6 = plancher de prescription de `force/table-rpe.md` R3 ; seuil « série effective » : heuristique à valider (Robinson 2024 montre un effet de la proximité de l'échec, sans seuil) |
| VOL-2 | **Classes de muscles.** *Prioritaires* : `quadriceps`, `fessiers`, `ischio_jambiers`, `pectoraux`, `dorsaux`, `haut_du_dos`, `deltoides_lateraux`, `triceps`, `biceps` : bornes de VOL-3 et fréquence de VOL-4. *Complémentaires* : `mollets`, `abdominaux`, `deltoides_posterieurs` : minimum 0 ; bornes de VOL-3 seulement si l'utilisateur les cible (préférence du profil) ; maximum prudent toujours. *Suivis* : `deltoides_anterieurs`, `trapezes`, `avant_bras`, `adducteurs`, `abducteurs`, `obliques`, `lombaires`, `flechisseurs_hanche`, `cou` : aucun minimum, maximum prudent de VOL-3 ; `lombaires` plafonnées à 10 séries quel que soit le niveau. | Choix de conception (heuristique à valider). Les méta-analyses portent surtout sur quadriceps, biceps et triceps ; aucune ne donne de bornes par muscle. Plafond lombaires : aucune source trouvée, prudence (fatigue des charnières) |
| VOL-3 | **Bornes hebdomadaires** (séries fractionnaires, par muscle) : voir le tableau ci-dessous. | Zone intermédiaire alignée sur l'ACSM 2026 (≥ 10) ; zone avancée sur Baz-Valle 2022 (12 à 20 chez des entraînés) ; maximum prudent : au-delà, gains non démontrés (Baz-Valle 2022, Pelland 2026). Minimums et zone débutant : Schoenfeld 2017 (gains déjà nets sous 10 séries), chiffres = heuristique à valider |
| VOL-4 | **Fréquence.** Un muscle prioritaire doit recevoir au moins 1,5 série fractionnaire dans **au moins 2 séances** de la semaine. Sinon : drapeau `FREQUENCE_INSUFFISANTE`. | Au moins 2 fois par semaine : Schoenfeld 2016, ACSM 2026. Seuil 1,5 : heuristique à valider (aucune source ; c'est l'équivalent de 3 séries indirectes) |
| VOL-5 | **Plafond par séance et par muscle** : 8 séries fractionnaires (débutant), 10 (intermédiaire, avancé). Au-delà : drapeau `VOLUME_SEANCE_ELEVE`, retrait des séries du dernier slot du muscle dans la séance jusqu'au plafond ; les séries retirées vont dans une autre séance si le volume hebdomadaire passerait sous la zone. | Remmert 2025 (préprint, niveau C) : retours décroissants vers 11 séries fractionnaires par séance ; 10 et 8 = marge de prudence, heuristique à valider |
| VOL-6 | **Exercice composé.** Il compte pour tous ses muscles résolus, avec leurs poids : un squat `0043` × 3 = quadriceps 3, fessiers 3, adducteurs 1,5 (et core 1,5 à part). On ne déduit jamais de volume d'un muscle absent du mapping, même si l'exercice le fait travailler. Limites connues du mapping v3 à garder en tête : les rowings (`0861`, `0027`, `0292`…) ne comptent rien en `dorsaux` ; `0585` (leg extension) compte 0,5 en ischio-jambiers (défaut du dataset) ; les presses d'épaule et les écartés hors surcharge comptent en `deltoides` (agrégat). D'où le choix, dans les modèles, de `0091`, `0334` et `0075` pour les têtes du deltoïde. | MAP-3 à MAP-7. Défauts listés : `mapping-muscles.md`, Limites |
| VOL-7 | **Retirer une séance** (moins de créneaux que le modèle). 1) Choisir d'abord le modèle à N − 1 séances de même niveau (sélection, `selection-et-adaptation.md`). 2) À défaut, retirer la séance dont le retrait laisse le moins de muscles prioritaires sous leur minimum, puis sous leur zone (égalité : la dernière de la semaine). 3) Recompter (VOL-1) et redistribuer, muscle par muscle, dans l'ordre de protection : `quadriceps`, `fessiers`, `ischio_jambiers`, `pectoraux`, `dorsaux`, `haut_du_dos`, puis `deltoides_lateraux`, `triceps`, `biceps`, puis les complémentaires ciblés. Pour chaque muscle, d'abord la fréquence : en `FREQUENCE_INSUFFISANTE`, ajouter dans la séance restante la plus courte qui ne le travaille pas encore le premier slot de ce muscle (groupe MAP-6) de la séance retirée, à 2 séries, puis recompter. Ensuite le volume : sous sa zone, +1 série sur le slot d'assistance de ce muscle qui a le moins de séries, au plus 5 séries par slot, sans dépasser VOL-5 ni la durée du créneau, et recompter. 4) Ce qui ne rentre pas est perdu ; un muscle prioritaire qui reste sous son minimum lève `VOLUME_SOUS_MINIMUM` (aiiron le dit). | Ordre de protection : grands groupes d'abord, choix de conception (heuristique à valider). Redistribution plutôt que suppression : à volume égal la fréquence compte peu (Pelland 2026), c'est le volume qu'on protège |
| VOL-8 | **Double progression** (méthode `double_progression` des modèles). Fourchette du slot : bas = reps de la ligne, haut = min(bas + 2, 15) pour un principal, min(bas + 4, 15) pour une assistance. Chaque séance : viser +1 rep sur au moins une série au RPE prescrit. Toutes les séries au haut de la fourchette avec RPE réalisé ≤ RPE prescrit → charge augmentée du plus petit incrément du matériel à la séance suivante (arrondi du moteur force), reps ramenées au bas. RPE prescrit : RPE de la ligne en semaine 1, +0,5 par semaine de charge, plafonné par niveau et par rôle (champ `progression.rpe.plafond` du modèle). Reps sous le bas de la fourchette ou RPE réalisé ≥ RPE prescrit + 1 : charge maintenue (ou baissée par `ajusterSeance`). 3 séances de suite sans progrès sur un slot : drapeau `STAGNATION_SLOT` (proposer une alternative). | Progression par reps aussi efficace que par charge pour l'hypertrophie (Plotkin 2022, ECR, niveau B). Proximité de l'échec : Robinson 2024, Refalo 2023 ; RIR 2–3 conseillé par l'ACSM 2026. Écarts +2 / +4, +0,5 par semaine, plafonds, 3 séances : heuristiques à valider |
| VOL-9 | **Volume d'un bloc à l'autre.** À la fin d'un bloc (avant le deload), si au moins 80 % des séances prévues ont été faites et que le deload n'a pas été déclenché par la fatigue ou la régression (`force/deload.md` R1) : +1 série par semaine sur au plus 2 muscles prioritaires, ceux que l'utilisateur veut prioriser, sinon les plus bas dans leur zone (égalité : ordre de `muscles` du mapping). La série va au slot d'assistance de ce muscle qui en a le moins (égalité : le plus tôt dans la semaine). Jamais au-delà de la zone haute ni de VOL-5. Deload déclenché par la fatigue ou la régression : volume du bloc suivant inchangé ; `FATIGUE_PERSISTANTE_APRES_DELOAD` : retour à la zone basse pour tous les muscles. | Maintenir son volume habituel suffit souvent à progresser chez des entraînés (Barsuhn 2024, ECR) ; un volume individualisé fait mieux qu'un volume standard (Scarpelli 2022). +1 série, 2 muscles, 80 % : heuristiques à valider |
| VOL-10 | **Ajouter une séance** (plus de créneaux que le modèle). 1) Choisir le modèle à N + 1 séances de même niveau. 2) À défaut, garder le modèle : le volume ne monte pas parce qu'un créneau est libre (à volume égal la fréquence change peu l'hypertrophie). Le créneau libre reste disponible pour une autre discipline ou une routine de mobilité (`mobilite-modules`, routine autonome). | Pelland 2026. Usage du créneau libre : choix produit, à valider par Pierrot |
| VOL-11 | **Ordre de retrait des séries pour tenir dans le créneau** (après la version courte de l'échauffement et du retour au calme, jamais avant). Une série à la fois, en recomptant après chaque retrait : 1) slot dont le groupe est un muscle au-dessus de sa zone haute ou de son maximum (plus gros excédent d'abord) ; 2) slots d'assistance dont le groupe est un muscle complémentaire ou suivi non ciblé ; 3) slots d'assistance dont le muscle prioritaire reste ≥ zone basse après retrait ; 4) slots d'assistance, en gardant ≥ 2 séries par slot et chaque muscle prioritaire ≥ son minimum ; 5) slots principaux, jusqu'à 2 séries. Dans chaque étape : du dernier slot de la séance vers le premier, une série par slot et par tour. Si ça ne suffit pas : `CRENEAU_TROP_COURT`, proposer un autre modèle. Jamais retirés : séries d'approche, paliers (ECH-M5). Chaque muscle prioritaire qui passe sous sa zone lève `VOLUME_SOUS_ZONE` (expliqué en une phrase). | Ordre : choix de conception (heuristique à valider) ; protège d'abord les mouvements principaux, comme `role` du README. ECH-M5 : `echauffement/echauffement-musculation.md` |
| VOL-12 | **Durée estimée d'une séance de musculation** (convention du README, appliquée à la musculation, en secondes, total arrondi à la minute supérieure) : échauffement `echauffement-musculation` 540 (standard) ou 300 (courte), hors séries d'approche ; séries d'approche, sur le premier exercice de chaque groupe (MAP-6, dans l'ordre de la séance) sauf exercice au poids du corps : règle courte M2 si I < 0,80 (7 à 12 reps : 198 ; 1 à 6 : 182 ; 13 et plus : 122, formule R6 de `force/paliers-montee-en-charge.md`), paliers du README si I ≥ 0,80 ; séries de travail Σ séries × (reps × 4 + `repos_s`) ; retour au calme 480 ou 180. Plancher : échauffement court + approche des principaux + principaux à 2 séries + retour au calme court. | Convention du README (expert-force) ; durées M2 calculées avec R6 (validée par Pierrot le 25/11/2026). À intégrer au README par l'orchestrateur |

### Tableau VOL-3 (séries fractionnaires par semaine et par muscle)

| Niveau | Minimum efficace | Zone visée | Maximum prudent | Plafond par séance (VOL-5) |
| --- | --- | --- | --- | --- |
| débutant | 4 | 6 à 10 | 12 | 8 |
| intermédiaire | 6 | 10 à 16 | 20 | 10 |
| avancé | 8 | 12 à 20 | 24 | 10 |

Sous le minimum : `VOLUME_SOUS_MINIMUM`. Entre le minimum et la zone : `VOLUME_SOUS_ZONE` (accepté, expliqué). Au-dessus du maximum : `VOLUME_EXCESSIF`, retrait selon VOL-11 étape 1. Un modèle démarre dans la zone, plutôt dans sa partie basse ; VOL-9 le fait monter de bloc en bloc.

Niveau par défaut si le profil ne le précise pas : débutant moins d'un an de musculation régulière, intermédiaire de un à trois ans, avancé au-delà avec une progression devenue lente (heuristique à valider, choix produit).

## Limites et contre-indications

- Les bornes sont des moyennes de groupes jeunes et en bonne santé ; la réponse individuelle varie beaucoup. Elles ne s'appliquent pas telles quelles à une reprise après blessure, à une grossesse, à un adolescent (aiiron ne sert que les 18 ans et plus) ni à une personne âgée fragile.
- Douleur, gêne articulaire ou fatigue anormale : on ne compense pas en ajoutant des séries, on arrête de prescrire sur ce point et on oriente (`expert-sante-physique`).
- Aucune promesse de résultat chiffré (« tant de kilos de muscle en tant de semaines »).
- Question de poids, d'apparence ou d'alimentation restrictive qui inquiète : renvoi vers `expert-nutrition` et `expert-sante-mentale` via l'orchestrateur.
- Le comptage dépend du mapping v3 : les limites de VOL-6 (rowings sans dorsaux, `0585`, agrégat deltoïdes) faussent certains totaux ; à corriger dans le mapping, pas ici.
- La musculation à la maison ou en salle basique n'a pas encore de modèle : le dataset manque d'exercices à élastique et au poids du corps bien classés.

## Exemples (cas de test chiffrés)

Tous les chiffres : `compterVolume`, poids réels. « Prio » = muscles prioritaires de VOL-2.

**T-VOL-1. Modèle débutant 3 séances** (`hypertrophie-3j-full-body-debutant`). Attendu : quadriceps 8, ischio-jambiers 7, fessiers 9,5, adducteurs 4, mollets 2, pectoraux 6, deltoïdes antérieurs 4,5, deltoïdes latéraux 6,5, triceps 6,5, dorsaux 6, haut du dos 7, trapèzes 2,5, deltoïdes postérieurs 1, biceps 6, avant-bras 6, lombaires 1,5 ; agrégat deltoides 1,5 ; core 1,5. Prio toutes dans 6 à 10 ; fréquence ≥ 2 pour toutes (triceps : 1,5 + 1,5 + 3,5) ; plafond 8 respecté (max : fessiers 5 en séance B). Aucun drapeau.

**T-VOL-2. Modèle haut / bas 4 séances, intermédiaire.** Attendu : quadriceps 11, ischio-jambiers 13,5, fessiers 12,5, adducteurs 4, mollets 6, pectoraux 10, deltoïdes antérieurs 4,5, deltoïdes latéraux 11,5, triceps 10,5, dorsaux 10, haut du dos 10,5, trapèzes 5, deltoïdes postérieurs 3,5, biceps 10,5, avant-bras 5,5, abdominaux 3, obliques 1,5, lombaires 3 ; deltoides 6 ; core 1,5. Prio toutes dans 10 à 16. Aucun drapeau.

**T-VOL-3. Modèle 5 séances, intermédiaire et avancé.** Attendu : quadriceps 12, ischio-jambiers 13,5, fessiers 13,5, adducteurs 4,5, mollets 6, fléchisseurs de hanche 1,5, pectoraux 12, deltoïdes antérieurs 4,5, deltoïdes latéraux 12,5, triceps 12,5, dorsaux 12, haut du dos 12, trapèzes 7, deltoïdes postérieurs 4,5, biceps 12,5, avant-bras 10, abdominaux 6, obliques 1,5, lombaires 3 ; deltoides 7 ; core 1,5. Prio toutes dans 12 à 20 (donc aussi dans 10 à 16). Plafond 10 : séance tirage, biceps 9,5 et dorsaux 9, sous le plafond. Aucun drapeau.

**T-VOL-4. Composés dans une séance** (VOL-6), intermédiaire : `0043` × 4, `0085` × 3, `0585` × 3. Attendu : quadriceps 7, fessiers 7, ischio-jambiers 4,5 (3 + 1,5 venant du leg extension), adducteurs 2, lombaires 1,5 ; core 2 à part. Plafond 10 respecté. Poids 1 (mode test) : quadriceps 7, fessiers 7, ischio-jambiers 6, adducteurs 4, lombaires 3, core 4.

**T-VOL-5. Plafond par séance** (VOL-5), intermédiaire : `0025` × 5, `0314` × 4, `0289` × 3. Pectoraux 12 > 10 → `VOLUME_SEANCE_ELEVE`. Correction : `0289` passe de 3 à 1 série. Après : pectoraux 10, triceps 5 (2,5 + 2 + 0,5), deltoïdes antérieurs 2,5, deltoides 2,5. Les 2 séries retirées vont dans une autre séance si la semaine passe sous 10 en pectoraux.

**T-VOL-6. Retirer une séance** (VOL-7) : modèle 4 séances intermédiaire, l'utilisateur n'a que 3 créneaux, aucun modèle intermédiaire à 3 séances. Retrait de `bas_B` : aucun muscle prioritaire sous son minimum, alors que retirer `bas_A` ferait passer les quadriceps à 5, `haut_A` les pectoraux à 4 et `haut_B` les dorsaux à 4. Recompte : quadriceps 6, fessiers 6, ischio-jambiers 7,5, triceps 8,5, deltoïdes latéraux 9,5, mollets 4,5, abdominaux 0, adducteurs 1,5, lombaires 1,5, avant-bras 4,5, trapèzes 4 ; le reste inchangé. Drapeaux attendus avant redistribution : `VOLUME_SOUS_ZONE` sur quadriceps, fessiers, ischio-jambiers, triceps, deltoïdes latéraux ; `FREQUENCE_INSUFFISANTE` sur quadriceps, fessiers, ischio-jambiers (seule `bas_A` les travaille). Étape 3, fréquence : `0739` × 2 (premier slot de quadriceps de `bas_B`) ajouté à `haut_B` (la plus courte des séances qui ne travaillent pas les quadriceps, 82 min contre 84) ; recompte : quadriceps 8 (fréquence réglée), fessiers 7 (1 série dans `haut_B`, sous 1,5 : toujours `FREQUENCE_INSUFFISANTE`), adducteurs 2,5. Le test s'arrête à ce recompte ; la suite (volume des quadriceps, puis fessiers, ischio-jambiers…) dépend de la durée du créneau et se teste avec le moteur d'assemblage.

**T-VOL-7. Ordre de retrait pour le créneau** (VOL-11) : séance `haut_A` du modèle 4 séances, 4 séries à retirer. Étapes 1 et 2 : rien (aucun excédent, aucun slot complémentaire). Étape 3 : `0194` refusé (triceps 10,5 → 9,5 < 10) ; `0334` 4 → 3 (latéraux 11,5 → 10,5) ; plus rien d'autre ne reste ≥ 10. Étape 4, tour depuis la fin : `0194` déjà à 2, sauté ; `0334` 3 → 2 ; `0861` 4 → 3 ; `0314` 3 → 2. Séance obtenue : `0025` 3, `0150` 4, `0314` 2, `0861` 3, `0334` 2, `0194` 2 (16 séries). Semaine : deltoïdes latéraux 9,5, haut du dos 9,5, pectoraux 9, biceps 10, triceps 10, trapèzes 4, avant-bras 5, deltoides 5,5. `VOLUME_SOUS_ZONE` sur deltoïdes latéraux, haut du dos, pectoraux ; aucun sous le minimum.

**T-VOL-8. Agrégat deltoïde** (VOL-1, VOL-6) : `0405` × 3 seul. Attendu : deltoides 3 (agrégat, `TETE_DELTOIDE_NON_PRECISEE`), triceps 1,5, haut du dos 1,5 ; deltoïdes latéraux 0 et antérieurs 0. Une semaine qui n'aurait que cet exercice pour les épaules lève `VOLUME_SOUS_MINIMUM` en deltoïdes latéraux : l'agrégat n'est jamais imputé aux têtes.

**T-VOL-9. Volume d'un bloc à l'autre** (VOL-9) : modèle 4 séances intermédiaire, bloc terminé, 95 % des séances faites, deload planifié (pas de fatigue), aucune priorité déclarée. Les plus bas dans leur zone : pectoraux 10 et dorsaux 10 (ordre du mapping : pectoraux puis dorsaux). Pectoraux : slot d'assistance le moins chargé `0314` (3, `haut_A`) → 4. Dorsaux : `0150` de `haut_B` (3, jour 4, avant `0238`) → 4. Semaine suivante : pectoraux 11, triceps 11, deltoides 6,5, dorsaux 11, haut du dos 11, deltoïdes postérieurs 4, biceps 11. Plafonds par séance respectés (`haut_A` pectoraux 7 ; `haut_B` dorsaux 7).

**T-VOL-10. Durée** (VOL-12) : séance A du modèle débutant. Échauffement 540 ; approche sur `0739`, `0025`, `0198`, `0861`, `0599`, `0334` (6 groupes, 7 à 12 reps, I < 0,80) : 6 × 198 = 1 188 ; travail : 3 × (40 + 120) + 3 × (32 + 150) + 2 × (40 + 90) + 2 × (40 + 90) + 2 × (40 + 75) + 3 × (48 + 60) = 2 100 ; retour au calme 480. Total 4 308 s → **72 min**. Plancher : 300 + 2 × 198 + 2 × 160 + 2 × 182 + 180 = 1 560 s → 26 min (séance B : 27 min, plancher du modèle).
