/**
 * Weight unit conversion — framework-free (no React/Next imports) so it stays portable
 * (see docs/DECISIONS.md D11 and docs/ARCHITECTURE.md).
 *
 * Canonical storage unit is KILOGRAMS (see docs/DATA_MODEL.md). The UI shows POUNDS.
 * Keep all conversion in one place so dose math (mg/kg) stays correct.
 */

export const LBS_PER_KG = 2.2046226218;

/** Convert pounds (what the user enters/sees) to kilograms (what we store). */
export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG;
}

/** Convert kilograms (stored) to pounds (for display). */
export function kgToLbs(kg: number): number {
  return kg * LBS_PER_KG;
}

/** Round to a sensible number of decimals for display (default 1). */
export function roundTo(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
