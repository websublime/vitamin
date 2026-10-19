import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { test } from 'playwright/test';
import { openSurface, outDir, readLog, type Spike, writeResult } from './support.ts';

/** Target 6: every `web_core` throw path ends as a valid A2UI `error` message, and the surface keeps working. */

const NODE_LEVEL = ['unknown-type', 'cycle-unvalidated'];

test('throw paths become A2UI error messages', async ({ page }) => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schema = JSON.parse(readFileSync(outDir('spec', 'client_to_server.json'), 'utf8'));
  const validate = ajv.compile(schema);

  await openSurface(page, 'b', 'showcase', false);
  const all = await page.evaluate(() => (globalThis as unknown as { spike: Spike }).spike.all);
  const names = [...all.filter((f) => f.throws).map((f) => f.name), ...NODE_LEVEL];

  const results: Record<string, unknown> = {};
  for (const variant of ['a', 'b']) {
    for (const name of names) {
      // `A2uiLitElement` exists only in technique (a).
      if (variant === 'b' && name === 'adapter-without-api') continue;
      await openSurface(page, variant, name);
      const log = await readLog(page);
      const dom = await page.evaluate(() => {
        const { surface } = (globalThis as unknown as { spike: Spike }).spike;
        return {
          text: surface.root.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          placeholders: [...surface.root.querySelectorAll('[data-line-a2ui-placeholder]')].map((el) =>
            el.getAttribute('data-line-a2ui-placeholder'),
          ),
          elements: surface.root.querySelectorAll('*').length,
        };
      });
      const meta = all.find((f) => f.name === name);
      results[`${variant}/${name}`] = {
        row: meta?.throws?.row ?? 'node-level (onError)',
        expected: meta?.throws?.code ?? null,
        errors: log.errors.map((message) => ({
          code: message.error.code,
          source: message.error.source,
          errorName: message.error.errorName,
          message: String(message.error.message).slice(0, 160),
          validA2uiError: validate(message),
        })),
        pageErrors: log.pageErrors,
        ...dom,
      };
    }
  }
  writeResult('throws', results);
});
