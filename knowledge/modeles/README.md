# Modèles de semaines : format commun

Un modèle = une semaine type écrite par un expert, que le moteur adapte à la semaine réelle de l'utilisateur (mécanique « semaine type → programme » de `CLAUDE.md`). Règles de choix et d'adaptation : `selection-et-adaptation.md`.

Format commun à `expert-force` et `expert-hypertrophie`. Version du format : 1 (27/11/2026, brouillon). Toute modification du format passe par l'orchestrateur.

## Règles

1. **Un fichier par modèle** : `knowledge/modeles/<id>.json`, `id` = `<domaine>-<n>j-<slug>` (ex. `force-3j-corps-entier`). L'`id` du fichier et le champ `id` sont identiques.
2. **Statut `brouillon`** tant que Pierrot n'a pas validé. Seul Pierrot passe un modèle en `valide`.
3. **Aucune charge, aucun %** : une ligne de série = séries × reps × RPE. Le moteur force calcule les charges (`knowledge/force/moteur-force.md`) depuis l'e1RM courant. Un % dans un modèle est une erreur (cas d'erreur n° 2 des Excel de Pierrot).
4. **Séance complète** (skill `seance-complete`) : chaque séance renvoie à ses protocoles d'échauffement, de mobilité et de retour au calme par `ref` (id de fiche). Les paliers de montée en charge ne sont jamais écrits dans le modèle : le moteur force les calcule (`force-paliers-montee-en-charge`).
5. **Inspiration, jamais copie** : principes publics seulement (fréquence, surcharge progressive, autorégulation, deload). Aucune séance, aucun tableur de programme payant.
6. **Sources** : au format du skill `fiche-connaissance` (titre, auteurs, annee, url).
7. **Remise de contexte** (`remise_contexte`) : multiplicateur dans [0,80 ; 1,00], identique dans toutes les semaines pour un slot (`force-variantes-discounts`, R4). Une remise différente = un autre slot.

## Structure

```json
{
  "id": "force-3j-corps-entier",
  "version": 1,
  "domaine": "force",
  "titre": "Force, corps entier, 3 séances",
  "statut": "brouillon",
  "auteur_agent": "expert-force",
  "derniere_revue": "2026-11-27",
  "niveau_preuve": "E",
  "sources": [ { "titre": "…", "auteurs": "…", "annee": 2026, "url": "https://…" } ],
  "selection": {
    "objectifs": ["force_generale", "powerlifting"],
    "niveaux": ["debutant", "intermediaire"],
    "seances_par_semaine": 3,
    "duree_seance_min": { "min": 42, "max": 74 },
    "materiel_requis": ["barre", "disques", "rack", "banc"],
    "lieux": ["salle", "maison"],
    "zones_sollicitees_fortement": ["genou", "hanche", "bas_du_dos", "epaule", "coude"]
  },
  "raison_choix": "Une phrase, tutoiement, sans chiffre.",
  "progression": { "methode": "vague_rpe", "…": "voir plus bas" },
  "deload": { "ref": "force-deload", "…": "voir plus bas" },
  "seances": [
    {
      "id": "A",
      "titre": "Squat et développé couché",
      "jour_relatif": 1,
      "type_seance": "force",
      "duree_estimee_min": 74,
      "echauffement": { "ref": "echauffement-force" },
      "mobilite": { "ref": "mobilite-force" },
      "retour_au_calme": { "ref": "retour-au-calme-force" },
      "slots": [
        {
          "exercice": "0043",
          "id_moteur_force": "squat",
          "role": "principal",
          "lignes": [ { "series": 3, "reps": 5, "rpe": 7 } ],
          "remise_contexte": 1,
          "repos_s": 180,
          "alternatives": ["0042", "0739", "1760"]
        }
      ]
    }
  ],
  "volume_hebdo_vise": { "quadriceps": 6, "fessiers": 12 },
  "exercices_utilises": {
    "0043": { "nom": "Squat barre", "id_moteur_force": "squat", "materiel": ["barre", "disques", "rack"], "zones": ["genou", "hanche", "bas_du_dos"] }
  }
}
```

