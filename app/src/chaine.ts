// Chaîne de traitement d'un message, en local (docs/architecture.md 1, étapes 5 à 7 ; sans WhatsApp).
// Garde-fous de crise : knowledge/sante-mentale/protocole-crise.md (PC-2, PC-4, PC-5, PC-9).
import { classifieurStub, type Classifieur, type SortieClassifieur } from "./crise/classifieur";
import { detecter, estDementi } from "./crise/lexique";
import { baliseAlerte, declencherCrise, decider, rappel } from "./crise/routage";
import { TEXTES } from "./crise/textes";
import donnees from "../donnees/textes.json";
import type { Magasin } from "./magasin";
import { detecterSante, prescriptionBloquee, signalerSante, TEXTES_SANTE, zoneSure, type SignalementSante } from "./sante";

export type AppelOutil = { nom: string; entree: unknown };
export type Usage = { modele: string; entree: number; sortie: number; cache_lu: number; cache_ecrit: number; cout_usd: number };
export type EntreeAgent = { mode: "normal" | "crise"; message: string; magasin: Magasin; consignes?: string[] };
export type SortieAgent = { texte: string; outils: AppelOutil[]; usage: Usage[] };
/** L'agent réel (agent.ts) ou un agent factice dans les tests. */
export type Agent = (e: EntreeAgent) => Promise<SortieAgent>;

export type ResultatTour = {
  reponse: string;
  etiquette: string;
  texte_fixe: string | null;
  appel_llm: boolean;
  outils: AppelOutil[];
  etat: Magasin["etat"];
  usage: Usage[];
};
// 5.4 : au troisième message hors sujet d'affilée, texte fixe sans LLM
const HORS_SUJET_MAX = 3;

export type Dependances = { agent: Agent; classifieur?: Classifieur; maintenant?: () => Date; idMessage?: string };

// PC-9 et PC-7 : fenêtres de prudence (heuristique à valider)
const H24 = 24 * 3600 * 1000;
const J30 = 30 * 24 * 3600 * 1000;
const depuis = (iso: string | null, t: Date) => (iso === null ? Infinity : t.getTime() - Date.parse(iso));

