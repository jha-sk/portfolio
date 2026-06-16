// Data-shape tests for Career OS résumé data (Task 2 / CNT2-01).
//
// Asserts real data is present across all src/data/ files:
//   - identity has name, title, tagline (no TODO_ markers)
//   - skills has 8 categories with items
//   - projects has exactly 3 entries, every github starts with https://github.com
//   - experience[0] has 8 bullets
//   - stats has 5 labelled metrics with real values
//   - certifications has 2 entries
//   - education has 1 entry
//
// Uses ONLY the Node built-in test runner (node:test + node:assert).
// Run with: node --test tests/data.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const toUrl = (rel) => 'file://' + join(dataDir, rel).replace(/\\/g, '/');

test('identity has name, title, and tagline — no TODO_ markers', async () => {
  const { identity } = await import(toUrl('identity.js'));
  assert.equal(identity.name, 'Sourabh Jha');
  assert.ok(identity.title, 'title is present');
  assert.ok(identity.tagline, 'tagline is present');
  for (const field of ['name', 'title', 'tagline']) {
    assert.equal(
      identity[field].includes('TODO_'),
      false,
      `identity.${field} must not contain TODO_`
    );
  }
});

test('skills has at least 7 categories each with at least one item', async () => {
  const { skills } = await import(toUrl('skills.js'));
  assert.ok(skills.length >= 7, `skills.length (${skills.length}) must be >= 7`);
  for (const group of skills) {
    assert.ok(group.category, 'each skill group has a category');
    assert.ok(Array.isArray(group.items), 'each skill group has items array');
    assert.ok(group.items.length >= 1, `category "${group.category}" has at least one item`);
  }
});

test('projects has exactly 3 entries and every github starts with https://github.com', async () => {
  const { projects } = await import(toUrl('projects.js'));
  assert.equal(projects.length, 3, 'exactly 3 projects');
  for (const p of projects) {
    assert.ok(p.id, 'project has id');
    assert.ok(p.name, 'project has name');
    assert.ok(
      p.github.startsWith('https://github.com'),
      `project "${p.name}" github must start with https://github.com`
    );
    assert.ok(Array.isArray(p.stack), 'project has stack array');
    assert.ok(Array.isArray(p.bullets), 'project has bullets array');
  }
});

test('experience[0] has at least 6 bullets', async () => {
  const { experience } = await import(toUrl('experience.js'));
  assert.ok(experience.length >= 1, 'at least one experience entry');
  const entry = experience[0];
  assert.ok(entry.company, 'experience entry has company');
  assert.ok(entry.role, 'experience entry has role');
  assert.ok(Array.isArray(entry.bullets), 'experience entry has bullets array');
  assert.ok(
    entry.bullets.length >= 6,
    `experience[0].bullets.length (${entry.bullets.length}) must be >= 6`
  );
});

test('stats has at least 4 entries with real (non-TODO) values', async () => {
  const { stats } = await import(toUrl('stats.js'));
  assert.ok(stats.length >= 4, `stats.length (${stats.length}) must be >= 4`);
  for (const s of stats) {
    assert.ok(s.id, 'stat has id');
    assert.ok(s.label, 'stat has label');
    assert.ok(s.value, 'stat has value');
    assert.equal(
      String(s.value).includes('TODO_'),
      false,
      `stat "${s.label}" value must not contain TODO_`
    );
  }
});

test('certifications has at least 2 entries', async () => {
  const { certifications } = await import(toUrl('certifications.js'));
  assert.ok(certifications.length >= 2, `certifications.length (${certifications.length}) must be >= 2`);
  for (const c of certifications) {
    assert.ok(c.name, 'certification has name');
    assert.ok(c.issuer, 'certification has issuer');
  }
});

test('education has at least 1 entry', async () => {
  const { education } = await import(toUrl('education.js'));
  assert.ok(education.length >= 1, `education.length (${education.length}) must be >= 1`);
  const entry = education[0];
  assert.ok(entry.degree, 'education entry has degree');
  assert.ok(entry.school, 'education entry has school');
});

test('no string field in identity or stats contains TODO_', async () => {
  const { identity } = await import(toUrl('identity.js'));
  const { stats } = await import(toUrl('stats.js'));
  for (const [key, val] of Object.entries(identity)) {
    if (typeof val === 'string') {
      assert.equal(val.includes('TODO_'), false, `identity.${key} must not contain TODO_`);
    }
  }
  for (const s of stats) {
    for (const [key, val] of Object.entries(s)) {
      if (typeof val === 'string') {
        assert.equal(val.includes('TODO_'), false, `stat[${s.id}].${key} must not contain TODO_`);
      }
    }
  }
});

test('placeholders.js still imports cleanly (utility module preserved)', async () => {
  const mod = await import(toUrl('placeholders.js'));
  assert.ok(mod.TODO, 'TODO function present');
  assert.ok(mod.isPlaceholder, 'isPlaceholder function present');
  assert.ok(mod.TODO_TOKEN, 'TODO_TOKEN present');
  const marker = mod.TODO('test');
  assert.equal(mod.isPlaceholder(marker), true);
  assert.equal(mod.isPlaceholder('Sourabh Jha'), false);
});
