// Lexique de crise déterministe : knowledge/sante-mentale/lexique-crise.json (PC-1, PC-7, PC-9).
import donnees from "../../../knowledge/sante-mentale/lexique-crise.json";
import type { TypeCrise } from "../magasin";

type SignalDonnee = { id: string; niveau: 1 | 2 | 3; type: TypeCrise; ambigu?: boolean; motif: string };
const SIGNAUX = (donnees.signaux as SignalDonnee[]).map((s) => ({ ...s, re: new RegExp(s.motif) }));
const CORRECTIONS = donnees.corrections.map(([motif, remplacement]) => [new RegExp(motif, "g"), remplacement] as const);
const EXCLUSIONS = donnees.exclusions.map((m) => new RegExp(m, "g"));
const SPORT = new RegExp(donnees.contexte_sportif);
const DEMENTI = new RegExp(donnees.dementis.motifs);
const CONTRAIRE = new RegExp(donnees.dementis.contraires);

export type Signal = { id: string; niveau: 1 | 2 | 3; type: TypeCrise };
export type Detection = { niveau: 0 | 1 | 2 | 3; type: TypeCrise | null; tca: boolean; signaux: Signal[] };

/** Minuscules, sans accents, apostrophes droites, ponctuation → espaces, fautes courantes corrigées. */
export function normaliser(texte: string): string {
  let t = texte
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[’‘ʼ´`′]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .replace(/\s*'\s*/g, "'")
    .trim();
  for (const [re, r] of CORRECTIONS) t = t.replace(re, r);
  return t.replace(/\s+/g, " ").trim();
}

/**
 * Signaux d'un message. exclusions : PC-9 actives (aucun signal dans les 24 h, aucune crise dans les 30 jours,
 * pas de doute en cours, classifieur disponible). apresCrise : crise dans les 30 jours, tout niveau 1 passe à 2 (PC-7).
 */
export function detecter(texte: string, o: { exclusions: boolean; apresCrise: boolean }): Detection {
  let t = normaliser(texte);
  const sport = SPORT.test(t);
  if (o.exclusions && sport) for (const re of EXCLUSIONS) t = t.replace(re, " ");
  const signaux: Signal[] = [];
  for (const s of SIGNAUX) {
    if (!s.re.test(t)) continue;
    let niveau = s.ambigu && sport ? 1 : s.niveau; // intention ambiguë en contexte sportif : doute, jamais 0
    if (o.apresCrise && niveau === 1) niveau = 2;
    signaux.push({ id: s.id, niveau, type: s.type });
  }
  return { ...resumer(signaux), signaux };
}

/** Niveau maximal ; à niveau égal, le type non TCA l'emporte (PC-2.2). */
export function resumer(signaux: Omit<Signal, "id">[]): Omit<Detection, "signaux"> {
  const niveau = Math.max(0, ...signaux.map((s) => s.niveau)) as Detection["niveau"];
  const hauts = signaux.filter((s) => s.niveau === niveau);
  const type = niveau === 0 ? null : (hauts.find((s) => s.type !== "tca") ?? hauts[0]).type;
  return { niveau, type, tca: signaux.some((s) => s.type === "tca" && s.niveau >= 2) };
}

/** Démenti clair après crise_doute_v1 (« non, je parlais des burpees ») ; « non » seul ou « ça va pas » ne suffisent pas. */
export const estDementi = (texte: string): boolean => {
  const t = normaliser(texte);
  return DEMENTI.test(t) && !CONTRAIRE.test(t);
};
