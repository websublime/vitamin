# Research: Projection technique for `<line-a2ui-surface>`

**Row:** `00-Z42` (Phase 1 plan §5.1 R2, §5.4 O2.c (a))
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.1, §4.1, §5.1, §5.4 O2, §5.5, §7.2, §8; `docs/PRD.md` §7.3 item 1, Appendix D; `docs/ARCHITECTURE.md` §12, §17.1–§17.4, §17.9; `docs/research/00-research-generative-ui.md` §4.4–§4.6, §6; `docs/research/01-research-a2ui-web-core.md` (R1); `docs/research/01-research-accessibility.md` (R8); `docs/research/01-research-packaging.md` (R9); `packages/line-core/src/line-element.ts`; `playwright.config.ts`; `vite.config.shared.mjs`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1). §5a states the technique the spec builds on, as plan O2.c (a) requires.

> **TL;DR**
>
> - Both candidates ran the same A2UI v0.9.1 streams on `@a2ui/web_core` 0.14.0 in Chromium 156, Firefox 157 and WebKit 27.2. Direct projection on `NodeResolver` (b) matched hand-written `line-*` markup exactly: 17/17 slot assignments, zero layout differences and a pixel-identical screenshot. Adapters through `renderA2uiNode` (a) put an adapter element in every slot, shifted 19 boxes in `showcase` and stopped a column-stretched button and a vertical separator from sizing.
> - `display: contents` on the adapters fixes (a)'s layout, but slots still receive adapters instead of the `line-*` and native elements.
> - Document `::part()` rules reached every `line-*` part in both candidates (18/18) and none through the upstream shadow root (0/18). axe-core 4.14.0 found zero violations in both, and Playwright's `ariaSnapshot` equals the reference in all three engines. The Chromium tree of (a) holds 14 `generic` nodes against 8 for (b).
> - Every reachable `web_core` throw path became a schema-valid A2UI `error` message with no page error, identically in all three engines. That covers 29 streams, 1 renderer call and 1 adapter throw.
> - Focus survives an agent reorder in (b), because its reconciler moves the siblings around the focused element. (a) loses it, because Lit's keyed `repeat` moves the focused element itself. Both lose focus when the agent reparents the focused node.
> - On a one-button page (Vite 8 per-page builds, gzip -9), (a) loads 88.8 KB, 80.9 KB of it before any component and Lit included. (b) loads 86.9 KB, 79.9 KB of it before any component and without Lit. Compressed alone, `web_core` and its dependencies sum to about 103 KB in both. The upstream eager idiom defines all 17 tags at startup.
> - No catalog meta-schema exists, and both the hand-written and the emitted `line` catalog fail `client_capabilities.json#/$defs/Catalog`. The emitted catalog also lacks `$defs.anyFunction` and `$defs.theme`, which the published schemas require through `catalog.json`. Emitted catalog: 685 B gzip for four components.
> - Recommended, pending Miguel's confirmation: direct projection on the `web_core` models and binder (b).

---

## 1. Question

Plan §5.1 R2 reads: "The research note §6 spike exit questions cover slot assignment, layout, the accessibility tree, document `::part()` reach, Law 6 bundle analysis, throw paths, meta-schema validation, live-region/focus policy under axe and a screen reader, and gzipped weight. The research stage produces this evidence, and the note states the choice the spec builds on (O2.c (a))".

The 2026-10-06 note §6 also asked whether the catalog drives "a real model to valid output". Plan R2 omits that question, the plan wins, and this note does not drive a model.

Each question applies to (a) light-DOM adapter elements rendered through `renderA2uiNode` (`@a2ui/web_core/v0_9/universal`) and (b) direct projection on the `web_core` models and binder (`NodeResolver`).

