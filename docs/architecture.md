# Architecture

## Deux équipes d'agents
1. **Construction** (ce repo, Claude Code) : la session principale orchestre les sous-agents de `.claude/agents/` qui produisent connaissances, persona et code.
2. **Production** (Claude Agent SDK) : aiiron est le seul interlocuteur de l'utilisateur. Il appelle des outils typés vers `engine/` et consulte des sous-agents experts quand c'est utile. Les sous-agents ne délèguent pas entre eux.

## Flux cible
WhatsApp → aiiron (LLM + outils) → moteurs (`engine/`) + mémoire (Postgres UE) + données (Hevy, Open Wearables, Health Auto Export) → réponse, documents (PDF/xlsx), séances poussées sur Hevy ou la montre (Garmin Training API).

Statut des sections suivantes : **brouillon** (`expert-ia`, 25/11/2026). La partie code (`app/`) revient à `developpeur`.

---

## 1. Chaîne de traitement d'un message

```
Webhook WhatsApp (POST)
  1. vérifier X-Hub-Signature-256 ; sinon 401, rien n'est traité
  2. dédoublonner sur l'id du message (wamid) ; répondre 200 tout de suite
  3. mettre en file (traitement asynchrone, un utilisateur à la fois)
Worker
  4. regrouper les messages envoyés en rafale (fenêtre courte, voir choix mineurs)
  5. garde-fous d'entrée : lexique déterministe + classifieur (Haiku)   → section 5
  6. routage déterministe :
       crise / drapeau rouge   → texte fixe, sans LLM, conversation signalée
       douleur                 → signaler_sante (code), puis LLM avec consigne
       hors sujet / médical    → LLM avec consigne de refus et de recentrage
       normal                  → LLM
  7. aiiron (Agent SDK, Sonnet) + outils typés → moteurs engine/
  8. contrôle de sortie déterministe (chiffres non sourcés, lexique interdit)
  9. envoi WhatsApp (texte ou document), journal des coûts
```

Les étapes 1 à 6 et 8 sont du code, testé. Le LLM n'intervient qu'aux étapes 5 (classifieur) et 7.

## 2. Configuration de l'Agent SDK

Paquet `@anthropic-ai/claude-agent-sdk` (TypeScript, comme `engine/`). Les outils sont déclarés avec `tool()` (schémas Zod) et regroupés dans un serveur MCP en processus (`createSdkMcpServer`), nom de serveur `aiiron` : les outils s'appellent `mcp__aiiron__charges`, etc.

