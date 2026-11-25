// Classifieur d'entrée (docs/architecture.md 5.1) : Haiku via l'Agent SDK, sans outil, comme le juge des évals.
// Toute erreur, tout délai dépassé et toute sortie illisible lèvent une erreur : la chaîne la lit comme une panne (PC-2.4).
import { fileURLToPath } from "node:url";
import { chargerPrompt, executer, optionsBase } from "../agent";
import type { SortieAgent, Usage } from "../chaine";
import type { Tour } from "../magasin";
import { EXERCICES_FORCE } from "../outils";
import { normaliserExercice } from "../../../engine/src/force/variantes";

export const ETIQUETTES = ["danger", "crise_suicide", "crise_tca", "crise_autre", "drapeau_rouge", "douleur", "medical", "hors_sujet", "normal"] as const;
export type EtiquetteClassifieur = (typeof ETIQUETTES)[number];
export type SortieClassifieur = { etiquette: EtiquetteClassifieur; confiance: number; zone?: string; exercice?: string; stub?: true; usage?: Usage[] };
/** Une erreur levée = panne (PC-2.4 : le lexique seul décide, exclusions désactivées). */
export type Classifieur = (message: string, historique: Tour[]) => Promise<SortieClassifieur>;

export const MODELE_CLASSIFIEUR = "claude-haiku-5-5";
// Délai prudent : démarrage du processus Claude Code compris. Au-delà, panne (lexique seul), jamais de blocage.
export const DELAI_CLASSIFIEUR_MS = 10_000;
const ZONE_MAX = 40;

// Le stub se signale comme tel : ce n'est pas une panne, sinon les exclusions de PC-9 ne s'appliqueraient jamais. Tests unitaires seulement.
export const classifieurStub: Classifieur = async () => ({ etiquette: "normal", confiance: 0, stub: true });

export const PROMPT_CLASSIFIEUR = fileURLToPath(new URL("../../donnees/classifieur.md", import.meta.url));
export const systemeClassifieur = () => chargerPrompt(PROMPT_CLASSIFIEUR).replace("{{EXERCICES}}", EXERCICES_FORCE.join(", "));

/** Message et historique en données balisées ; les balises sont retirées du texte pour qu'il ne puisse pas les fermer. */
export function promptClassifieur(message: string, historique: Tour[]): string {
  const sans = (t: string) => t.replace(/<\/?(historique|message)>/gi, "");
  const h = historique.map((t) => `${t.role === "utilisateur" ? "Utilisateur" : "aiiron"} : ${sans(t.texte)}`).join("\n") || "(aucun)";
  return `Messages des dernières 24 h :\n<historique>\n${h}\n</historique>\n\nNouveau message à classer :\n<message>\n${sans(message)}\n</message>`;
}

/** Lit la sortie JSON. Étiquette inconnue ou JSON illisible → erreur (panne) ; zone ou exercice invalides → ignorés. */
export function lireSortieClassifieur(texte: string): SortieClassifieur {
  const brut = JSON.parse(texte.slice(texte.indexOf("{"), texte.lastIndexOf("}") + 1)) as Record<string, unknown>;
  const etiquette = brut.etiquette as EtiquetteClassifieur;
  if (!ETIQUETTES.includes(etiquette)) throw new Error(`classifieur : étiquette inconnue (${String(brut.etiquette)})`);
  const c = typeof brut.confiance === "number" && Number.isFinite(brut.confiance) ? Math.min(1, Math.max(0, brut.confiance)) : 0;
  const s: SortieClassifieur = { etiquette, confiance: c };
  if (typeof brut.zone === "string" && brut.zone.trim() && brut.zone.length <= ZONE_MAX) s.zone = brut.zone.trim();
  if (typeof brut.exercice === "string" && EXERCICES_FORCE.includes(normaliserExercice(brut.exercice))) s.exercice = normaliserExercice(brut.exercice);
  return s;
}

type Executer = (prompt: string, options: Parameters<typeof executer>[1]) => Promise<SortieAgent>;

export function creerClassifieur(o: { delaiMs?: number; executer?: Executer } = {}): Classifieur {
  const systeme = systemeClassifieur(); // prompt manquant : arrêt au démarrage, pas au premier message
  const lancer = o.executer ?? executer;
  const delai = o.delaiMs ?? DELAI_CLASSIFIEUR_MS;
  return async (message, historique) => {
    const ac = new AbortController();
    let minuteur: NodeJS.Timeout | undefined;
    const expire = new Promise<never>((_, rejeter) => {
      minuteur = setTimeout(() => (ac.abort(), rejeter(new Error("classifieur : délai dépassé"))), delai);
    });
    try {
      const s = await Promise.race([lancer(promptClassifieur(message, historique), { ...optionsBase(MODELE_CLASSIFIEUR, systeme), maxTurns: 1, abortController: ac }), expire]);
      return { ...lireSortieClassifieur(s.texte), usage: s.usage };
    } finally {
      clearTimeout(minuteur);
    }
  };
}
