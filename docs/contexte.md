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
| Positionnement marketing | Proposition à valider : athlète hybride (Hyrox en tête) |
| Langue | Français |
| Canal | WhatsApp seul au départ ; documents envoyés dans le chat (xlsx, PDF) ; actions dans les apps (Hevy, montre Garmin) |
| Sources de données | Toutes les apps sauf Strava (ses conditions interdisent l'usage par une IA). Apple Health via Health Auto Export, wearables via Open Wearables, séances sur montre via Garmin Training API |
| Exercices | hasaneyldrm/exercises-dataset (données MIT) ; médias © Gym visual soumis à licence |
| Temps de Pierrot | 1 à 2 h par jour |
| Mécanique centrale | Semaine type + contraintes → modèles de semaines proches → adaptés par les moteurs |
| Échauffement / mobilité | Obligatoires dans toute séance (skill `seance-complete`) |

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

## État au 24/11/2026
- Repo créé et structuré : `CLAUDE.md`, 8 sous-agents, skills `seance-complete` et `fiche-connaissance`, plugins déclarés, MCP Hevy, base d'exercices.
- Aucune fiche de connaissance ni ligne de moteur écrite.

## Prochaines étapes
1. `expert-force` : spécification du moteur force (corriger les 5 erreurs ci-dessus).
2. `expert-sante-physique` : protocoles d'échauffement, mobilité, étirements ; liste des exercices manquants dans le dataset.
3. `developpeur` : moteur force en TypeScript, tests d'abord.
4. `expert-ia` : persona d'aiiron et architecture runtime.

## Questions ouvertes pour Pierrot
- Lvl1/Lvl2 : créés par lui ou par un coach (dossier « Programmes Force Pana ») ?
- Auteur du tableur « Prime Nutrition 2026 » ?
- Positionnement « athlète hybride » : validé ?
