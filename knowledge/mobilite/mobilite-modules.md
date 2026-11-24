---
id: mobilite-modules
domaine: mobilite
titre: Modules de mobilité par articulation
niveau_preuve: C
sources:
  - titre: "Acute effects of dynamic stretching on muscle flexibility and performance: an analysis of the current literature"
    auteurs: "Opplert J, Babault N."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-017-0797-9"
  - titre: "Acute effects of muscle stretching on physical performance, range of motion, and injury incidence in healthy active individuals: a systematic review"
    auteurs: "Behm DG, Blazevich AJ, Kay AD, McHugh M."
    annee: 2016
    url: "https://doi.org/10.1139/apnm-2015-0235"
  - titre: "American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise"
    auteurs: "Garber CE, Blissmer B, Deschenes MR, et al."
    annee: 2011
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb"
  - titre: "A meta-analysis of the effects of foam rolling on performance and recovery"
    auteurs: "Wiewelhove T, Döweling A, Schneider C, et al."
    annee: 2019
    url: "https://doi.org/10.3389/fphys.2019.00376"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-24
---

## Principe

La mobilité est découpée en modules par articulation, réutilisés par toutes les fiches de séance. Chaque module existe en deux versions. La version **dynamique** (1 à 2 min) se fait avant la séance : mouvements contrôlés dans l'amplitude, sans maintien long, ce qui améliore l'amplitude sans nuire à la performance (Opplert et Babault 2018). La version **autonome** (2 à 5 min) se fait après la séance ou un jour de repos : elle peut contenir des maintiens statiques, qui augmentent l'amplitude à court terme (Behm 2016) et, répétés plusieurs fois par semaine, à plus long terme (Garber 2011). Le rouleau est facultatif : ses effets sont petits mais il ne gêne pas la performance (Wiewelhove 2019).

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| MOB-1 | Avant séance : seulement des modules `-dynamique`, mouvements contrôlés, 6 à 10 reps par côté, sans maintien de plus de 5 s. | Opplert et Babault 2018 ; dosage = heuristique à valider |
| MOB-2 | Maintiens statiques des modules `-autonome` : 2 × 30 s par côté, tension nette mais jamais douloureuse. | Garber 2011 (10–30 s par maintien, 60 s cumulées par exercice) |
| MOB-3 | Routine de mobilité autonome (jour de repos ou séance dédiée) : 5 à 15 min, 10 min par défaut. On prend les modules `-autonome` des zones raides déclarées par l'utilisateur, 3 modules au plus ; sans zone déclarée : hanche + thoracique + cheville. | Skill `seance-complete` ; choix des modules = heuristique à valider |
| MOB-4 | Fréquence conseillée des routines autonomes : au moins 2 à 3 jours par semaine pour un objectif de souplesse. | Garber 2011 |
| MOB-5 | Auto-massage au rouleau : facultatif, 30 à 60 s par zone, avant la mobilité dynamique ou dans une routine autonome. Ne remplace ni le cardio ni la préparation spécifique. | Wiewelhove 2019 ; durée = heuristique à valider |

