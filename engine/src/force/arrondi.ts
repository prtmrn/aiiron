// Arrondi au matériel disponible : knowledge/force/arrondi-charges.md
import type { Drapeau } from "./types";

// R1
export type Materiel =
  | { type: "barre"; barre_kg: number; increment_kg: number; max_kg?: number }
  | { type: "liste"; charges_kg: number[] }
  | { type: "pile"; min_kg: number; max_kg: number; pas_kg: number }
  | { type: "lest"; poids_corps_kg: number; increment_kg: number; max_lest_kg?: number };

// moteur-force.md, convention 3 : calculs en grammes entiers
const g = (kg: number) => Math.round(kg * 1000);
const kg = (grammes: number) => grammes / 1000;

type Grille = { origine: number; pas: number; max: number } | number[];

// R2 : charges disponibles, en grammes
function grille(m: Materiel): Grille {
  const borne = (o: number, pas: number, max: number) => ({ origine: o, pas, max: max === Infinity ? max : o + Math.floor((max - o) / pas) * pas });
  switch (m.type) {
    case "barre": return borne(g(m.barre_kg), g(m.increment_kg), m.max_kg === undefined ? Infinity : g(m.max_kg));
    case "pile": return borne(g(m.min_kg), g(m.pas_kg), g(m.max_kg));
    case "lest": return borne(0, g(m.increment_kg), m.max_lest_kg === undefined ? Infinity : g(m.max_lest_kg));
    case "liste": return [...new Set(m.charges_kg.map(g))].sort((a, b) => a - b);
  }
}

const minimum = (G: Grille) => (Array.isArray(G) ? G[0] : G.origine);
const maximum = (G: Grille) => (Array.isArray(G) ? G[G.length - 1] : G.max);

/** Plus grande charge disponible ≤ x (grammes), null si aucune. */
function plancher(x: number, G: Grille): number | null {
  if (x < minimum(G)) return null;
  if (Array.isArray(G)) return G.filter((c) => c <= x).pop()!;
  const y = Math.min(x, G.max);
  return G.origine + Math.floor((y - G.origine) / G.pas) * G.pas;
}

/** Plus petite charge disponible ≥ x (grammes), null si aucune. */
function plafond(x: number, G: Grille): number | null {
  if (x > maximum(G)) return null;
  if (Array.isArray(G)) return G.find((c) => c >= x)!;
  if (x <= G.origine) return G.origine;
  return G.origine + Math.ceil((x - G.origine) / G.pas) * G.pas;
}

/** R2, matériel borné seulement (sert aux tests de propriétés). */
export function chargesDisponibles(m: Materiel): number[] {
  const G = grille(m);
  if (Array.isArray(G)) return G.map(kg);
  if (G.max === Infinity) throw new Error("chargesDisponibles : matériel sans max_kg");
  const out: number[] = [];
  for (let c = G.origine; c <= G.max; c += G.pas) out.push(kg(c));
  return out;
}

/** R3 : au plus proche, sauf si le haut dépasse la cible de plus de 2,5 % ; égalité → bas. */
export function arrondirCharge(cible: number, m: Materiel): { charge: number; drapeaux: Drapeau[] } {
  const G = grille(m);
  const c = g(cible);
  if (c < minimum(G)) return { charge: kg(minimum(G)), drapeaux: ["CIBLE_SOUS_MINIMUM"] };
  if (c > maximum(G)) return { charge: kg(maximum(G)), drapeaux: ["CIBLE_AU_DESSUS_MAX"] };
  const bas = plancher(c, G)!;
  const haut = plafond(c, G)!;
  // 40 × écart ≤ cible ⇔ écart / cible ≤ 2,5 % (R3), en entiers
  const r = haut - c < c - bas && 40 * (haut - c) <= c ? haut : bas;
  // 20 × écart > cible ⇔ écart / cible > 5 % (R3)
  return { charge: kg(r), drapeaux: 20 * Math.abs(r - c) > c ? ["ECART_ARRONDI_IMPORTANT"] : [] };
}

/** R5 : plafond appliqué avant et après l'arrondi. */
export function arrondirSousPlafond(cible: number, plafondKg: number, m: Materiel): { charge: number; drapeaux: Drapeau[] } {
  const r = arrondirCharge(Math.min(cible, plafondKg), m);
  if (r.charge <= plafondKg) return r;
  const p = plancher(g(plafondKg), grille(m));
  return p === null ? r : { charge: kg(p), drapeaux: r.drapeaux };
}
