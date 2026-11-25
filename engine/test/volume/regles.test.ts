// Moteur volume : une règle de knowledge/hypertrophie/mapping-muscles.md par test, sur des identifiants réels du JSON v3
import { describe, expect, it } from "vitest";
import { compterVolume, resoudreExercice, type DonneesVolume, type Exercice } from "../../src/volume";
import { donneesVolume as d } from "../../src/volume/donnees";

const rien = { volume: {}, agregats: {}, compteurs_separes: {}, drapeaux: [] };
const avec = (ex: Exercice): DonneesVolume => ({ ...d, exercices: new Map([...d.exercices, [ex.id, ex]]) });

describe("MAP-1, MAP-4 : muscles et poids", () => {
  it("21 muscles comptés en volume, hors agrégat deltoides", () => {
    expect(d.mapping.muscles.filter((m) => m.compte_volume && !m.agregat_de)).toHaveLength(21);
  });

  it("poids : principal 1, secondaire 0,5", () => {
    expect(d.mapping.regle_comptage).toMatchObject({ poids_principal: 1, poids_secondaire: 0.5 });
  });
});

describe("MAP-3 : ordre de résolution", () => {
  it("hors volume avant surcharge : saut 0053 (surchargé) → muscles résolus, rien compté, aucun groupe", () => {
    expect(d.mapping.surcharges).toHaveProperty("0053");
    expect(resoudreExercice("0053", d)).toEqual({ principaux: ["quadriceps", "fessiers"], secondaires: ["adducteurs", "mollets"], groupe: null, hors_volume: "saut", drapeaux: [] });
    expect(compterVolume([{ exercice: "0053", series: 4 }], d)).toEqual(rien);
  });

  it("surcharge avant libellés : 0043 (dataset : cible glutes) → quadriceps puis fessiers", () => {
    expect(resoudreExercice("0043", d)).toEqual({ principaux: ["quadriceps", "fessiers"], secondaires: ["adducteurs", "core"], groupe: "quadriceps", hors_volume: null, drapeaux: [] });
  });

  it("identifiants mq-… résolus de la même façon (mq-respiration : mobilité)", () => {
    expect(resoudreExercice("mq-respiration", d)).toMatchObject({ principaux: ["abdominaux"], secondaires: [], hors_volume: "mobilite", groupe: null });
  });

  it("libellé hors table : LIBELLE_INCONNU, rien compté, jamais de rapprochement", () => {
    const ex: Exercice = { id: "test-inconnu", nom_en: "test", muscle_cible: "biceps brachii", groupe_musculaire: "forearms", muscles_secondaires: ["forearms"] };
    expect(compterVolume([{ exercice: ex.id, series: 3 }], avec(ex))).toEqual({ ...rien, drapeaux: [{ code: "LIBELLE_INCONNU", exercice: ex.id }] });
  });

  it("libellé à null (« back ») : ignoré, le reste compte (2355 : abs ; shoulders, back)", () => {
    expect(compterVolume([{ exercice: "2355", series: 2 }], d)).toEqual({
      volume: { abdominaux: 2 },
      agregats: { deltoides: 1 },
      compteurs_separes: {},
      drapeaux: [{ code: "TETE_DELTOIDE_NON_PRECISEE", exercice: "2355" }],
    });
  });

  it("libellés comparés en entier, sans casse ni espaces corrigés : « Biceps » n'est pas « biceps »", () => {
    const ex: Exercice = { id: "test-casse", nom_en: "test", muscle_cible: "Biceps", groupe_musculaire: "forearms", muscles_secondaires: [] };
    expect(resoudreExercice(ex.id, avec(ex)).drapeaux).toEqual(["LIBELLE_INCONNU"]);
  });
});

describe("MAP-5 : dédoublonnage", () => {
  it("un muscle principal et secondaire à la fois garde le poids principal, une seule fois (biceps + brachialis → biceps)", () => {
    const ex: Exercice = { id: "test-doublon", nom_en: "test", muscle_cible: "biceps", groupe_musculaire: "biceps", muscles_secondaires: ["biceps", "brachialis"] };
    expect(compterVolume([{ exercice: ex.id, series: 3 }], avec(ex)).volume).toEqual({ biceps: 3 });
  });

  it("deux lignes du même exercice s'additionnent (c'est le dédoublonnage par exercice, pas par séance)", () => {
    expect(compterVolume([{ exercice: "0027", series: 2 }, { exercice: "0027", series: 1 }], d).volume).toEqual({ haut_du_dos: 3, biceps: 1.5, avant_bras: 1.5 });
  });
});

describe("MAP-6 : groupe = premier principal compté en volume", () => {
  it("T17 : 0739, 0336, 0294, 0586, 0027 → quadriceps, quadriceps, biceps, ischio_jambiers, haut_du_dos", () => {
    expect(["0739", "0336", "0294", "0586", "0027"].map((id) => resoudreExercice(id, d).groupe)).toEqual(["quadriceps", "quadriceps", "biceps", "ischio_jambiers", "haut_du_dos"]);
  });

  it("T17, une série de chaque : poids réels et poids 1 (exemple de la fiche)", () => {
    const lignes = ["0739", "0336", "0294", "0586", "0027"].map((exercice) => ({ exercice, series: 1 }));
    const c = compterVolume(lignes, d);
    expect(c.volume).toEqual({ quadriceps: 2, fessiers: 1.5, adducteurs: 1, biceps: 1.5, avant_bras: 1, ischio_jambiers: 1, mollets: 0.5, haut_du_dos: 1 });
    expect(c.compteurs_separes).toEqual({});
    expect(compterVolume(lignes, d, { poids: "un" }).volume).toEqual({ quadriceps: 2, fessiers: 2, adducteurs: 2, biceps: 2, avant_bras: 2, ischio_jambiers: 1, mollets: 1, haut_du_dos: 1 });
  });

  it("dentelé seul principal (0050) : aucun groupe", () => {
    expect(resoudreExercice("0050", d)).toMatchObject({ principaux: ["dentele_anterieur"], groupe: null });
  });
});