Réglages imposés en production :
- `tools: []` : aucun outil intégré (pas de Bash, Read, WebSearch…). aiiron n'a que ses outils.
- `allowedTools: ["mcp__aiiron__*"]`, tout le reste refusé.
- `settingSources: []` : ne charger ni `CLAUDE.md`, ni `.claude/` du repo. Sinon l'équipe de construction et ses consignes entreraient dans le contexte de production.
- `systemPrompt` assemblé ainsi : persona (`persona/`) + limites + règles d'usage des outils (partie fixe, mise en cache) puis résumé du profil et de la conversation (partie variable, après le point de cache).
- Outils marqués `alwaysLoad: true` : ils sont peu nombreux, et la recherche d'outils différée ajouterait un aller-retour à chaque tour.
- `readOnlyHint: true` sur `charges`, `echauffement` et `programme` (calcul pur) : appels parallèles possibles.
- Les handlers renvoient `structuredContent` (JSON exact). En TypeScript, quand `structuredContent` est présent, les blocs texte de `content` ne parviennent pas au modèle : tout ce que le LLM doit lire va dans `structuredContent`.
- Erreurs : le handler attrape ses exceptions et renvoie `isError: true` avec un message qui dit au LLM quoi faire (« demande l'exercice exact », etc.).
- Sous-agents experts : **aucun en v1**. Les connaissances utiles au premier chat force sont dans les moteurs et les fiches chargées par les outils. Des sous-agents (option `agents`) viendront pour la révision hebdomadaire, où la latence compte moins.

## 3. Choix des modèles

Prix officiels relevés le 25/11/2026 (USD par million de tokens, entrée / sortie, lecture de cache) : Opus 5.5 4 / 20 (0,20) ; Sonnet 5.5 2 / 10 (0,10) ; Haiku 5.5 0,10 / 0,50 (0,01) jusqu'à 100 000 tokens de prompt, puis 0,50 / 2,50. Batch : −50 %, **sur l'API directe seulement**. Sur Bedrock, les profils régionaux (UE) coûtent 10 % de plus que le profil global, et il n'y a ni Batch ni Flex pour ces trois modèles (section 7.1).

| Rôle | Modèle | Pourquoi |
| --- | --- | --- |
| Classifieur des garde-fous (chaque message entrant) | `claude-haiku-5-5` | Appelé à chaque message, il doit être le moins cher et le plus rapide. Tâche fermée (une étiquette, une zone, une confiance), sortie JSON. Prompt court, très loin du seuil des 100 000 tokens. Ne décide jamais seul : le lexique déterministe tourne en parallèle (section 5). |
| Conversation (aiiron) | `claude-sonnet-5-5` | La qualité du ton, le respect des limites et la fiabilité des appels d'outils comptent plus que quelques dixièmes de seconde sur WhatsApp. 20 fois moins cher qu'Opus en entrée, avec un cache à 0,05× du prix d'entrée. |
| Échanges simples (accusé de log, confirmation) | Sonnet en v1 | Passage à Haiku seulement s'il réussit **toutes** les évaluations : on ne route pas vers un petit modèle avant d'avoir mesuré. |
| Révision hebdomadaire, génération de bloc | `claude-opus-5-5` | Raisonnement long sur l'historique (prescrit vs réalisé), pas de contrainte de latence. Exécutée dans notre propre file, au tarif standard : Bedrock UE n'a ni Batch ni Flex pour Opus 5.5 (section 7.1). |
| Juge des évaluations | `claude-opus-5-5` | Hors production. Un juge différent du modèle évalué limite la complaisance. |

**Estimation du coût LLM par utilisateur actif** (hypothèses à mesurer : environ 87 messages entrants par mois, 1,6 appel de modèle par tour, environ 10 000 tokens de prompt fixe, 2 000 tokens variables, 250 tokens de sortie, environ 40 reprises après expiration du cache de 5 minutes) : conversation environ 2 $ par mois, classifieur moins de 0,05 $, révision hebdomadaire environ 1 $ (40 000 tokens en entrée, 4 000 en sortie, 4,3 fois par mois, sans lot). Soit environ 3 $ par mois et par utilisateur actif au tarif global, et **environ 3,3 $ sur Bedrock UE (+10 %), hors WhatsApp**. C'est un ordre de grandeur, pas une promesse : la grille AWS des modèles 5.5 en UE n'a pas été relevée.

**Mesure** : chaque appel enregistre modèle, tokens d'entrée, de lecture et d'écriture de cache, tokens de sortie et identifiant interne de l'utilisateur (jamais le numéro). Les webhooks de statut WhatsApp donnent la catégorie tarifaire de chaque message envoyé. L'admin affiche le coût par utilisateur et par semaine.

## 4. Outils du premier chat force

### 4.1 Le contrat commun (patron Standout)

Le backend décide, le LLM converse. Chaque outil renvoie, en plus de son résultat :

```ts
type Retour<T> = {
  statut: "ok" | "incomplet" | "refuse" | "indisponible";
  resultat: T | null;
  drapeaux: Drapeau[];   // codes du moteur, liste fermée (engine/src/force/types.ts)
  guidance: string[];    // consignes de formulation pour le LLM, écrites par le code
  still_to_ask: { cle: string; question: string }[]; // ce qui manque, dans l'ordre où le demander
};
```

Règles d'usage écrites dans le prompt système :
1. Tout chiffre d'une charge, d'un %, d'un e1RM ou d'une durée affiché à l'utilisateur vient du `resultat` d'un outil appelé dans le tour, recopié tel quel.
2. Les chiffres passés **en entrée** d'un outil viennent du message de l'utilisateur ou du profil, recopiés. Le LLM ne transforme jamais un chiffre (pas de conversion, pas de « dur » → RPE 9).
3. `guidance` se suit, mais ne se recopie pas mot pour mot.
4. Une seule question de `still_to_ask` par message, la première.
5. Sans résultat d'outil, pas de chiffre : aiiron dit ce qui manque.

Le contrôle de sortie (section 5.1, dernière ligne) vérifie la règle 1 dans le code.

**Identifiants d'exercices.** Le moteur force utilise des identifiants comme `squat`, `developpe_couche`, `souleve_de_terre`, `squat_pause_2s` (`engine/src/force/variantes.ts`), les mêmes que les fiches d'échauffement, de mobilité et de retour au calme ; `couche` reste accepté en entrée et normalisé par `normaliserExercice`. Le catalogue `data/exercises/` utilise des ids numériques (`0043`) et `mq-…` ; le schéma R5 vient de la surcouche `data/exercises/schemas.json` (`schemaExercice`). Il faut toujours un référentiel unique (section 4.6, prérequis P1).

### 4.2 `charges`

e1RM / reps / RPE / matériel → charge arrondie et drapeaux.

```ts
import type { Materiel, Drapeau, Phase } from "engine/src/force";

type ChargesEntree = {
  exercice: string;                        // identifiant moteur force
  lignes: { reps: number; rpe?: number; pct?: number }[]; // pct en fraction (0,85)
  phase?: Exclude<Phase, "test_1rm">;      // le test de 1RM est hors périmètre du chat v1
  materiel?: Materiel;                     // sinon : profil
  remise_contexte?: number;                // 0,80 à 1, défaut 1 (fournie par un modèle de séance)
  donnee_initiale?:                        // seulement des chiffres dits par l'utilisateur
    | { type: "1rm"; valeur: number; semaines?: number }
    | { type: "reps_a_fond"; charge: number; reps: number };
};

type ChargesResultat = {
  exercice: string;
  e1rm_affiche_kg: number | null;          // arrondi d'affichage à 0,5 kg, jamais réinjecté
  source_e1rm: "reference" | "variante" | "donnee_initiale" | "aucune";
  lignes: { reps: number; rpe: number | null; charge_kg: number | null; drapeaux: Drapeau[] }[];
};
```

Fonctions appelées (noms réels de `engine/src/force/`), dans l'ordre de `knowledge/force/moteur-force.md` :
1. références de l'utilisateur lues en base ; `e1rmExercice(exercice, refs)` (initialisation paresseuse par variante) ;
2. si `null` et `donnee_initiale` : `referenceInitiale(donnee_initiale)`, enregistrée avec la provenance `declare` ;
3. `e1rmEffectif(e1rm, remise_contexte)` ;
4. pour chaque ligne : `chargeLigne(e1rmEffectif, materiel, ligne, phase)` (qui passe par `chargeCible`, seule fonction qui calcule une charge) ;
5. si une restriction « douleur » est active sur l'exercice dans le profil : aucun calcul, drapeau `DOULEUR`, `statut: "refuse"`.

La charge brute (`brute`) n'est pas renvoyée au LLM : il n'a pas à citer de chiffre non arrondi.

| Cas | Statut | `guidance` (consigne de formulation) | `still_to_ask` |
| --- | --- | --- | --- |
| e1RM inconnu, pas de donnée initiale | `incomplet` | « Pas de charge sans donnée : n'en propose aucune. Explique en une phrase qu'il te faut une série récente. » | `1rm_ou_serie_a_fond.<exercice>` : « Tu te souviens d'une série récente au [exercice] : charge et nombre de reps, à fond ou presque ? » |
| `HORS_DOMAINE` | `ok` (ligne sans charge) | « Pas de charge pour cette ligne (reps hors 1 à 15 ou RPE sous 6). Propose de la faire au ressenti, sans chiffre. » | — |
| `PRESCRIPTION_INCOMPLETE` | `incomplet` | « Ni RPE ni % : demande le RPE visé. » | `rpe.<ligne>` |
| `RPE_DEDUIT_DU_PCT` | `ok` | « Précise en une phrase que le RPE a été déduit du %. » | — |
| `INCOHERENCE_PCT_RPE` | `ok` | « Le % et le RPE ne vont pas ensemble ; le moteur a suivi le RPE. Dis-le simplement. » | — |
| `PCT_IMPOSSIBLE` | `ok` (sans charge) | « Ce % n'est pas tenable pour ce nombre de reps. Propose de revoir les reps ou le %. » | — |
| `CIBLE_SOUS_MINIMUM` / `CIBLE_AU_DESSUS_MAX` | `ok` | « Le matériel déclaré ne permet pas la cible : dis-le, propose d'ajuster les reps ou de mettre à jour le matériel. » | `materiel.<exercice>` si le matériel vient d'un défaut |
| `ECART_ARRONDI_IMPORTANT` | `ok` | « La charge arrondie s'écarte de plus de 5 % de la cible : signale-le en une phrase. » | — |
| `LEST_NEGATIF` | `ok` (sans charge) | « La cible est sous ton poids de corps : propose une version allégée (élastique, machine), sans chiffre. » | — |
| `DOULEUR` (restriction active) | `refuse` | « Pas de charge sur cet exercice : douleur signalée. Propose de continuer sans cet exercice et rappelle l'avis d'un pro si ça persiste. » | — |
| `A_CONFIRMER` (donnée initiale très éloignée d'une référence existante) | `incomplet` | « La donnée s'écarte de plus de 10 % de ta référence : demande confirmation avant de l'utiliser. » | `confirmer_donnee.<exercice>` |

### 4.3 `echauffement`

Paliers de montée en charge + protocole d'échauffement de la séance (blocs 1 et 2 du skill `seance-complete`). Le retour au calme est assemblé par `programme`.

```ts
type EchauffementEntree = {
  type_seance: "force";                    // v1 ; musculation et hyrox_crossfit ensuite (le moteur les gère déjà)
  version: "standard" | "courte";
  activation?: boolean;                    // défaut vrai ; faux si l'utilisateur la retire (ECH-F3, supprimable)
  equipements?: string[];                  // ex. ["rameur", "elastique"] pour les substitutions ; sinon profil
  exercices: {                             // dans l'ordre de la séance
    exercice: string;                      // identifiant moteur force
    premiere_ligne: { reps: number; rpe?: number; pct?: number }; // la charge est recalculée ici, jamais passée par le LLM
    materiel?: Materiel;
  }[];
};

type EchauffementResultat = {
  version: "standard" | "courte";
  duree_estimee_min: number;               // calculée par le code (durées des protocoles + dureeS des paliers)
  blocs: [
    { type: "echauffement_general"; duree_min: number; items: { ex: string; nom_fr: string; duree_s: number; intensite: string }[] },
    { type: "preparation_specifique"; items: (
        | { nature: "mobilite_dynamique"; exercice: string; items: { ex: string; nom_fr: string; dosage: string }[] }
        | { nature: "activation"; supprimable: true; items: { ex: string; nom_fr: string; series: number; reps: number; intensite: string }[] }
        | { nature: "montee_en_charge"; exercice: string; regle: "R2" | "M2" | "ECH-H4"; echelle?: Echelle; paliers: Palier[] }
      )[] }
  ];
};
```

Fonctions appelées :
- charge de la première série : même chemin que `charges` (`e1rmExercice` → `e1rmEffectif` → `chargeLigne`), dans un helper commun, pour qu'aucun chiffre ne transite par le LLM ;
- `echauffementSeance("force", exercices)` : choix de l'échelle par I (`intensite`), règle « mouvement déjà chauffé » (R5), barre vide, départ du sol en roumain, repos et `dureeS` ;
- protocole : données JSON de `knowledge/echauffement/echauffement-force.md` (version standard ou courte, étapes filtrées par `si.mouvement`, substitutions selon le matériel), listes `avant` / `avant-courte` de `knowledge/mobilite/mobilite-force.md` (ECH-F2 pour le premier mouvement, ECH-F5 pour le second : liste courte seulement, pas de cardio).

| Cas | `guidance` |
| --- | --- |
| L'utilisateur veut sauter l'échauffement | « Propose la version courte. Les paliers restent : ce sont eux qui préparent les séries lourdes. Cardio et mobilité peuvent être réduits. » |
| Activation retirée | « Retire l'activation sans discuter, garde les paliers. » |
| Version courte trop longue pour le créneau | « Les paliers ne se raccourcissent pas : propose de raccourcir le corps de séance (une série en moins). » La proposition chiffrée vient de `programme`, pas du LLM. |
| Dans tous les cas | « Première série de travail dans les 10 minutes après le dernier palier (ECH-F6). Douleur pendant les paliers (pas une raideur qui passe en bougeant) : arrêt de l'exercice, appel à `signaler_sante`. » |
| e1RM inconnu et RPE absent (I indéterminable) | « Échelle "Lourd" par prudence : dis-le seulement si on te le demande. » |

`still_to_ask` : charge de travail impossible à calculer (voir `charges`), matériel d'échauffement inconnu (`equipements`), mouvement non reconnu (« C'est quel exercice exactement ? »).

### 4.4 `programme` (contrat seulement : rien n'existe encore pour l'implémenter)

Semaine type + contraintes → séances complètes. Mécanique centrale de `CLAUDE.md`.

```ts
type ProgrammeEntree = {
  // Tout vient du profil par défaut ; l'entrée ne sert qu'à préciser pour cette demande.
  semaines?: number;                       // défaut 1
  version?: "standard" | "courte";
  surcharges?: Partial<{
    creneaux: { jour: "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim"; duree_min: number; lieu: "salle" | "maison" | "exterieur" }[];
    objectif: "force_generale" | "powerlifting";
    niveau: "debutant" | "intermediaire" | "avance";
    exercices_exclus: string[];
  }>;
};

type Seance = {                            // format machine du skill seance-complete
  jour: string;
  duree_estimee_min: number;
  blocs: { type: "echauffement_general" | "preparation_specifique" | "corps" | "retour_au_calme"; duree_min: number | null; items: unknown[] }[];
};

type ProgrammeResultat = {
  modele: { id: string; titre: string; raison_choix: string }; // raison écrite par l'expert dans le modèle
  adaptations: string[];                   // ex. « squat : 4 séries → 3 pour tenir dans 60 min » (style de corrigerDeload)
  seances: Seance[];
};
```

Statuts :
- `incomplet` : il manque un champ obligatoire du profil. `still_to_ask` donne les clés dans cet ordre : objectif, niveau, créneaux (jours et durée), lieu et matériel, exercices exclus ou zones à éviter, données de charge des mouvements principaux. C'est ce qui pilote l'onboarding.
- `indisponible` (**comportement v1**, tant que rien n'est implémenté) : `guidance` = « La génération de programme n'est pas encore disponible. Dis-le simplement et propose de calculer les charges et l'échauffement d'une séance que l'utilisateur a déjà. »
- `ok` : séances à 4 blocs ; `guidance` = « Explique le choix du modèle en une ou deux phrases à partir de `raison_choix` et des `adaptations`. »

Fonctions existantes réutilisées le moment venu : `chargeLigne`, `echauffementSeance`, `evaluerDeload` / `validerDeload` / `corrigerDeload`, `compterVolume` (moteur volume). Ce qui manque est listé en 4.6.

### 4.5 Outils de mémoire et de journal (contrats courts)

Indispensables à la section 6, au-delà des trois outils de calcul.

| Outil | Entrée | Effet | Fonctions moteur |
| --- | --- | --- | --- |
| `profil_lire` | — | Profil vivant + champs manquants (`still_to_ask`) | — |
| `profil_maj` | `{ cle, valeur, citation }` : la citation est l'extrait du message de l'utilisateur | Écrase la valeur, renvoie la valeur enregistrée pour que le LLM la confirme | validation Zod par clé |
| `log_series` | `{ exercice, series: { charge, reps, rpe?, rir?, douleur? }[], unite_dite?: "kg" \| "lb" \| null }` | Enregistre le réalisé ; refuse si l'unité n'est pas le kg (« Je ne gère que les kilos ») ; le RIR est converti en RPE par le code (RPE = 10 − RIR, `knowledge/force/table-rpe.md`) | `ajusterSeance` (en séance), `mettreAJourReference` (après la séance) |
| `signaler_sante` | `{ type: "douleur" \| "drapeau_rouge", exercice?, zone?, citation }` | Restriction active sur l'exercice ou la zone, conversation signalée | — (code applicatif) |

`log_series` renvoie les drapeaux du moteur avec leur consigne : `RPE_MANQUANT` → « série gardée, mais pas utilisée pour estimer ton max : demande le RPE une fois, sans insister » ; `A_CONFIRMER` → « séance très au-dessus ou en dessous de ta référence : demande si les chiffres sont justes » ; `SERIE_DURE`, `ARRET_EXERCICE` → « séries suivantes allégées par le moteur : donne les nouvelles charges, sans reproche » ; `DOULEUR` → `signaler_sante`.

### 4.6 Ce qui manque pour implémenter `programme`

| # | Manque | Pour qui |
| --- | --- | --- |
| P1 | **Référentiel d'exercices unique** reliant l'identifiant du moteur force et des fiches (`developpe_couche`, alias `couche`) et l'id du catalogue (`0025`, `mq-…`), avec le champ `schema` exigé par R5 (aujourd'hui en surcouche partielle dans `data/exercises/schemas.json`), `mouvement` (filtre `si.mouvement`), `depuis_sol`, et le type de matériel par défaut | `developpeur`, avec `expert-force` |
| P2 | **`knowledge/modeles/`** n'existe pas : aucun modèle de semaine force | `expert-force` (et `expert-hypertrophie` pour l'assistance) |
| P3 | **Format d'un modèle** : métadonnées de sélection (objectif, niveau, jours par semaine, durée par séance, matériel requis), slots (exercice, rôle principal ou assistance, lignes reps × RPE, remise de contexte), progression d'une semaine à l'autre, semaine de deload, `raison_choix` | `expert-force` + `expert-ia` (pour ce qui est expliqué à l'utilisateur) |
| P4 | **Sélection du modèle le plus proche** : critères, poids, ce qui est éliminatoire (matériel absent) et ce qui se négocie (un jour de moins). Aucune règle écrite, c'est un choix produit | `expert-force` propose, Pierrot valide |
| P5 | **Ajustement au créneau** : algorithme déterministe pour tenir dans la durée déclarée (version courte d'abord, puis quelles séries retirer, dans quel ordre). Le skill dit « on raccourcit le corps de séance », sans règle chiffrée. Il faut aussi des durées par série de travail (seules celles des paliers existent, R6) | `expert-force` + `expert-sante-physique` |
| P6 | **Chargeur des protocoles** : les JSON d'échauffement, de mobilité et de retour au calme sont dans des blocs de code markdown. Il faut des fichiers JSON ou un extracteur testé | `developpeur` |
| P7 | **Stockage du prescrit** (séances générées, version du moteur et du modèle) pour le comparer au réalisé | `developpeur` |
| P8 | **Fonction d'assemblage** `programme(profil, modeles, refs)` testée, avec des cas de test (le skill `seance-complete` sert de checklist) | `developpeur` |

Sans P1, P6 et une partie de P5, l'outil `echauffement` est lui aussi incomplet : les paliers existent (`echauffementSeance`), pas le chargement des protocoles.

## 5. Garde-fous

### 5.1 Où ils s'exécutent

| Couche | Quoi | Déterministe ? |
| --- | --- | --- |
| Lexique d'entrée | Expressions de crise, de drapeau rouge, de douleur, de TCA (listes maintenues par `expert-sante-mentale` et `expert-sante-physique`) | Oui |
| Classifieur d'entrée | Haiku, sortie JSON : `{ etiquette, zone?, exercice?, confiance }`, étiquettes `crise_suicide`, `crise_tca`, `crise_autre`, `drapeau_rouge`, `douleur`, `medical`, `hors_sujet`, `normal`. Une question sur aiiron lui-même (« t'es une IA ? », « que fais-tu de mes données ? ») est `normal`, pas `hors_sujet` | Non (LLM), mais seule sa sortie est utilisée, par du code |
| Routage | Union des deux couches : si le lexique **ou** le classifieur signale une crise, on applique le protocole de crise. On préfère un faux positif (un message doux avec des ressources) à un faux négatif. | Oui |
| Prompt système | Limites L1 à L16 (`persona/limites.md`), consignes des outils | Non |
| Outils | Restriction douleur active → `charges` et `echauffement` refusent l'exercice (`DOULEUR`) ; en état « crise », tous les outils de prescription sont bloqués (hook `PreToolUse` qui refuse) | Oui |
| Contrôle de sortie | (a) chaque chiffre suivi d'une unité (kg, %, min, km, kcal, g) doit figurer dans un résultat d'outil du tour, le profil ou le message de l'utilisateur ; (b) lexique interdit (noms de pathologies employés comme hypothèse, posologies, « ça reste entre nous », « personne ne lit tes messages »). Échec → une régénération avec l'erreur, puis un message de repli fixe | Oui |

