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
- Groupe des séries d'approche : premier muscle principal compté en volume, sinon aucun. Lu par `echauffementSeance` dans le moteur volume (`resoudreExercice(id).groupe`), plus donné par l'appelant. Aucune correspondance n'existe entre les identifiants du moteur force (`squat`, `developpe_couche`, variantes) et le catalogue (`0043`, `0025`…) : groupe inconnu → l'exercice est traité comme premier de son groupe et reçoit ses séries d'approche (en attendant le référentiel unique P1).
- `readiness_basse_persistante` absent = faux (pas de deload déclenché sans signal).
- T17 bis (Hyrox) : front squat puis back squat, pas de wall ball ni de thruster (schéma ambigu).
- Renvois JSON `force-paliers-montee-en-charge` sans ancre ; le moteur calcule `premier_du_schema`.
- Moteur volume, `corrections.json` : seules les corrections portant `validee` sont appliquées, en surcouche à la lecture ; une correction validée illisible (champs et valeurs en nombre différent) lève une erreur. Aujourd'hui : `0858` seulement (décision de Pierrot du 25/11/2026 : cardio, hors volume) ; les autres restent des propositions.
- Moteur volume, libellé hors table (`LIBELLE_INCONNU`, décision de Pierrot du 25/11/2026) : le libellé est ignoré avec un avertissement, les autres muscles comptent. Si c'est la cible : secondaires connus comptés, aucun groupe de séries d'approche (choix prudent). Un exercice cardio (cible connue à `null`) ne compte toujours rien.
- Mapping : activation d'échauffement (`mq-ecartes-elastique`, `mq-rotation-externe-elastique`) dans une catégorie hors volume `activation`, à part de la mobilité. `0050` (dentelé seul principal) : comportement conservé (ni volume ni compteur, secondaires comptés).
- Moteur volume, données chargées par import JSON (`engine/src/volume/donnees.ts`) et passées en paramètre aux fonctions ; muscle de surcharge absent de `muscles` → exception (bug de données, couvert par le test de cohérence).
- Moteur volume, sortie : muscles à zéro omis ; drapeaux rattachés à l'exercice (`{ code, exercice }`).

### Décisions du 25/11/2026 sur le runtime
- Hébergement : API Anthropic directe pour le développement, sans donnée réelle ; Claude sur Bedrock UE (profils `eu.`, vérifiés pour Opus, Sonnet et Haiku 5.5) avant la première bêta. Stockage local WhatsApp `DE` dans la checklist de lancement (`docs/architecture.md` §10).
- WhatsApp seul, pas de canal de secours en v1.
- Persona validé : pas d'emoji par défaut, environ 60 mots par message, relances au plus 2 par semaine, rien entre 21 h et 8 h. Transparence : les échanges sont enregistrés et peuvent être relus pour améliorer le service.
- Protocole de crise : `knowledge/sante-mentale/protocole-crise.md`, brouillon jusqu'à validation par Pierrot. Ligne TCA confirmée : 09 69 325 900.
- Identifiant canonique `developpe_couche` (alias `couche`) ; champ `schema` en surcouche (`data/exercises/schemas.json`) ; `js-yaml` pour valider la forme des évaluations.
- Choix techniques mineurs : profils Bedrock `eu.` seulement, modèles épinglés, pas de bascule automatique de modèle ; « 21 h à 8 h » dans le fuseau de l'utilisateur (`Europe/Paris` par défaut) ; textes fixes de crise en un seul message même au-delà de 60 mots ; rappel fixe des ressources à chaque réponse en état crise ; fentes `0336` et hack squat `0046` sans schéma (paliers complets) ; un mélange alias / identifiant canonique dans une même entrée lève une erreur.

