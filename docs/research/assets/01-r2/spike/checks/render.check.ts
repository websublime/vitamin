import { expect, type Page, test } from 'playwright/test';
import { cdpTree, openReference, openSurface, outDir, readLog, VARIANTS, writeResult } from './support.ts';

/** Targets 1–4: slot assignment, layout, the accessibility tree and document `::part()` reach. */

interface SlotOwner {
  owner: string;
  slots: { name: string; assigned: string[] }[];
}

interface Box {
  key: string;
  tag: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Page-side. Walks into adapter shadow roots too, for the shadow-root control.
function slotsInPage(): SlotOwner[] {
  const host = document.querySelector('#host') as Element;
  const deep = (root: ParentNode, selector: string): Element[] =>
    [...root.querySelectorAll('*')].flatMap((el) => [
      ...(el.matches(selector) ? [el] : []),
      ...(el.hasAttribute('data-line-a2ui-adapter') && el.shadowRoot ? deep(el.shadowRoot, selector) : []),
    ]);
  const idOf = (el: Element) => {
    let node: Node | null = el;
    while (node) {
      if (node instanceof Element && node.hasAttribute('data-a2ui-id')) return node.getAttribute('data-a2ui-id');
      node = node instanceof ShadowRoot ? node.host : node.parentNode;
    }
    return '';
  };
  const describe = (node: Node) => {
    if (!(node instanceof Element)) return `"${node.textContent?.trim()}"`;
    const id = node.getAttribute('data-a2ui-id');
    const role = node.getAttribute('role');
    return `${node.localName}${id ? `#${id}` : ''}${role ? `[role=${role}]` : ''}`;
  };
  return deep(host, 'line-button, line-stack').map((el) => ({
    owner: `${el.localName}#${idOf(el)}`,
    slots: [...(el.shadowRoot?.querySelectorAll('slot') ?? [])].map((slot) => ({
      name: slot.name || 'default',
      assigned: slot
        .assignedNodes()
        .filter((node) => node instanceof Element || node.textContent?.trim())
        .map(describe),
    })),
  }));
}

function boxesInPage(): Box[] {
  const host = document.querySelector('#host') as Element;
  const origin = host.getBoundingClientRect();
  const seen: Record<string, number> = {};
  return [...host.querySelectorAll('[data-a2ui-id]')].map((el) => {
    const target = el.hasAttribute('data-line-a2ui-adapter') ? (el.firstElementChild ?? el) : el;
    const id = el.getAttribute('data-a2ui-id') ?? '';
    seen[id] = (seen[id] ?? 0) + 1;
    const r = target.getBoundingClientRect();
    const round = (n: number) => Math.round(n * 2) / 2;
    return {
      key: `${id}:${seen[id]}`,
      tag: target.localName,
      x: round(r.x - origin.x),
      y: round(r.y - origin.y),
      w: round(r.width),
      h: round(r.height),
    };
  });
}

function partsInPage() {
  const host = document.querySelector('#host') as Element;
  const deep = (root: ParentNode, selector: string): Element[] =>
    [...root.querySelectorAll('*')].flatMap((el) => [
      ...(el.matches(selector) ? [el] : []),
      ...(el.hasAttribute('data-line-a2ui-adapter') && el.shadowRoot ? deep(el.shadowRoot, selector) : []),
    ]);
  const expected: Record<string, [string, string, string][]> = {
    'line-button': [
      ['root', 'outlineColor', 'rgb(255, 0, 0)'],
      ['label', 'textDecorationLine', 'underline'],
    ],
    'line-separator': [['root', 'backgroundColor', 'rgb(0, 128, 0)']],
    'line-icon': [['svg', 'color', 'rgb(0, 0, 255)']],
  };
  return deep(host, 'line-button, line-separator, line-icon').map((el) => {
    const results = expected[el.localName].map(([part, prop, value]) => {
      const target = el.shadowRoot?.querySelector(`[part="${part}"]`);
      const actual = target ? String(getComputedStyle(target)[prop as 'color']) : 'missing';
      return { part, applied: actual === value, actual };
    });
    return { element: el.localName, results };
  });
}

function compareSlots(reference: SlotOwner[], candidate: SlotOwner[]) {
  const ids = (list: string[]) => list.map((d) => d.match(/#([\w-]+)/)?.[1] ?? d);
  return reference.map((ref, i) => {
    const got = candidate[i];
    return {
      owner: ref.owner,
      slots: ref.slots.map((slot) => {
        const other = got?.slots.find((s) => s.name === slot.name)?.assigned ?? [];
        return {
          slot: slot.name,
          reference: slot.assigned,
          candidate: other,
          sameNodes: JSON.stringify(slot.assigned) === JSON.stringify(other),
          sameIds: JSON.stringify(ids(slot.assigned)) === JSON.stringify(ids(other)),
        };
      }),
    };
  });
}

function compareBoxes(reference: Box[], candidate: Box[]) {
  return reference.flatMap((ref) => {
    const got = candidate.find((box) => box.key === ref.key);
    if (!got) return [{ key: ref.key, missing: true }];
    const delta = { dx: got.x - ref.x, dy: got.y - ref.y, dw: got.w - ref.w, dh: got.h - ref.h };
    return Object.values(delta).some((d) => Math.abs(d) > 1)
      ? [{ key: ref.key, tag: got.tag, ref, got, ...delta }]
      : [];
  });
}

/** What every page records: the aria snapshot, the Chromium CDP tree, `::part()` results and, for one, a screenshot. */
async function snapshot(page: Page, browserName: string, screenshot: string | undefined) {
  const chromium = browserName === 'chromium';
  if (chromium && screenshot) await page.locator('#host').screenshot({ path: outDir('screens', screenshot) });
  return {
    aria: await page.locator('#host').ariaSnapshot(),
    cdp: chromium ? await cdpTree(page) : undefined,
    parts: await page.evaluate(partsInPage),
  };
}

test('slots, layout, accessibility tree and ::part() reach', async ({ page, browserName }) => {
  const results: Record<string, unknown> = {};
  for (const fixture of ['showcase', 'slots']) {
    const shot = (name: string) => (fixture === 'showcase' ? `showcase-${name}.png` : undefined);
    await openReference(page, fixture);
    const refSlots = await page.evaluate(slotsInPage);
    const refBoxes = await page.evaluate(boxesInPage);
    const entry: Record<string, unknown> = { reference: await snapshot(page, browserName, shot('reference')) };
    for (const variant of [...VARIANTS, 'a-shadow']) {
      await openSurface(page, variant, fixture);
      const log = await readLog(page);
      expect(log.pageErrors).toEqual([]);
      const control = variant === 'a-shadow';
      entry[variant] = {
        errors: log.errors,
        defines: log.defines,
        slots: compareSlots(refSlots, await page.evaluate(slotsInPage)),
        layoutDiffs: control ? undefined : compareBoxes(refBoxes, await page.evaluate(boxesInPage)),
        ...(await snapshot(page, browserName, control ? undefined : shot(variant))),
      };
    }
    results[fixture] = entry;
  }
  results.browserVersion = page.context().browser()?.version();
  writeResult('render', results);
});
