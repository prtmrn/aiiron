// Handlers des outils charges et echauffement : docs/architecture.md 4.1 à 4.3. Le backend décide, le LLM converse.
// Tout chiffre vient d'engine/src/force ; les guidances ne contiennent aucun chiffre et ne citent aucun outil absent.
import type { SdkMcpToolDefinition } from "@anthropic-ai/claude-agent-sdk";
import type { Materiel } from "../../engine/src/force/arrondi";
import { chargeLigne, type Resultat } from "../../engine/src/force/charge";
import { referenceInitiale } from "../../engine/src/force/e1rm";
import { echauffementSeance, type Echelle } from "../../engine/src/force/paliers";
import type { Drapeau, Phase } from "../../engine/src/force/types";
import { COEFS_VARIANTES, e1rmEffectif, e1rmExercice, normaliserExercice } from "../../engine/src/force/variantes";
import { restrictionDouleur, type Magasin } from "./magasin";

export type Retour<T> = {
  statut: "ok" | "incomplet" | "refuse" | "indisponible";
  resultat: T | null;
  drapeaux: Drapeau[];
  guidance: string[];
  still_to_ask: { cle: string; question: string }[];
};

export class ErreurOutil extends Error {}
type CallToolResult = Awaited<ReturnType<SdkMcpToolDefinition["handler"]>>;

type Ligne = { reps: number; rpe?: number; pct?: number };
type DonneeInitiale = { type: "1rm"; valeur: number; semaines?: number } | { type: "reps_a_fond"; charge: number; reps: number };

export type ChargesEntree = {
  exercice: string;
  lignes: Ligne[];
  phase?: Exclude<Phase, "test_1rm">;
  materiel?: Materiel;
  remise_contexte?: number;
  donnee_initiale?: DonneeInitiale;
};
export type ChargesResultat = {
  exercice: string;
  e1rm_affiche_kg: number | null;
  source_e1rm: "reference" | "variante" | "donnee_initiale" | "aucune";
  lignes: { reps: number; rpe: number | null; charge_kg: number | null; drapeaux: Drapeau[] }[];
};

export type EchauffementEntree = {
  type_seance: "force";
  version: "standard" | "courte";
  activation?: boolean;
  equipements?: string[];
  exercices: { exercice: string; premiere_ligne: Ligne; materiel?: Materiel }[];
};
export type PalierAffiche = { exercice: string; charge_kg: number; reps: number; repos_s: number; repos_affiche: string };
export type MonteeEnCharge = {
  nature: "montee_en_charge";
  exercice: string;
  regle: "R2" | "M2" | "ECH-H4";
  echelle?: Echelle;
  charge_travail_kg: number;
  premiere_serie: { reps: number; rpe: number | null };
  paliers: PalierAffiche[];
};
export type EchauffementResultat = {
  version: "standard" | "courte";
  duree_paliers_min: number; // paliers seulement : ni échauffement général, ni mobilité, ni activation
  blocs: [{ type: "preparation_specifique"; items: MonteeEnCharge[] }];
};

// Identifiants du moteur force (variantes.ts) : bases et variantes. Le catalogue (0043…) n'a pas encore de correspondance (P1).
export const EXERCICES_FORCE = [...new Set([...Object.values(COEFS_VARIANTES).map((v) => v.base), ...Object.keys(COEFS_VARIANTES)])].sort();
const NOMS: Record<string, string> = {
  squat: "squat",
  developpe_couche: "développé couché",
  souleve_de_terre: "soulevé de terre",
  developpe_militaire: "développé militaire",
};
const nom = (ex: string) => NOMS[ex] ?? ex.replace(/_/g, " ");
// paliers-montee-en-charge.md : barre vide en roumain pour le soulevé de terre et ses variantes depuis le sol
const DEPUIS_SOL = new Set(["souleve_de_terre", "sdt_deficit_5cm", "sdt_pause_genou", "sdt_tempo", "souleve_de_terre_autre_style"]);
// e1rm.md R5 : écart de plus de 10 % avec une référence existante → confirmation
const ECART_CONFIRMATION = 0.1;

