---
id: etirements-regles
domaine: etirements
titre: Règles d'étirement (avant et après l'effort) et catalogue par groupe musculaire
niveau_preuve: A
sources:
  - titre: "Acute effects of muscle stretching on physical performance, range of motion, and injury incidence in healthy active individuals: a systematic review"
    auteurs: "Behm DG, Blazevich AJ, Kay AD, McHugh M."
    annee: 2016
    url: "https://doi.org/10.1139/apnm-2015-0235"
  - titre: "Effect of acute static stretch on maximal muscle performance: a systematic review"
    auteurs: "Kay AD, Blazevich AJ."
    annee: 2012
    url: "https://doi.org/10.1249/MSS.0b013e318225cb27"
  - titre: "Acute effects of static stretching on muscle strength and power: an attempt to clarify previous caveats"
    auteurs: "Chaabene H, Behm DG, Negra Y, Granacher U."
    annee: 2019
    url: "https://doi.org/10.3389/fphys.2019.01468"
  - titre: "Acute effects of dynamic stretching on muscle flexibility and performance: an analysis of the current literature"
    auteurs: "Opplert J, Babault N."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-017-0797-9"
  - titre: "American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise"
    auteurs: "Garber CE, Blissmer B, Deschenes MR, et al."
    annee: 2011
    url: "https://doi.org/10.1249/MSS.0b013e318213fefb"
  - titre: "The effectiveness of post-exercise stretching in short-term and delayed recovery of strength, range of motion and delayed onset muscle soreness: a systematic review and meta-analysis of randomized controlled trials"
    auteurs: "Afonso J, Clemente FM, Nakamura FY, et al."
    annee: 2021
    url: "https://doi.org/10.3389/fphys.2021.677581"
  - titre: "Stretching to prevent or reduce muscle soreness after exercise"
    auteurs: "Herbert RD, de Noronha M, Kamper SJ."
    annee: 2011
    url: "https://doi.org/10.1002/14651858.CD004577.pub3"
  - titre: "The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis of randomised controlled trials"
    auteurs: "Lauersen JB, Bertelsen DM, Andersen LB."
    annee: 2014
    url: "https://doi.org/10.1136/bjsports-2013-092538"
  - titre: "Do we need a cool-down after exercise? A narrative review of the psychophysiological effects and the effects on performance, injuries and the long-term adaptive response"
    auteurs: "Van Hooren B, Peake JM."
    annee: 2018
    url: "https://doi.org/10.1007/s40279-018-0916-2"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Un étirement statique long juste avant un effort de force ou de puissance réduit un peu la performance qui suit. Les revues convergent : en dessous de 60 s par groupe musculaire, la baisse est faible (de l'ordre de 1 à 2 %) et souvent effacée par un échauffement dynamique complet ; au-delà de 60 s, elle devient nette (de l'ordre de 4 à 7,5 %) (Behm 2016 ; Chaabene 2019). Les étirements de moins de 30 s n'ont en général pas d'effet notable (Kay et Blazevich 2012). Avant l'effort, aiiron préfère donc la mobilité dynamique, neutre ou favorable (Opplert et Babault 2018). Après l'effort, les étirements statiques servent au confort et à l'amplitude, pas à la récupération : ils n'accélèrent ni le retour de la force ni la disparition des courbatures (Afonso 2021 ; Herbert 2011). Le niveau A vaut pour les règles ETI-1 et ETI-3 ; les dosages du retour au calme reposent sur la recommandation ACSM (Garber 2011).

## Règles pour aiiron

