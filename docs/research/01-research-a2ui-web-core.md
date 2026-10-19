# Research: A2UI v0.9.1 and `@a2ui/web_core`

**Row:** `00-Z32` (Phase 1 plan §5.1 R1, with §5.3)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.1, §5.1, §5.3, §5.5, §6, §7.2, §8; `docs/ARCHITECTURE.md` §17; `docs/PRD.md` §2 (stack row, §2.1), §7.3, Appendix D; `docs/research/00-research-generative-ui.md` §2.2, §4.4–§4.6; root and package `package.json`; `bun.lock`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - **Version.** `@a2ui/web_core` 0.13.0 (published 2026-10-09) was `latest` on 2026-10-14. 0.14.0 was published on 2026-10-17 and is `latest` on 2026-10-19, with 12 entries marked BREAKING. Both declare `lit ^3.3.3`, `zod ^3.25.76`, `@lit/context ^1.1.6`, `zod-to-json-schema ^3.25.2`, `@preact/signals-core ^1.14.2`, `validate-color ^2.2.4` and `redos-detector ^6.1.4`, and no `peerDependencies`. These ranges resolve to the repo's locked `lit@3.3.3` and `zod@3.25.76` with no nested copy. Zod `latest` is 4.6.7, and upstream `main` still declares `zod ^3.25.76`.
> - **Subpaths.** A catalog needs `@a2ui/web_core/catalog` (`Catalog`, `spec`, `specDef`) and `@a2ui/web_core/v0_9` (Zod 3 common types `DynamicStringSchema`, `DynamicNumberSchema`, `DynamicBooleanSchema`, `DynamicStringListSchema`, `DynamicValueSchema`, `ComponentIdSchema`, `ChildListSchema`, `ActionSchema`, `CheckableSchema`, `AccessibilityAttributesSchema`, …). A renderer needs `@a2ui/web_core/v0_9` (`MessageProcessor`, `SurfaceModel`, `NodeResolver`, `GenericBinder`, `ComponentContext`, error classes, `STRICT_VALIDATION`, `RELAXED_VALIDATION`). `renderA2uiNode` lives in `@a2ui/web_core/v0_9/universal`, and the basic catalog lives in `@a2ui/web_core/v0_9/basic_catalog`. The catalog and core imports run without a DOM and pull in no Lit.
> - **Meta-schema.** A2UI v0.9.1 publishes no standalone catalog meta-schema. The only catalog-shaped schema is `client_capabilities.json#/$defs/Catalog`, the inline-catalog form with `additionalProperties: false`. The published v0.9.1 basic catalog document fails it, and the inline form that `web_core` generates passes it. In 0.14.0, `Catalog.toJson()` emits the catalog document, `Catalog.validationSchema` emits the bundled validator, and `Catalog.catalogSchema` is deprecated. 0.13.0 has only `catalogSchema`. The helpers `dynamicString(description)` and `componentId({description})` emit the literal text `${description}` in 0.13.0 and 0.14.0 (an upstream bug), and `.describe()` on a common type replaces its `$ref` with an inline `oneOf`.
> - **Projection inputs for R2.** `renderA2uiNode` returns a Lit directive. It creates the element by tag and sets the `node` and `context` properties on it. It calls `customElements.define` itself only when the catalog entry carries an `element` constructor. An entry that carries only `tagName` renders an undefined element that upgrades in place when defined later (probed). The models path is `NodeResolver`. It gives a signal tree of `ComponentNode`s whose `props` hold `ResolvedBinding` and `WritableBinding` values, action functions and child nodes. Placeholder nodes carry the states `pending`, `unknown-type` and `cyclic`, and `node.id` stays stable for the node's lifetime.
> - **Throw paths.** `processMessages` throws synchronously at the first failing message. Earlier messages stay applied and later ones are skipped. One `updateComponents` message is atomic, because its validation pass runs before its mutation pass. Unknown types, dangling references, cycles and the depth limit throw only when a `validationConfig` is set. `STRICT_VALIDATION` rejects progressive streaming, and `RELAXED_VALIDATION` accepts it. Expression errors, unknown types and cycles found while resolving reach `surface.onError` instead of throwing. `web_core` knows the basic catalog only under `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`, and the `v0_9_1` URL that the v0.9.1 protocol examples use throws `Catalog not found`.
> - **v1.0 and icons.** A2UI v1.0 is a "Candidate" spec and a "release candidate" in the README. The roadmap targets Q4 2026, and the v1.0 spec still changed on 2026-10-13 and 2026-10-15. v0.9.1 catalogs do not run on v1.0 runtimes. The basic catalog `Icon.name` enum holds the same 59 names in v0.9.1 and in the v1 basic catalog of `web_core` 0.14.0 (list in §2.6).

---

## 1. Question

Plan §5.1 R1 asks for "Current version (0.13.0 on 2026-10-13; the research note of 2026-10-06 saw 0.12.0), its `zod` and `lit` ranges, the catalog meta-schema, common-type schemas, `renderA2uiNode` vs models/binder, every throw path, A2UI v1.0 status". Plan §5.3 adds "`@a2ui/web_core` moved from 0.12.0 to 0.13.0 within one week. R1 re-verifies the version before the spec pins it."

1. Which `@a2ui/web_core` version is current, and what is its release history?
2. Do its `dependencies` and `peerDependencies` fit the repo's `lit` and `zod ^3.25.76`?
3. What does its `exports` map hold, and which subpaths do a renderer and a catalog need?
4. Where do the v0.9.1 catalog meta-schema and the common-type schemas live, and how does a custom catalog validate against them?
5. What do `renderA2uiNode` and the models and binder APIs each do, and what are their lifecycle and data binding?
6. Which throw paths must a renderer handle?
7. What is the A2UI v1.0 status, and what breaks from v0.9.1?
8. Where does the current package contradict ARCHITECTURE §17 and the 2026-10-06 note §4.4–§4.6?