// Tableau 4.2 (formulations sans chiffre ni outil absent)
const G = {
  inconnu: "Pas de charge sans donnée : n'en propose aucune. Explique en une phrase qu'il te faut une série récente.",
  hors_domaine: "Pas de charge pour cette ligne : trop de reps ou effort trop léger pour le calcul. Propose de la faire au ressenti, sans chiffre.",
  serie_legere: "Ligne légère : la charge vient du % donné, sans RPE. Présente-la comme une série technique.",
  prescription: "Ni RPE ni % : demande le RPE visé.",
  rpe_deduit: "Précise en une phrase que le RPE a été déduit du %.",
  incoherence: "Le % et le RPE ne vont pas ensemble ; le moteur a suivi le RPE. Dis-le simplement.",
  pct_impossible: "Ce % n'est pas tenable pour ce nombre de reps. Propose de revoir les reps ou le %.",
  materiel_limite: "Le matériel déclaré ne permet pas la cible : dis-le, propose d'ajuster les reps ou de mettre à jour le matériel.",
  ecart_arrondi: "La charge arrondie s'écarte nettement de la cible du calcul : signale-le en une phrase.",
  lest_negatif: "La cible est sous ton poids de corps : propose une version allégée (élastique, machine), sans chiffre.",
  douleur: "Pas de charge sur cet exercice : douleur signalée. Propose de continuer sans cet exercice et rappelle l'avis d'un pro si ça persiste.",
  a_confirmer: "La donnée s'écarte nettement de la référence enregistrée : demande confirmation avant de l'utiliser.",
  materiel: "Matériel inconnu : aucune charge. Demande le matériel avant de calculer.",
};
// Tableau 4.3
const GE = {
  courte: "Propose la version courte. Les paliers restent : ce sont eux qui préparent les séries lourdes. Cardio et mobilité peuvent être réduits.",
  activation: "Retire l'activation sans discuter, garde les paliers.",
  toujours:
    "Première série de travail juste après le dernier palier. Douleur pendant les paliers (pas une raideur qui passe en bougeant) : arrête de prescrire cet exercice et oriente vers un pro si ça persiste.",
  non_calcule:
    "Seuls les paliers sont calculés : l'échauffement général, la mobilité et l'activation ne le sont pas encore. Mentionne-les sans chiffre ni liste d'exercices. La durée du résultat est celle des paliers seulement.",
};

const vide = <T>(statut: Retour<T>["statut"], extra: Partial<Retour<T>> = {}): Retour<T> => ({
  statut, resultat: null, drapeaux: [], guidance: [], still_to_ask: [], ...extra,
});
const qSerie = (ex: string) => ({
  cle: `1rm_ou_serie_a_fond.${ex}`,
  question: `Tu te souviens d'une série récente au ${nom(ex)} : charge et nombre de reps, à fond ou presque ?`,
});
const qMateriel = (ex: string) => ({ cle: `materiel.${ex}`, question: `Tu fais le ${nom(ex)} avec quel matériel : barre de combien, et quel plus petit disque ?` });

export const reposAffiche = (s: number) => (s % 60 === 0 ? `${s / 60} min` : `${s} s`);
const unique = <T>(xs: T[]) => [...new Set(xs)];

/** Guidances de 4.2 pour les drapeaux d'une ligne. */
function guidancesLigne(r: Resultat): string[] {
  const g: string[] = [];
  for (const d of r.drapeaux) {
    if (d === "HORS_DOMAINE") g.push(r.charge === null ? G.hors_domaine : G.serie_legere);
    if (d === "RPE_DEDUIT_DU_PCT") g.push(G.rpe_deduit);
    if (d === "INCOHERENCE_PCT_RPE") g.push(G.incoherence);
    if (d === "PCT_IMPOSSIBLE") g.push(G.pct_impossible);
    if (d === "CIBLE_SOUS_MINIMUM" || d === "CIBLE_AU_DESSUS_MAX") g.push(G.materiel_limite);
    if (d === "ECART_ARRONDI_IMPORTANT") g.push(G.ecart_arrondi);
    if (d === "LEST_NEGATIF") g.push(G.lest_negatif);
  }
  return g;
}

