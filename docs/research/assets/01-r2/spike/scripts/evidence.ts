import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Condenses `out/results` into the small, text-first evidence set the research note cites (`out/evidence`). Run after
 * `bunx playwright test`. Results that match across browsers are stored once, with the browsers that match.
 */

// biome-ignore lint/suspicious/noExplicitAny: the checks own the result shapes; this script only reshapes them.
type Json = Record<string, any>;

const spike = resolve(import.meta.dir, '..');
const results = resolve(spike, 'out/results');
const evidence = resolve(spike, 'out/evidence');
const BROWSERS = ['chromium', 'firefox', 'webkit'];
const read = (name: string): Json => JSON.parse(readFileSync(resolve(results, name), 'utf8'));
const write = (name: string, data: unknown) =>
  writeFileSync(resolve(evidence, name), typeof data === 'string' ? data : `${JSON.stringify(data, null, 2)}\n`);
mkdirSync(evidence, { recursive: true });

/** Stores the Chromium value and lists the browsers whose value is identical. */
function perBrowser(values: Record<string, unknown>) {
  const base = JSON.stringify(values.chromium);
  const same = BROWSERS.filter((b) => JSON.stringify(values[b]) === base);
  const differing = Object.fromEntries(BROWSERS.filter((b) => !same.includes(b)).map((b) => [b, values[b]]));
  return { sameIn: same, value: values.chromium, ...(Object.keys(differing).length ? { differing } : {}) };
}

const render: Json = {};
const a11y: Json = {};
const focus: Json = {};
const busy: Json = {};
const throws: Json = {};
const bundle: Json = {};
const browsers: Json = {};
const cdp: Json = {};
let ariaText = '';
let cdpText = '';

for (const browser of BROWSERS) {
  const raw = read(`render-${browser}.json`);
  browsers[browser] = raw.browserVersion;
  render[browser] = {};
  for (const fixture of ['showcase', 'slots']) {
    const entry = raw[fixture];
    const reference = String(entry.reference.aria);
    ariaText += `## ${browser} / ${fixture} / reference\n${reference}\n\n`;
    if (browser === 'chromium') cdpText += `## ${fixture} / reference\n${entry.reference.cdp.join('\n')}\n\n`;
    if (browser === 'chromium') cdp[`${fixture}/reference`] = entry.reference.cdp.length;
    for (const variant of ['a', 'a-contents', 'b', 'a-shadow']) {
      const v = entry[variant];
      const slots = v.slots.flatMap((owner: Json) =>
        owner.slots.map((slot: Json) => ({ owner: owner.owner, ...slot })),
      );
      const parts = v.parts.flatMap((el: Json) => el.results);
      // The surface adds one live region; everything else should match the hand-written page.
      const ariaBody = String(v.aria)
        .split('\n')
        .filter((line) => !line.startsWith('- status'))
        .join('\n');
      ariaText += `## ${browser} / ${fixture} / ${variant}\n${v.aria}\n\n`;
      render[browser][`${fixture}/${variant}`] = {
        slots: `${slots.filter((s: Json) => s.sameNodes).length}/${slots.length} same nodes, ${slots.filter((s: Json) => s.sameIds).length}/${slots.length} same ids`,
        slotMismatches: slots
          .filter((s: Json) => !s.sameNodes)
          .map((s: Json) => `${s.owner} ${s.slot}: ${s.reference.join(' ')} → ${s.candidate.join(' ') || '(empty)'}`),
        layoutDiffs: v.layoutDiffs?.map((d: Json) => `${d.key} <${d.tag}> dx=${d.dx} dy=${d.dy} dw=${d.dw} dh=${d.dh}`),
        partsApplied: `${parts.filter((p: Json) => p.applied).length}/${parts.length}`,
        ariaSnapshotEqualsReference: ariaBody === reference,
      };
      if (browser === 'chromium') {
        const lines: string[] = v.cdp;
        cdpText += `## ${fixture} / ${variant}\n${lines.join('\n')}\n\n`;
        cdp[`${fixture}/${variant}`] = {
          nodes: lines.length,
          generic: lines.filter((l) => l.trim() === 'generic').length,
        };
      }
    }
  }

  const rawA11y = read(`a11y-${browser}.json`);
  a11y[browser] = Object.fromEntries(
    Object.entries(rawA11y).map(([key, v]: [string, Json]) => [
      key,
      {
        violations: v.axe.violations.map((x: Json) => `${x.id} (${x.impact}) ×${x.nodes}`),
        incomplete: v.axe.incomplete,
        liveRegions: v.liveRegions,
        liveText: v.liveText,
        busyAfter: v.busyNow,
        errors: v.errors,
      },
    ]),
  );
  a11y.axeVersion = rawA11y['a/showcase'].axe.version;
  focus[browser] = read(`focus-${browser}.json`);
  busy[browser] = read(`busy-${browser}.json`);
  throws[browser] = Object.fromEntries(
    Object.entries(read(`throws-${browser}.json`)).map(([key, v]: [string, Json]) => [
      key,
      {
        row: v.row,
        expected: v.expected,
        raised: v.errors.map((e: Json) => `${e.code} via ${e.source}`),
        allValidA2uiErrors: v.errors.every((e: Json) => e.validA2uiError),
        firstMessage: v.errors[0]?.message ?? null,
        pageErrors: v.pageErrors.length,
        textAfter: v.text,
        placeholders: v.placeholders,
      },
    ]),
  );
  bundle[browser] = Object.fromEntries(
    Object.entries(read(`bundle-${browser}.json`)).map(([variant, v]: [string, Json]) => [
      variant,
      {
        defined: [...v.defined].sort(),
        initialGzip: v.initialGzip,
        loadedGzip: v.loadedGzip,
        builtGzip: v.builtGzip,
        chunks: v.chunks.map(
          (c: Json) =>
            `${c.file} ${c.gzip} B${c.initial ? ' initial' : ''}${c.loaded ? ' loaded' : ''}${c.dynamicEntry ? ' import()' : ''}${c.defines.length ? ` defines ${c.defines.join(',')}` : ''}`,
        ),
        owners: v.owners,
      },
    ]),
  );
}

const screenshots: Json = {};
for (const name of ['reference', 'a', 'a-contents', 'b']) {
  const png = resolve(spike, `out/screens/showcase-${name}.png`);
  if (!existsSync(png)) continue;
  screenshots[name] = createHash('sha256').update(readFileSync(png)).digest('hex').slice(0, 16);
  if (name === 'reference' || name === 'a') copyFileSync(png, resolve(evidence, `showcase-${name}.png`));
}

write('summary.json', {
  browsers,
  render: Object.fromEntries(
    Object.keys(render.chromium).map((key) => [
      key,
      perBrowser(Object.fromEntries(BROWSERS.map((b) => [b, render[b][key]]))),
    ]),
  ),
  cdpChromium: cdp,
  a11y: { axeVersion: a11y.axeVersion, ...perBrowser(a11y) },
  focus: perBrowser(focus),
  busy: perBrowser(busy),
  throws: perBrowser(throws),
  bundle: perBrowser(bundle),
  screenshotSha256: screenshots,
});
write('aria-snapshots.txt', ariaText);
write('cdp-tree-chromium.txt', cdpText);
write('catalog.json', read('catalog.json'));
write('line-catalog.emitted.json', read('line-catalog.emitted.json'));
for (const variant of ['a', 'b', 'a-eager']) {
  copyFileSync(resolve(spike, `out/dist/${variant}/chunk-report.json`), resolve(evidence, `chunks-${variant}.json`));
}
console.info(`evidence written to ${evidence}`);
