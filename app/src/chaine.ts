// Chaîne de traitement d'un message, en local (docs/architecture.md 1, étapes 5 à 7 ; sans WhatsApp).
// Garde-fous de crise : knowledge/sante-mentale/protocole-crise.md (PC-2, PC-4, PC-5, PC-9).
import { classifieurStub, type Classifieur, type SortieClassifieur } from "./crise/classifieur";
import { detecter, estDementi } from "./crise/lexique";
import { baliseAlerte, declencherCrise, decider, rappel } from "./crise/routage";
import { TEXTES } from "./crise/textes";
import donnees from "../donnees/textes.json";
import type { Magasin } from "./magasin";

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

  const h = t.toISOString();
  const fin = (reponse: string, r: Partial<ResultatTour>): ResultatTour => {
    m.historique.push({ role: "utilisateur", texte: message, horodatage: h }, { role: "aiiron", texte: reponse, horodatage: h });
    const out = { reponse, etiquette: d.etiquette, texte_fixe: null, appel_llm: false, outils: [], etat: m.etat, ...r };
    return { ...out, usage: [...usageClasse, ...(r.usage ?? [])] };
  };

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
  const consignes = mode === "crise" ? [] : consignesDuTour(classe, d.etiquette);
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
export function consignesDuTour(classe: SortieClassifieur | null, etiquette: string): string[] {
  const c = donnees.consignes;
  if (classe === null) return [c.prudence_sante];
  if (etiquette === "medical") return [c.medical];
  if (etiquette === "hors_sujet") return [c.hors_sujet];
  return [];
}