Si le classifieur échoue (erreur, délai dépassé), le lexique seul décide et le message part vers le LLM avec la consigne « prudence santé ». On ne bloque jamais l'utilisateur à cause d'une panne.

### 5.2 Douleur

1. Le routage appelle `signaler_sante` (code) : restriction active sur l'exercice ou la zone citée, horodatée.
2. Le LLM reçoit la consigne : arrêter la prescription sur ce point, ne rien diagnostiquer, proposer de continuer la séance avec ce qui ne fait pas mal, orienter vers un médecin ou un kiné si ça persiste.
3. `charges` et `echauffement` refusent l'exercice tant que la restriction est active.
4. **Levée de la restriction** : par l'utilisateur (« plus mal depuis une semaine »), confirmée en une question. La règle exacte de reprise (délai, reprise allégée) est à écrire par `expert-sante-physique`.
5. Drapeau rouge (douleur thoracique, malaise, essoufflement anormal, palpitations, engourdissement, douleur après une chute…) : texte fixe, sans LLM : « Arrête la séance maintenant. Si ça ne passe pas très vite ou si tu te sens mal, appelle le 15 ou le 112. » Plus de prescription ce jour-là, conversation signalée.

### 5.3 Crise : interface

**Le protocole de référence est `knowledge/sante-mentale/protocole-crise.md`** (`expert-sante-mentale`, brouillon) : déclencheurs et niveaux (PC-1), routage (PC-2), textes fixes mot pour mot (PC-3), ce que fait le code (PC-4), mode restreint (PC-5), revue humaine (PC-6), sortie de l'état (PC-7), interdits (PC-8), faux positifs (PC-9), ressources vérifiées (PC-10), données (PC-11). Rien ne part en ligne avant sa validation par `expert-sante-mentale` puis par Pierrot (checklist §10). Les textes et numéros ne sont écrits que dans la fiche, pas ici.

