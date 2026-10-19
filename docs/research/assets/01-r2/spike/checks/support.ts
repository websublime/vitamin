import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { type Page, test } from 'playwright/test';

/** The page-side API `src/harness.ts` exposes. */
export interface Spike {
  runAll(): Promise<void>;
  next(): Promise<boolean>;
  log: {
    errors: { version: string; error: Record<string, unknown> }[];
    actions: unknown[];
    defines: string[];
    pageErrors: string[];
  };
  surface: HTMLElement & { root: HTMLElement; live: HTMLElement; busyLog: string[] };
  all: { name: string; throws?: { row: string; step: number; code: string }; api?: string }[];
}

export const VARIANTS = ['a', 'a-contents', 'b'] as const;

/** `out/` next to the spike's Playwright config. */
export function outDir(...parts: string[]): string {
  const root = dirname(test.info().config.configFile ?? `${process.cwd()}/playwright.config.ts`);
  return resolve(root, 'out', ...parts);
}

export function writeResult(name: string, data: unknown) {
  const file = outDir('results', `${name}-${test.info().project.name}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

/** Opens the harness for one technique and fixture, and feeds every step unless `run` is false. */
export async function openSurface(page: Page, variant: string, fixture: string, run = true) {
  await page.goto(`/pages/surface.html?v=${variant}&fixture=${fixture}`);
  await page.waitForSelector('body[data-ready]');
  if (run) await page.evaluate(() => (globalThis as unknown as { spike: Spike }).spike.runAll());
  // The live region writes its text 100 ms after the batch.
  await page.waitForTimeout(250);
}

export async function openReference(page: Page, fixture: string) {
  await page.goto(`/pages/reference.html?fixture=${fixture}`);
  await page.waitForSelector('body[data-ready]');
}

/** Reads the harness log. */
export function readLog(page: Page) {
  return page.evaluate(() => (globalThis as unknown as { spike: Spike }).spike.log);
}

/**
 * The Chromium accessibility tree below `main`, from CDP. Ignored nodes and inline text boxes are skipped, and their
 * children move up one level.
 */
export async function cdpTree(page: Page): Promise<string[]> {
  const client = await page.context().newCDPSession(page);
  const { nodes } = await client.send('Accessibility.getFullAXTree');
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const lines: string[] = [];
  const walk = (id: string, depth: number, inside: boolean) => {
    const node = byId.get(id);
    const role = String(node?.role?.value ?? '');
    const enter = inside || role === 'main';
    const keep = enter && !node?.ignored && role !== 'InlineTextBox';
    const name = node?.name?.value ? ` "${node.name.value}"` : '';
    if (keep) lines.push(`${'  '.repeat(depth)}${role}${name}`);
    for (const child of node?.childIds ?? []) walk(child, keep ? depth + 1 : depth, enter);
  };
  walk(nodes[0].nodeId, 0, false);
  await client.detach();
  return lines;
}
