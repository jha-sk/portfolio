/**
 * device-tier — pure, framework-free tier resolution for the Career OS hero.
 *
 * Three tiers gate how heavy an experience the visitor receives:
 *   low  → static fallback (no WebGL)
 *   mid  → stripped-down live 3D
 *   high → full 3D scene
 *
 * resolveTier() is a pure function of a `signals` object so it is unit-testable
 * in Node with no DOM. The React hook (use-device-tier.js) supplies real signals.
 */

export const TIER = { LOW: 'low', MID: 'mid', HIGH: 'high' };
export const QUALITY_PREF = { LOW: 'low', AUTO: 'auto', HIGH: 'high' };
export const QUALITY_STORAGE_KEY = 'careeros:quality';

/**
 * @param {object} s
 * @param {number|null} s.width           viewport width in px
 * @param {number|null} s.deviceMemory    navigator.deviceMemory (GB) or null
 * @param {number|null} s.cores           navigator.hardwareConcurrency or null
 * @param {boolean}     s.coarsePointer   (pointer: coarse) matches
 * @param {boolean}     s.saveData        navigator.connection.saveData
 * @param {boolean}     s.reducedMotion   prefers-reduced-motion: reduce
 * @param {'ok'|'software'|'none'} s.webgl WebGL probe result
 * @returns {'low'|'mid'|'high'}
 */
export function resolveTier(s) {
  const lowMem = s.deviceMemory != null && s.deviceMemory <= 2;
  const reducedMem = s.deviceMemory != null && s.deviceMemory <= 4;
  const lowCores = s.cores != null && s.cores <= 4;
  const narrow = s.width != null && s.width <= 768;
  const wide = s.width != null && s.width >= 1024;

  if (
    s.reducedMotion ||
    s.saveData ||
    s.webgl === 'none' ||
    s.webgl === 'software' ||
    narrow ||
    lowMem
  ) {
    return TIER.LOW;
  }

  if (wide && !s.coarsePointer && !reducedMem && !lowCores) {
    return TIER.HIGH;
  }

  return TIER.MID;
}

/**
 * Clamp a resolved tier by the user's manual preference. Reduced motion always
 * wins (accessibility) — even a 'high' override falls back to low.
 * @param {'low'|'mid'|'high'} tier
 * @param {'low'|'auto'|'high'} quality
 * @param {boolean} reducedMotion
 */
export function applyOverride(tier, quality, reducedMotion) {
  if (reducedMotion) return TIER.LOW;
  if (quality === QUALITY_PREF.HIGH) return TIER.HIGH;
  if (quality === QUALITY_PREF.LOW) return TIER.LOW;
  return tier;
}