describe("MAP-7 : agrégat deltoides", () => {
  it("0977 (cible delts) : compteur deltoides à part, TETE_DELTOIDE_NON_PRECISEE, jamais réparti sur les têtes ; groupe deltoides", () => {
    expect(resoudreExercice("0977", d).groupe).toBe("deltoides");
    expect(compterVolume([{ exercice: "0977", series: 3 }], d)).toEqual({
      volume: { trapezes: 1.5, haut_du_dos: 1.5 },
      agregats: { deltoides: 3 },
      compteurs_separes: {},
      drapeaux: [{ code: "TETE_DELTOIDE_NON_PRECISEE", exercice: "0977" }],
    });
  });

  it("tête explicite par surcharge (0334 élévations latérales) : pas d'agrégat, pas d'avertissement", () => {
    expect(compterVolume([{ exercice: "0334", series: 3 }], d)).toEqual({ ...rien, volume: { deltoides_lateraux: 3, trapezes: 1.5 } });
  });
});

describe("MAP-9 : muscles hors volume", () => {
  it("core en secondaire (0043) : compteur séparé, jamais dans le volume", () => {
    const c = compterVolume([{ exercice: "0043", series: 4 }], d);
    expect(c.compteurs_separes).toEqual({ core: 2 });
    expect(c.volume).not.toHaveProperty("core");
  });

  it("core seul principal (0624, 0551) : toutes les séries au compteur core, rien au volume, aucun groupe", () => {
    for (const id of ["0624", "0551"]) {
      expect(resoudreExercice(id, d).groupe).toBeNull();
      expect(compterVolume([{ exercice: id, series: 3 }], d)).toEqual({ ...rien, compteurs_separes: { core: 3 } });
    }
  });

  it("coiffe_rotateurs (0216) : ni volume ni compteur", () => {
    expect(resoudreExercice("0216", d).secondaires).toContain("coiffe_rotateurs");
    const c = compterVolume([{ exercice: "0216", series: 2 }], d);
    expect(c).toEqual({ volume: { triceps: 1 }, agregats: { deltoides: 2 }, compteurs_separes: {}, drapeaux: [{ code: "TETE_DELTOIDE_NON_PRECISEE", exercice: "0216" }] });
  });

  it("dentele_anterieur (0050, principal) : ni volume ni compteur ; les secondaires comptent (principaux non vides)", () => {
    expect(compterVolume([{ exercice: "0050", series: 2 }], d)).toEqual({
      volume: { trapezes: 1 },
      agregats: { deltoides: 1 },
      compteurs_separes: {},
      drapeaux: [{ code: "TETE_DELTOIDE_NON_PRECISEE", exercice: "0050" }],
    });
  });
});

describe("MAP-11 : exercices hors volume, rien nulle part", () => {
  it.each<[string, string]>([
    ["etirement", "1709"],
    ["etirement", "mq-pigeon"],
    ["mobilite", "mq-chat-vache"],
    ["saut", "0053"],
    ["saut", "1420"],
    ["gamme_course", "mq-montees-genoux"],
    ["activation", "mq-ecartes-elastique"],
    ["activation", "mq-rotation-externe-elastique"],
  ])("%s %s × 3 : volume zéro, compteur séparé zéro, aucun groupe", (categorie, id) => {
    const r = resoudreExercice(id, d);
    expect(r.hors_volume).toBe(categorie);
    expect(r.groupe).toBeNull();
    expect(compterVolume([{ exercice: id, series: 3 }], d)).toEqual(rien);
    expect(compterVolume([{ exercice: id, series: 3 }], d, { poids: "un" })).toEqual(rien);
  });

  it("mobilite mq-squat-descentes-lentes : hors volume (MAP-11)", () => {
    expect(resoudreExercice("mq-squat-descentes-lentes", d).hors_volume).toBe("mobilite");
    expect(compterVolume([{ exercice: "mq-squat-descentes-lentes", series: 1 }], d)).toEqual(rien);
  });

  it("étirement 1709 : muscles résolus pour la sélection (fessiers ; ischio-jambiers), mais rien compté (bug d'avant la v3)", () => {
    expect(resoudreExercice("1709", d)).toMatchObject({ principaux: ["fessiers"], secondaires: ["ischio_jambiers"] });
  });
});

describe("corrections.json : seules les corrections validées sont appliquées", () => {
  it("0858 (wind sprints, classé abs dans le dataset) : corrigé en cardio, rien compté", () => {
    expect(d.exercices.get("0858")).toMatchObject({ partie_du_corps: "cardio", muscle_cible: "cardiovascular system" });
    expect(resoudreExercice("0858", d)).toMatchObject({ principaux: [], groupe: null });
    expect(compterVolume([{ exercice: "0858", series: 3 }], d)).toEqual(rien);
  });

  it("corrections non validées ignorées : 0003 garde son nom d'origine", () => {
    expect(d.exercices.get("0003")?.nom_en).toBe("air bike");
  });
});

describe("Cardio (cible « cardiovascular system ») : rien compté", () => {
  it.each(["3360", "mq-rameur"])("%s : principaux vides, aucun groupe, rien compté même sur les secondaires", (id) => {
    const r = resoudreExercice(id, d);
    expect(r.principaux).toEqual([]);
    expect(r.secondaires.length).toBeGreaterThan(0);
    expect(r.groupe).toBeNull();
    expect(compterVolume([{ exercice: id, series: 5 }], d)).toEqual(rien);
  });
});
