import { BASIC_CATALOG_ID } from './catalog/basic.ts';
import { LINE_CATALOG_ID } from './catalog/line.ts';
import type { ValidationMode } from './session.ts';

type Message = Record<string, unknown>;

/** One A2UI v0.9.1 stream. Each step is one batch fed to the surface. */
export interface Fixture {
  name: string;
  catalog: 'basic' | 'line';
  validation?: ValidationMode;
  steps: Message[][];
  /** For a failing stream, the R1 §2.7 row it exercises and the error code it should raise. */
  throws?: { row: string; step: number; code: string };
  /** For a renderer-side throw, the session call the check makes after the steps. */
  api?: 'capabilities' | 'dataModel' | 'adapterWithoutApi';
}

const V = 'v0.9.1';
const SURFACE = 'main';
const m = (body: Message): Message => ({ version: V, ...body });
const create = (catalogId = BASIC_CATALOG_ID, surfaceId = SURFACE) => m({ createSurface: { surfaceId, catalogId } });
const components = (list: Message[], surfaceId = SURFACE) => m({ updateComponents: { surfaceId, components: list } });
const data = (path: string, value: unknown, surfaceId = SURFACE) => m({ updateDataModel: { surfaceId, path, value } });
const text = (id: string, value: unknown, extra: Message = {}) => ({ id, component: 'Text', text: value, ...extra });
const action = (name: string, context: Message = {}) => ({ event: { name, context } });

/** Covers the eight Phase 1 basic types, data binding, a template list and one action with bound context. */
export const showcase: Fixture = {
  name: 'showcase',
  catalog: 'basic',
  steps: [
    [
      create(),
      components([
        {
          id: 'root',
          component: 'Column',
          align: 'stretch',
          children: ['title', 'profile', 'rule', 'items', 'actions', 'wide'],
        },
        text('title', { path: '/title' }, { variant: 'h2' }),
        { id: 'profile', component: 'Row', align: 'center', children: ['mailIcon', 'name', 'avatar'] },
        { id: 'mailIcon', component: 'Icon', name: 'mail' },
        text('name', { path: '/user/name' }, { weight: 1 }),
        { id: 'avatar', component: 'Image', url: '/pages/avatar.svg', description: 'Avatar of the user', fit: 'cover' },
        { id: 'rule', component: 'Divider' },
        { id: 'items', component: 'List', children: { componentId: 'item', path: '/items' } },
        { id: 'item', component: 'Row', align: 'center', children: ['itemIcon', 'itemText'] },
        { id: 'itemIcon', component: 'Icon', name: 'check' },
        text('itemText', { path: 'label' }),
        { id: 'actions', component: 'Row', justify: 'spaceBetween', children: ['send', 'split', 'close'] },
        {
          id: 'send',
          component: 'Button',
          variant: 'primary',
          child: 'sendLabel',
          action: action('send', { to: { path: '/user/name' } }),
        },
        text('sendLabel', 'Send'),
        { id: 'split', component: 'Divider', axis: 'vertical' },
        { id: 'close', component: 'Button', child: 'closeIcon', action: action('close') },
        { id: 'closeIcon', component: 'Icon', name: 'close', accessibility: { label: 'Close' } },
        { id: 'wide', component: 'Button', child: 'wideLabel', action: action('wide') },
        text('wideLabel', 'Full width'),
      ]),
      data('/', { title: 'Inbox', user: { name: 'Ada' }, items: [{ label: 'Draft saved' }, { label: 'Reply sent' }] }),
    ],
    [data('/user/name', 'Grace')],
  ],
};

/** Line catalog: a named slot (`prefix`) and a bound label. */
export const slots: Fixture = {
  name: 'slots',
  catalog: 'line',
  steps: [
    [
      create(LINE_CATALOG_ID),
      components([
        { id: 'root', component: 'Stack', direction: 'column', align: 'start', children: ['send', 'sep', 'next'] },
        {
          id: 'send',
          component: 'Button',
          label: 'Send',
          icon: 'sendIcon',
          variant: 'primary',
          action: action('send'),
        },
        { id: 'sendIcon', component: 'Icon', name: 'send' },
        { id: 'sep', component: 'Separator' },
        { id: 'next', component: 'Button', label: { path: '/cta' }, action: action('next') },
      ]),
      data('/cta', 'Continue'),
    ],
  ],
};

