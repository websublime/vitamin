import AxeBuilder from '@axe-core/playwright';
import { test } from 'playwright/test';
import { openReference, openSurface, readLog, type Spike, VARIANTS, writeResult } from './support.ts';

/** Target 8 (automated part): axe-core on every rendered fixture, plus the live-region and `aria-busy` rules. */

const FIXTURES = ['showcase', 'slots', 'streaming', 'focus', 'missing-name', 'unknown-type'];

async function axe(page: Parameters<typeof openSurface>[0]) {
  const result = await new AxeBuilder({ page }).include('#host').analyze();
  return {
    version: result.testEngine.version,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target),
    })),
    incomplete: result.incomplete.map((v) => v.id),
  };
}

test('axe-core and the live-region policy', async ({ page }) => {
  const results: Record<string, unknown> = {};
  for (const fixture of ['showcase', 'slots']) {
    await openReference(page, fixture);
    results[`reference/${fixture}`] = { axe: await axe(page) };
  }
  for (const variant of VARIANTS) {
    for (const fixture of FIXTURES) {
      await openSurface(page, variant, fixture);
      const live = await page.evaluate(() => {
        const { surface } = (globalThis as unknown as { spike: Spike }).spike;
        return {
          liveRegions: surface.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]').length,
          liveText: surface.live.textContent,
          busyLog: surface.busyLog,
          busyNow: surface.root.getAttribute('aria-busy'),
        };
      });
      const log = await readLog(page);
      results[`${variant}/${fixture}`] = {
        axe: await axe(page),
        ...live,
        errors: log.errors.map((e) => e.error.code),
        pageErrors: log.pageErrors,
      };
    }
  }
  writeResult('a11y', results);
});
