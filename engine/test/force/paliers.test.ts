// Paliers de montée en charge : knowledge/force/paliers-montee-en-charge.md,
// knowledge/echauffement/echauffement-force.md (ECH-F4). Cas T13 et T17 de knowledge/force/cas-de-test.md
import { describe, expect, it } from "vitest";
import { arrondirCharge, chargesDisponibles, type Materiel } from "../../src/force/arrondi";
import { echauffementSeance, paliers, type ExerciceSeance } from "../../src/force/paliers";

const barre: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5 };
const haltères2a40: Materiel = { type: "liste", charges_kg: Array.from({ length: 20 }, (_, i) => 2 * (i + 1)) };
const pile5a300: Materiel = { type: "pile", min_kg: 5, max_kg: 300, pas_kg: 5 };

const resume = (items: { charge_kg: number; reps: number }[]) => items.map((i) => [i.charge_kg, i.reps]);
const repos = (items: { repos_s: number }[]) => items.map((i) => i.repos_s);

describe("Exemples A à H (paliers-montee-en-charge.md)", () => {
  it("A — squat 140 kg × 5, e1RM 168 : lourd ; durée 504 s", () => {
    const p = paliers({ exercice: "squat", chargeTravail: 140, e1rm: 168, reps: 5, typeSeance: "force", materiel: barre });
    expect(p.echelle).toBe("lourd");
    expect(resume(p.items)).toEqual([[20, 10], [55, 5], [85, 3], [105, 2], [120, 1]]);
    expect(repos(p.items)).toEqual([30, 60, 60, 90, 180]);
    expect(p.dureeS).toBe(504);
  });

  it("B — couché 1 @ 9,5, e1RM 100 → 97,5 kg : très lourd", () => {
    const p = paliers({ exercice: "couche", chargeTravail: 97.5, e1rm: 100, reps: 1, rpe: 9.5, typeSeance: "force", materiel: barre });
    expect(p.echelle).toBe("tres_lourd");
    expect(resume(p.items)).toEqual([[20, 10], [37.5, 5], [57.5, 3], [72.5, 2], [82.5, 1], [90, 1]]);
    expect(repos(p.items)).toEqual([30, 60, 60, 90, 90, 180]);
    expect(p.items.every((i) => i.exercice === "developpe_couche")).toBe(true); // alias normalisé
  });

  it("C — OHP 8 @ 7, e1RM 60 → 42,5 kg : modéré, palier 45 % supprimé (doublon de la barre)", () => {
    const p = paliers({ exercice: "developpe_militaire", chargeTravail: 42.5, e1rm: 60, reps: 8, rpe: 7, typeSeance: "force", materiel: barre });
    expect(p.echelle).toBe("modere");
    expect(resume(p.items)).toEqual([[20, 10], [27.5, 3], [35, 2]]);
    expect(repos(p.items)).toEqual([30, 60, 120]);
  });

  it("D — 10 @ 6, e1RM 40 → 25 kg : léger, barre seulement", () => {
    const p = paliers({ exercice: "couche", chargeTravail: 25, e1rm: 40, reps: 10, rpe: 6, typeSeance: "force", materiel: barre });
    expect(p.echelle).toBe("leger");
    expect(resume(p.items)).toEqual([[20, 10]]);
  });

  it("E — charge de travail = barre : aucun palier", () => {
    expect(paliers({ exercice: "couche", chargeTravail: 20, e1rm: 40, reps: 10, typeSeance: "force", materiel: barre }).items).toEqual([]);
  });

  it("F — couché haltères 30 kg, e1RM 36 : lourd, pas de barre", () => {
    const p = paliers({ exercice: "couche_halteres", chargeTravail: 30, e1rm: 36, reps: 5, typeSeance: "force", materiel: haltères2a40 });
    expect(resume(p.items)).toEqual([[12, 5], [18, 3], [22, 2], [26, 1]]);
  });

  it("G — pause squat après squat, 110 kg, e1RM 132,583 : départ à 60 %, pas de barre vide", () => {
    const p = paliers({
      exercice: "squat_pause_2s", chargeTravail: 110, e1rm: 132.583, reps: 4, typeSeance: "force", materiel: barre, premierDuSchema: false,
    });
    expect(p.echelle).toBe("lourd");
    expect(resume(p.items)).toEqual([[65, 3], [82.5, 2], [92.5, 1]]);
  });

  it("H — e1RM inconnu, 5 @ 8 → lourd ; ni e1RM ni RPE en force → lourd", () => {
    expect(paliers({ exercice: "squat", chargeTravail: 100, e1rm: null, reps: 5, rpe: 8, typeSeance: "force", materiel: barre }).echelle).toBe("lourd");
    expect(paliers({ exercice: "squat", chargeTravail: 100, e1rm: null, reps: 5, typeSeance: "force", materiel: barre }).echelle).toBe("lourd");
  });

  it("soulevé de terre : le palier barre vide se fait en roumain", () => {
    const p = paliers({ exercice: "souleve_de_terre", chargeTravail: 180, e1rm: 210, reps: 3, typeSeance: "force", materiel: barre, depuisSol: true });
    expect(p.items[0]).toMatchObject({ exercice: "sdt_roumain", charge_kg: 20, reps: 10 });
    expect(p.items[1].exercice).toBe("souleve_de_terre");
  });
});