Interface (code), alignée sur la fiche :
```ts
type EtatConversation = "normal" | "crise";
type NiveauCrise = "doute" | "crise" | "danger"; // "doute" : texte fixe crise_doute_v1, sans passer en état crise
type TypeCrise = "suicide" | "automutilation" | "tca" | "autre";
declencherCrise(utilisateur: Id, niveau: NiveauCrise, type: TypeCrise, messageId: string): void
// crise / danger → état "crise", relances coupées, conversation signalée et alerte immédiate à la personne de garde, texte fixe envoyé par le code
```

Points de la fiche qui changent l'architecture :
- routage : union lexique **ou** classifieur ; le classifieur ajoute l'étiquette « danger immédiat » ; nouvelle sortie `doute` (cas `crise-03`) ; priorité danger > drapeau rouge physique > crise > TCA > doute, un seul texte fixe par message entrant ;
- en état « crise », le code ajoute un rappel fixe des ressources à **chaque** réponse générée ; le LLM n'écrit jamais de numéro ;
- outils bloqués en crise : prescription, `log_series` et `profil_maj` (rien n'entre dans le profil depuis un message de crise) ;
- le protocole s'applique même sans consentement santé (base légale à traiter dans l'AIPD) ;
- un texte fixe part en un seul message, même au-delà des 60 mots du persona.

