// Conversation locale avec aiiron dans le terminal : npm run chat (clé dans ../.env).
import { createInterface } from "node:readline/promises";
import { readFileSync } from "node:fs";
import { creerAgent } from "./agent";
import { traiterMessage } from "./chaine";
import { creerMagasin } from "./magasin";

let agent;
try {
  agent = creerAgent();
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
const demo = JSON.parse(readFileSync(new URL("../fixtures/profil-demo.json", import.meta.url), "utf8"));
const magasin = creerMagasin(demo);
const rl = createInterface({ input: process.stdin, output: process.stdout });
console.log("aiiron, conversation locale (profil fictif). /quitter pour sortir.\n");
for (;;) {
  const message = (await rl.question("toi > ")).trim();
  if (message === "/quitter") break;
  if (!message) continue;
  try {
    const r = await traiterMessage(magasin, message, { agent });
    console.log(`\naiiron > ${r.reponse}\n`);
    const trace = [`étiquette ${r.etiquette}`, `état ${r.etat}`, r.texte_fixe && `texte fixe ${r.texte_fixe}`, r.outils.length && `outils ${r.outils.map((o) => o.nom).join(", ")}`];
    console.error(`  [${trace.filter(Boolean).join(" · ")}]\n`);
  } catch (err) {
    console.error(`  [erreur : ${(err as Error).message}]\n`);
  }
}
rl.close();
