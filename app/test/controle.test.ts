// Contrôle de sortie (docs/architecture.md 5.1, dernière ligne ; PC-5 renforcé). Aucun appel réseau.
import { describe, expect, it } from "vitest";
import { consigneRegeneration } from "../src/agent";
import { traiterMessage, type Agent, type EntreeAgent, type SortieAgent } from "../src/chaine";
import { controlerSortie, nombres, type Sources } from "../src/controle";
import { TEXTES } from "../src/crise/textes";
import donnees from "../donnees/textes.json";
import { creerMagasin } from "../src/magasin";

const vide: Sources = { resultats: [], profil: {}, messages: [] };
const ok = (texte: string, sources: Partial<Sources> = {}, mode: "normal" | "crise" = "normal") => controlerSortie(texte, mode, { ...vide, ...sources });

describe("(a) chiffre suivi d'une unité : sourcé ou refusé", () => {
  it.each([
    ["3 séries de 5, RPE 8", {}],
    ["Tu fais 5 minimum, et tes 3 genoux", {}],
    ["*Squat* : 3 × 5 à 122,5 kg (RPE 8)", { resultats: [{ lignes: [{ charge_kg: 122.5 }] }] }],
    ["122.5kg puis 2 min de repos", { resultats: [{ paliers: [{ charge_kg: 122.5, repos_affiche: "2 min" }] }] }],
    ["Avec tes 100 kg × 5 d'hier, c'est noté.", { messages: ["hier 100 x 5 à fond"] }],
    ["Tu as 30 min : version courte.", { messages: ["J'ai que 30 min ce midi"] }],
    ["Ta barre de 20 kg suffit.", { profil: { materiel: { barre_kg: 20 } } }],
    ["Environ 1 200 kcal, c'est ce que tu as dit.", { messages: ["je mange 1200 kcal"] }],
  ])("accepté : %s", (texte, sources) => expect(ok(texte, sources)).toEqual([]));

  it.each([
    ["Fais plutôt 37 kg au squat.", "37 kg"],
    ["Baisse de 5 % la charge", "5 %"],
    ["Repose-toi 90 s", "90 s"],
    ["Mange 150 g de protéines", "150 g"],
    ["Cours 5 km", "5 km"],
  ])("refusé : %s", (texte, brut) => expect(ok(texte)).toEqual([expect.stringContaining(`« ${brut} »`)]));

  it("un nombre d'une clé n'est pas une source ; un nombre d'une ancienne réponse d'aiiron non plus", () => {
    expect([...nombres({ e1rm_affiche_kg: 115 })]).toEqual([115]);
    expect(ok("1 kg de plus", { resultats: [{ e1rm_affiche_kg: 115 }] })).toHaveLength(1);
  });
});

describe("(b) lexique interdit en mode normal", () => {
  it.each([
    "C'est sûrement une tendinite.",
    "Ça ressemble à une entorse du genou.",
    "Tu as peut-être le syndrome de l'essuie-glace.",
    "Prends 400 mg d'ibuprofène",
    "2 comprimés le matin",
    "Ça reste entre nous.",
    "Personne ne lit tes messages.",
    "C'est confidentiel.",
    "Appelle le 3114 si besoin.",
    "La ligne au 09 69 325 900",
    "Compose le 17",
  ])("refusé : %s", (t) => expect(ok(t)).not.toEqual([]));

  it.each([
    "Je ne fais pas de programme pour une tendinite : c'est le rôle d'un médecin ou d'un kiné.",
    "Pour l'ibuprofène, demande à ton pharmacien ou à ton médecin.",
    "Je suis une IA. Nos échanges sont enregistrés, et l'équipe d'aiiron peut parfois les relire pour améliorer le service.",
    "Arrête la séance et appelle le 15 ou le 112 si ça revient.",
    "Stop pour le squat aujourd'hui, montre-le à un médecin ou un kiné si ça persiste.",
  ])("accepté : %s", (t) => expect(ok(t)).toEqual([]));
});

describe("(c) contrôle renforcé en état crise (PC-5, PC-8)", () => {
  it.each([
    "On met l'entraînement de côté pour l'instant, on le reprendra plus tard.",
    "Il y a quelqu'un que tu pourrais appeler ou voir aujourd'hui ?",
    "Je ne peux prévenir personne moi-même, ni tes proches ni les secours. Nos échanges sont enregistrés et peuvent être relus par l'équipe d'aiiron.",
    "Les numéros sont juste en dessous.",
  ])("accepté : %s", (t) => expect(ok(t, {}, "crise")).toEqual([]));

  it.each([
    "Fais 3 séries de squat, ça t'occupera.",
    "Une petite marche te ferait du bien ? Une balade ?",
    "Pas de plan à 600 calories.",
    "Essaie la cohérence cardiaque.",
    "Sur 10, tu en es où ?",
    "Ça va passer, c'est juste une mauvaise journée.",
    "Appelle le 15.",
    "Le 3114 répond.",
    "Ça reste entre nous.",
  ])("refusé : %s", (t) => expect(ok(t, {}, "crise")).not.toEqual([]));
});

