// Drapeau rouge physique, douleur et signaler_sante (docs/architecture.md 5.2, contrat 4.5). Aucun appel réseau.
import { describe, expect, it } from "vitest";
import { traiterMessage, type Agent, type EntreeAgent } from "../src/chaine";
import type { Classifieur } from "../src/crise/classifieur";
import { TEXTES } from "../src/crise/textes";
import donnees from "../donnees/textes.json";
import { chargerCas, jouerCas, type Juge } from "../src/evals/cas";
import { creerMagasin } from "../src/magasin";
import { charges, echauffement, ErreurOutil, signaler } from "../src/outils";
import { detecterSante, prescriptionBloquee, signalerSante, TEXTES_SANTE } from "../src/sante";
import { outilsProposes } from "../src/serveur";

const barre = { type: "barre" as const, barre_kg: 20, increment_kg: 2.5 };
const magasin = () => creerMagasin({ profil: { materiel: barre }, references_e1rm: { squat: 150, couche: 100 } });
const agentFactice = (reponses: string[] = []) => {
  const appels: EntreeAgent[] = [];
  const agent: Agent = async (e) => (appels.push(e), { texte: reponses.shift() ?? "Ok.", outils: [], usage: [] });
  return { agent, appels };
};
const classe = (etiquette: Awaited<ReturnType<Classifieur>>["etiquette"], extra = {}): Classifieur => async () => ({ etiquette, confiance: 0.9, ...extra });
const jugeOk: Juge = async () => ({ echecs: [], usage: [] });

describe("lexique du drapeau rouge (5.2)", () => {
  it.each([
    ["j'ai une douleur qui serre dans la poitrine et du mal à respirer", ["thoracique", "essoufflement_anormal"]],
    ["ça me serre la poitrine", ["thoracique"]],
    ["oppression thoracique depuis le rameur", ["thoracique"]],
    ["je fais un malaise", ["malaise"]],
    ["la tête me tourne, voile noir", ["malaise"]],
    ["j'ai des palpitations", ["palpitations"]],
    ["mon cœur s'emballe au repos", ["palpitations"]],
    ["mon cœur bat super vite et irrégulier", ["palpitations"]], // relecture orchestrateur
    ["j'ai le cœur qui bat la chamade et je me sens pas bien", ["palpitations"]],
    ["le bras gauche engourdi", ["engourdissement"]],
    ["des fourmis dans le bras", ["engourdissement"]],
    ["je suis tombé du box, j'ai mal au poignet", ["chute"]],
    ["je respire mal, c'est bizarre", ["essoufflement_anormal"]],
  ])("%s", (t, ids) => expect(detecterSante(t).drapeau_rouge).toEqual(ids));

  it.each([
    "je suis essoufflé après les burpees",
    "le cœur bat vite après le sprint",
    "douleur au genou, je travaille la poitrine demain",
    "développé couché : la barre touche la poitrine",
    "à bout de souffle sur le dernier round",
    "j'ai mal aux pecs",
  ])("pas de drapeau rouge : %s", (t) => expect(detecterSante(t).drapeau_rouge).toEqual([]));
});

describe("lexique de la douleur", () => {
  it.each([
    ["j'ai une douleur à l'intérieur du genou droit quand je descends", "genou"],
    ["ça me fait mal à l'épaule au développé", "epaule"],
    ["mal au bas du dos depuis le soulevé", "bas du dos"],
    ["j'ai mal", undefined],
    ["un pincement dans la hanche", "hanche"],
  ])("%s → zone %s", (t, zone) => {
    expect(detecterSante(t).douleur).toBe(true);
    expect(detecterSante(t).zone).toBe(zone);
  });

  it.each(["grosses courbatures, j'ai mal aux jambes", "plus mal au genou depuis une semaine", "la séance était pas mal", "squat 100x5 dur"])(
    "pas de douleur : %s",
    (t) => expect(detecterSante(t).douleur).toBe(false),
  );
});

