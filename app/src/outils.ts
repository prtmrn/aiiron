// Handlers des outils charges et echauffement : docs/architecture.md 4.1 à 4.3. Le backend décide, le LLM converse.
// Tout chiffre vient d'engine/src/force ; les guidances ne contiennent aucun chiffre et ne citent aucun outil absent.
import type { SdkMcpToolDefinition } from "@anthropic-ai/claude-agent-sdk";
import { ajusterSeance, type SeriePrevue } from "../../engine/src/force/ajustement";
import type { Materiel } from "../../engine/src/force/arrondi";
import { chargeCible, chargeLigne, type Resultat } from "../../engine/src/force/charge";
import { mettreAJourReference, referenceInitiale, rpeRetenu, type SerieLoguee } from "../../engine/src/force/e1rm";
import { echauffementSeance, type Echelle } from "../../engine/src/force/paliers";
import type { Drapeau, Phase } from "../../engine/src/force/types";
import { COEFS_VARIANTES, e1rmEffectif, e1rmExercice, normaliserExercice } from "../../engine/src/force/variantes";
import { restrictionDouleur, type Magasin } from "./magasin";
import { jourLocal, prescriptionBloquee, signalerSante, zoneSure, type SignalementSante } from "./sante";

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
  drapeau_rouge: "Signe d'alerte physique signalé aujourd'hui : aucune charge ni aucun palier jusqu'à demain. Ne prescris rien et conseille d'en parler à un médecin avant de reprendre.",
};
// Contrat 4.5, signaler_sante
const GS = {
  douleur: "Restriction posée : plus de charge ni de palier pour cet exercice ou cette zone. Aucun diagnostic ; propose de continuer avec ce qui ne fait pas mal, et un médecin ou un kiné si ça persiste.",
  drapeau_rouge: "Signe d'alerte noté : plus aucune prescription aujourd'hui. Il arrête la séance ; s'il se sent mal ou si ça ne passe pas vite, les numéros d'urgence de tes consignes ; un médecin avant de reprendre.",
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
/** Identifiant du moteur force ou d'une référence existante ; sinon erreur avec la liste des identifiants. */
function exerciceConnu(m: Magasin, exercice: string): string {
  const ex = normaliserExercice(exercice);
  if (!EXERCICES_FORCE.includes(ex) && m.references[ex] === undefined)
    throw new ErreurOutil(`Exercice inconnu : « ${exercice} ». Identifiants acceptés : ${EXERCICES_FORCE.join(", ")}. Demande à l'utilisateur l'exercice exact si aucun ne correspond.`);
  return ex;
}

function preparer(m: Magasin, exercice: string, o: { materiel?: Materiel; remise?: number; donnee?: DonneeInitiale }): Prepa | Retour<never> {
  if (prescriptionBloquee(m)) return vide("refuse", { guidance: [G.drapeau_rouge] });
  const ex = exerciceConnu(m, exercice);
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

export type SignalerEntree = SignalementSante & { citation: string };
export type SignalerResultat = { type: SignalementSante["type"]; restriction: { exercice?: string; zone?: string } | null; prescription_bloquee_aujourdhui: boolean };

/** signaler_sante appelé par le LLM. La citation n'est pas stockée (PC-11, pas d'étiquette de diagnostic). */
export function signaler(e: SignalerEntree, m: Magasin, messageId = "outil"): Retour<SignalerResultat> {
  const exercice = e.exercice === undefined ? undefined : exerciceConnu(m, e.exercice);
  if (e.zone !== undefined && !zoneSure(e.zone))
    throw new ErreurOutil("zone : une partie du corps (« genou droit »), jamais un diagnostic. Rappelle l'outil avec la partie du corps seulement.");
  const r = signalerSante(m, { type: e.type, exercice, zone: e.zone }, messageId);
  return {
    statut: "ok",
    resultat: { type: e.type, restriction: r && { exercice: r.exercice, zone: r.zone }, prescription_bloquee_aujourdhui: prescriptionBloquee(m) },
    drapeaux: e.type === "douleur" && exercice ? ["DOULEUR"] : [],
    guidance: [GS[e.type]],
    still_to_ask: [],
  };
}

type SerieDite = { charge: number; reps: number; rpe?: number; rir?: number; douleur?: boolean };
export type LogEntree = { exercice: string; series: SerieDite[]; unite_dite?: "kg" | "lb" | null; confirme?: boolean };
export type SerieSuivante = { reps: number; rpe: number; charge_kg: number | null; annulee: boolean };
export type LogResultat = {
  exercice: string;
  series: { charge_kg: number; reps: number; rpe: number | null }[]; // enregistrées dans ce tour, RPE retenu par le code
  reference: "mise_a_jour" | "inchangee";
  series_suivantes: SerieSuivante[] | null; // null : le moteur ne change rien au plan de la séance
};
// Contrat 4.5, log_series (sans chiffre)
const GL = {
  livres: "Rien n'est enregistré : tu ne gères que les kilos pour l'instant. Dis-le simplement, sans équivalent ni conversion, et propose de noter la charge en kilos si elle est affichée, ou de laisser cette séance hors suivi.",
  rpe_manquant: "Série gardée, mais pas utilisée pour estimer son max. Si tu n'as pas encore demandé les reps en réserve, demande-les une fois ; sinon n'insiste pas et propose de les noter à la prochaine série.",
  a_confirmer: "Rien n'est enregistré : séance très au-dessus ou en dessous de sa référence. Demande si les chiffres sont justes (charge, reps, unité), puis rappelle l'outil avec confirme si oui.",
  serie_dure: "Séries suivantes allégées par le moteur : donne les nouvelles charges du résultat, sans reproche.",
  arret: "Séries restantes de l'exercice annulées par le moteur : dis-le sans reproche et demande si c'est la fatigue ou une douleur.",
  ajuste: "Charges des séries suivantes ajustées par le moteur : donne-les telles quelles.",
  douleur: "Douleur notée : restriction posée sur cet exercice, plus aucune série ni charge pour lui aujourd'hui. Aucun diagnostic ; propose de continuer sans, et un médecin ou un kiné si ça persiste.",
  toujours: "Dis que c'est noté. Ne cite ni max, ni estimation, ni référence.",
};
const RPE_MAX = 10; // knowledge/force/table-rpe.md : RPE = 10 − RIR

/** RPE retenu par le code (jamais par le LLM) ; RPE et RIR donnés ensemble : le plus haut des deux, côté prudent. */
export function rpeDit(s: SerieDite): number | undefined {
  const depuisRir = s.rir === undefined ? undefined : RPE_MAX - s.rir;
  if (s.rpe === undefined) return depuisRir;
  return depuisRir === undefined ? s.rpe : Math.max(s.rpe, depuisRir);
}

/**
 * Plan de l'exercice dans la séance en cours. Charges : celles du plan, sinon recalculées depuis la référence du début de séance.
 * shortcut: lu dans la chaîne « 3 × 5 @ RPE 8 » de seance_en_cours (format des évals) ; à remplacer par le prescrit stocké (P7).
 */
function planEnCours(m: Magasin, ex: string, ref: number | null, materiel: Materiel | undefined): SeriePrevue[] | null {
  const seance = m.profil.seance_en_cours as { exercices?: { exercice: string; prescription?: string; charge_kg?: number }[] } | undefined;
  const x = seance?.exercices?.find((y) => normaliserExercice(y.exercice) === ex);
  const p = x?.prescription?.match(/^\s*(\d+)\s*[×x]\s*(\d+)\s*@\s*(?:RPE\s*)?(\d+(?:[.,]5)?)\s*$/i);
  if (!p) return null;
  const [series, reps, rpe] = [Number(p[1]), Number(p[2]), Number(p[3].replace(",", "."))];
  const charge = x!.charge_kg ?? (ref !== null && materiel ? chargeCible(ref, materiel, reps, rpe).charge : null);
  return Array.from({ length: series }, () => ({ reps, rpe, charge }));
}

/**
 * log_series (contrat 4.5). La référence est recalculée depuis celle du début de séance avec toutes les séries du jour
 * (mettreAJourReference, e1rm.md R4 à R6) : plusieurs appels donnent le même résultat qu'un seul, sans lissage répété.
 * Séance en cours connue : ajusterSeance donne les séries suivantes (ajustement-rpe.md).
 */
export function logSeries(e: LogEntree, m: Magasin, maintenant = new Date()): Retour<LogResultat> {
  if (e.unite_dite && e.unite_dite !== "kg") return vide("refuse", { guidance: [GL.livres] });
  if (prescriptionBloquee(m, maintenant)) return vide("refuse", { guidance: [G.drapeau_rouge] });
  const ex = exerciceConnu(m, e.exercice);
  if (restrictionDouleur(m, ex)) return vide("refuse", { drapeaux: ["DOULEUR"], guidance: [G.douleur] });

  const jour = jourLocal(maintenant);
  const seance = m.journal.find((x) => x.jour === jour && x.exercice === ex);
  const refAvant = seance ? seance.ref_avant : e1rmExercice(ex, m.references).e1rm;
  const materiel = m.profil.materiel;
  const plan = planEnCours(m, ex, refAvant, materiel);
  const avant = seance?.series ?? [];
  const nouvelles: SerieLoguee[] = e.series.map((x, i) => ({
    charge: x.charge, reps: x.reps, rpe: rpeDit(x), ...(x.douleur && { douleur: true }), ...(plan?.[avant.length + i] && { repsPrescrites: plan[avant.length + i].reps }),
  }));
  const toutes = [...avant, ...nouvelles];
  const confirme = e.confirme === true || seance?.confirme === true; // une confirmation vaut pour la séance de l'exercice
  const maj = mettreAJourReference(refAvant, toutes, { confirme });
  if (maj.drapeaux.includes("A_CONFIRMER"))
    return vide("incomplet", {
      drapeaux: ["A_CONFIRMER"],
      guidance: [GL.a_confirmer],
      still_to_ask: [{ cle: `confirmer_log.${ex}`, question: `Tu confirmes ces chiffres pour le ${nom(ex)} : charge, reps, et c'est bien en kilos ?` }],
    });

  if (seance) seance.series.push(...nouvelles);
  else m.journal.push({ jour, exercice: ex, ref_avant: refAvant, series: nouvelles });
  if (confirme) m.journal.find((x) => x.jour === jour && x.exercice === ex)!.confirme = true;
  const reference = maj.ref !== null && maj.ref !== m.references[ex] ? "mise_a_jour" : "inchangee";
  if (maj.ref !== null && reference === "mise_a_jour") {
    m.references[ex] = maj.ref;
    m.provenance[ex] = "moteur";
  }
  if (nouvelles.some((x) => x.douleur)) signalerSante(m, { type: "douleur", exercice: ex }, "log_series", maintenant);

  const aj = plan && materiel && refAvant !== null ? ajusterSeance(plan, toutes, { ref: refAvant, materiel, debutant: m.profil.niveau === "debutant" }) : null;
  const restantes = aj ? aj.series.slice(toutes.length) : [];
  const change = restantes.some((x, i) => x.annulee || x.charge !== plan![toutes.length + i].charge || x.rpe !== plan![toutes.length + i].rpe);
  const dNouvelles: Drapeau[] = [];
  nouvelles.forEach((x) => x.douleur || rpeRetenu(x, dNouvelles)); // RPE manquant : seulement pour les séries de ce tour
  const sansRpe = (d: Drapeau) => d !== "RPE_MANQUANT" && d !== "RPE_INVALIDE";
  const drapeaux = unique([...dNouvelles, ...maj.drapeaux.filter(sansRpe), ...(aj?.drapeaux.filter(sansRpe) ?? [])]);

  const guidance = [GL.toujours];
  if (drapeaux.includes("DOULEUR")) guidance.push(GL.douleur);
  else if (drapeaux.includes("ARRET_EXERCICE")) guidance.push(GL.arret);
  else if (drapeaux.includes("SERIE_DURE")) guidance.push(GL.serie_dure);
  else if (change) guidance.push(GL.ajuste);
  if (dNouvelles.includes("RPE_MANQUANT")) guidance.push(GL.rpe_manquant);
  return {
    statut: "ok",
    resultat: {
      exercice: ex,
      series: nouvelles.map((x) => ({ charge_kg: x.charge, reps: x.reps, rpe: (x.rpe as number | undefined) ?? null })),
      reference,
      series_suivantes: change ? restantes.map((x) => ({ reps: x.reps, rpe: x.rpe, charge_kg: x.charge, annulee: !!x.annulee })) : null,
    },
    drapeaux,
    guidance,
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
