/*
 * Career OS content data — identity (D-01 / D-02).
 *
 * Per-domain data file under src/data/. Each later phase imports only the file
 * it needs. This file holds KNOWN facts (no placeholder marker) from PROJECT.md.
 *
 * Placeholder convention (D-03): any value that is not yet known is written as a
 * string prefixed with `TODO_` (e.g. `TODO_yearsOfExperience`) and/or carries a
 * `placeholder: true` flag on its object. This makes every unfilled value
 * trivially greppable (`grep -r "TODO_" src/data`) when filling real data in v2
 * (CNT2-01). The three fields below are KNOWN and therefore unmarked.
 */
export const identity = {
  name: 'Sourabh Jha',
  title: 'AI Engineer | Backend Engineer',
  tagline: 'Building scalable systems — backend foundations and AI on top.',
};

export default identity;