```json
{
  "id": "mobilite-modules",
  "modules": {
    "cheville-dynamique": { "duree_min": 1, "items": [
      { "ex": "mq-genou-mur", "nom_fr": "Genou au mur (mobilité de cheville)", "series": 1, "reps": 10, "par_cote": true, "intensite": "talon au sol" },
      { "ex": "1368", "nom_fr": "Cercles de cheville", "series": 1, "reps": 10, "par_cote": true, "intensite": "amplitude maximale indolore" }
    ] },
    "cheville-autonome": { "duree_min": 5, "items": [
      { "ex": "mq-genou-mur", "nom_fr": "Genou au mur, pause 2 s", "series": 2, "reps": 10, "par_cote": true, "intensite": "talon au sol" },
      { "ex": "1377", "nom_fr": "Étirement du mollet mains au mur", "series": 2, "duree_s": 30, "par_cote": true, "intensite": "tension sans douleur" },
      { "ex": "mq-soleaire", "nom_fr": "Étirement du soléaire genou fléchi", "series": 2, "duree_s": 30, "par_cote": true, "intensite": "tension sans douleur" }
    ] },
    "hanche-dynamique": { "duree_min": 2, "items": [
      { "ex": "mq-90-90", "nom_fr": "Bascules de hanche 90/90", "series": 1, "reps": 6, "par_cote": true, "intensite": "contrôlé" },
      { "ex": "1604", "nom_fr": "World's greatest stretch", "series": 1, "reps": 3, "par_cote": true, "intensite": "2 s en fin d'amplitude" },
      { "ex": "mq-squat-profond", "nom_fr": "Tenue de squat profond", "series": 1, "duree_s": 30, "intensite": "talons au sol si possible, appui autorisé" }
    ] },
    "hanche-autonome": { "duree_min": 5, "items": [
      { "ex": "mq-90-90", "nom_fr": "Bascules de hanche 90/90", "series": 2, "reps": 6, "par_cote": true, "intensite": "contrôlé" },
      { "ex": "mq-pigeon", "nom_fr": "Pigeon au sol", "series": 2, "duree_s": 30, "par_cote": true, "intensite": "tension sans douleur au genou" },
      { "ex": "mq-fente-basse", "nom_fr": "Fente basse genou au sol (fléchisseurs de hanche)", "series": 2, "duree_s": 30, "par_cote": true, "intensite": "bassin rétroversé" },
      { "ex": "mq-squat-profond", "nom_fr": "Tenue de squat profond", "series": 2, "duree_s": 30, "intensite": "appui autorisé" }
    ] },
    "charniere-dynamique": { "duree_min": 1, "items": [
      { "ex": "mq-charniere-baton", "nom_fr": "Charnière de hanche au bâton", "series": 1, "reps": 8, "intensite": "dos neutre, 3 points de contact" },
      { "ex": "1471", "nom_fr": "Inchworm (marche des mains)", "series": 1, "reps": 5, "intensite": "genoux légèrement fléchis si besoin" }
    ] },
    "thoracique-dynamique": { "duree_min": 1, "items": [
      { "ex": "mq-chat-vache", "nom_fr": "Chat-vache", "series": 1, "reps": 8, "intensite": "lent, avec la respiration" },
      { "ex": "mq-open-book", "nom_fr": "Rotation thoracique allongé sur le côté (open book)", "series": 1, "reps": 6, "par_cote": true, "intensite": "genoux serrés" }
    ] },
    "thoracique-autonome": { "duree_min": 4, "items": [
      { "ex": "mq-rouleau-thoracique", "nom_fr": "Extension thoracique sur rouleau", "series": 1, "duree_s": 60, "intensite": "facultatif (MOB-5)" },
      { "ex": "mq-open-book", "nom_fr": "Rotation thoracique allongé sur le côté (open book)", "series": 2, "reps": 8, "par_cote": true, "intensite": "2 s en fin d'amplitude" },
      { "ex": "mq-enfant", "nom_fr": "Posture de l'enfant bras tendus", "series": 2, "duree_s": 30, "intensite": "respiration lente" }
    ] },
    "epaule-dynamique": { "duree_min": 2, "items": [
      { "ex": "mq-cercles-bras", "nom_fr": "Moulinets de bras", "series": 1, "reps": 10, "par_cote": true, "intensite": "par sens, amplitude croissante" },
      { "ex": "mq-passage-epaules", "nom_fr": "Passages d'épaules au bâton ou à l'élastique", "series": 1, "reps": 10, "intensite": "prise large, sans forcer" },
      { "ex": "mq-wall-slide", "nom_fr": "Glissés au mur", "series": 1, "reps": 8, "intensite": "lombaires au mur" }
    ] },
    "epaule-autonome": { "duree_min": 4, "items": [
      { "ex": "mq-passage-epaules", "nom_fr": "Passages d'épaules au bâton ou à l'élastique", "series": 2, "reps": 10, "intensite": "prise qui se resserre progressivement" },
      { "ex": "1346", "nom_fr": "Étirement des dorsaux à genoux", "series": 2, "duree_s": 30, "intensite": "tension sans douleur" },
      { "ex": "mq-pec-porte", "nom_fr": "Étirement des pectoraux à l'encadrement de porte", "series": 2, "duree_s": 30, "par_cote": true, "intensite": "coude à hauteur d'épaule" }
    ] },
    "poignet-dynamique": { "duree_min": 1, "items": [
      { "ex": "1428", "nom_fr": "Cercles de poignets", "series": 1, "reps": 10, "par_cote": true, "intensite": "par sens" },
      { "ex": "mq-prep-poignets", "nom_fr": "Bascules des poignets à quatre pattes", "series": 1, "reps": 10, "intensite": "doigts vers l'avant puis vers les genoux" }
    ] },
    "poignet-autonome": { "duree_min": 2, "items": [
      { "ex": "mq-prep-poignets", "nom_fr": "Bascules des poignets à quatre pattes", "series": 2, "reps": 10, "intensite": "progressif" },
      { "ex": "0721", "nom_fr": "Étirement latéral du poignet", "series": 2, "duree_s": 30, "par_cote": true, "intensite": "tension sans douleur" }
    ] },
    "jambes-course-dynamique": { "duree_min": 2, "items": [
      { "ex": "mq-balancier-avant", "nom_fr": "Balanciers de jambe avant-arrière", "series": 1, "reps": 10, "par_cote": true, "intensite": "amplitude croissante, appui à un mur" },
      { "ex": "mq-balancier-lateral", "nom_fr": "Balanciers de jambe latéraux", "series": 1, "reps": 10, "par_cote": true, "intensite": "amplitude croissante" },
      { "ex": "1460", "nom_fr": "Fentes marchées", "series": 1, "reps": 6, "par_cote": true, "intensite": "buste droit" },
      { "ex": "mq-pogo", "nom_fr": "Rebonds de cheville (pogos)", "series": 1, "reps": 20, "intensite": "contacts courts, genoux presque tendus" }
    ] }
  },
  "routine_autonome": {
    "duree_min_defaut": 10, "duree_min_min": 5, "duree_min_max": 15, "modules_max": 3,
    "modules_par_defaut": ["hanche-autonome", "thoracique-autonome", "cheville-autonome"],
    "zone_vers_module": { "cheville": "cheville-autonome", "mollet": "cheville-autonome", "hanche": "hanche-autonome", "dos": "thoracique-autonome", "epaule": "epaule-autonome", "poignet": "poignet-autonome" }
  },
  "substitutions": [
    { "si_absent": "baton", "remplacer": "mq-passage-epaules", "par": ["mq-cercles-bras"] },
    { "si_absent": "rouleau", "remplacer": "mq-rouleau-thoracique", "par": ["mq-chat-vache"] }
  ]
}
```

## Limites et contre-indications

- Une amplitude qui fait mal (douleur et non tension) : on arrête l'exercice, on n'insiste pas. Douleur qui persiste ou qui revient à chaque séance : orientation vers un professionnel.
- Engourdissement, fourmillements ou faiblesse pendant un exercice : arrêt et orientation médicale (drapeau rouge).
- Aucun module ne vise à corriger une pathologie : ce sont des routines de confort et de préparation.

## Exemple

Utilisatrice, jour de repos, déclare « hanches et dos raides », 10 min disponibles.
Résultat attendu : routine autonome = `hanche-autonome` (5 min) + `thoracique-autonome` (4 min) = 9 min ; pas de 3e module (on dépasserait 10 min). Rappel MOB-4 : 2 à 3 fois par semaine.
