// Guards the responsive breakpoint contract. The Tailwind config overrides
// `theme.screens`, which silently drops any default breakpoint not re-declared.
// `skills.jsx` relies on `sm:` — assert it exists so the class is generated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import cfg from '../tailwind.config.js';

test('tailwind screens declare xs, sm, md, lg, xl', () => {
  const screens = cfg.theme.screens;
  assert.equal(screens.xs, '480px', 'xs breakpoint must be 480px');
  assert.equal(screens.sm, '640px', 'sm breakpoint must be 640px (skills.jsx uses sm:)');
  assert.equal(screens.md, '768px');
  assert.equal(screens.lg, '1024px');
  assert.equal(screens.xl, '1280px');
});
