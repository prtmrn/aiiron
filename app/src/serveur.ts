// Serveur MCP en processus « aiiron » : outils mcp__aiiron__charges, echauffement, log_series, signaler_sante (docs/architecture.md 2, 4.5).
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import type { Magasin } from "./magasin";
import { charges, echauffement, enResultatMcp, EXERCICES_FORCE, logSeries, signaler } from "./outils";
import { prescriptionBloquee } from "./sante";

const exercice = z.string().describe(`Identifiant du moteur force, recopié de cette liste : ${EXERCICES_FORCE.join(", ")}. « couche » est accepté pour developpe_couche.`);
const ligne = z.object({
  reps: z.number().int().min(1).describe("Reps de la ligne, recopiées du message ou de la séance"),
  rpe: z.number().optional().describe("RPE visé, recopié ; jamais déduit d'un mot comme « dur »"),
  pct: z.number().optional().describe("% de l'e1RM saisi dans la séance, en fraction (0.85 pour 85 %)"),
});
const materiel = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("barre"), barre_kg: z.number(), increment_kg: z.number(), max_kg: z.number().optional() }),
    z.object({ type: z.literal("liste"), charges_kg: z.array(z.number()).min(1) }),
    z.object({ type: z.literal("pile"), min_kg: z.number(), max_kg: z.number(), pas_kg: z.number() }),
    z.object({ type: z.literal("lest"), poids_corps_kg: z.number(), increment_kg: z.number(), max_lest_kg: z.number().optional() }),
  ])
  .optional()
  .describe("Seulement si l'utilisateur le précise pour ce tour ; sinon le profil");
const lecture = { annotations: { readOnlyHint: true }, alwaysLoad: true };
const ecriture = { alwaysLoad: true };
const PRESCRIPTION = ["charges", "echauffement"];

/** Drapeau rouge du jour : les outils de prescription ne sont même pas proposés (ils refusent aussi d'eux-mêmes). */
export const outilsProposes = (m: Magasin) => outils(m).filter((t) => !(prescriptionBloquee(m) && PRESCRIPTION.includes(t.name)));

export const creerServeur = (m: Magasin) => createSdkMcpServer({ name: "aiiron", version: "0.1.0", alwaysLoad: true, tools: outilsProposes(m) });

const outils = (m: Magasin) => [
  tool(
    "charges",
    "Charge arrondie au matériel pour une ou plusieurs lignes (reps, RPE ou %) d'un exercice, à partir des références de l'utilisateur ou d'une série qu'il donne. Renvoie statut, resultat, drapeaux, guidance, still_to_ask.",
    {
      exercice,
      lignes: z.array(ligne).min(1),
      phase: z.enum(["normale", "deload"]).optional(),
      materiel,
      remise_contexte: z.number().min(0.8).max(1).optional().describe("Seulement si un modèle de séance la fournit ; sinon ne pas la passer"),
      donnee_initiale: z
        .discriminatedUnion("type", [
          z.object({ type: z.literal("1rm"), valeur: z.number(), semaines: z.number().optional() }),
          z.object({ type: z.literal("reps_a_fond"), charge: z.number(), reps: z.number().int().min(1) }),
        ])
        .optional()
        .describe("Seulement des chiffres dits par l'utilisateur, recopiés"),
    },
    async (args) => enResultatMcp(() => charges(args, m)),
    lecture,
  ),
  tool(
    "echauffement",
    "Paliers de montée en charge avant les séries lourdes d'une séance de force, et charge de la première série de travail. L'échauffement général, la mobilité et l'activation ne sont pas encore calculés.",
    {
      type_seance: z.literal("force"),
      version: z.enum(["standard", "courte"]),
      activation: z.boolean().optional().describe("false si l'utilisateur retire l'activation (élastiques)"),
      equipements: z.array(z.string()).optional(),
      exercices: z.array(z.object({ exercice, premiere_ligne: ligne, materiel })).min(1).describe("Dans l'ordre de la séance"),
    },
    async (args) => enResultatMcp(() => echauffement(args, m)),
    lecture,
  ),
  tool(
    "log_series",
    "Enregistre des séries faites (le réalisé) d'un exercice : charges en kilos seulement, RIR converti en RPE par le code, référence et séries suivantes mises à jour par le moteur. Renvoie statut, resultat, drapeaux, guidance, still_to_ask.",
    {
      exercice,
      series: z
        .array(
          z.object({
            charge: z.number().positive().describe("Charge recopiée du message, sans conversion"),
            reps: z.number().int().min(0).describe("Reps faites, recopiées"),
            rpe: z.number().optional().describe("RPE dit par l'utilisateur, recopié ; jamais déduit d'un mot comme « dur »"),
            rir: z.number().int().min(0).optional().describe("Reps en réserve dites par l'utilisateur, recopiées ; le code les convertit en RPE"),
            douleur: z.boolean().optional().describe("true si l'utilisateur dit avoir eu mal sur cette série"),
          }),
        )
        .min(1),
      unite_dite: z.enum(["kg", "lb"]).nullable().optional().describe("Unité dite par l'utilisateur ; null ou absente s'il ne l'a pas dite"),
      confirme: z.boolean().optional().describe("true seulement si l'utilisateur vient de confirmer des chiffres signalés A_CONFIRMER"),
    },
    async (args) => enResultatMcp(() => logSeries(args, m)),
    ecriture,
  ),
  tool(
    "signaler_sante",
    "Signale une douleur ou un signe d'alerte physique dit par l'utilisateur : restriction active sur l'exercice ou la zone (douleur), plus aucune prescription aujourd'hui (drapeau_rouge), conversation signalée. Aucun diagnostic.",
    {
      type: z.enum(["douleur", "drapeau_rouge"]),
      exercice: exercice.optional(),
      zone: z.string().max(40).optional().describe("Partie du corps citée (« genou droit »), jamais un diagnostic"),
      citation: z.string().describe("Extrait du message de l'utilisateur ; il n'est pas enregistré"),
    },
    async (args) => enResultatMcp(() => signaler(args, m)),
    ecriture,
  ),
];
