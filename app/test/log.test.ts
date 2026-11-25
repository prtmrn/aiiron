// log_series : contrat 4.5, knowledge/force/e1rm.md (R3 à R6) et ajustement-rpe.md (exemples réutilisés). Aucun appel réseau.
import { describe, expect, it } from "vitest";
import { creerMagasin } from "../src/magasin";
import { charges, ErreurOutil, logSeries, rpeDit, type LogEntree } from "../src/outils";
import { signalerSante } from "../src/sante";
import { outilsProposes } from "../src/serveur";

const barre = { type: "barre" as const, barre_kg: 20, increment_kg: 2.5 };
const enCours = (prescription: string) => ({ exercices: [{ exercice: "squat", prescription }] });
const magasin = (refs: Record<string, number> = { squat: 150 }, profil: Record<string, unknown> = { materiel: barre, seance_en_cours: enCours("3 × 5 @ RPE 8") }) =>
  creerMagasin({ profil, references_e1rm: refs });
const squat = (series: LogEntree["series"], extra: Partial<LogEntree> = {}): LogEntree => ({ exercice: "squat", series, ...extra });
const suivantes = (r: ReturnType<typeof logSeries>) => r.resultat!.series_suivantes?.map((s) => [s.charge_kg, s.rpe, s.annulee]);

describe("log_series : unités, refus, RIR", () => {
  it("livres : refusé, rien d'enregistré, référence intacte (log-02)", () => {
    const m = magasin({ couche: 100 }, { materiel: barre });
    const r = logSeries({ exercice: "developpe_couche", series: [{ charge: 225, reps: 5, rpe: 8 }], unite_dite: "lb" }, m);
    expect(r).toMatchObject({ statut: "refuse", resultat: null });
    expect(r.guidance[0]).toMatch(/que les kilos/);
    expect(m.journal).toEqual([]);
    expect(m.references.developpe_couche).toBe(100);
  });

  it("225 × 5 @ 8 sans unité, référence 100 : A_CONFIRMER, rien d'enregistré, question sur les chiffres et l'unité", () => {
    const m = magasin({ couche: 100 }, { materiel: barre });
    const r = logSeries({ exercice: "couche", series: [{ charge: 225, reps: 5, rpe: 8 }] }, m);
    expect(r).toMatchObject({ statut: "incomplet", drapeaux: ["A_CONFIRMER"] });
    expect(r.still_to_ask[0].question).toMatch(/kilos/);
    expect(m.journal).toEqual([]);
    expect(m.references.developpe_couche).toBe(100);
  });

  it("confirmé : enregistré, intégré sans garde-fou (R5 puis R6), et la confirmation vaut pour la suite de la séance", () => {
    const m = magasin({ squat: 100 }, { materiel: barre });
    const r = logSeries(squat([{ charge: 140, reps: 5, rpe: 8 }], { confirme: true }), m);
    expect(r.resultat!.reference).toBe("mise_a_jour");
    expect(m.references.squat).toBeGreaterThan(110);
    expect(logSeries(squat([{ charge: 140, reps: 5, rpe: 8 }]), m).statut).toBe("ok");
  });

  it("RIR converti par le code : RPE = 10 − RIR ; RPE et RIR ensemble : le plus haut", () => {
    expect(rpeDit({ charge: 1, reps: 1, rir: 2 })).toBe(8);
    expect(rpeDit({ charge: 1, reps: 1, rpe: 7, rir: 2 })).toBe(8);
    expect(rpeDit({ charge: 1, reps: 1, rpe: 9, rir: 2 })).toBe(9);
    expect(rpeDit({ charge: 1, reps: 1 })).toBeUndefined();
    const r = logSeries(squat([{ charge: 122.5, reps: 5, rir: 2 }]), magasin());
    expect(r.resultat!.series).toEqual([{ charge_kg: 122.5, reps: 5, rpe: 8 }]);
  });

  it("exercice inconnu : erreur ; restriction douleur ou drapeau rouge du jour : refusé", () => {
    expect(() => logSeries({ exercice: "back squat", series: [{ charge: 100, reps: 5 }] }, magasin())).toThrow(ErreurOutil);
    const a = magasin({ squat: 150 }, { materiel: barre, restrictions: [{ exercice: "squat", motif: "douleur" }] });
    expect(logSeries(squat([{ charge: 100, reps: 5, rpe: 8 }]), a)).toMatchObject({ statut: "refuse", drapeaux: ["DOULEUR"] });
    const b = magasin();
    signalerSante(b, { type: "drapeau_rouge" }, "m1");
    expect(logSeries(squat([{ charge: 100, reps: 5, rpe: 8 }]), b).statut).toBe("refuse");
    expect(b.journal).toEqual([]);
  });
});