## 2. Findings

All facts were retrieved on 2026-10-19 unless a row says otherwise.

### 2.1 Version and release history

`npm view @a2ui/web_core time` (P1) gives this history for the 0.9.x line onward.

| Version | Published (UTC) | Days after previous | Notes |
|---|---|---|---|
| 0.9.1 | 2026-04-16 | — | |
| 0.10.0 – 0.10.7 | 2026-05-12 – 2026-09-01 | — | 8 releases |
| 0.11.0 | 2026-09-12 | 11 | |
| 0.12.0 | 2026-09-28 | 16 | Seen by the 2026-10-06 note |
| 0.13.0 | 2026-10-09 | 11 | `latest` on 2026-10-14 |
| 0.14.0 | 2026-10-17 | 8 | `latest` on 2026-10-19; the only dist-tag is `latest` |

- `@a2ui/lit` releases in lockstep (0.13.0 on 2026-10-09, 0.14.0 on 2026-10-17), and 0.14.0 depends on `@a2ui/web_core ^0.14.0` (P2).
- GitHub releases of `a2ui-project/a2ui` list only Python packages, so npm and `CHANGELOG.md` inside the tarball are the primary sources for `web_core`.
- The 0.14.0 changelog marks 12 entries BREAKING. The ones a line renderer or catalog touches are listed below.
  - `CatalogInterface` requires `toJson()` and `validationSchema`.
  - `validationSchema` (formerly `catalogSchema`) changes shape, because each function becomes the schema of a wire function call.
  - `ComponentModel.catalog` and its constructor argument become required, and `renderA2uiNode` takes a `Catalog` again.
  - `SurfaceModel.catalog` may return `undefined`.
  - `DataContext.isV10` is renamed to `atLeastV10`.
  - `DataContext.functionInvoker` throws `A2uiCatalogError` on a surface without a default catalog.
  - `DataContext` reports an unresolvable function-call catalog as `CATALOG_ERROR` instead of `EXPRESSION_ERROR`, and ignores a call's `catalogId` below v1.0.
  - Every class the basic catalog elements render gains the `a2ui-` prefix.
  - Three more entries change v1.0-only catalog resolution.
- The 0.13.0 changelog marks one entry BREAKING. `ComponentModel.componentTree` names the type under `component` instead of `type`.
- 0.12.0 moved the universal web component symbols, including `renderA2uiNode`, from `@a2ui/web_core/v0_9` to `@a2ui/web_core/v0_9/universal`, and stopped defining basic-catalog custom elements on import.

### 2.2 Dependencies against the repo

| Dependency | 0.12.0 | 0.13.0 | 0.14.0 | Repo |
|---|---|---|---|---|
| `lit` | `^3.3.3` | `^3.3.3` | `^3.3.3` | `^3.3.3` (root, `line-core`); lock `3.3.3` |
| `zod` | `^3.25.76` | `^3.25.76` | `^3.25.76` | `^3.25.76` (root, `line-schemas`); lock `3.25.76` |
| `@lit/context` | `^1.1.6` | `^1.1.6` | `^1.1.6` | — |
| `zod-to-json-schema` | `^3.25.2` | `^3.25.2` | `^3.25.2` | — |
| `@preact/signals-core` | `^1.14.2` | `^1.14.2` | `^1.14.2` | — |
| `validate-color` | `^2.2.4` | `^2.2.4` | `^2.2.4` | — |
| `redos-detector` | — | `^6.1.4` | `^6.1.4` | — |
| `peerDependencies` | none | none | none | |

- `npm view` dist-tags on 2026-10-19 report `zod` 4.6.7, `lit` 3.3.3, `@lit/context` 1.1.6 and `zod-to-json-schema` 3.25.2 as `latest`.
- `web_core` imports `'zod'` in 47 modules and `'zod-to-json-schema'` in 6 (0.14.0 tarball). Under `zod@3.25.x`, the bare `'zod'` specifier is the Zod 3 API.
- A clean install of `@a2ui/web_core@0.14.0` (and of 0.13.0) with `lit@3.3.3` and `zod@3.25.76` resolves one `zod` and one `lit`, with no nested `node_modules` under `web_core` (P4).
- Upstream `main` (commit `cbaa5ee`, 2026-10-17) still declares `zod ^3.25.76`. Issues #2002 ("Consider making `zod` a peer dependency", opened 2026-07-14) and #2160 ("Abstract dependency on Zod", opened 2026-08-03) are open. PR #2753, which would make `GenericBinder` schema classification Zod-version-agnostic, is open.
- The package declares `"sideEffects": false`, `"type": "module"` and the license Apache-2.0.

### 2.3 Exports map and the subpaths each side needs

The 0.13.0 and 0.14.0 maps are identical. 0.13.0 added `./universal` and `./catalogs/basic/v1` and removed `./v1_0/basic_catalog` relative to 0.12.0 (P3). The map has 27 entries.