1. **Slots.** Which nodes land in which slot?
2. **Layout.** Do the boxes match hand-written markup?
3. **Accessibility tree.** What do the Chromium CDP tree and `ariaSnapshot` (all three engines) show?
4. **`::part()`.** Do document rules reach the rendered parts?
5. **Law 6.** Which definitions land in which chunks of a Vite 8 build of a one-component page?
6. **Throw paths.** Does every R1 §2.7 throw path end as an A2UI `error` message (ARCHITECTURE §17.4)?
7. **Meta-schema.** Does a hand-written `line` catalog validate against what exists?
8. **Live region and focus.** Do the §17.4 rules hold under axe, and what should a screen reader announce?
9. **Weight.** What do `web_core` plus each surface weigh gzipped, and how large is the emitted catalog?

## 2. Findings

All runs on 2026-10-19 from a clean copy (§3). "All engines" means Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2 under Playwright 1.64.0. Evidence files are in `docs/research/assets/01-r2/`; `summary.json` holds every number below.

### 2.0 Spike shape

- The spike code lives in `docs/research/assets/01-r2/spike/`. Its README holds the versions, the clean-copy recipe and the VoiceOver script.
- Components are throwaway `line-button` (parts `root`, `label`; slots default, `prefix`), `line-icon` (`svg`), `line-stack` (host flex container) and `line-separator` (`root`) on the real `LineElement` from `packages/line-core/dist`. Text and Image map to native elements (ARCHITECTURE §17.3). No machine was needed.
- Both candidates share one `MessageProcessor`, one `processMessages` call per message, `RELAXED_VALIDATION` unless a fixture says otherwise, one live region, `aria-busy` per batch, lazy `load()` per type, a required-name check on buttons, `line-a2ui-error` and `line-a2ui-action`.
- (a) mirrors upstream `<a2ui-surface>` (`@a2ui/lit` 0.14.0): the root renders through `renderA2uiNode(context, catalog)`, catalog entries carry `tagName` only, and each adapter extends `A2uiLitElement` with `createRenderRoot()` returning `this` (R1 §2.5.3). Children render through keyed `repeat`, as upstream `Row.js` does. Variant `a-contents` adds `display: contents` to every adapter; variant `a-shadow` keeps the default shadow root as a `::part()` control.
- (b) walks `NodeResolver.rootNode`, creates one element per node and binds one `effect` per node to `node.props`.
- The fixtures live in `src/fixtures.ts`. `showcase` covers all eight Phase 1 basic types, bound text, a template List, a Button action with bound context and a data update. `slots` uses a four-component `line` catalog with a `prefix` slot. `streaming`, `focus`, `one-button`, `missing-name`, `unknown-type` and `cycle-unvalidated` cover the rest, and 33 failing entries cover the throw paths. All valid fixtures validate against the published `server_to_client.json` (`catalog.json` → `summary`).
- npm reports `@a2ui/web_core` `latest` 0.14.0 on 2026-10-19 (published 2026-10-17), with no newer version. Playwright `latest` is 1.64.1, and the spike uses the locked 1.64.0.

### 2.1 Slot assignment

Compared against `pages/reference.html`, hand-written markup of the same final state.

| Fixture | (a) | (a) `display: contents` | (b) |
|---|---|---|---|
| `showcase`, 12 slots | 3/12 same nodes, 11/12 same ids | same as (a) | 12/12 |
| `slots`, 5 slots | 3/5 same nodes, 5/5 same ids | same as (a) | 5/5 |

- In (a) every slot receives the adapter (`line-a2ui-text#sendLabel`), not the element (`p#sendLabel`). `display: contents` does not change slot assignment, so `slot.assignedElements()` and `::slotted()` rules in a `line-*` component see adapters.
- List items in (a) are wrapper `div[role=listitem]`, as upstream `List.js` renders them; (b) puts `role="listitem"` on the item `line-stack`.
- `renderA2uiNode` returns a directive, not an element, so (a) sets `slot="prefix"` on the icon adapter after render. The first spike version selected the child by an attribute the child sets on upgrade, so one Chromium run left the icon in the default slot when its module arrived late. That was a spike defect. With a selector on any child element, the icon lands in the `prefix` slot in all engines, and the reviewer's independent rerun of the first version did not show the race either. (b) sets `slot` when it creates the element.

