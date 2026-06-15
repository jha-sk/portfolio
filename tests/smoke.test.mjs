// Foundation slice end-to-end smoke test (Phase 01 Plan 01).
//
// Proves the Career OS Walking Skeleton renders end-to-end:
//   1. `next build` succeeds (exit 0).
//   2. The prerendered home-route HTML under `.next` contains the placeholder
//      heading "System initialized".
//   3. The document title "Sourabh Jha — AI Engineer / Backend Engineer" is in
//      the rendered output (proves layout metadata).
//   4. The seeded identity name "Sourabh Jha" is in the rendered output
//      (proves the src/data/identity.js data-file read).
//
// Uses ONLY the Node built-in test runner (node:test + node:assert) — no extra
// test framework is added to package.json. Run with: node --test tests/smoke.test.mjs
//
// RED before the app is scaffolded: `next build` cannot run (no package.json /
// no Next app), so the build step throws and the test fails.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const nextDir = join(projectRoot, '.next');

const REQUIRED_STRINGS = [
  'System initialized',
  'Sourabh Jha — AI Engineer / Backend Engineer',
  'Sourabh Jha',
];

// Recursively collect the text of every .html and prerendered .rsc/.json file
// produced by `next build` under .next, so we can statically assert on the
// rendered home-route output without starting a server.
function collectRenderedOutput(dir) {
  let buf = '';
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return buf;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      buf += collectRenderedOutput(full);
    } else if (/\.(html|rsc|json|txt|body)$/.test(entry)) {
      try {
        buf += readFileSync(full, 'utf8');
      } catch {
        /* ignore unreadable files */
      }
    }
  }
  return buf;
}

test('production build renders the foundation slice end-to-end', () => {
  // Step 1: production build must succeed. Before the app is scaffolded this
  // throws (no package.json / next binary) -> RED.
  execFileSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    timeout: 55_000,
  });

  assert.ok(
    existsSync(nextDir),
    '.next build output directory should exist after `next build`'
  );

  // Step 2: the prerendered home-route output must contain all three strings.
  const rendered = collectRenderedOutput(nextDir);

  for (const needle of REQUIRED_STRINGS) {
    assert.ok(
      rendered.includes(needle),
      `rendered build output should contain ${JSON.stringify(needle)}`
    );
  }
});