| Subpath | What it gives | Catalog side | Renderer side |
|---|---|---|---|
| `./catalog` | `Catalog`, `CatalogApi`, `createFunctionImplementation`, `linkCatalogs`, `JsonComponentApi`, `JsonFunctionApi`, `spec`, `specDef` | Yes | Yes |
| `./v0_9` | Zod 3 common types and helpers (`dynamicString`, `componentId`, `childList`, …), `MessageProcessor`, `SurfaceModel`, `SurfaceGroupModel`, `DataModel`, `ComponentModel`, `NodeResolver`, `GenericBinder`, `ComponentContext`, `DataContext`, error classes, signals (`effect`, `signal`, `setSignalImplementation`), integrity checks with `STRICT_VALIDATION` and `RELAXED_VALIDATION`, and a re-export of `./v0_9/basic_catalog` | Common types | Core |
| `./v0_9/universal` (same module as `./universal`) | `renderA2uiNode`, `A2uiLitElement`, `A2uiController`, `registerUniversalElement`, `isWebComponentImplementation`, `WebComponentImplementation` | — | Only for the `renderA2uiNode` technique |
| `./v0_9/basic_catalog` | `basicCatalog`, the basic component APIs and Lit elements, `BASIC_FUNCTIONS`, `setMarkdownRenderer` | Basic schemas | Basic functions |
| `./validation` | `PayloadValidator`, integrity checks | Optional | Optional |
| `./errors` | `A2uiError` and subclasses | — | Optional (also in `./v0_9`) |
| `./v1_0`, `./v0_8`, `./rpc`, others | Other protocol versions, v1.0 RPC | — | — |

Bun 1.4.3 `bun build --minify --target browser` weights for three import sets (P12):

| Import set | Bundled deps, gzip | `zod`, `lit` and the other deps external, gzip | Lit in bundle |
|---|---|---|---|
| `Catalog` plus four common-type schemas | 49.4 KB | 29.0 KB | No |
| `MessageProcessor`, `NodeResolver` | 71.0 KB | 50.7 KB | No |
| The above plus `renderA2uiNode` | 80.8 KB | 51.2 KB | Yes |
| `basicCatalog` | 110.5 KB | 77.9 KB | Yes |

- These numbers come from Bun's bundler, not the repo's Vite 8 build, so R2 and R9 re-measure on the real build.
- Importing `@a2ui/web_core/v0_9` and `@a2ui/web_core/catalog` under Bun with no DOM global succeeds and defines no element (P5).

### 2.4 Catalog meta-schema and common-type schemas

#### 2.4.1 What A2UI v0.9.1 publishes

- `specification/v0_9_1/` holds `json/` (11 schemas), `catalogs/basic/catalog.json`, `docs/` and `test/`. The README marks it "the current production release" and "closed".
- v0.9.1 differs from v0.9 in the MIME type (`application/a2ui+json`) and in relaxing `surfaceId` uniqueness to active surfaces (`v0_9_1/docs/evolution_guide.md`). Byte comparison shows `common_types.json`, `client_capabilities.json` and `catalogs/basic/catalog.json` are identical in `v0_9/` and `v0_9_1/`. `server_to_client.json`, `client_to_server.json` and `client_data_model.json` change only to accept `"v0.9"` or `"v0.9.1"` as `version`.
- Every `$id` inside `v0_9_1/` still points at `https://a2ui.org/specification/v0_9/…`, and the basic catalog's `catalogId` is `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`. The protocol examples in `v0_9_1/docs/a2ui_protocol.md` (lines 195 and 288) use `…/v0_9_1/catalogs/basic/catalog.json` instead.
- No file named as a catalog meta-schema exists for v0.9 or v0.9.1. The protocol says a custom catalog "should have the same form as the basic catalog and use common elements in the `common_types.json` schema" (§"The Basic Catalog"). It also requires `ComponentId` and `ChildList` `$ref`s for child references, so validators can check the tree (§"Validator compliance when defining catalogs").
- The only catalog-shaped schema is `client_capabilities.json#/$defs/Catalog`, the inline-catalog form. It allows `catalogId` (required), `components`, `functions` (an array of `FunctionDefinition`) and `theme`, with `additionalProperties: false`. The basic catalog document instead writes `functions` as a map and adds `$schema`, `$id`, `title`, `description` and `$defs`.
- v1.0 adds `specification/v1_0/json/catalog_definition.json`, the first catalog meta-schema. Its `protocolVersion` defaults to `"0.9"`, yet it expects v1.0 shapes such as `@call`.

#### 2.4.2 Validation probes

| Document | Against | Result (P5, P10, P11) |
|---|---|---|
| Published v0.9.1 basic catalog | `client_capabilities.json#/$defs/Catalog` | Fails on `$schema`, `$id`, `title`, `description` |
| `web_core` `toJson()` of a code-defined line catalog | `client_capabilities.json#/$defs/Catalog` | Fails on `protocolVersion` and `$defs` |
| `web_core` `getClientCapabilities({versions: ['v0.9'], includeInlineCatalogs: true})` | `client_capabilities.json` | Valid; inline catalogs carry `catalogId`, `components`, `functions` (array) |
| Same with `versions: ['v0.9.1']` only | `client_capabilities.json` | Fails, because the schema requires the `v0.9` key |
| Published v0.9.1 basic catalog | v1.0 `catalog_definition.json` | Fails on `$defs.CatalogComponentCommon`, `$defs.theme`, `call` vs `@call` |
| `toJson()` of the line catalog with `declaredProtocolVersion: null` | v1.0 `catalog_definition.json` | Fails, because v1.0 requires `$defs.anyFunction` |
| `Catalog.validationSchema` of the line catalog | Ajv 2020-12 compile | Compiles |
| `Catalog.fromJson(doc).toJson()` | `doc` | Equal |
| `basicCatalog.toJson()` | Published v0.9.1 basic file | Deep-equal (key order differs) |

#### 2.4.3 Common types in `web_core`

