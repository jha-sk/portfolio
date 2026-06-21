import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIER, resolveTier, applyOverride } from '../src/lib/device-tier.js';

const base = {
  width: 1440, deviceMemory: 8, cores: 8,
  coarsePointer: false, saveData: false, reducedMotion: false, webgl: 'ok',
};

test('healthy desktop resolves to high', () => {
  assert.equal(resolveTier(base), TIER.HIGH);
});

test('phone width resolves to low', () => {
  assert.equal(resolveTier({ ...base, width: 390 }), TIER.LOW);
});

test('tablet width (768-1023) resolves to mid', () => {
  assert.equal(resolveTier({ ...base, width: 900, coarsePointer: true }), TIER.MID);
});

test('software webgl forces low even on a wide screen', () => {
  assert.equal(resolveTier({ ...base, webgl: 'software' }), TIER.LOW);
});

test('no webgl forces low', () => {
  assert.equal(resolveTier({ ...base, webgl: 'none' }), TIER.LOW);
});

test('reduced motion forces low', () => {
  assert.equal(resolveTier({ ...base, reducedMotion: true }), TIER.LOW);
});

test('save-data forces low', () => {
  assert.equal(resolveTier({ ...base, saveData: true }), TIER.LOW);
});

test('<=2GB memory forces low', () => {
  assert.equal(resolveTier({ ...base, deviceMemory: 2 }), TIER.LOW);
});

test('weak laptop (4 cores, wide) demotes high to mid', () => {
  assert.equal(resolveTier({ ...base, cores: 4 }), TIER.MID);
});

test('missing deviceMemory/cores (Safari/FF) still allows high on wide screens', () => {
  assert.equal(
    resolveTier({ ...base, deviceMemory: null, cores: null }),
    TIER.HIGH
  );
});

test('applyOverride: high forces high', () => {
  assert.equal(applyOverride(TIER.LOW, 'high', false), TIER.HIGH);
});

test('applyOverride: low forces low', () => {
  assert.equal(applyOverride(TIER.HIGH, 'low', false), TIER.LOW);
});

test('applyOverride: auto passes the resolved tier through', () => {
  assert.equal(applyOverride(TIER.MID, 'auto', false), TIER.MID);
});

test('applyOverride: reduced motion beats a high override (a11y wins)', () => {
  assert.equal(applyOverride(TIER.HIGH, 'high', true), TIER.LOW);
});
