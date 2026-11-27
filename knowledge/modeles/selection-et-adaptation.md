---
id: modeles-selection-et-adaptation
domaine: force
titre: Choisir le modèle le plus proche d'une semaine type et l'adapter
niveau_preuve: E
sources:
  - titre: "American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews (Med Sci Sports Exerc 58(4):851-872)"
    auteurs: "Currier BS, D'Souza AC, Fiatarone Singh MA et al."
    annee: 2026
    url: "https://doi.org/10.1249/MSS.0000000000003897"
  - titre: "American College of Sports Medicine position stand. Progression models in resistance training for healthy adults (Med Sci Sports Exerc 41(3):687-708)"
    auteurs: "Ratamess NA, Alvar BA, Evetoch TK et al."
    annee: 2009
    url: "https://pubmed.ncbi.nlm.nih.gov/19204579/"
  - titre: "Effect of Resistance Training Frequency on Gains in Muscular Strength: A Systematic Review and Meta-Analysis (Sports Med 48(5):1207-1220)"
    auteurs: "Grgic J, Schoenfeld BJ, Davies TB, Lazinica B, Krieger JW, Pedisic Z"
    annee: 2018
    url: "https://pubmed.ncbi.nlm.nih.gov/29470825/"
  - titre: "The minimum effective training dose required to increase 1RM strength in resistance-trained men: a systematic review and meta-analysis (Sports Med 50(4):751-765)"
    auteurs: "Androulakis-Korakakis P, Fisher JP, Steele J"
    annee: 2020
    url: "https://doi.org/10.1007/s40279-019-01236-0"
  - titre: "The Minimum Effective Training Dose Required for 1RM Strength in Powerlifters (Front Sports Act Living 3:713655)"
    auteurs: "Androulakis-Korakakis P, Michalopoulos N, Fisher JP et al."
    annee: 2021
    url: "https://doi.org/10.3389/fspor.2021.713655"
  - titre: "No Time to Lift? Designing Time-Efficient Training Programs for Strength and Hypertrophy: A Narrative Review (Sports Med 51(10):2079-2095)"
    auteurs: "Iversen VM, Norum M, Schoenfeld BJ, Fimland MS"
    annee: 2021
    url: "https://doi.org/10.1007/s40279-021-01490-1"
  - titre: "Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men (JSCR 30(7):1805-1812)"
    auteurs: "Schoenfeld BJ, Pope ZK, Benik FM et al."
    annee: 2016
    url: "https://pubmed.ncbi.nlm.nih.gov/26605807/"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-27
---

# Sélection et adaptation des modèles

## Principe

L'utilisateur donne sa semaine type (créneaux, durée, lieu, matériel) et ses contraintes (objectif, niveau, restrictions). Le moteur ne fabrique pas un programme : il prend le modèle écrit par un expert qui demande le moins de changements, puis applique des règles fixes pour l'ajuster. Chaque modèle candidat est **adapté d'abord, noté ensuite** : la note compte ce que l'adaptation a dû retirer ou remplacer. Le moins abîmé gagne. Les règles d'adaptation suivent deux priorités publiques : les mouvements de force passent en premier dans la séance et gardent quelques séries lourdes (ACSM 2026 : charges ≥ 80 %, 2 à 3 séries par exercice, au moins 2 séances par semaine ; Androulakis-Korakakis 2020 et 2021 : une petite dose de séries lourdes par mouvement maintient et fait progresser le 1RM), et l'assistance se coupe avant eux (Iversen 2021). Les poids de la note sont des choix produit, sans source.

Format des modèles et convention de durée : `knowledge/modeles/README.md`. Bornes de volume par muscle : `knowledge/hypertrophie/volume-cibles.md` (expert-hypertrophie).

## Règles pour aiiron

### S0 — Entrées