- `src/v0_9/schema/common-types.js` is generated from `specification/v0.9/json/` by `generate-schemas.mjs`. It exports Zod 3 schemas for `ComponentId`, `DataBinding`, `DynamicValue`, `FunctionCall`, `DynamicString`, `DynamicNumber`, `DynamicBoolean`, `DynamicStringList`, `AccessibilityAttributes`, `ComponentCommon`, `ChildList`, `CheckRule`, `Checkable` and `Action`.
- Each schema carries a `REF:#/$defs/<Name>|<description>` marker in its Zod description. The generator turns the marker into `"$ref": "common_types.json#/$defs/<Name>"`. `ComponentId` and `ChildList` also carry a metadata marker that survives `.describe()` (0.11.0).
- A code-defined component schema is a Zod object of its properties without `id` and `component` (`ComponentApi.schema` doc). `toJson()` adds `component: {const: <name>}` and `$defs.anyComponent`.
- `toJson()` for a code-defined v0.9 catalog writes `protocolVersion` unless `CatalogOptions.declaredProtocolVersion` is `null`, as the basic catalog sets it. It writes no `$schema` or `$id` unless `schemaUri` and `schemaId` are set.
- `toJson()` and `validationSchema` print `Recursive reference detected … Defaulting to any` through `zod-to-json-schema` for each property that holds a `FunctionCall`. The emitted properties still use `$ref` to the common types (P5).
- `DynamicStringSchema.describe('Plain describe')` drops the marker, so `toJson()` writes an inline `oneOf` of string, `DataBinding` and `FunctionCall` instead of the `$ref` (P5).
- `dynamicString('Visible label')` emits `"description": "${description}"`. The source writes `` `REF:#/$defs/DynamicString|\${description}` ``, and the escaped `$` stops interpolation. The same bug affects `dynamicNumber`, `dynamicBoolean`, `dynamicValue`, `dynamicStringList` and `componentId` in 0.13.0, 0.14.0 and `main` at `cbaa5ee` (P5, `src/v0_9/schema/helpers.ts:55`).
- In 0.14.0 a catalog defined in code can annotate its schemas with `spec()` and `specDef()` so `toJson()` writes `allOf` mixins, `$defs` names and keywords such as `format`, as the basic catalog does.

### 2.5 `renderA2uiNode` versus the models and binder

#### 2.5.1 Shared core

- `new MessageProcessor(catalogs, actionHandler?, {validationConfig?, version?, …})` owns a `SurfaceGroupModel`. In 0.14.0 it works on linked copies of the catalogs passed in.
- `processMessages(payload)` accepts one message, an array, or a `{messages}` wrapper. Each message must carry `version` (`"v0.9"` or `"v0.9.1"` for this protocol) and exactly one of `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`.
- `onSurfaceCreated` and `onSurfaceDeleted` report surface lifecycle. A `SurfaceModel` holds `dataModel`, `componentsModel`, `theme`, `onAction`, `onError` and `onWarning`. `deleteSurface` disposes it.
- `createSurface.theme` is validated only when the surface catalog has a `themeSchema` (`message-processor.js:540`). A line catalog without one stores agent theme hints unvalidated.
- Actions reach the processor's `actionHandler` as `{name, surfaceId, sourceComponentId, timestamp, context, catalogId?, userMessage?}`, with `context` resolved against the data model (P7). Errors that listeners throw are caught and logged by the event emitter.
- `getClientCapabilities({versions, includeInlineCatalogs})` builds `a2uiClientCapabilities` (§2.4.2).

#### 2.5.2 Models and binder

- `new NodeResolver(surface)` (0.14.0) or `new NodeResolver(surface, surface.defaultCatalog)` (0.13.0, where the argument is required). Passing any other catalog instance throws `A2uiStateError` (P7).
- `resolver.rootNode` is a signal of the root `ComponentNode`. Each node exposes `id` (unique and stable, since 0.13.0), `instanceId`, `componentId`, `type`, `dataPath`, `impl` (the catalog entry), `context`, `state`, a `props` signal, `onDestroyed` and `addCleanup`.
- Resolved `props` hold a `ResolvedBinding` or `WritableBinding` (`value`, and `set` when the payload bound a `{path}`) for each dynamic property, a function for each `Action`, a `ComponentNode` for each `ComponentId`, and an array of nodes for each `ChildList` (P7).
- A missing child appears as a placeholder node with `state: "pending"` and upgrades in place on arrival. An unknown type and a cycle appear as placeholders and are reported once through `surface.onError` with codes `UNKNOWN_COMPONENT_TYPE` and `CYCLIC_REFERENCE` (`node-resolver.js:233`, `:310`).
- Template `ChildList`s spawn one node per array item, capped at `MAX_DYNAMIC_CHILD_LIST_SIZE` = 10000.
- `GenericBinder(context, schema)` underlies each node. It resolves dynamic values, generates `set<Prop>` setters for two-way binding, binds `checks` into `isValid` and `validationErrors`, resolves `accessibility` and caches action closures, which return `Promise<void>`.
- `resolver.dispose()` tears down every binder and subscription and marks nodes `disposed` (P9).
- Signals default to `@preact/signals-core` and can be swapped through `setSignalImplementation`.

#### 2.5.3 `renderA2uiNode`

