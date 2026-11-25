---
id: force-deload
domaine: force
titre: Deload — déclencheurs, contenu, plafonds, validation
niveau_preuve: E
sources:
  - titre: "Integrating Deloading into Strength and Physique Sports Training Programmes: An International Delphi Consensus Approach (Sports Med Open 9:87)"
    auteurs: "Bell L, Nolan D, Immonen V et al."
    annee: 2023
    url: "https://doi.org/10.1186/s40798-023-00633-0"
  - titre: "Deloading Practices in Strength and Physique Sports: A Cross-sectional Survey (Sports Med Open 10:26)"
    auteurs: "Rogerson D, Nolan D, Androulakis Korakakis P et al."
    annee: 2024
    url: "https://link.springer.com/article/10.1186/s40798-024-00691-y"
  - titre: "Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations (PeerJ 12:e16777)"
    auteurs: "Coleman M, Burke R, Augustin F et al."
    annee: 2024
    url: "https://peerj.com/articles/16777"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Deload

## Principe

Un deload est une période de stress d'entraînement réduit, destinée à dissiper la fatigue physique et mentale et à préparer la suite (définition de consensus, Bell 2023). Chez les athlètes de force interrogés, il revient environ toutes les 5 à 6 semaines (5,6 ± 2,3), dure environ une semaine (6,4 ± 1,7 jours), garde la même fréquence de séances et les mêmes exercices, et baisse le volume, la charge et l'effort (Rogerson 2024). Un arrêt complet d'une semaine a fait un peu moins progresser la force qu'un entraînement continu (Coleman 2024) : aiiron fait donc des deloads actifs, jamais un arrêt. Un deload qui contient des singles lourds n'en est pas un : le moteur le refuse ou le corrige.

## Règles pour aiiron

### R1 — Déclencheurs

