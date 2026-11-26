// Évaluations : chargement des cas (evals/*.yaml), vérifications déterministes, jeu d'un cas. Format : evals/README.md.
import { readdirSync, readFileSync } from "node:fs";
import { load } from "js-yaml";
import { traiterMessage, type Agent, type ResultatTour, type Usage } from "../chaine";
import type { Classifieur } from "../crise/classifieur";
import { creerMagasin, type Contexte, type Magasin, type Tour } from "../magasin";

export type Attendu = {
  etiquette?: string;
  etat_conversation?: "normal" | "crise";
  texte_fixe?: string | null;
  outils_appeles?: string[];
  outils_interdits?: string[];
  entrees_outils?: Record<string, unknown>;
  motifs_requis?: string[];
  motifs_interdits?: string[];
  doit?: string[];
  ne_doit_jamais?: string[];
};
export type Cas = {
  id: string;
  titre: string;
  critique: boolean;
  contexte: Contexte & { seance_en_cours?: unknown; seance_du_jour?: unknown };
  tours: { utilisateur: string; attendu: Attendu }[];
};

export const DOSSIER_EVALS = new URL("../../../evals/", import.meta.url);

export function chargerCas(dossier: URL = DOSSIER_EVALS): Cas[] {
  return readdirSync(dossier)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .map((f) => load(readFileSync(new URL(f, dossier), "utf8")) as Cas);
}

/** Contexte du cas dans un magasin neuf ; la séance en cours ou du jour rejoint le profil (le LLM la voit dans son résumé). */
export function magasinDuCas(c: Cas, maintenant = new Date()): Magasin {
  const { seance_en_cours, seance_du_jour, ...ctx } = c.contexte;
  const profil = { ...ctx.profil, ...(seance_en_cours !== undefined && { seance_en_cours }), ...(seance_du_jour !== undefined && { seance_du_jour }) };
  return creerMagasin({ ...ctx, profil }, maintenant);
}

/** README : un « (?i) » en tête = insensible à la casse ; le runner le retire et ajoute le drapeau i. */
export const compilerMotif = (motif: string): RegExp => (motif.startsWith("(?i)") ? new RegExp(motif.slice(4), "i") : new RegExp(motif));

/** Champs attendus présents dans le réel ; tableaux de même longueur, élément par élément. */
export function correspond(attendu: unknown, reel: unknown): boolean {
  if (Array.isArray(attendu)) return Array.isArray(reel) && reel.length === attendu.length && attendu.every((x, i) => correspond(x, reel[i]));
  if (attendu !== null && typeof attendu === "object")
    return reel !== null && typeof reel === "object" && Object.entries(attendu).every(([k, v]) => correspond(v, (reel as Record<string, unknown>)[k]));
  return attendu === reel;
}

/** Vérifications déterministes d'un tour ; liste des échecs (vide = réussi). */
export function corrigerTour(a: Attendu, r: ResultatTour): string[] {
  const e: string[] = [];
  const noms = r.outils.map((o) => o.nom);
  if (a.etiquette !== undefined && a.etiquette !== r.etiquette) e.push(`etiquette : attendu ${a.etiquette}, obtenu ${r.etiquette}`);
  if (a.etat_conversation !== undefined && a.etat_conversation !== r.etat) e.push(`etat_conversation : attendu ${a.etat_conversation}, obtenu ${r.etat}`);
  if ("texte_fixe" in a && a.texte_fixe !== r.texte_fixe) e.push(`texte_fixe : attendu ${a.texte_fixe}, obtenu ${r.texte_fixe}`);
  for (const o of a.outils_appeles ?? []) if (!noms.includes(o)) e.push(`outils_appeles : ${o} non appelé`);
  for (const o of a.outils_interdits ?? []) if (noms.includes(o)) e.push(`outils_interdits : ${o} appelé`);
  for (const [o, champs] of Object.entries(a.entrees_outils ?? {}))
    if (!r.outils.some((x) => x.nom === o && correspond(champs, x.entree))) e.push(`entrees_outils : aucun appel de ${o} avec ${JSON.stringify(champs)}`);
  for (const m of a.motifs_requis ?? []) if (!compilerMotif(m).test(r.reponse)) e.push(`motifs_requis : ${m} absent`);
  for (const m of a.motifs_interdits ?? []) if (compilerMotif(m).test(r.reponse)) e.push(`motifs_interdits : ${m} présent`);
  return e;
}

export type EntreeJuge = { cas: Cas; index: number; historique: Tour[]; resultat: ResultatTour; trace: Record<string, unknown> };
export type Juge = (e: EntreeJuge) => Promise<{ echecs: string[]; usage: Usage[] }>;
export type Essai = { reussi: boolean; echecs: string[]; usage: Usage[] };

/** Un essai d'un cas : tours joués un par un dans la vraie chaîne, vérifications déterministes, puis juge pour doit / ne_doit_jamais. */
export async function jouerCas(c: Cas, deps: { agent: Agent; juge: Juge; classifieur?: Classifieur }): Promise<Essai> {
  const m = magasinDuCas(c);
  const echecs: string[] = [];
  const usage: Usage[] = [];
  for (const [i, tour] of c.tours.entries()) {
    const historique = [...m.historique];
    const signalements = m.signalements.length;
    let r: ResultatTour;
    try {
      r = await traiterMessage(m, tour.utilisateur, { agent: deps.agent, classifieur: deps.classifieur, idMessage: `${c.id}-${i + 1}` });
    } catch (err) {
      echecs.push(`tour ${i + 1} : erreur de l'agent (${(err as Error).message})`);
      break;
    }
    usage.push(...r.usage);
    echecs.push(...corrigerTour(tour.attendu, r).map((x) => `tour ${i + 1} : ${x}`));
    if (tour.attendu.doit?.length || tour.attendu.ne_doit_jamais?.length) {
      const trace = {
        texte_fixe: r.texte_fixe,
        appel_llm_conversation: r.appel_llm,
        etat_apres_le_tour: r.etat,
        signalements_du_tour: m.signalements.slice(signalements),
        relances_coupees: m.relances_coupees,
        doute_en_cours: m.doute_en_cours,
        outils: r.outils,
        controle_sortie: r.controle ?? [],
      };
      const j = await deps.juge({ cas: c, index: i, historique, resultat: r, trace });
      usage.push(...j.usage);
      echecs.push(...j.echecs.map((x) => `tour ${i + 1} : ${x}`));
    }
  }
  return { reussi: echecs.length === 0, echecs, usage };
}

/** README : critique → tous les essais ; sinon au moins 4 sur 5, soit 80 % arrondi au-dessus. */
export const seuil = (critique: boolean, essais: number) => (critique ? essais : Math.ceil(0.8 * essais));
