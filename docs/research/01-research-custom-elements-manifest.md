# Research: Custom Elements Manifest for Lit components

**Row:** `00-Z33` (Phase 1 plan §5.1 R4)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` (§2.1 item 6, §4.1 G5, §5, §6, §7), `docs/ARCHITECTURE.md` (§6, §7, §17.2 rule C7, §17.3, §17.8, §17.9), `docs/PRD.md` (§5.1, §6.3, §7.3), `docs/MANIFESTO.md`, `docs/specs/00-spec-design-system.md` (§6.F.1, §7.3), `docs/specs/COMPONENT-SPEC-TEMPLATE.md` (Agent contract), `docs/research/00-research-generative-ui.md` (§4.4, §4.9), `docs/research/00-research-design-system-foundation.md` (R13), `docs/research/00-research-design-system-foundation-round2.md` (R10, R13), `custom-elements-manifest.config.mjs`, `apps/storybook/package.json`, `apps/storybook/.storybook/{main,preview}.ts`, `.github/workflows/checks.yml`, `packages/line-core/src/**`, `bun.lock`, `node_modules/@custom-elements-manifest/analyzer` (0.11.0 source), `@storybook/web-components` 10.6.2 dist
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
> - `@custom-elements-manifest/analyzer` 0.11.0 is both the `bun.lock` version and npm `latest` (published 2025-11-04). It parses each file alone with its own TypeScript 5.4.5 and no type checker, so every type in the manifest is plain text.
> - With the repo config, a Lit element that extends `FormAssociated(LineElement)` gets attributes, properties, reflection, defaults, `@property` attribute renames, deprecations, summary, slots, CSS parts, CSS custom properties, CSS states and events. Inheritance from `LineElement` and its four mixins resolves by class name, even through `@websublime/line-core` package imports.
> - All six C7 tags (`@summary`, `@slot`, `@csspart`, `@cssprop`, `@fires`, `@deprecated`) work natively. Slots and CSS parts come only from JSDoc, and `@deprecated` does not work per slot, part, CSS property or `@fires` line.
> - `formAssociated` already appears as an inherited static field with `default: "true"`, but the schema has no flag for it (upstream issue #136, open). ARIA role and states appear nowhere. A 30-line plugin with the installed plugin API adds both as custom fields, and the output still validates against schema 2.1.0.
> - Events found through `dispatchEvent` are unreliable. The analyser misses dispatches inside arrow-function fields and takes the first constructor argument of an event class as the event name. `@fires` gives correct names.
> - Storybook does not read the manifest today. `preview.ts` never calls `setCustomElementsManifest`, and CI runs the analyser after the Storybook build and after the unit tier.

---

## 1. Question

Plan §5.1 R4 reads "Analyser output for Lit components, the C7 JSDoc tags, the missing `formAssociated` and ARIA metadata". The research brief splits it into five sub-questions.

| # | Sub-question |
|---|---|
| Q1 | What does the analyser (the `bun.lock` version and the latest) emit for Lit components? This covers properties, attributes, events, slots, CSS parts, CSS custom properties, `formAssociated`, and superclass and mixin resolution through `LineElement`. |
| Q2 | Which ARCHITECTURE §17.2 rule C7 tags does the analyser understand natively, and which need a plugin? |
| Q3 | How can the missing `formAssociated` and ARIA metadata (role, states) enter the manifest with the plugin API of the installed version? |
| Q4 | Which facts can the stream G drift and coverage tests (plan §4.1 G5, §6) read from the manifest? |
| Q5 | What toolchain facts touch TypeScript 7? Note only; R11 owns the verification. |

---

## 2. Findings

### 2.1 Versions (retrieved 2026-10-19)

| Package | `bun.lock` | npm `latest` | Published | Notes |
|---|---|---|---|---|
| `@custom-elements-manifest/analyzer` | 0.11.0 (`bun.lock:396`) | 0.11.0 | 2025-11-04 | Only change is `oxc-resolver` in `find-dependencies` (CHANGELOG) |
| `typescript` nested under the analyser | 5.4.5 (`bun.lock:1802`) | — | — | Declared `~5.4.2` |
| `custom-elements-manifest` (schema types) | 1.0.0 (`bun.lock:960`) | 2.1.0 | 2024-05-06 | 2.1.0 added `cssStates` (schema PR #128) |
| `@storybook/web-components` | 10.6.2 (installed, pulled in by `@storybook/web-components-vite` 10.6.2) | 10.6.2 | — | `storybook` `next` is 11.0.0-alpha.6 |

- The analyser repo `open-wc/custom-elements-manifest` has no code commit after 2025-11-04. Its two later commits (2026-04-23, 2026-07-03) only edit the plugin list in the docs.
- The schema repo `webcomponents/custom-elements-manifest` has no release after 2.1.0. Its last commit is from 2024-10-02.

### 2.2 What the analyser emits for a Lit element (Q1)

The repo config (`custom-elements-manifest.config.mjs`) globs `packages/*/src/**/*.ts` and adds `litPlugin()` from the analyser's `src/features/framework-plugins/lit/lit.js`. The deep import works because the analyser's `package.json` has no `exports` map. Probe P3 (§3) ran this config on two throwaway elements.

| API surface | Source form in the probe | Manifest output |
|---|---|---|
| Reactive property with attribute | `@property({ reflect: true }) variant: 'solid' \| 'ghost' = 'solid'` | Member `variant` with `type.text` `'solid' \| 'ghost'`, `default` `'solid'`, `attribute` `variant`, `reflects: true`; plus an `attributes[]` entry with `fieldName: "variant"` |
| Boolean property | `@property({ type: Boolean, reflect: true }) disabled = false` | `type.text` `boolean`, attribute `disabled` |
| Renamed attribute | `@property({ attribute: 'label-text' }) labelText` | Attribute `label-text`, `fieldName: "labelText"` |
| Property only | `@property({ attribute: false }) data` | Member only, no `attribute` and no `attributes[]` entry |
| `static properties` form | `count: { type: Number, attribute: 'item-count' }` with `declare count: number` | Member `count` with `attribute` `item-count`, default `0` taken from the constructor assignment |
| Attribute documented only in JSDoc | `@attr {string} legacy-attr` | `attributes[]` entry without `fieldName` |
| Internal state | `@state() private _pressed` | Member with `privacy: "private"`, no attribute |
| `@internal` field | `/** @internal */ internalThing` | Dropped |
| Deprecated property | `@deprecated Use \`variant\`.` on the field | `deprecated` on both the member and the attribute |
| Methods | `press()`, `#commit()` | Members of kind `method`; `#commit` is `privacy: "private"` |
| Tag name | `@customElement('line-probe-button')` or `customElements.define(...)` | `tagName` plus a `custom-element-definition` export |
| Slots, CSS parts, CSS properties, CSS states | `@slot`, `@csspart`, `@cssprop`, `@cssstate` in the class JSDoc | `slots[]`, `cssParts[]`, `cssProperties[]` (`[--x=0.5rem]` gives `default`), `cssStates[]` |
| `part="undocumented"` in `render()` | Template only | Absent; the analyser never reads templates |
| Events | See §2.4 | `events[]` with `name`, `type.text`, `description` |