| Entrée | Source | Absente |
| --- | --- | --- |
| `objectif` | profil | `incomplet`, `still_to_ask` (architecture §4.4) |
| `niveau` | profil | `incomplet` |
| `creneaux` : jour, durée (min), lieu | profil | `incomplet` |
| matériel par lieu (jetons du README) | profil `equipements` | `incomplet` (pas de matériel par défaut, `docs/contexte.md`) |
| `restrictions` actives : zones (jetons) et exercices | profil | aucune |
| `exercices_exclus` (préférence, pas douleur) | profil | aucun |

Définitions :
- **mouvement(id_moteur_force)** : l'identifiant lui-même s'il est `squat`, `developpe_couche`, `souleve_de_terre` ou `developpe_militaire` ; sinon on remonte la chaîne de bases de `variantes.ts` jusqu'au premier de ces quatre (`couche_prise_serree` → `developpe_couche`, `squat_avant` → `squat`, `developpe_militaire_assis` → `developpe_militaire`). `id_moteur_force` `null` → mouvement `null`.
- **Mouvement de base** : slot dont `id_moteur_force` est l'un des quatre (pas une variante).
- **Créneau utile pour un modèle** : durée ≥ `duree_seance_min.min` **et** `materiel_requis` ⊆ matériel du lieu du créneau. Un créneau non utile n'est pas un créneau manqué : il reste à la mobilité (adaptation `CRENEAU_TROP_COURT` ou `CRENEAU_SANS_MATERIEL`). N = nombre de créneaux utiles.

### S1 — Éliminatoire (le modèle n'est pas candidat)

| Code | Condition |
| --- | --- |
| E1 domaine | `force_generale` et `powerlifting` → modèles `force` ; `hypertrophie` → modèles `hypertrophie` |
| E2 niveau | niveau absent de `selection.niveaux`, hors repli permis : `avance` → modèle qui contient `intermediaire` ; `intermediaire` → modèle qui contient `debutant`. Jamais de repli vers le haut : un débutant n'a jamais un modèle sans `debutant` |
| E3 matériel | N = 0 (aucun créneau n'a le matériel requis) |
| E4 séances | après S2, N < S' − 1 (S' = séances restantes), ou S' < 2 |
| E5 restrictions | plus de la moitié (strictement) des slots principaux de la semaine retirés par S2 |

E2 et E4 : ACSM 2009 recommande 2 à 3 séances par semaine au débutant, 3 à 4 à l'intermédiaire, 4 à 5 à l'avancé ; un débutant n'est jamais poussé au-delà de son modèle. E5 : heuristique de coach (au-delà, ce n'est plus le même programme ; aiiron le dit et oriente).

### S2 — Adaptations dans l'ordre (déterministes)

Pour chaque modèle non éliminé par E1 à E3, dans cet ordre :

**A1 — Slots : matériel, exclusions, restrictions.** Un slot est touché si :
- matériel : `exercices_utilises[exercice].materiel` ⊄ matériel du lieu de la séance ;
- exclusion : `exercice` ou `id_moteur_force` dans `exercices_exclus` (identifiant exact, sans extension aux variantes) ;
- restriction douleur : `exercice` restreint, ou mouvement(`id_moteur_force`) = mouvement d'un exercice restreint, ou `zones` ∩ zones restreintes ≠ ∅.