- Signatures are `renderA2uiNode(node)` and `renderA2uiNode(context, catalog)`. The result is a Lit `DirectiveResult` or `nothing`, so it renders only inside a Lit template.
- The directive keeps one element per child position and recreates it only when the tag changes (0.13.0). It creates the element with `document.createElement(tagName)` and assigns `element.node` and `element.context`.
- When the entry carries both `tagName` and an `element` constructor (`WebComponentImplementation`), it calls `registerUniversalElement`, an eager `customElements.define`. A different constructor already bound to the tag throws `Error("Custom element tag name collision …")` (P9).
- When the entry carries only `tagName`, nothing is defined. The probe rendered `<probe-stack>` undefined, then defined it later, and the element upgraded in place (P9).
- A placeholder, disposed or context-less node renders `nothing`. An entry without `tagName` logs `console.warn` and renders `nothing`.
- The rendered element must accept `node` or `context`. `A2uiLitElement` is the upstream base class for that contract. It renders into light DOM by default and is marked `@experimental`.
- `@a2ui/lit` 0.14.0 `<a2ui-surface>` uses this function and renders into light DOM (`createRenderRoot() { return this; }`). Its changelog lists the move from a shadow root to light DOM as BREAKING in 0.14.0 (PR #3154).

| Aspect | `renderA2uiNode` | Models and binder |
|---|---|---|
| Entry point | `@a2ui/web_core/v0_9/universal` | `@a2ui/web_core/v0_9` |
| DOM creation | Lit directive, one element per node, by tag | Up to the renderer |
| What the element receives | `node` and `context` properties | Up to the renderer |
| Lit in the bundle | Yes (§2.3) | No |
| Element definition | Eager when the entry carries `element`; none with `tagName` only | Up to the renderer |
| Placeholders | Renders `nothing` | Placeholder nodes with a state |
| Children | Each parent element renders its own children | The renderer walks `props` |

### 2.6 Basic catalog facts the wave-2 items need

- Basic catalog id in `web_core`: `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`, `protocolVersion` `"0.9"`.
- Components (18): Text, Image, Icon, Video, AudioPlayer, Row, Column, List, Card, Tabs, Modal, Divider, Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput.
- Functions (14): `required`, `regex`, `length`, `numeric`, `email`, `formatString`, `formatNumber`, `formatCurrency`, `formatDate`, `pluralize`, `openUrl`, `and`, `or`, `not`. `openUrl` accepts only `http:` and `https:` (0.10.2) and throws `USER_ACTIVATION_REQUIRED` when evaluated passively (0.13.0).
- `Icon.name` is `oneOf` a 59-name enum or a path binding. The names are accountCircle, add, arrowBack, arrowForward, attachFile, calendarToday, call, camera, check, close, delete, download, edit, event, error, fastForward, favorite, favoriteOff, folder, help, home, info, locationOn, lock, lockOpen, mail, menu, moreVert, moreHoriz, notificationsOff, notifications, pause, payment, person, phone, photo, play, print, refresh, rewind, search, send, settings, share, shoppingCart, skipNext, skipPrevious, star, starHalf, starOff, stop, upload, visibility, visibilityOff, volumeDown, volumeMute, volumeOff, volumeUp, warning.
- The v1 basic catalog in `web_core` 0.14.0 (`./catalogs/basic/v1`) has the same 59 names, none added or removed.

### 2.7 Throw paths a renderer must handle (0.14.0 source)

`processMessages` and `processMessagesAsync` run messages in order with no rollback across messages (P8).

| Where | When it throws | Class (`code`) | Config needed |
|---|---|---|---|
| Version adapter | Missing or non-string `version`; unsupported version; zero or several actions in one message; Zod parse failure of the envelope; non-string `surfaceId` | `A2uiValidationError` (`VALIDATION_ERROR`) | None |
| `validateRecursionAndPaths` | Payload depth > 50; function-call depth > 5; invalid JSON Pointer syntax | `A2uiRecursionError` (`RECURSION_ERROR`), `A2uiValidationError` | Any `validationConfig` |
| `targetVersion`, `allowedMessages` | Message version or operation type not allowed | `A2uiValidationError` | Those fields |
| `createSurface` | Unknown `catalogId`; no default catalog; catalog version ≠ message version; surface already exists; theme fails `themeSchema` | `A2uiCatalogError` (`CATALOG_ERROR`), `A2uiValidationError`, `A2uiIntegrityError` (`INTEGRITY_ERROR`) | None |
| `updateComponents` validation pass | Unknown surface; duplicate id in the batch; missing `id`; no type on a new component; property schema failure; `allowedParents` or `allowedChildren` violation | `A2uiIntegrityError`, `A2uiValidationError` (also `UNALLOWED_PARENT`, `UNALLOWED_CHILD`) | None |
| `updateComponents` validation pass | Unknown component type | `A2uiValidationError` | `allowUnknownElements: false` |
| Candidate topology | Missing root; dangling reference; orphan; self-reference or cycle; logical depth limit | `A2uiIntegrityError`, `A2uiRecursionError` | Any `validationConfig`; the flags decide which |
| `updateDataModel` | Unknown surface; forbidden segment (`__proto__` and similar); primitive in the path; non-numeric array segment; array index above the maximum | `A2uiIntegrityError`, `A2uiDataError` (`DATA_ERROR`) | None |
| `new NodeResolver` | Catalog instance ≠ `surface.defaultCatalog` | `A2uiStateError` (`STATE_ERROR`) | — |
| `new ComponentContext` | Component id not in the surface | `A2uiStateError` | — |
| `registerUniversalElement` (inside `renderA2uiNode`) | Tag bound to another constructor | `Error` | — |
| `A2uiLitElement` | Subclass defines no `api` and overrides no `createController()` | `Error` | — |
| `WritableBinding.set` and binder setters | The `DataModel.set` cases above, at interaction time | `A2uiDataError` | — |
| `new Catalog` | Empty `protocolVersion` | `A2uiCatalogError` | — |
| `Catalog.fromJson` | Missing catalog id; unresolvable `$ref`; invalid UAX #31 identifier | `Error`, `A2uiCatalogError` | — |
| `MessageProcessor.getClientCapabilities` | Empty `versions` | `A2uiValidationError` | — |
| `MessageProcessor.getRendererDataModel` | No version given while active surfaces use several versions | `A2uiValidationError` | — |

These failures do not throw. They reach `surface.onError` instead.

- Expression and function errors (`EXPRESSION_ERROR`), including parser errors, unknown functions, argument validation, unsafe regex and `requiresUserActivation` (P7).
- `UNKNOWN_COMPONENT_TYPE` and `CYCLIC_REFERENCE` from `NodeResolver`.
- `callRendererFunction` failures (v1.0 RPC), which are logged with `console.error`.

Probe outcomes by configuration (P8):

| Case | No `validationConfig` | `RELAXED_VALIDATION` | `STRICT_VALIDATION` |
|---|---|---|---|
| Root first, child arrives in a later message | Accepted | Accepted | Throws (dangling, then missing root) |
| Unknown component type | Accepted (placeholder) | Accepted (placeholder) | Throws |
| Self-cycle | Accepted (placeholder, `CYCLIC_REFERENCE`) | Throws | Throws |
| Data value nested 60 deep | Accepted | Throws | Throws |
| Batch `[ok, schema-invalid, ok]` | First applied, throw, third skipped | Same | Same |

The v0.9.1 `error` message (`client_to_server.json`) has two forms. `VALIDATION_FAILED` requires `surfaceId`, a JSON Pointer `path` and `message`, and the generic form takes any other `code`. `web_core` errors carry Zod issues relative to the component (`details`) and no wire-level JSON Pointer.

### 2.8 A2UI v1.0 status

- `specification/v1_0/README.md` says "This specification is currently a candidate for becoming stable" and "There is a high bar for accepting breaking changes". The protocol doc header says "Status: Candidate" and "Last Updated: Jun 8, 2026".
- The repository README says "Early stage public preview". It names v0.9.1 "the current production release" and v1.0 "a release candidate", and expects changes. `docs/public/roadmap.md` lists "Q4 2026 v1.0" with "Stability guarantees" and "Migration path from v0.9".
- Commits touching `specification/v1_0` continue. They include the `@path` and `@call` reserved prefix (2026-10-02, after a revert on 2026-09-29), prose and schema fixes (2026-10-12), an optional `surfaceId` on `callRendererFunction` (2026-10-13), a v1 MCP catalog (2026-10-13) and cross-catalog `$ref` resolution (2026-10-15).
- The v0.9 → v1.0 evolution guide lists these breaking changes among others.
  - `"path"` and `"call"` become `"@path"` and `"@call"` in dynamic values, and `@index` is added.
  - `theme` and `primaryColor` are removed from catalogs and `createSurface`.
  - `createSurface.catalogId` becomes optional and may carry `components` and `dataModel`. Components and calls may name their own `catalogId`, and catalogs mix within a surface.
  - Catalog `functions` become a map, `protocolVersion: "1.0"` is required, `instructions`, `allowedParents` and `allowedChildren` are added, and UAX #31 names are enforced.
  - Check functions return `ValidationResult`. `AccessibilityAttributes` gains `live` and `hidden` and closes with `additionalProperties: false`.
  - `updateDataModel.value` becomes required, and `null` deletes.
  - Bidirectional RPC arrives through `callRendererFunction` and `callAgentFunction`.
  - Files are renamed from client/server to renderer/agent.
  - The guide states "Catalogs authored for v0.9 cannot be used directly with v1.0 protocol runtimes".
- `web_core` 0.14.0 already ships `./v1_0` and `./catalogs/basic/v1`. A v0.9 catalog (`protocolVersion` `"0.9"`) rejects a `"v1.0"` message with `A2uiValidationError` (P7).

## 3. Probes

All probes ran on 2026-10-19 under Bun 1.4.3 in `mktemp -d` (`/var/folders/…/tmp.jKYOjWNQ9x`) with `HOME` set to that directory. The directory was deleted afterwards.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view @a2ui/web_core version dist-tags time dependencies peerDependencies exports --json` | 0 | `latest` 0.14.0; history in §2.1; seven dependencies; no peers; 27 exports |
| P2 | `npm view @a2ui/web_core@{0.12.0,0.13.0} dependencies`; `npm view @a2ui/lit …`; `npm view {zod,lit,@lit/context,zod-to-json-schema} dist-tags` | 0 | §2.2 table; `zod` `latest` 4.6.7 |
| P3 | `curl` the 0.12.0, 0.13.0 and 0.14.0 tarballs; `diff <(jq -S .exports …)` | 0 (diff 1 for 0.12.0, 0 for 0.13.0) | §2.3 delta |
| P4 | `bun add @a2ui/web_core@0.14.0 lit@3.3.3 zod@3.25.76 ajv@8 ajv-formats happy-dom` (and with 0.13.0) | 0 | One `zod` 3.25.76 and one `lit` 3.3.3; no nested `node_modules` |
| P5 | `bun catalog.mjs` (code-defined catalog, helpers, `toJson`, `validationSchema`, Ajv) | 0 | Helper bug; `.describe()` inlines `oneOf`; validation rows of §2.4.2; 59 icon names; recursion warnings |
| P6 | `bun cmp.mjs` (`basicCatalog.toJson()` vs published file) | 0 | Deep-equal |
| P7 | `bun throws.mjs` on 0.14.0 | 0 | Throw classes in §2.7; resolver tree; action payload; `EXPRESSION_ERROR` on `onError` |
| P7b | `bun throws.mjs` on 0.13.0 | 1 | `new NodeResolver(surface)` throws `A2uiStateError` (catalog argument required in 0.13.0); rerun with `surface.defaultCatalog` exits 0 with the same results |
| P8 | `bun strict.mjs` on 0.14.0 and 0.13.0 | 0 | §2.7 configuration table; identical on both versions |
| P9 | `bun render.mjs` (happy-dom, `lit` `render`) | 1, then 0 | First run hit a probe bug (`ComponentContext` on an empty surface throws `A2uiStateError`). After the fix: undefined `<probe-stack>` rendered, upgraded after late `define`; collision throws; dispose marks nodes disposed |
| P10 | `bun caps.mjs` (`getClientCapabilities` vs `client_capabilities.json`) | 0 | `['v0.9']` and `['v0.9','v0.9.1']` valid; `['v0.9.1']` fails the required `v0.9` key |
| P11 | `bun meta.mjs` (v1.0 `catalog_definition.json`) | 1, then 0 | First run hit a probe bug (duplicate Ajv schema id). After the fix: both v0.9 documents fail (§2.4.2) |
| P12 | `bun build b/{a,b,c,d}.mjs --minify --target browser [--external …]`, then `gzip -9c \| wc -c` | 0 | §2.3 weights; Lit only with `universal` or `basic_catalog` |

## 4. Fit with line://ui

- **ARCHITECTURE §17.1.** `line-genui` depending on `@a2ui/web_core` adds `zod`, `lit`, `@lit/context`, `zod-to-json-schema`, `@preact/signals-core`, `validate-color` and `redos-detector` to the consumer install. `lit` and `zod` already match the repo.
- **ARCHITECTURE §17.3 and PRD Appendix D (`./catalog` touches no DOM).** `Catalog` and the v0.9 common types import without a DOM and pull in no Lit (P5, P12). The common types exist as named in §17.3 (`DynamicString`, `ComponentId`, `ChildList`, `Action`, `Checkable`). Their `$ref` survives only when descriptions avoid `.describe()` and the buggy helpers (§2.4.3).
- **ARCHITECTURE §17.3 (flat schemas).** `toJson()` keeps common types as `$ref`s and adds `$defs.anyComponent`, a `oneOf` over components. R3 decides whether that union is within "the A2UI common types".
- **ARCHITECTURE §17.4 (light DOM, Law 1).** Both techniques can render in light DOM. Upstream `A2uiLitElement` and `<a2ui-surface>` now default to light DOM.
- **ARCHITECTURE §17.4 (Loading, Law 6).** `renderA2uiNode` defines elements eagerly only for entries that carry `element`. Entries with `tagName` only let a descriptor's `load()` define the element later (P9).
- **ARCHITECTURE §17.2 and §17.1 (components stay protocol-unaware).** `renderA2uiNode` sets `node` and `context` on the element it creates. A `line-*` element cannot be that element without importing A2UI types, so this technique needs one adapter element per node.
- **ARCHITECTURE §17.4 (Accessibility, stable ids).** `ComponentNode.id` is stable for the node's lifetime and documented as a base for DOM ids and accessibility references.
- **ARCHITECTURE §17.4 (Limits).** `web_core` enforces payload depth 50, function-call depth 5, expression parser limits and 10000 template children, but only with a `validationConfig` for the first two. It has no node-count or data-model-size limit, so those stay with the surface.
- **ARCHITECTURE §17.4 (URLs).** `web_core` checks only `openUrl` (`http:` and `https:`). Media URLs in line's own projection stay with the surface's URL policy.
- **ARCHITECTURE §17.7.** 0.14.0 carries 12 BREAKING entries one minor after 0.13.0, which supports the exact pin and the preview status.
- **PRD §2 and plan §8 (Zod split).** The repo and `web_core` both resolve to Zod 3.25.76 today. Upstream has open issues and a PR that would loosen the coupling, and none has landed.

## 5. Contradictions

1. **The "A2UI v0.9.1 catalog meta-schema" does not exist as an artifact.** `docs/PRD.md:896` and `docs/plans/01-plan-core-primitives.md:461` require `catalog.json` to validate against it. v0.9.1 publishes no catalog meta-schema (§2.4.1). The closest schema, `client_capabilities.json#/$defs/Catalog`, rejects the published basic catalog document. The v1.0 `catalog_definition.json` rejects every v0.9 catalog. The criterion needs a definition before the spec can test it (§6 Q2).
2. **The release cadence and current version in the plan are stale.** `docs/plans/01-plan-core-primitives.md:336` and `:492` say 0.12.0 → 0.13.0 took "within one week". npm shows 11 days (2026-09-28 → 2026-10-09). `:316` names 0.13.0 as current, and 0.14.0 has been `latest` since 2026-10-17.
3. **The plan's dependency list for 0.13.0 is incomplete.** `docs/plans/01-plan-core-primitives.md:337` lists four dependencies. 0.13.0 declares seven, adding `@preact/signals-core ^1.14.2`, `validate-color ^2.2.4` and `redos-detector ^6.1.4`.
4. **The error rule assumes per-node throws.** `docs/ARCHITECTURE.md:1507` and `docs/plans/01-plan-core-primitives.md:107` say every `web_core` throw is caught and an inert placeholder replaces "the failed node". The throws come from `processMessages` and are message-scoped. A rejected `updateComponents` applies nothing, so no failed node exists to replace. Node-level problems (unknown type, pending child, cycle) produce placeholder nodes and `onError` events without throwing (§2.7). The rule can be met only after it says what a thrown message turns into.
5. **The prior research note is outdated on two points.** These sit outside the document hierarchy and are listed because the task asks for them.
   - `docs/research/00-research-generative-ui.md:194` emits the catalog "through `web_core` `Catalog.catalogSchema`". 0.14.0 deprecates `catalogSchema`. `toJson()` gives the document and `validationSchema` gives the bundled validator.
   - `docs/research/00-research-generative-ui.md:225` says upstream `<a2ui-surface>` "keeps a shadow root". `@a2ui/lit` 0.14.0 renders it into light DOM, which changes the cost side of option (a) for R2.

## 6. Open questions for the spec

1. **Which `web_core` version does `line-genui` pin?**
   - Options: (a) 0.13.0; (b) 0.14.0; (c) the `latest` on the day the spec is approved.
   - Deciding evidence: 0.14.0 adds `toJson()`, `validationSchema` and `spec()` annotations, and makes the catalog required on `ComponentModel`; the dependency sets are identical (§2.1, §2.2); a re-run of P1 on the spec date.
2. **What does "validates against the A2UI v0.9.1 catalog meta-schema" mean?** (needs a plan and PRD revision, §5 item 1)
   - Options: (a) the inline form validates against `client_capabilities.json#/$defs/Catalog`; (b) the document form validates against a line-maintained schema derived from the basic catalog's shape; (c) `Catalog.fromJson` round-trips, `validationSchema` compiles as 2020-12, and the basic examples validate.
   - Deciding evidence: §2.4.2 results; which form agents receive in prompts and in capabilities.
3. **Which `validationConfig` does the surface pass?**
   - Options: none, `RELAXED_VALIDATION`, `STRICT_VALIDATION`, or a custom mix (for example relaxed topology with `allowUnknownElements: false`).
   - Deciding evidence: the §2.7 configuration table; progressive streaming in the v0.9.1 protocol (`updateComponents` paragraph); the §17.4 Limits rule.
4. **Does the surface feed messages one at a time or per batch?**
   - Options: (a) one `processMessages` call per message, so a bad message drops only itself; (b) one call per transport batch.
   - Deciding evidence: the batch semantics in §2.7; the `aria-busy` per-batch rule in §17.4.
5. **Under which ids is the `basic` catalog registered?**
   - Options: (a) the `v0_9` URL only, as `web_core` and the catalog file use; (b) both the `v0_9` and `v0_9_1` URLs.
   - Deciding evidence: §2.4.1 id mismatch; what agents send in practice (R6).
6. **How do descriptors attach descriptions to common types?**
   - Options: (a) a line helper that writes the `REF:` marker correctly; (b) plain `.describe()`, which accepts an inline `oneOf`; (c) wait for an upstream fix of the helpers.
   - Deciding evidence: §2.4.3; the flat-schema rule in §17.3. R3 owns this.
7. **Which projection technique does the renderer use?**
   - Options: (a) adapter elements through `renderA2uiNode` with `tagName`-only entries; (b) direct projection on `NodeResolver`.
   - Deciding evidence: §2.5 comparison; Lit weight (§2.3); the R2 spike exit questions.
8. **How does the session advertise versions?**
   - Options: (a) `['v0.9', 'v0.9.1']`; (b) `['v0.9.1']` only.
   - Deciding evidence: P10, where the published schema requires the `v0.9` key; transport metadata conventions (R6).
9. **How do `web_core` errors map to the v0.9.1 `error` message?**
   - Options: (a) `VALIDATION_FAILED` with a JSON Pointer the surface computes from Zod issue paths; (b) generic errors that carry the `web_core` `code`.
   - Deciding evidence: §2.7 last paragraph; `client_to_server.json` `error` schema.

## 7. Sources

All retrieved 2026-10-19.

- npm registry, `@a2ui/web_core`: https://www.npmjs.com/package/@a2ui/web_core (`npm view`, tarballs `web_core-0.12.0.tgz`, `-0.13.0.tgz`, `-0.14.0.tgz`, including `CHANGELOG.md` and `src/`)
- npm registry, `@a2ui/lit`: https://www.npmjs.com/package/@a2ui/lit (tarballs 0.12.0, 0.13.0, 0.14.0; `src/surface/a2ui-surface.js`, `CHANGELOG.md`)
- npm registry dist-tags for `zod`, `lit`, `@lit/context`, `zod-to-json-schema`: https://www.npmjs.com/package/zod
- A2UI repository at `main` `cbaa5ee` (2026-10-17): https://github.com/a2ui-project/a2ui
  - v0.9.1 spec: https://github.com/a2ui-project/a2ui/tree/main/specification/v0_9_1 (`README.md`, `docs/a2ui_protocol.md`, `docs/evolution_guide.md`, `json/client_capabilities.json`, `json/common_types.json`, `json/client_to_server.json`, `catalogs/basic/catalog.json`)
  - v1.0 spec: https://github.com/a2ui-project/a2ui/tree/main/specification/v1_0 (`README.md`, `docs/a2ui_protocol.md`, `docs/evolution_guide.md`, `json/catalog_definition.json`)
  - v1.0 commit history: https://github.com/a2ui-project/a2ui/commits/main/specification/v1_0
  - README status: https://github.com/a2ui-project/a2ui/blob/main/README.md
  - Roadmap: https://github.com/a2ui-project/a2ui/blob/main/docs/public/roadmap.md
  - `web_core` helpers source: https://github.com/a2ui-project/a2ui/blob/main/typescript/core/web_core/src/v0_9/schema/helpers.ts
  - Releases: https://github.com/a2ui-project/a2ui/releases
- Issue #2002, `zod` as a peer dependency: https://github.com/a2ui-project/a2ui/issues/2002
- Issue #2160, abstract the Zod dependency: https://github.com/a2ui-project/a2ui/issues/2160
- PR #2753, Zod-version-agnostic binder: https://github.com/a2ui-project/a2ui/pull/2753
- PR #3154, `<a2ui-surface>` light DOM: https://github.com/a2ui-project/a2ui/pull/3154