- The output carries `schemaVersion: "1.0.0"`, hard-coded in `src/create.js:13`. It still uses fields that schema 1.0.0 lacks, such as `cssStates` and `readonly`.
- `@cssprop {<length>} --x` writes `type.text`. Schema 2.1.0 names this field `syntax` on `CssCustomProperty`, so the value lands in a field the schema does not define.
- The baseline manifest of today's tree (probe P2) is not empty. It holds 24 modules from `line-core`, `line-icons`, `line-schemas` and `line-utils`. `LineElement` appears with `customElement: true` and no `tagName`.

### 2.3 Superclass and mixin resolution

- `LineElement` (`line-element.ts:19`) extends `DirectionMixin(MetadataMixin(InspectorMixin(LitElement)))`. The manifest records `superclass: { name: "LitElement", package: "lit" }` and the three mixins in call order, each with its module path.
- A component that imports `LineElement` and `FormAssociated` through `@websublime/line-core` and `@websublime/line-core/mixins/form-associated` gets `superclass.package` and `mixins[].package` set to those specifiers.
- Inheritance still applies. `applyInheritancePlugin` (`src/features/post-processing/apply-inheritance.js`) builds a map of every class and mixin in the manifest by name and walks it, so package specifiers do not block it. Two classes with the same name in different packages would collide in that map [INFERENCE from the source].
- Every inherited item gets `inheritedFrom` with the defining module, such as `packages/line-core/src/mixins/form-associated.ts`.
- An overriding member also gets `inheritedFrom`. `LineElement`'s own `static version` shows `inheritedFrom: MetadataMixin`. `inheritedFrom` therefore marks "also declared upstream", not "not declared here".
- Inherited members of the probe button include the public form API (`setFormValue`, `setValidity`, `form`, `name`, `validity` and the rest), `direction` (readonly, no attribute), the protected `reflectState`, the static `version`, `docs`, `qa` and `scope`, and every `#private` member of the Inspector and Direction mixins.
- The Lit member deny-list drops the class's own `properties` and `styles` in the module-link phase. Inheritance runs later, in the package-link phase, so the static `properties` of `DirectionMixin` reappears on every component as an inherited member.
- `FormAssociated` defines a `name` getter, but no `name` attribute appears, because nothing declares one.

