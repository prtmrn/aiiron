---
id: force-moteur
domaine: force
titre: Moteur force — index, conventions et ordre des opérations
niveau_preuve: E
sources:
  - titre: "Application of the Repetitions in Reserve-Based Rating of Perceived Exertion Scale for Resistance Training"
    auteurs: "Helms ER, Cronin J, Storey A, Zourdos MC"
    annee: 2016
    url: "https://openrepository.aut.ac.nz/items/92cefeac-7c32-44f1-bfbc-f48f4a5dd8cf/full"
  - titre: "RPE vs. Percentage 1RM Loading in Periodized Programs Matched for Sets and Repetitions"
    auteurs: "Helms ER, Byrnes RK, Cooke DM et al."
    annee: 2018
    url: "https://pubmed.ncbi.nlm.nih.gov/29628895/"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Moteur force — index

## Principe

Le moteur force transforme une prescription (exercice, répétitions, RPE) en charge concrète, à partir d'un e1RM (1RM estimé) tenu à jour séance après séance. Il ne stocke jamais une charge ou un % figé : tout est recalculé depuis l'e1RM courant, ce qui supprime l'erreur des % codés en dur. L'autorégulation par RPE est au moins aussi efficace que le % fixe et absorbe les variations du jour (Helms 2018). Le moteur est déterministe : mêmes entrées, mêmes sorties, aucune décision laissée au LLM.

## Fiches de la spécification

| Fiche | Sujet |
| --- | --- |
| `table-rpe.md` | Correspondance reps × RPE → % e1RM, inverse, domaine |
| `e1rm.md` | e1RM par série, série de référence, lissage, garde-fous, initialisation |
| `arrondi-charges.md` | Charges disponibles selon le matériel, règle d'arrondi |
| `variantes-discounts.md` | Coefficients de variante, remise de contexte, application uniforme |
| `ajustement-rpe.md` | Correction RPE réel vs prescrit (séries suivantes, séance suivante) |
| `deload.md` | Déclencheurs, contenu, plafonds, validation et correction |
| `paliers-montee-en-charge.md` | Séries d'échauffement spécifiques (paliers) |
| `cas-de-test.md` | Les 5 erreurs des Excel de Pierrot + cas supplémentaires |

## Règles pour aiiron (conventions communes)

1. **Unités** : kilogrammes uniquement. Les livres sont hors périmètre (validé par Pierrot le 25/11/2026).
2. **Précision** : aucun arrondi intermédiaire. e1RM et % restent en double précision. Seule la charge finale est arrondie, une seule fois, par `arrondirCharge` (voir `arrondi-charges.md`). Les affichages arrondissent à part (e1RM à 0,5 kg, % à 0,1 point) sans réinjecter la valeur affichée.
3. **Calcul d'arrondi en grammes entiers** pour éviter les erreurs de flottants (101,25 kg → 101 250 g).
4. **RPE** : nombre entre 1 et 10. Toute valeur saisie est ramenée au demi-point le plus proche, égalité vers le haut (8,25 → 8,5 ; 8,75 → 9). Le haut est le côté prudent : un RPE plus haut donne un e1RM plus bas.
5. **Reps** : entier ≥ 0. Domaine de prescription 1 à 15.
6. **Une seule fonction calcule une charge de travail** : `chargeCible(slot, reps, rpe, phase)`. Échauffements, top sets, back-offs, deload et paliers passent tous par elle. Interdiction de calculer une charge ailleurs.

## Ordre des opérations (normatif)

Pour chaque série de travail d'un exercice dans une séance :

1. **e1RM de l'exercice** : référence propre de l'exercice ; si elle n'existe pas encore, initialisation paresseuse = e1RM de la base × coefficient de variante (`variantes-discounts.md`).
2. **e1RM effectif du slot** = e1RM de l'exercice × remise de contexte du slot (1 par défaut).
3. **Prescription** : (reps, RPE). Si le modèle fournit un % au lieu d'un RPE, dériver le RPE (`table-rpe.md`, fonction inverse) et signaler.
4. **Plafonds de phase** : en deload, RPE ≤ 7 et % ≤ 80 % (`deload.md`).
5. **Charge brute** = e1RM effectif × pct(reps, RPE) [× plafond éventuel].
6. **Arrondi** au matériel disponible (`arrondi-charges.md`).
7. **Paliers** calculés depuis la charge arrondie de la première série lourde (`paliers-montee-en-charge.md`).
8. **Pendant la séance** : après chaque série loguée, ajustement des séries suivantes (`ajustement-rpe.md`), puis ré-arrondi.
9. **Après la séance** : mise à jour de la référence e1RM (`e1rm.md`).
10. **Chaque semaine** : évaluation des déclencheurs de deload (`deload.md`).

## Signatures suggérées (TypeScript, à ajuster par `developpeur`)

