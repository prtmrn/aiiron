---
id: force-variantes-discounts
domaine: force
titre: Variantes — coefficients d'initialisation et remises de contexte
niveau_preuve: E
sources:
  - titre: "Concentric-only versus touch-and-go bench press one-repetition maximum in men and women (Sports Health 13:373-379)"
    auteurs: "García-Ramos A, Janicijevic D, Jukic I"
    annee: 2021
    url: "https://rke.abertay.ac.uk/en/publications/concentric-only-versus-touch-and-go-bench-press-one-repetition-ma/"
  - titre: "Proximity to Failure and Total Repetitions Performed in a Set Influences Accuracy of Intraset RIR-based RPE"
    auteurs: "Zourdos MC, Goldsmith JA, Helms ER et al."
    annee: 2021
    url: "https://pubmed.ncbi.nlm.nih.gov/30747900/"
statut: brouillon
auteur_agent: expert-force
derniere_revue: 2026-11-25
---

# Variantes et discounts

## Principe

Une variante (pause squat, couché prise serrée…) est plus légère que son mouvement de base. Il existe deux sortes de « discount », qu'il ne faut pas mélanger. Le **coefficient de variante** sert une seule fois : il initialise l'e1RM d'une variante jamais loguée à partir de sa base. Ensuite la variante vit avec son propre e1RM, mis à jour par ses propres séries. La **remise de contexte** s'applique à chaque fois qu'un exercice est placé dans un slot donné (par exemple l'OHP en second mouvement, après le couché, prévu −6 %). Les deux passent par la même fonction `e1rmEffectif`, appelée par toutes les charges : il est impossible d'annoncer un discount et d'en appliquer un autre, ou de l'oublier sur certaines séries.

## Règles pour aiiron

### R1 — e1RM effectif (fonction unique)

```
e1rmExercice(ex) = ref(ex)                                   si ex a une référence
                 = e1rmExercice(base(ex)) × coef(ex)          sinon (initialisation paresseuse, puis stockée comme ref de ex, source "init_variante")
e1rmEffectif(slot) = e1rmExercice(slot.exercice) × slot.remise_contexte     // remise_contexte = 1 par défaut
chargeBrute = e1rmEffectif(slot) × pct(reps, RPE)            // puis plafonds de phase, puis arrondi
```
- Le discount s'exprime comme un multiplicateur : « −6 % » = 0,94. Le modèle stocke le multiplicateur, jamais une charge ou un % déjà réduit.
- Le multiplicateur s'applique sur l'e1RM, avant le calcul de la charge et avant l'arrondi. Jamais sur une charge déjà arrondie, jamais en soustrayant des points de % (83,3 % − 6 points ≠ 83,3 % × 0,94).
- Tous les calculs dérivés (paliers, back-offs, deload, ajustements en séance) partent de la charge issue de cette fonction : ils héritent du discount automatiquement.
- Composition : les coefficients se multiplient le long de la chaîne de bases (pause squat avant = squat × 0,80 × 0,90). Profondeur maximale 3 ; un cycle dans les bases est une erreur de configuration détectée au chargement.
- Coefficient ≤ 1,00 toujours, même si la variante est réellement plus forte que la base (rack pull, push press) : choix prudent pour une initialisation sans donnée, validé par Pierrot le 25/11/2026.

### R2 — Retour d'information depuis un slot remisé

Une série faite dans un slot remisé met à jour la référence de l'exercice après division par la remise : `e1rmJour = e1rmSerie / remise_contexte` (voir `e1rm.md`, R4). Aller-retour exact : charge prescrite = ref × 0,94 × pct ; si la série est faite exactement au RPE prescrit, e1rmSerie = ref × 0,94, donc e1rmJour = ref.

### R3 — Tableau des coefficients d'initialisation

