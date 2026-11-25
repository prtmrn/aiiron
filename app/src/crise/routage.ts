// Routage de crise (PC-2) et ce que fait le code au déclenchement (PC-4). Déterministe, sans LLM.
import type { Magasin, NiveauCrise, TypeCrise } from "../magasin";
import type { SortieClassifieur } from "./classifieur";
import { resumer, type Detection } from "./lexique";
import { TEXTES, type IdTexte } from "./textes";

export type Decision = { niveau: 0 | 1 | 2 | 3; type: TypeCrise | null; tca: boolean; etiquette: string; texte_fixe: IdTexte | null };

const DU_CLASSIFIEUR: Partial<Record<SortieClassifieur["etiquette"], { niveau: 2 | 3; type: TypeCrise }>> = {
  danger: { niveau: 3, type: "suicide" },
  crise_suicide: { niveau: 2, type: "suicide" },
  crise_tca: { niveau: 2, type: "tca" },
  crise_autre: { niveau: 2, type: "autre" },
};

/**
 * PC-2 : union lexique ou classifieur, quelle que soit la confiance ; après crise_doute_v1 sans démenti clair → niveau 2 (PC-9).
 * Priorité danger > crise > crise TCA > doute ; un seul texte fixe par message.
 */
export function decider(d: Detection, c: SortieClassifieur | null, o: { doute: boolean; dementi: boolean }): Decision {
  const signaux: { niveau: 1 | 2 | 3; type: TypeCrise }[] = [...d.signaux];
  const cl = c && DU_CLASSIFIEUR[c.etiquette];
  if (cl) signaux.push(cl);
  if (o.doute && !o.dementi) signaux.push({ niveau: 2, type: "suicide" });
  const { niveau, type, tca } = resumer(signaux);
  if (niveau === 3) return { niveau, type, tca, etiquette: "danger", texte_fixe: "crise_danger_v1" };
  if (niveau === 2) {
    const etiquette = type === "tca" ? "crise_tca" : type === "suicide" ? "crise_suicide" : "crise_autre";
    return { niveau, type, tca, etiquette, texte_fixe: type === "tca" ? "crise_tca_v1" : "crise_v1" };
  }
  if (niveau === 1) return { niveau, type, tca, etiquette: "doute", texte_fixe: "crise_doute_v1" };
  return { niveau, type: null, tca: false, etiquette: c?.etiquette ?? "normal", texte_fixe: null };
}

const PRIORITE = (niveau: NiveauCrise, type: TypeCrise) => (niveau === "danger" ? "danger" : niveau === "doute" ? "doute" : type === "tca" ? "tca" : "crise");

/**
 * PC-4. crise / danger : état crise (type, niveau, horodatage, message), relances coupées, signalement bloquant.
 * doute : drapeau doute_en_cours et signalement non bloquant. Un nouveau signal en crise met à jour le niveau et le type.
 */
export function declencherCrise(m: Magasin, niveau: NiveauCrise, type: TypeCrise, messageId: string, maintenant = new Date()): void {
  const h = maintenant.toISOString();
  m.signalements.push({ priorite: PRIORITE(niveau, type), bloquant: niveau !== "doute", horodatage: h, message_id: messageId });
  if (niveau === "doute") {
    m.doute_en_cours = true;
    return;
  }
  const avant = m.crise;
  m.etat = "crise";
  m.relances_coupees = true;
  m.derniere_crise = h;
  m.doute_en_cours = false;
  if (!avant) {
    m.crise = { type, niveau, horodatage: h, message_id: messageId, tca_aussi: false };
    return;
  }
  if (niveau === "danger") avant.niveau = "danger";
  if (type === "tca" && avant.type !== "tca") avant.tca_aussi = true;
  else if (type !== "tca" && avant.type === "tca") Object.assign(avant, { type, tca_aussi: true });
}

/** Rappel fixe ajouté à chaque réponse générée en état crise (PC-3, PC-5) ; TCA ajoutée à une autre crise → les deux. */
export function rappel(m: Magasin): string {
  if (m.crise?.type === "tca") return TEXTES.crise_tca_rappel_v1;
  return m.crise?.tca_aussi ? `${TEXTES.crise_rappel_v1}\n\n${TEXTES.crise_tca_rappel_v1}` : TEXTES.crise_rappel_v1;
}

/**
 * Balises que le modèle renvoie s'il voit une crise que le lexique a ratée (persona/prompt-systeme.md).
 * Prudence : toute « [ALERTE » (un ou deux crochets, toute casse) ou tout « ALERTE_DANGER / ALERTE_CRISE » nu compte.
 */
export function baliseAlerte(texte: string): { niveau: "crise" | "danger"; type: TypeCrise; texte_fixe: IdTexte } | null {
  const b = texte.match(/\[\s*\[?\s*alerte[_ ]?([a-z_]*)/i) ?? texte.match(/\balerte_(danger|crise[a-z_]*)/i);
  if (!b) return null;
  const suite = b[1].toUpperCase();
  if (suite.startsWith("DANGER")) return { niveau: "danger", type: "suicide", texte_fixe: "crise_danger_v1" };
  if (suite.startsWith("CRISE_TCA")) return { niveau: "crise", type: "tca", texte_fixe: "crise_tca_v1" };
  return { niveau: "crise", type: "suicide", texte_fixe: "crise_v1" }; // ALERTE_CRISE ou balise mal formée : prudence
}