export async function traiterMessage(m: Magasin, message: string, deps: Dependances): Promise<ResultatTour> {
  const t = deps.maintenant?.() ?? new Date();
  const id = deps.idMessage ?? `local-${t.getTime()}`;
  let classe: SortieClassifieur | null = null;
  try {
    // le message et les messages des dernières 24 h, en données (PC-1)
    classe = await (deps.classifieur ?? classifieurStub)(message, m.historique.filter((h) => depuis(h.horodatage ?? null, t) < H24));
  } catch {
    classe = null; // panne : lexique seul, exclusions désactivées
  }
  const usageClasse = classe?.usage ?? [];
  const apresCrise = m.etat === "crise" || depuis(m.derniere_crise, t) < J30;
  const exclusions = classe !== null && !apresCrise && !m.doute_en_cours && depuis(m.dernier_signal, t) >= H24;
  const d = decider(detecter(message, { exclusions, apresCrise }), classe, { doute: m.doute_en_cours, dementi: estDementi(message) });
  m.doute_en_cours = false; // le doute ne vaut que pour le message qui le suit
  if (d.niveau > 0) m.dernier_signal = t.toISOString();

  // 5.2 : union lexique ou classifieur ; un drapeau rouge écarte la douleur simple
  const sante = detecterSante(message);
  const rouge = sante.drapeau_rouge.length > 0 || classe?.etiquette === "drapeau_rouge";
  const douleur = !rouge && (sante.douleur || classe?.etiquette === "douleur");
  const zone = zoneSure(classe?.zone) ?? sante.zone;
  const etiquette = d.niveau > 0 ? d.etiquette : rouge ? "drapeau_rouge" : douleur ? "douleur" : d.etiquette;
  const parCode: AppelOutil[] = []; // appels de signaler_sante faits par le routage, dans la trace du tour
  const signaler = (e: SignalementSante) => {
    signalerSante(m, e, id, t);
    parCode.push({ nom: "signaler_sante", entree: e });
  };

  const h = t.toISOString();
  const fin = (reponse: string, r: Partial<ResultatTour>): ResultatTour => {
    m.historique.push({ role: "utilisateur", texte: message, horodatage: h }, { role: "aiiron", texte: reponse, horodatage: h });
    const out = { reponse, etiquette, texte_fixe: null, appel_llm: false, etat: m.etat, ...r };
    return { ...out, outils: [...parCode, ...(r.outils ?? [])], usage: [...usageClasse, ...(r.usage ?? [])] };
  };

  // 5.4 : seul le classifieur dit « hors sujet » ; tout autre message le remet à zéro ; en panne, rien ne change
  if (classe) m.hors_sujet_d_affilee = etiquette === "hors_sujet" ? m.hors_sujet_d_affilee + 1 : 0;

  // PC-2 : danger > drapeau rouge > crise > crise TCA > doute ; un seul texte fixe par message
  if (rouge) signaler({ type: "drapeau_rouge", ...(zone && { zone }) });
  if (rouge && d.niveau < 3) {
    if (d.niveau === 2) {
      declencherCrise(m, "crise", d.type!, id, t); // l'état crise vaut quand même ; seul le texte change
      if (d.tca && d.type !== "tca") declencherCrise(m, "crise", "tca", id, t);
    }
    return fin(TEXTES_SANTE.drapeau_rouge_v1, { texte_fixe: "drapeau_rouge_v1" }); // un doute est écarté : sa question n'a pas été posée
  }

  // PC-4 : texte fixe envoyé par le code, sans appel au LLM (y compris pendant l'état crise, PC-2.5)
  if (d.texte_fixe) {
    if (d.niveau >= 2) {
      declencherCrise(m, d.niveau === 3 ? "danger" : "crise", d.type!, id, t);
      if (d.tca && d.type !== "tca") declencherCrise(m, "crise", "tca", id, t);
    } else declencherCrise(m, "doute", d.type!, id, t);
    return fin(TEXTES[d.texte_fixe], { texte_fixe: d.texte_fixe });
  }

  // PC-5 : mode restreint, sans aucun outil ; le code ajoute le rappel ; LLM indisponible → crise_repli_v1
  const mode = m.etat === "crise" ? "crise" : "normal";
  if (mode === "normal" && m.hors_sujet_d_affilee >= HORS_SUJET_MAX) return fin(donnees.textes.hors_sujet_v1, { texte_fixe: "hors_sujet_v1" });

  // 5.2 : douleur → signaler_sante par le code, puis le LLM avec la consigne (rien n'entre dans le profil en crise, PC-4.3)
  if (douleur && mode === "normal") signaler({ type: "douleur", ...(classe?.exercice && { exercice: classe.exercice }), ...(zone && { zone }) });
  const consignes = mode === "crise" ? [] : consignesDuTour(classe, etiquette, prescriptionBloquee(m, t));
  let s: SortieAgent;
  try {
    s = await deps.agent({ mode, message, magasin: m, consignes });
  } catch (err) {
    if (mode === "normal") throw err;
    return fin(`${TEXTES.crise_repli_v1}\n\n${rappel(m)}`, { appel_llm: true });
  }

  // Filet de sécurité : balise d'alerte du modèle, jamais transmise à l'utilisateur
  const b = baliseAlerte(s.texte);
  if (b) {
    declencherCrise(m, b.niveau, b.type, id, t);
    m.dernier_signal = t.toISOString();
    const etiquette = b.niveau === "danger" ? "danger" : b.type === "tca" ? "crise_tca" : "crise_suicide";
    return fin(TEXTES[b.texte_fixe], { etiquette, texte_fixe: b.texte_fixe, appel_llm: true, outils: s.outils, usage: s.usage });
  }
  const reponse = mode === "crise" ? `${s.texte}\n\n${rappel(m)}` : s.texte;
  return fin(reponse, { appel_llm: true, outils: s.outils, usage: s.usage });
}

/** Étape 6 du routage : consigne du code selon l'étiquette ; classifieur en panne → « prudence santé » (5.1). */
export function consignesDuTour(classe: SortieClassifieur | null, etiquette: string, drapeauRougeDuJour = false): string[] {
  const c = donnees.consignes;
  const out: string[] = [];
  if (classe === null) out.push(c.prudence_sante);
  if (drapeauRougeDuJour) out.push(c.drapeau_rouge_du_jour);
  if (etiquette === "douleur") out.push(c.douleur);
  if (etiquette === "medical" || classe?.etiquette === "medical") out.push(c.medical);
  if (etiquette === "hors_sujet") out.push(c.hors_sujet);
  return out;
}
