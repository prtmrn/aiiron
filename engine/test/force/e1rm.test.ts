// e1RM et variantes : knowledge/force/e1rm.md, knowledge/force/variantes-discounts.md
// Cas T7, T8, T10, T10 bis, T11, T15 de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import { e1rmSerie, mettreAJourReference, referenceInitiale } from "../../src/force/e1rm";
import { pct } from "../../src/force/rpe";
import { COEFS_VARIANTES, e1rmEffectif, e1rmExercice } from "../../src/force/variantes";

describe("e1rmSerie — e1rm.md, exemples", () => {
  it.each([
    [100, 5, 8, 122.033898],
    [100, 3, 9, 111.666667],
    [140, 8, 7.5, 193.846154],
  ])("%f × %d @ %f → %f", (charge, reps, rpe, attendu) => {
    expect(e1rmSerie(charge, reps, rpe)).toBeCloseTo(attendu, 5);
  });
  it("80 × 12 @ 8 → null (SERIE_TROP_LONGUE)", () => {
    expect(e1rmSerie(80, 12, 8)).toBeNull();
  });
  it("100 × 5 @ 6 → null (RPE_TROP_BAS_POUR_E1RM)", () => {
    expect(e1rmSerie(100, 5, 6)).toBeNull();
  });
});

describe("T10 bis — single @ 10 (e1rm.md R1 bis)", () => {
  it("e1rmSerie(100, 1, 10) = 100", () => expect(e1rmSerie(100, 1, 10)).toBe(100));
  it("e1rmSerie(100, 1, 9,5) = 103,333", () => expect(e1rmSerie(100, 1, 9.5)).toBeCloseTo(103.333333, 5));
});

describe("mettreAJourReference — e1rm.md R2 à R7", () => {
  it("exemple : ref 150, 122,5 × 5 @ 9 → 147,479", () => {
    const r = mettreAJourReference(150, [{ charge: 122.5, reps: 5, rpe: 9 }]);
    expect(r.e1rmJour).toBeCloseTo(144.958333, 5);
    expect(r.ref).toBeCloseTo(147.479167, 5);
  });

  it("RPE absent et reps manquées : RPE := 10 (125 × 3 sur 5 → 135,42)", () => {
    const r = mettreAJourReference(140, [{ charge: 125, reps: 3, repsPrescrites: 5 }]);
    expect(r.e1rmJour).toBeCloseTo(135.416667, 5);
  });

  it("T7 — RPE absent sur toute la séance : ref inchangée", () => {
    const s = { charge: 122.5, reps: 5, repsPrescrites: 5 };
    const r = mettreAJourReference(150, [s, s, s]);
    expect(r.ref).toBe(150);
    expect(r.drapeaux).toContain("RPE_MANQUANT");
    expect(r.drapeaux).toContain("PAS_DE_DONNEE_FIABLE");
  });

  it("T8 — e1RM aberrant : A_CONFIRMER, ref 150 ; corrigé → 148,125", () => {
    const faute = mettreAJourReference(150, [{ charge: 185, reps: 1, rpe: 8 }]);
    expect(faute.e1rmJour).toBeCloseTo(200.416667, 5);
    expect(faute.drapeaux).toContain("A_CONFIRMER");
    expect(faute.ref).toBe(150);
    const corrige = mettreAJourReference(150, [{ charge: 135, reps: 1, rpe: 8 }]);
    expect(corrige.ref).toBeCloseTo(148.125, 9);
  });

  it("A_CONFIRMER puis confirmé : intégré sans garde-fou", () => {
    const r = mettreAJourReference(150, [{ charge: 185, reps: 1, rpe: 8 }], { confirme: true });
    expect(r.ref).toBeCloseTo(150 + 0.5 * (200.416667 - 150), 5);
  });

  it("T9 (après séance) — 122,5 × 3 sans RPE sur 5 prescrites : ratio 0,885 → A_CONFIRMER", () => {
    const r = mettreAJourReference(150, [{ charge: 122.5, reps: 3, repsPrescrites: 5 }]);
    expect(r.e1rmJour).toBeCloseTo(132.708333, 5);
    expect(r.drapeaux).toContain("A_CONFIRMER");
    expect(r.ref).toBe(150);
  });

  it("T15 — douleur : série exclue, série de référence = série 1, ref 96,814", () => {
    const r = mettreAJourReference(96, [
      { charge: 80, reps: 5, rpe: 8 },
      { charge: 80, reps: 5, rpe: 9, douleur: true },
    ]);
    expect(r.drapeaux).toContain("DOULEUR");
    expect(r.e1rmJour).toBeCloseTo(97.627119, 5);
    expect(r.ref).toBeCloseTo(96.813559, 5);
  });

  it("série de référence : RPE le plus haut, puis charge la plus lourde", () => {
    const r = mettreAJourReference(150, [
      { charge: 120, reps: 5, rpe: 8.5 },
      { charge: 122.5, reps: 5, rpe: 8.5 },
      { charge: 125, reps: 3, rpe: 8 },
    ]);
    expect(r.e1rmJour).toBeCloseTo(122.5 / pct(5, 8.5)!, 9);
  });

  it("paliers d'échauffement jamais utilisés", () => {
    const r = mettreAJourReference(150, [{ type: "palier", charge: 120, reps: 1, rpe: 7 }]);
    expect(r.ref).toBe(150);
    expect(r.drapeaux).toContain("PAS_DE_DONNEE_FIABLE");
  });

  it("slot remisé : e1rmJour = e1rmSerie / remise (T3 assertion 4 : ref 70 → 70,701)", () => {
    const r = mettreAJourReference(70, [{ charge: 55, reps: 5, rpe: 8 }], { remise: 0.94 });
    expect(r.e1rmJour).toBeCloseTo(71.403, 3);
    expect(r.ref).toBeCloseTo(70.701, 3);
  });

  it("test de 1RM : ref = meilleur single, sans lissage ; > +20 % → A_CONFIRMER", () => {
    expect(mettreAJourReference(150, [{ charge: 160, reps: 1, rpe: 10 }], { test1rm: true }).ref).toBe(160);
    const r = mettreAJourReference(150, [{ charge: 185, reps: 1, rpe: 10 }], { test1rm: true });
    expect(r.ref).toBe(150);
    expect(r.drapeaux).toContain("A_CONFIRMER");
  });
});