Slot touché → première alternative de la liste qui : a son matériel, n'est ni exclue ni restreinte, n'a aucune zone restreinte, et, si la restriction porte sur un exercice, n'a pas le même mouvement (une variante d'un mouvement douloureux n'est pas une alternative : pas de contournement). L'alternative garde `role`, `lignes`, `repos_s`, `remise_contexte` ; son `id_moteur_force` vient de `exercices_utilises` (`null` → séance d'étalonnage, `force-e1rm` R8). Aucune alternative → slot retiré. On n'ajoute jamais un exercice absent de la liste.

**A2 — Séance sans slot principal** après A1 → séance retirée (son assistance seule ne fait pas une séance de force).

**A3 — Un créneau de moins** (N = S' − 1) : retirer une séance. Pour chaque séance, `uniques` = nombre de ses slots principaux dont le mouvement (non `null`) n'est principal dans aucune autre séance restante. On retire la séance qui a, dans l'ordre : le moins d'`uniques` ; puis le moins de slots principaux de mouvement de base ; puis la dernière dans l'ordre du modèle. Si un mouvement passe sous 2 expositions par semaine : drapeau `FREQUENCE_REDUITE` (Grgic 2018 : la fréquence aide surtout parce qu'elle apporte du volume ; ACSM 2026 : au moins 2 séances par semaine). Les slots de la séance retirée ne sont pas déplacés (choix prudent : pas de séance rallongée sans contrôle).

**A4 — Créneaux en trop** (N > S') : on garde S' créneaux et les autres restent libres (`CRENEAU_LIBRE`, routine de mobilité proposée, skill `seance-complete`). Jamais de séance de force ajoutée. Choix des S' créneaux, dans l'ordre : la plus courte suite de jours consécutifs la plus longue ; puis le moins de paires de jours consécutifs ; puis la plus grande durée totale ; puis les jours les plus tôt dans la semaine (comparaison jour par jour).

**A5 — Placement.** Créneaux retenus en ordre chronologique (lundi → dimanche). Les séances gardent l'ordre du modèle, de façon circulaire (A, B, C ; B, C, A ; C, A, B). On prend la rotation qui donne le moins de points A6 ; égalité → sans rotation.

**A6 — Durée trop longue pour le créneau (P5).** Durée calculée par la convention du README (sélection, sans e1RM), puis à l'assemblage avec les paliers réels. On s'arrête dès que la durée ≤ durée du créneau × 60 s :

| Étape | Action | Points |
| --- | --- | --- |
| 1 | Version courte : échauffement 600 → 360 s, retour au calme 480 → 180 s. Paliers et ECH-F5 inchangés | 1 par séance |
| 2 | Repos des slots d'assistance ramenés à 60 s au plus (jamais ceux des principaux) | 1 par séance si un repos change |
| 3 | Assistance, du dernier slot au premier : retirer une série à la fois (dernière ligne d'abord) jusqu'à 2 séries par slot | 1 par série |
| 4 | Assistance, du dernier slot au premier : retirer le slot entier (séries et paliers) | 1 par série retirée |
| 5 | Principaux, du dernier slot au premier : retirer une série à la fois (dernière ligne d'abord) jusqu'à 2 séries de travail par slot ; la première ligne (top set) n'est jamais retirée | 3 par série |
| 6 | Retirer le dernier slot principal de la séance (séries, paliers, ECH-F5) s'il n'est pas le seul de la séance et que son mouvement est principal dans une autre séance | 10 |
| 7 | Toujours trop long : `CRENEAU_INSUFFISANT`, séance gardée en l'état ; aiiron propose un créneau plus long ou un modèle à plus de séances | 30 |

Sources : version courte d'abord et paliers jamais réduits (skill `seance-complete`, décision du 24/11/2026) ; repos des principaux gardés (Schoenfeld 2016 : 3 min font mieux qu'1 min pour la force) ; repos de l'assistance réductibles (ACSM 2026 : pas de différence de force entre repos courts et longs dans l'ensemble des revues ; Iversen 2021) ; assistance coupée avant les mouvements principaux et plancher de 2 séries lourdes (ACSM 2026 ; Androulakis-Korakakis 2021 : de 3 à 6 séries lourdes par mouvement et par semaine suffisent à progresser chez des powerlifters). Ordre exact, seuil de 2 séries et points : heuristiques de coach à valider.

**A7 — Niveau.** `plafond_rpe` et `planifie_apres_semaines_de_charge` du niveau de l'utilisateur, même en repli (les modèles force ont les trois niveaux). Débutant : aucune hausse de charge en séance (`force-ajustement-rpe` R7). Pas d'e1RM : séance d'étalonnage, échelle de paliers « Lourd » (`force-paliers-montee-en-charge` R2.4).

### S3 — Note et tri

Note = somme des points (plus bas = meilleur) :

| Cause | Points |
| --- | --- |
| Séance retirée (A2 ou A3) | 30 chacune |
| Créneau utile laissé libre (A4) | 10 chacun |
| Repli de niveau (E2) | 25 |
| Objectif absent de `selection.objectifs` (même domaine) | 15 |
| Slot remplacé pour le matériel | 5 |
| Slot remplacé pour une restriction ou une exclusion | 10 |
| Slot principal retiré (A1) | 20 |
| Slot d'assistance retiré (A1) | 10 |
| Ajustement au créneau (A6) | points du tableau A6 |

Tous les points comptent, même ceux d'une séance retirée ensuite. Égalité : (1) le modèle où N = S ; (2) le moins de slots remplacés ou retirés ; (3) l'`id` le plus petit (ordre alphabétique). Aucun modèle candidat → statut `aucun_modele` : aiiron dit ce qui bloque (matériel, créneaux, restrictions) sans inventer de séance. Poids et ordre de tri : choix produit, aucune source, à valider par Pierrot.

### S4 — Explication à l'utilisateur (une ou deux phrases)

Gabarit : `{raison_choix du modèle}` + au plus une phrase pour l'adaptation la plus importante, dans cet ordre de priorité : restriction > séance retirée > créneau insuffisant > remplacement matériel > séance raccourcie > créneau libre. Les autres adaptations restent dans `adaptations` et ne sont dites que si on les demande.

| Code | Phrase (complétée par le code, noms tirés de `exercices_utilises.nom` et `seances[].titre`) |
| --- | --- |
| `RESTRICTION_REMPLACE` | « Comme ta {zone} te gêne, j'ai mis {alternative} à la place de {exercice} ; si ça tire ou fait mal, tu arrêtes et tu en parles à un professionnel de santé. » |
| `RESTRICTION_RETIRE` | « Tant que ta {zone} te gêne, j'ai retiré {exercice} ; si ça persiste, montre-la à un professionnel de santé. » |
| `SEANCE_RETIREE` | « Avec une séance de moins que le modèle, j'ai retiré la séance {titre} et gardé tes mouvements principaux sur les autres jours. » |
| `CRENEAU_INSUFFISANT` | « Le {jour}, même raccourcie, la séance déborde un peu : si tu peux, garde-toi quelques minutes de plus. » |
| `REMPLACE_MATERIEL` | « Sans {matériel}, tu feras {alternative} à la place de {exercice}. » |
| `SEANCE_RACCOURCIE` | « Le {jour}, je raccourcis l'échauffement et l'assistance pour tenir dans ton créneau, la montée en charge reste complète. » |
| `CRENEAU_LIBRE` | « Ton {jour} reste libre : une courte routine de mobilité suffit si tu as envie de bouger. » |
| `CRENEAU_TROP_COURT` | « Le {jour} est trop court pour une séance de force complète, je te propose plutôt de la mobilité. » |
| `REPLI_NIVEAU` | « Ce modèle vise un niveau proche du tien, j'ai réglé la progression pour toi. » |

Règles : aucun chiffre qui ne vienne pas du résultat de l'outil ; aucune étiquette de diagnostic, la zone seulement ; toute adaptation pour douleur contient l'orientation vers un professionnel ; tutoiement ; dans les 60 mots du persona.

### S5 — Points de contradiction possibles avec `hypertrophie/volume-cibles.md`

1. **Ordre de coupe A6** : la force coupe l'assistance avant les séries des principaux. Pour un objectif hypertrophie, l'ordre inverse peut se défendre (garder l'isolation d'un muscle en retard). Proposition : l'ordre A6 vaut pour le domaine `force` ; un modèle hypertrophie déclare le sien.
2. **Bornes basses de volume** : les modèles force visent peu de séries pour certains muscles (ex. quadriceps 6 séries en `force-3j-corps-entier`, sous les 10 séries par semaine d'ACSM 2026 pour l'hypertrophie). Si les bornes de `volume-cibles.md` s'appliquent à tout programme, conflit. Proposition : bornes appliquées à l'objectif `hypertrophie` seulement ; en force, drapeau informatif `VOLUME_SOUS_CIBLE`, jamais d'ajout automatique de séries.
3. **Deload** : une semaine de deload divise les séries par deux ; elle doit être exemptée des bornes basses.
4. **Restriction** : A1 retire sans compenser ; une règle hypertrophie qui « complète le volume manquant » ajouterait des exercices non écrits par l'expert. À trancher par l'orchestrateur.
5. **Agrégat `deltoides`** : `1457`, `0405`, `0383` n'ont pas de tête précisée (drapeau `TETE_DELTOIDE_NON_PRECISEE`) : leurs séries ne comptent ni en antérieurs ni en postérieurs.

## Limites et contre-indications

- La sélection ne sait rien de la santé : douleur, symptôme ou drapeau rouge → les garde-fous de l'architecture (§5.2) passent avant ; A1 se contente de ne plus prescrire. Aucune alternative n'est présentée comme un traitement.
- Zones : la conversion d'une zone dite en jeton (`genou`…) n'existe pas encore ; zone non convertible = A1 ne voit pas la restriction, seul le prompt l'applique (comportement actuel).
- Durées de sélection estimées sans e1RM (convention du README) ; à l'assemblage, paliers réels, et A6 refait une fois.
- Pas encore de modèle force sans barre (haltères seuls, maison) : un tel utilisateur obtient `aucun_modele` en force.

## Exemples (cas de test)

Matériel « complet » = `barre`, `disques`, `rack`, `banc`, `banc_inclinable`, `banc_lombaires`, `halteres`, `poulie`, `machines`, `presse`, `barre_traction`, `elastique`. Durées standard (s) par la convention du README : M1 `force-3j-corps-entier` A 4414, B 4040, C 4214 ; M2 `force-4j-haut-bas` J1 4060, J2 4570, J4 3864, J5 4082 ; M3 `force-5j-powerlifting` J1 4406, J2 4304, J3 4174, J5 4186, J6 4168. Plancher de chaque modèle : 42 min.

**T-M1 — cas nominal débutant.** Débutant, `force_generale`, lun/mer/ven 75 min, salle complète. M2, M3 : E2. M1 : N = S = 3, toutes les séances ≤ 4500 s. **M1, note 0** ; A lun, B mer, C ven, version standard, aucune adaptation.

**T-M2 — cas nominal intermédiaire.** Intermédiaire, `powerlifting`, lun/mar/jeu/ven 80 min, complet. M2 : 0 (J2 4570 ≤ 4800). M1 : 10 (un créneau libre). M3 : 30 (séance retirée). **M2, note 0** ; J1 lun, J2 mar, J4 jeu, J5 ven.

**T-M3 — objectif et créneau en trop.** Intermédiaire, `force_generale`, lun à ven 75 min, complet. M3 : 15 (objectif). M1 : 20 (deux créneaux libres). M2 : un créneau libre (10) ; A4 garde lun, mar, jeu, ven (suite la plus longue de 2 jours, contre 3 pour les autres choix) ; J2 4570 > 4500 → étape 1 : 4030 (1 point). **M2, note 11**. Adaptations : `CRENEAU_LIBRE` mer, `SEANCE_RACCOURCIE` mar.

**T-M4 — repli de niveau.** Avancé, `powerlifting`, lun/mer/ven 90 min, complet. M3 : E4 (3 < 5 − 1). M2 : A3 retire J5 (`uniques` J1 0, J2 1, J4 1, J5 0 ; mouvements de base J1 1, J5 0) → 30. M1 : repli 25. **M1, note 25** ; plafond RPE avancé 9, deload après 4 semaines de charge. Adaptation : `REPLI_NIVEAU`.

**T-M5 — créneaux courts.** Intermédiaire, `powerlifting`, lun/mar/jeu/ven 50 min (3000 s), complet.
- M2 (N = S) : J1 4060 → 3520 (é.1) → 3250 (é.2 : roumain −180, leg curl −90) → é.3 : relevés 3→2 (3150), leg curl 3→2 (3050), roumain 3→2 (2966) : 5 points. J2 4570 → 4030 → 3790 (rowing −240) → é.3 rowing 4→2 (3606) → é.4 rowing retiré (3072) → é.5 militaire 3→2 (2868) : 1 + 1 + 4 + 3 = 9. J4 3864 → 3324 → é.2 rien → é.3 dead bug 3→2 (3224) → é.4 dead bug retiré (3024) → é.5 squat pause 3→2 (2828) : 1 + 3 + 3 = 7. J5 4082 → 3542 → 3212 (tractions −240, développé haltères −90) → é.3 oiseau 3→2 (3104), développé haltères 3→2 (3004), tractions 4→3 (2920) : 5. Total **26**.
- M1 : 10 (créneau libre ; A4 garde lun, mar, jeu) + A 7 (3874 → 3694 → rowing 3→2 3602 → dead bug retiré 3402 → rowing retiré 2868) + B 7 (3500 → 3320 → tractions 3→2 3236 → dead bug retiré 3036 → tractions retirées 2868) + C 5 (3674 → 3494 → roumain 3→2 3410 → roumain retiré 2892) = 29.
- M3 : ≥ 30 (J6 retirée). **M2, note 26.**

**T-M6 — matériel.** Intermédiaire, `force_generale`, lun/mer/ven 75 min ; salle de quartier : `barre`, `disques`, `rack`, `banc`, `halteres`, sans barre de traction, poulie ni machines. M1 : tractions `0652` → `0970` (barre de traction) non, `0198` (poulie) non, **`0499`** rowing inversé : 5. M2, M3 : E4 ou séance retirée (≥ 30). **M1, note 5**. B garde 4040 s (même lignes, poids du corps sans paliers). Volume : `dorsaux` 3 → 0, `haut_du_dos` 4,5 → 7,5 (`VOLUME_SOUS_CIBLE` possible). Adaptation : `REMPLACE_MATERIEL`.

**T-M7 — restriction de zone, épaule.** Intermédiaire, `powerlifting`, lun/mar/jeu/ven 80 min, complet, restriction zone `epaule`.
- M1 : couché A et C retirés (alternatives `0289`, `0662` touchent l'épaule), militaire B retiré (`0091`, `0426`, `0405` aussi), tractions → `0499` ; 3 principaux retirés sur 6 (pas plus de la moitié, E5 non) ; 20 × 3 + 10 + créneau libre 10 = **80**.
- M2 : J1 relevés → dead bug (10) ; J2 couché et militaire retirés (40), séance sans principal retirée (30) ; J5 couché pause retiré (20), tractions → `0499` (10), développé haltères retiré (10), séance retirée (30) ; deux créneaux libres (20) = 170.
- M3 : couché J1 et J3, militaire J2 retirés (60) ; J2 tractions et relevés remplacés (20) ; J6 prise serrée retiré (`0259` et `0289` touchent l'épaule, 20), développé haltères retiré (10), J6 sans principal retirée (30) ; S' = 4 = N = 140.
- **M1, note 80.** Message : `RESTRICTION_RETIRE` sur les développés, avec l'orientation.

**T-M8 — restriction d'exercice et de zone, squat et genou.** Intermédiaire, `powerlifting`, lun/mar/jeu/ven 80 min, complet ; restriction exercice `squat`, zone `genou`.
- M1 : squat A retiré (`0042` même mouvement, `0739` et `1760` touchent le genou), squat pause C retiré : 40 + créneau libre 10 = **50**.
- M2 : squat J1 retiré (20), leg curl → `0599` non (genou) → **`1459`** (10), J1 sans principal retirée (30), squat pause J4 retiré (20), créneau libre (10) = 90.
- M3 : squats J1, J5 et squat avant J3 retirés (60), leg curl J5 → `1459` (10) ; A3 retire J6 (`uniques` J2 1, autres 0 ; mouvements de base J5 0, J6 0 → la dernière) (30) = 100.
- **M1, note 50.**

**T-M9 — débutant, deux créneaux.** Débutant, `force_generale`, mar/jeu 60 min (3600 s), complet. M1 : A3 (`uniques` A 0, B 2, C 0 ; mouvements de base A 2, C 1) → C retirée (30). A 4414 → 3874 → 3694 (rowing −180) → rowing 3→2 : 3602 (> 3600 de 2 s) → dead bug retiré : 3402 : 5 points. B 4040 → 3500 : 1. **M1, note 36** ; A mar, B jeu ; `FREQUENCE_REDUITE` (squat, couché, soulevé, militaire une fois par semaine). Message : `SEANCE_RETIREE`.

**T-M10 — créneau trop court et rotation.** Intermédiaire, `force_generale`, lun 75, mer 35, ven 75, sam 60 min, complet. M1 : mer 35 < 42 → `CRENEAU_TROP_COURT`, N = 3. Rotations (lun, ven, sam) : A, B, C → C sur 3600 s : 3674 → 3494 = 2 points ; B, C, A → A sur 3600 s = 5 ; C, A, B → B sur 3600 s : 3500 = 1. **M1, note 1**, C lun, A ven, B sam. M2 : 30.

**T-M11 — exclusion de préférence.** Intermédiaire, `force_generale`, lun/mer/ven 75 min, complet, `exercices_exclus` = [`souleve_de_terre`]. M1 : B `0032` → `0085` (`sdt_roumain`, identifiant différent, permis) : 10. **M1, note 10** ; B fait 3 × 4 @ 7 de soulevé roumain, charge initialisée par `souleve_de_terre` × 0,70 si une référence existe, sinon étalonnage.

**T-M12 — débutant avec cinq créneaux.** Débutant, `force_generale`, lun à ven 60 min, complet. M1 seul candidat : deux créneaux libres (20) ; A4 garde lun, mer, ven (aucun jour consécutif) ; A 5, B 1, C 2. **M1, note 28.** Messages : `CRENEAU_LIBRE` mar et jeu.

**T-M13 — deload construit (intermédiaire, M1).** Semaine 6 = deload (5 semaines de charge). Semaine 5 (delta RPE +1,5, reps −1) : squat A 3 × 4 @ 8,5, couché A 3 × 4 @ 8,5, soulevé B 3 × 3 @ 8,5, militaire B 3 × 5 @ 8,5, squat pause C 3 × 3 @ 8,5, couché C 3 × 5 @ 8,5 ; assistance inchangée. `corrigerDeload` : squat A et couché A → 2 × 4 @ 6 (pct(4, 7) = 81,9 %, pct(4, 6,5) = 80,6 %, pct(4, 6) = 79,2 %) ; soulevé B et squat pause C → 2 × 4 @ 6 (3 reps : aucun RPE ≥ 6 sous 80 %) ; militaire B et couché C → 2 × 5 @ 7 (79,2 %) ; rowing 2 × 8 @ 7, tractions 2 × 6 @ 7, roumain 2 × 8 @ 7, dead bug 1 × 10 @ 7. `validerDeload` : 0 violation, aucun single, aucun RPE > 7. Débutant : même résultat en semaine 7 (semaine 6 identique à la semaine 5, plafond 8,5).

**T-M14 — explication.** Cas T-M7 : « Tu refais le squat, le développé couché et le soulevé de terre plusieurs fois par semaine sur des séances du corps entier, ce qui t'aide à apprendre les gestes et à progresser régulièrement. Tant que ton épaule te gêne, j'ai retiré les développés ; si ça persiste, montre-la à un professionnel de santé. » Aucun chiffre, aucun diagnostic, orientation présente.