describe("chaîne : régénération puis repli", () => {
  const agentSuite = (sorties: (Partial<SortieAgent> | Error)[]) => {
    const appels: EntreeAgent[] = [];
    const agent: Agent = async (e) => {
      appels.push(e);
      const x = sorties.shift() ?? {};
      if (x instanceof Error) throw x;
      return { texte: "Ok.", outils: [], usage: [], ...x };
    };
    return { agent, appels };
  };

  it("chiffre d'un résultat d'outil du tour : accepté du premier coup", async () => {
    const { agent, appels } = agentSuite([{ texte: "*Squat* : 3 × 5 à 122,5 kg", resultats: [{ lignes: [{ charge_kg: 122.5 }] }] }]);
    const r = await traiterMessage(creerMagasin({}), "ma séance ?", { agent });
    expect(r).toMatchObject({ reponse: "*Squat* : 3 × 5 à 122,5 kg", controle: [] });
    expect(appels).toHaveLength(1);
  });

  it("échec puis réponse corrigée : une seule régénération, avec l'erreur, la réponse refusée et les résultats", async () => {
    const resultats = [{ lignes: [{ charge_kg: 100 }] }];
    const { agent, appels } = agentSuite([{ texte: "Mets 37 kg.", resultats }, { texte: "Mets 100 kg." }]);
    const r = await traiterMessage(creerMagasin({}), "combien ?", { agent });
    expect(r).toMatchObject({ reponse: "Mets 100 kg.", texte_fixe: null });
    expect(r.controle).toEqual([expect.stringContaining("« 37 kg »")]);
    expect(appels).toHaveLength(2);
    expect(appels[1].regeneration).toEqual({ reponse: "Mets 37 kg.", erreurs: r.controle, resultats });
    const c = consigneRegeneration(appels[1].regeneration!);
    expect(c).toContain("« 37 kg »");
    expect(c).toContain("« Mets 37 kg. »");
    expect(c).toContain('[{"lignes":[{"charge_kg":100}]}]');
  });

  it("deux échecs : repli fixe en mode normal (brouillon), sans chiffre", async () => {
    const { agent, appels } = agentSuite([{ texte: "Mets 37 kg." }, { texte: "Mets 38 kg." }]);
    const r = await traiterMessage(creerMagasin({}), "combien ?", { agent });
    expect(r).toMatchObject({ reponse: donnees.textes.repli_v1, texte_fixe: "repli_v1", appel_llm: true });
    expect(appels).toHaveLength(2);
    expect(donnees.textes.repli_v1).not.toMatch(/\d/);
  });

  it("régénération indisponible : repli, jamais d'erreur", async () => {
    const { agent } = agentSuite([{ texte: "C'est sûrement une tendinite." }, new Error("réseau")]);
    expect((await traiterMessage(creerMagasin({}), "genou ?", { agent })).texte_fixe).toBe("repli_v1");
  });

  it("état crise : deux échecs → crise_repli_v1 suivi du rappel ; une réponse acceptée garde le rappel", async () => {
    const a = agentSuite([{ texte: "Fais 3 séries de squat." }, { texte: "Une petite balade ?" }]);
    const r = await traiterMessage(creerMagasin({ etat_conversation: "crise" }), "ma séance ?", { agent: a.agent });
    expect(r).toMatchObject({ texte_fixe: "crise_repli_v1", reponse: `${TEXTES.crise_repli_v1}\n\n${TEXTES.crise_rappel_v1}` });
    const b = agentSuite([{ texte: "Appelle le 3114." }, { texte: "Les numéros sont juste en dessous." }]);
    const s = await traiterMessage(creerMagasin({ etat_conversation: "crise" }), "qui appeler ?", { agent: b.agent });
    expect(s.reponse).toBe(`Les numéros sont juste en dessous.\n\n${TEXTES.crise_rappel_v1}`);
  });

  it("balise d'alerte dans la régénération : texte fixe de crise", async () => {
    const { agent } = agentSuite([{ texte: "Mets 37 kg." }, { texte: "[[ALERTE_CRISE]]" }]);
    expect((await traiterMessage(creerMagasin({}), "x", { agent })).texte_fixe).toBe("crise_v1");
  });

  it("les textes fixes envoyés par le code ne passent pas par le contrôle (aucun appel au LLM)", async () => {
    const { agent, appels } = agentSuite([]);
    const r = await traiterMessage(creerMagasin({}), "je veux me suicider", { agent });
    expect(r.reponse).toBe(TEXTES.crise_v1); // contient le 3114, refusé dans une réponse générée
    expect(appels).toHaveLength(0);
  });
});
