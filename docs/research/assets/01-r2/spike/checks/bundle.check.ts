import { readFileSync } from 'node:fs';
import { expect, test } from 'playwright/test';
import { outDir, writeResult } from './support.ts';

/** Targets 5 and 9: what a one-button page loads and defines, per technique, from the Vite 8 build. */

interface Chunk {
  file: string;
  entry: boolean;
  dynamicEntry: boolean;
  imports: string[];
  gzip: number;
  bytes: number;
  defines: string[];
  owners: Record<string, { rendered: number; gzipAlone: number | null }>;
}

// Spike files fold into two groups; packages keep their names.
function group(owner: string): string {
  if (!owner.startsWith('spike:')) return owner;
  return owner.includes('/components/') ? 'spike: line-* components' : 'spike: surface, session, catalogs';
}

test('one-button page: chunks, defines and weight', async ({ page }) => {
  const results: Record<string, unknown> = {};
  for (const variant of ['a', 'b', 'a-eager']) {
    const chunks: Chunk[] = JSON.parse(readFileSync(outDir('dist', variant, 'chunk-report.json'), 'utf8'));
    const byFile = new Map(chunks.map((c) => [c.file, c]));
    const requested: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith('.js')) requested.push(url.pathname.replace(`/${variant}/`, ''));
    });
    await page.goto(`http://127.0.0.1:4332/${variant}/pages/bundle-${variant}.html`);
    await page.waitForSelector('body[data-ready]');
    await page.waitForTimeout(300);
    page.removeAllListeners('request');
    expect(await page.locator('#host').textContent()).toContain('Only');

    // Statically imported chunks evaluate before the entry's own `define-log` import, so the check asks the registry.
    const candidates = [...new Set(['line-a2ui-surface', ...chunks.flatMap((c) => c.defines)])];
    const defined = await page.evaluate((tags) => tags.filter((tag) => customElements.get(tag)), candidates);

    // The entry chunk and its static imports load before any `load()` runs.
    const initial = new Set<string>();
    const visit = (file: string) => {
      if (initial.has(file)) return;
      initial.add(file);
      for (const next of byFile.get(file)?.imports ?? []) visit(next);
    };
    for (const chunk of chunks.filter((c) => c.entry)) visit(chunk.file);

    const loaded = chunks.filter((c) => requested.includes(c.file));
    const owners: Record<string, { rendered: number; gzipAlone: number }> = {};
    for (const chunk of loaded) {
      for (const [name, { rendered, gzipAlone }] of Object.entries(chunk.owners)) {
        const key = group(name);
        owners[key] ??= { rendered: 0, gzipAlone: 0 };
        owners[key].rendered += rendered;
        owners[key].gzipAlone += gzipAlone ?? 0;
      }
    }
    results[variant] = {
      defined,
      initialGzip: [...initial].reduce((sum, file) => sum + (byFile.get(file)?.gzip ?? 0), 0),
      loadedGzip: loaded.reduce((sum, c) => sum + c.gzip, 0),
      loadedBytes: loaded.reduce((sum, c) => sum + c.bytes, 0),
      builtGzip: chunks.reduce((sum, c) => sum + c.gzip, 0),
      chunks: chunks.map((c) => ({
        file: c.file,
        initial: initial.has(c.file),
        loaded: requested.includes(c.file),
        dynamicEntry: c.dynamicEntry,
        gzip: c.gzip,
        defines: c.defines,
      })),
      owners,
    };
  }
  writeResult('bundle', results);
});