### 2.4 Events

| Source form | Result |
|---|---|
| `this.dispatchEvent(new CustomEvent('line-change', …))` inside a method | Detected with `type.text` `CustomEvent` |
| Same call inside an arrow-function class field (`onInput = () => …`) | Not detected; the visitor walks `MethodDeclaration` nodes only (`createClass.js:151`) |
| `this.dispatchEvent(new LineSelectEvent('x'))`, an event class whose constructor takes a value | Emitted with `name: "x"` and `type.text` `LineSelectEvent`; the analyser takes the first constructor argument as the name |
| `@fires {CustomEvent<{ value: string }>} line-change - …` in the class JSDoc | Name, `type.text` and description; merged into a dispatch-detected event of the same name |
| `@fires line-press - …` with no dispatch | Emitted from JSDoc alone |
| A dispatch with no `@fires` | Emitted without a description |
| `@deprecated` in a JSDoc block above the `dispatchEvent` call | `deprecated` set on that event |

The typed `detail` that rule C3 asks for survives only as the string inside `type.text`.

### 2.5 The C7 JSDoc tags (Q2)

ARCHITECTURE §17.2 rule C7 lists `@summary`, `@slot`, `@csspart`, `@cssprop`, `@fires` and `@deprecated`. The handlers live in `src/features/analyse-phase/class-jsdoc.js` (class level) and `creators/handlers.js` (member level).

| C7 tag | Native | Aliases | Works on | Gap |
|---|---|---|---|---|
| `@summary` | Yes | — | Class (read through the TypeScript JSDoc API), members | — |
| `@slot` | Yes | — | Class; `-` or no name is the default slot (`name: ""`) | No per-slot deprecation |
| `@csspart` | Yes | `@part` | Class | No per-part deprecation; parts in templates are not cross-checked |
| `@cssprop` | Yes | `@cssproperty` | Class; `[--x=default]` sets `default` | `{type}` goes to `type`, not schema `syntax`; no per-property deprecation |
| `@fires` | Yes | `@event` | Class; `{Type}` sets `type.text` | No per-event deprecation from the class tag |
| `@deprecated` | Yes | — | Class, members, attributes (through the field), dispatch-site events | Inside a `@slot`/`@csspart`/`@cssprop`/`@fires` line it stays in the description text (probe P5) |

