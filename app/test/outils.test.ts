// Outils charges et echauffement : contrats de docs/architecture.md 4.1 à 4.3. Aucun appel réseau.
import { describe, expect, it } from "vitest";
import { creerMagasin } from "../src/magasin";
import { charges, echauffement, enResultatMcp, ErreurOutil, reposAffiche, type Retour } from "../src/outils";

const barre = { type: "barre" as const, barre_kg: 20, increment_kg: 2.5 };
const magasin = (refs: Record<string, number> = {}, profil: Record<string, unknown> = { materiel: barre }) =>
  creerMagasin({ profil, references_e1rm: refs });
const sansChiffre = (r: Retour<unknown>) => r.guidance.forEach((g) => expect(g).not.toMatch(/\d/));
const sansOutilAbsent = (r: Retour<unknown>) => r.guidance.forEach((g) => expect(g).not.toMatch(/signaler_sante|programme|log_series/));

describe("charges", () => {
  it("aucune référence, pas de donnée initiale : incomplet, aucune charge, question de still_to_ask", () => {
    const r = charges({ exercice: "developpe_couche", lignes: [{ reps: 3, rpe: 8 }] }, magasin());
    expect(r.statut).toBe("incomplet");
    expect(r.resultat).toBeNull();
    expect(r.still_to_ask.map((q) => q.cle)).toEqual(["1rm_ou_serie_a_fond.developpe_couche"]);
    expect(r.still_to_ask[0].question).toContain("développé couché");
    expect(r.guidance[0]).toMatch(/Pas de charge sans donnée/);
    sansChiffre(r);
  });

  it("charges-01 : 100 × 5 à fond, 3 @ 8 → 100 kg ; référence déclarée enregistrée (115)", () => {
    const m = magasin();
    const r = charges({ exercice: "couche", lignes: [{ reps: 3, rpe: 8 }], donnee_initiale: { type: "reps_a_fond", charge: 100, reps: 5 } }, m);
    expect(r.statut).toBe("ok");
    expect(r.resultat).toMatchObject({ exercice: "developpe_couche", source_e1rm: "donnee_initiale", e1rm_affiche_kg: 115 });
    expect(r.resultat!.lignes).toEqual([{ reps: 3, rpe: 8, charge_kg: 100, drapeaux: [] }]);
    expect(m.references.developpe_couche).toBe(115);
    expect(m.provenance.developpe_couche).toBe("declare");
    // tour suivant : la référence sert sans redonner la série
    expect(charges({ exercice: "developpe_couche", lignes: [{ reps: 3, rpe: 8 }] }, m).resultat!.source_e1rm).toBe("reference");
  });

  it("référence existante et donnée très éloignée (> 10 %) : A_CONFIRMER, incomplet", () => {
    const r = charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }], donnee_initiale: { type: "1rm", valeur: 200, semaines: 2 } }, magasin({ squat: 150 }));
    expect(r.statut).toBe("incomplet");
    expect(r.drapeaux).toContain("A_CONFIRMER");
    expect(r.still_to_ask[0].cle).toBe("confirmer_donnee.squat");
    sansChiffre(r);
  });

  it("variante : squat pause depuis la référence squat", () => {
    const r = charges({ exercice: "squat_pause_2s", lignes: [{ reps: 4, rpe: 8 }] }, magasin({ squat: 150 }));
    expect(r.resultat!.source_e1rm).toBe("variante");
    expect(r.resultat!.lignes[0].charge_kg).not.toBeNull();
  });

  it("restriction douleur active : refuse, DOULEUR, aucun calcul", () => {
    const m = magasin({ squat: 150 }, { materiel: barre, restrictions: [{ exercice: "squat", motif: "douleur signalée" }] });
    const r = charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }] }, m);
    expect(r).toMatchObject({ statut: "refuse", resultat: null, drapeaux: ["DOULEUR"] });
    expect(r.guidance[0]).toMatch(/douleur signalée/);
  });

  it("ni RPE ni % : PRESCRIPTION_INCOMPLETE, incomplet, question sur le RPE", () => {
    const r = charges({ exercice: "squat", lignes: [{ reps: 5 }] }, magasin({ squat: 150 }));
    expect(r.statut).toBe("incomplet");
    expect(r.resultat).toBeNull();
    expect(r.drapeaux).toContain("PRESCRIPTION_INCOMPLETE");
    expect(r.still_to_ask[0].cle).toBe("rpe.0");
  });

  it("20 reps : HORS_DOMAINE, ligne sans charge, guidance au ressenti", () => {
    const r = charges({ exercice: "squat", lignes: [{ reps: 20, rpe: 8 }] }, magasin({ squat: 150 }));
    expect(r.statut).toBe("ok");
    expect(r.resultat!.lignes[0]).toMatchObject({ charge_kg: null, drapeaux: ["HORS_DOMAINE"] });
    expect(r.guidance.join(" ")).toMatch(/ressenti/);
    sansChiffre(r);
  });

  it("% et RPE incohérents, RPE déduit du % : guidances sans chiffre", () => {
    const m = magasin({ squat: 150 });
    const a = charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 6, pct: 0.85 }] }, m);
    expect(a.drapeaux).toContain("INCOHERENCE_PCT_RPE");
    const b = charges({ exercice: "squat", lignes: [{ reps: 5, pct: 0.8 }] }, m);
    expect(b.drapeaux).toContain("RPE_DEDUIT_DU_PCT");
    [a, b].forEach(sansChiffre);
  });

  it("aucun matériel dans le profil ni dans l'entrée : incomplet, question sur le matériel", () => {
    const r = charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }] }, magasin({ squat: 150 }, {}));
    expect(r.statut).toBe("incomplet");
    expect(r.still_to_ask[0].cle).toBe("materiel.squat");
  });

  it("exercice inconnu : erreur de l'outil qui demande l'exercice exact", () => {
    expect(() => charges({ exercice: "0043", lignes: [{ reps: 5, rpe: 8 }] }, magasin())).toThrow(ErreurOutil);
    const mcp = enResultatMcp(() => charges({ exercice: "DC", lignes: [{ reps: 5, rpe: 8 }] }, magasin()));
    expect(mcp.isError).toBe(true);
    expect(mcp.structuredContent).toBeUndefined();
    expect((mcp.content[0] as { text: string }).text).toMatch(/exercice exact/);
  });

  it("résultat MCP : structuredContent = le Retour exact", () => {
    const mcp = enResultatMcp(() => charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }] }, magasin({ squat: 150 })));
    expect(mcp.isError).toBeUndefined();
    expect(mcp.structuredContent).toMatchObject({ statut: "ok", resultat: { lignes: [{ charge_kg: 122.5 }] } });
  });
});