```ts
pct(reps: number, rpe: number): number                       // 0 < pct ≤ 1
rpeDepuisPct(pct: number, reps: number): number              // non arrondi
e1rmSerie(charge: number, reps: number, rpe: number): number | null
chargesDisponibles(materiel: Materiel): number[]             // kg, triées
arrondirCharge(cible: number, materiel: Materiel): { charge: number; drapeaux: Drapeau[] }
e1rmEffectif(slot: Slot, refs: References): number
chargeCible(slot: Slot, reps: number, rpe: number, phase: Phase): { charge: number; brute: number; drapeaux: Drapeau[] }
ajusterSeriesSuivantes(seriesFaites: SerieLoguee[], seriesPrevues: SeriePrevue[], ctx): SeriePrevue[]
mettreAJourReference(ref: Reference, seance: SerieLoguee[], ctx): { ref: Reference; drapeaux: Drapeau[] }
paliers(chargeTravail: number, e1rm: number | null, materiel: Materiel, ctx): Palier[]
evaluerDeload(historique: Historique): { deload: boolean; raisons: string[] }
validerDeload(semaine: Semaine, semaineRef: Semaine | null, refs): Violation[]
corrigerDeload(semaine: Semaine, semaineRef: Semaine | null, refs): { semaine: Semaine; changements: string[] }
```

## Codes de drapeaux (liste fermée)

| Code | Sens |
| --- | --- |
| `HORS_DOMAINE` | reps ou RPE hors du domaine de la table : pas de charge |
| `RPE_INVALIDE` | RPE non numérique ou hors [1, 10] : traité comme absent |
| `RPE_MANQUANT` | série sans RPE |
| `RPE_TROP_BAS_POUR_E1RM` | RPE < 7 : série non utilisée pour l'e1RM |
| `SERIE_TROP_LONGUE` | reps > 10 : série non utilisée pour l'e1RM |
| `A_CONFIRMER` | e1RM du jour à plus de ±10 % de la référence : non intégré sans confirmation |
| `PAS_DE_DONNEE_FIABLE` | aucune série valide dans la séance : référence inchangée |
| `INCOHERENCE_PCT_RPE` | % saisi incohérent avec reps × RPE |
| `RPE_DEDUIT_DU_PCT` | RPE absent, déduit du % saisi |
| `PCT_IMPOSSIBLE` | % saisi au-dessus de ce que les reps permettent à l'échec |
| `PRESCRIPTION_INCOMPLETE` | ni RPE ni % : pas de charge |
| `CIBLE_SOUS_MINIMUM` | cible sous la plus petite charge disponible |
| `CIBLE_AU_DESSUS_MAX` | cible au-dessus de la plus grande charge disponible |
| `ECART_ARRONDI_IMPORTANT` | écart arrondi / cible > 5 % |
| `SERIE_DURE` | RPE réel ≥ prescrit + 2, RPE 10 non prévu, ou reps manquées |
| `ECHEC_TOTAL` | 0 rep réalisée |
| `ARRET_EXERCICE` | deux séries dures consécutives : séries restantes annulées |
| `DOULEUR` | douleur déclarée : plus aucune charge prescrite sur l'exercice |
| `DELOAD_*` | violations de deload (voir `deload.md`) |
| `STAGNATION` | référence sans progrès sur 3 semaines, sans autre signal |
| `FATIGUE_PERSISTANTE_APRES_DELOAD` | deload recommandé moins de 3 semaines après le précédent |
| `EXERCICE_SANS_MAPPING` | moteur volume : exercice sans association muscles par clé |
| `LEST_NEGATIF` | charge de système < poids du corps (lest) |

## Limites et contre-indications

- Le moteur ne gère pas les mouvements Hyrox/CrossFit non chargés à l'e1RM (sled, wall ball, farmer carry, burpees) : leurs charges sont fixées par le règlement ou le modèle, pas par la table RPE.
- Haltérophilie (power clean, push press) : table RPE peu adaptée (mouvements limités par la technique et la vitesse). Pas d'e1RM dérivé d'un autre mouvement, reps ≤ 3, voir `variantes-discounts.md`.
- Douleur déclarée : le moteur émet `DOULEUR` et ne calcule plus de charge pour l'exercice. La conversation propose une alternative indolore simple et oriente vers `expert-sante-physique`. Aucun contournement « médical ».
- Hors périmètre de cette version : test de 1RM sécurisé, peaking, décomposition en disques par côté, livres.

## Exemple

Squat, référence e1RM 150 kg, slot sans remise, prescription 5 @ RPE 8, barre 20 kg + disques jusqu'à 1,25 kg (incrément 2,5 kg), phase normale :
n = 5 + 10 − 8 + 0,5 = 7,5 ; pct(5, 8) = 29,5/36 = 0,819444 → brute 122,917 kg → arrondi 122,5 kg (125 serait plus loin). Paliers : voir `paliers-montee-en-charge.md`.
