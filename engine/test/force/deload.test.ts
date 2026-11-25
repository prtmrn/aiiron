// Deload : knowledge/force/deload.md ; cas T1 et T12 de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import type { Materiel } from "../../src/force/arrondi";
import { corrigerDeload, evaluerDeload, validerDeload, type Semaine } from "../../src/force/deload";
import { pct } from "../../src/force/rpe";

const barre: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5 };
const e1rm = { squat: 150 };
const materiel = { squat: barre };

const S3: Semaine = {
  deload: false,
  exercices: [
    {
      exercice: "squat",
      lignes: [
        { series: 1, reps: 1, rpe: 8 },
        { series: 4, reps: 3, rpe: 8 },
      ],
    },
  ],
};
const S4: Semaine = {
  deload: true,
  exercices: [
    {
      exercice: "squat",
      lignes: [
        { series: 1, reps: 1, rpe: 9 },
        { series: 1, reps: 1, rpe: 10 },
        { series: 3, reps: 3, rpe: 7 },
      ],
    },
  ],
};

describe("T1 — semaine « DELOAD » avec singles à RPE 9–10", () => {
  it("validerDeload : refus, violations attendues ligne par ligne", () => {
    const { violations } = validerDeload(S4, S3, e1rm);
    const parLigne = (l: number | undefined) =>
      violations.filter((v) => v.ligne === l).map((v) => v.code).sort();
    expect(parLigne(0)).toEqual(["DELOAD_INTENSITE_TROP_HAUTE", "DELOAD_RPE_TROP_HAUT", "DELOAD_SINGLE_LOURD"]);
    expect(parLigne(1)).toEqual(["DELOAD_INTENSITE_TROP_HAUTE", "DELOAD_RPE_TROP_HAUT", "DELOAD_SINGLE_LOURD"]);
    expect(parLigne(2)).toEqual(["DELOAD_INTENSITE_TROP_HAUTE"]);
    expect(parLigne(undefined)).toEqual(["DELOAD_VOLUME_TROP_HAUT"]);
    expect(violations).toHaveLength(8); // bugué : semaine acceptée telle quelle
  });

  // R4 étape 2 (décision de Pierrot du 25/11/2026) : 3 reps n'ont aucun RPE ≥ 6 sous 0,80 → 4 reps @ 6.
  // pct(4, 6) = min(30/37,5 ; 28,5/36) = 0,791667 ; 150 × 0,791667 = 118,75 → arrondi.
  it("corrigerDeload : squat 3 × 4 @ 6 à 117,5 kg, singles supprimés, changements listés", () => {
    const { semaine, changements } = corrigerDeload(S4, S3, e1rm, materiel);
    expect(semaine.exercices[0].lignes).toEqual([{ series: 3, reps: 4, rpe: 6, charge: 117.5 }]);
    expect(changements.length).toBeGreaterThan(0);
  });

  it("la semaine corrigée de T1 passe validerDeload", () => {
    const { semaine } = corrigerDeload(S4, S3, e1rm, materiel);
    expect(validerDeload(semaine, S3, e1rm).violations).toEqual([]);
  });

  it("propriété : une semaine corrigée a RPE ≤ 7, charge ≤ 0,80 × e1RM, aucun single ≥ 8, aucun AMRAP", () => {
    const sale: Semaine = {
      deload: true,
      exercices: [
        {
          exercice: "squat",
          lignes: [
            { series: 2, reps: 5, rpe: 9 },
            { series: 1, reps: 8, amrap: true },
            { series: 3, reps: 2, pct: 0.9 },
            { series: 1, reps: 1, rpe: 8 },
          ],
        },
      ],
    };
    const { semaine } = corrigerDeload(sale, S3, e1rm, materiel);
    for (const l of semaine.exercices[0].lignes) {
      expect(l.rpe === undefined || l.rpe <= 7).toBe(true);
      expect(l.charge!).toBeLessThanOrEqual(0.8 * 150);
      expect(l.amrap).toBeFalsy();
      expect(l.reps === 1 && (l.rpe ?? 0) >= 8).toBe(false);
    }
    expect(semaine.exercices[0].lignes.reduce((s, l) => s + l.series, 0)).toBeLessThanOrEqual(3);
    expect(validerDeload(semaine, S3, e1rm).violations).toEqual([]);
  });

  it("étape 2 : RPE baissé jusqu'à pct ≤ 0,80 ; 1 à 3 reps → 4 reps @ 6", () => {
    const lignes = (l: Semaine["exercices"][0]["lignes"]) =>
      corrigerDeload({ deload: true, exercices: [{ exercice: "squat", lignes: l }] }, null, e1rm, materiel).semaine.exercices[0].lignes;
    expect(lignes([{ series: 1, reps: 5, rpe: 9 }])[0]).toMatchObject({ reps: 5, rpe: 7 }); // pct(5, 7) = 0,792
    expect(lignes([{ series: 1, reps: 4, rpe: 8 }])[0]).toMatchObject({ reps: 4, rpe: 6 }); // pct(4, 6,5) = 0,806 > 0,80
    expect(lignes([{ series: 1, reps: 2, rpe: 7 }])[0]).toMatchObject({ reps: 4, rpe: 6 });
    expect(lignes([{ series: 1, reps: 1, rpe: 7.3 }])[0]).toMatchObject({ reps: 4, rpe: 6 });
  });

  it("étape 4 : tout supprimé → ceil(référence / 2) × 4 reps @ RPE 6", () => {
    const singles: Semaine = {
      deload: true,
      exercices: [{ exercice: "squat", lignes: [{ series: 2, reps: 1, rpe: 9 }] }],
    };
    const { semaine } = corrigerDeload(singles, S3, e1rm, materiel);
    expect(pct(4, 6)).toBeLessThanOrEqual(0.8);
    expect(semaine.exercices[0].lignes).toEqual([{ series: 3, reps: 4, rpe: 6, charge: 117.5 }]);
  });

  it("sans semaine de référence : DELOAD_VOLUME_NON_VERIFIABLE", () => {
    expect(validerDeload(S4, null, e1rm).drapeaux).toEqual(["DELOAD_VOLUME_NON_VERIFIABLE"]);
  });
});