Other tags the analyser reads natively are `@attr`/`@attribute`, `@prop`/`@property`, `@cssstate`, `@tag`/`@tagname`/`@customElement`, `@reflect`, `@default`, `@internal`/`@ignore`, `@type`, `@param`, `@returns`, `@readonly` and `@public`/`@private`/`@protected`. Unknown tags such as `@role` are dropped without a warning (probe P3).

### 2.6 `formAssociated` and ARIA metadata (Q3)

**What the manifest already holds**

- The `FormAssociated` mixin (`form-associated.ts:75`) declares `static formAssociated = true as const`. Every component built on it carries an inherited member `{ kind: "field", name: "formAssociated", static: true, type: { text: "true" }, default: "true" }`.
- A component that declares `static formAssociated = true` itself gets the same member with `type.text` `boolean`.
- The schema has no element-level `formAssociated` flag. Upstream issue webcomponents/custom-elements-manifest#136 ("feat: add `formAssociated` flag to CustomElement") is open since 2025-06-08 with one comment pointing to #79. Issue #79 closed in 2021 when its author saw the static field in the output.
- ARIA metadata is absent from the schema and the output. A role set at runtime through `ElementInternals.role` or `setAttribute('role', …)` leaves no trace, because the analyser reads declarations and JSDoc only. ARCHITECTURE §17.9 also notes that `#internals` is private today.

**Plugin API of 0.11.0** (`index.d.ts`)

| Hook | Runs | Receives |
|---|---|---|
| `initialize` | Once per plugin | `ts`, `customElementsManifest`, `context` |
| `collectPhase` | Every AST node of every module, before analysis | `ts`, `node`, `context` |
| `analyzePhase` | Every AST node of each module | `ts`, `node`, `moduleDoc`, `context` |
| `moduleLinkPhase` | Once per module, after analysis | `moduleDoc`, `context` |
| `packageLinkPhase` | Once, after every module | `customElementsManifest`, `context` |

- `create()` runs the core features first and the config's `plugins` after them in each phase (`src/create.js`). A user `packageLinkPhase` therefore sees inheritance already applied.
- `ts` is the analyser's own TypeScript 5.4.5. The 0.9.4 changelog warns that the TypeScript AST it hands to plugins changes with that version.

**Probe P4.** A 30-line plugin in the config did two things.

1. In `analyzePhase`, it read the class JSDoc tags `@role button` and `@aria aria-pressed aria-disabled` and wrote `"x-line": { role, aria }` on the declaration.
2. In `packageLinkPhase`, it set `formAssociated: true|false` on every declaration with a `tagName`, from the inherited static member.

The output for `line-probe-button` carried both fields, and ajv 8.20.0 validated the manifest against the `custom-elements-manifest@2.1.0` JSON Schema (probe P6). That schema sets no `additionalProperties: false`, so custom fields validate. The schema README names no convention for custom field names.

**Published alternatives (npm, 2026-10-19)**

| Package | Version | What it does |
|---|---|---|
| `@wc-toolkit/jsdoc-tags` | 1.2.1 (modified 2026-05-19) | Maps custom class and property JSDoc tags to custom manifest fields (`mappedName`, `isArray`) |
| `@wc-toolkit/cem-validator` | 1.3.0 | Validates the manifest and `package.json` wiring, as a script or a plugin; has a `schemaVersion` rule |
| `cem-plugin-custom-jsdoc-tags` | 1.2.0 (modified 2025-02-13) | Older single-maintainer predecessor of `@wc-toolkit/jsdoc-tags` |

### 2.7 Facts the G5 drift and coverage tests can read (Q4)

ARCHITECTURE §17.3 defines the drift test ("fails when a descriptor names an attribute, property, slot or event that `customElements.json` lacks") and the coverage test ("fails when a `@websublime/line-components` component in the CEM has no descriptor").

