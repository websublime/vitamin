// First import, so it records every later `customElements.define`.
import './define-log.ts';
import { ComponentContext } from '@a2ui/web_core/v0_9';
import { basicCatalog } from './catalog/basic.ts';
import { lineCatalog } from './catalog/line.ts';
import { type Fixture, fixtures } from './fixtures.ts';
import { type A2uiActionMessage, type A2uiErrorMessage, Session } from './session.ts';
import { adapterOptions } from './surface-a/adapter.ts';
import { ADAPTER_TAGS } from './surface-a/tags.ts';
import type { SurfaceBase } from './surface-base.ts';

/** What the checks read back through `page.evaluate`. */
export interface SpikeLog {
  errors: A2uiErrorMessage[];
  actions: A2uiActionMessage[];
  defines: string[];
  pageErrors: string[];
}

const defines = (globalThis as unknown as { spikeDefines: string[] }).spikeDefines;
const log: SpikeLog = { errors: [], actions: [], defines, pageErrors: [] };
addEventListener('error', (event) => log.pageErrors.push(String(event.message)));
addEventListener('unhandledrejection', (event) => log.pageErrors.push(String(event.reason)));

const params = new URLSearchParams(location.search);
const variant = params.get('v') ?? 'b';
const fixture = fixtures.find((f) => f.name === (params.get('fixture') ?? 'showcase')) as Fixture;
const adapters = variant.startsWith('a');

adapterOptions.shadow = variant === 'a-shadow';
if (variant === 'a-contents') {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync('[data-line-a2ui-adapter] { display: contents; }');
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
// Both techniques define `line-a2ui-surface`, so the page loads exactly one of them.
await (adapters ? import('./surface-a/surface.ts') : import('./surface-b/surface.ts'));

const catalogs = adapters
  ? [basicCatalog(ADAPTER_TAGS[basicCatalog().id]), lineCatalog(ADAPTER_TAGS[lineCatalog().id])]
  : [basicCatalog(), lineCatalog()];
const session = new Session({ catalogs, validation: fixture.validation ?? 'relaxed' });
const surface = document.createElement('line-a2ui-surface') as SurfaceBase;
surface.setAttribute('surface-id', 'main');
surface.addEventListener('line-a2ui-error', (event) => log.errors.push((event as CustomEvent).detail));
surface.addEventListener('line-a2ui-action', (event) => log.actions.push((event as CustomEvent).detail));
document.querySelector('#host')?.append(surface);
surface.session = session;

let step = 0;

/** Feeds the next step, or runs the fixture's renderer-side call once the steps are done. */
async function next(): Promise<boolean> {
  const batch = fixture.steps[step];
  if (batch) {
    step++;
    await surface.feed(batch);
    return true;
  }
  if (fixture.api === 'capabilities') session.capabilities([], 'main');
  if (fixture.api === 'dataModel') session.dataModel('main');
  if (fixture.api === 'adapterWithoutApi' && adapters) await adapterWithoutApi();
  return false;
}

// A context whose type has no catalog entry is the only way to reach `A2uiLitElement`'s missing-`api` throw.
async function adapterWithoutApi() {
  // Loaded on demand like every adapter module; a static import would define the adapters on page load.
  await import('./surface-a/adapters/native.ts');
  const chart = { id: 'chart', component: 'Chart' };
  session.process([{ version: 'v0.9.1', updateComponents: { surfaceId: 'main', components: [chart] } }], 'main');
  const model = session.processor.getSurface('main');
  if (!model) return;
  const el = document.createElement('line-a2ui-text') as HTMLElement & { context: unknown };
  surface.root.append(el);
  el.context = new ComponentContext(model, 'chart', '/');
  await surface.settle();
}

async function runAll() {
  while (await next());
}

// Manual mode for the screen-reader pass: the button feeds one step after `delay` ms, so focus can move back first.
if (params.has('manual')) {
  const button = document.querySelector<HTMLButtonElement>('#next');
  const status = document.querySelector('#status');
  const delay = Number(params.get('delay') ?? 0);
  if (button && status) {
    button.hidden = false;
    button.addEventListener('click', () => {
      window.setTimeout(async () => {
        const more = await next();
        status.textContent = more ? `Fed step ${step} of ${fixture.steps.length}.` : 'No more steps.';
      }, delay);
    });
  }
}

const all = fixtures.map(({ name, throws, api }) => ({ name, throws, api }));
Object.assign(globalThis, { spike: { variant, fixture, surface, session, log, next, runAll, all } });
document.body.dataset.ready = 'true';