Toutes les valeurs sont des **heuristiques de coach, validées par Pierrot le 25/11/2026** (y compris le coefficient 0,95 de l'autre style de soulevé de terre). Identifiants en snake_case, à relier aux identifiants de `data/exercises/` par `developpeur`.

| Variante (id) | Base | Coef | Note |
| --- | --- | --- | --- |
| `squat_pause_2s` | `squat` | 0,90 | pause 2 s en bas |
| `squat_tempo_3_1_0` | `squat` | 0,85 | 3 s de descente, 1 s de pause |
| `squat_box` | `squat` | 0,95 | box à la parallèle |
| `squat_pin` | `squat` | 0,85 | départ arrêté sur sécurités à la parallèle |
| `squat_avant` | `squat` | 0,80 | front squat |
| `squat_avant_pause_2s` | `squat_avant` | 0,90 | exemple de chaîne de bases |
| `squat_safety_bar` | `squat` | 0,90 | |
| `couche_pause_1s` | `couche` | 0,95 | base = couché touché-poitrine ; l'écart touché vs départ arrêté complet est d'environ 8 % (García-Ramos 2021), une pause d'1 s est entre les deux |
| `couche_pause_3s` | `couche` | 0,90 | |
| `couche_prise_serree` | `couche` | 0,92 | |
| `couche_larsen` | `couche` | 0,92 | sans poussée des jambes |
| `couche_spoto` | `couche` | 0,92 | arrêt à 2–3 cm de la poitrine |
| `couche_tempo_3_1_0` | `couche` | 0,85 | |
| `couche_incline_30` | `couche` | 0,80 | |
| `developpe_militaire` | `couche` | 0,60 | OHP debout ; ratio très variable d'un individu à l'autre, à remplacer vite par ses propres données |
| `developpe_militaire_assis` | `developpe_militaire` | 0,95 | |
| `push_press` | `developpe_militaire` | 1,00 | réellement plus lourd ; plafonné à 1 (R1) |
| `sdt_deficit_5cm` | `souleve_de_terre` | 0,90 | |
| `sdt_pause_genou` | `souleve_de_terre` | 0,85 | |
| `sdt_tempo` | `souleve_de_terre` | 0,80 | 3 s de descente contrôlée |
| `sdt_roumain` | `souleve_de_terre` | 0,70 | |
| `sdt_blocs` | `souleve_de_terre` | 1,00 | réellement plus lourd ; plafonné à 1 |

Mouvements de base (pas de coefficient) : `squat`, `couche`, `souleve_de_terre` (style choisi par l'utilisateur, conventionnel ou sumo ; l'autre style est une variante à coef 0,95, heuristique), `developpe_militaire` quand l'utilisateur a déjà ses données.

Sans coefficient, initialisation par séance d'étalonnage (`e1rm.md`, R8) : `power_clean`, haltérophilie en général, exercices aux haltères, exercices machine. Raison : ratio trop variable ou dépendant du matériel.

### R4 — Remise de contexte (dans les modèles)

- Champ `remise_contexte` du slot, multiplicateur dans [0,80 ; 1,00]. Hors bornes → erreur de modèle. Bornes : choix de conception validé par Pierrot le 25/11/2026.
- Usage type : exercice placé après un mouvement qui fatigue les mêmes muscles (OHP après couché), back-off défini comme « −10 % » (préférer alors un RPE cible plus bas, plus lisible).
- Une remise annoncée dans un modèle doit être identique dans toutes les séances et semaines du modèle pour ce slot ; une variation volontaire se fait en créant un autre slot.

### R5 — Contrôle « discount annoncé = appliqué »

Pour chaque série générée : `chargeBrute / (e1rmExercice × pct) = remise_contexte` à 1e-9 près (avant arrondi). Après arrondi : la charge est l'une des deux charges disponibles qui encadrent `chargeBrute`, et ne la dépasse jamais de plus de 2,5 % (`arrondi-charges.md`, R3). L'écart effectif au discount annoncé après arrondi n'est donc pas un bug, mais il est borné. Ces deux assertions sont dans `cas-de-test.md`.

## Limites et contre-indications

- Les coefficients sont des moyennes : un individu peut être à ±10 % de la valeur. L'autorégulation corrige dès la première séance de la variante (garde-fou ±10 % de `e1rm.md`, R5).
- Variantes choisies pour contourner une douleur : hors périmètre de ce tableau. Douleur → `DOULEUR`, alternative indolore simple proposée en conversation, orientation `expert-sante-physique`.

## Exemple (réutilisable comme test)

- Pause squat jamais loguée, ref squat 150 → e1RM initial 135. 4 @ 7 (n = 7,5) : 135 × 0,819444 = 110,625 → **110 kg**. Séance faite à 110 × 4 @ 8 (n = 6,5) → e1rmJour = 110 / 0,845070 = 130,167 → ratio 0,964 → ref pause squat = 135 + 0,5 × (130,167 − 135) = **132,583**. Ref squat inchangée : **150**.
- `squat_avant_pause_2s`, sans historique ni pour lui ni pour `squat_avant` : 150 × 0,80 × 0,90 = **108** e1RM initial (et `squat_avant` reçoit au passage sa ref initiale 120).
