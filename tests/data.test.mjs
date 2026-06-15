// Data-shape test for the Career OS content architecture (Phase 01 Plan 02).
//
// Asserts (FND-07, D-01/D-02/D-03):
//   1. All six per-domain files + placeholders.js import without throwing.
//   2. KNOWN seed facts are present and are NOT marked as placeholders:
//        - identity name "Sourabh Jha"
//        - links github.com/jha-sk + linkedin.com/in/sk-jha + codewithsourabhjha@gmail.com
//        - the 11 seed skills
//        - the 4 seed project names
//   3. isPlaceholder() correctly flags TODO()-produced values and rejects facts.
//   4. A single grep for the TODO_ token finds every placeholder and nothing else.
//
// Uses ONLY the Node built-in test runner (node:test + node:assert).
// Run with: node --test tests/data.test.mjs
//
// RED before the data files exist: the dynamic imports below reject (module not
// found), so every test fails.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const toUrl = (rel) => 'file://' + join(dataDir, rel).replace(/\\/g, '/');

const SEED_SKILLS = [
  'Golang',
  'React',
  'Next.js',
  'Node.js',
  'Docker',
  'Kubernetes',
  'AWS',
  'Linux',
  'AEM',
  'Git',
  'DevOps',
];
const SEED_PROJECTS = [
  'Git Automation CLI',
  'DevOps Monitoring Dashboard',
  'AEM Automation Toolkit',
  'Cloud Infrastructure Projects',
];

test('all six per-domain files plus placeholders import without throwing', async () => {
  for (const f of [
    'identity.js',
    'stats.js',
    'projects.js',
    'skills.js',
    'experience.js',
    'links.js',
    'placeholders.js',
  ]) {
    const mod = await import(toUrl(f));
    assert.ok(mod, `${f} should import`);
    assert.ok(mod.default, `${f} should have a default export`);
  }
});

test('isPlaceholder flags TODO() markers and rejects known facts', async () => {
  const { TODO, isPlaceholder, TODO_TOKEN } = await import(toUrl('placeholders.js'));
  const marked = TODO('someUnknownField');
  assert.equal(isPlaceholder(marked), true, 'TODO() value must be a placeholder');
  assert.ok(marked.TODO.startsWith(TODO_TOKEN), 'marker carries the TODO_ token');
  for (const fact of ['Sourabh Jha', 42, null, undefined, {}, { foo: 1 }, []]) {
    assert.equal(isPlaceholder(fact), false, `${JSON.stringify(fact)} is not a placeholder`);
  }
});

test('identity seeds the known name and does not mark it a placeholder', async () => {
  const { identity } = await import(toUrl('identity.js'));
  const { isPlaceholder } = await import(toUrl('placeholders.js'));
  assert.equal(identity.name, 'Sourabh Jha');
  assert.equal(isPlaceholder(identity.name), false);
});

test('links seed the three known facts and are not placeholders', async () => {
  const { links } = await import(toUrl('links.js'));
  const { isPlaceholder } = await import(toUrl('placeholders.js'));
  assert.match(links.github, /github\.com\/jha-sk/);
  assert.match(links.linkedin, /linkedin\.com\/in\/sk-jha/);
  assert.equal(links.email, 'codewithsourabhjha@gmail.com');
  for (const v of [links.github, links.linkedin, links.email]) {
    assert.equal(isPlaceholder(v), false, 'known link is not a placeholder');
  }
});

test('skills seed all 11 known technology names', async () => {
  const { skills } = await import(toUrl('skills.js'));
  const { isPlaceholder } = await import(toUrl('placeholders.js'));
  const names = skills.map((s) => s.name);
  for (const skill of SEED_SKILLS) {
    assert.ok(names.includes(skill), `seed skill "${skill}" present`);
  }
  for (const s of skills) {
    assert.equal(isPlaceholder(s.name), false, `skill name "${s.name}" is a known fact`);
  }
});

test('projects seed all 4 known project names', async () => {
  const { projects } = await import(toUrl('projects.js'));
  const { isPlaceholder } = await import(toUrl('placeholders.js'));
  const names = projects.map((p) => p.name);
  for (const proj of SEED_PROJECTS) {
    assert.ok(names.includes(proj), `seed project "${proj}" present`);
  }
  for (const p of projects) {
    assert.equal(isPlaceholder(p.name), false, `project name "${p.name}" is a known fact`);
  }
});

test('stats seed five labelled metrics whose values are placeholders', async () => {
  const { stats } = await import(toUrl('stats.js'));
  const { isPlaceholder } = await import(toUrl('placeholders.js'));
  const labels = stats.map((s) => s.label);
  for (const label of [
    'Years of Experience',
    'Projects Built',
    'Technologies',
    'Repositories',
    'Open Source Contributions',
  ]) {
    assert.ok(labels.includes(label), `stat "${label}" present`);
  }
  for (const s of stats) {
    assert.equal(isPlaceholder(s.value), true, `stat "${s.label}" value is a placeholder`);
    assert.equal(isPlaceholder(s.label), false, `stat "${s.label}" label is a known fact`);
  }
});

test('experience entries carry placeholder role/timeline/achievements', async () => {
  const { experience } = await import(toUrl('experience.js'));
  const { isPlaceholder } = await import(toUrl('placeholders.js'));
  assert.ok(experience.length >= 1, 'at least one mission-log entry');
  for (const e of experience) {
    assert.equal(isPlaceholder(e.role), true, 'role is a placeholder');
    assert.equal(isPlaceholder(e.timeline), true, 'timeline is a placeholder');
    assert.equal(isPlaceholder(e.achievements), true, 'achievements are a placeholder');
  }
});

test('a single grep for the TODO_ token finds placeholders and nothing else', async () => {
  const { TODO_TOKEN, isPlaceholder } = await import(toUrl('placeholders.js'));
  // Sum every placeholder reachable from the exported data graph.
  const modules = await Promise.all(
    ['identity.js', 'stats.js', 'projects.js', 'skills.js', 'experience.js', 'links.js'].map(
      (f) => import(toUrl(f))
    )
  );
  let liveCount = 0;
  const walk = (v) => {
    if (isPlaceholder(v)) {
      liveCount += 1;
      assert.ok(v.TODO.includes(TODO_TOKEN), 'every placeholder carries the token');
      return;
    }
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  modules.forEach((m) => walk(m.default));
  assert.ok(liveCount > 0, 'data graph contains placeholders');

  // Static check of the source: placeholders are produced exclusively through
  // the TODO() factory (which stamps the single TODO_ token), not hand-rolled.
  // We strip line/block comments first so prose mentions of the token in file
  // headers (documentation) do not count as off-convention value literals.
  const stripComments = (s) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  let factoryCalls = 0;
  for (const f of readdirSync(dataDir)) {
    if (!f.endsWith('.js') || f === 'placeholders.js') continue;
    const code = stripComments(readFileSync(join(dataDir, f), 'utf8'));
    factoryCalls += (code.match(/\bTODO\(/g) || []).length;
    // Outside the TODO() factory, no data file may hand-roll the marker token
    // as a value literal — every placeholder must flow through the factory.
    const withoutFactory = code.replace(/\bTODO\(/g, '');
    assert.equal(
      withoutFactory.includes('TODO_'),
      false,
      `${f} must not hand-roll a bare TODO_ literal — use TODO()`
    );
  }
  assert.ok(factoryCalls > 0, 'placeholders are produced via the TODO() factory');
});
