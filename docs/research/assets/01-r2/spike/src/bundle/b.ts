// First import, so it records every later `customElements.define`.
import '../define-log.ts';
import '../surface-b/surface.ts';
import { basicCatalog } from '../catalog/basic.ts';
import { lineCatalog } from '../catalog/line.ts';
import { run } from './app.ts';

await run([basicCatalog(), lineCatalog()]);
