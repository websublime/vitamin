/**
 * Roles off pairs — visual tier (P12, spec §6.P.12, AM-035, AM-047).
 *
 * Declares the `Design System/Roles` story `Toolbar` for every accent, gray
 * and mode, with the gray set explicitly: 31 × 6 × 2 = 372 tests. A
 * worker-scoped fixture finds each accent's auto pair from the computed
 * cascade, and that pair's tests skip, so 310 take a screenshot. Runs only
 * under `LINE_VISUAL_OFF_PAIRS` (`visual-off-pairs.yml`) and gates no PR.
 *
 * @module __tests__/visual/roles.off-pairs.visual
 */

import { ACCENT_HUES, type AccentHue, GRAY_HUES, type GrayHue } from '@websublime/line-schemas';
import { test as base, expect } from 'playwright/test';
import { expectStoryScreenshot } from './story';

const STORY_ID = 'design-system-roles--toolbar';
const STORYBOOK_ORIGIN = 'http://127.0.0.1:4320';

/** The story's `mode` arg values, the CSS `color-scheme` keywords. */
const MODES = ['light', 'dark'] as const;

/** The 12 solid steps of a gray scale. */
const STEPS = Array.from({ length: 12 }, (_, index) => index + 1);

const test = base.extend<Record<never, never>, { autoPairs: ReadonlyMap<AccentHue, GrayHue> }>({
  // Maps each accent to the one gray whose steps equal `--line-gray-*` when only the accent is set.
  autoPairs: [
    async ({ browser }, use) => {
      const page = await browser.newPage();
      const pairs = new Map<AccentHue, GrayHue>();
      for (const accent of ACCENT_HUES) {
        await page.goto(`${STORYBOOK_ORIGIN}/iframe.html?id=${STORY_ID}&viewMode=story&globals=accent:${accent}`);
        await expect(page.locator('html')).toHaveAttribute('data-accent', accent);
        const values = await page.evaluate(
          ({ grays, steps }) => {
            const style = getComputedStyle(document.documentElement);
            const read = (name: string) => steps.map((step) => style.getPropertyValue(`--line-${name}-${step}`).trim());
            return { auto: read('gray'), grays: Object.fromEntries(grays.map((gray) => [gray, read(gray)])) };
          },
          { grays: [...GRAY_HUES], steps: STEPS },
        );
        const matches = GRAY_HUES.filter((gray) =>
          values.grays[gray]?.every((value, index) => value !== '' && value === values.auto[index]),
        );
        if (matches.length !== 1) {
          throw new Error(
            `Accent "${accent}" auto-pairs to ${matches.length} grays (${matches.join(', ') || 'none'}); expected exactly one`,
          );
        }
        pairs.set(accent, matches[0] as GrayHue);
      }
      await page.close();
      await use(pairs);
    },
    { scope: 'worker' },
  ],
});

for (const accent of ACCENT_HUES) {
  for (const gray of GRAY_HUES) {
    for (const mode of MODES) {
      test(`toolbar ${accent} ${gray} ${mode}`, async ({ page, autoPairs }) => {
        test.skip(autoPairs.get(accent) === gray, 'default pair, covered by roles.visual.ts');
        await expectStoryScreenshot(page, STORY_ID, {
          globals: `accent:${accent};gray:${gray}`,
          args: `mode:${mode}`,
          name: `toolbar-${accent}-${gray}-${mode}.png`,
        });
      });
    }
  }
}
