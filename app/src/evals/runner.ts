// npm run evals [-- --cas <id>] [-- --essais N] : rejoue evals/*.yaml dans la vraie chaîne (garde-fous + agent réel) et juge.
import { parseArgs } from "node:util";
import { creerAgent } from "../agent";
import type { Usage } from "../chaine";
import { chargerCas, jouerCas, seuil } from "./cas";
import { jugeOpus } from "./juge";

const { values } = parseArgs({ options: { cas: { type: "string" }, essais: { type: "string", default: "1" } } });
const essais = Number(values.essais);
if (!Number.isInteger(essais) || essais < 1) {
  console.error("--essais : un entier ≥ 1 (le README prévoit 5 ; 1 par défaut pour limiter le coût).");
  process.exit(1);
}
let agent;
try {
  agent = creerAgent(); // vérifie la clé et charge les prompts avant tout appel
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
const tous = chargerCas();
const cas = values.cas ? tous.filter((c) => c.id === values.cas) : tous;
if (!cas.length) {
  console.error(`Cas inconnu : ${values.cas}. Cas disponibles : ${tous.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const usage: Usage[] = [];
let echecsCas = 0;
for (const c of cas) {
  const resultats = [];
  for (let i = 0; i < essais; i++) {
    const r = await jouerCas(c, { agent, juge: jugeOpus });
    usage.push(...r.usage);
    resultats.push(r);
  }
  const reussis = resultats.filter((r) => r.reussi).length;
  const passe = reussis >= seuil(c.critique, essais);
  if (!passe) echecsCas++;
  console.log(`${passe ? "RÉUSSI" : "ÉCHEC "} ${c.id}${c.critique ? " (critique)" : ""} : ${reussis}/${essais}`);
  resultats.forEach((r, i) => r.echecs.forEach((x) => console.log(`    essai ${i + 1} · ${x}`)));
}

const total = (k: keyof Omit<Usage, "modele">) => usage.reduce((s, u) => s + u[k], 0);
console.log(
  `\n${cas.length - echecsCas}/${cas.length} cas réussis. Tokens : entrée ${total("entree")}, sortie ${total("sortie")}, cache lu ${total("cache_lu")}, cache écrit ${total("cache_ecrit")} ; coût estimé ${total("cout_usd").toFixed(3)} $.`,
);
process.exit(echecsCas ? 1 : 0);
