/**
 * Roles default pairs — visual tier (P12, spec §6.P.12, AM-035, AM-047).
 *
 * Screenshots the `Design System/Roles` story `Toolbar` for each of the 31
 * `ACCENT_HUES` with its auto-paired gray, in light and dark: 62 baselines.
 * Only the `accent` global is set, so the `defaults.css` auto pair applies.
 * Runs in the "Browser tier" step and gates the merge.
 *
 * @module __tests__/visual/roles.visual
 */

import { ACCENT_HUES } from '@websublime/line-schemas';
import { test } from 'playwright/test';
import { expectStoryScreenshot } from './story';

const STORY_ID = 'design-system-roles--toolbar';

/** The story's `mode` arg values, the CSS `color-scheme` keywords. */
const MODES = ['light', 'dark'] as const;

for (const accent of ACCENT_HUES) {
  for (const mode of MODES) {
    test(`toolbar ${accent} auto ${mode}`, async ({ page }) => {
      await expectStoryScreenshot(page, STORY_ID, {
        globals: `accent:${accent}`,
        args: `mode:${mode}`,
        name: `toolbar-${accent}-auto-${mode}.png`,
      });
    });
  }
}
