---
id: sante-physique-exercices-manquants
domaine: sante-physique
titre: Exercices d'échauffement, de mobilité, d'étirement et de gammes absents du dataset
niveau_preuve: E
sources:
  - titre: "exercises-dataset (données MIT), version épinglée dans data/exercises/exercises.json"
    auteurs: "hasaneyldrm"
    annee: 2025
    url: "https://github.com/hasaneyldrm/exercises-dataset"
statut: brouillon
auteur_agent: expert-sante-physique
derniere_revue: 2026-11-25
---

## Principe

Les protocoles de `knowledge/echauffement/`, `knowledge/mobilite/` et `knowledge/etirements/` référencent les exercices par identifiant. Un identifiant à 4 chiffres pointe vers `data/exercises/exercises.json` ; un identifiant `mq-…` désigne un exercice absent du dataset, ou présent seulement sous un nom ou une description qui ne correspond pas. Cette liste sert de cahier des charges pour créer ces exercices (nom, catégorie, muscles, matériel, consignes, média). Recherche faite par mots-clés sur `nom_en` (stretch, roll, mobility, circle, swing, skip, row, bike, sled, plank, bridge, etc.) le 25/11/2026.

## Règles pour aiiron

| Id | Règle | Statut |
| --- | --- | --- |
| EXM-1 | Tant qu'un exercice `mq-…` n'existe pas en base, le moteur affiche `nom_fr` et une consigne courte rédigée par expert-sante-physique, sans média. | Choix de conception à valider |
| EXM-2 | « Plus proche dans le dataset » est une suggestion de remplacement provisoire, pas un équivalent. Le moteur ne l'utilise que si `mq-…` est indisponible et que l'exercice proche ne figure pas dans la colonne « à éviter ». | Choix de conception à valider |
| EXM-3 | Les identifiants `mq-…` sont stables : ils deviendront les clés des nouveaux exercices (ou un alias vers eux). | Choix de conception à valider |

## Liste : 39 exercices manquants

### Cardio d'échauffement et de retour au calme (5)

| Id | Nom français | Nom anglais probable | Catégorie | Muscles ciblés | Matériel | Plus proche dans le dataset | Utilisé dans |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mq-rameur | Rameur | Rowing machine / rowing ergometer | cardio | corps entier, dorsaux, quadriceps | rameur | aucun (2142 ski ergometer) | échauffement force, hyrox |
| mq-air-bike | Vélo à air (assault bike) | Air bike / fan bike | cardio | quadriceps, épaules | vélo à air | 0798 stationary bike walk. **À éviter : 0003 « air bike » est un crunch abdominal** | substitutions |
| mq-footing | Footing facile | Easy jog | cardio | membres inférieurs | aucun | 0685 run (course sur place) | échauffement et retour au calme course |
| mq-marche | Marche | Walking | cardio | membres inférieurs | aucun | 3666 walking on incline treadmill | retour au calme hyrox |
| mq-acceleration | Accélération progressive (ligne droite) | Strides / build-ups | gammes de course | membres inférieurs | aucun | **À éviter : 0858 « wind sprints » est classé abdominaux** | échauffement course |

### Gammes de course (8)

| Id | Nom français | Nom anglais probable | Catégorie | Muscles ciblés | Matériel | Plus proche dans le dataset | Utilisé dans |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mq-montees-genoux | Montées de genoux en avançant | High knees (moving) | gammes de course | fléchisseurs de hanche, mollets | aucun | 3636 high knee against wall (sur place) | échauffement course |
| mq-talons-fesses | Talons-fesses | Butt kicks | gammes de course | ischio-jambiers, mollets | aucun | aucun | échauffement course |
| mq-pas-chasses | Pas chassés latéraux | Lateral shuffle | gammes de course | abducteurs, adducteurs, mollets | aucun | aucun | échauffement course |
| mq-skipping-a | Skipping A | A-skip | gammes de course | fléchisseurs de hanche, mollets | aucun | 3636 high knee against wall | échauffement course |
| mq-skipping-b | Skipping B (jambe griffée) | B-skip | gammes de course | ischio-jambiers, fléchisseurs de hanche | aucun | aucun | échauffement course |
| mq-pas-croises | Pas croisés | Carioca / grapevine | gammes de course | adducteurs, abducteurs, obliques | aucun | aucun | échauffement course (débutant) |
| mq-foulees-bondissantes | Foulées bondissantes | Bounding | gammes de course | fessiers, quadriceps, mollets | aucun | 1472 forward jump | échauffement course |
| mq-pogo | Rebonds de cheville (pogos) | Pogo hops / ankle hops | gammes, pliométrie légère | mollets, tendon d'Achille | aucun | 2612 jump rope | mobilité course |

