// Arrondi : knowledge/force/arrondi-charges.md ; cas T6 et T16 de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import { arrondirCharge, chargesDisponibles, type Materiel } from "../../src/force/arrondi";
import { chargeCible } from "../../src/force/charge";

const barre: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5 };
const haltères10a30: Materiel = { type: "liste", charges_kg: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30] };
const kettlebells: Materiel = { type: "liste", charges_kg: [8, 12, 16, 20, 24, 28, 32] };

describe("T6 — arrondi", () => {
  it.each<[string, Materiel, number, number, string[]]>([
    ["barre 2,5", barre, 101.2, 100, []],
    ["barre 2,5", barre, 101.3, 102.5, []],
    ["barre 2,5 (égalité → bas)", barre, 101.25, 100, []],
    ["barre 2,5 (+3,17 % refusé)", barre, 31.5, 30, []],
    ["barre 2,5 (+2,41 % accepté)", barre, 41.5, 42.5, []],
    ["barre 2,5", barre, 15, 20, ["CIBLE_SOUS_MINIMUM"]],
    ["barre 1", { type: "barre", barre_kg: 20, increment_kg: 1 }, 101.5, 101, []],
    ["barre 1", { type: "barre", barre_kg: 20, increment_kg: 1 }, 101.3, 101, []],
    ["barre 1", { type: "barre", barre_kg: 20, increment_kg: 1 }, 101.6, 102, []],
    ["barre 0,5", { type: "barre", barre_kg: 20, increment_kg: 0.5 }, 101.3, 101.5, []],
    ["haltères", haltères10a30, 23.6, 24, []],
    ["kettlebells", kettlebells, 19, 16, ["ECART_ARRONDI_IMPORTANT"]],
    ["barre max 100", { type: "barre", barre_kg: 20, increment_kg: 2.5, max_kg: 100 }, 110, 100, ["CIBLE_AU_DESSUS_MAX"]],
    ["pile 5 à 100 (−4,3 %, pas de drapeau)", { type: "pile", min_kg: 5, max_kg: 100, pas_kg: 5 }, 47, 45, []],
  ])("%s, %o : %f → %f", (_nom, m, cible, attendu, drapeaux) => {
    const r = arrondirCharge(cible, m);
    expect(r.charge).toBe(attendu);
    expect(r.drapeaux).toEqual(drapeaux);
  });

  it("haltères 10 à 30 pas 2 : 23,2 → 22, ECART_ARRONDI_IMPORTANT (R3 : −5,17 % > 5 %)", () => {
    expect(arrondirCharge(23.2, haltères10a30)).toEqual({ charge: 22, drapeaux: ["ECART_ARRONDI_IMPORTANT"] });
  });
  // ÉCART: T6 (cas-de-test.md) et l'exemple d'arrondi-charges.md donnent « 23,2 → 22 » sans drapeau,
  // alors que R3 impose ECART_ARRONDI_IMPORTANT (|22 − 23,2| / 23,2 = 5,17 % > 5 %).
  it.fails("T6 tel qu'écrit : haltères 23,2 → 22 sans drapeau", () => {
    expect(arrondirCharge(23.2, haltères10a30).drapeaux).toEqual([]);
  });

  it("propriété (barre) : résultat disponible, ≤ +2,5 %, à moins d'un incrément", () => {
    const m: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5, max_kg: 300 };
    const dispo = new Set(chargesDisponibles(m));
    for (let cible = 20; cible <= 300; cible += 0.137) {
      const { charge } = arrondirCharge(cible, m);
      expect(dispo.has(charge)).toBe(true);
      expect(charge - cible).toBeLessThanOrEqual(0.025 * cible + 1e-9);
      expect(Math.abs(charge - cible)).toBeLessThan(2.5);
    }
  });
});

describe("T16 — exercice lesté", () => {
  const lest: Materiel = { type: "lest", poids_corps_kg: 80, increment_kg: 1.25 };
  it("e1RM système 120, 5 @ 8 → lest 18,75", () => {
    const r = chargeCible(120, lest, 5, 8);
    expect(r.brute).toBeCloseTo(98.333333, 5); // charge système
    expect(r.charge).toBe(18.75);
  });
  it("e1RM système 90, 5 @ 8 → LEST_NEGATIF, pas de charge", () => {
    const r = chargeCible(90, lest, 5, 8);
    expect(r.charge).toBeNull();
    expect(r.drapeaux).toContain("LEST_NEGATIF");
  });
});