| Déclencheur | Définition testable | Statut |
| --- | --- | --- |
| Planifié | le modèle place une semaine `deload` ; à défaut, après N semaines de charge : débutant 6, intermédiaire 5, avancé 4 | fréquence moyenne Rogerson 2024 ; N par niveau = heuristique, validé par Pierrot le 25/11/2026 |
| Régression | sur un mouvement principal (`squat`, `developpe_couche`, `souleve_de_terre`, `developpe_militaire` s'il est principal du modèle), ref actuelle ≤ 0,95 × max des refs des 4 dernières semaines | heuristique, validé par Pierrot le 25/11/2026 |
| Stagnation | ref actuelle ≤ ref d'il y a 3 semaines, sur au moins un mouvement principal | heuristique, validé par Pierrot le 25/11/2026 |
| Fatigue | ≥ 3 `SERIE_DURE` ou ≥ 1 `ARRET_EXERCICE` sur les 7 derniers jours, ou 2 séances consécutives du même mouvement principal avec un écart de top set ≥ +1 | heuristique, validé par Pierrot le 25/11/2026 |
| Readiness basse | booléen `readiness_basse_persistante` fourni par la couche récupération (`expert-sante-physique`). Le moteur force n'interprète aucune métrique wearable | interface validée par Pierrot le 25/11/2026 ; le calcul du booléen reste à définir par `expert-sante-physique` (absent = faux) |

« Ref d'une semaine » = valeur de la référence e1RM à la fin de cette semaine. Les 4 dernières semaines incluent la semaine en cours.

Décision `evaluerDeload` (hebdomadaire) :
- semaine planifiée → deload ;
- sinon, régression → deload recommandé ;
- sinon, au moins 2 signaux parmi {stagnation, fatigue, readiness basse} la même semaine → deload recommandé ;
- stagnation seule → pas de deload, drapeau `STAGNATION` (piste de changement de programme, pas de fatigue) ;
- un deload recommandé moins de 3 semaines après le précédent → pas de nouveau deload, drapeau `FATIGUE_PERSISTANTE_APRES_DELOAD` : la conversation fait le point récupération (sommeil, stress, charge de vie) et oriente vers `expert-sante-physique` si besoin.
Un deload recommandé est proposé à l'utilisateur ; il n'est pas imposé.

### R2 — Contenu d'une semaine de deload

| Paramètre | Règle | Statut |
| --- | --- | --- |
| Durée | 1 semaine | Rogerson 2024 |
| Fréquence, exercices | inchangés | Rogerson 2024 |
| Séries par exercice | ≤ ceil(séries de la semaine de référence / 2) | baisse de volume : Bell 2023, Rogerson 2024 ; facteur 1/2 = heuristique, validé par Pierrot le 25/11/2026 |
| Reps par série | inchangées ou moins | Rogerson 2024 |
| RPE prescrit | ≤ 7 pour toute série | heuristique, validé par Pierrot le 25/11/2026 |
| Intensité | charge ≤ 0,80 × e1RM effectif | heuristique, validé par Pierrot le 25/11/2026 |
| Singles | interdits si RPE prescrit ≥ 8 (de toute façon RPE ≤ 7) | règle produit |
| Interdits | AMRAP, test de 1RM, top set « au ressenti » | règle produit |
| Ajustement en séance | baisse permise, hausse interdite | `ajustement-rpe.md`, R7 |

Charge d'une série de deload :
```
brute = e1rmEffectif × min( pct(reps, min(RPE, 7)) , 0,80 )
```
puis arrondi (le plafond 80 % est réappliqué après arrondi, `arrondi-charges.md`, R5).

Semaine de référence : la dernière semaine non-deload du même bloc. Exercice absent de la référence : ≤ 2 séries (heuristique, validé par Pierrot le 25/11/2026). Pas de référence fournie : le contrôle de volume est sauté, drapeau `DELOAD_VOLUME_NON_VERIFIABLE`.

### R3 — Validation (`validerDeload`)

Violations possibles, une par série ou par exercice fautif :

| Code | Condition |
| --- | --- |
| `DELOAD_RPE_TROP_HAUT` | RPE prescrit > 7 |
| `DELOAD_SINGLE_LOURD` | reps = 1 et RPE prescrit ≥ 8 |
| `DELOAD_INTENSITE_TROP_HAUTE` | pct(reps, RPE) > 0,80, ou % saisi > 80, ou charge > 0,80 × e1RM effectif |
| `DELOAD_VOLUME_TROP_HAUT` | séries de l'exercice > ceil(séries de référence / 2) |
| `DELOAD_TEST_INTERDIT` | AMRAP ou test de 1RM |

Une semaine marquée `deload` avec au moins une violation est refusée telle quelle.

### R4 — Correction automatique (`corrigerDeload`)

Pour chaque exercice, dans cet ordre :
1. Supprimer les lignes interdites : singles à RPE ≥ 8, AMRAP, tests.
2. Plafonner les lignes restantes : RPE := min(RPE, 7), puis baissé par demi-point jusqu'à pct(reps, RPE) ≤ 0,80, sans descendre sous 6 (plancher de `table-rpe.md`, R3). De 1 à 3 reps, aucun RPE ≥ 6 ne passe sous 0,80 (pct(3, 6) = 81,9 %) : la ligne devient **4 reps @ RPE 6** (pct(4, 6) = 79,2 %), même nombre de séries. Charge par la formule de R2. Ainsi toute ligne corrigée passe R3 (heuristique, décision de Pierrot du 25/11/2026 ; corrige l'écart T1 trouvé par le moteur).
3. Volume : tant que le total de séries dépasse ceil(référence / 2), retirer une série en partant de la dernière ligne ; minimum 1 série au total.
4. Si l'étape 1 a tout supprimé : une ligne de remplacement ceil(référence / 2) × 4 reps @ RPE 6, charge par R2 (pct(4, 6) = 79,2 % ; heuristique, validé par Pierrot le 25/11/2026, passée de 3 à 4 reps avec l'étape 2).
Chaque changement est listé en clair (pour que aiiron puisse l'expliquer en une phrase).

### R5 — Sortie de deload

La semaine suivante reprend le bloc depuis la référence e1RM courante, sans « bonus de reprise ». Les séances de deload mettent à jour la référence normalement, mais leurs séries sont en général à RPE < 7, donc non retenues (`e1rm.md`, R2) : la référence reste stable, c'est voulu.

## Limites et contre-indications

- Peu de recherche contrôlée sur le deload ; les règles reposent surtout sur un consensus de coachs et une enquête (Bell 2023 ; Rogerson 2024).
- Le deload n'est pas un affûtage (taper) avant compétition : le peaking aura sa fiche.
- Fatigue qui persiste malgré un deload, troubles du sommeil, douleurs : le moteur ne prescrit pas plus de repos « thérapeutique » ; la conversation oriente vers `expert-sante-physique` ou un professionnel.

## Exemple (réutilisable comme test)

Squat, e1RM 150, semaine de référence : 1 × 1 @ 8 + 4 × 3 @ 8 (5 séries). Semaine marquée « DELOAD » : 1 × 1 @ 9, 1 × 1 @ 10, 3 × 3 @ 7.
- Validation : `DELOAD_RPE_TROP_HAUT` × 2, `DELOAD_SINGLE_LOURD` × 2, `DELOAD_INTENSITE_TROP_HAUTE` × 3 (95,2 %, 98,4 %, 84,5 %), `DELOAD_VOLUME_TROP_HAUT` (5 > 3). Refusée.
- Correction : singles supprimés ; 3 × 3 @ 7 : pct(3, 7) = 84,5 % > 80 % et pct(3, 6) = 81,9 % > 80 %, donc 4 reps @ 6 (n = 8,5) → 150 × 0,791667 = 118,75 → **3 × 4 @ 6 à 117,5 kg** ; total 3 séries ≤ 3. La semaine corrigée passe R3.
