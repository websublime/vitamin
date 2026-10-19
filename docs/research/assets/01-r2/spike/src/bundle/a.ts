// First import, so it records every later `customElements.define`.
import '../define-log.ts';
import '../surface-a/surface.ts';
import { basicCatalog } from '../catalog/basic.ts';
import { lineCatalog } from '../catalog/line.ts';
import { ADAPTER_TAGS } from '../surface-a/tags.ts';
import { run } from './app.ts';

const basic = basicCatalog();
const line = lineCatalog();
await run([basicCatalog(ADAPTER_TAGS[basic.id]), lineCatalog(ADAPTER_TAGS[line.id])]);
