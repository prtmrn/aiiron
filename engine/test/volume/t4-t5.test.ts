// Moteur volume : cas T4 et T5 de knowledge/force/cas-de-test.md,
// règles MAP-2 à MAP-7 de knowledge/hypertrophie/mapping-muscles.md (JSON v3)
import { describe, expect, it } from "vitest";
import { compterVolume, resoudreExercice, type DonneesVolume, type Exercice, type LigneVolume } from "../../src/volume";
import { donneesVolume as d } from "../../src/volume/donnees";

const un = { poids: "un" } as const;

/** Reproduit le tableur T4 : chaque ligne contient les muscles deux fois, et on cherche chaque muscle par sous-chaîne. */
function compterBugueSousChaine(lignes: LigneVolume[], poids: "reels" | "un" = "reels") {
  const out: Record<string, number> = {};
  for (const { exercice, series } of lignes) {
    const r = resoudreExercice(exercice, d);
    const wS = poids === "un" ? 1 : 0.5;
    const muscles = [...r.principaux.map((m) => [m, 1] as const), ...r.secondaires.map((m) => [m, wS] as const)];
    const colonne = muscles.map(([m]) => m).join(", ");
    const ligne = `${colonne} | ${colonne}`;
    for (const [m, w] of muscles) out[m] = (out[m] ?? 0) + series * w * (ligne.split(m).length - 1);
  }
  return out;
}

/** Reproduit le tableur T5 : la ligne i reçoit les muscles de la ligne i − 1 (la première, rien). */
const decaler = (lignes: LigneVolume[]): LigneVolume[] =>
  lignes.slice(1).map((l, i) => ({ exercice: lignes[i].exercice, series: l.series }));

describe("T4 — semaine libre : squat 0043 × 3 + presse 0739 × 3", () => {
  const semaine: LigneVolume[] = [
    { exercice: "0043", series: 3 },
    { exercice: "0739", series: 3 },
  ];

  it("poids réels : quadriceps 6, fessiers 4,5, adducteurs 3 ; core 1,5 à part", () => {
    const c = compterVolume(semaine, d);
    expect(c.volume).toEqual({ quadriceps: 6, fessiers: 4.5, adducteurs: 3 });
    expect(c.compteurs_separes).toEqual({ core: 1.5 });
    expect(c.agregats).toEqual({});
    expect(c.drapeaux).toEqual([]);
  });

  it("poids 1 : quadriceps 6, fessiers 6, adducteurs 6 ; core 3 à part", () => {
    const c = compterVolume(semaine, d, un);
    expect(c.volume).toEqual({ quadriceps: 6, fessiers: 6, adducteurs: 6 });
    expect(c.compteurs_separes).toEqual({ core: 3 });
  });

  it("bugué (sous-chaîne) : la reproduction du tableur donne 12 / 9 / 6 et 12 / 12 / 12, le moteur non", () => {
    const b = compterBugueSousChaine(semaine);
    expect([b.quadriceps, b.fessiers, b.adducteurs]).toEqual([12, 9, 6]);
    const b1 = compterBugueSousChaine(semaine, "un");
    expect([b1.quadriceps, b1.fessiers, b1.adducteurs]).toEqual([12, 12, 12]);
    expect(compterVolume(semaine, d).volume.quadriceps).not.toBe(b.quadriceps);
    expect(compterVolume(semaine, d, un).volume.fessiers).not.toBe(b1.fessiers);
  });

  it("core n'entre jamais dans le volume", () => {
    expect(compterVolume(semaine, d).volume).not.toHaveProperty("core");
  });

  it("doublon entre champs : 0208 a « biceps » dans groupe_musculaire et muscles_secondaires → biceps 0,5 une seule fois", () => {
    expect(d.mapping.surcharges).not.toHaveProperty("0208");
    const r = resoudreExercice("0208", d);
    expect(r).toMatchObject({ principaux: ["haut_du_dos"], secondaires: ["biceps", "avant_bras"], groupe: "haut_du_dos" });
    expect(compterVolume([{ exercice: "0208", series: 1 }], d).volume).toEqual({ haut_du_dos: 1, biceps: 0.5, avant_bras: 0.5 });
    expect(compterVolume([{ exercice: "0208", series: 1 }], d, un).volume).toEqual({ haut_du_dos: 1, biceps: 1, avant_bras: 1 });
  });

  it("synonymes : « quads » et « quadriceps » → un seul identifiant quadriceps", () => {
    expect(d.mapping.libelles.quads.muscle).toBe("quadriceps");
    expect(d.mapping.libelles.quadriceps.muscle).toBe("quadriceps");
    const ex: Exercice = { id: "test-quads", nom_en: "test", muscle_cible: "quads", groupe_musculaire: "quadriceps", muscles_secondaires: ["quadriceps"] };
    const avecTest: DonneesVolume = { ...d, exercices: new Map([...d.exercices, [ex.id, ex]]) };
    expect(compterVolume([{ exercice: ex.id, series: 2 }], avecTest).volume).toEqual({ quadriceps: 2 });
  });

  it("2287 (cible « quads », surchargé presse) : par série quadriceps 1, fessiers 0,5, adducteurs 0,5", () => {
    expect(compterVolume([{ exercice: "2287", series: 1 }], d).volume).toEqual({ quadriceps: 1, fessiers: 0.5, adducteurs: 0.5 });
  });

  // Pièges de sous-chaîne, sur des exercices réels du dataset résolus par libellés (sans surcharge)
  it.each<[string, string, string[], string[]]>([
    ["rear deltoids", "0150", ["dorsaux"], ["biceps", "haut_du_dos", "deltoides_posterieurs"]],
    ["deltoids", "0040", ["pectoraux"], ["deltoides", "triceps"]],
    ["lower back", "0001", ["abdominaux"], ["flechisseurs_hanche", "lombaires"]],
    ["upper back", "0208", ["haut_du_dos"], ["biceps", "avant_bras"]], // 0027 a une surcharge depuis le mapping v4 (dorsaux)
    ["back (ambigu, non compté)", "2355", ["abdominaux"], ["deltoides"]],
    ["lower abs", "0459", ["fessiers"], ["flechisseurs_hanche", "abdominaux"]],
    ["upper chest", "2137", ["deltoides"], ["triceps", "pectoraux"]],
  ])("libellé « %s » (%s) : correspondance par libellé entier", (_l, id, principaux, secondaires) => {
    expect(d.mapping.surcharges).not.toHaveProperty(id);
    const r = resoudreExercice(id, d);
    expect(r.principaux).toEqual(principaux);
    expect(r.secondaires).toEqual(secondaires);
  });

  it("« deltoids » → agrégat deltoides avec TETE_DELTOIDE_NON_PRECISEE ; « rear deltoids » n'y va pas", () => {
    expect(compterVolume([{ exercice: "0040", series: 2 }], d)).toEqual({
      volume: { pectoraux: 2, triceps: 1 },
      agregats: { deltoides: 1 },
      compteurs_separes: {},
      drapeaux: [{ code: "TETE_DELTOIDE_NON_PRECISEE", exercice: "0040" }],
    });
    const c = compterVolume([{ exercice: "0150", series: 2 }], d);
    expect(c.volume).toEqual({ dorsaux: 2, biceps: 1, haut_du_dos: 1, deltoides_posterieurs: 1 });
    expect(c.agregats).toEqual({});
    expect(c.drapeaux).toEqual([]);
  });
});