### 2.2 Layout

Bounding boxes of each rendered element relative to the host, against the reference, tolerance 1 px.

| Variant | `showcase` | `slots` |
|---|---|---|
| (a) | 19 boxes differ in all engines: inline adapters add 5–5.5 px per line box; the column-stretched button is 394.5–398.5 px narrower; the vertical separator collapses (−27.5 to −28.5 px) | 2 differ: separator 480 px narrower; icon 2 px higher |
| (a) `display: contents` | 0 | 0 |
| (b) | 0 | 0 |

- The `showcase` screenshots of the reference, (a) `display: contents` and (b) have the same SHA-256 (`2d517494…`); (a) differs (`showcase-a.png`).
- (a) must place flex properties (`weight`) on both the adapter and the inner element, because the adapter is the flex item unless it has `display: contents`.

### 2.3 Accessibility tree

- `ariaSnapshot` of the surface equals the reference's for every candidate and fixture in all three engines, apart from the surface's `status` region (`aria-snapshots.txt`).
- Chromium CDP tree below `main` (`cdp-tree-chromium.txt`):

| Fixture | Reference | (a) | (a) `display: contents` | (b) |
|---|---|---|---|---|
| `showcase` nodes / `generic` | 29 / 4 | 45 / 14 | 38 / 7 | 39 / 8 |
| `slots` nodes / `generic` | 11 / 3 | 22 / 8 | 20 / 6 | 21 / 7 |

- The surface itself adds the page chrome, the surface element and the root container. (a) adds one `generic` per adapter that is not `display: contents`, including empty ones around `aria-hidden` icons. No extra node changed a role, a name or the list structure.

### 2.4 Document `::part()` reach

| Variant | `showcase` | `slots` |
|---|---|---|
| (a), (a) `display: contents`, (b) | 12/12 parts styled | 6/6 |
| `a-shadow` control (upstream default shadow root) | 0/12 | 0/6 |

The control confirms R1 §2.5.3 in real browsers: without the `createRenderRoot()` override, document rules do not reach `line-*` parts.

### 2.5 Law 6 bundle analysis (Vite 8.3.4, one build per page)

A page registers both catalogs and renders one Button with a Text child. `chunks-<variant>.json` lists every chunk.

| Build | Defined after load | Component chunks |
|---|---|---|
| (a) lazy adapters | `line-a2ui-surface`, `line-button`, `line-a2ui-button`, `line-a2ui-line-button`, `line-a2ui-text`, `line-a2ui-image` | Each `import()` chunk holds one `line-*` component plus its adapters; adapters sharing a module define together |
| (b) | `line-a2ui-surface`, `line-button` | One `import()` chunk per `line-*` component (385–621 B); Lit and `LineElement` in one shared chunk loaded with the first component |
| (a) eager, upstream idiom (`element` on each entry) | All 17 tags at startup: the surface, 4 `line-*` components and 12 adapters | Each `import()` facade is a 73–97 B re-export; every define moved into statically imported shared chunks |

- The eager build reproduces R9's finding (R9 §2.1): when a module is imported both statically and dynamically, Rolldown moves its `define()` into a shared chunk and the `import()` target registers nothing.
- (a) loads Lit with the surface, because `renderA2uiNode` and `A2uiLitElement` import it (R1 §2.3). (b)'s initial load holds no Lit.

### 2.6 Throw paths

`throws` in `summary.json`, identical in all three engines.