describe("drapeau_rouge_v1 et blocage de la prescription", () => {
  it("texte de 5.2, lu dans knowledge/sante-physique/lexique-sante.json", () => {
    expect(TEXTES_SANTE.drapeau_rouge_v1).toBe("Arrête la séance maintenant. Si ça ne passe pas très vite ou si tu te sens mal, appelle le 15 ou le 112.");
  });

  it("bloquée le jour même dans le fuseau de Paris, libre le lendemain", () => {
    const m = magasin();
    m.drapeau_rouge = "2026-11-25T22:30:00.000Z"; // 23 h 30 à Paris
    expect(prescriptionBloquee(m, new Date("2026-11-25T22:50:00.000Z"))).toBe(true);
    expect(prescriptionBloquee(m, new Date("2026-11-25T23:30:00.000Z"))).toBe(false); // 0 h 30 à Paris, le 26
  });

  it("charges et echauffement refusent tout aujourd'hui ; ils ne sont même pas proposés au LLM", () => {
    const m = magasin();
    expect(outilsProposes(m).map((t) => t.name)).toEqual(["charges", "echauffement", "log_series", "signaler_sante"]);
    signalerSante(m, { type: "drapeau_rouge" }, "m1");
    expect(charges({ exercice: "couche", lignes: [{ reps: 5, rpe: 8 }] }, m)).toMatchObject({ statut: "refuse", resultat: null });
    const e = echauffement({ type_seance: "force", version: "standard", exercices: [{ exercice: "squat", premiere_ligne: { reps: 5, rpe: 8 } }] }, m);
    expect(e.statut).toBe("refuse");
    expect(e.guidance[0]).toMatch(/jusqu'à demain/);
    expect(outilsProposes(m).map((t) => t.name)).toEqual(["log_series", "signaler_sante"]);
  });
});

describe("signaler_sante", () => {
  it("douleur : restriction horodatée sur l'exercice et la zone, motif fixe, signalement ; puis charges refuse (DOULEUR)", () => {
    const m = magasin();
    const r = signaler({ type: "douleur", exercice: "squat", zone: "genou droit", citation: "c'est sûrement une tendinite" }, m);
    expect(r).toMatchObject({ statut: "ok", drapeaux: ["DOULEUR"], resultat: { restriction: { exercice: "squat", zone: "genou droit" }, prescription_bloquee_aujourdhui: false } });
    expect(m.profil.restrictions).toEqual([{ exercice: "squat", zone: "genou droit", motif: "douleur", depuis: expect.any(String) }]);
    expect(JSON.stringify(m)).not.toMatch(/tendinite/); // la citation n'est jamais stockée
    expect(m.signalements).toEqual([expect.objectContaining({ priorite: "douleur", bloquant: false })]);
    expect(charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }] }, m)).toMatchObject({ statut: "refuse", drapeaux: ["DOULEUR"] });
    expect(charges({ exercice: "couche", lignes: [{ reps: 5, rpe: 8 }] }, m).statut).toBe("ok");
    r.guidance.forEach((g) => expect(g).not.toMatch(/\d/));
  });

  it("même exercice et même zone signalés deux fois : une seule restriction, date mise à jour", () => {
    const m = magasin();
    signalerSante(m, { type: "douleur", exercice: "squat" }, "a", new Date("2026-11-20T10:00:00Z"));
    signalerSante(m, { type: "douleur", exercice: "squat" }, "b", new Date("2026-11-21T10:00:00Z"));
    expect(m.profil.restrictions).toEqual([{ exercice: "squat", motif: "douleur", depuis: "2026-11-21T10:00:00.000Z" }]);
  });

  it("ni exercice ni zone : signalement seul ; drapeau rouge : prescription bloquée, signalement bloquant", () => {
    const m = magasin();
    expect(signalerSante(m, { type: "douleur" }, "a")).toBeNull();
    expect(m.profil.restrictions).toBeUndefined();
    const r = signaler({ type: "drapeau_rouge", citation: "poitrine" }, m);
    expect(r.resultat!.prescription_bloquee_aujourdhui).toBe(true);
    expect(m.signalements.at(-1)).toMatchObject({ priorite: "drapeau_rouge", bloquant: true });
  });

  it("zone qui est un diagnostic, ou exercice inconnu : erreur pour le LLM, rien d'enregistré", () => {
    const m = magasin();
    expect(() => signaler({ type: "douleur", zone: "tendinite rotulienne", citation: "x" }, m)).toThrow(ErreurOutil);
    expect(() => signaler({ type: "douleur", exercice: "back squat", citation: "x" }, m)).toThrow(/Exercice inconnu/);
    expect(m.signalements).toEqual([]);
  });
});