| Test need | Manifest fact | Reliability |
|---|---|---|
| Components to cover | `modules[]` whose `path` starts with `packages/line-components/src/`, `exports[]` of kind `custom-element-definition` (`name` is the tag) | Reliable. `LineElement` is also `customElement: true` without a tag, so a filter on `tagName` or on the definition export is needed. Module paths are source `.ts` paths, not package subpaths |
| Attributes | `attributes[].name`, `fieldName`, `type.text`, `default`, `deprecated` | Reliable for `@property` and `static properties` |
| Properties | `members[]` with `kind: "field"`; `attribute` present or absent tells attribute-backed from property-only | Reliable, but the list also holds private, protected, static and line-core inherited members, so the public API needs a filter on `privacy`, `static` and `inheritedFrom` |
| Value prop and form association | Member `formAssociated` (static, default `"true"`); member `value` | Present without a plugin |
| Slots | `slots[].name` (`""` is the default slot) | JSDoc only; a slot missing from `@slot` is invisible |
| Events | `events[].name`, `type.text`, `description` | Correct only for `@fires` names; dispatch detection misses arrow-field handlers and misnames event classes (§2.4) |
| `line-` prefix (Law 2) | `tagName`, `events[].name`, `cssProperties[].name` | Reliable as strings |
| Reflected variant enums (rule C6) | `reflects: true` and `type.text` union of string literals | The union is text, so a test must parse it |
| Typed event `detail` (rule C3) | `events[].type.text` | Text only |
| Descriptions and deprecations for the catalog | `description`, `summary`, `deprecated` on class, members, attributes and events | Reliable where the JSDoc exists |
| Inspector metadata (Principle 6) | Static members `version`, `docs`, `qa`, `scope` with their `default` | Present; overrides show their own default |
| ARIA role and states | — | Absent without a plugin |

- The analyser exposes `create({ modules, plugins, context })` and its own `ts` from the package index, and `cli({ argv, cwd, noWrite })` returns the manifest without writing it (`cli.js`). A test can build a manifest in memory with either.
- `customElements.json` is git-ignored (`.gitignore:9`) and written only by `bun --filter '@websublime/line-storybook' analyze`. In `checks.yml` that step runs last, after "Unit tier" (`bun test`) and "Storybook build".

### 2.8 Storybook consumption

- `@storybook/web-components` 10.6.2 reads the manifest only from a global that `setCustomElementsManifest()` or `setCustomElements()` sets. No code in it or in `@storybook/web-components-vite` 10.6.2 loads `customElements.json` from disk. The Storybook controls docs say to configure the manifest in `.storybook/preview.ts`.
- `apps/storybook/.storybook/preview.ts` never calls `setCustomElementsManifest`, so Storybook API tables get no manifest data today.
- When fed, Storybook maps `members`, `attributes`, `events`, `slots`, `cssProperties` and `cssParts` to argTypes and skips only members of kind `method`. Private fields, static fields and inherited line-core members would appear as rows [INFERENCE from `entry-preview-argtypes.js`, not run in a browser]. `cssStates` is not read.

### 2.9 TypeScript 7 observations (Q5, note only)

- The analyser parses each file with its own nested `typescript@5.4.5` through `ts.createSourceFile(…, ScriptTarget.ES2015, true)` and builds no program or type checker (`cli.js`). The workspace TypeScript version is not on that path.
- The analyser parsed the repo's TypeScript 5.9-era sources and the legacy-decorator probe (`experimentalDecorators: true` in `tsconfig.base.json`) without errors. Syntax newer than TypeScript 5.4 would go through the 5.4 parser. R11 owns the 7.x verdict.

---

## 3. Probes

