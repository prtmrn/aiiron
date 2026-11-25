// Variantes et remises de contexte : knowledge/force/variantes-discounts.md

// R3 : coefficients d'initialisation (heuristiques de coach). Identifiants aiiron, pas encore reliés à data/exercises/.
export const COEFS_VARIANTES: Record<string, { base: string; coef: number }> = {
  squat_pause_2s: { base: "squat", coef: 0.9 },
  squat_tempo_3_1_0: { base: "squat", coef: 0.85 },
  squat_box: { base: "squat", coef: 0.95 },
  squat_pin: { base: "squat", coef: 0.85 },
  squat_avant: { base: "squat", coef: 0.8 },
  squat_avant_pause_2s: { base: "squat_avant", coef: 0.9 },
  squat_safety_bar: { base: "squat", coef: 0.9 },
  couche_pause_1s: { base: "couche", coef: 0.95 },
  couche_pause_3s: { base: "couche", coef: 0.9 },
  couche_prise_serree: { base: "couche", coef: 0.92 },
  couche_larsen: { base: "couche", coef: 0.92 },
  couche_spoto: { base: "couche", coef: 0.92 },
  couche_tempo_3_1_0: { base: "couche", coef: 0.85 },
  couche_incline_30: { base: "couche", coef: 0.8 },
  developpe_militaire: { base: "couche", coef: 0.6 },
  developpe_militaire_assis: { base: "developpe_militaire", coef: 0.95 },
  push_press: { base: "developpe_militaire", coef: 1 },
  sdt_deficit_5cm: { base: "souleve_de_terre", coef: 0.9 },
  sdt_pause_genou: { base: "souleve_de_terre", coef: 0.85 },
  sdt_tempo: { base: "souleve_de_terre", coef: 0.8 },
  sdt_roumain: { base: "souleve_de_terre", coef: 0.7 },
  sdt_blocs: { base: "souleve_de_terre", coef: 1 },
  souleve_de_terre_autre_style: { base: "souleve_de_terre", coef: 0.95 },
};

// R1 : profondeur maximale de la chaîne de bases
const PROFONDEUR_MAX = 3;
// R4 : bornes de la remise de contexte
const REMISE_MIN = 0.8;
const REMISE_MAX = 1;

/** R1 : e1RM de l'exercice ; initialisation paresseuse depuis la base, stockée dans les refs renvoyées. */
export function e1rmExercice(ex: string, refs: Record<string, number>, profondeur = 0): { e1rm: number | null; refs: Record<string, number> } {
  if (refs[ex] !== undefined) return { e1rm: refs[ex], refs };
  const v = COEFS_VARIANTES[ex];
  if (!v) return { e1rm: null, refs }; // R3 : séance d'étalonnage (e1rm.md R8)
  if (profondeur >= PROFONDEUR_MAX) throw new Error(`Chaîne de bases trop profonde ou cyclique : ${ex}`);
  const base = e1rmExercice(v.base, refs, profondeur + 1);
  if (base.e1rm === null) return base;
  const e1rm = base.e1rm * v.coef;
  return { e1rm, refs: { ...base.refs, [ex]: e1rm } };
}

/** R1 et R4 : e1RM effectif du slot = e1RM de l'exercice × remise de contexte. */
export function e1rmEffectif(e1rmEx: number, remise = 1): number {
  if (remise < REMISE_MIN || remise > REMISE_MAX) throw new Error(`remise_contexte hors [${REMISE_MIN} ; ${REMISE_MAX}] : ${remise}`);
  return e1rmEx * remise;
}