| Group (R1 §2.7 row) | Entries | Raised | Entries with a valid A2UI `error` |
|---|---|---|---|
| Version adapter | 5 | `VALIDATION_ERROR` | 5/5 |
| `validateRecursionAndPaths` | 3 | `RECURSION_ERROR` ×2, `VALIDATION_ERROR` | 3/3 |
| `targetVersion`, `allowedMessages` | 2 | `VALIDATION_ERROR` (`target-version` raises 2) | 2/2 |
| `createSurface` | 4 | `CATALOG_ERROR` (the `v0_9_1` URL), `INTEGRITY_ERROR`, `VALIDATION_ERROR` ×2 | 4/4 |
| `updateComponents` | 6 | `INTEGRITY_ERROR` ×2, `VALIDATION_ERROR` ×4 | 6/6 |
| Candidate topology | 5 | `INTEGRITY_ERROR` ×2, `RECURSION_ERROR` ×2; `depth-limit-relaxed` raises nothing | 4/4 raising |
| `updateDataModel` | 5 | `INTEGRITY_ERROR`, `DATA_ERROR` ×4 | 5/5 |
| `getClientCapabilities([])` | 1 | `VALIDATION_ERROR` | 1/1 |
| `getRendererDataModel()` | 1 | Nothing (see below) | — |
| `A2uiLitElement` without `api`, (a) only | 1 | `UNKNOWN_ERROR` via the adapter boundary | 1/1 |

The 33 entries are 30 streams, 2 renderer calls and 1 adapter throw. One stream (`depth-limit-relaxed`) and one renderer call (`getRendererDataModel()`) raise nothing, so 29 streams, 1 renderer call and 1 adapter throw raise.

- Each error is the generic form `{version: "v0.9.1", error: {code, surfaceId, message, …}}`. All error events, 34 in (a) and 33 in (b) per engine including the node-level ones, validate against `client_to_server.json`. No page error occurred, and later messages still applied ("After" rendered) except where `targetVersion` rejected them too.
- Non-throwing node problems: (b) receives `UNKNOWN_COMPONENT_TYPE` and `CYCLIC_REFERENCE` from `NodeResolver` through `onError` and renders inert placeholders. (a) receives neither, because the `(context, catalog)` path has no resolver. The spike's adapters detect unknown types themselves, and a self-cycle with no `validationConfig` nests adapters until the spike's depth guard (32) stops it.
- (a) renders asynchronously, so the `A2uiLitElement` throw escapes any `try` around `processMessages`; the spike catches it by overriding `performUpdate()` in every adapter.
- Not reachable through a stream: `new NodeResolver` with a foreign catalog and `new ComponentContext` for a missing id (both surfaces never make those calls), `registerUniversalElement` collisions (entries carry `tagName` only), `WritableBinding.set` (no Phase 1 type binds a writable value), `new Catalog` and `Catalog.fromJson` (catalog construction, outside the surface), `allowedParents` (v1.0 catalogs only). `getRendererDataModel()` did not throw with a v0.9 and a v0.9.1 surface, because a surface takes its version from the catalog (`"0.9"`).
- New `web_core` 0.14.0 facts: a theme `primaryColor: "red"` passes, because `BasicCatalogThemeSchema` accepts any CSS colour while the published catalog requires `^#[0-9a-fA-F]{6}$`. With `allowMissingRoot: true` (as in `RELAXED_VALIDATION`), the depth walk starts at each component id in sorted order, so a five-level chain under `maxDepth: 3` passed (`depth-limit-relaxed`); with `allowMissingRoot: false` it threw.

### 2.7 Meta-schema validation

`catalog.json` in the evidence; Ajv 2020, `allErrors`.

| Document | Against | Result |
|---|---|---|
| Hand-written `line` catalog, basic-catalog document form (`spike/src/catalog/line-catalog.json`) | `client_capabilities.json#/$defs/Catalog` | Fails, 6 errors: additional `$schema`, `$id`, `title`, `description`, `$defs`; `functions` must be an array |
| `lineCatalog().toJson()` | same | Fails, 2 errors: additional `protocolVersion`, `$defs` |
| Published basic catalog | same | Fails, the same 6 errors as the hand-written document |
| `slots` components | Hand-written `$defs/anyComponent` | 5/5 valid; a Button without `action` fails |
| `Catalog.fromJson(hand-written)` | Round trip | Deep-equal, key order differs |
| `validationSchema` (from `fromJson` and from code) | Its own `$defs/anyComponent` | 5/5 valid; Button without `action` rejected only through `$defs/anyComponent` (the document root constrains nothing) |
| `toJson()` as `catalog.json` | `common_types.json`, `server_to_client.json` | Does not compile: no `$defs/anyFunction`, no `$defs/theme` |
| Inline line catalog from `getClientCapabilities` | `client_capabilities.json` | Valid |

