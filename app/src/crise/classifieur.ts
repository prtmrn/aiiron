// Classifieur d'entrée (docs/architecture.md 5.1). Le vrai classifieur (Haiku) n'existe pas encore : stub.
import type { Tour } from "../magasin";

export type EtiquetteClassifieur =
  | "danger"
  | "crise_suicide"
  | "crise_tca"
  | "crise_autre"
  | "drapeau_rouge"
  | "douleur"
  | "medical"
  | "hors_sujet"
  | "normal";
export type SortieClassifieur = { etiquette: EtiquetteClassifieur; confiance: number; zone?: string; exercice?: string; stub?: true };
/** Une erreur levée = panne (PC-2.4 : le lexique seul décide, exclusions désactivées). */
export type Classifieur = (message: string, historique: Tour[]) => Promise<SortieClassifieur>;

// shortcut: renvoie toujours « normal » ; seul le lexique repère les crises tant que le classifieur Haiku n'est pas écrit.
// Le stub se signale comme tel : ce n'est pas une panne, sinon les exclusions de PC-9 ne s'appliqueraient jamais.
export const classifieurStub: Classifieur = async () => ({ etiquette: "normal", confiance: 0, stub: true });
