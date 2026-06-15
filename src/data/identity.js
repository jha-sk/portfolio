/*
 * Career OS content data — identity (D-01 / D-02).
 *
 * Per-domain data file under src/data/. Each later phase imports only the file
 * it needs. This file holds KNOWN facts (no placeholder marker) from PROJECT.md.
 *
 * Placeholder convention (D-03) is now formalized in ./placeholders.js
 * (TODO(label) / isPlaceholder) and documented in ./README.md. Any unknown value
 * is produced by TODO() and is greppable via the single token `TODO_`. The three
 * fields below are KNOWN and therefore unmarked.
 */
export const identity = {
  name: 'Sourabh Jha',
  title: 'AI Engineer | Backend Engineer',
  tagline: 'Building scalable systems — backend foundations and AI on top.',
};

export default identity;