- `common_types.json` resolves `FunctionCall` through `catalog.json#/$defs/anyFunction`, and `server_to_client.json` resolves `createSurface.theme` through `catalog.json#/$defs/theme`. A catalog without functions or theme must still define both for the published schemas to compile; the hand-written document uses `"anyFunction": false` and an open `theme` object.
- `toJson()` writes `common_types.json#/$defs/…` relative refs, while the published basic catalog writes absolute `https://a2ui.org/specification/v0_9/common_types.json` refs.

### 2.8 Live region and focus

| Rule (§17.4) | (a) | (b) |
|---|---|---|
| Zero axe violations, 6 fixtures × 3 engines | Yes, except `missing-name` (`button-name`, critical), which the surface also reports as `MISSING_ACCESSIBLE_NAME` | Same |
| One live region per surface | 1 | 1 |
| `aria-busy` covers each batch (`streaming`, 4 batches) | 44 mutations, 0 after `aria-busy="false"` | 20 mutations, 0 escaped |
| No focus move on agent updates (focus outside the surface) | Kept, 4/4 steps | Kept, 4/4 |
| Focus on button `b`: its label changes; a sibling is inserted before it; its own variant changes | Kept | Kept |
| Focus on `b`: the agent moves it to the front of the same parent | Lost to `body` | Kept |
| Focus on `b`: the agent moves it under a new Column | Lost to `body` | Lost to `body` |

Each step starts with focus on `b`. The results are identical in all three engines.

- Focus is lost only when the focused element itself moves in the DOM. Moving its siblings around it keeps focus in all three engines.
- (b)'s reconciler keeps the child that holds focus in place and moves the others around it, so a same-parent reorder keeps focus.
- (a) renders child lists through Lit's keyed `repeat`, as upstream `Row.js`, `Column.js` and `List.js` do. For the reorder [a, c, b] → [b, a, c], `repeat` matches "old tail to new head" and moves the old tail, which is `b` (`lit-html/development/directives/repeat.js:311–313`, Lit 3.3.3). The spike calls `repeat`, but the move order belongs to Lit. An unkeyed loop would keep the element in place and rebind it to another node, which moves focus to a different component.
- Reparenting creates or moves the element under a new parent in both candidates, and focus is lost. `Element.moveBefore()` would keep it, and BCD 8.1.6 lists Chrome 133 and Firefox 144 with no Safari support.
- `NodeResolver` gives a node a new object and a new `id` whenever its position in the parent's child list changes, even for an insertion before it (`a2ui-n3` → `a2ui-n5`). The first (b) version keyed elements by node object and lost focus on "sibling inserted before". Keying by `instanceId` and rebinding the new node keeps the element. Upstream documents both facts. `id` changes on "type or catalog change, re-add, sibling reorder", and `instanceId` "is not stable across array insertions or reorders" in templates until issue a2ui#1745 (open since 2026-06-24) adds data-derived keys.

#### Screen-reader pass

Pending: Miguel's manual pass (2026-10-19). The script is in `docs/research/assets/01-r2/spike/README.md` §"Screen-reader pass" (VoiceOver in Safari and Chrome, checks S1–S10, expected announcement per check and candidate).

### 2.9 Weight

One-button page, sum of chunk sizes at gzip level 9 (`bundle` in `summary.json`, identical in all engines).

| Build | Before any component | Loaded | All chunks built |
|---|---|---|---|
| (a) | 80,867 B | 88,759 B | 91,683 B |
| (b) | 79,869 B | 86,918 B | 88,351 B |
| (a) eager | 88,163 B | 88,323 B | — |

Per-package rendered bytes, compressed alone, in the loaded chunks:

