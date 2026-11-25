// Drapeau rouge physique et douleur (docs/architecture.md 5.2) : lexique déterministe et effets de signaler_sante. Sans LLM.
import donnees from "../../knowledge/sante-physique/lexique-sante.json";
import { normaliser } from "./crise/lexique";
import type { Magasin, Restriction } from "./magasin";

const ROUGE = donnees.drapeau_rouge.map((s) => ({ id: s.id, re: new RegExp(s.motif) }));
const DOULEUR = new RegExp(donnees.douleur.motifs);
const COURBATURES = new RegExp(donnees.douleur.exclusions);
const ZONES = [...donnees.zones].sort((a, b) => b.length - a.length).map((z) => ({ z, re: new RegExp(`\\b${z}\\b`) }));
/** Noms de diagnostics : jamais stockés (contexte.md : pas d'étiquette de diagnostic, même dite par l'utilisateur). */
export const DIAGNOSTICS = new RegExp(donnees.diagnostics);
export const TEXTES_SANTE = donnees.textes as { drapeau_rouge_v1: string };
/** Zone gardée seulement si c'est une partie du corps, pas un diagnostic. */
export const zoneSure = (z: string | undefined): string | undefined => (z && !DIAGNOSTICS.test(normaliser(z)) ? z : undefined);

export type DetectionSante = { drapeau_rouge: string[]; douleur: boolean; zone?: string };

export function detecterSante(texte: string): DetectionSante {
  const t = normaliser(texte);
  const zone = ZONES.find((x) => x.re.test(t))?.z;
  return { drapeau_rouge: ROUGE.filter((s) => s.re.test(t)).map((s) => s.id), douleur: DOULEUR.test(t) && !COURBATURES.test(t), ...(zone && { zone }) };
}

// Jour calendaire dans le fuseau de l'utilisateur ; Europe/Paris par défaut tant qu'il n'est pas connu (architecture 9).
const JOUR = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" });
const jour = (d: Date) => JOUR.format(d);

/** Drapeau rouge signalé aujourd'hui : plus aucune prescription jusqu'au lendemain (5.2.5). */
export const prescriptionBloquee = (m: Magasin, maintenant = new Date()): boolean =>
  m.drapeau_rouge !== null && jour(new Date(m.drapeau_rouge)) === jour(maintenant);

export type SignalementSante = { type: "douleur" | "drapeau_rouge"; exercice?: string; zone?: string };

/**
 * Effets de signaler_sante (contrat 4.5), appelé par le routage (code) ou par le LLM.
 * douleur : restriction active sur l'exercice ou la zone, horodatée, motif fixe, sans citation ni diagnostic.
 * drapeau_rouge : prescription bloquée ce jour-là. Les deux : conversation signalée.
 */
export function signalerSante(m: Magasin, s: SignalementSante, messageId: string, maintenant = new Date()): Restriction | null {
  const h = maintenant.toISOString();
  m.signalements.push({ priorite: s.type, bloquant: s.type === "drapeau_rouge", horodatage: h, message_id: messageId });
  if (s.type === "drapeau_rouge") m.drapeau_rouge = h;
  if (s.type !== "douleur" || (!s.exercice && !s.zone)) return null;
  const r: Restriction = { ...(s.exercice && { exercice: s.exercice }), ...(s.zone && { zone: s.zone }), motif: "douleur", depuis: h };
  const restrictions = (m.profil.restrictions ??= []);
  const existante = restrictions.find((x) => x.exercice === r.exercice && x.zone === r.zone);
  if (existante) existante.depuis = h;
  else restrictions.push(r);
  return existante ?? r;
}