### Décisions du 25/11/2026 : public, crise, nutrition, schémas
- Public : 18 ans et plus (âge demandé au premier message), France seulement au lancement.
- Protocole de crise validé pour un test solo ; brouillon maintenu ; relecture par un psychologue ou un psychiatre avant tout utilisateur réel (checklist de lancement).
- Seuil « apport très bas » : `knowledge/nutrition/seuil-apport-tres-bas.md` (brouillon). ≤ 800 kcal/j déclaré ou demandé, ou un signe comportemental → protocole TCA ; planchers 1 200 / 1 500 kcal, disponibilité énergétique < 30 kcal/kg MM, cible sous le métabolisme de base → refus de chiffrer (une cible seulement, voir ci-dessous).
- Schémas R5 : fentes et presses unilatérales sans schéma ; hack squat machine, presses bilatérales et Smith en `squat` ; `0046` et `0047` (incliné 45°) sans schéma ; `couche_incline_30` en `poussee_horizontale`.
- vitest 3.2.7 gardé (décision de Pierrot du 25/11/2026) : les alertes `npm audit` (tinypool critique, @vitest/mocker modéré) restent, risque limité aux outils de test, rien n'est embarqué dans l'application. **Dette : passage à vitest 5.x avant tout déploiement** (case de la checklist de lancement, `docs/architecture.md` §10).
- Choix techniques mineurs : pays déduit de l'indicatif +33, sinon demandé ; seul le refus est enregistré pour un mineur ou hors France ; nutrition : sexe inconnu → homme, âge inconnu → 18 ans, poids de référence 50 kg, dépense inconnue → 0 ; un jour isolé sous 800 kcal déclenche le protocole (faux positif assumé).

### Décisions du 25/11/2026 : machines, nutrition
- R5 à sens unique : barre libre puis machine guidée du même schéma → départ à 60 % ; machine guidée (`sled`, `smith`, `leverage machine` du catalogue) puis barre libre → paliers complets.
- IMC < 18,5 + demande de perte : protocole TCA pour le test solo ; à adoucir avant la bêta (refus de chiffrer + orientation médecin, sans état crise), avec `expert-nutrition` et `expert-sante-mentale` (checklist de lancement).
- Plancher d'énergie : le refus de chiffrer porte sur une cible demandée ou calculée, plus sur un apport déclaré. Un apport déclaré sous le plancher reste un signal du cumul TCA et lève une vigilance non bloquante (signalement `bas`). Seuil TCA (≤ 800 kcal/j) inchangé.
- Après une crise TCA : reprise de la nutrition chiffrée sur décision humaine seulement, plus jamais d'objectif de perte de poids sur ce compte.
- Coupes de poids et cibles prescrites par un médecin : refus de chiffrer et orientation vers un professionnel.
- Choix techniques mineurs : machine puis machine du même schéma → départ à 60 % ; un nombre de kcal ambigu est lu à la fois comme apport et comme cible (le plus prudent des deux) ; perte rapide déclarée et IMC bas gardent `refus_chiffre` (ce ne sont pas des apports déclarés).