| Package | (a) | (b) |
|---|---|---|
| `@a2ui/web_core` | 73.4 KB | 73.7 KB |
| `zod` | 17.0 KB | 17.0 KB |
| `zod-to-json-schema` | 8.0 KB | 8.0 KB |
| `@preact/signals-core`, `validate-color` | 4.2 KB | 4.1 KB |
| Lit (`lit-html`, `lit-element`, `@lit/reactive-element`) | 8.1 KB | 7.2 KB |
| Spike surface, session and catalogs | 9.9 KB | 9.0 KB |

Emitted catalog size (`catalog.json` → `sizes`):

| Document | Minified | Gzip |
|---|---|---|
| `lineCatalog().toJson()`, 4 components | 2,265 B | 685 B |
| Hand-written `line` catalog, 4 components | 3,262 B | 944 B |
| `lineCatalog().validationSchema` | 7,173 B | 1,834 B |
| `basicCatalog().toJson()`, 8 Phase 1 types | 8,674 B | 2,320 B |
| Published v0.9.1 basic catalog, 18 types | 29,240 B | 5,399 B |

## 3. Probes

Recipe from `spike/README.md`, run in `mktemp -d` (`…/tmp.IS4zu33cFQ`) from `git archive HEAD` of the spike commit, `HOME` set to that directory, browsers from the Playwright cache. The spike's `retries: 1` (P6) was then copied into that copy and amended into the spike commit `6fc8406`. The directory was deleted afterwards.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view @a2ui/web_core version dist-tags time --json`; `npm view <pkg> version` for `@axe-core/playwright`, `playwright`, `vite`, `ajv`, `ajv-formats`, `lit`, `@a2ui/lit` | 0 | `web_core` 0.14.0 `latest`, no newer; Playwright 1.64.1 `latest` |
| P2 | `bun install`; `bun add -E @a2ui/web_core@0.14.0 @axe-core/playwright@4.14.0 ajv@8.20.0 ajv-formats@3.0.1`; `bun run --filter @websublime/line-core build` | 0 | One `lit` 3.3.3 and one `zod` 3.25.76 |
| P3 | `bun scripts/fetch-spec.ts` | 0 | Five v0.9.1 files at `cbaa5ee` |
| P4 | `bun scripts/catalog.ts` | 0 | §2.7, sizes |
| P5 | `bun scripts/build.ts` | 0 | Three builds, §2.5 |
| P6 | `bunx playwright test` (first clean run) | 1 | 17 passed; the first Chromium test hit "Execution context was destroyed" when the cold Vite server re-optimised dependencies and reloaded. Fix: `retries: 1` in the spike config |
| P7 | `bunx playwright test` (same copy, after the fix) | 0 | 18 passed (6 checks × 3 engines) |
| P8 | `bun scripts/evidence.ts` | 0 | `out/evidence`, committed under `docs/research/assets/01-r2/` |
| P9 | `bun probe p2.mjs`, `p3.mjs` (resolver identity) during development | 0 | Pending child → placeholder, then a new node; a moved child gets a new node and `id` |
| P10 | `npm pack @mdn/browser-compat-data` (8.1.6), `api.Element.moveBefore` | 0 | Chrome 133, Firefox 144, Safari no |
| P11 | `gh issue view 1745 -R a2ui-project/a2ui` | 0 | Open, "children are unkeyed, making it impossible to move children correctly" |
| P12 | Worktree: `bun --filter` build of `line-schemas`, `line-tokens`, `line-colors`, `line-themes`, then root `bun test` | 0 | 310 pass, 0 fail, 18 files, no file under `docs/` collected. Without the builds, 3 then 75 `line-themes` tests fail on missing `dist` (CI builds first) |
| P13 | `bun run lint` | 0 | 288 files, no diagnostics |

## 4. Fit with line://ui

