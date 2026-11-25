// Table RPE : knowledge/force/table-rpe.md ; cas T14 et T10 bis de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import { normaliserRpe, pct, rpeDepuisPct } from "../../src/force/rpe";

describe("pct(reps, rpe) — table-rpe.md, exemples", () => {
  it.each([
    [1, 10, 0.983607], // n = 1,5 : jamais 100 %
    [1, 9.5, 0.967742],
    [3, 8, 0.869565],
    [5, 8, 0.819444],
    [5, 8.5, 0.833333], // bascule Epley / Brzycki en n = 7
    [8, 7, 0.708333],
    [12, 6, 0.569444],
    [15, 6, 0.486111],
  ])("pct(%d, %d) = %f", (reps, rpe, attendu) => {
    expect(pct(reps, rpe)).toBeCloseTo(attendu, 6);
  });

  it("diagonale constante : 3 @ 8 = 4 @ 9 = 5 @ 10", () => {
    expect(pct(4, 9)).toBeCloseTo(pct(3, 8)!, 12);
    expect(pct(5, 10)).toBeCloseTo(pct(3, 8)!, 12);
  });

  it("strictement décroissante en n sur le domaine", () => {
    let precedent = Infinity;
    for (let reps = 1; reps <= 15; reps++) {
      for (let rpe = 10; rpe >= 6; rpe -= 0.5) {
        // n = reps + 10,5 − rpe ; on parcourt n croissant à reps fixe
        const p = pct(reps, rpe)!;
        if (rpe === 10) precedent = Infinity;
        expect(p).toBeLessThan(precedent);
        precedent = p;
      }
    }
  });
});

describe("T14 — domaine et saisie du RPE", () => {
  it("pct(0, 8), pct(16, 8), pct(5, 5,5) : HORS_DOMAINE (null)", () => {
    expect(pct(0, 8)).toBeNull();
    expect(pct(16, 8)).toBeNull();
    expect(pct(5, 5.5)).toBeNull();
  });
  it.each([
    [8.25, 8.5],
    [8.74, 8.5],
    [8.75, 9],
  ])("RPE saisi %f → %f", (saisi, attendu) => {
    expect(normaliserRpe(saisi)).toBe(attendu);
  });
  it("RPE 11 ou « dur » : RPE_INVALIDE (null)", () => {
    expect(normaliserRpe(11)).toBeNull();
    expect(normaliserRpe("dur")).toBeNull();
  });
});

describe("rpeDepuisPct — table-rpe.md R4", () => {
  it.each([
    [0.85, 5, 9.205882],
    [0.92, 5, 11.891304], // > 10 : PCT_IMPOSSIBLE côté lecture de modèle
    [0.75, 5, 5.5], // < 6 : série légère
    [1.0, 1, 10.5], // T10 bis : « 1 rep à 100 % » → PCT_IMPOSSIBLE
  ])("rpeDepuisPct(%f, %d) = %f", (p, reps, attendu) => {
    expect(rpeDepuisPct(p, reps)).toBeCloseTo(attendu, 6);
  });
});