/** Progressive streaming: the root arrives first, its children later (RELAXED_VALIDATION accepts it, R1 §2.7). */
export const streaming: Fixture = {
  name: 'streaming',
  catalog: 'basic',
  steps: [
    [create(), components([{ id: 'root', component: 'Column', children: ['a', 'b', 'c'] }])],
    [components([text('a', 'First')])],
    [components([{ id: 'b', component: 'Button', child: 'bLabel', action: action('b') }, text('bLabel', 'Second')])],
    [components([{ id: 'c', component: 'Divider' }])],
  ],
};

/** Agent updates while a user holds focus on button `b` (§17.4 focus rules). */
export const focus: Fixture = {
  name: 'focus',
  catalog: 'basic',
  steps: [
    [
      create(),
      components([
        { id: 'root', component: 'Row', children: ['a', 'b'] },
        { id: 'a', component: 'Button', child: 'aLabel', action: action('a') },
        text('aLabel', 'Alpha'),
        { id: 'b', component: 'Button', child: 'bLabel', action: action('b') },
        text('bLabel', { path: '/b' }),
      ]),
      data('/b', 'Beta'),
    ],
    [data('/b', 'Beta 2')],
    [
      components([
        { id: 'root', component: 'Row', children: ['a', 'c', 'b'] },
        { id: 'c', component: 'Button', child: 'cLabel', action: action('c') },
        text('cLabel', 'Gamma'),
      ]),
    ],
    [components([{ id: 'b', component: 'Button', variant: 'primary', child: 'bLabel', action: action('b') }])],
    [components([{ id: 'root', component: 'Row', children: ['b', 'a', 'c'] }])],
    // Reparent: `b` moves under a new Column.
    [
      components([
        { id: 'root', component: 'Row', children: ['a', 'c', 'wrap'] },
        { id: 'wrap', component: 'Column', children: ['b'] },
      ]),
    ],
  ],
};

/** One component on the surface, for the Law 6 bundle check. */
export const oneButton: Fixture = {
  name: 'one-button',
  catalog: 'basic',
  steps: [
    [
      create(),
      components([{ id: 'root', component: 'Button', child: 'label', action: action('only') }, text('label', 'Only')]),
    ],
  ],
};

/** A button whose only child is an unlabelled icon (§17.4 required names). */
export const missingName: Fixture = {
  name: 'missing-name',
  catalog: 'basic',
  steps: [
    [
      create(),
      components([
        { id: 'root', component: 'Button', child: 'icon', action: action('x') },
        { id: 'icon', component: 'Icon', name: 'star' },
      ]),
    ],
  ],
};

/** Node-level problems that do not throw: an unknown type, and a cycle with no `validationConfig`. */
export const unknownType: Fixture = {
  name: 'unknown-type',
  catalog: 'basic',
  steps: [
    [
      create(),
      components([
        { id: 'root', component: 'Column', children: ['ok', 'chart'] },
        text('ok', 'Kept'),
        { id: 'chart', component: 'Chart' },
      ]),
    ],
  ],
};

export const cycleUnvalidated: Fixture = {
  name: 'cycle-unvalidated',
  catalog: 'basic',
  validation: 'none',
  steps: [
    [
      create(),
      components([
        { id: 'root', component: 'Column', children: ['ok', 'loop'] },
        text('ok', 'Kept'),
        { id: 'loop', component: 'Column', children: ['loop'] },
      ]),
    ],
  ],
};

const setup = (version = V): Message[] => [
  { ...create(), version },
  {
    ...components([{ id: 'root', component: 'Column', children: ['t1'] }, text('t1', { path: '/msg' })]),
    version,
  },
  { ...data('/', { msg: 'Before', items: [1, 2] }), version },
];
const after = [data('/msg', 'After')];

