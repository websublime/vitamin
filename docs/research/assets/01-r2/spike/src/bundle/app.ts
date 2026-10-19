import type { Catalog } from '@a2ui/web_core/catalog';
import { Session } from '../session.ts';
import type { SurfaceBase } from '../surface-base.ts';

const BASIC = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

/** The `one-button` stream inline, so the app chunk holds no other fixture. */
const STREAM = [
  { version: 'v0.9.1', createSurface: { surfaceId: 'main', catalogId: BASIC } },
  {
    version: 'v0.9.1',
    updateComponents: {
      surfaceId: 'main',
      components: [
        { id: 'root', component: 'Button', child: 'label', action: { event: { name: 'only' } } },
        { id: 'label', component: 'Text', text: 'Only' },
      ],
    },
  },
];

/** A minimal app: one session, one surface, one stream. */
export async function run(catalogs: Catalog[]) {
  const session = new Session({ catalogs });
  const surface = document.createElement('line-a2ui-surface') as SurfaceBase;
  surface.setAttribute('surface-id', 'main');
  document.querySelector('#host')?.append(surface);
  surface.session = session;
  await surface.feed(STREAM);
  document.body.dataset.ready = 'true';
}