describe("T10 — aller-retour (propriété)", () => {
  it("loguer la brute prescrite au RPE prescrit laisse la ref inchangée (sauf 1 @ 10, R1 bis)", () => {
    for (let ref = 20; ref <= 400; ref += 7.3) {
      for (let reps = 1; reps <= 10; reps++) {
        for (let rpe = 7; rpe <= 10; rpe += 0.5) {
          const brute = ref * pct(reps, rpe)!;
          const r = mettreAJourReference(ref, [{ charge: brute, reps, rpe }]);
          if (reps === 1 && rpe === 10) expect(r.e1rmJour! / ref).toBeCloseTo(0.983607, 6);
          else expect(Math.abs(r.ref! - ref)).toBeLessThan(1e-9);
        }
      }
    }
  });
});

describe("referenceInitiale — e1rm.md R8", () => {
  it("1RM testé il y a ≤ 8 semaines : valeur ; plus ancien : × 0,95", () => {
    expect(referenceInitiale({ type: "1rm", valeur: 100, semaines: 8 })).toBe(100);
    expect(referenceInitiale({ type: "1rm", valeur: 100, semaines: 9 })).toBeCloseTo(95, 9);
    expect(referenceInitiale({ type: "1rm", valeur: 100 })).toBeCloseTo(95, 9); // « estimé »
  });
  it("x kg pour r reps à fond : e1rmSerie(x, r, 10)", () => {
    expect(referenceInitiale({ type: "reps_a_fond", charge: 100, reps: 5 })).toBeCloseTo(100 / pct(5, 10)!, 9);
    expect(referenceInitiale({ type: "reps_a_fond", charge: 100, reps: 1 })).toBe(100);
  });
});

describe("variantes — variantes-discounts.md", () => {
  it("T11 — pause squat jamais loguée : e1RM initial 135, stocké comme référence", () => {
    const { e1rm, refs } = e1rmExercice("squat_pause_2s", { squat: 150 });
    expect(e1rm).toBeCloseTo(135, 9);
    expect(refs).toEqual({ squat: 150, squat_pause_2s: 135 });
  });

  it("T11 — séance faite 110 × 4 @ 8 : ref pause squat 132,583, ref squat 150 (R9)", () => {
    const r = mettreAJourReference(135, [{ charge: 110, reps: 4, rpe: 8 }]);
    expect(r.e1rmJour).toBeCloseTo(130.166667, 5);
    expect(r.ref).toBeCloseTo(132.583333, 5);
  });

  it("chaîne de bases : squat_avant_pause_2s = 150 × 0,80 × 0,90 = 108, squat_avant reçoit 120", () => {
    const { e1rm, refs } = e1rmExercice("squat_avant_pause_2s", { squat: 150 });
    expect(e1rm).toBeCloseTo(108, 9);
    expect(refs.squat_avant).toBeCloseTo(120, 9);
  });

  it("exercice sans référence ni base : null (séance d'étalonnage)", () => {
    expect(e1rmExercice("power_clean", {}).e1rm).toBeNull();
  });

  it("table : coefficients ≤ 1, pas de cycle, profondeur ≤ 3", () => {
    for (const [id, { coef }] of Object.entries(COEFS_VARIANTES)) {
      expect(coef).toBeLessThanOrEqual(1);
      let profondeur = 0;
      let courant: string | undefined = id;
      while (courant && COEFS_VARIANTES[courant]) {
        courant = COEFS_VARIANTES[courant].base;
        profondeur++;
        expect(profondeur).toBeLessThanOrEqual(3);
      }
    }
  });

  it("remise de contexte hors [0,80 ; 1,00] : erreur de modèle", () => {
    expect(e1rmEffectif(70, 0.94)).toBeCloseTo(65.8, 9);
    expect(() => e1rmEffectif(70, 0.75)).toThrow();
    expect(() => e1rmEffectif(70, 1.05)).toThrow();
  });
});