function failing(
  name: string,
  row: string,
  code: string,
  message: Message,
  options: { validation?: ValidationMode; version?: string } = {},
): Fixture {
  return {
    name,
    catalog: 'basic',
    validation: options.validation ?? 'relaxed',
    steps: [setup(options.version), [message], after],
    throws: { row, step: 1, code },
  };
}

let deep: unknown = 'leaf';
for (let i = 0; i < 60; i++) deep = { nested: deep };
let call: unknown = 'x';
for (let i = 0; i < 6; i++) call = { call: 'formatString', args: { value: call } };
const chain = ['root', 'c1', 'c2', 'c3', 'c4'].map((id, i, ids) =>
  i < ids.length - 1 ? { id, component: 'Column', children: [ids[i + 1]] } : text(id, 'Deep'),
);

/** One failing stream per R1 §2.7 throw path a stream can reach. */
export const throwing: Fixture[] = [
  failing('version-missing', 'Version adapter', 'VALIDATION_ERROR', {
    createSurface: { surfaceId: 'x', catalogId: BASIC_CATALOG_ID },
  }),
  failing('version-unsupported', 'Version adapter', 'VALIDATION_ERROR', { ...data('/msg', 'x'), version: 'v0.7' }),
  failing('two-operations', 'Version adapter', 'VALIDATION_ERROR', {
    ...data('/msg', 'x'),
    deleteSurface: { surfaceId: SURFACE },
  }),
  failing(
    'envelope-invalid',
    'Version adapter',
    'VALIDATION_ERROR',
    m({ updateComponents: { surfaceId: SURFACE, components: 'nope' } }),
  ),
  failing(
    'surface-id-not-string',
    'Version adapter',
    'VALIDATION_ERROR',
    m({ updateDataModel: { surfaceId: 42, path: '/msg', value: 'x' } }),
  ),
  failing('payload-depth', 'validateRecursionAndPaths', 'RECURSION_ERROR', data('/deep', deep)),
  failing('function-call-depth', 'validateRecursionAndPaths', 'RECURSION_ERROR', components([text('t1', call)])),
  failing(
    'pointer-syntax',
    'validateRecursionAndPaths',
    'VALIDATION_ERROR',
    components([text('t1', { path: '/a/~2' })]),
  ),
  failing('target-version', 'targetVersion', 'VALIDATION_ERROR', data('/msg', 'x'), {
    validation: { targetVersion: 'v0.9' },
    version: 'v0.9',
  }),
  failing('allowed-messages', 'allowedMessages', 'VALIDATION_ERROR', m({ deleteSurface: { surfaceId: SURFACE } }), {
    validation: { allowedMessages: ['createSurface', 'updateComponents', 'updateDataModel'] },
  }),
  failing(
    'catalog-unknown',
    'createSurface',
    'CATALOG_ERROR',
    create('https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json', 'x'),
  ),
  failing('surface-exists', 'createSurface', 'INTEGRITY_ERROR', create()),
  failing('catalog-version', 'createSurface', 'VALIDATION_ERROR', {
    ...create(BASIC_CATALOG_ID, 'x'),
    version: 'v1.0',
  }),
  // `web_core`'s theme schema accepts any CSS colour, so only a non-colour fails.
  failing(
    'theme-invalid',
    'createSurface',
    'VALIDATION_ERROR',
    m({ createSurface: { surfaceId: 'x', catalogId: BASIC_CATALOG_ID, theme: { primaryColor: 'not-a-colour' } } }),
  ),
  failing('components-unknown-surface', 'updateComponents', 'INTEGRITY_ERROR', components([text('t9', 'x')], 'nope')),
  failing('duplicate-id', 'updateComponents', 'INTEGRITY_ERROR', components([text('d', '1'), text('d', '2')])),
  failing('missing-id', 'updateComponents', 'VALIDATION_ERROR', components([{ component: 'Text', text: 'x' }])),
  failing('missing-type', 'updateComponents', 'VALIDATION_ERROR', components([{ id: 'fresh', text: 'x' }])),
  failing(
    'schema-invalid',
    'updateComponents',
    'VALIDATION_ERROR',
    components([{ id: 'bad', component: 'Button', child: 't1', variant: 'huge', action: action('x') }]),
  ),
  failing(
    'unknown-type-strict',
    'updateComponents (allowUnknownElements: false)',
    'VALIDATION_ERROR',
    components([
      { id: 'root', component: 'Column', children: ['t1', 'chart'] },
      { id: 'chart', component: 'Chart' },
    ]),
    { validation: 'strict' },
  ),
  failing(
    'dangling-strict',
    'Candidate topology',
    'INTEGRITY_ERROR',
    components([{ id: 'root', component: 'Column', children: ['t1', 'ghost'] }]),
    { validation: 'strict' },
  ),
  failing(
    'cycle-relaxed',
    'Candidate topology',
    'RECURSION_ERROR',
    components([
      { id: 'root', component: 'Column', children: ['t1', 'loop'] },
      { id: 'loop', component: 'Column', children: ['loop'] },
    ]),
  ),
  failing('depth-limit', 'Candidate topology', 'RECURSION_ERROR', components(chain), {
    validation: { maxDepth: 3, allowMissingRoot: false },
  }),
  // With `allowMissingRoot: true` the depth walk starts at each id in sorted order, so `c1` is measured first.
  failing('depth-limit-relaxed', 'Candidate topology (allowMissingRoot: true)', 'none', components(chain), {
    validation: { maxDepth: 3 },
  }),
  failing('data-unknown-surface', 'updateDataModel', 'INTEGRITY_ERROR', data('/msg', 'x', 'nope')),
  failing('data-forbidden-segment', 'updateDataModel', 'DATA_ERROR', data('/__proto__/polluted', true)),
  failing('data-primitive-in-path', 'updateDataModel', 'DATA_ERROR', data('/msg/sub', 'x')),
  failing('data-array-segment', 'updateDataModel', 'DATA_ERROR', data('/items/abc', 'x')),
  failing('data-array-index', 'updateDataModel', 'DATA_ERROR', data('/items/10001', 'x')),
  {
    name: 'missing-root-strict',
    catalog: 'basic',
    validation: 'strict',
    steps: [
      [create()],
      [components([text('t1', 'Orphan')])],
      [components([{ id: 'root', component: 'Column', children: ['t1'] }, text('t1', 'After')])],
    ],
    throws: { row: 'Candidate topology', step: 1, code: 'INTEGRITY_ERROR' },
  },
  {
    name: 'capabilities-empty',
    catalog: 'basic',
    steps: [setup(), after],
    throws: { row: 'MessageProcessor.getClientCapabilities', step: 2, code: 'VALIDATION_ERROR' },
    api: 'capabilities',
  },
  {
    name: 'data-model-mixed-versions',
    catalog: 'basic',
    steps: [
      [
        m({ createSurface: { surfaceId: SURFACE, catalogId: BASIC_CATALOG_ID, sendDataModel: true } }),
        ...setup().slice(1),
      ],
      [{ version: 'v0.9', createSurface: { surfaceId: 'other', catalogId: BASIC_CATALOG_ID, sendDataModel: true } }],
      after,
    ],
    // A surface takes its version from the catalog (`0.9`), so v0.9 and v0.9.1 surfaces never conflict here.
    throws: { row: 'MessageProcessor.getRendererDataModel', step: 3, code: 'none' },
    api: 'dataModel',
  },
  {
    name: 'adapter-without-api',
    catalog: 'basic',
    steps: [setup(), after],
    throws: { row: 'A2uiLitElement', step: 2, code: 'UNKNOWN_ERROR' },
    api: 'adapterWithoutApi',
  },
];

export const fixtures: Fixture[] = [
  showcase,
  slots,
  streaming,
  focus,
  oneButton,
  missingName,
  unknownType,
  cycleUnvalidated,
  ...throwing,
];
