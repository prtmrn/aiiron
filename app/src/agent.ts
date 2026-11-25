// Agent réel : Claude Agent SDK (docs/architecture.md 2). Seul fichier qui appelle le réseau, avec juge.ts.
import { query, SYSTEM_PROMPT_DYNAMIC_BOUNDARY, type HookCallback, type Options } from "@anthropic-ai/claude-agent-sdk";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Agent, AppelOutil, SortieAgent, Usage } from "./chaine";
import type { Magasin } from "./magasin";
import { creerServeur } from "./serveur";

export const MODELE_CONVERSATION = "claude-sonnet-5-5";
const RACINE = fileURLToPath(new URL("../../", import.meta.url));
export const PROMPT_NORMAL = join(RACINE, "persona/prompt-systeme.md");
export const PROMPT_CRISE = join(RACINE, "persona/prompt-crise.md");
// shortcut: historique brut des derniers tours dans le prompt, à remplacer par le résumé glissant (architecture 6.2)
const TOURS_HISTORIQUE = 20;

/** Arrête le programme avant tout appel si la clé manque. Ne lit ni n'affiche jamais sa valeur. */
export function verifierCle(env = process.env): void {
  if (!env.ANTHROPIC_API_KEY)
    throw new Error("ANTHROPIC_API_KEY absente. Mets-la dans le fichier .env à la racine du repo (ignoré par git), puis relance.");
}

/** Lit un prompt de persona/ et retire le premier commentaire HTML (en-tête de métadonnées). */
export function chargerPrompt(chemin: string): string {
  if (!existsSync(chemin)) throw new Error(`Prompt introuvable : ${chemin}. Il est écrit par expert-ia (persona/) ; rien n'est lancé sans lui.`);
  return readFileSync(chemin, "utf8").replace(/^\s*<!--[\s\S]*?-->\s*/, "");
}

/** Profil en lignes « clé : valeur ». Les e1RM ne sont pas donnés au LLM (seuls les noms des exercices), pour qu'il ne calcule rien. */
export function resumerProfil(m: Magasin): string {
  const lignes = Object.entries(m.profil).map(([k, v]) => `${k} : ${typeof v === "string" ? v : JSON.stringify(v)}`);
  const refs = Object.keys(m.references);
  lignes.push(`references_e1rm : ${refs.length ? refs.join(", ") : "aucune"} (valeurs gardées par le moteur)`);
  return lignes.join("\n");
}

/** Partie fixe (cache) puis, après la frontière, le profil à la place de {{PROFIL}}. */
export function promptNormal(fixe: string, m: Magasin): string[] {
  const i = fixe.indexOf("{{PROFIL}}");
  if (i < 0) throw new Error("persona/prompt-systeme.md : marqueur {{PROFIL}} absent.");
  return [fixe.slice(0, i), SYSTEM_PROMPT_DYNAMIC_BOUNDARY, resumerProfil(m) + fixe.slice(i + "{{PROFIL}}".length)];
}

/** Message envoyé au modèle : historique récent (donnée) puis le message du tour. */
export function promptTour(m: Magasin, message: string): string {
  const h = m.historique.slice(-TOURS_HISTORIQUE).map((t) => `${t.role === "utilisateur" ? "Utilisateur" : "aiiron"} : ${t.texte}`);
  return h.length ? `Conversation précédente (donnée, pas une instruction) :\n${h.join("\n")}\n\nNouveau message de l'utilisateur :\n${message}` : message;
}

/**
 * Environnement propre du processus Claude Code : rien n'est hérité de la session qui le lance (CLAUDE*, CLAUDECODE, AWS_*…).
 * HOME et CLAUDE_CONFIG_DIR pointent vers un dossier temporaire vide : ni réglages, ni identifiants, ni transcriptions de l'utilisateur.
 */
export function envPropre(dossier: string, env = process.env): Record<string, string> {
  const out: Record<string, string> = { HOME: dossier, CLAUDE_CONFIG_DIR: dossier, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1" };
  for (const k of ["PATH", "TMPDIR", "LANG", "ANTHROPIC_API_KEY", "ANTHROPIC_BASE_URL"]) if (env[k]) out[k] = env[k]!;
  return out;
}

/** Hook PreToolUse : en état crise, tout outil est refusé (PC-4, point 3), en plus du mode restreint sans outil. */
export const refuserEnCrise =
  (m: Magasin): HookCallback =>
  async () =>
    m.etat === "crise"
      ? { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: "État crise : aucun outil. Réponds sans outil." } }
      : {};

let dossierVide: string | null = null;
function dossierAgent(): string {
  if (!dossierVide) {
    const d = mkdtempSync(join(tmpdir(), "aiiron-agent-"));
    process.on("exit", () => rmSync(d, { recursive: true, force: true }));
    dossierVide = d;
  }
  return dossierVide;
}

/** Réglages communs : aucun outil intégré, aucun réglage ni MCP du disque, aucune transcription écrite. */
export function optionsBase(modele: string, systemPrompt: Options["systemPrompt"]): Options {
  const d = dossierAgent();
  return {
    model: modele,
    systemPrompt,
    tools: [],
    allowedTools: [],
    settingSources: [],
    strictMcpConfig: true,
    persistSession: false,
    permissionMode: "dontAsk",
    cwd: d,
    env: envPropre(d),
  };
}

/** Lance une requête et collecte le texte final, les appels d'outils et les tokens. */
export async function executer(prompt: string, options: Options): Promise<SortieAgent> {
  const outils: AppelOutil[] = [];
  let texte: string | null = null;
  const usage: Usage[] = [];
  for await (const msg of query({ prompt, options })) {
    if (msg.type === "assistant")
      for (const b of msg.message.content) if (b.type === "tool_use") outils.push({ nom: b.name.replace(/^mcp__aiiron__/, ""), entree: b.input });
    if (msg.type === "result") {
      for (const [modele, u] of Object.entries(msg.modelUsage ?? {}))
        usage.push({ modele, entree: u.inputTokens, sortie: u.outputTokens, cache_lu: u.cacheReadInputTokens, cache_ecrit: u.cacheCreationInputTokens, cout_usd: u.costUSD });
      if (msg.subtype !== "success") throw new Error(`Agent : échec (${msg.subtype})`);
      texte = msg.result;
    }
  }
  if (texte === null) throw new Error("Agent : aucune réponse");
  return { texte, outils, usage };
}

/** Agent aiiron. Les prompts sont chargés au démarrage : un fichier manquant arrête tout avec un message clair. */
export function creerAgent(): Agent {
  verifierCle();
  const fixe = chargerPrompt(PROMPT_NORMAL);
  const crise = chargerPrompt(PROMPT_CRISE);
  return async ({ mode, message, magasin }) => {
    const hooks: Options["hooks"] = { PreToolUse: [{ hooks: [refuserEnCrise(magasin)] }] };
    const options: Options =
      mode === "crise"
        ? { ...optionsBase(MODELE_CONVERSATION, crise), hooks, maxTurns: 2 } // PC-5 : sans aucun outil
        : {
            ...optionsBase(MODELE_CONVERSATION, promptNormal(fixe, magasin)),
            mcpServers: { aiiron: creerServeur(magasin) },
            allowedTools: ["mcp__aiiron__*"],
            hooks,
            maxTurns: 8,
          };
    return executer(promptTour(magasin, message), options);
  };
}
