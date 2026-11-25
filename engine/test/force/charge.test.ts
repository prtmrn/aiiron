// Charge de travail : knowledge/force/moteur-force.md (ordre des opérations), table-rpe.md R4/R5,
// variantes-discounts.md R1/R5. Cas T2 et T3 de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import type { Materiel } from "../../src/force/arrondi";
import { chargeCible, chargeLigne } from "../../src/force/charge";
import { paliers } from "../../src/force/paliers";
import { pct } from "../../src/force/rpe";
import { e1rmEffectif } from "../../src/force/variantes";

const barre: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5 };

describe("chargeCible", () => {
  it("moteur-force.md : squat e1RM 150, 5 @ 8 → brute 122,917 → 122,5", () => {
    const r = chargeCible(150, barre, 5, 8);
    expect(r.brute).toBeCloseTo(122.916667, 5);
    expect(r.charge).toBe(122.5);
  });
  it("hors domaine : pas de charge", () => {
    const r = chargeCible(150, barre, 16, 8);
    expect(r.charge).toBeNull();
    expect(r.drapeaux).toContain("HORS_DOMAINE");
  });
  it("RPE prescrit plafonné à 9,5 hors test_1rm (ajustement-rpe.md R7)", () => {
    expect(chargeCible(150, barre, 1, 10).rpe).toBe(9.5);
    expect(chargeCible(150, barre, 1, 10, "test_1rm").rpe).toBe(10);
  });
  it("deload : RPE ≤ 7 et charge ≤ 0,80 × e1RM (deload.md R2)", () => {
    const r = chargeCible(150, barre, 3, 7, "deload");
    expect(r.charge).toBe(120);
    expect(chargeCible(150, barre, 1, 9, "deload").charge).toBeLessThanOrEqual(120);
  });
});

describe("T2 — % saisis à la main, incohérents avec les RPE ; RPE manquants", () => {
  const cas: [string, { reps: number; rpe?: number; pct?: number }, number | null, string[]][] = [
    ["L1", { reps: 5, rpe: 8, pct: 0.85 }, 115, ["INCOHERENCE_PCT_RPE"]],
    ["L2", { reps: 5, rpe: 7, pct: 0.87 }, 110, ["INCOHERENCE_PCT_RPE"]],
    ["L3", { reps: 3, pct: 0.85 }, 117.5, ["RPE_DEDUIT_DU_PCT"]],
    ["L4", { reps: 5, pct: 0.92 }, null, ["PCT_IMPOSSIBLE"]],
    ["L5", { reps: 4 }, null, ["PRESCRIPTION_INCOMPLETE"]],
    ["L6", { reps: 1, rpe: 8, pct: 0.8 }, 130, ["INCOHERENCE_PCT_RPE"]],
  ];
  it.each(cas)("%s", (_l, ligne, charge, drapeaux) => {
    const r = chargeLigne(140, barre, ligne);
    expect(r.charge).toBe(charge);
    expect(r.drapeaux).toEqual(drapeaux);
  });
  it("L3 : RPE implicite 7,206 arrondi à 7", () => {
    expect(chargeLigne(140, barre, { reps: 3, pct: 0.85 }).rpe).toBe(7);
  });
  it("e1RM 140 → 150 : L1 suit l'e1RM (122,5), jamais le % figé (bugué : 120)", () => {
    expect(chargeLigne(150, barre, { reps: 5, rpe: 8, pct: 0.85 }).charge).toBe(122.5);
    expect(chargeLigne(140, barre, { reps: 5, rpe: 8, pct: 0.85 }).charge).not.toBe(120);
  });
  it("RPE implicite < 6 : charge = e1RM × % saisi, HORS_DOMAINE informatif", () => {
    const r = chargeLigne(140, barre, { reps: 5, pct: 0.75 });
    expect(r.brute).toBeCloseTo(105, 9);
    expect(r.charge).toBe(105);
    expect(r.drapeaux).toEqual(["HORS_DOMAINE"]);
  });
});

describe("T3 — discount OHP annoncé −6 %, appliqué partout", () => {
  const seances: [string, number, number, number][] = [
    ["A", 5, 8, 55],
    ["B", 3, 8, 57.5],
    ["C", 8, 7, 47.5],
  ];

  it.each(seances)("séance %s : %d @ %d → %f", (_s, reps, rpe, attendu) => {
    const r = chargeCible(e1rmEffectif(70, 0.94), barre, reps, rpe);
    expect(r.charge).toBe(attendu);
  });

  it("la séance B révèle le bug « −2 % » (60) et « sans discount » (60)", () => {
    expect(chargeCible(e1rmEffectif(70, 0.94), barre, 3, 8).charge).not.toBe(60);
  });

  it("assertions 1 et 2 sur 4 semaines × 3 séances : brute / (70 × pct) = 0,94 ; arrondi borné", () => {
    for (let semaine = 0; semaine < 4; semaine++) {
      for (const [, reps, rpe] of seances) {
        const r = chargeCible(e1rmEffectif(70, 0.94), barre, reps, rpe);
        expect(Math.abs(r.brute! / (70 * pct(reps, rpe)!) - 0.94)).toBeLessThan(1e-9);
        expect(Math.abs(r.charge! - r.brute!)).toBeLessThan(2.5);
        expect(r.charge! - r.brute!).toBeLessThanOrEqual(0.025 * r.brute!);
      }
    }
  });

  it("assertion 3 : remise 0,90 change toutes les séries du slot", () => {
    for (const [, reps, rpe] of seances) {
      const r = chargeCible(e1rmEffectif(70, 0.9), barre, reps, rpe);
      expect(r.brute! / (70 * pct(reps, rpe)!)).toBeCloseTo(0.9, 9);
    }
  });

  it("paliers séance A (travail 55, e1RM effectif 65,8, I = 0,836 → lourd)", () => {
    const p = paliers({
      exercice: "developpe_militaire",
      chargeTravail: 55,
      e1rm: e1rmEffectif(70, 0.94),
      reps: 5,
      rpe: 8,
      typeSeance: "force",
      materiel: barre,
    });
    expect(p.echelle).toBe("lourd");
    expect(p.items.map((i) => [i.charge_kg, i.reps])).toEqual([
      [20, 10],
      [22.5, 5],
      [32.5, 3],
      [40, 2],
      [47.5, 1],
    ]);
  });
});