## Champs

| Champ | Type | Règle |
| --- | --- | --- |
| `id`, `titre`, `statut`, `auteur_agent`, `derniere_revue`, `niveau_preuve`, `sources` | | comme une fiche (`fiche-connaissance`) |
| `version` | entier | **ajouté** : version du modèle, incrémentée à chaque changement de contenu. Stockée avec chaque séance prescrite (P7), pour comparer prescrit et réalisé à version égale |
| `domaine` | `force` \| `hypertrophie` | |
| `selection.objectifs` | liste fermée | `force_generale`, `powerlifting`, `hypertrophie` (extension par l'orchestrateur) |
| `selection.niveaux` | liste | `debutant`, `intermediaire`, `avance` |
| `selection.seances_par_semaine` | entier 2 à 6 | égal au nombre d'éléments de `seances` |
| `selection.duree_seance_min` | `{min, max}` minutes | `max` = durée standard de la séance la plus longue ; `min` = plancher de la séance la plus exigeante (voir « Durée estimée »). Les deux sont calculés par la convention ci-dessous, pas choisis |
| `selection.materiel_requis` | jetons | matériel sans lequel le modèle est éliminé (mouvements principaux). Le matériel de l'assistance n'y figure pas : il se remplace par `alternatives` |
| `selection.lieux` | `salle` \| `maison` \| `exterieur` | informatif (aide à l'onboarding) ; la sélection se fait sur le matériel, pas sur le lieu |
| `selection.zones_sollicitees_fortement` | jetons de zone | union des `zones` des slots principaux |
| `raison_choix` | texte | une phrase, tutoiement, **aucun chiffre** (ni en chiffres ni en lettres), lue par aiiron pour expliquer le choix |
| `progression` | objet | voir « Progression » |
| `deload` | objet | voir « Deload » |
| `seances[].id` | texte court | unique dans le modèle (`A`, `B`… ou `J1`, `J2`…) |
| `seances[].titre` | texte | **ajouté** : nom court de la séance, utilisé dans les phrases d'adaptation (« j'ai retiré la séance haut du corps B ») |
| `seances[].jour_relatif` | 1 à 7 | espacement idéal ; strictement croissant |
| `seances[].type_seance` | `force` \| `musculation` | choisit les protocoles et l'échelle de paliers |
| `seances[].duree_estimee_min` | entier | durée standard, convention ci-dessous |
| `seances[].echauffement`, `.mobilite`, `.retour_au_calme` | `{ ref }` | id de fiche : `echauffement-force`, `mobilite-force`, `retour-au-calme-force` (ou `-musculation`), avec ancre facultative (`mobilite-musculation#avant.full`). La version (standard ou courte) est choisie par l'adaptation, pas par le modèle |
| `slots[].exercice` | id catalogue | `data/exercises/exercises.json` ou `exercices-aiiron.json` (`mq-…`) |
| `slots[].id_moteur_force` | id ou `null` | identifiant de `engine/src/force/variantes.ts` ou mouvement de base (`squat`, `developpe_couche`, `souleve_de_terre`, `developpe_militaire`). `null` : pas d'e1RM dérivé, charge par séance d'étalonnage (`force-e1rm`, R8) |
| `slots[].role` | `principal` \| `assistance` | `principal` : progression, deload R1 (mouvement principal), jamais coupé sous 2 séries par l'ajustement au créneau |
| `slots[].lignes` | liste `{series, reps, rpe}` | ordre normatif : la première ligne est la série la plus lourde (top set) ; reps entier 1 à 15 ; RPE 6 à 9,5 par demi-point (`force-table-rpe`, R3 ; jamais 10 hors test) |
| `slots[].remise_contexte` | 0,80 à 1 | 1 par défaut |
| `slots[].repos_s` | secondes | entre deux séries de travail |
| `slots[].alternatives` | ids catalogue | **par ordre de préférence** ; tous présents dans `exercices_utilises` |
| `volume_hebdo_vise` | `{muscle: séries}` | voir « Volume » |
| `exercices_utilises` | objet | **ajouté**, voir ci-dessous |

### `exercices_utilises` (champ ajouté)

Une entrée par exercice cité dans un slot ou une alternative. Il sert à trois choses que le catalogue ne donne pas encore (en attendant le référentiel unique P1) :

| Clé | Rôle |
| --- | --- |
| `nom` | nom français court, pour les phrases d'adaptation |
| `id_moteur_force` | identifiant du moteur force quand l'exercice sert d'alternative (`null` sinon). Pour l'exercice d'un slot, c'est `slots[].id_moteur_force` qui fait foi (une même entrée du catalogue, `0043`, porte `squat` ou `squat_pause_2s` selon le slot) |
| `materiel` | jetons de matériel nécessaires (le champ `materiel` du catalogue ne dit ni rack, ni banc, ni barre de traction) |
| `zones` | zones fortement sollicitées, pour appliquer une restriction douleur par zone (aujourd'hui aucune correspondance zone → exercices n'existe, `docs/contexte.md`) |

Quand P1 existera, `materiel` et `zones` y migreront et ce champ disparaîtra des modèles.

### Vocabulaires fermés

- **Matériel** : `barre` (barre olympique), `disques`, `rack` (cage ou supports réglables avec sécurités), `banc` (banc plat), `banc_inclinable`, `banc_lombaires`, `halteres`, `kettlebell`, `poulie`, `machines` (machines guidées à charge), `presse` (presse à cuisses), `barre_traction`, `elastique`. Les micro-disques jouent sur l'arrondi (`force-arrondi-charges`), pas sur la sélection.
- **Zones** : `genou`, `hanche`, `bas_du_dos`, `epaule`, `coude`, `poignet`, `cheville`, `nuque`. La conversion d'une zone dite par l'utilisateur (« mon genou droit ») en jeton est à écrire (`developpeur` avec `expert-sante-physique`) ; zone non convertible = restriction gérée par le prompt seul, comme aujourd'hui.
- **Soulevé de terre** : le slot porte `0032` (conventionnel). Si l'utilisateur tire en sumo, le moteur utilise `0117` avec le même `id_moteur_force` (`souleve_de_terre` = style de l'utilisateur, `force-variantes-discounts`, R3).

