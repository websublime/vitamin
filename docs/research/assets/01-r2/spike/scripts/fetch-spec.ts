import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Downloads the A2UI v0.9.1 schemas the checks validate against, pinned to the commit R1 read. */

export const A2UI_COMMIT = 'cbaa5ee62c737b50d0695c1e5794d0f648b61dca';
const BASE = `https://raw.githubusercontent.com/a2ui-project/a2ui/${A2UI_COMMIT}/specification/v0_9_1`;
const FILES = {
  'client_capabilities.json': 'json/client_capabilities.json',
  'client_to_server.json': 'json/client_to_server.json',
  'common_types.json': 'json/common_types.json',
  'server_to_client.json': 'json/server_to_client.json',
  'basic_catalog.json': 'catalogs/basic/catalog.json',
};

const out = resolve(import.meta.dir, '../out/spec');
mkdirSync(out, { recursive: true });
for (const [name, path] of Object.entries(FILES)) {
  const response = await fetch(`${BASE}/${path}`);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  writeFileSync(resolve(out, name), await response.text());
  console.info(`${name} ← ${path}`);
}
