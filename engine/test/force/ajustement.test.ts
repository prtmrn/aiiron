// Ajustement en séance : knowledge/force/ajustement-rpe.md ; cas T8 et T9 de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import type { Materiel } from "../../src/force/arrondi";
import { ajusterSeance, type SerieFaite } from "../../src/force/ajustement";

const barre: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5 };
// Squat, ref 150, 3 séries prévues 5 @ 8 = 122,5 kg
const prevues = () => [1, 2, 3].map(() => ({ reps: 5, rpe: 8, charge: 122.5 }));
const ctx = { ref: 150, materiel: barre };

describe("ajustement-rpe.md — exemple (série 1 loguée → séries 2-3)", () => {
  it.each<[string, SerieFaite, number | null, number, string[]]>([
    ["@ 8,5 zone morte (R3)", { charge: 122.5, reps: 5, rpe: 8.5 }, 122.5, 8, []],
    ["@ 9 trop dur (R4)", { charge: 122.5, reps: 5, rpe: 9 }, 120, 8, []],
    ["@ 7 trop facile (R4 + R7)", { charge: 122.5, reps: 5, rpe: 7 }, 127.5, 8, []],
    ["@ 10 série dure (R5)", { charge: 122.5, reps: 5, rpe: 10 }, 112.5, 7, ["SERIE_DURE"]],
    ["3 reps sans RPE (R1 + R5, T9)", { charge: 122.5, reps: 3 }, 105, 7, ["SERIE_DURE"]],
    ["0 rep (R6)", { charge: 122.5, reps: 0 }, 110, 7, ["ECHEC_TOTAL", "SERIE_DURE"]],
  ])("%s", (_nom, faite, charge, rpe, drapeaux) => {
    const r = ajusterSeance(prevues(), [faite], ctx);
    for (const s of r.series.slice(1)) {
      expect(s.charge).toBe(charge);
      expect(s.rpe).toBe(rpe);
    }
    expect(r.drapeaux).toEqual(drapeaux);
  });

  it("@ 7, débutant : hausse interdite en séance → 122,5", () => {
    const r = ajusterSeance(prevues(), [{ charge: 122.5, reps: 5, rpe: 7 }], { ...ctx, debutant: true });
    expect(r.series[1].charge).toBe(122.5);
  });

  it("@ 7, deload : hausse interdite", () => {
    const r = ajusterSeance(prevues(), [{ charge: 122.5, reps: 5, rpe: 7 }], { ...ctx, deload: true });
    expect(r.series[1].charge).toBe(122.5);
  });

  it("hausse plafonnée à +5 % de la charge prévue", () => {
    // prévu 5 @ 9 à 127,5 ; fait 127,5 × 5 @ 7 : e1rmSerie = 127,5 / 0,791667 = 161,05 (< 165)
    // 5 @ 9 : 161,05 × 0,845070 = 136,1 > 1,05 × 127,5 = 133,875 → 135 dépasserait le plafond → 132,5
    const p = [1, 2].map(() => ({ reps: 5, rpe: 9, charge: 127.5 }));
    const r = ajusterSeance(p, [{ charge: 127.5, reps: 5, rpe: 7 }], ctx);
    expect(r.series[1].charge).toBe(132.5);
  });

  it("RPE < 7 loguée : série non valide pour l'e1RM, pas d'ajustement (R1)", () => {
    const r = ajusterSeance(prevues(), [{ charge: 122.5, reps: 5, rpe: 6 }], ctx);
    expect(r.series[1].charge).toBe(122.5);
  });

  it("RPE absent, reps faites = prescrites : pas d'ajustement, RPE_MANQUANT", () => {
    const r = ajusterSeance(prevues(), [{ charge: 122.5, reps: 5 }], ctx);
    expect(r.series[1].charge).toBe(122.5);
    expect(r.drapeaux).toEqual(["RPE_MANQUANT"]);
  });

  it("suite du cas @ 10 : série 2 à 112,5 × 5 @ 9 (prescrit 7) → ARRET_EXERCICE, série 3 annulée", () => {
    const r = ajusterSeance(
      prevues(),
      [
        { charge: 122.5, reps: 5, rpe: 10 },
        { charge: 112.5, reps: 5, rpe: 9 },
      ],
      ctx,
    );
    expect(r.drapeaux).toEqual(["SERIE_DURE", "SERIE_DURE", "ARRET_EXERCICE"]);
    expect(r.series[2].annulee).toBe(true);
    expect(r.series[2].charge).toBeNull();
  });

  it("douleur : plus aucune charge sur l'exercice", () => {
    const r = ajusterSeance(prevues(), [{ charge: 122.5, reps: 5, rpe: 8, douleur: true }], ctx);
    expect(r.drapeaux).toEqual(["DOULEUR"]);
    expect(r.series.slice(1).every((s) => s.charge === null && s.annulee)).toBe(true);
  });
});

describe("T8 — e1RM aberrant en séance : aucune hausse", () => {
  it("185 × 1 @ 8 (prévu 1 @ 8 à 137,5) : séries suivantes inchangées", () => {
    const p = [1, 2].map(() => ({ reps: 1, rpe: 8, charge: 137.5 }));
    const r = ajusterSeance(p, [{ charge: 185, reps: 1, rpe: 8 }], ctx);
    expect(r.series[1].charge).toBe(137.5);
  });
  it("hausse refusée si e1rmSerie > 1,10 × ref, même avec un écart ≤ −1", () => {
    // 185 × 5 @ 7 : e1rmSerie 233,7 > 165 → pas de hausse
    const r = ajusterSeance(prevues(), [{ charge: 185, reps: 5, rpe: 7 }], ctx);
    expect(r.series[1].charge).toBe(122.5);
  });
});
