---
id: echauffement-hyrox-crossfit
domaine: echauffement
titre: Échauffement d'une séance Hyrox ou CrossFit
niveau_preuve: E
sources:
  - titre: "Warm up II: performance changes following active warm up and how to structure the warm up"
    auteurs: "Bishop D."
    annee: 2003
    url: "https://doi.org/10.2165/00007256-200333070-00002"
  - titre: "Warm-up strategies for sport and exercise: mechanisms and applications"
    auteurs: "McGowan CJ, Pyne DB, Thompson KG, Rattray B."
    annee: 2015
    url: "https://doi.org/10.1007/s40279-015-0376-x"
  - titre: "Post-activation potentiation versus post-activation performance enhancement in humans: historical perspective, underlying mechanisms, and current issues"
    auteurs: "Blazevich AJ, Babault N."
    annee: 2019
    url: "https://doi.org/10.3389/fphys.2019.01359"
  - titre: "Acute effects of static stretching on muscle strength and power: an attempt to clarify previous caveats"
    auteurs: "Chaabene H, Behm DG, Negra Y, Granacher U."
    annee: 2019
    url: "https://doi.org/10.3389/fphys.2019.01468"
  - titre: "Warm-up revisited: the ramp method of optimizing warm-ups"
    auteurs: "Jeffreys I."
    annee: 2007
    url: "non disponible en libre accès (Professional Strength and Conditioning, UKSCA, n° 6)"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-24
---

## Principe

Une séance Hyrox ou CrossFit enchaîne des mouvements variés (course, ergomètres, traîneau, wall balls, haltérophilie, gymnastique) à haute intensité. L'échauffement suit le modèle RAMP : cardio facile, mobilité dynamique globale avec les articulations du jour (poignets, épaules, hanches, chevilles), activation, puis **répétition des mouvements du jour à faible intensité**, en montant progressivement avant le premier bloc chronométré. Les mouvements lourds à la barre suivent les paliers de la fiche force. Aucune étude ne valide un échauffement propre à ces disciplines : tout le dosage est une heuristique de coach (niveau E), appuyée sur les principes généraux (McGowan 2015 ; Blazevich et Babault 2019).

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| ECH-H1 | Cardio facile 6 min (RPE 3–4, dernière minute à RPE 5), 3 min en version courte. Machine du jour de préférence (rameur, ski erg, vélo à air) ou course. | Bishop 2003 ; durée = heuristique à valider |
| ECH-H2 | Mobilité dynamique globale : items de `mobilite-hyrox-crossfit#avant`, 3 min de base, 6 min au plus avec les ajouts (2 à 3 min en version courte). Ajout automatique des modules poignet (appui, front rack, overhead), épaule (overhead, gymnastique) et cheville (course, sauts, corde). | Heuristique à valider |
| ECH-H3 | Activation 2 min : dead bug + pont fessier ; + tirage scapulaire si gymnastique de tirage ; + pompe scapulaire si appuis (pompes, burpees, handstand). | Heuristique à valider |
| ECH-H4 | Répétition des mouvements du premier bloc chronométré : 2 passages. Passage 1 : environ 30 % du volume d'un tour, RPE 4–5. Passage 2 : même volume, RPE 6–7. Charges : plus légères ou égales à celles du bloc. Jamais raccourci en version courte (on peut ne faire qu'un passage à RPE 6). | Skill `seance-complete` ; 30 % et RPE = heuristique à valider |
| ECH-H5 | Mouvement lourd à la barre dans la séance (charge ≥ 80 % du 1RM estimé ou série ≤ 5 reps prescrite lourde) : paliers de `knowledge/force/paliers-montee-en-charge.md` à la place de l'étape ECH-H4 pour ce mouvement. | Expert-force ; seuil d'activation = heuristique à valider |
| ECH-H6 | Potentialisation facultative (standard, objectif performance) : 1 à 2 efforts de 10 à 15 s à l'intensité du bloc, 2 à 5 min avant le départ. | Blazevich et Babault 2019 ; dosage = heuristique à valider |
| ECH-H7 | Départ du premier bloc chronométré dans les 10 min qui suivent la fin de l'échauffement (règle ECH-4). | McGowan 2015 ; heuristique à valider |

Durée totale indicative : 18 min standard (6 + 4 + 2 + 6 de répétition des mouvements), 10 min courte (3 + 2 + 1 + 4).

