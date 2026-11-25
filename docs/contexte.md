# Contexte du projet (passation)

Résumé de la conversation de lancement du 24 novembre 2026 entre Pierrot et Claude. À lire en début de session pour reprendre sans perte de contexte.

Liens :
- Rapport complet Standout → aiiron : https://claude.ai/artifact/FtVXCzRwFpBtJo3iMGzT4g
- Projet Claude « aiiron » : `aiiron-decisions.md`, `aiiron-sources-muscu.md`
- Drive « Ressources muscu » : https://drive.google.com/drive/folders/1v2URBZcTgJoKQSnEJ0Vp5eEJAxs6Eiwi

## D'où vient l'idée

Standout (standout.work, YC Spring 2026) est un « agent talent » : profil construit en conversation (appel vocal, WhatsApp), matching en arrière-plan, intros aux fondateurs, serveur MCP pour être utilisé par ChatGPT/Claude. Ce qu'on reprend :
- le backend décide, le LLM converse (leur API renvoie `assistantGuidance` et `stillToAsk`) ;
- profil vivant qui s'écrase au lieu de s'empiler ;
- agent proactif (événements, relances) ;
- présence là où vit l'utilisateur (WhatsApp d'abord) ;
- la donnée de résultat comme avantage (chez nous : prescrit vs réalisé).

## Décisions

