// Chaîne de traitement d'un message, en local (docs/architecture.md 1, étapes 5 à 7 ; sans WhatsApp).
import type { Magasin } from "./magasin";

export type AppelOutil = { nom: string; entree: unknown };
export type Usage = { modele: string; entree: number; sortie: number; cache_lu: number; cache_ecrit: number; cout_usd: number };
export type EntreeAgent = { mode: "normal" | "crise"; message: string; magasin: Magasin };
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

export async function traiterMessage(m: Magasin, message: string, deps: { agent: Agent }): Promise<ResultatTour> {
  const s = await deps.agent({ mode: "normal", message, magasin: m });
  m.historique.push({ role: "utilisateur", texte: message }, { role: "aiiron", texte: s.texte });
  return { reponse: s.texte, etiquette: "normal", texte_fixe: null, appel_llm: true, outils: s.outils, etat: m.etat, usage: s.usage };
}