All probes ran on 2026-10-19 in a `git archive HEAD` copy at commit `29f023b` with `git init` and `HOME=<tmpdir>`. Every directory was deleted afterwards and no probe code is committed.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `git archive HEAD \| tar -x -C $T && git init -q && HOME=$T bun install --frozen-lockfile` | 0 | 704 packages installed |
| P2 | `HOME=$T bun --filter '@websublime/line-storybook' analyze` on the unmodified tree | 0 | `schemaVersion` 1.0.0, 24 modules; `LineElement` is `customElement: true` without `tagName`, with three mixins and `superclass` `LitElement` from `lit` |
| P3 | Same command after adding `line-probe-button` (decorators, `extends FormAssociated(LineElement)` through package imports, full C7 JSDoc plus `@role`/`@aria`) and `line-probe-static` (`static properties`, relative import, `customElements.define`, own `static formAssociated`) under `packages/line-components/src/` | 0 | Output as in §2.2–§2.4; inherited `formAssociated` member present; `@role`/`@aria` dropped; arrow-field `line-input` missing; undocumented template part missing |
| P4 | `HOME=$T ./node_modules/.bin/custom-elements-manifest analyze --config probe-cem.config.mjs` (repo config plus the metadata plugin of §2.6 and an event-class probe) | 0 | `formAssociated: true` on both probe elements; `"x-line": { "role": "button", "aria": ["aria-pressed", "aria-disabled"] }`; event-class dispatch emitted as `name: "x"` |
| P5 | Same as P4 with a `line-probe-tags` element (`@slot old - … @deprecated …`, `@cssprop {<length>}`, `@deprecated` above a dispatch) | 0 | Slot deprecation kept inside `description`; CSS property got `type.text` `<length>`; dispatch-site event got `deprecated` |
| P6 | `HOME=$V bun add ajv@8 custom-elements-manifest@2.1.0`, then a Bun script that compiles `schema.json` and validates the P2, P3 and P4 manifests | 0 | All three `valid=true`, including the custom fields |
| P7 | `npm view @custom-elements-manifest/analyzer version dist-tags time --json` and the same for `custom-elements-manifest`, `storybook`, `@storybook/web-components`, `@wc-toolkit/*`, `cem-plugin-custom-jsdoc-tags` | 0 (one `E404` for the non-existent `@wc-toolkit/cem-deprecator`) | Versions in §2.1 and §2.6 |
| P8 | `gh issue view 136` and `gh issue view 79 -R webcomponents/custom-elements-manifest`; `gh api repos/<repo>/commits` for both upstream repos | 0 | Issue states and commit dates in §2.1 and §2.6 |
| P9 | `rm -rf` of every probe directory | 0 | Clean |

---

## 4. Fit with line://ui

- **Principle 8 and ARCHITECTURE §17.3.** A drift test against the manifest is feasible for attributes, properties and slots. Events need `@fires` on every event, because dispatch detection gives wrong or missing names.
- **ARCHITECTURE §17.3, "types are plain text".** Confirmed. Every `type`, including union enums and event `detail`, is a source string, because the analyser runs no type checker.
- **ARCHITECTURE §17.2 C1.** The manifest tells attribute-backed properties from property-only ones (`attribute: false`), which C1's JSON-serialisable input check can use.
- **ARCHITECTURE §17.2 C2 and Law 1.** Slots and parts exist in the manifest only through `@slot` and `@csspart`. A `part` or `slot` in a template without JSDoc is invisible, so the manifest alone cannot prove "every styleable zone exposes a `::part()`".
- **ARCHITECTURE §17.2 C7.** All six tags work natively at class level. Per-item `@deprecated` for slots, parts, CSS properties and `@fires` lines needs a plugin or a different convention.
- **Law 2.** Tag names, event names and CSS property names are plain strings in the manifest, so a `line-` prefix check can read them.
- **Law 7 and ARCHITECTURE §7.** Components that use the `FormAssociated` mixin carry a readable inherited `formAssociated` member without extra work.
- **Principle 6.** The Inspector's `version`, `docs`, `qa` and `scope` statics already appear as members.
- **Law 10 and ARCHITECTURE §17.1.** A repo-local analyser plugin lives in the root config and adds no runtime dependency to any published package.
- **PRD §5.1 and plan §7.1 ("CEM manifest generated and verified").** CI today asserts only that the file is written, and Storybook does not consume it (§2.8).
- **ARCHITECTURE §17.8 (Storybook 11 MCP, llms.txt from the CEM).** Storybook `next` is 11.0.0-alpha.6, so that trigger has not fired.

