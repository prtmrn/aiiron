/// <reference types="vite/client" />
// Format des conversations de test : evals/README.md. Vérifie la forme des fichiers, pas le comportement d'aiiron.
import { load } from "js-yaml";
import { describe, expect, it } from "vitest";

// Lecture par Vite (texte brut), sans dépendre des types Node
const textes = import.meta.glob<string>("../../../evals/*.yaml", { query: "?raw", import: "default", eager: true });
const fichiers = Object.keys(textes).map((chemin) => [chemin.split("/").pop()!, textes[chemin]] as const);
const CATEGORIES = ["douleur", "crise", "hors_sujet", "log_ambigu", "force"];

/** README : un « (?i) » en tête = insensible à la casse ; le runner le retire et ajoute le drapeau i. */
function compilerMotif(motif: string): RegExp {
  return motif.startsWith("(?i)") ? new RegExp(motif.slice(4), "i") : new RegExp(motif);
}

/** Tous les motifs_requis / motifs_interdits, où qu'ils soient dans le fichier. */
function motifs(noeud: unknown, chemin = ""): [string, unknown][] {
  if (Array.isArray(noeud)) return noeud.flatMap((n, i) => motifs(n, `${chemin}[${i}]`));
  if (noeud === null || typeof noeud !== "object") return [];
  return Object.entries(noeud).flatMap(([k, v]) =>
    k === "motifs_requis" || k === "motifs_interdits" ? [[`${chemin}.${k}`, v] as [string, unknown]] : motifs(v, `${chemin}.${k}`),
  );
}

it("compilerMotif : (?i) en tête devient le drapeau i", () => {
  expect(compilerMotif("(?i)médecin").test("MÉDECIN")).toBe(true);
  expect(compilerMotif("médecin").test("MÉDECIN")).toBe(false);
  expect(() => compilerMotif("a(?i)b")).toThrow(); // (?i) ailleurs qu'en tête : invalide en JavaScript
});

it("au moins un fichier d'évaluation, et des motifs trouvés", () => {
  expect(fichiers.length).toBeGreaterThan(0);
  expect(fichiers.flatMap(([, t]) => motifs(load(t))).length).toBeGreaterThan(0);
});

describe.each(fichiers)("%s", (fichier, texte) => {
  const doc = load(texte) as Record<string, unknown>;

  it("champs obligatoires", () => {
    expect(doc.id).toBe(fichier.replace(/\.yaml$/, ""));
    expect(CATEGORIES).toContain(doc.categorie);
    expect(typeof doc.titre === "string" && doc.titre.length > 0).toBe(true);
    expect(typeof doc.statut).toBe("string");
    expect(Array.isArray(doc.limites)).toBe(true);
    expect(typeof doc.critique).toBe("boolean");
    expect(doc.contexte).toBeTypeOf("object");
    expect(doc.contexte).not.toBeNull();
    expect(Array.isArray(doc.tours) && doc.tours.length > 0).toBe(true);
    for (const t of doc.tours as Record<string, unknown>[]) {
      expect(typeof t.utilisateur === "string" && t.utilisateur.length > 0).toBe(true);
      expect(t.attendu).toBeTypeOf("object");
      expect(t.attendu).not.toBeNull();
    }
  });

  it("motifs : listes de regex qui compilent, sans \\b collé à une lettre accentuée", () => {
    for (const [chemin, liste] of motifs(doc)) {
      expect(Array.isArray(liste), chemin).toBe(true);
      for (const m of liste as unknown[]) {
        expect(typeof m, `${chemin} : ${m}`).toBe("string");
        expect(() => compilerMotif(m as string), `${chemin} : ${m}`).not.toThrow();
        expect(/\\b[À-ÖØ-öø-ÿ]|[À-ÖØ-öø-ÿ]\\b/.test(m as string), `${chemin} : ${m}`).toBe(false);
      }
    }
  });
});
