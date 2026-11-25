// Textes fixes de crise : extraits de knowledge/sante-mentale/protocole-crise.md (PC-3), jamais recopiés dans le code.
import { readFileSync } from "node:fs";

export type IdTexte =
  | "crise_v1"
  | "crise_danger_v1"
  | "crise_tca_v1"
  | "crise_doute_v1"
  | "crise_rappel_v1"
  | "crise_tca_rappel_v1"
  | "crise_repli_v1";
const IDS: IdTexte[] = ["crise_v1", "crise_danger_v1", "crise_tca_v1", "crise_doute_v1", "crise_rappel_v1", "crise_tca_rappel_v1", "crise_repli_v1"];

/** Chaque texte = le bloc de code qui suit la ligne commençant par son identifiant entre accents graves. */
export function extraireTextes(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, id, texte] of md.matchAll(/^`(crise_[a-z0-9_]+)`[^\n]*\n```\n([\s\S]*?)\n```/gm)) out[id] = texte;
  return out;
}

const md = readFileSync(new URL("../../../knowledge/sante-mentale/protocole-crise.md", import.meta.url), "utf8");
const extraits = extraireTextes(md);
for (const id of IDS) if (!extraits[id]) throw new Error(`protocole-crise.md : texte fixe ${id} introuvable (PC-3).`);
export const TEXTES = Object.fromEntries(IDS.map((id) => [id, extraits[id]])) as Record<IdTexte, string>;