type Prepa = { ex: string; e1rm: number; source: ChargesResultat["source_e1rm"]; materiel: Materiel };

/**
 * Helper commun aux deux outils : exercice connu, restriction douleur, matériel, e1RM (référence, variante ou donnée
 * initiale déclarée, e1rm.md R8), puis e1RM effectif. Renvoie un Retour d'arrêt si le calcul est impossible.
 */
function preparer(m: Magasin, exercice: string, o: { materiel?: Materiel; remise?: number; donnee?: DonneeInitiale }): Prepa | Retour<never> {
  const ex = normaliserExercice(exercice);
  if (!EXERCICES_FORCE.includes(ex) && m.references[ex] === undefined)
    throw new ErreurOutil(`Exercice inconnu : « ${exercice} ». Identifiants acceptés : ${EXERCICES_FORCE.join(", ")}. Demande à l'utilisateur l'exercice exact si aucun ne correspond.`);
  if (restrictionDouleur(m, ex)) return vide("refuse", { drapeaux: ["DOULEUR"], guidance: [G.douleur] });
  const materiel = o.materiel ?? m.profil.materiel;
  if (!materiel) return vide("incomplet", { guidance: [G.materiel], still_to_ask: [qMateriel(ex)] });

  const { e1rm: connu, refs } = e1rmExercice(ex, m.references);
  const source = connu === null ? "aucune" : m.references[ex] !== undefined ? "reference" : "variante";
  if (o.donnee) {
    const declare = referenceInitiale(o.donnee);
    if (declare === null) return vide("incomplet", { drapeaux: ["SERIE_TROP_LONGUE"], guidance: [G.inconnu], still_to_ask: [qSerie(ex)] });
    if (connu !== null && Math.abs(declare / connu - 1) > ECART_CONFIRMATION)
      return vide("incomplet", {
        drapeaux: ["A_CONFIRMER"],
        guidance: [G.a_confirmer],
        still_to_ask: [{ cle: `confirmer_donnee.${ex}`, question: `Tu confirmes ces chiffres pour le ${nom(ex)} ? Ils sont loin de ta référence.` }],
      });
    if (connu === null) {
      // shortcut: référence déclarée gardée en mémoire seulement (pas de base), perdue à la fin de la conversation
      m.references[ex] = declare;
      m.provenance[ex] = "declare";
      return { ex, e1rm: e1rmEffectif(declare, o.remise), source: "donnee_initiale", materiel };
    }
  }
  if (connu === null) return vide("incomplet", { guidance: [G.inconnu], still_to_ask: [qSerie(ex)] });
  if (source === "variante") {
    m.references[ex] = refs[ex]; // initialisation paresseuse (variantes-discounts.md R3)
    m.provenance[ex] = "moteur";
  }
  return { ex, e1rm: e1rmEffectif(connu, o.remise), source, materiel };
}

const estArret = (p: Prepa | Retour<never>): p is Retour<never> => "statut" in p;

export function charges(e: ChargesEntree, m: Magasin): Retour<ChargesResultat> {
  const p = preparer(m, e.exercice, { materiel: e.materiel, remise: e.remise_contexte, donnee: e.donnee_initiale });
  if (estArret(p)) return p;
  const calc = e.lignes.map((l) => ({ l, r: chargeLigne(p.e1rm, p.materiel, l, e.phase ?? "normale") }));
  const drapeaux = unique(calc.flatMap((c) => c.r.drapeaux));
  const incompletes = calc.flatMap((c, i) => (c.r.drapeaux.includes("PRESCRIPTION_INCOMPLETE") ? [i] : []));
  if (incompletes.length)
    return vide("incomplet", {
      drapeaux,
      guidance: [G.prescription],
      still_to_ask: incompletes.map((i) => ({ cle: `rpe.${i}`, question: `Tu vises quel RPE pour la ligne de ${e.lignes[i].reps} reps ?` })),
    });
  return {
    statut: "ok",
    resultat: {
      exercice: p.ex,
      e1rm_affiche_kg: Math.round(p.e1rm * 2) / 2, // affichage seulement, jamais réinjecté
      source_e1rm: p.source,
      lignes: calc.map(({ l, r }) => ({ reps: l.reps, rpe: r.rpe, charge_kg: r.charge, drapeaux: r.drapeaux })),
    },
    drapeaux,
    guidance: unique(calc.flatMap((c) => guidancesLigne(c.r))),
    still_to_ask: [],
  };
}