---

## 5. Contradictions

1. **ARCHITECTURE §17.3, `docs/ARCHITECTURE.md:1465`.** It says the CEM "carries no form-association or ARIA metadata". The probes show the manifest does carry form association, as the inherited static member `formAssociated` with `default: "true"`. The schema has no dedicated flag, and the ARIA half of the sentence holds. The sentence's conclusion, that the CEM cannot be the only source, still holds because of ARIA metadata and plain-text types.
2. **PRD §5.1, `docs/PRD.md:459–462`.** It describes "Lit source → CEM Analyzer → custom-elements.json → Storybook reads → API docs" and says Storybook "generates the API table without manual documentation". The repo does not deliver this today. `apps/storybook/.storybook/preview.ts` never calls `setCustomElementsManifest`, and `checks.yml` runs the analyser after the Storybook build. This is drift between the PRD and the repo, not a design conflict. The same false premise appears in these places.
   - `docs/specs/00-spec-design-system.md:1646` and `apps/storybook/.storybook/main.ts:24` ("CEM consumed automatically when customElements.json is present at the project root").
   - `docs/research/00-research-design-system-foundation.md:169` and `docs/research/00-research-design-system-foundation-round2.md:104`, `:172` ("auto-loads").
3. **Phase 00 spec §6.F.1 and §7.3, `docs/specs/00-spec-design-system.md:1660`, `:2483`.** They say Phase 00 emits an empty manifest, and so does the comment at `custom-elements-manifest.config.mjs:4–6`. The analyser emits 24 modules today, including `LineElement` as `customElement: true` (probe P2), because the glob covers every package.
4. **PRD §6.3, `docs/PRD.md:734`.** It says the manifest serves "Storybook, IDEs, and any tooling consuming the standard". The config sets `packagejson: false`, the output is git-ignored, and no published package ships it or declares a `customElements` field. IDE tooling that looks up installed packages cannot find it. This is a gap between the PRD and the wiring, not a research finding against the PRD.

---

## 6. Open questions for the spec

