---
id: force-arrondi-charges
domaine: force
titre: Calcul de charge et arrondi au matériel disponible
niveau_preuve: E
sources:
  - titre: "Application of the Repetitions in Reserve-Based Rating of Perceived Exertion Scale for Resistance Training (autorégulation série à série)"
    auteurs: "Helms ER, Cronin J, Storey A, Zourdos MC"
    annee: 2016
    url: "https://openrepository.aut.ac.nz/items/92cefeac-7c32-44f1-bfbc-f48f4a5dd8cf/full"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Arrondi des charges

## Principe

La charge cible est e1RM effectif × pct(reps, RPE). Elle doit devenir une charge réellement chargeable : barre + paires de disques, haltère existant, cran de machine. L'arrondi se fait une seule fois, à la fin. On arrondit au plus proche, sauf si l'arrondi vers le haut dépasse la cible de plus de 2,5 % : dans ce cas on arrondit vers le bas. Raison : à n ≤ 7, un point de RPE vaut environ 3 % de charge (table RPE), donc un dépassement ≤ 2,5 % reste sous un point de RPE ; un sous-dosage, lui, est sans risque et l'autorégulation le rattrape à la série suivante. Arrondir toujours vers le bas créerait un biais systématique vers le bas (jusqu'à un incrément entier) sans gain de sécurité réel sur les charges lourdes.

## Règles pour aiiron

### R1 — Modèle de matériel (entrée)

```ts
type Materiel =
  | { type: "barre"; barre_kg: number; increment_kg: number; max_kg?: number }
  | { type: "liste"; charges_kg: number[] }                 // haltères (charge par haltère), kettlebells, machine à crans irréguliers
  | { type: "pile"; min_kg: number; max_kg: number; pas_kg: number } // machine à pile régulière
  | { type: "lest"; poids_corps_kg: number; increment_kg: number; max_lest_kg?: number }
```

Défauts (choix de conception à valider) :

| Situation | Valeurs |
| --- | --- |
| Barre standard | barre_kg 20, increment_kg 2,5 (paire de 1,25 kg) |
| Micro-disques 0,5 kg | increment_kg 1 |
| Micro-disques 0,25 kg | increment_kg 0,5 |
| Barre 15 kg | barre_kg 15 |
| max_kg absent | pas de plafond |

`increment_kg` = 2 × le plus petit disque disponible. Raccourci assumé : on suppose assez de disques pour toute charge multiple de l'incrément jusqu'à `max_kg`. Passer à un inventaire disque par disque si un utilisateur le demande.

### R2 — Charges disponibles

- barre : { barre_kg + k × increment_kg, k ≥ 0 } ∩ [barre_kg, max_kg]
- liste : `charges_kg` triées, doublons retirés
- pile : { min_kg + k × pas_kg } ∩ [min_kg, max_kg]
- lest : { k × increment_kg, k ≥ 0 } ∩ [0, max_lest_kg] (lest ajouté, 0 = poids du corps seul)

Tous les calculs se font en grammes entiers (kg × 1000 arrondi à l'entier), pour éviter les erreurs de flottants.

### R3 — Algorithme `arrondirCharge(cible, materiel)`

```
A = chargesDisponibles(materiel)
si cible < min(A)   → min(A), CIBLE_SOUS_MINIMUM
si cible > max(A)   → max(A), CIBLE_AU_DESSUS_MAX
si cible ∈ A        → cible
bas  = plus grande valeur de A < cible
haut = plus petite valeur de A > cible
si (haut − cible) < (cible − bas) ET (haut − cible) / cible ≤ 0,025 → haut
sinon → bas                                     // égalité → bas
si |résultat − cible| / cible > 0,05 → ajouter ECART_ARRONDI_IMPORTANT
```
Seuils 2,5 % et 5 % : choix de conception à valider. `ECART_ARRONDI_IMPORTANT` permet à la conversation de proposer d'ajuster les reps ou de changer de matériel ; le moteur ne modifie pas les reps lui-même.

### R4 — Où s'applique l'arrondi

Partout, avec la même fonction : séries de travail, back-offs, deload, paliers d'échauffement, charges ajustées en séance. Jamais d'arrondi sur un e1RM ou un % intermédiaire.

### R5 — Plafond appliqué avant et après arrondi

Quand une règle impose un plafond (ex. +5 % en séance, 80 % en deload) : `brute = min(brute, plafond)`, puis arrondi ; si le résultat arrondi dépasse le plafond, prendre la plus grande charge disponible ≤ plafond.

### R6 — Exercices lestés

```
charge_systeme_cible = e1RM_systeme × pct(reps, RPE)       // e1RM calculé sur poids du corps + lest
lest_cible = charge_systeme_cible − poids_corps_kg
lest_cible < 0 → LEST_NEGATIF (la conversation propose une variante plus facile)
sinon → arrondirCharge(lest_cible, materiel lest)
```

## Limites et contre-indications

- Haltères et kettlebells : les sauts de charge sont grands (2 à 4 kg par haltère, 4 kg par kettlebell). L'écart à la cible peut dépasser 10 % ; le drapeau le signale, l'ajustement passe par les reps.
- Machines : la charge affichée diffère d'une machine à l'autre. L'e1RM d'un exercice machine n'est valable que pour cette machine (choix de conception à valider : un exercice machine = une salle).
- Pas de conversion livres ↔ kg dans cette version.

## Exemple (réutilisable comme test)

Barre 20 kg, incrément 2,5 :

| Cible | bas / haut | Décision | Sortie |
| --- | --- | --- | --- |
| 101,2 | 100 / 102,5 | bas plus proche | 100 |
| 101,3 | 100 / 102,5 | haut plus proche, +1,18 % | 102,5 |
| 101,25 | 100 / 102,5 | égalité | 100 |
| 31,5 | 30 / 32,5 | haut plus proche mais +3,17 % > 2,5 % | 30 |
| 41,5 | 40 / 42,5 | haut plus proche, +2,41 % | 42,5 |
| 15 | — | sous la barre | 20, `CIBLE_SOUS_MINIMUM` |
| 110 (max_kg 100) | — | au-dessus du max | 100, `CIBLE_AU_DESSUS_MAX` |

Micro-disques : incrément 1 → 101,3 → 101 ; 101,5 → 101 (égalité) ; 101,6 → 102. Incrément 0,5 → 101,3 → 101,5.

Haltères [10, 12, 14, …, 30] : 23,2 → 22 (24 serait +3,45 %) ; 23,6 → 24 (+1,69 %).
Kettlebells [8, 12, 16, 20, 24, 28, 32] : 19 → 16 (20 serait +5,3 %), `ECART_ARRONDI_IMPORTANT` (−15,8 %).
Pile 5 à 100 pas 5 : 47 → 45 (50 serait +6,4 %), pas de drapeau (−4,3 %).
Lest : poids du corps 80, e1RM système traction 120, 5 @ 8 → 100 − 80 = 20 → lest 20 kg (incrément 1,25).