```json
{
  "id": "echauffement-hyrox-crossfit",
  "type_seance": "hyrox_crossfit",
  "versions": {
    "standard": {
      "duree_min": 18,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 6,
          "items": [ { "ex": "mq-rameur", "nom_fr": "Rameur ou machine du jour", "duree_s": 360, "intensite": "RPE 3-4, dernière minute RPE 5" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 4,
          "ref": "mobilite-hyrox-crossfit#avant" },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 2,
          "items": [
            { "ex": "0276", "nom_fr": "Dead bug", "series": 1, "reps": 6, "par_cote": true, "intensite": "lent" },
            { "ex": "3013", "nom_fr": "Pont fessier au sol", "series": 1, "reps": 10, "intensite": "RPE 4-5" },
            { "ex": "0688", "nom_fr": "Tirage scapulaire à la barre", "series": 1, "reps": 6, "intensite": "bras tendus", "si": { "mouvements_inclus": ["gymnastique_tirage"] } },
            { "ex": "3021", "nom_fr": "Pompe scapulaire", "series": 1, "reps": 10, "intensite": "bras tendus", "si": { "mouvements_inclus": ["appui"] } }
          ] },
        { "bloc": "preparation_specifique", "nature": "repetition_mouvements", "duree_min": 6,
          "regle": "pour chaque mouvement du premier bloc chronométré",
          "passages": [
            { "numero": 1, "volume_pct_d_un_tour": 30, "intensite": "RPE 4-5" },
            { "numero": 2, "volume_pct_d_un_tour": 30, "intensite": "RPE 6-7" }
          ] },
        { "bloc": "preparation_specifique", "nature": "montee_en_charge", "duree_min": null,
          "si": { "mouvement_lourd_barre": true },
          "ref": "force-paliers-montee-en-charge" },
        { "bloc": "preparation_specifique", "nature": "potentialisation", "duree_min": 1,
          "si": { "objectif": ["performance"], "facultatif": true },
          "items": [ { "ex": "mq-rameur", "nom_fr": "Effort bref à l'intensité du bloc (machine ou course)", "series": 2, "duree_s": 12, "intensite": "intensité cible du bloc" } ] }
      ]
    },
    "courte": {
      "duree_min": 10,
      "etapes": [
        { "bloc": "echauffement_general", "nature": "cardio", "duree_min": 3,
          "items": [ { "ex": "mq-rameur", "nom_fr": "Rameur ou machine du jour", "duree_s": 180, "intensite": "RPE 3-4" } ] },
        { "bloc": "preparation_specifique", "nature": "mobilite_dynamique", "duree_min": 2,
          "ref": "mobilite-hyrox-crossfit#avant-courte" },
        { "bloc": "preparation_specifique", "nature": "activation", "duree_min": 1,
          "items": [ { "ex": "0276", "nom_fr": "Dead bug", "series": 1, "reps": 6, "par_cote": true, "intensite": "lent" } ] },
        { "bloc": "preparation_specifique", "nature": "repetition_mouvements", "duree_min": 4,
          "regle": "pour chaque mouvement du premier bloc chronométré",
          "passages": [ { "numero": 1, "volume_pct_d_un_tour": 30, "intensite": "RPE 6" } ] },
        { "bloc": "preparation_specifique", "nature": "montee_en_charge", "duree_min": null,
          "si": { "mouvement_lourd_barre": true },
          "ref": "force-paliers-montee-en-charge" }
      ]
    }
  },
  "substitutions": [
    { "si_absent": "rameur", "remplacer": "mq-rameur", "par": ["2142", "mq-air-bike", "mq-footing", "2612"] },
    { "si_absent": "barre_traction", "remplacer": "0688", "par": ["mq-ecartes-elastique"] }
  ],
  "interdits": [
    { "regle": "ETI-1", "texte": "Pas d'étirement statique avant un bloc chronométré ; 30 s cumulées par groupe au plus si l'utilisateur y tient, avant la mobilité dynamique." },
    { "regle": "ECH-H4", "texte": "Ne pas commencer un bloc chronométré par un mouvement jamais répété dans l'échauffement." },
    { "regle": "ECH-H4", "texte": "Pas de passage d'échauffement au-dessus de RPE 7 ni à une charge supérieure à celle du bloc." }
  ]
}
```

Exemples de passage 1 (30 % d'un tour) : bloc « 3 tours de 1 000 m rameur + 50 m traîneau + 20 wall balls » → 300 m de rameur, 15 m de traîneau, 6 wall balls ; puis passage 2 identique, plus vite. Identifiants : `mq-rameur`, `mq-traineau-pousse`, `mq-wall-ball` (voir exercices manquants). Arrondi des volumes : choix du moteur.

Substitutions : `2142` ski erg, `2612` corde à sauter.

## Limites et contre-indications

- Douleur pendant la répétition des mouvements : le mouvement concerné est remplacé par une variante indolore ou retiré du bloc ; orientation vers un professionnel si ça persiste (règle ECH-5).
- Compétition Hyrox : l'échauffement réel dépend de l'organisation (zone d'échauffement, horaires de vague). À adapter avec expert-course.
- Le seuil « mouvement lourd » d'ECH-H5 doit être aligné avec expert-force.

## Exemple

Séance CrossFit : EMOM 12 min (5 power cleans à 60 kg, 10 burpees), athlète au 1RM de power clean estimé à 90 kg, standard.
Résultat attendu : rameur 6 min → mobilité hyrox-crossfit avec modules poignet et épaule → dead bug, pont fessier, pompe scapulaire (appuis pour les burpees) → 60 kg = 67 % du 1RM, donc pas de règle ECH-H5 : répétition des mouvements (passage 1 : 2 power cleans à la barre vide + 3 burpees à RPE 4–5 ; passage 2 : 2 power cleans à 60 kg + 3 burpees à RPE 6–7) → départ de l'EMOM dans les 10 min.