describe("T13 — propriétés des paliers", () => {
  const m: Materiel = { type: "barre", barre_kg: 20, increment_kg: 2.5, max_kg: 300 };
  const dispo = new Set(chargesDisponibles(m));
  it("pour toute charge de 20 à 300 kg et toute valeur de I", () => {
    for (let travail = 20; travail <= 300; travail += 2.5) {
      for (const I of [0.5, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.97]) {
        for (const premierDuSchema of [true, false]) {
          const { items } = paliers({
            exercice: "squat", chargeTravail: travail, e1rm: travail / I, reps: 5, typeSeance: "force", materiel: m, premierDuSchema,
          });
          if (travail > 20 && premierDuSchema) expect(items[0]).toMatchObject({ charge_kg: 20, reps: 10 });
          if (!premierDuSchema) expect(items.some((i) => i.pct_travail === null)).toBe(false);
          for (let k = 0; k < items.length; k++) {
            expect(items[k].charge_kg).toBeLessThan(travail);
            expect(dispo.has(items[k].charge_kg)).toBe(true);
            if (k > 0) {
              expect(items[k].charge_kg).toBeGreaterThan(items[k - 1].charge_kg);
              expect(items[k].reps).toBeLessThanOrEqual(items[k - 1].reps);
            }
          }
        }
      }
    }
  });
  it("chaque palier passe par arrondirCharge (même fonction que les séries)", () => {
    const p = paliers({ exercice: "squat", chargeTravail: 140, e1rm: 168, reps: 5, typeSeance: "force", materiel: barre });
    for (const i of p.items.slice(1)) expect(i.charge_kg).toBe(arrondirCharge(i.pct_travail! * 140, barre).charge);
  });
});