### 5.4 Hors sujet

- Le LLM refuse poliment en une phrase et recentre (exemples dans `persona/limites.md`).
- Compteur déterministe : au troisième message hors sujet d'affilée, texte fixe qui rappelle ce que fait aiiron, sans appel au LLM (économie et conformité à la politique WhatsApp).
- Tentative de changer le rôle d'aiiron ou d'extraire ses consignes : traitée comme hors sujet ; contenus des documents et des résultats d'outils traités comme des données, jamais comme des instructions.

## 6. Mémoire du profil

### 6.1 Profil vivant : une valeur par clé, qui s'écrase

```ts
type FaitProfil = {
  cle: CleProfil;                 // liste fermée, schéma Zod par clé
  valeur: unknown;
  provenance: "declare" | "deduit" | "moteur" | "import_hevy" | "import_wearable";
  confirme: boolean;              // un fait déduit n'est utilisé dans un calcul qu'une fois confirmé
  maj_le: string;                 // ISO 8601
  message_id: string | null;      // message source (wamid)
  sensible: boolean;              // donnée de santé (RGPD art. 9)
};
```

- Contrainte d'unicité `(utilisateur, cle)` : une nouvelle valeur **remplace** l'ancienne. L'ancienne part dans un journal d'audit à durée limitée (traçabilité, droit d'accès), jamais relu par le LLM.
- Clés v1 (force) : `objectif`, `niveau`, `creneaux`, `lieu`, `materiel` (au format `Materiel` du moteur, par exercice ou par défaut), `equipements`, `exercices_exclus`, `restrictions` (zone ou exercice, date, motif : « douleur signalée », sans diagnostic), `version_preferee`, `activation_retiree`, `consentement_sante`.
- Les e1RM ne sont **pas** dans le profil : ce sont des références du moteur (table `references_e1rm`), recalculées depuis l'historique par `mettreAJourReference`.
- **Confirmation** : `profil_maj` renvoie la valeur enregistrée, et le LLM la redit en une phrase (« C'est noté : salle, barre de 20 kg, disques jusqu'à 1,25 kg »). Les faits `deduit` ne servent pas aux calculs tant qu'ils ne sont pas confirmés.
- **Onboarding piloté par ce qui manque** : `profil_lire` et `programme` renvoient `still_to_ask`. aiiron pose une question à la fois, pas un formulaire.

### 6.2 Profil, historique, résumés

| Où | Quoi |
| --- | --- |
| Profil | Ce qui est vrai aujourd'hui (une valeur par clé) |
| `seances_prescrites` | Ce que le moteur a prescrit : entrées, sorties, version du moteur et du modèle, date |
| `series_realisees` | Ce que l'utilisateur a fait : charge, reps, RPE, douleur, lien vers la série prescrite |
| `references_e1rm` | État du moteur par exercice, avec son historique hebdomadaire (déclencheurs de deload) |
| `resumes_conversation` | Résumé glissant produit après chaque échange (Haiku), relu au tour suivant à la place de l'historique brut |

Le couple prescrit / réalisé est la donnée de résultat d'aiiron : il sert à l'autorégulation, à la révision hebdomadaire et plus tard à l'amélioration des modèles.

### 6.3 Données de santé (RGPD art. 9)

- **Âge et pays, avant tout le reste** (décisions de Pierrot du 25/11/2026) : l'onboarding demande d'abord si l'utilisateur a 18 ans ou plus ; sinon, refus fixe, aucun profil, aucune relance, seul le refus est enregistré (`majeur: false`, horodaté). Lancement en France seulement : le pays vient de l'indicatif +33 quand le numéro est connu, sinon il est demandé ; hors France, refus fixe de la même façon. Les garde-fous crise s'appliquent dans tous les cas.
- **Consentement explicite** avant d'enregistrer la moindre donnée de santé (douleur, sommeil, métriques, alimentation, poids) : message dédié avec boutons, séparé des conditions générales, horodaté avec la version du texte. Sans consentement : conseils généraux possibles, rien de sensible enregistré.
- **Minimisation** : on garde la zone et la restriction, jamais une étiquette de diagnostic, même si l'utilisateur la donne. Le LLM ne reçoit jamais le numéro de téléphone : identifiant interne seulement.
- **Droits** : « supprime mes données » déclenche un parcours déterministe (confirmation, suppression, accusé). Export sur demande.
- **Transparence** : les conversations sont stockées et peuvent parfois être relues par l'équipe pour améliorer le service. aiiron le dit quand on le lui demande (phrase dans `persona/identite-et-voix.md`), et le texte de consentement le dit aussi. Jamais « personne ne lit tes messages ».
- **Durées de conservation** (messages bruts, journal d'audit, résumés) : à fixer dans l'AIPD.
- **Hébergement UE** : voir section 7. **Aucune donnée réelle dans le repo** : les évaluations utilisent des profils fictifs. Secrets uniquement en variables d'environnement ou dans un gestionnaire de secrets.

## 7. Hébergement UE

**Décision de Pierrot (25/11/2026)** : API Anthropic directe pour le développement, **sans aucune donnée réelle** (profils fictifs, numéro de test) ; Claude sur Amazon Bedrock en région UE **avant la première bêta**.

| Brique | Développement | Bêta et production |
| --- | --- | --- |
| Application, file, Postgres | Local ou hébergeur UE, données fictives | Hébergeur UE (région France ou UE) |
| LLM | API Anthropic directe (`claude-sonnet-5-5`, etc.). Elle ne propose que `inference_geo` `global` ou `us`, et un stockage (`workspace geo`) `us` seulement : aucune option UE | **Bedrock, profil d'inférence géographique `eu.`**, appelé depuis `eu-west-3` (Paris), endpoint `bedrock-runtime` (section 7.1) |
| WhatsApp | Numéro de test de l'app Meta | **Stockage local** sur `DE` (« EU (Germany) ») activé **avant** l'enregistrement du numéro de production. Il ne se règle que sur un numéro non enregistré. Le contenu peut transiter hors région jusqu'à 60 min pendant le traitement ; les numéros issus de cartes de contact restent stockés chez Meta. |

### 7.1 Claude sur Bedrock UE : vérification du 25/11/2026

Sources : fiches modèles AWS (Opus 5.5, Sonnet 5.5, Haiku 5.5), page AWS « Regional availability by models », pages Anthropic « Claude in Amazon Bedrock » et « Claude on Amazon Bedrock (bedrock-runtime) », documentation Claude Code sur Bedrock (liens en fin de document). Consultées le 25/11/2026.

**Identifiants** (endpoint `bedrock-runtime`, API Invoke, Converse et Messages)

| Modèle | ID de base | Profil UE (à utiliser) | Profil global (interdit en production) |
| --- | --- | --- | --- |
| Opus 5.5 | `anthropic.claude-opus-5-5` | `eu.anthropic.claude-opus-5-5` | `global.anthropic.claude-opus-5-5` |
| Sonnet 5.5 | `anthropic.claude-sonnet-5-5` | `eu.anthropic.claude-sonnet-5-5` | `global.anthropic.claude-sonnet-5-5` |
| Haiku 5.5 | `anthropic.claude-haiku-5-5` | `eu.anthropic.claude-haiku-5-5` | `global.anthropic.claude-haiku-5-5` |

**Disponibilité par région source** (`bedrock-runtime`). Résultat identique pour les trois modèles, et la fiche modèle AWS concorde avec la page « Regional availability » (une source tierce affirmait le contraire pour Opus 5.5 à Paris : démentie par les deux pages AWS).

| Région source | In-Region (ID de base) | Geo EU (`eu.`) | Global |
| --- | --- | --- | --- |
| `eu-west-3` Paris | non | **oui** | oui |
| `eu-central-1` Francfort | non | **oui** | oui |
| `eu-west-1` Irlande | non | **oui** | oui |

- **Régions de destination du profil `eu.`**, depuis Paris, Francfort ou Irlande, pour les trois modèles : `eu-central-1` (Francfort), `eu-north-1` (Stockholm), `eu-south-1` (Milan), `eu-south-2` (Espagne), `eu-west-1` (Irlande), `eu-west-3` (Paris). Londres n'y figure que si l'appel part de Londres. AWS précise que la liste de destinations d'un profil géographique ne change pas, mais demande de la vérifier par `GetInferenceProfile` depuis chaque région source utilisée (à faire sur notre compte : checklist, section 10).
- **Régions « opt-in »** (Milan et Espagne) : une requête peut y être routée même si le compte ne les a pas activées, et les prompts et réponses peuvent y être stockés pour la détection d'abus (doc AWS). À mentionner dans l'AIPD. Une SCP qui bloque l'une des régions de destination fait échouer la requête.
- **In-Region strict** (ID de base sans profil) : aucune région UE pour ces trois modèles. Opus 5.5 n'est en In-Region qu'à Londres (`eu-west-2`, hors UE).
- **Endpoint `bedrock-mantle`** (API Messages native) : selon les fiches AWS, aucune région UE pour ces trois modèles (Opus 5.5 : `us-east-1`, `ap-southeast-4`, GovCloud ; Sonnet et Haiku 5.5 : GovCloud seulement). La page Anthropic liste `eu-west-1` en « In-region only » pour l'endpoint en général : **non confirmé pour les modèles 5.5**. On ne s'en sert pas.
- **Accès** : Opus 5.5, Sonnet 5.5 et Haiku 5.5 ne sont pas dans la liste des modèles ouverts à tous les clients Bedrock ; leurs critères d'accès se lisent dans la console AWS. **Non confirmé pour notre compte** tant que la demande n'est pas faite.
- **Tarif** : profil régional (dont `eu.`) = +10 % par rapport au profil global (doc Anthropic). Prix AWS des modèles 5.5 en UE : **non relevés**.

**Ce qui manque sur Bedrock par rapport à l'API directe** (pour les trois modèles, sauf mention)

| Fonction | Bedrock UE | Conséquence pour aiiron |
| --- | --- | --- |
| Message Batches (−50 %) | Non. Le palier Batch de Bedrock n'est pas proposé non plus pour ces modèles, ni Flex, ni Priority | Révision hebdomadaire au tarif standard, dans notre file |
| Mise en cache automatique (`cache_control` au niveau de la requête) | Non ; points de cache explicites seulement (512 tokens minimum, 4 au plus, durée 5 min ou 1 h) | Points de cache explicites sur la partie fixe du prompt (section 2) |
| `tool_choice` | `auto` et `none` seulement pour Opus 5.5 et Sonnet 5.5 (pas de restriction indiquée pour Haiku 5.5) | Ne jamais forcer un outil précis pour aiiron ; le routage déterministe reste dans le code |
| Comptage de tokens (`count_tokens`) | Non sur `bedrock-runtime` | Coûts mesurés avec les champs `usage` des réponses (déjà prévu, section 3) |
| API Usage and Cost, Admin, Models | Non | Coût par utilisateur calculé par nous (section 3) ; facture AWS côté Marketplace |
| Files API, sources par URL, outils serveur (recherche et lecture web, exécution de code), Agent Skills et connecteur MCP côté API, repli serveur (`fallbacks`) | Non | Non utilisés : `tools: []`, et nos outils passent par un serveur MCP en processus, côté client |
| Ce qui est disponible | Messages, streaming, outils côté client, sorties structurées, réflexion, citations, PDF, contexte de 1 M tokens, Guardrails, journaux d'invocation | — |

**Configuration de l'Agent SDK en bêta.** L'Agent SDK lance le binaire Claude Code : mêmes variables que Claude Code sur Bedrock.
- `CLAUDE_CODE_USE_BEDROCK=1`, `AWS_REGION=eu-west-3`, rôle IAM sans clé longue.
- Modèles épinglés sur les profils `eu.` : `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_DEFAULT_OPUS_MODEL` (ou l'option `model`). Sans épinglage, le modèle des tâches de fond de Claude Code sur Bedrock est Sonnet 4.5 (déprécié).
- `ANTHROPIC_BEDROCK_REGION_PREFIX=eu` et `CLAUDE_CODE_DISABLE_MODEL_ACCESS_FALLBACK=1` : en cas de modèle indisponible, la requête échoue au lieu de basculer vers un modèle non évalué.
- Classifieur et résumés (hors Agent SDK) : `@anthropic-ai/bedrock-sdk`, même région et mêmes profils `eu.`.
- Aucune `ANTHROPIC_API_KEY` dans l'environnement de bêta.

## 8. Connexion WhatsApp (Business Cloud API, Meta)

### 8.1 Points techniques vérifiés le 25/11/2026

- **Webhook, vérification** : requête GET avec `hub.mode=subscribe`, `hub.verify_token`, `hub.challenge` ; si le jeton correspond, répondre 200 avec la valeur de `hub.challenge`. Certificat TLS valide obligatoire (pas d'auto-signé). mTLS possible.
- **Webhook, signature** : en-tête `X-Hub-Signature-256: sha256=<hmac>`, HMAC-SHA256 du corps avec le secret de l'app. Choix prudent : calculer sur le corps brut, avant tout parsing JSON, et comparer en temps constant.
- **Réessais** : en cas d'échec, Meta réessaie aussitôt puis de moins en moins souvent pendant 7 jours. Les doublons sont possibles, et les envois sont groupés (jusqu'à 1 000 mises à jour par envoi). D'où : 200 immédiat, traitement en file, **idempotence sur l'id de message** (`wamid`). Côté envoi, un enregistrement par (message entrant, rang de réponse) évite de répondre deux fois si le worker redémarre.
- **Identité** : depuis 2026, avec les noms d'utilisateur WhatsApp, le numéro peut être absent des webhooks. Le **BSUID** (`user_id`, `from_user_id`, toujours présent) est la clé primaire. Le numéro est optionnel. Gérer `user_changed_number` et `user_changed_user_id` (`previous_user_id`).
- **Fenêtre de 24 h** : chaque message de l'utilisateur ouvre ou relance une fenêtre de 24 h pendant laquelle aiiron répond librement (messages « service »). Hors fenêtre : **templates** validés par Meta seulement (catégories marketing, utilitaire, authentification).
- **Tarifs** : facturation par message livré. Depuis le 1/10/2026, les messages service sont facturés au-delà de **1 000 gratuits par mois et par numéro**, et les templates utilitaires envoyés dans la fenêtre sont facturés. Les prix ne changent qu'au premier jour d'un trimestre. Tarifs par pays : grille de Meta, à relever avant le lancement.
- **Politique « AI providers »** (en vigueur au 15/01/2026) : les assistants IA généralistes ne sont permis que là où Meta y est légalement contraint. Les services qui ont une fonction métier précise restent autorisés. aiiron doit rester un coach d'entraînement : le garde-fou hors sujet sert aussi la conformité.
- **Documents** : xlsx (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) et PDF acceptés, 100 Mo maximum. Envoi : `POST /{PHONE_NUMBER_ID}/media` → id valable 30 jours → message de type `document` (champ de nom de fichier à vérifier dans la référence des messages).
- **Médias reçus** : id valable 7 jours, URL de téléchargement valable **5 minutes**, téléchargement avec le jeton. Les médias reçus sont des données personnelles, peut-être de santé : même régime que les messages.
- **Numéro de test et jetons** : l'app fournit un numéro de test et un jeton temporaire (qui expire vite). Pour développer : utilisateur système et jeton permanent avec `business_management`, `whatsapp_business_messaging`, `whatsapp_business_management`.

### 8.2 Proactivité et coût

- Une relance hors fenêtre est un template facturé : pas de relance « pour rien ».
- **Validé par Pierrot le 25/11/2026** : au plus 2 relances par semaine ; aucune relance entre 21 h et 8 h (heure locale de l'utilisateur).
- Aucune relance en état « crise » (protocole de crise, section 5.3).
- Propositions, **non validées** : arrêt après 2 relances sans réponse ; aucune relance pendant une restriction douleur récente.
- Ton des relances : `expert-sante-mentale`.
- Pendant la fenêtre ouverte, regrouper plutôt que multiplier les messages : chaque message compte dans le quota gratuit puis se paie. Environ 60 mots par message au plus (**validé par Pierrot le 25/11/2026**) ; au plus deux messages par réponse (proposition, non validée).

### 8.3 Secrets (variables d'environnement, jamais commités)

`WHATSAPP_TOKEN` (jeton d'utilisateur système), `WHATSAPP_APP_SECRET` (signature des webhooks), `WHATSAPP_VERIFY_TOKEN` (chaîne aléatoire choisie par nous), `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID`, `ANTHROPIC_API_KEY` (développement seulement, jamais en bêta), identifiants Bedrock (`AWS_*`, ou rôle IAM sans clé longue), `DATABASE_URL`. En production : gestionnaire de secrets de l'hébergeur. `.env` est déjà ignoré par git.

### 8.4 Étapes pour Pierrot, dans l'ordre

1. **Portefeuille Meta Business** (Business Manager) au nom de la structure qui portera aiiron. Lancer la vérification d'entreprise, nécessaire pour passer en production.
2. **App Meta** sur developers.facebook.com : cas d'usage « Connect with customers through WhatsApp », rattachée au portefeuille.
3. **API Setup** : noter l'id du numéro de test et du compte WhatsApp Business ; ajouter ton propre numéro comme destinataire de test ; envoyer le template `hello_world` pour vérifier.
4. **Utilisateur système** dans les paramètres du portefeuille : contrôle total de l'app et du compte WhatsApp, jeton permanent avec les trois permissions ci-dessus. Le ranger directement dans le gestionnaire de secrets, jamais dans un fichier du repo ni dans un message.
5. **Hébergement UE** de l'endpoint HTTPS (par `developpeur`) : route GET de vérification, route POST signée, file de traitement.
6. **Configurer le webhook** dans l'app : URL de rappel, jeton de vérification, abonnement au champ `messages`. Test de bout en bout depuis ton téléphone (message → écho), avec un webhook mal signé qui doit être rejeté.
7. **Brancher aiiron** sur le numéro de test, rejouer `evals/` en conditions réelles.
8. **Numéro de production** dédié (pas ton numéro personnel), nom d'affichage soumis à validation. **Activer le stockage local `DE` avant l'enregistrement du numéro.**
9. **Templates** en français (rappel de séance, reprise après une pause, consentement si besoin), soumis à Meta. Vérifier la catégorie attribuée : un rappel reclassé en « marketing » coûte plus cher.
10. **Moyen de paiement** sur le compte WhatsApp Business (au-delà des 1 000 messages service gratuits par mois).
11. **AIPD** et registre des traitements avant le premier utilisateur réel (Meta et AWS sont sous-traitants de données de santé).
12. **Checklist de lancement** (section 10) entièrement cochée avant la première bêta.

### 8.5 Canal unique

WhatsApp seul (décision de Pierrot du 25/11/2026). Canal de secours : hors périmètre v1.

## 9. Choix techniques mineurs (option la plus prudente, appliquée)

- Champs `guidance` et `still_to_ask` (noms de notre contrat, inspirés du principe Standout, pas de leur API).
- Pas de `brute` (charge non arrondie) dans les sorties vues par le LLM.
- `echauffement` recalcule la charge de travail lui-même au lieu de la recevoir du LLM.
- Test de 1RM (`phase: "test_1rm"`) exclu du chat v1.
- Livres refusées dans `log_series` (le moteur ne gère que les kilos) ; aucune conversion faite par le LLM.
- Regroupement des messages en rafale : fenêtre de 4 s après le dernier message (heuristique, à mesurer).
- Classifieur en panne → lexique seul + consigne de prudence, jamais de blocage.
- Union lexique ou classifieur pour la crise (faux positif préféré).
- Sortie de l'état « crise » seulement après revue humaine.
- Pas d'étiquette de diagnostic stockée, même dite par l'utilisateur.
- Aucun sous-agent en production v1 ; `settingSources: []` et `tools: []`.
- Bedrock : région source `eu-west-3` (Paris), endpoint `bedrock-runtime`, profils `eu.` uniquement ; SCP qui refuse Bedrock hors des régions de destination du profil UE (un appel `global.` échoue au lieu de sortir de l'UE).
- Bedrock : pas de bascule automatique de modèle (`CLAUDE_CODE_DISABLE_MODEL_ACCESS_FALLBACK=1`) ; tous les modèles épinglés.
- Bedrock : journaux d'invocation désactivés (nos propres journaux en Postgres UE suffisent ; pas de copie supplémentaire de données de santé). À revoir dans l'AIPD.
- Relances : « 21 h à 8 h » s'entend dans le fuseau de l'utilisateur, `Europe/Paris` par défaut tant qu'il n'est pas connu.

## 10. Checklist de lancement de la bêta

Rien ne part vers un utilisateur réel tant qu'une case reste vide. Chaque case cochée porte la date et la personne qui l'a vérifiée.

**Données et hébergement**
- [ ] **Bascule Bedrock UE vérifiée** : conversation, classifieur, résumés et révision hebdomadaire appellent les profils `eu.anthropic.claude-*-5-5` depuis `eu-west-3` ; aucun identifiant `global.` ni clé `ANTHROPIC_API_KEY` dans la configuration de bêta ; accès aux trois modèles accordé dans la console AWS ; `GetInferenceProfile` lancé depuis `eu-west-3` pour chaque profil, toutes les destinations dans l'UE, sortie archivée ; un appel `global.` refusé par la SCP ; évaluations rejouées sur Bedrock UE, pas seulement sur l'API directe.
- [ ] **Stockage local WhatsApp sur `DE` activé avant l'enregistrement du numéro de production** (le réglage est impossible ensuite) et vérifié dans la configuration du numéro.
- [ ] Application, file et Postgres chez un hébergeur UE ; secrets dans le gestionnaire de secrets ; aucune donnée réelle dans le repo.

**Réglementaire**
- [ ] **AIPD** faite et signée, registre des traitements à jour, durées de conservation fixées, sous-traitants (AWS, Meta, hébergeur) listés avec leurs contrats, régions de destination du profil UE et stockage pour détection d'abus mentionnés.
- [ ] **Consentement explicite santé** : message dédié avec boutons, séparé des conditions générales, horodaté et versionné ; il dit que les conversations sont stockées et peuvent parfois être relues ; testé : sans consentement, rien de sensible n'est enregistré.
- [ ] Mention IA dès le premier message et phrase de transparence en place (`persona/identite-et-voix.md`).
- [ ] **Âge minimum 18 ans** demandé au premier message, avant toute autre question ; refus sans profil ni relance sinon (`persona/identite-et-voix.md`).
- [ ] **France seulement** : numéros français uniquement, ressources de crise vérifiées à la date du lancement ; inscription refusée hors France tant que d'autres pays ne sont pas couverts.

**Sécurité**
- [ ] **Protocole de crise relu par un psychologue ou un psychiatre** avant tout utilisateur réel (validé par Pierrot le 25/11/2026 pour un test solo seulement, statut brouillon maintenu).
- [ ] **Protocole de crise validé par `expert-sante-mentale`**, puis par Pierrot : texte fixe, variante TCA, numéros vérifiés à la date du lancement, revue humaine des conversations signalées organisée (qui, sous quel délai).
- [ ] **Évaluations critiques à 5/5** : chaque cas `critique: true` de `evals/` passe 5 essais sur 5, sur la configuration de bêta (Bedrock UE), rapport archivé.

**WhatsApp**
- [ ] Vérification d'entreprise Meta faite, numéro de production dédié, templates en français validés avec la bonne catégorie, moyen de paiement en place.

## Sources

- Meta, webhooks : https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint.md et https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
- Meta, tarifs et fenêtre de 24 h : https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing.md
- Meta, « AI providers » : https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers.md ; conditions : https://www.whatsapp.com/legal/business-solution-terms ; TechCrunch, 18/10/2025 : https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/
- Meta, médias : https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media.md
- Meta, stockage local et régions : https://developers.facebook.com/documentation/business-messaging/whatsapp/local-storage.md et https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration/
- Meta, BSUID : https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids.md
- Meta, démarrage : https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started.md
- Anthropic, tarifs : https://platform.claude.com/docs/en/about-claude/pricing
- Anthropic, résidence des données : https://platform.claude.com/docs/en/manage-claude/data-residency
- Anthropic, Bedrock (consultées le 25/11/2026) : https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock et https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock-legacy
- AWS, fiches modèles (consultées le 25/11/2026) : https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5-5.html , https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-5-5.html , https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-haiku-5-5.html
- AWS, disponibilité par région et profils d'inférence : https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html et https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html
- Claude Code sur Bedrock (variables reprises par l'Agent SDK) : https://code.claude.com/docs/en/amazon-bedrock et https://code.claude.com/docs/en/agent-sdk/overview
- Agent SDK, outils, hooks, démarrage : https://code.claude.com/docs/en/agent-sdk/custom-tools , https://code.claude.com/docs/en/agent-sdk/hooks.md , https://code.claude.com/docs/en/agent-sdk/quickstart.md
- Standout, MCP (patron « le backend décide ») : https://standout.work/docs/mcp
- 3114 : https://3114.fr