- **Law 1, §17.4 Render root.** Both candidates keep `line-*` parts reachable from document CSS (§2.4). (a) needs the `createRenderRoot()` override on an `@experimental` base class (R1 §2.5.3).
- **Law 4, §17.4 Composition ("creates elements by tag and wires children through slots").** (b) does this literally. In (a) the surface creates adapters, slots receive the adapters, and named slots need a post-render patch (§2.1).
- **Law 6, §17.4 Loading, plan §7.2 "defines only `line-a2ui-surface`".** Both lazy builds define only the surface on import (§2.5). (a) adds one adapter tag per type, and the upstream eager idiom defines everything.
- **Law 3, §17.4 Accessibility.** Both pass axe and match the reference `ariaSnapshot`. (b) keeps focus through a same-parent reorder with `instanceId` keying and a focus-preserving reconciler; (a) loses it there through Lit's `repeat`. Both lose it on reparenting (§2.8).
- **Law 9, §17.4 Errors.** One session wrapper catches every message-scoped throw for both candidates. (a) additionally needs an error boundary in every adapter and its own unknown-type and depth handling (§2.6).
- **§17.2 (components stay protocol-unaware).** Holds in both; (a) moves the A2UI code into adapters, (b) into the surface.
- **Plan §8 (catalog weight, Law 6 regressions).** §2.9 gives the first measured catalog sizes; the eager idiom is the regression the plan risk row names.

## 5. Contradictions

1. **"Focus kept across re-renders through stable ids" cannot hold when the agent reparents the focused node.** `docs/ARCHITECTURE.md:1512` states the rule in this wording; `docs/plans/01-plan-core-primitives.md:112` states the compressed form ("no focus moves on agent updates, stable ids"). A same-parent reorder can keep focus (§2.8). Moving the focused element to another parent blurs it in all three engines for both candidates. Meeting the rule there needs `moveBefore()` (no Safari) or a focus restore by the surface, which the same row's "no focus moves on agent-initiated updates" forbids as written.
2. **New evidence for R1 §5 item 1 (missing meta-schema).** The hand-written `line` catalog fails the only catalog-shaped schema the same way the published basic catalog does, and the emitted catalog cannot stand in as `catalog.json` for the published schemas (§2.7).
3. **New evidence for R1 §5 item 4 (per-node throws).** Message-level throws again left no failed node to replace; the only per-node throws found are (a)'s asynchronous adapter throws (§2.6).

First-wave facts this note changes or extends:

- R1 §4 calls `ComponentNode.id` "stable for the node's lifetime" and a base for DOM ids. The lifetime ends whenever the node's position changes, including an insertion before it, so `id` cannot key DOM elements across agent updates. `instanceId` can, within the limits of a2ui#1745 (§2.8).
- R1 §2.7 lists `A2uiValidationError` for `createSurface` theme failures. The theme schema in 0.14.0 accepts any CSS colour, while the published catalog requires `#rrggbb` (§2.6).

Agreeing evidence: the Vite 8 builds of a whole surface weigh 79.9–80.9 KB gzip before any component (§2.9). This is a new measurement on the repo's bundler and agrees with R1 §2.3's Bun figures for the same import sets.

## 5a. Recommendation

Evidence by target, (a) as specified, with `display: contents` noted where it changes the result.

| # | Target | (a) adapters via `renderA2uiNode` | (b) direct projection on `NodeResolver` |
|---|---|---|---|
| 1 | Slot assignment | Adapters fill every slot; named slot set by a post-render patch | Exact, 17/17 |
| 2 | Layout | 19 boxes differ; exact with `display: contents` | Exact, pixel-identical |
| 3 | Accessibility tree | `ariaSnapshot` equal; +6 `generic` in Chromium | `ariaSnapshot` equal; reference plus surface wrappers |
| 4 | `::part()` reach | 18/18 with the override; 0/18 without | 18/18 |
| 5 | Law 6 | Lazy works; adapters add tags; Lit in the initial load; eager idiom defines all | One chunk per component; Lit with the first component |
| 6 | Throw paths | All caught; needs per-adapter boundary, own unknown-type and depth handling | All caught; resolver reports unknown types and cycles |
| 7 | Meta-schema | Independent of technique (§2.7) | Same |
| 8 | Live region, focus, axe | Pass; focus kept except on reorder and reparent; screen reader pending | Pass; focus kept on reorder with `instanceId` keying, lost on reparent; screen reader pending |
| 9 | Weight | 80.9 KB initial, 88.8 KB loaded | 79.9 KB initial, 86.9 KB loaded |