describe("T12 — déclencheurs de deload", () => {
  const base = { niveau: "intermediaire" as const, semainesDeCharge: 2, semainesDepuisDernierDeload: 6 };

  it("régression : 150, 152, 151, 143 → deload (143 ≤ 0,95 × 152)", () => {
    const r = evaluerDeload({ ...base, refsHebdo: { squat: [150, 152, 151, 143] } });
    expect(r.deload).toBe(true);
    expect(r.raisons).toContain("regression");
  });

  it("stagnation + fatigue (3 SERIE_DURE sur 7 jours) → deload", () => {
    const r = evaluerDeload({ ...base, refsHebdo: { squat: [150, 150, 150, 149.5] }, seriesDures7j: 3 });
    expect(r.deload).toBe(true);
    expect(r.raisons.sort()).toEqual(["fatigue", "stagnation"]);
  });

  it("stagnation seule → pas de deload, STAGNATION", () => {
    const r = evaluerDeload({ ...base, refsHebdo: { squat: [150, 150, 150, 149.5] } });
    expect(r.deload).toBe(false);
    expect(r.drapeaux).toEqual(["STAGNATION"]);
  });

  it("régression mais dernier deload il y a 2 semaines → FATIGUE_PERSISTANTE_APRES_DELOAD", () => {
    const r = evaluerDeload({
      ...base,
      semainesDepuisDernierDeload: 2,
      refsHebdo: { squat: [150, 152, 151, 143] },
    });
    expect(r.deload).toBe(false);
    expect(r.drapeaux).toEqual(["FATIGUE_PERSISTANTE_APRES_DELOAD"]);
  });

  it("intermédiaire, 5 semaines de charge, modèle sans semaine deload → deload planifié", () => {
    const r = evaluerDeload({ ...base, semainesDeCharge: 5, refsHebdo: { squat: [140, 145, 148, 150] } });
    expect(r.deload).toBe(true);
    expect(r.raisons).toEqual(["planifie"]);
    expect(evaluerDeload({ ...base, semainesDeCharge: 4, refsHebdo: {} }).deload).toBe(false);
  });

  it("le modèle place une semaine deload → planifié", () => {
    expect(evaluerDeload({ ...base, semaineDeloadDuModele: true, refsHebdo: {} }).raisons).toEqual(["planifie"]);
  });
});

describe("alias couche → developpe_couche", () => {
  const couche: Semaine = { deload: true, exercices: [{ exercice: "couche", lignes: [{ series: 3, reps: 5, charge: 90 }] }] };
  const ref: Semaine = { deload: false, exercices: [{ exercice: "developpe_couche", lignes: [{ series: 4, reps: 5, rpe: 8 }] }] };

  it("validerDeload : e1RM saisi sous l'identifiant canonique, la charge est quand même contrôlée", () => {
    const { violations } = validerDeload(couche, ref, { developpe_couche: 100 });
    expect(violations).toContainEqual({ code: "DELOAD_INTENSITE_TROP_HAUTE", exercice: "developpe_couche", ligne: 0 });
    expect(violations).toContainEqual({ code: "DELOAD_VOLUME_TROP_HAUT", exercice: "developpe_couche" });
  });

  it("corrigerDeload : e1RM et matériel sous l'alias, sortie sous l'identifiant canonique", () => {
    const s: Semaine = { deload: true, exercices: [{ exercice: "couche", lignes: [{ series: 2, reps: 5, rpe: 8 }] }] };
    const { semaine } = corrigerDeload(s, ref, { couche: 100 }, { couche: barre });
    expect(semaine.exercices[0].exercice).toBe("developpe_couche");
    expect(semaine.exercices[0].lignes.every((l) => l.charge !== undefined && l.charge <= 80)).toBe(true);
  });
});