| # | Question | Options | Evidence that decides |
|---|---|---|---|
| OQ1 | How does the manifest express form association? | (a) Read the inherited static member `formAssociated`. (b) A repo plugin writes an element-level custom field (the name issue #136 proposes is `formAssociated`). (c) The descriptor alone states it. | Whether the drift test must cross-check the descriptor's binding map against form association; whether tools outside the repo need the flag; status of issue #136 |
| OQ2 | Where does ARIA metadata (role, states) live? | (a) The descriptor only (ARCHITECTURE §17.3 accessibility requirements). (b) Custom JSDoc tags plus a repo plugin writing custom fields (probe P4). (c) `@wc-toolkit/jsdoc-tags` 1.2.1 as a dev dependency. | Whether any consumer besides the descriptor needs it; dev-dependency policy; tag and field naming, given that the schema names no convention |
| OQ3 | What is the source of truth for events? | (a) `@fires` is mandatory for every event and the drift test reads only JSDoc-described events. (b) A plugin drops or fixes dispatch-detected events. (c) Accept dispatch detection and constrain how components dispatch. | The Button and Icon implementations (C1–C4): whether they dispatch from arrow fields or event classes |
| OQ4 | Where do the G5 tests get the manifest? | (a) Read `apps/storybook/customElements.json` and move the analyse step before the unit tier in `checks.yml`. (b) Build it in memory through `create()` or `cli({ noWrite: true })`. (c) Emit it during the `line-components` build. | CI order, test runtime, whether the tests should test the same file that ships (retrospective lesson 5) |
| OQ5 | Does a published package ship the manifest (PRD §6.3)? | (a) Storybook-only, as now. (b) A manifest scoped to `line-components` inside the package, with a `customElements` field and a `files` entry. | PRD §6.3 intent, `verify-pack` coverage, size, the need for module paths that point at `dist` rather than `src` |
| OQ6 | Which members count as public API for the drift and coverage tests and for Storybook? | (a) Filter by `privacy`, `static` and `inheritedFrom` in the tests. (b) A plugin strips private, static and line-core internals. (c) `@internal` tags in `line-core`. | The probe member list (§2.3); Storybook argTypes after the fix of contradiction 2; the `inheritedFrom` quirk on overrides |
| OQ7 | How is per-item deprecation written (rule C7 `@deprecated`)? | (a) Only class- and member-level deprecation. (b) A plugin parses a deprecation marker inside `@slot`, `@csspart`, `@cssprop` and `@fires` lines into the schema's `deprecated` field. | Whether the catalog must deprecate single slots or events (ARCHITECTURE §17.3 "enriches descriptions and deprecations") |
| OQ8 | Which `schemaVersion` does the manifest claim? | (a) Keep the analyser's `1.0.0`. (b) A plugin sets `2.1.0` and maps `@cssprop {type}` to `syntax`. | Consumers that check the version (`@wc-toolkit/cem-validator` `schemaVersion` rule, Storybook 11 docgen) |
| OQ9 | Does the Storybook wiring get fixed in Phase 1? | (a) `setCustomElementsManifest` in `preview.ts` and the analyse step before the Storybook build. (b) Leave it until Storybook 11. | Plan §7.1 "Storybook documentation complete for every component"; contradiction 2 needs a Phase 00 spec `AM-nnn` either way |

---

## 7. Sources

All retrieved 2026-10-19.

- npm `@custom-elements-manifest/analyzer`: https://www.npmjs.com/package/@custom-elements-manifest/analyzer
- Analyser source 0.11.0 (installed): `node_modules/@custom-elements-manifest/analyzer/{cli.js,index.d.ts,src/create.js,src/features/**}`; repo https://github.com/open-wc/custom-elements-manifest
- Analyser docs, getting started and JSDoc: https://custom-elements-manifest.open-wc.org/analyzer/getting-started/
- Analyser plugin docs: https://custom-elements-manifest.open-wc.org/analyzer/plugins/intro/
- Schema 2.1.0 (`schema.json`, `schema.d.ts`, README): https://github.com/webcomponents/custom-elements-manifest; npm https://www.npmjs.com/package/custom-elements-manifest
- Schema PR #128 (CSS custom states): https://github.com/webcomponents/custom-elements-manifest/pull/128
- Issue #136, `formAssociated` flag: https://github.com/webcomponents/custom-elements-manifest/issues/136
- Issue #79, `formAssociated` in schema: https://github.com/webcomponents/custom-elements-manifest/issues/79
- Storybook controls docs (web components, manifest setup in `preview.ts`): https://raw.githubusercontent.com/storybookjs/storybook/next/docs/essentials/controls.mdx
- `@storybook/web-components` 10.6.2 dist (`entry-preview-argtypes.js`, `_browser-chunks/chunk-6OBW3LSX.js`), installed under `node_modules/.bun/`
- `@wc-toolkit/jsdoc-tags`: https://www.npmjs.com/package/@wc-toolkit/jsdoc-tags
- `@wc-toolkit/cem-validator`: https://www.npmjs.com/package/@wc-toolkit/cem-validator
- `cem-plugin-custom-jsdoc-tags`: https://www.npmjs.com/package/cem-plugin-custom-jsdoc-tags
- ajv 8.20.0: https://www.npmjs.com/package/ajv