### Choix techniques mineurs : squelette d'agent local (`app/`, 25/11/2026)
- Agent SDK `@anthropic-ai/claude-agent-sdk` 0.3.332, `zod` 4.3.6 épinglés. Une requête `query()` par message (pas de session SDK) : l'historique brut des 20 derniers tours est mis dans le message, comme une donnée, en attendant le résumé glissant (§6.2 de l'architecture). Le mode restreint de crise change ainsi de prompt et d'outils d'un message à l'autre.
- Aucune transcription sur disque (`persistSession: false`). Le processus Claude Code reçoit un environnement propre : `PATH`, `TMPDIR`, `LANG`, `ANTHROPIC_API_KEY` (et `ANTHROPIC_BASE_URL` si défini) ; `HOME`, `CLAUDE_CONFIG_DIR` et `cwd` pointent vers un dossier temporaire vide, supprimé à la sortie. `settingSources: []`, `strictMcpConfig: true` (le `.mcp.json` Hevy du repo n'est pas chargé), `tools: []`, `permissionMode: "dontAsk"`.
- Le SDK ajoute de lui-même la ligne « You are a Claude agent, built on Anthropic's Claude Agent SDK. » avant notre prompt système (vu sur un faux serveur local). Aucune option documentée ne la retire (la doc dit pourtant qu'un prompt personnalisé est envoyé seul) : elle est neutralisée par une consigne en tête de `persona/prompt-systeme.md` et `persona/prompt-crise.md`, testée par `evals/identite-01-tes-qui.yaml`. Le bloc d'environnement en anglais (dossier, système, modèle, date), ajouté comme message après celui de l'utilisateur, reste aussi. Retirés via des variables documentées : le bloc `x-anthropic-billing-header` (`CLAUDE_CODE_ATTRIBUTION_HEADER=0`) et l'outil `DeferredToolPlaceholder` (`ENABLE_TOOL_SEARCH=false`, outils chargés d'emblée). Mode bare (`CLAUDE_CODE_SIMPLE=1`) écarté : il retire le bloc d'environnement mais désactive aussi le hook `PreToolUse` de crise (vérifié sur le faux serveur).
- Les e1RM ne sont pas donnés au LLM : le résumé du profil liste seulement les exercices qui ont une référence.
- Outils : matériel absent du profil et de l'entrée → `incomplet` et question (pas de matériel par défaut) ; identifiant hors moteur force → `isError` avec la liste des identifiants acceptés ; une série déclarée (`donnee_initiale`) devient une référence en mémoire seulement (perdue à la fin de la conversation), `readOnlyHint` gardé ; `duree_paliers_min` = durée des paliers arrondie à la minute supérieure ; `repos_affiche` en secondes, ou en minutes pour un multiple de 60 ; barre vide en roumain pour `souleve_de_terre`, `sdt_deficit_5cm`, `sdt_pause_genou`, `sdt_tempo`, `souleve_de_terre_autre_style` (pas `sdt_blocs` ni `sdt_roumain`).
- Guidances des tableaux 4.2 et 4.3 reformulées sans chiffre ni outil absent (« dans les 10 minutes » → « juste après le dernier palier », `signaler_sante` → « arrête de prescrire cet exercice et oriente vers un pro si ça persiste ») ; la ligne « I indéterminable » de 4.3 ne peut pas arriver (la charge de travail exige un e1RM).
- **Classifieur en stub** (`app/src/crise/classifieur.ts`) : il renvoie toujours `normal` et se signale comme stub (ce n'est pas une panne, sinon les exclusions de PC-9 ne s'appliqueraient jamais). Seul le lexique repère donc les crises : les formulations indirectes hors lexique ne sont pas couvertes tant que le vrai classifieur n'existe pas. Filet partiel : les balises `[[ALERTE_…]]` du modèle (prompt système) déclenchent le protocole, après l'appel au LLM ; toute balise `[[ALERTE` mal formée vaut `crise_v1`.
- Lexique de crise en données : `knowledge/sante-mentale/lexique-crise.json` (brouillon, à relire par `expert-sante-mentale`), textes fixes lus dans `protocole-crise.md` (PC-3) au démarrage, jamais recopiés. Lexique appliqué au message seul, pas aux 24 h concaténées (sinon un signal déjà traité se redéclenche) : une phrase coupée en deux messages n'est vue que par le classifieur.
- Idiomes de PC-9 (« je suis mort », « ça m'a tué »…) : signaux de niveau 1 retirés quand le message a un contexte sportif et que les exclusions sont actives ; sans contexte sportif, ou exclusions désactivées, ils déclenchent le doute (niveau 2 dans les 30 jours après une crise). Intentions jamais exclues, faux positifs assumés : « en finir avec ce programme », « disparaître », « adieu », laxatifs ou diurétiques sans mention du poids.
- Doute : « non » seul, « bof », « je sais pas » ne sont pas des démentis ; pas de démenti clair au message suivant → `crise_v1`, type suicide. Signalements dans un journal en mémoire (pas de fichier, pas d'alerte à une personne de garde, qui n'existe pas) ; « relances coupées » est un drapeau, aucune relance n'existe encore.
- Runner des évaluations (`npm run evals`) : juge `claude-opus-5-5` via l'Agent SDK (pas de dépendance de plus), sans outil, `maxTurns: 1`, mêmes réglages isolés que l'agent. Sa sortie JSON est lue dans le texte (pas `outputFormat`, non vérifiable sans clé) ; un verdict manquant ou illisible compte comme un échec. Il reçoit la trace du code (texte fixe, appel au LLM, état, signalements, relances) pour les critères qui portent sur le code. `entrees_outils` est comparé à l'identique (`couche` ne vaut pas `developpe_couche`). Seuil : un cas critique passe N essais sur N, un autre 80 % arrondi au-dessus. Le contrôle de sortie du README (chiffre avec unité venu d'un outil) n'est pas vérifié : il dépend de §5.1, pas encore écrit.