describe("T5 — séance : 0025 × 4, 0027 × 3, 0043 × 5", () => {
  const seance: LigneVolume[] = [
    { exercice: "0025", series: 4 },
    { exercice: "0027", series: 3 },
    { exercice: "0043", series: 5 },
  ];
  const attenduReels = { pectoraux: 4, triceps: 2, deltoides_anterieurs: 2, haut_du_dos: 3, dorsaux: 1.5, biceps: 1.5, avant_bras: 1.5, quadriceps: 5, fessiers: 5, adducteurs: 2.5 };
  const attenduUn = { pectoraux: 4, triceps: 4, deltoides_anterieurs: 4, haut_du_dos: 3, dorsaux: 3, biceps: 3, avant_bras: 3, quadriceps: 5, fessiers: 5, adducteurs: 5 };

  it("poids réels", () => {
    const c = compterVolume(seance, d);
    expect(c.volume).toEqual(attenduReels);
    expect(c.compteurs_separes).toEqual({ core: 2.5 });
    expect(c.drapeaux).toEqual([]);
  });

  it("poids 1", () => {
    const c = compterVolume(seance, d, un);
    expect(c.volume).toEqual(attenduUn);
    expect(c.compteurs_separes).toEqual({ core: 5 });
  });

  it("l'ordre des lignes ne change aucun total (6 permutations)", () => {
    const [a, b, c] = seance;
    for (const p of [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]]) {
      expect(compterVolume(p, d)).toEqual(compterVolume(seance, d));
      expect(compterVolume(p, d, un)).toEqual(compterVolume(seance, d, un));
    }
  });

  it("bugué (décalage d'une ligne) : la reproduction donne les valeurs de la fiche, le moteur non", () => {
    const b = compterVolume(decaler(seance), d);
    expect(b.volume).toEqual({ pectoraux: 3, triceps: 1.5, deltoides_anterieurs: 1.5, haut_du_dos: 5, dorsaux: 2.5, biceps: 2.5, avant_bras: 2.5 });
    expect(b.compteurs_separes).toEqual({});
    expect(compterVolume(decaler(seance), d, un).volume).toEqual({ pectoraux: 3, triceps: 3, deltoides_anterieurs: 3, haut_du_dos: 5, dorsaux: 5, biceps: 5, avant_bras: 5 });
    expect(compterVolume(seance, d).volume).not.toEqual(b.volume);
  });

  it("exercice sans mapping : EXERCICE_SANS_MAPPING, rien compté pour lui, jamais les muscles d'une ligne voisine", () => {
    const avecInconnu = [seance[0], { exercice: "9999", series: 3 }, seance[1], seance[2]];
    const c = compterVolume(avecInconnu, d);
    expect(c.volume).toEqual(attenduReels);
    expect(c.compteurs_separes).toEqual({ core: 2.5 });
    expect(c.drapeaux).toEqual([{ code: "EXERCICE_SANS_MAPPING", exercice: "9999" }]);
    expect(resoudreExercice("9999", d)).toEqual({ principaux: [], secondaires: [], groupe: null, hors_volume: null, drapeaux: ["EXERCICE_SANS_MAPPING"] });
  });
});
