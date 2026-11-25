// Comptage des séries par muscle : knowledge/hypertrophie/mapping-muscles.md (MAP-3 à MAP-5, MAP-7, MAP-9, MAP-11)
import { resoudreExercice, type DonneesVolume, type DrapeauVolume } from "./resolution";

/** Séries de travail seulement : les séries d'approche ne comptent jamais (MAP-5). */
export interface LigneVolume {
  exercice: string;
  series: number;
}

export interface ComptageVolume {
  volume: Record<string, number>; // muscles comptés en volume hypertrophie, hors agrégat
  agregats: Record<string, number>; // MAP-7 : deltoides, tête non précisée, jamais réparti
  compteurs_separes: Record<string, number>; // MAP-9 : core, jamais dans le volume
  drapeaux: { code: DrapeauVolume; exercice: string }[];
}

/**
 * Séance ou semaine : compte(m) = Σ séries × poids(ex, m).
 * poids "reels" : regle_comptage du mapping (MAP-4) ; poids "un" : tout muscle associé compte 1 (mode de test T4/T5).
 */
export function compterVolume(lignes: LigneVolume[], d: DonneesVolume, options: { poids?: "reels" | "un" } = {}): ComptageVolume {
  const { poids_principal, poids_secondaire } = d.mapping.regle_comptage;
  const [wP, wS] = options.poids === "un" ? [1, 1] : [poids_principal, poids_secondaire];
  const muscles = new Map(d.mapping.muscles.map((m) => [m.id, m]));
  const out: ComptageVolume = { volume: {}, agregats: {}, compteurs_separes: {}, drapeaux: [] };
  const ajouter = (cible: Record<string, number>, m: string, n: number) => (cible[m] = (cible[m] ?? 0) + n);

  for (const { exercice, series } of lignes) {
    const r = resoudreExercice(exercice, d);
    for (const code of r.drapeaux) out.drapeaux.push({ code, exercice });
    // MAP-11 hors volume ; MAP-3 cardio (principaux vides) : rien, même sur les secondaires
    if (r.drapeaux.length > 0 || r.hors_volume !== null || r.principaux.length === 0) continue;

    let agregat = false;
    for (const [ids, w] of [[r.principaux, wP], [r.secondaires, wS]] as const) {
      for (const id of ids) {
        const m = muscles.get(id);
        if (!m) throw new Error(`Muscle absent de mapping-muscles.json : ${id}`);
        if (m.agregat_de) {
          ajouter(out.agregats, id, series * w);
          agregat = true;
        } else if (m.compte_volume) ajouter(out.volume, id, series * w);
        else if (m.compteur_separe) ajouter(out.compteurs_separes, id, series * w);
      }
    }
    if (agregat) out.drapeaux.push({ code: "TETE_DELTOIDE_NON_PRECISEE", exercice });
  }
  return out;
}