## Réglementaire (résumé)
- Rester bien-être et performance : sinon dispositif médical (MDR, règle 11 → classe IIa minimum).
- Données de santé = RGPD art. 9 : consentement explicite, AIPD, hébergement UE.
- AI Act : dire clairement qu'aiiron est une IA.
- WhatsApp interdit les chatbots généralistes depuis le 15/01/2026 : aiiron reste spécialisé. WhatsApp seul pour l'instant, pas de canal de secours (décision du 25/11/2026) : une suspension du numéro couperait tout accès.
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
- Moteur force écrit (`engine/src/force/`, tests Vitest T1–T3 et T6–T17, `cd engine && npm test`) ; écarts T1 (3 × 4 @ 6 à 117,5 kg) et T6 (haltères 23,2 → 22 avec `ECART_ARRONDI_IMPORTANT`) réglés, plus aucun `it.fails`.
- Moteur volume écrit (`engine/src/volume/`, tests T4, T5, règles MAP et cohérence du mapping v3, `test/volume/`)  ; aucun `it.fails` ouvert (`mq-squat-descentes-lentes` en mobilité hors volume, fiche à 40 exercices `mq-…`).

## Prochaines étapes
1. ~~`developpeur` : moteur force~~ fait (`engine/src/force/`).
2. ~~`developpeur` : moteur volume (comptage par muscle via le mapping, cas T4/T5)~~ fait (`engine/src/volume/`).
3. ~~`expert-ia` : persona d'aiiron et architecture runtime~~ fait (`persona/`, `docs/architecture.md`).
4. Squelette d'agent local fait (`app/`, `npm run chat`) : prompts `persona/prompt-systeme.md` et `prompt-crise.md`, outils `charges` et `echauffement` (paliers seulement), lexique de crise niveaux 1 à 3 (`knowledge/sante-mentale/lexique-crise.json`), classifieur en stub, runner `npm run evals`. Évals jamais jouées contre le vrai modèle (pas de clé au 25/11/2026).
5. Manque avant de passer les 11 évals : drapeau rouge physique (5.2) et `signaler_sante`, `log_series`, compteur hors sujet (5.4), contrôle de sortie (5.1, PC-5 renforcé), vrai classifieur Haiku, chargeur des protocoles d'échauffement (P6). Relectures : lexique de crise par `expert-sante-mentale` ; ligne d'identité ajoutée par l'Agent SDK avant le prompt (« You are a Claude agent… ») par `expert-ia`.

Prérequis du moteur course : compter les sauts et les gammes de course (charge pliométrique). Ils sont hors volume hypertrophie dans le mapping v3 et ne sont suivis par aucun moteur aujourd'hui.

## Questions ouvertes pour Pierrot
Aucune pour l'instant (fermées le 25/11/2026 : Lvl1/Lvl2 et Prime Nutrition viennent de coachs ; positionnement multisport large).
