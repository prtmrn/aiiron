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
- I indéterminable (ni e1RM ni RPE prescrit) : « Lourd » en force, règle courte en musculation, répétition des mouvements en Hyrox/CrossFit.
- Single à RPE 10 → e1RM = charge ; ligne « 1 rep à 100 % » refusée hors test de 1RM. Règle courte musculation ≤ 6 reps sous le seuil : 50 % × 5 · 75 % × 3. Assistance en force sous le seuil : échelles Léger / Modéré.
- Paliers quand le mouvement a déjà été chauffé : si le même schéma a déjà eu ses paliers dans la séance, départ à 60 % ; sinon paliers complets. Même règle en force et en musculation.
- Mobilité dynamique : 4 exercices en standard, 2 en version courte (squat : genou au mur + 90/90). Pas de maintien de 30 s avant la séance (5 à 8 descentes lentes) ; le maintien de 30 s reste au retour au calme et les jours de repos.
- Mapping des muscles : 21 muscles, comptage principal 1 / secondaire 0,5 (niveau de preuve C), agrégat `deltoides`, groupe = premier muscle principal, surcharges « glutes + quadriceps » étendues à tout le dataset. `core` compté à part : hors volume hypertrophie mais visible.
- Validés aussi : demi-points linéaires, seuil de cohérence % / RPE à 0,5, RPE ≥ 7 pour l'e1RM, initialisation (8 semaines, ×0,95), bornes de la remise de contexte, heuristiques d'activation et de répétition des mouvements Hyrox.

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
- Aucune ligne de moteur écrite.

## Prochaines étapes
1. `developpeur` : moteur force en TypeScript, tests d'abord (à partir de `knowledge/force/cas-de-test.md`).
2. `developpeur` : moteur volume (comptage par muscle via le mapping, cas T4/T5).
3. `expert-ia` : persona d'aiiron et architecture runtime.

## Questions ouvertes pour Pierrot
Aucune pour l'instant (fermées le 25/11/2026 : Lvl1/Lvl2 et Prime Nutrition viennent de coachs ; positionnement multisport large).
