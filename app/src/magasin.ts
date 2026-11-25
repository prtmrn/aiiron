// Magasin en mémoire (pas de base) : profil vivant, références e1RM, état de la conversation (docs/architecture.md 5.3 et 6).
import type { Materiel } from "../../engine/src/force/arrondi";
import { normaliserCles, normaliserExercice } from "../../engine/src/force/variantes";

export type Restriction = { exercice?: string; zone?: string; motif: string; depuis?: string };
export type Profil = {
  objectif?: string;
  niveau?: string;
  lieu?: string;
  materiel?: Materiel; // format Materiel du moteur force, par défaut pour tous les exercices
  equipements?: string[];
  restrictions?: Restriction[];
  [cle: string]: unknown;
};

export type TypeCrise = "suicide" | "automutilation" | "tca" | "autre";
export type NiveauCrise = "doute" | "crise" | "danger";
export type Crise = { type: TypeCrise; niveau: "crise" | "danger"; horodatage: string; message_id: string; tca_aussi: boolean };
export type Signalement = { priorite: "danger" | "crise" | "tca" | "doute" | "drapeau_rouge" | "douleur"; bloquant: boolean; horodatage: string; message_id: string };
export type Tour = { role: "utilisateur" | "aiiron"; texte: string; horodatage?: string };

export type Magasin = {
  profil: Profil;
  references: Record<string, number>; // e1RM par exercice (identifiants du moteur force, alias normalisés)
  provenance: Record<string, "contexte" | "declare" | "moteur">;
  etat: "normal" | "crise";
  crise: Crise | null;
  derniere_crise: string | null; // fenêtre de 30 jours (PC-7, PC-9)
  dernier_signal: string | null; // signal de niveau 1 à 3, fenêtre de 24 h (PC-9)
  doute_en_cours: boolean; // PC-4, point 6 : vaut pour le message suivant
  drapeau_rouge: string | null; // dernier drapeau rouge physique : plus de prescription ce jour-là (5.2.5)
  relances_coupees: boolean;
  signalements: Signalement[]; // journal local de revue humaine (pas d'alerte de garde dans le squelette)
  historique: Tour[];
};

export type Contexte = {
  profil?: Profil;
  references_e1rm?: Record<string, number>;
  etat_conversation?: "normal" | "crise";
};

export function creerMagasin(c: Contexte = {}, maintenant = new Date()): Magasin {
  const references = normaliserCles(c.references_e1rm ?? {});
  const enCrise = c.etat_conversation === "crise";
  return {
    profil: structuredClone(c.profil ?? {}),
    references,
    provenance: Object.fromEntries(Object.keys(references).map((k) => [k, "contexte" as const])),
    etat: enCrise ? "crise" : "normal",
    crise: enCrise ? { type: "autre", niveau: "crise", horodatage: maintenant.toISOString(), message_id: "contexte", tca_aussi: false } : null,
    derniere_crise: enCrise ? maintenant.toISOString() : null,
    dernier_signal: null,
    doute_en_cours: false,
    drapeau_rouge: null,
    relances_coupees: enCrise,
    signalements: [],
    historique: [],
  };
}

/** Restriction « douleur » active sur l'exercice (identifiant exact, alias normalisé). */
export const restrictionDouleur = (m: Magasin, exercice: string): Restriction | undefined =>
  m.profil.restrictions?.find((r) => r.exercice !== undefined && normaliserExercice(r.exercice) === normaliserExercice(exercice));