describe("echauffement", () => {
  const squat58 = { exercice: "squat", premiere_ligne: { reps: 5, rpe: 8 } };

  it("echauffement-01 : squat 5 @ 8, e1RM 150, version courte → paliers du moteur, charge de travail 122,5", () => {
    const r = echauffement({ type_seance: "force", version: "courte", exercices: [squat58] }, magasin({ squat: 150 }));
    expect(r.statut).toBe("ok");
    expect(r.resultat!.duree_paliers_min).toBe(9); // 504 s, arrondi à la minute supérieure
    const [bloc] = r.resultat!.blocs;
    expect(bloc.type).toBe("preparation_specifique");
    const [m] = bloc.items;
    expect(m).toMatchObject({ nature: "montee_en_charge", exercice: "squat", regle: "R2", echelle: "lourd", charge_travail_kg: 122.5 });
    expect(m.premiere_serie).toEqual({ reps: 5, rpe: 8 });
    expect(m.paliers.map((p) => [p.charge_kg, p.reps])).toEqual([[20, 10], [50, 5], [72.5, 3], [92.5, 2], [105, 1]]);
    expect(m.paliers.map((p) => p.repos_affiche)).toEqual(["30 s", "1 min", "1 min", "90 s", "3 min"]);
    expect(r.guidance.join(" ")).toMatch(/version courte/);
    expect(r.guidance.join(" ")).toMatch(/pas encore/);
    sansChiffre(r);
    sansOutilAbsent(r);
  });

  it("activation retirée : guidance de retrait, paliers gardés", () => {
    const r = echauffement({ type_seance: "force", version: "courte", activation: false, exercices: [squat58] }, magasin({ squat: 150 }));
    expect(r.guidance.join(" ")).toMatch(/Retire l'activation/);
    expect(r.resultat!.blocs[0].items[0].paliers.length).toBe(5);
  });

  it("deux mouvements du même schéma : le second part à 60 % (R5), sans barre vide", () => {
    const r = echauffement(
      { type_seance: "force", version: "standard", exercices: [squat58, { exercice: "squat_pause_2s", premiere_ligne: { reps: 4, rpe: 8 } }] },
      magasin({ squat: 150 }),
    );
    const [, pause] = r.resultat!.blocs[0].items;
    expect(pause.paliers[0].charge_kg).toBeGreaterThan(20);
  });

  it("soulevé de terre : la barre vide se fait en roumain", () => {
    const r = echauffement({ type_seance: "force", version: "standard", exercices: [{ exercice: "souleve_de_terre", premiere_ligne: { reps: 3, rpe: 8 } }] }, magasin({ souleve_de_terre: 200 }));
    expect(r.resultat!.blocs[0].items[0].paliers[0]).toMatchObject({ exercice: "sdt_roumain", charge_kg: 20 });
  });

  it("e1RM inconnu : incomplet, même question que charges", () => {
    const r = echauffement({ type_seance: "force", version: "standard", exercices: [squat58] }, magasin());
    expect(r.statut).toBe("incomplet");
    expect(r.resultat).toBeNull();
    expect(r.still_to_ask[0].cle).toBe("1rm_ou_serie_a_fond.squat");
  });

  it("restriction douleur sur un exercice de la séance : refuse, DOULEUR", () => {
    const m = magasin({ squat: 150 }, { materiel: barre, restrictions: [{ exercice: "squat", motif: "douleur signalée" }] });
    const r = echauffement({ type_seance: "force", version: "standard", exercices: [squat58] }, m);
    expect(r).toMatchObject({ statut: "refuse", resultat: null, drapeaux: ["DOULEUR"] });
  });
});

it("reposAffiche : secondes ou minutes, mis en forme par le code", () => {
  expect([30, 60, 90, 120, 180].map(reposAffiche)).toEqual(["30 s", "1 min", "90 s", "2 min", "3 min"]);
});