| Id | Règle | Source / statut |
| --- | --- | --- |
| ETI-1 | Avant une séance de force, puissance, sprint ou un bloc chronométré, aiiron ne prescrit pas d'étirement statique. Si l'utilisateur tient à en faire : **30 s cumulées par groupe musculaire au plus**, placés avant la mobilité dynamique et la partie spécifique, jamais juste avant la première série ou le premier effort. Plafond absolu : 60 s par groupe. | Kay et Blazevich 2012 (< 30 s : pas d'effet notable) ; Behm 2016 et Chaabene 2019 (> 60 s : baisse nette). Le seuil par défaut de 30 s est un choix prudent à valider |
| ETI-2 | Après l'effort (retour au calme) : 1 × 30 s par groupe et par côté pour le confort. Objectif souplesse déclaré : 2 × 30 s par groupe et par côté, soit 60 s cumulées. | Garber 2011 (maintien 10–30 s, 60 s cumulées par exercice) ; skill `seance-complete` (20–60 s) |
| ETI-3 | aiiron ne présente jamais les étirements comme un moyen de récupérer plus vite ou d'éviter les courbatures. | Afonso 2021 ; Herbert 2011 |
| ETI-4 | aiiron ne présente pas les étirements comme une protection contre les blessures. Le renforcement musculaire a un effet protecteur mieux établi. Les données sur les étirements courts intégrés à l'échauffement sont discordantes : on reste neutre. | Lauersen 2014 ; Behm 2016 et Chaabene 2019 (effet possible sur certaines blessures musculaires) |
| ETI-5 | Intensité : tension nette mais jamais douloureuse, sans rebonds, respiration lente. | Garber 2011 |
| ETI-6 | Retour au calme cardio : 3 à 5 min à RPE 2–3 après une séance intense (course, Hyrox, CrossFit) ; facultatif après force et musculation. Il sert au confort, ses effets sur la performance du lendemain sont faibles ou absents. | Van Hooren et Peake 2018 ; durées = heuristique à valider |
| ETI-7 | Choix des groupes : ceux du corps de séance, du plus sollicité au moins sollicité. Standard 5 groupes (≈ 5 min), version courte 3 groupes (≈ 3 min). | Heuristique à valider |
| ETI-8 | Respiration lente allongé, 1 min, en fin de retour au calme : facultative, présentée comme un moment de calme et non comme un outil de récupération. | Heuristique à valider |

### Catalogue des étirements statiques par groupe

```json
{
  "id": "etirements-regles",
  "catalogue_statique": {
    "mollets":                { "ex": "1377", "nom_fr": "Étirement du mollet mains au mur", "par_cote": true },
    "soleaire":               { "ex": "mq-soleaire", "nom_fr": "Étirement du soléaire genou fléchi", "par_cote": true },
    "ischio_jambiers":        { "ex": "1511", "nom_fr": "Étirement des ischio-jambiers", "par_cote": true },
    "quadriceps":             { "ex": "0613", "nom_fr": "Étirement des quadriceps allongé sur le côté", "par_cote": true },
    "flechisseurs_hanche":    { "ex": "mq-fente-basse", "nom_fr": "Fente basse genou au sol", "par_cote": true },
    "fessiers":               { "ex": "1424", "nom_fr": "Étirement des fessiers assis", "par_cote": true },
    "adducteurs":             { "ex": "1494", "nom_fr": "Papillon assis", "par_cote": false },
    "lombaires":              { "ex": "mq-enfant", "nom_fr": "Posture de l'enfant", "par_cote": false },
    "dorsaux":                { "ex": "1346", "nom_fr": "Étirement des dorsaux à genoux", "par_cote": false },
    "pectoraux":              { "ex": "mq-pec-porte", "nom_fr": "Étirement des pectoraux à l'encadrement de porte", "par_cote": true },
    "epaules_arriere":        { "ex": "0669", "nom_fr": "Étirement de l'arrière de l'épaule", "par_cote": true },
    "triceps":                { "ex": "0643", "nom_fr": "Étirement des triceps bras au-dessus de la tête", "par_cote": true },
    "avant_bras":             { "ex": "0721", "nom_fr": "Étirement latéral du poignet", "par_cote": true },
    "cou":                    { "ex": "1403", "nom_fr": "Étirement latéral du cou", "par_cote": true },
    "flancs":                 { "ex": "0794", "nom_fr": "Étirement latéral debout", "par_cote": true }
  },
  "dosage": {
    "avant_effort_max_s_par_groupe": 30,
    "avant_effort_plafond_absolu_s_par_groupe": 60,
    "apres_confort": { "series": 1, "duree_s": 30 },
    "apres_souplesse": { "series": 2, "duree_s": 30 }
  },
  "alternatives": {
    "fessiers": ["2567", "mq-pigeon"],
    "quadriceps": ["1564"],
    "lombaires": ["0690"],
    "pectoraux": ["1271"]
  }
}
```

## Limites et contre-indications

- Douleur pendant un étirement (et non tension) : arrêt de l'exercice. Douleur qui persiste ou revient : orientation vers un professionnel.
- Engourdissement, fourmillements ou perte de force pendant un étirement : arrêt et orientation médicale.
- Personne très souple par nature : l'objectif « souplesse » n'est pas proposé par défaut ; aiiron privilégie le renforcement en fin d'amplitude (à préciser avec expert-force).
- Sport où l'amplitude extrême fait partie de la performance (danse, gymnastique artistique) : hors périmètre de ces règles, les étirements avant effort y sont souvent nécessaires.

## Exemple

Utilisateur : « je fais toujours 1 min d'étirement des ischios avant mon soulevé de terre. »
Résultat attendu : aiiron explique que 60 s et plus par groupe juste avant un effort de force peut baisser un peu la performance, propose de passer à 30 s au plus, placés avant la mobilité dynamique et les paliers (ETI-1), ou de remplacer par le module `charniere-dynamique`.