## Progression (force)

```json
"progression": {
  "methode": "vague_rpe",
  "applique_a": ["principal"],
  "semaines": [
    { "semaine": 1, "delta_rpe": 0,   "delta_reps": 0 },
    { "semaine": 2, "delta_rpe": 0.5, "delta_reps": 0 }
  ],
  "plafond_rpe": { "debutant": 8.5, "intermediaire": 9, "avance": 9 },
  "plancher_reps": 1,
  "autres_slots": "inchanges",
  "source_charge": "reference_e1rm",
  "apres_deload": "semaine_1"
}
```

Sémantique pour le moteur, semaine w du bloc (1 = première semaine après un deload ou au démarrage) :
- pour chaque ligne d'un slot dont le rôle est dans `applique_a` : `rpe = min(rpe + delta_rpe(w), plafond_rpe[niveau])`, `reps = max(reps + delta_reps(w), plancher_reps)` ; `series` inchangé ;
- w au-delà de la dernière entrée : dernière entrée ;
- `autres_slots: "inchanges"` : lignes de l'assistance identiques chaque semaine ;
- `source_charge: "reference_e1rm"` : la surcharge vient de la référence e1RM mise à jour après chaque séance (`force-e1rm`, R4 ; `force-ajustement-rpe`, R8), jamais d'un % ou d'un nombre de kilos ajouté par le modèle.

`expert-hypertrophie` peut déclarer une autre `methode` (ex. double progression) avec ses propres clés : le moteur refuse une méthode qu'il ne connaît pas.

## Deload (force)

```json
"deload": {
  "ref": "force-deload",
  "planifie_apres_semaines_de_charge": { "debutant": 6, "intermediaire": 5, "avance": 4 },
  "construction": "corrigerDeload",
  "semaine_reference": "derniere_semaine_de_charge",
  "non_planifie": "evaluerDeload",
  "validation": "validerDeload"
}
```