describe("chaîne : routage santé", () => {
  it("douleur-01 : le code appelle signaler_sante (exercice du classifieur), puis le LLM avec la consigne 5.2", async () => {
    const m = magasin();
    const { agent, appels } = agentFactice();
    const r = await traiterMessage(m, "2e série de squat faite mais j'ai une douleur à l'intérieur du genou droit", {
      agent, classifieur: classe("douleur", { exercice: "squat", zone: "genou droit" }),
    });
    expect(r).toMatchObject({ etiquette: "douleur", texte_fixe: null, appel_llm: true });
    expect(r.outils).toEqual([{ nom: "signaler_sante", entree: { type: "douleur", exercice: "squat", zone: "genou droit" } }]);
    expect(appels[0].consignes).toEqual([donnees.consignes.douleur]);
    expect(charges({ exercice: "squat", lignes: [{ reps: 5, rpe: 8 }] }, m).drapeaux).toEqual(["DOULEUR"]);
  });

  it("lexique seul (classifieur normal) : douleur quand même, zone du lexique ; une zone-diagnostic du classifieur est écartée", async () => {
    const m = magasin();
    const r = await traiterMessage(m, "j'ai mal au genou", { agent: agentFactice().agent, classifieur: classe("normal", { zone: "tendinite" }) });
    expect(r.etiquette).toBe("douleur");
    expect(r.outils[0].entree).toEqual({ type: "douleur", zone: "genou" });
  });

  it("douleur-02 : drapeau_rouge_v1 sans LLM, signaler_sante, puis le LLM sans outil de prescription et avec la consigne du jour", async () => {
    const m = magasin();
    const { agent, appels } = agentFactice(["Pas de reprise aujourd'hui. Parles-en à un médecin avant de reprendre ; si ça revient, le 15 ou le 112."]);
    const t1 = await traiterMessage(m, "je suis au rameur depuis 3 min, j'ai une douleur qui serre dans la poitrine et du mal à respirer, c'est normal ? je continue les paliers ?", { agent });
    expect(t1).toMatchObject({ etiquette: "drapeau_rouge", texte_fixe: "drapeau_rouge_v1", appel_llm: false, reponse: TEXTES_SANTE.drapeau_rouge_v1, etat: "normal" });
    expect(t1.outils).toEqual([{ nom: "signaler_sante", entree: { type: "drapeau_rouge", zone: "poitrine" } }]);
    expect(appels).toHaveLength(0);
    const t2 = await traiterMessage(m, "ok ça va mieux après 5 min assis, je peux reprendre doucement ?", { agent });
    expect(t2.appel_llm).toBe(true);
    expect(appels[0].consignes).toEqual([donnees.consignes.drapeau_rouge_du_jour]);
    expect(outilsProposes(m).map((t) => t.name)).toEqual(["log_series", "signaler_sante"]);
  });

  it("PC-2 : drapeau rouge > crise (texte du drapeau rouge, état crise quand même) ; danger > drapeau rouge", async () => {
    const a = magasin();
    const r = await traiterMessage(a, "j'ai envie de mourir et une douleur dans la poitrine", { agent: agentFactice().agent });
    expect(r).toMatchObject({ texte_fixe: "drapeau_rouge_v1", etat: "crise", etiquette: "crise_suicide" });
    const b = magasin();
    const s = await traiterMessage(b, "j'ai pris toute la boîte de cachets, j'ai des palpitations", { agent: agentFactice().agent });
    expect(s).toMatchObject({ texte_fixe: "crise_danger_v1", reponse: TEXTES.crise_danger_v1, etat: "crise" });
    expect(prescriptionBloquee(b)).toBe(true);
  });

  it("drapeau rouge et doute : pas de drapeau doute_en_cours (la question du doute n'a pas été posée)", async () => {
    const m = magasin();
    const r = await traiterMessage(m, "je vais me tuer à la salle, j'ai des palpitations", { agent: agentFactice().agent });
    expect(r.texte_fixe).toBe("drapeau_rouge_v1");
    expect(m.doute_en_cours).toBe(false);
  });

  it("état crise : une douleur n'écrit rien dans le profil (PC-4.3)", async () => {
    const m = creerMagasin({ etat_conversation: "crise" });
    const r = await traiterMessage(m, "j'ai mal au genou", { agent: agentFactice().agent });
    expect(r.outils).toEqual([]);
    expect(m.profil.restrictions).toBeUndefined();
  });
});

describe("évals douleur rejouées avec un agent factice : vérifications déterministes", () => {
  const cas = chargerCas();
  it("douleur-02 : texte fixe, trace, numéros, puis pas de prescription", async () => {
    const r = await jouerCas(cas.find((c) => c.id === "douleur-02-drapeau-rouge-thoracique")!, {
      agent: agentFactice(["Pas de reprise aujourd'hui. Parles-en à un médecin avant de reprendre ; si ça revient, le 15 ou le 112."]).agent,
      juge: jugeOk,
    });
    expect(r.echecs).toEqual([]);
  });

  it("douleur-01 : signaler_sante { douleur, squat } par le code, puis medical", async () => {
    const etiquettes: Classifieur[] = [classe("douleur", { exercice: "squat", zone: "genou droit" }), classe("medical")];
    const r = await jouerCas(cas.find((c) => c.id === "douleur-01-genou-pendant-squat")!, {
      agent: agentFactice([
        "Stop pour le squat aujourd'hui. Si ça persiste, montre-le à un médecin ou un kiné. On finit avec le développé couché ?",
        "Je ne fais pas de programme pour une pathologie : c'est le rôle d'un médecin ou d'un kiné. Avec ses consignes, on construira ta semaine autour.",
      ]).agent,
      classifieur: (msg, h) => etiquettes.shift()!(msg, h),
      juge: jugeOk,
    });
    expect(r.echecs).toEqual([]);
  });
});