describe("log_series : RPE manquant (log-01)", () => {
  it("squat 100 × 5 sans RPE : série gardée, référence inchangée, plan inchangé, consigne sans redemander", () => {
    const m = magasin({ squat: 130 });
    const r = logSeries(squat([{ charge: 100, reps: 5 }]), m);
    expect(r.statut).toBe("ok");
    expect(r.drapeaux).toEqual(["RPE_MANQUANT", "PAS_DE_DONNEE_FIABLE"]);
    expect(r.resultat).toEqual({ exercice: "squat", series: [{ charge_kg: 100, reps: 5, rpe: null }], reference: "inchangee", series_suivantes: null });
    expect(r.still_to_ask).toEqual([]); // la question a déjà été posée : pas de deuxième demande imposée
    expect(r.guidance.join(" ")).toMatch(/pas utilisée pour estimer son max/);
    expect(m.references.squat).toBe(130);
    expect(m.journal[0].series).toHaveLength(1);
  });

  it("le RPE manquant d'une série précédente ne se répète pas dans la consigne du tour suivant", () => {
    const m = magasin({ squat: 130 });
    logSeries(squat([{ charge: 100, reps: 5 }]), m);
    const r = logSeries(squat([{ charge: 100, reps: 5, rpe: 8 }]), m);
    expect(r.drapeaux).not.toContain("RPE_MANQUANT");
  });
});

describe("log_series : ajustement en séance (ajustement-rpe.md, exemple squat 150, 3 × 5 @ 8 à 122,5)", () => {
  it.each([
    [8.5, null], // R3 : zone morte, plan inchangé
    [9, [[120, 8, false], [120, 8, false]]], // R4
    [7, [[127.5, 8, false], [127.5, 8, false]]], // R4 + R7
    [10, [[112.5, 7, false], [112.5, 7, false]]], // R5 : série dure
  ])("122,5 × 5 @ %s", (rpe, attendu) => {
    const r = logSeries(squat([{ charge: 122.5, reps: 5, rpe }]), magasin());
    expect(suivantes(r) ?? null).toEqual(attendu);
    r.guidance.forEach((g) => expect(g).not.toMatch(/\d/));
  });

  it("série dure puis série dure : ARRET_EXERCICE, série restante annulée", () => {
    const m = magasin();
    expect(logSeries(squat([{ charge: 122.5, reps: 5, rpe: 10 }]), m).drapeaux).toContain("SERIE_DURE");
    const r = logSeries(squat([{ charge: 112.5, reps: 5, rpe: 9 }]), m);
    expect(r.drapeaux).toContain("ARRET_EXERCICE");
    expect(suivantes(r)).toEqual([[null, 7, true]]);
    expect(r.guidance.join(" ")).toMatch(/annulées/);
  });

  it("douleur sur une série : DOULEUR, restriction posée, séries restantes annulées, plus de charge", () => {
    const m = magasin();
    const r = logSeries(squat([{ charge: 122.5, reps: 5, rpe: 8, douleur: true }]), m);
    expect(r.drapeaux).toContain("DOULEUR");
    expect(suivantes(r)).toEqual([[null, 8, true], [null, 8, true]]);
    expect(m.profil.restrictions).toEqual([expect.objectContaining({ exercice: "squat", motif: "douleur" })]);
    expect(charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }] }, m).statut).toBe("refuse");
  });

  it("sans séance en cours : pas d'ajustement, référence mise à jour (R6)", () => {
    const m = magasin({ squat: 150 }, { materiel: barre });
    const r = logSeries(squat([{ charge: 122.5, reps: 5, rpe: 9 }]), m);
    expect(r.resultat!.series_suivantes).toBeNull();
    expect(r.resultat!.reference).toBe("mise_a_jour");
    expect(m.references.squat).toBeCloseTo(150 + 0.5 * (122.5 / (30 / 35.5) - 150), 6);
  });
});

describe("log_series : référence après la séance", () => {
  it("un appel par série ou un seul appel : même référence (recalcul depuis le début de séance, pas de lissage répété)", () => {
    const series = [{ charge: 122.5, reps: 5, rpe: 8 }, { charge: 122.5, reps: 5, rpe: 9 }, { charge: 122.5, reps: 5, rpe: 9 }];
    const a = magasin();
    series.forEach((s) => logSeries(squat([s]), a));
    const b = magasin();
    logSeries(squat(series), b);
    expect(a.references.squat).toBeCloseTo(b.references.squat, 9);
    expect(a.journal[0].series).toHaveLength(3);
  });

  it("premier log d'un exercice sans référence : la séance devient la référence (R8)", () => {
    const m = magasin({}, { materiel: barre });
    logSeries(squat([{ charge: 100, reps: 5, rpe: 8 }]), m);
    expect(m.references.squat).toBeCloseTo(100 / ((37 - 7.5) / 36), 6);
    expect(m.provenance.squat).toBe("moteur");
  });

  it("outil proposé au LLM", () => {
    expect(outilsProposes(magasin()).map((t) => t.name)).toContain("log_series");
  });
});
