// Réglages de l'agent réel, sans appel réseau (prompt factice).
import { SYSTEM_PROMPT_DYNAMIC_BOUNDARY } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { chargerPrompt, envPropre, optionsBase, promptNormal, promptTour, refuserEnCrise, resumerProfil, verifierCle } from "../src/agent";
import { creerMagasin } from "../src/magasin";

const FACTICE = fileURLToPath(new URL("./fixtures/prompt-factice.md", import.meta.url));
const magasin = () => creerMagasin({ profil: { objectif: "force_generale", materiel: { type: "barre", barre_kg: 20, increment_kg: 2.5 } }, references_e1rm: { squat: 140 } });

describe("agent", () => {
  it("sans clé : erreur claire, sans afficher de valeur", () => {
    expect(() => verifierCle({})).toThrow(/ANTHROPIC_API_KEY absente/);
    expect(() => verifierCle({ ANTHROPIC_API_KEY: "x" })).not.toThrow();
  });

  it("prompt absent : erreur claire ; présent : en-tête HTML retiré", () => {
    expect(() => chargerPrompt("/nulle/part/prompt-systeme.md")).toThrow(/Prompt introuvable/);
    const p = chargerPrompt(FACTICE);
    expect(p.startsWith("Tu es un agent de test.")).toBe(true);
    expect(p).not.toContain("<!--");
  });

  it("{{PROFIL}} remplacé après la frontière de cache ; e1RM jamais donnés en chiffres", () => {
    const [fixe, frontiere, variable] = promptNormal(chargerPrompt(FACTICE), magasin());
    expect(frontiere).toBe(SYSTEM_PROMPT_DYNAMIC_BOUNDARY);
    expect(fixe).not.toContain("{{PROFIL}}");
    expect(variable).toContain("objectif : force_generale");
    expect(variable).toContain("references_e1rm : squat");
    expect(resumerProfil(magasin())).not.toContain("140");
    expect(() => promptNormal("sans marqueur", magasin())).toThrow(/PROFIL/);
  });

  it("environnement propre : rien de la session qui lance (CLAUDE*, CLAUDECODE, AWS_*)", () => {
    const env = envPropre("/tmp/vide", { PATH: "/bin", ANTHROPIC_API_KEY: "k", CLAUDECODE: "1", CLAUDE_CODE_ENTRYPOINT: "cli", AWS_PROFILE: "p", HOME: "/Users/x" });
    expect(env).toEqual({ PATH: "/bin", ANTHROPIC_API_KEY: "k", HOME: "/tmp/vide", CLAUDE_CONFIG_DIR: "/tmp/vide", CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1" });
  });

  it("options de base : aucun outil intégré, aucun réglage du disque, aucune transcription", () => {
    const o = optionsBase("claude-sonnet-5-5", "p");
    expect(o).toMatchObject({ tools: [], allowedTools: [], settingSources: [], strictMcpConfig: true, persistSession: false, permissionMode: "dontAsk" });
  });

  it("hook PreToolUse : refuse tout outil en état crise, laisse passer sinon", async () => {
    const m = magasin();
    const hook = refuserEnCrise(m);
    const appel = () => hook({} as never, undefined, { signal: new AbortController().signal });
    expect(await appel()).toEqual({});
    m.etat = "crise";
    expect(await appel()).toMatchObject({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny" } });
  });

  it("message du tour : historique en donnée, puis le message", () => {
    const m = magasin();
    expect(promptTour(m, "salut")).toBe("salut");
    m.historique.push({ role: "utilisateur", texte: "a" }, { role: "aiiron", texte: "b" });
    expect(promptTour(m, "c")).toMatch(/Utilisateur : a\naiiron : b\n\nNouveau message de l'utilisateur :\nc$/);
  });
});
