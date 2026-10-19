import { test } from 'playwright/test';
import { openSurface, type Spike, VARIANTS, writeResult } from './support.ts';

/** Target 8 (automated part): no focus moves on agent updates, focus kept through stable ids, honest `aria-busy`. */

const STEPS = ['label text', 'sibling inserted before', 'own variant', 'reordered first'];

test('focus under agent updates', async ({ page }) => {
  const results: Record<string, unknown> = {};
  for (const variant of VARIANTS) {
    await openSurface(page, variant, 'focus', false);
    await page.evaluate(() => (globalThis as unknown as { spike: Spike }).spike.next());
    await page.locator('[data-a2ui-id="b"] button').focus();
    await page.evaluate(() => {
      Object.assign(document.activeElement as Element, { focusMark: 'b' });
    });
    const steps = [];
    for (const name of STEPS) {
      await page.evaluate(() => (globalThis as unknown as { spike: Spike }).spike.next());
      steps.push({
        step: name,
        ...(await page.evaluate(() => {
          const active = document.activeElement as (Element & { focusMark?: string }) | null;
          const inner = active?.shadowRoot?.activeElement;
          return {
            active: active?.localName ?? null,
            sameElement: active?.focusMark === 'b',
            innerButtonFocused: inner?.localName === 'button',
            label: active?.localName === 'line-button' ? (active.textContent?.trim() ?? null) : null,
          };
        })),
      });
    }
    results[`${variant}/focus-on-b`] = steps;

    await openSurface(page, variant, 'streaming', false);
    await page.locator('#outside').focus();
    const outside = [];
    while (await page.evaluate(() => (globalThis as unknown as { spike: Spike }).spike.next())) {
      outside.push(await page.evaluate(() => document.activeElement?.id ?? document.activeElement?.localName));
    }
    results[`${variant}/focus-outside`] = outside;
  }
  writeResult('focus', results);
});

test('aria-busy covers each batch', async ({ page }) => {
  const results: Record<string, unknown> = {};
  for (const variant of VARIANTS) {
    await openSurface(page, variant, 'streaming', false);
    const timeline = await page.evaluate(async () => {
      const { surface, next } = (globalThis as unknown as { spike: Spike }).spike;
      const start = performance.now();
      const events: { t: number; what: string }[] = [];
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          const busy = record.attributeName === 'aria-busy';
          const what = busy ? `aria-busy=${surface.root.getAttribute('aria-busy')}` : `${record.type}`;
          events.push({ t: Math.round(performance.now() - start), what });
        }
      });
      observer.observe(surface.root, { subtree: true, childList: true, attributes: true, characterData: true });
      while (await next());
      await new Promise((resolve) => setTimeout(resolve, 500));
      observer.disconnect();
      return events;
    });
    // A DOM change after `aria-busy=false` and before the next `aria-busy=true` escaped the busy window.
    let busy = false;
    let escaped = 0;
    for (const event of timeline) {
      if (event.what === 'aria-busy=true') busy = true;
      else if (event.what === 'aria-busy=false') busy = false;
      else if (!busy) escaped++;
    }
    results[variant] = {
      mutations: timeline.length,
      escapedMutations: escaped,
      batches: timeline.filter((e) => e.what === 'aria-busy=true').length,
    };
  }
  writeResult('busy', results);
});