describe("T17 — séries d'approche en musculation", () => {
  // Groupes = principaux[0] de knowledge/hypertrophie/mapping-muscles.json ; schémas lus dans data/exercises/schemas.json
  const presse: ExerciceSeance = { exercice: "0739", groupe: "quadriceps", chargeTravail: 140, e1rm: null, reps: 10, materiel: pile5a300 };
  const fentes: ExerciceSeance = { exercice: "0336", groupe: "quadriceps", chargeTravail: 16, e1rm: null, reps: 10, materiel: haltères2a40 };
  const curl: ExerciceSeance = { exercice: "curl_halteres", groupe: "biceps", chargeTravail: 12, e1rm: null, reps: 12, materiel: haltères2a40 };
  const legCurl: ExerciceSeance = { exercice: "leg_curl", groupe: "ischio_jambiers", chargeTravail: 40, e1rm: null, reps: 15, materiel: pile5a300 };
  const rowing: ExerciceSeance = { exercice: "0027", groupe: "haut_du_dos", chargeTravail: 80, e1rm: 100, reps: 6, materiel: barre };

  it("séance complète, dans l'ordre", () => {
    const [p, f, c, lc, r] = echauffementSeance("musculation", [presse, fentes, curl, legCurl, rowing]);
    expect(p.regle).toBe("M2");
    expect(resume(p.items)).toEqual([[70, 8], [105, 4]]);
    expect(repos(p.items)).toEqual([60, 90]);
    expect(f.items).toEqual([]);
    expect(resume(c.items)).toEqual([[6, 8], [8, 4]]);
    expect(repos(c.items)).toEqual([60, 90]);
    expect(resume(lc.items)).toEqual([[20, 8]]);
    expect(repos(lc.items)).toEqual([90]);
    expect(r.echelle).toBe("lourd");
    expect(resume(r.items)).toEqual([[20, 10], [32.5, 5], [47.5, 3], [60, 2], [67.5, 1]]);
  });

  it("fentes avant la presse : les séries d'approche passent sur les fentes", () => {
    const [f, p] = echauffementSeance("musculation", [fentes, presse]);
    expect(f.items.length).toBeGreaterThan(0);
    expect(p.items).toEqual([]);
  });

  it.each<[string, Partial<ExerciceSeance>, string]>([
    ["rowing 4 × 10 à 80, e1RM 100 (I = 0,80) → lourd, comme 4 × 6", { reps: 10 }, "lourd"],
    ["rowing 4 × 5 à 70, e1RM 100 (I = 0,70) → M2", { reps: 5, chargeTravail: 70 }, "M2"],
    ["rowing 4 × 5 @ 7,5, e1RM inconnu (0,8056) → lourd", { reps: 5, rpe: 7.5, e1rm: null }, "lourd"],
    ["rowing 4 × 5 @ 7, e1RM inconnu (0,7917) → M2", { reps: 5, rpe: 7, e1rm: null }, "M2"],
  ])("%s", (_nom, modif, attendu) => {
    const [r] = echauffementSeance("musculation", [{ ...rowing, ...modif }]);
    expect(r.echelle ?? r.regle).toBe(attendu);
  });

  it("rowing 4 × 10 à I = 0,80 : mêmes paliers que 4 × 6 (le nombre de reps ne change pas l'échelle)", () => {
    const [r10] = echauffementSeance("musculation", [{ ...rowing, reps: 10 }]);
    expect(resume(r10.items)).toEqual([[20, 10], [32.5, 5], [47.5, 3], [60, 2], [67.5, 1]]);
  });

  it("rowing 4 × 5 à 70, e1RM 100 : 35 × 5 (60 s) · 52,5 × 3 (90 s)", () => {
    const [r] = echauffementSeance("musculation", [{ ...rowing, reps: 5, chargeTravail: 70 }]);
    expect(resume(r.items)).toEqual([[35, 5], [52.5, 3]]);
    expect(repos(r.items)).toEqual([60, 90]);
  });

  describe("mouvement déjà chauffé (R5)", () => {
    const squat: ExerciceSeance = { exercice: "0043", groupe: "quadriceps", chargeTravail: 100, e1rm: 120, reps: 6, materiel: barre };
    const presseLourde: ExerciceSeance = { ...presse, chargeTravail: 200, e1rm: 240, reps: 8 };
    const couche: ExerciceSeance = { exercice: "0025", groupe: "pectoraux", chargeTravail: 85, e1rm: 100, reps: 5, materiel: barre };

    it("séance 1 : squat lourd complet puis presse (schéma squat déjà chauffé) départ à 60 %", () => {
      const [s, p] = echauffementSeance("musculation", [squat, presseLourde]);
      expect(resume(s.items)).toEqual([[20, 10], [40, 5], [60, 3], [75, 2], [85, 1]]);
      expect(repos(s.items)).toEqual([30, 60, 60, 90, 180]);
      expect(resume(p.items)).toEqual([[120, 3], [150, 2], [170, 1]]);
      expect(repos(p.items)).toEqual([60, 90, 180]);
    });

    it("séance 2 : couché lourd complet puis rowing (autre schéma) complet", () => {
      const [c, r] = echauffementSeance("musculation", [couche, rowing]);
      expect(resume(c.items)).toEqual([[20, 10], [32.5, 5], [50, 3], [62.5, 2], [72.5, 1]]);
      expect(repos(c.items)).toEqual([30, 60, 60, 90, 180]);
      expect(resume(r.items)).toEqual([[20, 10], [32.5, 5], [47.5, 3], [60, 2], [67.5, 1]]);
      expect(repos(r.items)).toEqual([30, 60, 60, 90, 180]);
    });

    it("un exercice qui n'a eu que M2 ne compte pas comme chauffé", () => {
      const [p, s] = echauffementSeance("musculation", [presse, squat]);
      expect(p.regle).toBe("M2");
      expect(s.items[0]).toMatchObject({ charge_kg: 20, reps: 10 });
    });

    it("exercice lourd sans schéma : le mouvement est l'exercice lui-même", () => {
      const curlLourd: ExerciceSeance = { ...curl, chargeTravail: 20, e1rm: 24, reps: 6 };
      const [a, b] = echauffementSeance("musculation", [curlLourd, curlLourd]);
      expect(a.items[0].pct_travail).toBe(0.4);
      expect(b.items.every((i) => i.pct_travail! >= 0.6)).toBe(true);
      expect(b.items.length).toBeGreaterThan(0);
    });
  });
});