export function echauffement(e: EchauffementEntree, m: Magasin): Retour<EchauffementResultat> {
  const seance: { p: Prepa; charge: number; rpe: number | null; x: EchauffementEntree["exercices"][number] }[] = [];
  const drapeaux: Drapeau[] = [];
  const guidance: string[] = [];
  for (const x of e.exercices) {
    const p = preparer(m, x.exercice, { materiel: x.materiel });
    if (estArret(p)) return p;
    const r = chargeLigne(p.e1rm, p.materiel, x.premiere_ligne);
    drapeaux.push(...r.drapeaux);
    guidance.push(...guidancesLigne(r));
    if (r.drapeaux.includes("PRESCRIPTION_INCOMPLETE"))
      return vide("incomplet", { drapeaux: unique(drapeaux), guidance: [G.prescription], still_to_ask: [{ cle: `rpe.${p.ex}`, question: `Tu vises quel RPE sur ta première série de ${nom(p.ex)} ?` }] });
    if (r.charge === null) return vide("incomplet", { drapeaux: unique(drapeaux), guidance: unique(guidance) });
    seance.push({ p, charge: r.charge, rpe: r.rpe, x });
  }
  const sorties = echauffementSeance(
    "force",
    seance.map(({ p, charge, x }) => ({
      exercice: p.ex, chargeTravail: charge, e1rm: p.e1rm, reps: x.premiere_ligne.reps, rpe: x.premiere_ligne.rpe, materiel: p.materiel, depuisSol: DEPUIS_SOL.has(p.ex),
    })),
  );
  const items: MonteeEnCharge[] = sorties.map((s, i) => ({
    nature: "montee_en_charge",
    exercice: seance[i].p.ex,
    regle: s.regle,
    ...(s.echelle && { echelle: s.echelle }),
    charge_travail_kg: seance[i].charge,
    premiere_serie: { reps: seance[i].x.premiere_ligne.reps, rpe: seance[i].rpe },
    paliers: s.items.map((pa) => ({ exercice: pa.exercice, charge_kg: pa.charge_kg, reps: pa.reps, repos_s: pa.repos_s, repos_affiche: reposAffiche(pa.repos_s) })),
  }));
  const dureeS = sorties.reduce((t, s) => t + s.dureeS, 0);
  return {
    statut: "ok",
    resultat: { version: e.version, duree_paliers_min: Math.ceil(dureeS / 60), blocs: [{ type: "preparation_specifique", items }] },
    drapeaux: unique(drapeaux),
    guidance: unique([...(e.version === "courte" ? [GE.courte] : []), ...(e.activation === false ? [GE.activation] : []), ...guidance, GE.toujours, GE.non_calcule]),
    still_to_ask: [],
  };
}

/** Convertit un handler en résultat MCP : structuredContent exact ; erreur → isError avec la consigne pour le LLM. */
export function enResultatMcp(f: () => Retour<unknown>): CallToolResult {
  try {
    const r = f();
    return { content: [{ type: "text", text: JSON.stringify(r) }], structuredContent: r as unknown as Record<string, unknown> };
  } catch (err) {
    const texte = err instanceof ErreurOutil ? err.message : "Erreur interne du calcul : ne donne aucun chiffre, dis que le calcul n'a pas abouti et propose de réessayer.";
    return { content: [{ type: "text", text: texte }], isError: true };
  }
}