La semaine de deload = `corrigerDeload(dernière semaine de charge, référence = cette même semaine)`, puis `validerDeload` doit renvoyer zéro violation (`force-deload`, R2 à R4 : séries divisées par deux, RPE ≤ 7, intensité ≤ 80 %, aucun single lourd). Mêmes séances, mêmes exercices, échauffement complet, paliers recalculés sur la charge de deload. Un deload non planifié vient d'`evaluerDeload` (R1) : proposé, jamais imposé.

## Durée estimée (convention, sans e1RM)

La sélection doit fonctionner avant toute donnée de charge (onboarding). Durées en secondes, total arrondi à la minute supérieure :

| Élément | Durée |
| --- | --- |
| Échauffement (`echauffement-force`, hors paliers) | 600 standard, 360 courte |
| Retour au calme (`retour-au-calme-force`) | 480 standard, 180 courte |
| Chaque slot principal après le premier (ECH-F5, `avant-courte`) | 120 |
| Paliers d'un slot principal | échelle « Lourd » au minimum (« Très lourd » si I ≥ 0,90) |
| Paliers d'un slot d'assistance | échelle selon I = pct(reps, RPE) de la première ligne en semaine 1 (`force-paliers-montee-en-charge`, R2) ; 0 si poids du corps |
| Séries de travail | Σ séries × (reps × 4 + `repos_s`) (`force-paliers-montee-en-charge`, R6, étendue aux séries de travail) |

Paliers (formule R6 sur les paliers nominaux de R2 et les repos de R4, sans filtrage) :

| Échelle | Avec barre | Sans barre (haltères, poulie, machine) |
| --- | --- | --- |
| Léger | 282 | 212 |
| Modéré | 350 | 280 |
| Lourd | 504 | 434 |
| Très lourd | 598 | 528 |

« Lourd au minimum » pour les principaux : la vague de RPE fait passer la plupart des lignes au-dessus de I = 0,80 dès la semaine 2 ; on estime large. Le **plancher** d'une séance = échauffement court + paliers et 120 s des principaux + principaux ramenés à 2 séries + retour au calme court, sans assistance. À l'assemblage, le moteur recalcule les paliers réels (R2 avec l'e1RM) et refait l'ajustement au créneau.

## Volume (`volume_hebdo_vise`)

Séries de travail de la **semaine 1, version standard**, comptées par `compterVolume` (poids réels : principal 1, secondaire 0,5 ; `hypertrophie-mapping-muscles`). Clés = union de `volume`, `agregats` (`deltoides`) et `compteurs_separes` (`core`) ; muscles à zéro omis. Séries d'échauffement et paliers non comptés. C'est un contrôle : un écart entre ce champ et `compterVolume` est un bug du modèle. Bornes de volume par muscle : `knowledge/hypertrophie/volume-cibles.md` (expert-hypertrophie).

## Contrôles automatiques (à coder par `developpeur`)

1. Tous les `exercice` et `alternatives` existent dans le catalogue et dans `exercices_utilises`.
2. `id_moteur_force` ∈ clés de `COEFS_VARIANTES` ∪ mouvements de base, ou `null`.
3. `seances.length = seances_par_semaine` ; `jour_relatif` strictement croissant dans [1 ; 7].
4. Lignes : reps 1 à 15, RPE 6 à 9,5 par demi-point, `series` ≥ 1 ; au moins une ligne par slot.
5. `remise_contexte` dans [0,80 ; 1].
6. `raison_choix` sans chiffre (regex `[0-9]` et nombres en lettres).
7. Aucune clé `charge`, `kg`, `pct`, `pourcentage` nulle part.
8. `duree_estimee_min`, `duree_seance_min` et `volume_hebdo_vise` égaux au recalcul par la convention et par `compterVolume`.
9. La semaine de deload construite passe `validerDeload` sans violation.
10. Chaque séance a ses trois `ref` vers des fiches existantes.