describe("schéma lu dans le catalogue (R5)", () => {
  const lourd = { chargeTravail: 85, e1rm: 100, reps: 5, materiel: barre };
  it("developpe_couche puis 0025 (couché barre du catalogue) : même schéma, départ à 60 %", () => {
    const [, b] = echauffementSeance("force", [{ exercice: "developpe_couche", ...lourd }, { exercice: "0025", ...lourd }]);
    expect(b.items.every((i) => i.pct_travail! >= 0.6)).toBe(true);
  });
  it("alias couche puis couche_pause_1s : même schéma", () => {
    const [, b] = echauffementSeance("force", [{ exercice: "couche", ...lourd }, { exercice: "couche_pause_1s", ...lourd }]);
    expect(b.items[0].pct_travail).toBe(0.6);
  });
  it("developpe_couche puis developpe_militaire : schémas différents, paliers complets", () => {
    const [, b] = echauffementSeance("force", [{ exercice: "developpe_couche", ...lourd }, { exercice: "developpe_militaire", ...lourd }]);
    expect(b.items[0]).toMatchObject({ charge_kg: 20, reps: 10 });
  });
  it("exercice absent de schemas.json : pas de schéma, il ne profite pas du squat déjà chauffé", () => {
    const [, b] = echauffementSeance("force", [{ exercice: "0043", ...lourd }, { exercice: "inconnu", ...lourd }]);
    expect(b.items[0]).toMatchObject({ charge_kg: 20, reps: 10 });
  });
});

describe("T17 bis — mouvement déjà chauffé en Hyrox/CrossFit", () => {
  const front = { exercice: "0042", chargeTravail: 85, e1rm: 100, reps: 3, materiel: barre };
  const back = { exercice: "0043", chargeTravail: 110, e1rm: 130, reps: 5, materiel: barre };
  it("front squat 0042 complet puis back squat 0043 départ à 60 % ; durées 504 s et 354 s", () => {
    const [f, b] = echauffementSeance("hyrox_crossfit", [front, back]);
    expect(resume(f.items)).toEqual([[20, 10], [32.5, 5], [50, 3], [62.5, 2], [72.5, 1]]);
    expect(repos(f.items)).toEqual([30, 60, 60, 90, 180]);
    expect(resume(b.items)).toEqual([[65, 3], [82.5, 2], [92.5, 1]]);
    expect(repos(b.items)).toEqual([60, 90, 180]);
    expect([f.dureeS, b.dureeS]).toEqual([504, 354]);
  });
  it("variante : front squat à 60 kg (ECH-H4) → back squat paliers complets", () => {
    const [f, b] = echauffementSeance("hyrox_crossfit", [{ ...front, chargeTravail: 60 }, back]);
    expect(f.regle).toBe("ECH-H4");
    expect(resume(b.items)).toEqual([[20, 10], [45, 5], [65, 3], [82.5, 2], [92.5, 1]]);
  });
});

describe("Hyrox / CrossFit", () => {
  it("I < 0,80 ou indéterminable → ECH-H4 (répétition des mouvements, hors moteur force)", () => {
    const [x] = echauffementSeance("hyrox_crossfit", [{ exercice: "thruster", chargeTravail: 40, e1rm: null, reps: 10, materiel: barre }]);
    expect(x.regle).toBe("ECH-H4");
    expect(x.items).toEqual([]);
  });
  it("I ≥ 0,80 → paliers de la fiche", () => {
    const [x] = echauffementSeance("hyrox_crossfit", [{ exercice: "squat", chargeTravail: 100, e1rm: 120, reps: 3, materiel: barre }]);
    expect(x.echelle).toBe("lourd");
  });
});
