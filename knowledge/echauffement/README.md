# Échauffement : protocoles par type de séance

Propriétaire : `expert-sante-physique`. Statut de toutes les fiches : `brouillon`.

Ces protocoles remplissent les blocs 1 (échauffement général) et 2 (préparation spécifique) du skill `seance-complete`. La mobilité dynamique d'avant séance est décrite dans `knowledge/mobilite/`, le bloc 4 (retour au calme) dans `knowledge/etirements/`.

| Fiche | Type de séance |
| --- | --- |
| `echauffement-force.md` | Force, séries lourdes (squat, soulevé de terre, développé couché, développé militaire) |
| `echauffement-musculation.md` | Musculation / hypertrophie |
| `echauffement-course.md` | Course : sortie facile et séance intense (fractionné, seuil, côtes, sprint) |
| `echauffement-hyrox-crossfit.md` | Hyrox et CrossFit |

Paliers de montée en charge : **jamais détaillés ici**. Règle unique dans `knowledge/force/paliers-montee-en-charge.md` (expert-force) : paliers en % de la charge de travail du jour, barre à vide en premier, reps décroissantes, aucun palier au-dessus de la charge de travail. Même règle en force, en musculation et en Hyrox/CrossFit (au-dessus du seuil ECH-6) : paliers complets la première fois que le schéma (squat, charnière, poussée horizontale, poussée verticale, tirage) est chauffé dans la séance, départ à 60 % ensuite ; détail dans R5, « Mouvement déjà chauffé », de la fiche force.

## Format machine commun (échauffement, mobilité, étirements)

Chaque fiche de protocole contient un bloc JSON `protocole` qui suit ce schéma.

```json
{
  "id": "echauffement-force",
  "type_seance": "force | musculation | course | hyrox_crossfit",
  "versions": {
    "standard": { "duree_min": 0, "etapes": [] },
    "courte":   { "duree_min": 0, "etapes": [] }
  },
  "substitutions": [ { "si_absent": "rameur", "remplacer": "mq-rameur", "par": ["0798", "2612"] } ],
  "interdits": [ { "regle": "ETI-1", "texte": "..." } ]
}
```

Une **étape** :

| Champ | Valeurs | Rôle |
| --- | --- | --- |
| `bloc` | `echauffement_general`, `preparation_specifique`, `retour_au_calme` | Bloc du skill `seance-complete` |
| `nature` | `cardio`, `mobilite_dynamique`, `activation`, `montee_en_charge`, `series_approche`, `gammes`, `accelerations`, `repetition_mouvements`, `potentialisation`, `etirements_statiques`, `respiration`, `auto_massage` | Type d'étape |
| `duree_min` | nombre ou `null` | `null` = durée calculée par un autre moteur (paliers) |
| `si` | objet, facultatif | Condition d'inclusion, ex. `{ "mouvement": ["squat"] }` |
| `ref` | `"<id-fiche>#<section>"`, facultatif | L'étape reprend les items d'une autre fiche |
| `items` | liste d'items | Exercices |

Un **item** :

| Champ | Rôle |
| --- | --- |
| `ex` | Identifiant à 4 chiffres = `data/exercises/exercises.json` ; `mq-…` = exercice créé par aiiron, dans `data/exercises/exercices-aiiron.json` (liste commentée : `knowledge/sante-physique/exercices-manquants.md`) |
| `nom_fr` | Nom affiché |
| `series`, `reps`, `duree_s`, `distance_m` | Dosage ; champ absent = sans objet |
| `par_cote` | `true` si le dosage s'entend par côté ou par sens |
| `intensite` | `RPE x-y` (échelle d'effort 0–10) ou consigne qualitative |

Conventions :
- Ordre des étapes = ordre d'exécution.
- La version `courte` sert quand le créneau est serré (skill `seance-complete`). Elle peut réduire le cardio d'échauffement, la mobilité dynamique (**2 exercices au lieu de 4**), l'activation, et les gammes, accélérations ou passages de répétition selon la dose courte écrite dans chaque fiche. Les paliers de montée en charge et les séries d'approche ne sont **jamais** supprimés ni raccourcis. Si ça ne suffit pas, on raccourcit le corps de séance.
- Les identifiants de règles (`ECH-…`, `MOB-…`, `ETI-…`) sont repris dans les tests du moteur.

## Règles transverses (s'appliquent aux 4 types)

| Id | Règle | Source / statut |
| --- | --- | --- |
| ECH-1 | Toute séance commence par 3 à 10 min de cardio facile (RPE 3–4). 5 min par défaut, 3 min en version courte. | Bishop 2003, McGowan 2015 ; plancher de 3 min validé par Pierrot le 25/11/2026 |
| ECH-2 | Structure RAMP : élever la température, activer et mobiliser, potentialiser (paliers, accélérations ou répétition des mouvements). | Jeffreys 2007 (modèle de coach, niveau E) |
| ECH-3 | Pas d'étirement statique dans l'échauffement d'une séance de force, de puissance, de sprint ou d'un bloc chronométré. Détail et seuils : règle ETI-1 dans `knowledge/etirements/etirements-regles.md`. | Behm 2016, Kay et Blazevich 2012, Chaabene 2019 |
| ECH-4 | Entre la fin de l'échauffement et le premier effort de travail : 10 min au plus. Au-delà de 15 min, refaire 2–3 min de cardio et la dernière étape spécifique. | McGowan 2015 (perte de l'effet thermique avec le temps) ; seuils 10 et 15 min validés par Pierrot le 25/11/2026 |
| ECH-5 | Douleur pendant l'échauffement (pas une simple raideur) : on n'enchaîne pas sur la séance prévue. Alternative indolore ou séance allégée, orientation vers un professionnel si ça persiste. Drapeau rouge : arrêt immédiat et orientation médicale. | Skill `seance-complete`, principe non négociable n° 2 |
| ECH-6 | Seuil « lourd », commun à toutes les séances et à expert-force. Pour tout exercice chargé, `I = charge de travail / e1RM effectif` ; e1RM inconnu : `I = pct(reps prescrites, RPE prescrit)` de `knowledge/force/table-rpe.md`. **I ≥ 0,80 → paliers de `knowledge/force/paliers-montee-en-charge.md`**, quel que soit le type de séance et le nombre de reps : complets la première fois que le schéma est chauffé dans la séance, départ à 60 % ensuite (R5, « Mouvement déjà chauffé »). I < 0,80 : force → échelles « Léger » / « Modéré » de la fiche force ; musculation → règle courte (section `#musculation` de la fiche force) ; Hyrox/CrossFit → répétition des mouvements (ECH-H4). I indéterminable (ni e1RM ni RPE prescrit) : force → échelle « Lourd » ; musculation → règle courte ; Hyrox/CrossFit → ECH-H4. | Décision de Pierrot du 25/11/2026 ; seuil 0,80 : sources partielles (Rhea 2003 : 80 % du 1RM = intensité la plus efficace pour la force chez les entraînés ; Ribeiro 2020 et 2021 : l'échauffement spécifique progressif compte surtout près du maximum), coupure exacte = heuristique de coach (aucune étude) ; détail et références dans `knowledge/force/paliers-montee-en-charge.md`, R2 ; I indéterminable en force → « Lourd » : aucune source directe, choix de prudence (même fiche, R2 point 4) ; cas « I indéterminable » en Hyrox/CrossFit (charges fixées par le format) validé par Pierrot le 25/11/2026 ; « Mouvement déjà chauffé » en Hyrox/CrossFit validé par Pierrot le 25/11/2026 |