**Recommended, pending Miguel's confirmation: (b) direct projection on the `web_core` models and binder (`NodeResolver`).** It matched hand-written markup on targets 1–4 in all three engines without adapter CSS, kept focus through an agent reorder where (a) lost it, keeps the surface free of Lit and of the `@experimental` `A2uiLitElement`, and receives unknown types and cycles from the resolver. The costs it carries are its own reconciliation (keyed by `instanceId`, focus-preserving) and its own effect lifecycle. The screen-reader pass may still change this recommendation.

## 6. Open questions for the spec

1. **Element keys in (b).** Options: `instanceId` (spike); `componentId` + data path; wait for a2ui#1745. Evidence: §2.8; upstream `instanceId` documentation (distinct among siblings, unstable for template reorders).
2. **Focus on agent reorder and reparent.** Options: a focus-preserving reconciler that moves siblings around the focused element (spike (b), covers same-parent reorders); `moveBefore()` where supported (covers reparenting, no Safari); restore focus to the same `instanceId` after a batch; accept the loss. Evidence: §2.8, BCD support, the §17.4 "no focus moves" wording (§5 item 1), the screen-reader pass S6 and S10.
3. **Live-region content.** Options: "Content updated." per changed batch and an error sentence (spike); errors only; agent-supplied text. Evidence: the screen-reader pass S1, S3, S9.
4. **List semantics.** Options: `role="list"` on `line-stack` with `listitem` on a stack child and a wrapper otherwise (spike); a dedicated list element. Evidence: §2.1, §2.3, axe results.
5. **Required-name check.** Options: DOM check after render (spike); descriptor check before render. Evidence: `missing-name` results, descriptor accessibility fields (§17.3).
6. **Depth and cycle limits.** Options: `web_core` topology checks with `allowMissingRoot: false`; a surface-side depth limit on the projected tree. Evidence: `depth-limit` and `depth-limit-relaxed` (§2.6), R1 §6 Q3.
7. **Catalog document for agents.** Options: inline form (valid against `client_capabilities.json`); document form with `$defs.anyFunction` and `$defs.theme` added; `toJson()` as emitted. Evidence: §2.7; R1 §6 Q2; R3.
8. **Text inside Button.** Options: `<p>` (spike, flow content inside a native button through the slot); `<span>`. Evidence: HTML content model of `button`; the screen-reader pass S2.

## 7. Sources

All retrieved 2026-10-19.

- npm registry: `@a2ui/web_core` https://www.npmjs.com/package/@a2ui/web_core (tarball 0.14.0: `src/universal/render-a2ui-node.js`, `a2ui-lit-element.js`, `src/resolution/node-resolver.js`, `component-node.d.ts`, `src/processing/message-processor.js`, `src/state/surface-components-model.js`, `src/universal/basic_catalog/theme.js`); `@a2ui/lit` 0.14.0 `src/surface/a2ui-surface.js`; `@axe-core/playwright`, `playwright`, `vite`, `ajv`, `ajv-formats`, `lit`
- A2UI v0.9.1 schemas at `cbaa5ee62c737b50d0695c1e5794d0f648b61dca`: https://github.com/a2ui-project/a2ui/tree/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v0_9_1 (`json/client_capabilities.json`, `client_to_server.json`, `common_types.json`, `server_to_client.json`, `catalogs/basic/catalog.json`)
- Issue a2ui#1745, unkeyed children: https://github.com/a2ui-project/a2ui/issues/1745
- `@mdn/browser-compat-data` 8.1.6, `api.Element.moveBefore`: https://www.npmjs.com/package/@mdn/browser-compat-data
- Playwright `ariaSnapshot`: https://playwright.dev/docs/aria-snapshots
- Chrome DevTools Protocol, `Accessibility.getFullAXTree`: https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/
- Spike and evidence: `docs/research/assets/01-r2/`
