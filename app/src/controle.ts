// Contrôle de sortie déterministe (docs/architecture.md 5.1, dernière ligne ; PC-5 renforcé en état crise).
// Appliqué aux réponses générées seulement : les textes fixes envoyés par le code n'y passent pas.
import donnees from "../donnees/controle-sortie.json";
import { normaliser } from "./crise/lexique";
import { DIAGNOSTICS } from "./sante";

const CHIFFRE_UNITE = new RegExp(`(\\d{1,3}(?:[  ]\\d{3})+|\\d+)(?:[.,](\\d+))?\\s?(${donnees.unites})(?![\\p{L}\\p{N}])`, "giu");
const NOMBRE = /\d+(?:[.,]\d+)?/g;
const HYPOTHESE = new RegExp(`${donnees.hypothese}(?: \\S+){0,3} ${DIAGNOSTICS.source}`);
const POSOLOGIE = new RegExp(donnees.posologie);
const CONFIDENTIALITE = new RegExp(donnees.confidentialite);
const APPEL = new RegExp(donnees.appel, "g");
const NUMEROS = new RegExp(donnees.numeros_toujours);
const CRISE_SPORT = new RegExp(donnees.crise_sport);
const CRISE_PC8 = new RegExp(donnees.crise_pc8);
const CRISE_NUMEROS = new RegExp(donnees.crise_numeros);

/** Sources permises d'un chiffre : résultats d'outils du tour, profil, messages de l'utilisateur. */
export type Sources = { resultats: unknown[]; profil: unknown; messages: string[] };

const lire = (s: string) => Number(s.replace(/[  ]/g, "").replace(",", "."));

/** Tous les nombres des valeurs (jamais des clés), y compris ceux écrits dans des chaînes (« 2 min »). */
export function nombres(x: unknown, out = new Set<number>()): Set<number> {
  if (typeof x === "number") out.add(x);
  else if (typeof x === "string") for (const n of x.match(NOMBRE) ?? []) out.add(lire(n));
  else if (Array.isArray(x)) x.forEach((y) => nombres(y, out));
  else if (x !== null && typeof x === "object") Object.values(x).forEach((y) => nombres(y, out));
  return out;
}

/** Liste des erreurs (vide = réponse acceptée), formulées pour la consigne de régénération. */
export function controlerSortie(texte: string, mode: "normal" | "crise", sources: Sources): string[] {
  const e: string[] = [];
  const t = normaliser(texte);
  const permis = nombres([sources.resultats, sources.profil, sources.messages]);
  for (const [brut, entier, decimales] of texte.matchAll(CHIFFRE_UNITE)) {
    const n = lire(decimales === undefined ? entier : `${entier}.${decimales}`);
    if (!permis.has(n)) e.push(`chiffre non sourcé : « ${brut.trim()} » ne vient d'aucun résultat d'outil de ce tour, ni du profil, ni d'un message de l'utilisateur`);
  }
  const trouve = (re: RegExp, quoi: string, s = t) => {
    const m = s.match(re);
    if (m) e.push(`${quoi} : « ${m[0].trim()} »`);
  };
  trouve(HYPOTHESE, "hypothèse de diagnostic sur la personne");
  trouve(POSOLOGIE, "posologie ou dose");
  trouve(CONFIDENTIALITE, "promesse de confidentialité");
  if (mode === "crise") {
    trouve(CRISE_SPORT, "lexique sportif ou nutritionnel en mode crise");
    trouve(CRISE_PC8, "technique, diagnostic ou formulation interdits en crise");
    trouve(CRISE_NUMEROS, "numéro de téléphone en mode crise (le code ajoute lui-même les ressources)");
  } else {
    trouve(NUMEROS, "numéro de téléphone autre que le 15 ou le 112", texte);
    for (const [, , num] of t.matchAll(APPEL))
      if (!donnees.numeros_permis.includes(num.replace(/\D/g, ""))) e.push(`numéro de téléphone autre que le 15 ou le 112 : « ${num.trim()} »`);
  }
  return [...new Set(e)];
}
