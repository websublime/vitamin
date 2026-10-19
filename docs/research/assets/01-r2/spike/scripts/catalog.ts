import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { Catalog } from '@a2ui/web_core/catalog';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { basicCatalog } from '../src/catalog/basic.ts';
import { lineCatalog } from '../src/catalog/line.ts';
import { fixtures } from '../src/fixtures.ts';

/** Target 7 (meta-schema validation) and the emitted catalog size (plan §8). Run after `fetch-spec.ts`. */

type Json = Record<string, unknown>;

const spike = resolve(import.meta.dir, '..');
const read = (path: string): Json => JSON.parse(readFileSync(resolve(spike, path), 'utf8'));
const handWritten = read('src/catalog/line-catalog.json');
const common = read('out/spec/common_types.json');
const capabilities = read('out/spec/client_capabilities.json');
const serverToClient = read('out/spec/server_to_client.json');
const basicDocument = read('out/spec/basic_catalog.json');

// `common_types.json` refers to `catalog.json#/$defs/anyFunction`, so every validator needs one catalog aliased there.
const CATALOG_ALIAS = 'https://a2ui.org/specification/v0_9/catalog.json';

function ajv(catalogDocument: Json) {
  const instance = new Ajv2020({ allErrors: true, strict: false });
  addFormats(instance);
  instance.addSchema(common);
  instance.addSchema(capabilities);
  instance.addSchema({ ...catalogDocument, $id: CATALOG_ALIAS });
  return instance;
}

/** Validates, or reports the compile error when the schema cannot be built. */
function check(build: () => ValidateFunction | undefined, data: unknown) {
  try {
    const validate = build();
    if (!validate) return { compiled: false, error: 'schema not found' };
    const valid = validate(data) as boolean;
    const errors = (validate.errors ?? []).map(
      (e) =>
        `${e.instancePath || '/'} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`,
    );
    return { compiled: true, valid, errors: errors.slice(0, 8), errorCount: errors.length };
  } catch (err) {
    return { compiled: false, error: String(err).slice(0, 240) };
  }
}

function size(value: unknown) {
  const min = JSON.stringify(value);
  return { minifiedBytes: Buffer.byteLength(min), gzipBytes: gzipSync(min, { level: 9 }).length };
}

const results: Json = {};
const capsId = String(capabilities.$id);
const line = lineCatalog();
const emitted = line.toJson() as Json;
// The alias only lets the common types resolve; `$defs/Catalog` itself does not read it.
const catalogDef = () => ajv(handWritten).getSchema(`${capsId}#/$defs/Catalog`) ?? undefined;

results['hand-written vs client_capabilities.json#/$defs/Catalog'] = check(catalogDef, handWritten);
results['toJson() vs client_capabilities.json#/$defs/Catalog'] = check(catalogDef, emitted);
results['published basic catalog vs client_capabilities.json#/$defs/Catalog'] = check(catalogDef, basicDocument);

// A catalog document is itself a JSON Schema; its `anyComponent` validates component instances.
const slotsMessage = fixtures.find((f) => f.name === 'slots')?.steps[0][1] as {
  updateComponents: { components: Json[] };
};
const slotComponents = slotsMessage.updateComponents.components;
const noAction = { id: 'x', component: 'Button', label: 'No action' };
const anyComponent = (doc: Json) => () => ajv(doc).compile({ $ref: `${CATALOG_ALIAS}#/$defs/anyComponent` });
results['slots components vs hand-written anyComponent'] = slotComponents.map((c) =>
  check(anyComponent(handWritten), c),
);
results['Button without action vs hand-written anyComponent'] = check(anyComponent(handWritten), noAction);
results['slots components vs toJson() anyComponent'] = check(anyComponent(emitted), slotComponents[0]);

// `validationSchema` is a self-contained catalog document; its `$defs/anyComponent` validates one component.
function bundled(schema: Json) {
  return () => {
    const instance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(instance);
    instance.addSchema({ ...schema, $id: 'urn:r2:validation' });
    return instance.compile({ $ref: 'urn:r2:validation#/$defs/anyComponent' });
  };
}

// `web_core` reads the hand-written document and builds its own validator from it.
try {
  const loaded = Catalog.fromJson(handWritten);
  results['Catalog.fromJson(hand-written)'] = {
    roundTripDeepEqual: Bun.deepEquals(loaded.toJson(), handWritten),
    roundTripSameKeyOrder: JSON.stringify(loaded.toJson()) === JSON.stringify(handWritten),
    validationSchema: slotComponents.map((c) => check(bundled(loaded.validationSchema), c)),
    buttonWithoutAction: check(bundled(loaded.validationSchema), noAction),
  };
} catch (err) {
  results['Catalog.fromJson(hand-written)'] = { threw: String(err) };
}
results['lineCatalog().validationSchema'] = {
  slotsComponents: slotComponents.map((c) => check(bundled(line.validationSchema), c)),
  buttonWithoutAction: check(bundled(line.validationSchema), noAction),
};

// Inline form, as a renderer advertises it.
const caps = new MessageProcessor([line]).getClientCapabilities({ versions: ['v0.9'], includeInlineCatalogs: true });
results['getClientCapabilities inline line catalog vs client_capabilities.json'] = check(
  () => ajv(handWritten).getSchema(capsId) ?? undefined,
  caps,
);

// The fixture streams against `server_to_client.json`, with the fixture's catalog aliased as `catalog.json`.
const streams = { basic: basicDocument, line: handWritten };
results['fixture messages vs server_to_client.json'] = Object.fromEntries(
  fixtures.map((f) => {
    const validate = ajv(streams[f.catalog]).compile(serverToClient);
    const messages = f.steps.flat();
    const invalid = messages.flatMap((message, index) =>
      validate(message)
        ? []
        : [{ index, errors: (validate.errors ?? []).slice(0, 2).map((e) => `${e.instancePath} ${e.message}`) }],
    );
    return [f.name, { messages: messages.length, invalid: invalid.length, first: invalid[0] }];
  }),
);
results['slots stream vs server_to_client.json with toJson() as catalog.json'] = check(
  () => ajv(emitted).compile(serverToClient),
  slotsMessage,
);

results.sizes = {
  'hand-written line catalog (4 components)': {
    fileBytes: Buffer.byteLength(readFileSync(resolve(spike, 'src/catalog/line-catalog.json'))),
    ...size(handWritten),
  },
  'lineCatalog().toJson() (4 components)': size(emitted),
  'lineCatalog().validationSchema': size(line.validationSchema),
  'basicCatalog().toJson() (8 Phase 1 types)': size(basicCatalog().toJson()),
  'basicCatalog().validationSchema (8 Phase 1 types)': size(basicCatalog().validationSchema),
  'published v0.9.1 basic catalog (18 types)': size(basicDocument),
};

mkdirSync(resolve(spike, 'out/results'), { recursive: true });
writeFileSync(resolve(spike, 'out/results/catalog.json'), `${JSON.stringify(results, null, 2)}\n`);
writeFileSync(resolve(spike, 'out/results/line-catalog.emitted.json'), `${JSON.stringify(emitted, null, 2)}\n`);
console.info(JSON.stringify(results, null, 2));