| Sujet | Décision |
| --- | --- |
| Nom | aiiron (aussi le prénom de l'agent). Pas de conflit trouvé ; vérifier EUIPO/INPI et domaines |
| Disciplines | Toutes : force, hypertrophie, Hyrox, CrossFit, course (sprint → trail), nutrition, santé physique, santé mentale |
| Architecture métier | 2 moteurs (force, endurance) qui se combinent pour l'hybride + 2 couches transverses (nutrition, récupération) |
| Positionnement marketing | Message multisport large, pas « athlète hybride » (25/11/2026) |
| Langue | Français |
| Canal | WhatsApp seul au départ ; documents envoyés dans le chat (xlsx, PDF) ; actions dans les apps (Hevy, montre Garmin) |
| Sources de données | Toutes les apps sauf Strava (ses conditions interdisent l'usage par une IA). Apple Health via Health Auto Export, wearables via Open Wearables, séances sur montre via Garmin Training API |
| Exercices | hasaneyldrm/exercises-dataset (données MIT) ; médias © Gym visual soumis à licence. Exercices manquants ajoutés par nous (ids `mq-…`, sans média) dans un fichier séparé ; noms trompeurs corrigés dans un fichier de corrections, données d'origine jamais modifiées |
| Temps de Pierrot | 1 à 2 h par jour |
| Mécanique centrale | Semaine type + contraintes → modèles de semaines proches → adaptés par les moteurs |
| Échauffement / mobilité | Obligatoires dans toute séance (skill `seance-complete`). Version courte : les paliers de montée en charge ne sont jamais supprimés ; la mobilité peut passer de 4 à 2 exercices |
| Sources coachs (Lvl1/Lvl2, Prime Nutrition 2026) | Créés par des coachs : on n'en garde que les principes et les formules publiques, jamais leur structure ni leurs modèles. Aucune ligne de ces Excel dans le repo |

### Décisions du 25/11/2026 sur les specs force et santé physique
- Seuil « lourd » : paliers complets si la série de travail est ≥ 80 % de l'e1RM (I ≥ 0,80), quel que soit le nombre de reps.
- Table RPE : variante prudente n + 0,5.
- Validés tels quels : paliers réduits pour le 2e exercice d’un même schéma (devenu la règle « mouvement déjà chauffé », voir deuxième passe), barre vide en roumain au soulevé de terre, règles e1RM, arrondi, coefficients de variantes, ajustement en séance, deload, échelles et repos des paliers, règle courte musculation, étirements statiques ≤ 30 s avant l'effort, durées d'échauffement, dosages course/mobilité/retour au calme.
- Cas de test T1 à T3 : gardés tels que décrits (reconstitués, pas de lignes d'Excel).

### Décisions du 25/11/2026, deuxième passe
Chemins relatifs à `knowledge/`. Les références complètes sont dans les fiches.
- I indéterminable (ni e1RM ni RPE prescrit) : « Lourd » en force, règle courte en musculation, répétition des mouvements en Hyrox/CrossFit. Sources : aucune étude sur ce cas, choix de prudence (Ribeiro 2020/2021, Wolf 2026). → `force/paliers-montee-en-charge.md` R2.4, `echauffement/echauffement-hyrox-crossfit.md` ECH-H4/H5.
- Single à RPE 10 → e1RM = charge ; ligne « 1 rep à 100 % » refusée hors test de 1RM. Règle courte musculation ≤ 6 reps sous le seuil : 50 % × 5 · 75 % × 3. Assistance en force sous le seuil : échelles Léger / Modéré. Sources : RPE 10 = 1RM, soutenu (Zourdos 2016, niveau C) ; refus à 100 % et assistance : aucune source, heuristiques ; règle courte : structure soutenue (Ribeiro 2020, Enes 2025, niveau C), chiffres 50/75 % sans source. → `force/e1rm.md`, `force/table-rpe.md`, `force/paliers-montee-en-charge.md` (R2, Musculation).
- Paliers quand le mouvement a déjà été chauffé : si le même schéma a déjà eu ses paliers dans la séance, départ à 60 % ; sinon paliers complets. Même règle en force, musculation et Hyrox/CrossFit (troisième passe). Sources : principe soutenu (Neves 2025, niveau C), départ à 60 % sans source. → `force/paliers-montee-en-charge.md` R5.
- Mobilité dynamique : 4 exercices en standard, 2 en version courte (squat : genou au mur + 90/90). Avant la séance, dynamique par défaut (squat : 5 à 8 descentes lentes) ; statique toléré jusqu'à 30 s cumulées par groupe (MOB-1b = ETI-1, quatrième passe) ; le maintien de 30 s reste la forme par défaut au retour au calme et les jours de repos. Sources : mobilité dynamique et petit volume soutenus (Behm 2011, Turki 2012, Ryan 2014) ; nombre 4/2, 90/90 et « 5 à 8 descentes » sans source ; genou au mur partiellement soutenu (Kim 2015) ; tolérance de 30 s alignée sur la littérature (Kay 2012). → `mobilite/mobilite-modules.md` MOB-1/1b, `etirements/etirements-regles.md`.
- Mapping des muscles : 21 muscles, comptage principal 1 / secondaire 0,5 (niveau de preuve C), agrégat `deltoides`, groupe = premier muscle principal, surcharges « glutes + quadriceps » étendues à tout le dataset. `core` compté à part : hors volume hypertrophie mais visible. Sources : comptage 0,5 soutenu (Pelland 2024, Remmert 2025, préprints, niveau C) ; surcharges soutenues pour le squat barre (Kubo 2019, Plotkin 2023, niveau B), extrapolées aux autres exercices ; liste des 21 muscles, groupe = premier principal et `core` à part : choix de conception sans source. → `hypertrophie/mapping-muscles.md`.
- Validés aussi : demi-points linéaires, seuil de cohérence % / RPE à 0,5, RPE ≥ 7 pour l'e1RM, initialisation (8 semaines, ×0,95), bornes de la remise de contexte, heuristiques d'activation et de répétition des mouvements Hyrox. Sources : demi-points (Zourdos 2016) ; seuil 0,5 et RPE ≥ 7 partiellement soutenus (Helms 2017, Zourdos 2021, Halperin 2022), coupures sans source ; 8 semaines et ×0,95 sans source (McMaster 2013 et Bosquet 2013 portent sur l'arrêt de l'entraînement) ; remise de contexte : principe soutenu (Simão 2012, Nunes 2021), bornes sans source ; activation partiellement soutenue (Crow 2012, Parr 2017, Jeffreys 2017). → `force/table-rpe.md`, `force/e1rm.md`, `force/variantes-discounts.md` R4, `echauffement/` ECH-F3/M3/H3.

### Décisions du 25/11/2026, troisième passe
- Paliers : « mouvement déjà chauffé » étendu au Hyrox/CrossFit ; exercice lourd sans schéma = l'exercice lui-même ; la répétition ECH-H4 et la règle courte M2 ne comptent pas comme « a eu ses paliers ». Plus aucune mention « à valider » dans `force/`.
- Mobilité : listes de 4 exercices validées (soulevé de terre : charnière au bâton, world's greatest stretch, 90/90, inchworm ; course : balanciers, pogos, world's greatest stretch, remplacement prévu pour les débutants en reprise). Descentes lentes = `mq-squat-descentes-lentes`, distinct de `mq-squat-profond` (tenue 30 s), pour ne pas mélanger l'historique.
- Mapping v3 : presse et hack squat (`0739` compris) → quadriceps principal, fessiers secondaire (Kubo 2019 porte sur le squat profond, pas sur la presse). Étirements à zéro volume (bug : `1709`, `1710` comptaient en fessiers). `0624`, `0551` → compteur `core` ; `0642`, `0661` restent des pompes (pectoraux). Sauts hors volume, sans compteur pliométrie pour l'instant. Coiffe et dentelé : listés, sans compteur. Charnières et hip thrusts revus.

### Décisions du 25/11/2026, quatrième passe
- Statique avant séance : toléré jusqu'à 30 s cumulées par groupe, le dynamique reste la règle par défaut ; MOB-1b et ETI-1 disent la même chose.
- Activation : « par défaut, supprimable » en force et en Hyrox/CrossFit (ECH-F3, ECH-H3), comme Jeffreys 2017 ; champ `supprimable: true` sur les étapes d'activation (musculation comprise, déjà facultative). Les paliers restent obligatoires.
- Paliers : échelles de 5 à 6 paliers conservées ; la fiche dit que c'est de la prudence et de la technique, pas un gain démontré (Wolf 2024/2026).

### Choix techniques mineurs (règle : option la plus prudente, notée ici)
- Mobilité (23 exercices), gammes de course (8) et cardio : hors volume hypertrophie, comme les étirements (sinon `mq-respiration` comptait en abdominaux, `mq-chat-vache` en lombaires).
- Ponts et hip thrusts : ischio-jambiers retirés (Plotkin 2023), pas gardés à 0,5. Charnières jambes tendues : ischio-jambiers + fessiers principaux (Bourne 2017).
- Épaulés, arrachés, lancers de médecine-ball : pas classés comme sauts. Cas limites `0744`, `0749`, `0130`, `0484`, `0756` détaillés dans `hypertrophie/mapping-muscles.md`.
- Groupe des séries d'approche : premier muscle principal compté en volume, sinon aucun.
- `readiness_basse_persistante` absent = faux (pas de deload déclenché sans signal).
- T17 bis (Hyrox) : front squat puis back squat, pas de wall ball ni de thruster (schéma ambigu).
- Renvois JSON `force-paliers-montee-en-charge` sans ancre ; le moteur calcule `premier_du_schema`.

## Réglementaire (résumé)
- Rester bien-être et performance : sinon dispositif médical (MDR, règle 11 → classe IIa minimum).
- Données de santé = RGPD art. 9 : consentement explicite, AIPD, hébergement UE.
- AI Act : dire clairement qu'aiiron est une IA.
- WhatsApp interdit les chatbots généralistes depuis le 15/01/2026 : aiiron reste spécialisé, canal de secours prévu.
- Santé mentale : pas de thérapie (un chatbot thérapeute est un dispositif médical) ; protocole de crise obligatoire.

## Audit des Excel de Pierrot (détail dans `aiiron-sources-muscu.md`)
Fichiers propres utilisables comme inspiration : Powerlifter Lvl1/Lvl2, Push/Pull Fullbody, Set counts, Prime Nutrition 2026. Programmes payants de tiers (Nippard, Buttermore, Delavier, Helms…) : principes seulement.

Erreurs trouvées, à utiliser comme cas de test des moteurs :
1. Lvl1 : la semaine « DELOAD » contient des singles à RPE 9–10.
2. Lvl1/Lvl2 : % saisis à la main (charge d'origine / 1RM d'origine), incohérents avec les RPE prescrits ; RPE manquants.
3. Push/Pull : discount OHP annoncé −6 %, appliqué ≈ −2 %, et pas partout.
4. Set counts « Semaine libre » : double comptage (recherche par sous-chaîne) — Quads 12 au lieu de 6, Glutes 12 au lieu de 6.
5. Set counts « Workout » : colonne Muscles décalée d'une ligne.

Logique nutrition retenue : métabolisme de base (Black, Harris-Benedict, Mifflin-St Jeor, Cunningham) × (activité + fréquence d'exercice) ± ajustement ; protéines 2,3 g/kg de masse maigre (2,2 g/kg sans % de gras), lipides 1 g/kg, glucides = reste.

## État au 25/11/2026
- Repo créé et structuré : `CLAUDE.md`, 8 sous-agents, skills `seance-complete` et `fiche-connaissance`, plugins déclarés, MCP Hevy, base d'exercices.
- Spécification du moteur force écrite (`knowledge/force/`, brouillon) avec cas de test T1–T17.
- Protocoles d'échauffement, mobilité et étirements par type de séance (`knowledge/echauffement/`, `mobilite/`, `etirements/`), exercices manquants ajoutés (`data/exercises/exercices-aiiron.json`) et corrections du dataset (`data/exercises/corrections.json`).
- Mapping des muscles (`knowledge/hypertrophie/mapping-muscles.json`) pour le moteur volume.
- Moteur force écrit (`engine/src/force/`, tests Vitest T1–T3 et T6–T17, `cd engine && npm test`) ; écart T1 réglé (3 × 4 @ 6 à 117,5 kg) ; reste un écart fiche ↔ code marqué `it.fails` : T6, haltères 23,2 → 22 (la fiche n'a pas de drapeau, le code lève `ECART_ARRONDI_IMPORTANT`, −5,17 % > 5 % selon R3).

## Prochaines étapes
1. ~~`developpeur` : moteur force~~ fait (`engine/src/force/`).
2. `developpeur` : moteur volume (comptage par muscle via le mapping, cas T4/T5).
3. `expert-ia` : persona d'aiiron et architecture runtime.

Prérequis du moteur course : compter les sauts et les gammes de course (charge pliométrique). Ils sont hors volume hypertrophie dans le mapping v3 et ne sont suivis par aucun moteur aujourd'hui.

## Questions ouvertes pour Pierrot
Aucune pour l'instant (fermées le 25/11/2026 : Lvl1/Lvl2 et Prime Nutrition viennent de coachs ; positionnement multisport large).
