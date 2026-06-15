/*
 * Career OS content data — the single greppable placeholder convention (D-03).
 *
 * One marker, one token. Every value in src/data/*.js that is not yet a known
 * fact is produced by TODO(label) and detected by isPlaceholder(value).
 *
 * Convention
 * ----------
 * A placeholder is a frozen object of the exact shape:
 *
 *     { __placeholder: true, TODO: 'TODO_<label>' }
 *
 * - `__placeholder: true` is the machine-readable flag isPlaceholder() checks.
 * - `TODO` is a human-readable, GREPPABLE string carrying the single token
 *   `TODO_` (e.g. `TODO_yearsOfExperience`). A single search finds them all:
 *
 *     grep -rn "TODO_" src/data
 *
 * This is the same `TODO_` token established in 01-01 (src/data/identity.js),
 * now formalized as a shared helper so v2 (CNT2-01) can fill every placeholder
 * by grepping one token. KNOWN facts are written as plain values and are NEVER
 * wrapped — so the grep returns placeholders and nothing else.
 *
 * The empty-state UI path (UI-SPEC Copywriting Contract) renders for any value
 * where isPlaceholder() is true, so the raw `TODO_` token never reaches a
 * visitor (threat T-02-02).
 */

/** The single greppable token. Searching this finds every placeholder. */
export const TODO_TOKEN = 'TODO_';

/**
 * Produce a placeholder value for an as-yet-unknown field.
 * @param {string} label - a short identifier, e.g. 'yearsOfExperience'.
 * @returns {{ __placeholder: true, TODO: string }} frozen placeholder marker.
 */
export function TODO(label) {
  return Object.freeze({
    __placeholder: true,
    TODO: `${TODO_TOKEN}${label}`,
  });
}

/**
 * Predicate: is this value an unfilled placeholder?
 * Returns true for markers created by TODO(); false for every known fact.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isPlaceholder(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.__placeholder === true
  );
}

const placeholders = { TODO, isPlaceholder, TODO_TOKEN };
export default placeholders;