### Mobilité (17)

| Id | Nom français | Nom anglais probable | Catégorie | Muscles ciblés | Matériel | Plus proche dans le dataset | Utilisé dans |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mq-genou-mur | Genou au mur (cheville) | Knee-to-wall ankle mobilization | mobilité cheville | mollets, soléaire | mur | 1377 calf stretch with hands against wall | modules cheville |
| mq-90-90 | Bascules de hanche 90/90 | 90/90 hip switch | mobilité hanche | rotateurs de hanche, fessiers | aucun | 2567 seated piriformis stretch | modules hanche |
| mq-squat-profond | Tenue de squat profond | Deep squat hold | mobilité hanche, cheville | adducteurs, fessiers, mollets | aucun (appui possible) | 1760 dumbbell goblet squat, 1685 squat to overhead reach | modules hanche |
| mq-charniere-baton | Charnière de hanche au bâton | Hip hinge drill with dowel | mobilité, apprentissage du geste | ischio-jambiers, fessiers, érecteurs | bâton | 0044 barbell good morning (chargé, à éviter en échauffement) | module charnière |
| mq-chat-vache | Chat-vache | Cat-cow | mobilité colonne | érecteurs, abdominaux | aucun | aucun | module thoracique |
| mq-open-book | Rotation thoracique allongé (open book) | Open book / side-lying thoracic rotation | mobilité thoracique | obliques, pectoraux | aucun | 1358 side lying floor stretch | modules thoraciques |
| mq-rouleau-thoracique | Extension thoracique sur rouleau | Foam roller thoracic extension | mobilité thoracique, auto-massage | érecteurs thoraciques | rouleau | aucun (les exercices « roller » du dataset sont des étirements, pas de l'auto-massage) | module thoracique autonome |
| mq-cercles-bras | Moulinets de bras | Arm circles | mobilité épaule | deltoïdes | aucun | 1167 dynamic chest stretch (male) | module épaule |
| mq-passage-epaules | Passages d'épaules au bâton ou à l'élastique | Shoulder pass-through / dislocates | mobilité épaule | deltoïdes, pectoraux | bâton ou élastique | aucun | modules épaule |
| mq-wall-slide | Glissés au mur | Wall slides | mobilité et activation scapulaire | trapèzes inférieurs, dentelé | mur | 1017 band y-raise | module épaule |
| mq-prep-poignets | Bascules des poignets à quatre pattes | Quadruped wrist rocks | mobilité poignet | fléchisseurs et extenseurs de l'avant-bras | aucun | 1428 wrist circles, 0721 side wrist pull stretch | modules poignet |
| mq-balancier-avant | Balanciers de jambe avant-arrière | Front-to-back leg swings | mobilité dynamique hanche | ischio-jambiers, fléchisseurs de hanche | appui mural | aucun | module jambes course |
| mq-balancier-lateral | Balanciers de jambe latéraux | Lateral leg swings | mobilité dynamique hanche | adducteurs, abducteurs | appui mural | aucun | module jambes course |
| mq-pigeon | Pigeon au sol | Pigeon stretch | mobilité, étirement hanche | fessiers, rotateurs de hanche | aucun | 1710 assisted lying gluteus and piriformis stretch, 2567 | module hanche autonome |
| mq-fente-basse | Fente basse genou au sol | Half-kneeling hip flexor stretch | étirement hanche | fléchisseurs de hanche, quadriceps | coussin | **À éviter : 1564 « hip flexor and quad stretch » décrit en fait un étirement du quadriceps debout avec corde** | module hanche, catalogue |
| mq-enfant | Posture de l'enfant | Child's pose | étirement dos | dorsaux, érecteurs | aucun | 1346 kneeling lat stretch | module thoracique, catalogue |
| mq-soleaire | Étirement du soléaire genou fléchi | Bent-knee calf (soleus) stretch | étirement | soléaire | mur | 1377 calf stretch with hands against wall | module cheville, catalogue |

### Étirements et retour au calme (2)

| Id | Nom français | Nom anglais probable | Catégorie | Muscles ciblés | Matériel | Plus proche dans le dataset | Utilisé dans |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mq-pec-porte | Étirement des pectoraux à l'encadrement de porte | Doorway pec stretch | étirement | pectoraux, deltoïdes antérieurs | encadrement de porte | 1271 chest and front of shoulder stretch (bras croisés devant, autre geste), 1405 back pec stretch | module épaule, catalogue |
| mq-respiration | Respiration lente allongé, jambes fléchies | Supine diaphragmatic breathing | retour au calme | diaphragme | tapis | aucun | retour au calme force |

### Activation (2)

| Id | Nom français | Nom anglais probable | Catégorie | Muscles ciblés | Matériel | Plus proche dans le dataset | Utilisé dans |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mq-ecartes-elastique | Écartés à l'élastique | Band pull-apart | activation | rhomboïdes, deltoïdes postérieurs | élastique | 0993 band reverse fly (élastique fixé, geste proche) | échauffement force, musculation |
| mq-rotation-externe-elastique | Rotation externe d'épaule à l'élastique | Band external rotation | activation | infra-épineux, petit rond | élastique | 0235 cable standing shoulder external rotation, 0863 dumbbell lying external shoulder rotation | échauffement force |

### Mouvements Hyrox repris dans la répétition des mouvements (5)

| Id | Nom français | Nom anglais probable | Catégorie | Muscles ciblés | Matériel | Plus proche dans le dataset | Utilisé dans |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mq-traineau-pousse | Poussée de traîneau | Sled push | station Hyrox | quadriceps, fessiers, mollets | traîneau | aucun. **À éviter : les exercices « sled » du dataset sont des presses à cuisses** | échauffement hyrox |
| mq-traineau-tire | Tirage de traîneau | Sled pull | station Hyrox | dorsaux, biceps, ischio-jambiers | traîneau, corde | aucun | échauffement hyrox |
| mq-wall-ball | Wall ball | Wall ball shot | station Hyrox, CrossFit | quadriceps, fessiers, épaules | medecine-ball, cible | 0550 kettlebell thruster | échauffement hyrox |
| mq-burpee-saut-longueur | Burpee saut en longueur | Burpee broad jump | station Hyrox | corps entier | aucun | 1160 burpee | échauffement hyrox |
| mq-fentes-sac | Fentes marchées avec sac | Sandbag walking lunges | station Hyrox | quadriceps, fessiers | sac lesté | 1460 walking lunge | échauffement hyrox |

Total : 5 + 8 + 17 + 2 + 2 + 5 = **39**.

## Exercices présents mais à corriger dans le dataset (pas de modification ici)

| Id | Nom | Problème | Effet dans nos protocoles |
| --- | --- | --- | --- |
| 0003 | air bike | Crunch abdominal en pédalage, pas un vélo à air | Jamais utilisé comme cardio |
| 0858 | wind sprints | Classé `waist` / `abs` ; les étapes décrivent un sprint | Non utilisé ; `mq-acceleration` à la place |
| 0685 | run | Course sur place, pas un footing | Proche provisoire de `mq-footing` seulement |
| 3021 | scapula push-up | Les étapes en français décrivent une pompe classique (poitrine vers le sol), pas une pompe scapulaire bras tendus | Utilisé : consigne « bras tendus » ajoutée dans nos protocoles ; étapes à réécrire |
| 1564 | intermediate hip flexor and quad stretch | Le nom parle des fléchisseurs de hanche, les étapes décrivent un étirement du quadriceps debout avec corde | Utilisé seulement comme alternative quadriceps |
| 1271 | chest and front of shoulder stretch | Étapes : bras croisés tendus devant, geste qui étire plutôt le haut du dos | Alternative provisoire seulement |
| 0738 à 0744, 1391, 1392, 1425, 1463, 1464, 2334 | sled … | « sled » = presse à cuisses ou hack squat, pas un traîneau | Jamais utilisés pour le Hyrox |

## Exercices du dataset utilisés tels quels (pour mémoire)

Cardio : 0798, 2141, 2142, 2612, 3666. Mobilité et activation : 0276, 0688, 0721, 1346, 1368, 1428, 1460, 1471, 1604, 3013, 3021. Étirements : 0613, 0643, 0669, 0690, 0794, 1377, 1403, 1424, 1494, 1511, 2567. Substitutions : 0235, 0863, 3636.

## Limites et contre-indications

- Cette liste couvre uniquement les exercices référencés par nos protocoles. D'autres manques (stations Hyrox complètes, gymnastique CrossFit) relèvent de expert-force et expert-course.
- Les consignes des nouveaux exercices devront rester dans le cadre bien-être : aucune consigne « thérapeutique ».

## Exemple

Le moteur construit l'échauffement d'un fractionné et rencontre `mq-skipping-b`. L'exercice n'existe pas en base et n'a pas de proche : il affiche « Skipping B, 2 × 20 m » avec la consigne courte, sans média (EXM-1).
