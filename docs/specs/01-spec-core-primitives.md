# SPEC: Phase 1 — Core Primitives

**Status:** DRAFT
**Author:** line://ui orchestrator (row 00-Z46)
**Date:** 2026-10-20
**Phase target:** line://ui v0.2.0
**Source PRD:** [`docs/PRD.md`](../PRD.md) (v0.8.19, APPROVED)
**Source Plan:** [`docs/plans/01-plan-core-primitives.md`](../plans/01-plan-core-primitives.md) (APPROVED, revision 00-Z45, factual corrections 00-Z46)
**Source Architecture:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) (v0.8.5)
**Source Research:**
- R1 — [`docs/research/01-research-a2ui-web-core.md`](../research/01-research-a2ui-web-core.md)
- R2 — [`docs/research/01-research-projection-technique.md`](../research/01-research-projection-technique.md)
- R3 — [`docs/research/01-research-descriptor-api.md`](../research/01-research-descriptor-api.md)
- R4 — [`docs/research/01-research-custom-elements-manifest.md`](../research/01-research-custom-elements-manifest.md)
- R5 — [`docs/research/01-research-mcp-apps.md`](../research/01-research-mcp-apps.md)
- R6 — [`docs/research/01-research-transports.md`](../research/01-research-transports.md)
- R7 — [`docs/research/01-research-zag-machines.md`](../research/01-research-zag-machines.md)
- R8 — [`docs/research/01-research-accessibility.md`](../research/01-research-accessibility.md)
- R9 — [`docs/research/01-research-packaging.md`](../research/01-research-packaging.md)
- R10 — [`docs/research/01-research-icon.md`](../research/01-research-icon.md)
- R10 round 2 — `docs/research/01-research-icon-round2.md` (row 00-Z47, pending)
- R11 — [`docs/research/01-research-typescript-7.md`](../research/01-research-typescript-7.md)
- R12 — [`docs/research/01-research-site-dogfooding.md`](../research/01-research-site-dogfooding.md)

> **What this document is.** The implementation specification for Phase 1 of line://ui. It is the implementable contract for the 9th package, the layer edges, the manifests, the platform and release tasks, the stream C prerequisites, the component contract table, stream G, the documentation, the landing page and the cross-cutting test rules. Section §10 records every decision it rests on.
>
> **What this document is NOT.** It is not a planning document. Scope, streams, dependencies and the exit criteria belong to the plan. It is not a research document. Facts come from the research notes R1–R12, not from new investigation. It is not a component spec. Each component's internals belong to its own `docs/specs/NNNN-<component>.md` (plan §2.3).

---

## 1. Goals

1. Ship the agent-driven UI foundation as `@websublime/line-genui`, the 9th published package, with descriptors, the `line` and `basic` catalogs, the frontend-tool emitter, the `<line-a2ui-surface>` preview, the CEM drift and coverage tests, the MCP Apps bridge and the transport recipes (plan §1, §2.1; PRD §7.3).
2. Ship the 20 core primitives in the `@websublime/line-components` umbrella, one subpath each (plan §1, §2.2).
3. Ship the validating set Button, Icon, Stack and Separator first, without descriptors (plan §1; PRD §7.3).
4. Let stream G validate on that set and add its descriptors (plan §1, §4.1).
5. Ship the other 16 components, each with its descriptor in the same PR (plan §1, §4.3).
6. Build the site landing page with Phase 1 components and deploy it at `line-ui.websublime.com` (plan §1, §2.8).
7. Move the workspace to TypeScript 7.x, with every `.d.ts` emitted by 7.x `tsc` (plan §2.9; D1).
8. Scaffold, wire and release `line-genui` with its layer edges, its trusted publisher and a first version of `0.2.0` (plan §2.6, §2.7).
9. Release every package at `0.2.0` through `release.yml` with provenance (plan §2.7, §7.4).

---

## 2. Non-Goals

These stay out of Phase 1, and no task in this spec introduces them (plan §3).

- Phase 2+ components (PRD §7.4 onward) and the basic-catalog types they bring (plan §3; ARCH §17.3).
- An A2UI v1.0 emitter, until v1.0 is final (plan §3; ARCH §17.3).
- The ARCH §17.8 items, each with the revisit trigger that plan §3 tabulates: WebMCP for form-associated elements, `<line-mcp-app-frame>`, server-side A2UI → `<line-*>` HTML, model-authored `<line-*>` markup, json-render and OpenUI renderers, headless chat primitives, and dev-time AI.
- Transport code. Transports exist as Storybook recipes only (plan §3; ARCH §17.5).
- `LineHtmxElement`, deferred until after 1.0 (plan §3).
- SSR and SSG investigation (plan §3; PRD §1.7).
- `line-form` and cross-field validation (plan §3).
- Utility classes. line://ui ships none (PRD §9.13; plan §7.4; §10 SD1).
- Component internals: parts, slots, custom properties, keyboard maps, roles left open in §6.C.4 and machine shapes. Each component spec owns them (plan §2.3).

---

## 3. Architecture Summary

### 3.1 Packages and apps

Phase 1 completes the target layout of 9 published packages and 2 apps (PRD §6.1). `line-genui` is the only new package (PRD §6.1, plan §2.6).

```
                       ┌──────────────────────── runtime ────────────────────────┐
 apps (private, not published)
   apps/site ─────────devDeps──────────┐         apps/storybook ──devDeps──┐
                                       ▼                                   ▼
                     @websublime/line-genui  (NEW, opt-in, Appendix D)
                       │ dependency             ┆ peer (lazy import())     ┆ peer (lazy import())
                       ▼                        ▼                          ▼
                     @websublime/line-core ◄── @websublime/line-components    @websublime/line-icons
                       (LineElement,            │  (20 subpaths, Phase 1)        │
                        machine, styles)        ├──► line-themes ──► line-colors │
                                                │         └────────► line-schemas◄── line-utils
                                                ├──► line-utils                  │
                                                └──► line-tokens ◄───────────────┘
 externals (never inlined): lit, @zag-js/*, @a2ui/web_core, zod, every @websublime/* (§10 SD2)
```

- Arrows point from the dependent to its dependency (PRD §6.1 "Dependency rules").
- `line-genui -> line-core` is a `dependencies` edge. `line-components` and `line-icons` are `peerDependencies` of `line-genui`, loaded lazily (PRD §6.1, ARCH §17.1).
- No package depends on `line-genui` (PRD §6.1, ARCH §17.1).
- Apps reference `@websublime/*` only in `devDependencies` (`scripts/lint-layers.mjs:181-205`).

### 3.2 Layer edges

`dependencies` and `peerDependencies` both count as edges (PRD §7.3 item 9, plan §4.2 P2). `devDependencies` do not count (`scripts/lint-layers.mjs:12-16`).

| Package | Allowed `@websublime/*` edges | Field | Change in Phase 1 | Source |
|---|---|---|---|---|
| `line-tokens` | none (leaf) | — | none | Phase 00 spec §6.B |
| `line-colors` | none (leaf) | — | none | Phase 00 spec §6.B |
| `line-schemas` | none (leaf) | — | none | Phase 00 spec §6.B |
| `line-themes` | `line-colors`, `line-schemas` | `dependencies` | none | Phase 00 spec §6.B |
| `line-utils` | `line-schemas` | `dependencies` | none | Phase 00 spec §6.B |
| `line-core` | none | — | none | Phase 00 spec §6.B |
| `line-components` | `line-core`, `line-tokens`, `line-themes`, `line-utils` | `dependencies` | none | Phase 00 spec §6.B |
| `line-icons` | `line-tokens` | `dependencies` | none | Phase 00 spec §6.B |
| `line-genui` | `line-core` | `dependencies` | new row | PRD §6.1, §7.3 item 9 |
| `line-genui` | `line-components`, `line-icons` | `peerDependencies` | new row | PRD §6.1, §7.3 item 9 |

### 3.3 `ALLOWED_EDGES` change

Task P2 replaces the table in `scripts/lint-layers.mjs:59-68` with the block below. It also updates the header comment at `scripts/lint-layers.mjs:32-35` and `:47-58` so the source of truth reads "Phase 00 spec §6.B and Phase 1 spec §3.2".

```js
const ALLOWED_EDGES = Object.freeze({
  'line-tokens': new Set(),
  'line-colors': new Set(),
  'line-schemas': new Set(),
  'line-themes': new Set(['line-colors', 'line-schemas']),
  'line-utils': new Set(['line-schemas']),
  'line-core': new Set(),
  'line-components': new Set(['line-core', 'line-tokens', 'line-themes', 'line-utils']),
  'line-icons': new Set(['line-tokens']),
  'line-genui': new Set(['line-core', 'line-components', 'line-icons']),
});
```

- The guard already merges `dependencies` and `peerDependencies` before it checks an edge (`scripts/lint-layers.mjs:187-190`). P2 changes no checking logic.
- The field split in §3.2 (dependency versus peer) is a manifest contract that §4.1 fixes. `lint-layers` checks only the edge set.

## 4. Package Inventory & Exports

Only manifests that change in Phase 1 appear here. `line-tokens`, `line-colors`, `line-schemas` and `line-utils` keep their Phase 00 manifests except for the `version` bump (§7.2) and the build-script change of P8 for the `tsc -b` packages (§7.1). Blocks are JSONC. Comments name the task and the decision.

### 4.1 `@websublime/line-genui` (new)

```jsonc
{
  "name": "@websublime/line-genui",
  "version": "0.1.0",                              // P1; seeded so a minor changeset yields 0.2.0 (§10 SD3, R9 §2.6)
  "type": "module",
  "license": "MIT",
  "files": ["dist", "src"],                        // AM-036 pattern: declaration maps in dist/ point at ../src
  "repository": {                                  // AM-038: trusted publishing and provenance match this url
    "type": "git",
    "url": "git+https://github.com/websublime/line-ui.git",
    "directory": "packages/line-genui"
  },
  // no "sideEffects" field (§10 SD4, SD5); ./a2ui calls customElements.define() at module top
  "publishConfig": { "access": "public" },
  "exports": {
    "./catalog": {                                 // PRD Appendix D: descriptors, catalogs, emitters; touches no DOM
      "types": "./dist/catalog/index.d.ts",
      "import": "./dist/catalog/index.js"
    },
    "./catalog.json": "./dist/catalog.json",       // PRD Appendix D; key added by G2 with its emitter
    "./a2ui": {                                    // PRD Appendix D: session and <line-a2ui-surface>, Preview status
      "types": "./dist/a2ui/index.d.ts",
      "import": "./dist/a2ui/index.js"
    }
  },
  "dependencies": {
    "@a2ui/web_core": "0.14.0",                    // exact pin (§10 SD6, PRD §2 line 174, R1 §2.1)
    "@websublime/line-core": "workspace:^",
    "zod": "^3.25.76"                              // Zod 3 API (plan §5.6 defaults, R3 §2.2, R1 §2.2)
  },
  "peerDependencies": {                            // loaded lazily through import() (PRD §6.1, ARCH §12, §17.1)
    "@websublime/line-components": "workspace:^",
    "@websublime/line-icons": "workspace:^"
  },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --noEmit false --emitDeclarationOnly",   // §10 SD7, D1
    "dev": "trap 'kill 0' INT TERM; vite build --watch & tsc -p tsconfig.json --noEmit false --emitDeclarationOnly --watch & wait",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  }
}
```

- The package has no root `"."` export. PRD Appendix D lists exactly three public surfaces (§10 SD8).
- `@a2ui/web_core` 0.14.0 declares `lit ^3.3.3` and `zod ^3.25.76` among seven dependencies and no peers (R1 §2.2). A clean install resolves one `lit` and one `zod` (R1 §2.2, P4).
- `@a2ui/web_core` moves to a newer version only through an AM after the R1 and R2 probes run again (§10 SD6).
- Every bare specifier that `dist/` imports MUST appear in `dependencies` or `peerDependencies` (§10 SD2). A G task that adds a direct import of `lit` or another package adds the declaration in the same PR.
- `vite.config.mjs` calls the shared factory with `entries: { 'catalog/index': 'src/catalog/index.ts', 'a2ui/index': 'src/a2ui/index.ts' }` (P1).
- The `peerDependencies` carry no `peerDependenciesMeta`. PRD §6.1 and ARCH §17.1 name both as peers, and no decision makes either optional (§10 SD9).

### 4.2 `@websublime/line-components`

```jsonc
{
  "name": "@websublime/line-components",
  "version": "0.1.0",                              // released at 0.2.0 by the Phase 1 minor changeset (§7.2)
  "type": "module",
  "license": "MIT",
  "files": ["dist", "src", "custom-elements.json"],// P10: shipped manifest (D8)
  "repository": {
    "type": "git",
    "url": "git+https://github.com/websublime/line-ui.git",
    "directory": "packages/line-components"
  },
  // "sideEffects" removed (§10 SD4, AM to Phase 00 spec §4.7)
  "customElements": "./custom-elements.json",     // P10 (D8)
  "publishConfig": { "access": "public" },
  "exports": {
    ".":                     { "types": "./dist/index.d.ts",                  "import": "./dist/index.js" },
    "./custom-elements.json": "./custom-elements.json",
    "./button":              { "types": "./dist/button/index.d.ts",           "import": "./dist/button/index.js" },
    "./icon":                { "types": "./dist/icon/index.d.ts",             "import": "./dist/icon/index.js" },
    "./stack":               { "types": "./dist/stack/index.d.ts",            "import": "./dist/stack/index.js" },
    "./separator":           { "types": "./dist/separator/index.d.ts",        "import": "./dist/separator/index.js" },
    "./icon-button":         { "types": "./dist/icon-button/index.d.ts",      "import": "./dist/icon-button/index.js" },
    "./button-group":        { "types": "./dist/button-group/index.d.ts",     "import": "./dist/button-group/index.js" },
    "./alert":               { "types": "./dist/alert/index.d.ts",            "import": "./dist/alert/index.js" },
    "./chip":                { "types": "./dist/chip/index.d.ts",             "import": "./dist/chip/index.js" },
    "./badge":               { "types": "./dist/badge/index.d.ts",            "import": "./dist/badge/index.js" },
    "./avatar":              { "types": "./dist/avatar/index.d.ts",           "import": "./dist/avatar/index.js" },
    "./avatar-group":        { "types": "./dist/avatar-group/index.d.ts",     "import": "./dist/avatar-group/index.js" },
    "./visually-hidden":     { "types": "./dist/visually-hidden/index.d.ts",  "import": "./dist/visually-hidden/index.js" },
    "./portal":              { "types": "./dist/portal/index.d.ts",           "import": "./dist/portal/index.js" },
    "./kbd":                 { "types": "./dist/kbd/index.d.ts",              "import": "./dist/kbd/index.js" },
    "./skeleton":            { "types": "./dist/skeleton/index.d.ts",         "import": "./dist/skeleton/index.js" },
    "./presence":            { "types": "./dist/presence/index.d.ts",         "import": "./dist/presence/index.js" },
    "./grid":                { "types": "./dist/grid/index.d.ts",             "import": "./dist/grid/index.js" },
    "./center":              { "types": "./dist/center/index.d.ts",           "import": "./dist/center/index.js" },
    "./aspect-ratio":        { "types": "./dist/aspect-ratio/index.d.ts",     "import": "./dist/aspect-ratio/index.js" },
    "./spinner":             { "types": "./dist/spinner/index.d.ts",          "import": "./dist/spinner/index.js" }
  },
  "dependencies": {
    "@websublime/line-core": "workspace:^",
    "@websublime/line-themes": "workspace:^",
    "@websublime/line-tokens": "workspace:^",
    "@websublime/line-utils": "workspace:^",
    "@zag-js/core": "^1.46.0",                     // P9 (§10 SD2); ButtonGroup custom machine (§10 SD10)
    "@zag-js/presence": "^1.46.0",                 // added by C16 (Presence, Pre-built, plan §2.2)
    "@zag-js/toggle": "^1.46.0",                   // added by C8 (Chip, Pre-built, §10 SD11)
    "lit": "^3.3.3"                                // P9 (§10 SD2)
  },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --noEmit false --emitDeclarationOnly && bun run analyze",  // P8, P10
    "analyze": "custom-elements-manifest analyze --config custom-elements-manifest.config.mjs",            // P10
    "dev": "trap 'kill 0' INT TERM; vite build --watch & tsc -p tsconfig.json --noEmit false --emitDeclarationOnly --watch & wait",
    "clean": "rm -rf dist custom-elements.json",
    "typecheck": "tsc --noEmit"
  }
}
```

Entrypoints and tags (plan §2.2, §10 SD12, ARCH §12):

| Task | Subpath | Registers | Kind |
|---|---|---|---|
| C1 | `./button` | `line-button` | independent |
| C2 | `./icon` | `line-icon` | independent |
| C3 | `./stack` | `line-stack` | independent (§10 SD12) |
| C4 | `./separator` | `line-separator` | independent (§10 SD12) |
| C5 | `./icon-button` | `line-icon-button` | independent |
| C6 | `./button-group` | `line-button-group` | independent; slots its buttons (ARCH §13.1) |
| C7 | `./alert` | `line-alert` | independent |
| C8 | `./chip` | `line-chip` | independent |
| C9 | `./badge` | `line-badge` | independent (§10 SD12) |
| C10 | `./avatar` | `line-avatar` | independent |
| C11 | `./avatar-group` | `line-avatar-group` | independent; takes avatars through a slot (§10 SD4) |
| C12 | `./visually-hidden` | `line-visually-hidden` | independent (§10 SD12) |
| C13 | `./portal` | `line-portal` | independent (§10 SD12) |
| C14 | `./kbd` | `line-kbd` | independent; one tag with OS-aware rendering (§10 SD12) |
| C15 | `./skeleton` | `line-skeleton` | independent (§10 SD12) |
| C16 | `./presence` | `line-presence` | independent |
| C17 | `./grid` | `line-grid` | independent (§10 SD12) |
| C18 | `./center` | `line-center` | independent (§10 SD12) |
| C19 | `./aspect-ratio` | `line-aspect-ratio` | independent (§10 SD12) |
| C20 | `./spinner` | `line-spinner` | independent |

- Each C task adds its own `exports` key and its own `vite.config.mjs` entry `'<c>/index': 'src/<c>/index.ts'` in the same PR. The table is the final map at phase exit.
- The root `"."` stays types and shared utilities only and registers no element (ARCH §12).
- No component module imports another component module (§10 SD4, MANIFESTO Law 4, Law 6). Default Rolldown chunking applies (§10 SD4).
- The `dependencies` list MUST equal the set of bare specifiers that `dist/` imports, apart from `@websublime/*` packages already listed (§10 SD2). The list above is the expected phase-exit set. `@zag-js/vanilla` is absent because components reach it through `@websublime/line-core/machine` (`packages/line-core/src` imports, R7 §2.1) [INFERENCE: holds while no component imports `@zag-js/vanilla` directly] (§10 SD13).

### 4.3 `@websublime/line-icons`

```jsonc
{
  "name": "@websublime/line-icons",
  "version": "0.1.0",                              // released at 0.2.0 (§7.2)
  "type": "module",
  "license": "MIT",
  "files": ["dist", "src"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/websublime/line-ui.git",
    "directory": "packages/line-icons"
  },
  "sideEffects": false,                            // unchanged (R10 §6 Q4); OQ-C22 may revise it
  "publishConfig": { "access": "public" },
  "exports": {
    ".":                    { "types": "./dist/index.d.ts",              "import": "./dist/index.js" },              // kept (Phase 00 consumers)
    "./registry":           { "types": "./dist/registry.d.ts",           "import": "./dist/registry.js" },           // plan §2.5, PRD §6.2
    "./resolvers/lucide":   { "types": "./dist/resolvers/lucide.d.ts",   "import": "./dist/resolvers/lucide.js" },   // plan §2.5
    "./resolvers/phosphor": { "types": "./dist/resolvers/phosphor.d.ts", "import": "./dist/resolvers/phosphor.js" }, // plan §2.5
    "./a2ui":               { "types": "./dist/a2ui/index.d.ts",         "import": "./dist/a2ui/index.js" }          // §10 SD14, SD15
  },
  "dependencies": {
    "@websublime/line-tokens": "workspace:^"
  },
  "peerDependencies": {
    "lucide-static": "^1.16.0",
    "@phosphor-icons/core": "^2.1.1"
  },
  "peerDependenciesMeta": {
    "lucide-static": { "optional": true },
    "@phosphor-icons/core": { "optional": true }
  },
  "scripts": {
    "build": "tsc -b",                             // tsc 7.x after P8 (D1)
    "dev": "tsc -b --watch",
    "clean": "rm -rf dist tsconfig.tsbuildinfo",
    "typecheck": "tsc --noEmit"
  }
}
```

- `./a2ui` holds the map of the A2UI icon names as per-set data (§10 SD14, SD15). §6.C.3 states the decided icon surface in full.
- The loading mechanism inside `./resolvers/*` is open question OQ-C22 (§11, §6.C.3). The subpath names above do not depend on it (plan §2.5, PRD §6.2).
- `lucide-static` `latest` was 1.60.0 on 2026-10-20 (npm registry). The mapped names were checked only against 1.16.0, 1.56.0 and 1.59.0 (R10 P4, P8). The C22 owner re-checks the peer floor.

### 4.4 `@websublime/line-themes`

```jsonc
{
  "name": "@websublime/line-themes",
  "version": "0.1.2",                              // released at 0.2.0 (§7.2)
  "type": "module",
  "license": "MIT",
  "files": ["dist"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/websublime/line-ui.git",
    "directory": "packages/line-themes"
  },
  "sideEffects": ["*.css"],
  "publishConfig": { "access": "public" },
  "exports": {
    ".": "./dist/index.css",
    "./accent/*": "./dist/accent/*.css",
    "./gray/*": "./dist/gray/*.css",
    "./semantics": "./dist/semantics.css",
    "./aliases": "./dist/aliases.css",
    "./defaults": "./dist/defaults.css",
    "./hosts/mcp-apps.css": "./dist/hosts/mcp-apps.css"   // G6 (PRD Appendix D, PRD §7.3 item 7)
  },
  "dependencies": {
    "@websublime/line-colors": "workspace:^",
    "@websublime/line-schemas": "workspace:^"
  },
  "scripts": {
    "build": "postcss src/index.css -o dist/index.css && postcss 'src/*.css' -d dist && postcss 'src/accent/*.css' -d dist/accent && postcss 'src/gray/*.css' -d dist/gray && postcss 'src/hosts/*.css' -d dist/hosts",
    "dev": "trap 'kill 0' INT TERM; postcss src/index.css -o dist/index.css --watch & postcss 'src/*.css' -d dist --watch & postcss 'src/accent/*.css' -d dist/accent --watch & postcss 'src/gray/*.css' -d dist/gray --watch & postcss 'src/hosts/*.css' -d dist/hosts --watch & wait",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  }
}
```

- The export key keeps the `.css` suffix because PRD Appendix D and PRD §7.3 name the specifier `@websublime/line-themes/hosts/mcp-apps.css`.
- `src/index.css` does not import the bridge [INFERENCE: the bridge targets MCP Apps views only, PRD Appendix D "Tiers"] (§10 SD16).
- The bridge adds no dependency and no runtime code (MANIFESTO Law 10, §10 SD17).
- The `lint-layers` prefix audit already scans every CSS file under `src/` and `dist/` (`scripts/lint-layers.mjs:268-295`). PRD §7.3 requires the bridge to pass it.

### 4.5 `@websublime/line-core`

The `exports` map, `files`, `sideEffects` and `dependencies` stay as in `packages/line-core/package.json:1-48`. No decision changes them.

| Task | Change | Public surface |
|---|---|---|
| C21 | `LineMachineController` calls `updateProps` on every host update (D7). It carries the measured cost budget and the fallback of §10 SD18 | No new export. The fallback is a `VanillaMachine` subclass internal to `./machine` (§10 SD18) |
| C23 | `LineElement` attaches `ElementInternals` for every component and exposes a protected `internals` accessor. `FormAssociated` reuses it. No `globalThis` registration (§10 SD19) | Protected member only. `LineElement` stays exported from `"."` |
| P5 | `/* @__PURE__ */` on each `createSheet()` call in `src/styles/index.ts:30-40` (§10 SD20, R9 §2.1) | None. `./styles` keeps its exports (Phase 00 spec §6.D.7) |
| P8 | `build` becomes `vite build && tsc -p tsconfig.json --noEmit false --emitDeclarationOnly`; `dev` gains the `tsc --watch` half (§10 SD7, D1) | None |

## 5. Repository Layout

New and changed paths only. `+` marks a new path and `~` a changed one.

```
.github/workflows/checks.yml                         ~ P5, P7, P10, S1 (steps below)
CODE_OF_CONDUCT.md                                   + Z1
CLAUDE.md                                            ~ P8 Tech Stack; Z2 ledger pointer
.claude/agents/webcomponents-supervisor.md           ~ P8 (lines 15, 72)
.gitignore                                           ~ P10 (packages/line-components/custom-elements.json)
package.json                                         ~ P5 esbuild, P7 @axe-core/playwright, P8 typescript 7.x, vite-plugin-dts removed
playwright.config.ts                                 ~ S1 (webServer for apps/site)
custom-elements-manifest.config.mjs                  - P10 (removed; replaced by the package config)
vite.config.shared.mjs                               ~ P8 (dts removed), P9 (derived externals)
scripts/lint-layers.mjs                              ~ P2 (ALLOWED_EDGES, header)
scripts/verify-pack.mjs                              ~ P10 (customElements target check)
scripts/report-size.mjs                              + P5 (size report, §10 SD21)
docs/PROCESS.md                                      ~ Z2 (§4)
docs/specs/00-spec-design-system.md                  ~ AM rows of P5, P8, P9, P10
docs/retrospective/01-<slug>.md                      + Z3
apps/site/package.json                               ~ S1 (@websublime/* devDependencies)
apps/site/src/pages/index.astro                      ~ S1
apps/site/__tests__/landing.e2e.ts                   + S1
apps/storybook/package.json                          ~ P10 (analyze script removed)
apps/storybook/.storybook/main.ts                    ~ P10 (comment at :24)
apps/storybook/.storybook/preview.ts                 ~ P10 (setCustomElementsManifest)
apps/storybook/types/line-css.d.ts                   + P8 (ambient CSS module declarations)
apps/storybook/tsconfig.json                         ~ P8 (includes types/)
packages/line-core/package.json                      ~ P8
packages/line-core/src/styles/index.ts               ~ P5 (PURE annotations)
packages/line-components/package.json                ~ P8, P9, P10, C1–C20
packages/line-components/vite.config.mjs             ~ C1–C20 (one entry each)
packages/line-components/custom-elements-manifest.config.mjs  + P10
packages/line-components/__tests__/bundle-splitting.test.ts   + P5
packages/line-components/__tests__/line-element-identity.test.ts + P9
packages/line-components/src/<c>/                    + C1–C20 (ARCH §10)
packages/line-components/__tests__/a11y/*.e2e.ts     + P7 harness, one file per component from C1 on
packages/line-genui/                                 + P1
  package.json  tsconfig.json  vite.config.mjs  README.md
  src/catalog/index.ts                               + P1 (G1–G3 fill it)
  src/a2ui/index.ts                                  + P1 (G4 fills it)
  __tests__/                                         + G tasks
packages/line-icons/package.json                     ~ C22, G2 (./a2ui)
packages/line-icons/src/registry.ts                  + C22
packages/line-icons/src/a2ui/                        + C2 or G2 owner (§10 SD14, SD15)
packages/line-themes/package.json                    ~ G6
packages/line-themes/src/hosts/mcp-apps.css          + G6
```

- `apps/storybook/types/line-css.d.ts` is a path choice [INFERENCE] (§10 SD22). Any `.d.ts` that `apps/storybook/tsconfig.json` includes satisfies R11 OQ2 (b).
- `packages/line-components/__tests__/` sits on the `verify-pack` denylist and never ships (`scripts/verify-pack.mjs:145-155`).

## 6. Implementation Detail Per Stream

### 6.P Platform and release

Owner of every P task is `infra-supervisor` (plan §4.0). P8, P9 and P10 land after spec approval and before C1 (plan §6).

#### 6.P.1 P1 — Scaffold `packages/line-genui`

- **Owner:** infra-supervisor.
- **Deps:** spec APPROVED, P2.
- **Changes:**
  - `packages/line-genui/package.json` as in §4.1, without the `./catalog.json` key (G2 adds it).
  - `packages/line-genui/tsconfig.json`, a copy of `packages/line-core/tsconfig.json:1-10`.
  - `packages/line-genui/vite.config.mjs` with the two entries of §4.1.
  - `src/catalog/index.ts` and `src/a2ui/index.ts` as zero-export modules (`export {};`), the Phase 00 precedent of `line-components` (Phase 00 spec §4.7). G2 adds the `./catalog.json` key with its emitter (§10 SD23).
  - `README.md` stating the Preview status of `./a2ui` (PRD Appendix D "Preview policy").
  - A `minor` changeset for `@websublime/line-genui` (§10 SD3).
- **Contract:**
  - The manifest MUST match §4.1 key for key.
  - `src/catalog/` MUST NOT import from `src/a2ui/`, so `./catalog` touches no DOM (PRD Appendix D).
  - `bun install` MUST resolve `@a2ui/web_core` at exactly 0.14.0 (§10 SD6).
- **Acceptance:**
  - `bun run build` emits `dist/catalog/index.{js,d.ts}` and `dist/a2ui/index.{js,d.ts}`.
  - `bun run scripts/verify-pack.mjs` passes for nine packages.
  - `bun run scripts/lint-layers.mjs` passes with the real `line-genui` manifest.

#### 6.P.2 P2 — Layer edges

- **Owner:** infra-supervisor.
- **Deps:** spec APPROVED.
- **Changes:** `scripts/lint-layers.mjs:59-68` and its header comment, as §3.3 states.
- **Contract:**
  - `ALLOWED_EDGES` MUST equal the §3.3 block.
  - No other package entry gains `line-genui` (PRD §6.1).
- **Acceptance:**
  - `lint-layers` passes against a fixture manifest that declares the §3.2 `line-genui` edges [the check is run once by hand and recorded in the Verify record].
  - A throwaway manifest that adds `line-genui` to `line-components` `dependencies` fails the guard [the check is run once by hand and recorded in the Verify record].

#### 6.P.3 P3 — Publish, `verify-pack` and Changesets coverage of the 9th package

- **Owner:** infra-supervisor.
- **Deps:** P1.
- **Changes:**
  - None in `scripts/publish.mjs`. It discovers packages from `packages/*` and treats an E404 from `npm view` as new (R9 §2.5).
  - None in `.changeset/config.json`. Its `ignore` list holds only the two apps (`.changeset/config.json:14`).
- **Contract:**
  - `discoverPublishable()` MUST list `@websublime/line-genui` (`scripts/verify-pack.mjs:45`).
  - The peer edges of `line-genui` MUST NOT push any package above `0.2.0` at the Phase 1 Version PR (§7.2).
- **Acceptance:**
  - `verify-pack` packs `line-genui` and reports zero failures, checks (a)–(e) included.
  - In a throwaway copy of the repo with the Phase 1 changesets, `changeset version` yields `0.2.0` for all nine packages (R9 §2.6 method). The Verify record lists the nine versions.

#### 6.P.4 P4 — Trusted publisher bootstrap

- **Owner:** infra-supervisor, with Miguel for the npmjs.com steps.
- **Deps:** P1, P3.
- **Changes:** none in the repository. The steps run on npmjs.com and in the GitHub `npm` environment.
- **Contract:** P4 MUST follow path A, the AM-038 order (PRD §7.3 item 10, plan §2.6, R9 §2.5).

| Step | Action | Source |
|---|---|---|
| 1 | Create a short-lived granular token with publish access and store it as `NPM_TOKEN` in the `npm` environment | AM-038 (4), Phase 00 spec §7.2 |
| 2 | Run `snapshot-deploy.yml` on `main`. The token publishes the first `line-genui` canary, `0.2.0-<sha>-SNAPSHOT` | R9 §2.5 path A; §10 SD3 |
| 3 | Delete the token from the environment and from npmjs.com | AM-038 |
| 4 | Add the trusted publisher for `snapshot-deploy.yml` with environment `npm` and "npm publish" ticked | AM-038 (4); R9 §2.5 |
| 5 | Publish an OIDC canary through `snapshot-deploy.yml` within 48 hours of step 4 | R9 §2.5 (48-hour expiry) |
| 6 | Add the trusted publisher for `release.yml` within the 48 hours before the Phase 1 Version PR merge | AM-038 (5) |
| 7 | Set "Require 2FA and disallow tokens" on the package | R9 §2.5 path A |

- npm points `latest` at the first canary until the first stable ships (AM-042, R9 §2.5). This effect is accepted (§10 SD3).
- `npm trust` and staged publishing need npm ≥ 11.15.0 (R9 §2.5). Path A uses the npmjs.com settings page and needs neither.
- **Acceptance:**
  - `npm view @websublime/line-genui` returns the step 5 canary with provenance.
  - The package settings show two trusted publishers and token publishing disallowed before the first stable release (plan §7.4).

#### 6.P.5 P5 — Bundle-splitting verification

- **Owner:** infra-supervisor.
- **Deps:** P9, C1. Each later C task extends the expected-tag table in the test.
- **Changes:**
  - `packages/line-components/__tests__/bundle-splitting.test.ts`, run by the existing "Unit tier" step (`.github/workflows/checks.yml:38-39`).
  - Root `devDependencies` gain `"esbuild": "^0.28.2"` (R9 §2.1 probe version).
  - `.github/workflows/checks.yml:28-29`, the "Zero-export smoke" step, is removed. The root-registers-nothing assertion of the harness replaces it (§10 SD24).
  - `scripts/report-size.mjs` and the `createSheet` annotations (§7.6).
  - AM row to Phase 00 spec §9.1 for the removed RK11 smoke step. §9.1 holds the zero-export criterion (`docs/specs/00-spec-design-system.md:2542`), and the step name cites it (`.github/workflows/checks.yml:28`).
- **Contract:** §7.5 holds in full, except the `line-genui` registration row, which G4 adds to the harness (§6.G.4).
- **Acceptance:**
  - The test fails when a subpath registers a tag outside its §4.2 row.
  - The test fails when the esbuild bundle emits an `ignored-bare-import` warning.

#### 6.P.6 P6 — CDN delivery check

- **Owner:** infra-supervisor.
- **Deps:** the first `0.2.0` canary of `line-core` and `line-components` that contains C1.
- **Changes:**
  - A Playwright file `packages/line-components/__tests__/cdn.e2e.ts` that runs only on `workflow_dispatch` and before each release, never on `pull_request` [INFERENCE: it needs published versions and live CDNs, R9 §2.3] (§10 SD25).
  - The two documented paths in the Getting Started guide (task D3).
- **Contract:** §7.7 holds.
- **Acceptance:**
  - The jsDelivr page passes in Chromium, Firefox and WebKit.
  - The unpkg page passes in Chromium and WebKit. A Firefox failure caused by cold CORS or MIME errors is recorded with the response headers (R9 §2.3).
  - The release PR records both runs.

#### 6.P.7 P7 — axe tier

- **Owner:** infra-supervisor.
- **Deps:** spec APPROVED. Component files land with C1 onwards.
- **Changes:**
  - Root `devDependencies` gain `"@axe-core/playwright": "^4.14.0"` (R8 §2.4).
  - A shared helper `packages/line-components/__tests__/a11y/axe.ts` that wraps `AxeBuilder` with the §7.4 ruleset.
  - Each component adds `<c>.e2e.ts` against its stories on `storybook-static` (port 4320, `playwright.config.ts:17-21`).
  - `@storybook/addon-a11y` stays in `apps/storybook/.storybook/main.ts:13` as the author panel (PRD §5.2).
- **Contract:** §7.4 holds.
- **Acceptance:**
  - The existing "Browser tier" step (`checks.yml:42-43`) runs the axe files in three engines.
  - A fixture with an unnamed inner `<button>` fails with `button-name` (R8 §2.4 fixture table).

#### 6.P.8 P8 — TypeScript 7 upgrade

- **Owner:** infra-supervisor.
- **Deps:** spec APPROVED. Blocks C1 (plan §6).
- **Changes:** §7.1 lists every file.
- **Contract:**
  - The same PR updates every live document that plan §2.9 lists, in one commit (plan §2.9).
  - The PR carries one AM row to the Phase 00 spec that covers these places: §1 diagram line 74; §6.A.3 `vite-plugin-dts` row (line 440) and `typescript` row (line 444); §6.B `line-core` row (line 610); §6.F.2 `vite.config.shared.mjs` block (lines 1670, 1685); §7.1 `emitDeclarationOnly` note (line 2450); §7.1 matrix (lines 2468–2469) (plan §2.9).
  - `docs/context/00-z20.md:49` stays as historical record (plan §2.9).
- **Acceptance:**
  - `bun run build`, `bun --filter '@websublime/*' typecheck` and `verify-pack` exit 0 on `typescript` 7.x.
  - `node_modules/.bin/tsc --version` prints 7.x.
  - A grep for "TypeScript 5", "5.9.3" and `vite-plugin-dts` returns zero live hits outside the historical records plan §2.9 names (PROCESS §3).

#### 6.P.9 P9 — `@websublime/*` external

- **Owner:** infra-supervisor.
- **Deps:** spec APPROVED, P8 (both edit `vite.config.shared.mjs`). Blocks C1.
- **Changes:**
  - `vite.config.shared.mjs` derives `external` from the package manifest (§10 SD2). The block below is the full file after P8 and P9.
  - Each `vite.config.mjs` passes `root: import.meta.dirname`.
  - `packages/line-components/package.json` removes `sideEffects` and declares `lit` and `@zag-js/core` (§4.2; §10 SD4, SD2). This baseline lands before C1 (§10 SD24).
  - `packages/line-components/__tests__/line-element-identity.test.ts` (§7.5).
  - AM row to Phase 00 spec §6.F.2 for the externals, and AM row to §4.7 for `sideEffects` (R9 §4).

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';

// Shared Vite library-mode config factory (Phase 00 spec §6.F.2, Phase 1 spec P8, P9).
// Every name in `dependencies` and `peerDependencies`, and every subpath of it, stays external.
export default function shared(pkg) {
  const manifest = JSON.parse(readFileSync(join(pkg.root, 'package.json'), 'utf8'));
  const names = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
  return defineConfig({
    build: {
      target: 'es2022',
      lib: { entry: pkg.entries, formats: ['es'] },
      rollupOptions: {
        external: (id) => names.some((name) => id === name || id.startsWith(`${name}/`)),
      },
      sourcemap: true,
    },
  });
}
```

- **Contract:**
  - `line-core`, `line-components` and `line-genui` builds MUST leave every declared package external.
  - Every bare specifier in a built `dist/**/*.js` MUST name a declared package (§10 SD2).
- **Acceptance:**
  - `dist/` of `line-components` imports `@websublime/line-core` and `@websublime/line-core/styles` as bare specifiers (R9 §3 probe 6).
  - A script check over `dist/**/*.js` of the three Vite packages finds no undeclared bare specifier. It runs inside `bundle-splitting.test.ts`.
  - The identity test of §7.5 passes (plan §7.4).

#### 6.P.10 P10 — CEM wiring and packaging

- **Owner:** infra-supervisor.
- **Deps:** spec APPROVED, P8. Blocks the C1 Storybook docs and G5 (plan §6).
- **Changes:**
  - `packages/line-components/custom-elements-manifest.config.mjs`, written by the package build (§10 SD26):

```js
import { litPlugin } from '@custom-elements-manifest/analyzer/src/features/framework-plugins/lit/lit.js';

// Shipped manifest (Phase 1 spec P10, D8). line-core sources are analysed so that
// inheritance from LineElement resolves by class name (R4 §2.3).
export default {
  globs: ['src/**/*.ts', '../line-core/src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.stories.ts', '**/*.d.ts'],
  outdir: '.',
  packagejson: false,
  plugins: [...litPlugin()],
};
```

  - `packages/line-components/package.json` gains `customElements`, the `files` entry, the `./custom-elements.json` export and the `analyze` script (§4.2).
  - `apps/storybook/.storybook/preview.ts` imports the manifest through `@websublime/line-components/custom-elements.json` with `{ type: 'json' }` and calls `setCustomElementsManifest` before `preview` is exported (R4 §2.8).
  - `apps/storybook/.storybook/main.ts:24` loses the claim that the manifest loads on its own.
  - The root `custom-elements-manifest.config.mjs`, the `apps/storybook` `analyze` script, `customElements.json` in its `clean` script, and the "Storybook analyze (CEM)" step (`checks.yml:46-47`) are removed (§10 SD27).
  - `scripts/verify-pack.mjs:163` adds `customElements` to the `main`/`module`/`types` field list of check (a).
  - `.gitignore` gains `packages/line-components/custom-elements.json`.
  - AM row to Phase 00 spec §6.F.1 and §7.3 for the move from a root-only manifest to a package manifest.
- **Contract:** §7.3 holds.
- **Acceptance:**
  - `verify-pack` fails when `custom-elements.json` is missing from the `line-components` tarball.
  - The Storybook autodocs page of C1 shows the attributes, slots, events and CSS parts of `line-button`.
  - The analyser runs before the Storybook build by construction, because the root build runs packages before apps (`package.json:23`).

### 6.C Stream C — Core Primitives

#### 6.C.0 Overview and order

- Owner of every C task: `webcomponents-supervisor` (plan §4.0).
- Stream C ships the 20 core primitives of PRD §4.1 (plan §2.2) and three `line-core`/`line-icons` prerequisites: C21, C22 and C23 (plan §4.3; §10 SD19).
- C21–C23 take numbers after the 20 component rows, so C1–C20 keep their component mapping (plan §4.3).

**Order (plan §4.3, §6)**

| Step | Tasks | Gate |
|---|---|---|
| 1 | C21, C23, P7, P8, P9, P10 | Spec APPROVED. All six land before C1 (plan §6; §10 SD19, SD86). |
| 2 | C22 | Lands before C2 (plan §6). Its mechanism waits on R10 round 2 (OQ-C22). |
| 3 | C1 Button, C2 Icon, C3 Stack, C4 Separator | Ship without descriptors. Stream G writes their descriptors (plan §4.3, PRD §7.3 validating set). |
| 4 | G1–G7 | Validate on C1–C4 (plan §6). |
| 5 | C5–C20 | Each ships its descriptor in the same PR (plan §2.2, §4.3). |

- Every C1–C20 row runs this sequence (plan §4.3).
  1. Component spec APPROVED (PRD §8.3).
  2. Implementation.
  3. Descriptor in the same PR (C5–C20 only).
  4. Storybook docs.
  5. Changeset.
  6. CEM entry.
- Component internals belong in the component specs `docs/specs/NNNN-<component>.md`, numbered by the PRD §4 spec link (plan §2.3).

#### 6.C.1 C21 — `LineMachineController.updateProps` (D7)

- **Owner:** `webcomponents-supervisor`.
- **Deps:** spec APPROVED. Blocks C1 (plan §6).
- **Changes**
  - `packages/line-core/src/machine/line-machine-controller.ts`: the controller calls `updateProps` on every host update, and a component declares its machine props as a function of its properties (plan §5.6 D7 (a); R7 §6 OQ1 (b)).
  - `packages/line-core/README.md:10` and `packages/line-core/src/machine/index.ts:2`: replace the "four public" count. `@zag-js/vanilla` exports five values and `line-core` leaves out `toStyleString` (AM-073). The listed names stay (plan §4.3).
  - A per-component update-rate benchmark under `packages/line-core/__tests__/` [INFERENCE: location] (§10 SD28).
  - If a component exceeds the budget, C21 adds a `line-core` `VanillaMachine` subclass (§10 SD18).

**Contract**

- The controller MUST call `updateProps` from its host-update path on every host update (plan §5.6 D7 (a)).
- A component MUST declare machine props as a function of its own properties. It MUST NOT call `updateProps` itself and MUST NOT send events from `updated()` to carry props (plan §5.6 D7 (b), (c) rejected).
- The controller MUST keep starting machines in `hostConnected` (R7 §6 OQ7 (a); §10 SD29; `packages/line-core/src/machine/line-machine-controller.ts:66`).
- Each `VanillaMachine.updateProps` call wraps the previous props source, and `prop()` re-runs the whole chain. A `prop()` read grew from 0.013 ms to 0.397 ms over 4,000 calls (R7 §2.3, probe P4).
- C21 MUST measure the host update rate per machine component and MUST set a budget (§10 SD18). The C21 PR records the budget and its unit. The highest expected rate comes from agent data bindings that stream into props [INFERENCE].
- C21 MUST file an upstream Zag issue on the nesting closure chain and link it from the task PR (§10 SD18; R7 §6 OQ1).
- If a measured rate exceeds the budget, `line-core` MUST ship a `VanillaMachine` subclass whose `updateProps` replaces the props source instead of nesting. The controller MUST use the subclass only for the components past the budget (§10 SD18).
- The subclass MUST stay inside `line-core`. Components never import `@zag-js/vanilla` (ARCH §8; `packages/line-core/README.md:12`).
- Zag stays on 1.x at `^1.46.0` until 2.0.0 ships stable (R7 §6 OQ8 (a); §10 SD30).

**Acceptance**

- A controller test proves a host property change reaches the machine guard on the next event without a component call.
- The C21 PR reports the update rate per machine component, the budget and its unit.
- The C21 PR links the upstream issue.
- README and `machine/index.ts` state the correct count.
- The fallback subclass exists only if a component exceeds the budget, and a test then shows a flat `prop()` cost over 4,000 calls.

#### 6.C.2 C23 — `LineElement` attaches `ElementInternals`

- **Owner:** `webcomponents-supervisor`.
- **Deps:** spec APPROVED. Blocks C1 (§10 SD19).
- **Changes**
  - `packages/line-core/src/line-element.ts`: attach internals once per element and expose a protected `internals` accessor (§10 SD19; R8 §2.5 option (c)).
  - `packages/line-core/src/line-element.ts:30-32`: replace the empty `reflectState` with a body that writes `data-*` and `:state()` (R8 §2.5).
  - `packages/line-core/src/mixins/form-associated.ts:77-82`: drop its own `attachInternals()` call and reuse the base accessor (§10 SD19).

**Contract**

- `LineElement` MUST call `attachInternals()` once for every component and expose it through one protected `internals` accessor (§10 SD19).
- `FormAssociated` MUST reuse that accessor. A second `attachInternals()` throws `NotSupportedError` (R8 §2.5, probe P1).
- `LineElement` MUST NOT set `formAssociated`. Only §7 components opt in (MANIFESTO Law 7; ARCH §7).
- `LineElement.reflectState` MUST reflect machine state as both `data-<state>` and `:state(<state>)`, so ARCH §14.8 holds for every component, Chip, ButtonGroup, AvatarGroup and IconButton included (§10 SD19; ARCH §14.8).
- `line-core` MUST NOT register internals on `globalThis` (§10 SD19). The protocol is a draft and exposes form state (R8 §2.5).
- Interactive roles stay on inner native elements, so the internals carry state and not the role (§10 SD31; R8 §2.4).
- C23 MUST measure the per-element cost of `attachInternals()` and report it in the PR (§10 SD19; R8 §6 Q2).

**Acceptance**

- A plain `LineElement` subclass reflects `data-x` and `:state(x)` through `reflectState`.
- A `FormAssociated(LineElement)` subclass attaches internals exactly once and keeps its form behaviour.
- No `globalThis` write exists in `line-core` source.
- The PR reports the measured per-element cost.

#### 6.C.3 C22 — `line-icons` resolvers for consumer bundles

- **Owner:** `webcomponents-supervisor`.
- **Deps:** spec APPROVED, R10 round 2 (row `00-Z47`, `docs/research/01-research-icon-round2.md`). Blocks C2 (plan §6).
- **Problem:** the reference resolvers use a template `import()` with a Vite-only `?raw` query (`packages/line-icons/src/resolvers/lucide.ts:8`, `phosphor.ts:16`). A Vite 8 production build emits no icon (R10 §3 P6).
- **Mechanism:** open. See OQ-C22 in §11. This section states only the acceptance contract and the decided icon surface.

**Acceptance contract**

- A consumer production build with Vite 8, esbuild and webpack MUST render a resolved icon with no consumer bundler plugin (plan §2.5; R10 §6 Q3).
- A no-build page over jsDelivr `+esm` and a no-build page over unpkg raw files MUST render the same icon (R10 §6 Q3; §10 SD32).
- A missing or invalid icon MUST leave `<line-icon>` in the neutral C8 state, and nothing MUST throw to the consumer (ARCH §17.2 C8; MANIFESTO Law 9). Today `IconRegistry.resolve` and the resolvers throw (`packages/line-icons/src/index.ts:21`; `resolvers/icon-name.ts:5`; `resolvers/phosphor.ts:13`).
- The ARCH §11 rule "zero icons bundled in `line-icons` core" holds (ARCH §11).

**Decided icon surface**

- `<line-icon>` takes the attributes `name`, `library` and `src` and has no default slot (§10 SD14; R10 §6 Q1; PRD §4.1 Icon row).
- `<line-icon>` gains a JSON-serialisable `path` property that draws `<svg viewBox="0 0 24 24"><path>` and sets `d` through `setAttribute` (§10 SD33; R10 §2.1; ARCH §17.2 C1).
- An unknown bound name leaves `<line-icon>` in the neutral C8 state, and the surface raises `line-a2ui-error` (§10 SD33; §6.G.4).
- The A2UI name map lives in `line-icons` under a `./a2ui` subpath as per-set data (§10 SD14; R10 §6 Q1).
- Each map entry MUST carry the weight and the RTL mirror flag per name. Nine names mirror in RTL (§10 SD15; R10 §2.3).
- `line-icons` MUST NOT pick a default set. The consumer registers one (§10 SD15; ARCH §11).
- The three Lucide collisions MUST be documented in the `./a2ui` docs (§10 SD15; R10 §2.3, §6 Q7).

#### 6.C.4 Component contract table (C1–C20)

Column notes:

- **Entry / tag** follows ARCH §12 and plan §2.2. The ten "family rule" rows are independents with one tag each, and Kbd / Shortcut is one tag `line-kbd` (§10 SD12).
- **Machine** follows plan §2.2 and PRD §4.1 unless a decision overrides it.
- **Role** names the decided placement. `—` means the component spec settles it from R8 §2.2.
- **htmx** follows rule C9 and plan §2.4. "Spec decides" means the spec runs the harness or marks the row `n/a` with a reason. "`n/a` expected" is a drafting expectation that each component spec confirms or overturns (§10 SD34).
- **Deps** lists the tasks that MUST merge before the row (plan §6; §10 SD86). C5 shares Button's machine (ARCH §13.1). C6 opens with a probe across slotted `line-button` hosts (§10 SD10). C11 takes its avatars through a slot (§10 SD4).

| Task | Component | Deps | Spec file | Entry / tag | Tier and machine | Role placement | Form-assoc. | `agentExposed` | htmx row | The component spec still settles |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | Button | C21, C23, P7–P10 | `0002-button.md` | `./button` / `line-button` | Custom; press `idle → active` (§10 SD35) | Inner native `<button>`, host `aria-label` copied (§10 SD31) | Yes (ARCH §7; §10 SD36) | `true` | Spec decides; value-bearing only if a binding names a value prop (plan §2.4) | Parts, slots, loading part (ARCH §13.1, §13.5); screen-reader pass of the named `generic` host (R8 §6 Q1, Q5) |
| C2 | Icon | C21, C23, P7–P10, C22 | `0014-icon.md` | `./icon` / `line-icon` | Static | — (R8 §2.2) | No | `true` | `n/a` expected; not value-bearing [INFERENCE] | Decorative vs labelled semantics (R8 §2.2); depends on C22 and OQ-C22 |
| C3 | Stack | C21, C23, P7–P10 | `0018-stack.md` | `./stack` / `line-stack` | Static | — | No | `true` | `n/a` expected [INFERENCE] | List semantics for A2UI `List` (R8 §6 Q11) |
| C4 | Separator | C21, C23, P7–P10 | `0011-separator.md` | `./separator` / `line-separator` | Static | — | No | `true` | `n/a` expected [INFERENCE] | Orientation semantics (R8 §2.2) |
| C5 | IconButton | C21, C23, P7–P10, G1, G5, C1 | `0003-icon-button.md` | `./icon-button` / `line-icon-button` | Custom; same machine as Button (ARCH §13.1) | Inner native `<button>` (§10 SD31) | No; `type="button"` only (§10 SD36) | `true` | Spec decides (plan §2.4) | Name sources it accepts (§6.C.5) |
| C6 | ButtonGroup | C21, C23, P7–P10, G1, G5, C1 | `0004-button-group.md` | `./button-group` / `line-button-group` | Custom roving-focus `createMachine` on `@zag-js/core` 1.46.0 (§10 SD10) | `toolbar` (ARCH §13.1) | No | `true` | `n/a`; not compound (rule C9, plan §2.4) | Opens with the slotted roving-focus probe (§10 SD10; R8 §6 Q6) |
| C7 | Alert | C21, C23, P7–P10, G1, G5 | `0006-alert.md` | `./alert` / `line-alert` | Static | — | No | `true` | `n/a` expected [INFERENCE] | `alert` vs `status` role (R8 §6 Q8; §10 SD37) |
| C8 | Chip | C21, C23, P7–P10, G1, G5 | `0008-chip.md` | `./chip` / `line-chip` | Pre-built `@zag-js/toggle` 1.46.0; no remove button; not compound (§10 SD11) | Inner native `<button>` (§10 SD31) | No | `true` | Spec decides; value-bearing only if a binding names a value prop (plan §2.4) | Commit event name if value-bearing (ARCH §17.2 C9) |
| C9 | Badge | C21, C23, P7–P10, G1, G5 | `0007-badge.md` | `./badge` / `line-badge` | Static | — | No | `true` | `n/a` expected [INFERENCE] | Count announcement (R8 §2.2) |
| C10 | Avatar | C21, C23, P7–P10, G1, G5 | `0009-avatar.md` | `./avatar` / `line-avatar` | Static (plan §2.2) | — | No | `true` | `n/a` expected [INFERENCE] | Static vs `@zag-js/avatar` (R7 §6 OQ6; §10 SD37) |
| C11 | AvatarGroup | C21, C23, P7–P10, G1, G5, C10 | `0010-avatar-group.md` | `./avatar-group` / `line-avatar-group` | Custom (ARCH §13.2) | Overflow "+N" on an inner native `<button>` (§10 SD31) | No | `true` | `n/a`; not compound (rule C9, plan §2.4) | Overflow popover mechanism (R7 §6 OQ5); hover and focus expansion under WCAG 1.4.13 (R8 §6 Q10); avatars arrive by slot (§10 SD4) |
| C12 | Visually Hidden | C21, C23, P7–P10, G1, G5 | `0012-visually-hidden.md` | `./visually-hidden` / `line-visually-hidden` | Static | — | No | `false`: agent text that only screen readers hear (§10 SD38) | `n/a` expected [INFERENCE] | — |
| C13 | Portal | C21, C23, P7–P10, G1, G5 | `0013-portal.md` | `./portal` / `line-portal` | Static | — | No | `false`: moved nodes escape surface reconciliation and focus order (§10 SD38; R8 §2.2) | `n/a` expected [INFERENCE] | Focus and reading order after the move (R8 §2.2) |
| C14 | Kbd / Shortcut | C21, C23, P7–P10, G1, G5 | `0015-kbd.md` | `./kbd` / `line-kbd` (one tag, §10 SD12) | Static | — | No | `true` | `n/a` expected [INFERENCE] | OS-aware rendering (PRD §4.1) |
| C15 | Skeleton | C21, C23, P7–P10, G1, G5 | `0016-skeleton.md` | `./skeleton` / `line-skeleton` | Static | — | No | `true` | `n/a` expected [INFERENCE] | Busy semantics (R8 §2.2) |
| C16 | Presence | C21, C23, P7–P10, G1, G5 | `0017-presence.md` | `./presence` / `line-presence` | Pre-built `@zag-js/presence` 1.46.0 | None; emits no ARIA (R8 §2.2) | No | `false`: needs host CSS exit animations, adds no meaning (§10 SD38) | `n/a` expected [INFERENCE] | Tracked node and unmount meaning, after the R7 §6 OQ2 three-engine probe (§10 SD37; R7 §6 OQ2, OQ3) |
| C17 | Grid | C21, C23, P7–P10, G1, G5 | `0019-grid.md` | `./grid` / `line-grid` | Static | — | No | `true` | `n/a` expected [INFERENCE] | — |
| C18 | Center | C21, C23, P7–P10, G1, G5 | `0020-center.md` | `./center` / `line-center` | Static | — | No | `true` | `n/a` expected [INFERENCE] | — |
| C19 | Aspect Ratio | C21, C23, P7–P10, G1, G5 | `0021-aspect-ratio.md` | `./aspect-ratio` / `line-aspect-ratio` | Static | — | No | `true` | `n/a` expected [INFERENCE] | — |
| C20 | Spinner | C21, C23, P7–P10, G1, G5 | `0022-spinner.md` | `./spinner` / `line-spinner` | Static, CSS-only (ARCH §13.5) | — | No | `true` | `n/a` expected [INFERENCE] | `status` vs `progressbar` vs `img`, label from the consumer (R8 §6 Q9; §10 SD37) |

- PRD v0.8.19 (§4.1, §4.11, §7.3), ARCH v0.8.5 §13.1 and plan §2.2 read "Custom" for ButtonGroup and "Pre-built" for Chip (§10 SD10, SD11).
- Every descriptor MUST carry `agentExposed` with a recorded reason (ARCH §17.2; §10 SD38).
- Roles set only through internals MUST get a screen-reader pass in their component spec (R8 §6 Q5; §10 SD39).
- Chip and AvatarGroup take the `common` and `button` reset modules, because each renders an inner native `<button>` (§10 SD31, SD84; ARCH §14.7). ButtonGroup keeps `common` only.

#### 6.C.5 Button, IconButton, ButtonGroup and Chip semantics

**Button (C1)**

- The machine MUST model the press as `idle → active`, reflected as `data-active` and `:state(active)` (§10 SD35; ARCH §14.8; R7 §6 OQ4 (c)).
- An opt-in `pressed` attribute MUST make Button a toggle with `aria-pressed`, reflected as `data-pressed` and `:state(pressed)` (§10 SD35).
- `loading` and `disabled` MUST be props that guards read at event time, not finite states (§10 SD35; R7 §2.4 probe B1).
- A loading Button MUST stay focusable and expose `aria-disabled="true"` (§10 SD35; R8 §2.2).
- The loading label MUST come from the consumer (§10 SD35; `docs/MANIFESTO.md:66`, component-level strings out of scope).
- ARCH §13.1 receives a text correction of its state list (§10 SD35).

**IconButton (C5)**

- On the agent path the descriptor MUST mark the name required. The surface MUST replace a nameless node with a placeholder and raise `line-a2ui-error` before render (§10 SD36; ARCH §17.4).
- On hand-written markup the axe gate MUST catch a missing name through `button-name` on the inner native `<button>` (§10 SD36; R8 §2.4 probe P1; R2 §6 Q5).
- IconButton MUST be `type="button"` only and MUST NOT be form-associated. ARCH §7 stays unchanged (§10 SD36).

**ButtonGroup (C6)**

- ButtonGroup MUST discover its buttons through `slotchange` and MUST NOT import Button (§10 SD10; ARCH §13.1; MANIFESTO Law 4).
- The roving-focus machine is a custom `createMachine` on `@zag-js/core` 1.46.0 (§10 SD10; R7 §2.4).
- The component spec MUST open with a slotted roving-focus probe across `line-button` hosts with inner native buttons (§10 SD10).
- Revisit the machine when `@zag-js/toolbar` ships stable and the repo moves to Zag 2. Today only 2.0.0-next versions exist (§10 SD10; plan §2.2).

**Chip (C8)**

- Chip is separate from `Button[pressed]` by product role (PRD §4.1; §10 SD35).
- Chip uses `@zag-js/toggle` 1.46.0, with no remove button (§10 SD11; R7 §2.4).

#### 6.C.6 Obligations of every C1–C20 row

| Obligation | Source |
|---|---|
| Pass the PRD §5.2 8-point checklist: render, reactive props, slots, parts, custom properties, events, keyboard, axe | PRD §5.2; plan §7.1 |
| Storybook docs complete | plan §4.3, §7.1 |
| Changeset entry | plan §4.3, §7.1 |
| CEM entry with complete JSDoc; `@fires` with typed `detail` is mandatory | ARCH §17.2 C3, C7; plan §4.3 |
| Fill the component's row in `docs/COMPETITIVE-COMPONENT-ANALYSIS.md` | AM-048; plan §2.3 |
| Report gzipped size against the < 5 KB soft target, not gating | §7.6; plan §7.1; PRD §1.7 |
| Import no other component; compose through slots | §10 SD4; MANIFESTO Law 4; ARCH §12 |
| Spec APPROVED with the Agent contract section filled | plan §2.3, §7.1; PRD §8.1 |
| htmx Tests row filled, or `n/a` with a reason | plan §2.4, §7.1 |
| Agent-exposed C5–C20 rows add the component to the `<line-a2ui-surface>` render fixture and the surface axe test | plan §7.2; §6.G.4 |

**Acceptance (stream)**

- Every C1–C20 row meets every obligation above and the table in §6.C.4.
- C21 and C23 merged before C1; C22 merged before C2.

### 6.G Stream G — Agent-Driven UI Foundation (`@websublime/line-genui`)

#### 6.G.0 Stream overview and order

- Owner of every G task is webcomponents-supervisor (plan §4.0).
- Stream G has no projection task. Miguel chose direct projection on `NodeResolver` on 2026-10-19 (plan §4.1, §5.6 PT; R2 §5a).
- G code MUST NOT start before P1 scaffolds `line-genui` and P2 adds its layer edges (plan §6).
- Stream G validates on C1–C4 (Button, Icon, Stack, Separator). It starts after they ship without descriptors (PRD §7.3; plan §6 step 5–6).
- Stream G writes the descriptors of C1–C4 (plan §4.1). C5–C20 each ship their descriptor in their own PR (plan §6 step 7).
- G5 also waits for P10, because the drift and coverage tests read the manifest P10 wires (plan §6).
- The first `line-genui` release waits for P4 (plan §6).

| Task | Content | PRD §7.3 item | Deps |
|---|---|---|---|
| G1 | Descriptor API, descriptors of C1–C4 | 2 | P1, P2, C1–C4 |
| G2 | `line` and `basic` catalog emitters | 3 | G1 |
| G3 | Frontend-tool emitter | 4 | G1 |
| G4 | `<line-a2ui-surface>` (preview) | 5 | G1, G2, P5 |
| G5 | CEM drift and coverage tests | 6 | G1, P10 |
| G6 | MCP Apps bridge `line-themes/hosts/mcp-apps.css` | 7 | P1 |
| G7 | Transport recipes in Storybook | 8 | G4 |

- G6 touches only `line-themes`. Its dependency on P1 exists because the stream starts after P1 [INFERENCE] (§10 SD40).
- G7 depends on G4, because every recipe renders through the surface [INFERENCE] (§10 SD40).

#### 6.G.1 G1 — Descriptor API

- **Owner:** webcomponents-supervisor.
- **Deps:** P1, P2, C1–C4.
- **Changes:** `packages/line-genui/src/catalog/` (descriptor type, helpers, descriptors of C1–C4); the `@websublime/line-genui/catalog` export (plan §2.1 Appendix D table).

**Fields.** A descriptor holds these fields (ARCH §17.3).

| Field | Content |
|---|---|
| Catalog name, tag, `load()` | `load()` imports the component subpath |
| Prop schema | Zod 3, reusing the `web_core` common types in the catalogs |
| Slot map | Slot names the surface wires children into |
| Binding map | Prop → property or attribute, the value prop, the commit event of rule C9 |
| Action map | Prop → DOM event |
| Accessibility requirements | Includes the required accessible name |
| Description | The agent-facing description |
| `agentExposed` | Defaults to `true`; `false` carries a reason |

**Contract**

- Descriptors MUST use the Zod 3 API. Only that API composes with the `web_core` common-type schemas (ARCH §17.3; R3 §2.2; plan §5.6 defaults).
- `line-components` MUST NOT gain a Zod or A2UI dependency (ARCH §17.3).
- A component description MUST reach the catalog through `spec(…, {mixins})`. `toJson()` drops it otherwise (R3 §2.4; §10 SD41).
- A property description MUST go through a line helper that writes the `REF:` marker. The upstream helpers emit a literal `${description}` and plain `.describe()` inlines a `oneOf` (R1 §2.4.3; §10 SD41).
- The accessibility requirements MUST name every required accessible name, because G4 checks them before render (§10 SD36).
- `agentExposed` MUST default to `true` (ARCH §17.3).
- Every component MUST keep a descriptor. A flagged descriptor MUST carry its reason (ARCH §17.3; plan §7.2).
- The emitters MUST leave flagged descriptors out of the catalogs and the tool schemas (ARCH §17.3).

The three Phase 1 components with `agentExposed: false` and their reasons (§10 SD38) are below.

| Component | Reason | Source |
|---|---|---|
| Portal | It moves nodes out of the surface, so they escape the `instanceId` reconciliation, the focus rule, the live region and `aria-busy` | R8 §2.2; ARCH §17.4 [INFERENCE on the escape] |
| Presence | It emits no ARIA and needs CSS exit animations, which the host owns | R8 §2.2; R7 §2.2 |
| Visually Hidden | An untrusted agent could add text that only screen readers hear | ARCH §17.4 Text row [INFERENCE] |

**Acceptance**

- The descriptors of C1–C4 type-check on the Zod 3 API and compose with the `web_core` common types.
- A component description and a property description of Button both appear in the emitted `line` catalog JSON.
- Importing `@websublime/line-genui/catalog` defines no element (plan §7.2).

#### 6.G.2 G2 — Catalog emitters

- **Owner:** webcomponents-supervisor.
- **Deps:** G1.
- **Changes:** the `line` catalog emitter, `@websublime/line-genui/catalog.json`, the session registration of the `basic` implementations, the inline projection function.

**`line` catalog**

- `catalog.json` MUST hold the document form of the `line` catalog, with `$defs/anyFunction` and `$defs/theme` added (R2 §2.7; §10 SD42).
- `toJson()` output as emitted MUST NOT ship as the file. It fails the `Catalog` def on `protocolVersion` and `$defs` (R2 §2.7).
- line MUST ship a documented function that derives the inline projection. Client capabilities and the D2 criterion use that projection (§10 SD42).
- The `catalogId` MUST be `https://line-ui.websublime.com/a2ui/catalogs/line/v1/catalog.json` (§10 SD42).
- The id is an identifier. It need not resolve (§10 SD42).
- An incompatible change MUST bump `v1` to a new id (ARCH §17.3; §10 SD42).

**`basic` catalog**

- The session MUST register the `basic` implementations only under `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json` (R1 §2.6; §10 SD43).
- That registration MUST always be on (§10 SD43).
- `web_core` 0.14.0 knows no other basic id and throws `Catalog not found` on the `v0_9_1` id (R1 §2.6, P7; R2 §2.6).
- line MUST NOT re-emit the basic JSON Schema (ARCH §17.3).
- Client capabilities MUST list the basic id only when the consumer opts in. This holds until basic coverage is complete (§10 SD44).
- Phase 1 maps 10 of 18 basic types (ARCH §17.3 table). They are Text, Image, Icon, Video, AudioPlayer, Row, Column, List, Divider and Button.
- An unmapped basic type MUST render an inert placeholder and raise `line-a2ui-error` (ARCH §17.3).

**Versions**

- Capabilities MUST advertise `['v0.9', 'v0.9.1']`. `['v0.9.1']` alone fails the published schema's required `v0.9` key (R1 P10, §6 Q8; §10 SD45).
- The session MUST accept both envelope versions (R1 §2.5.1; §10 SD45).
- Outbound messages MUST carry `v0.9.1` (R2 §2.6; §10 SD45).

**Acceptance**

- The inline projection of `catalog.json` validates against the A2UI v0.9.1 `client_capabilities.json#/$defs/Catalog` (plan §5.6 D2; plan §7.2).
- `web_core` reads the catalog back with `Catalog.fromJson`, and its `validationSchema` compiles (plan §7.2).
- Flagged descriptors are absent from `catalog.json`.
- A message with the v0_9 basic id renders mapped types and raises `line-a2ui-error` for each unmapped type (plan §7.2).
- The capabilities object validates against `client_capabilities.json` with and without the basic opt-in.

#### 6.G.3 G3 — Frontend-tool emitter

- **Owner:** webcomponents-supervisor.
- **Deps:** G1.
- **Changes:** the tool emitter in `packages/line-genui/src/catalog/`, its tests, the CI subset checks.

**Contract**

- The emitter MUST be a line-owned walker over the Zod 3 descriptor schema (§10 SD46).
- `zod-to-json-schema` is deprecated, and its `openAi` target drops optional-prop descriptions (R3 §2.1, §2.5).
- `Catalog.toJson()` writes common-type `$ref`s, so Button and Icon fail every strict subset (R3 §2.6).
- The walker MUST map dynamic types to their literal type, for example `DynamicString` to `string` (R3 §6 Q4).
- The walker MUST leave out `ComponentId`, `ChildList` and `Action` props [INFERENCE: these props carry tree structure and actions, not literal values] (§10 SD47).
- The walker MUST build one flat literal model per descriptor (§10 SD48).
- The output MUST keep `{name, description, parameters}` (ARCH §17.3; PRD Appendix D).
- `parameters` MUST carry no `$ref`, `oneOf`, `allOf`, recursion, open maps, common types or dynamic bindings (ARCH §17.3).
- The emitter MUST take a provider argument and serialise the model per provider (§10 SD48).

| Provider | Serialisation | Source |
|---|---|---|
| OpenAI strict | Every property in `required`; optional props typed `["T","null"]`; `additionalProperties: false`; no `allOf` | R3 §2.6 |
| Anthropic strict | `additionalProperties: false`; optional props allowed | R3 §2.6 |
| Gemini | `parameters` as an OpenAPI 3.0.3 subset; optional props with `nullable`; no `additionalProperties`, `const`, `$ref`, `oneOf`, `allOf` | R3 §2.6; §10 SD48 |

- A tool name MUST match `^[a-zA-Z0-9_-]{1,64}$`. All three providers accept it (R3 §2.6; §10 SD49).
- A tool description MUST stay at or under 1024 characters. The cap is self-imposed (ARCH §17.3; R3 §2.6).
- CI MUST print bytes and o200k tokens per tool. The count reports and gates nothing (R3 §2.7; §10 SD50).
- The docs MUST state the Anthropic per-request caps: 20 strict tools, 24 optional params and 16 union-typed params across all strict schemas (R3 §2.6; §10 SD49).

**Acceptance.** Acceptance holds per tool (§10 SD49).

- Every emitted tool validates as JSON Schema under Ajv (§10 SD46).
- Every PR runs the offline R3 P11 subset checks for each provider in CI (R3 §3; §10 SD46, SD49).
- Every tool description is at or under 1024 characters, and every tool name matches the pattern.
- Before each release, a maintainer calls each provider live with the emitted tools and records the result in the release PR (§10 SD49).
- Flagged descriptors produce no tool.

#### 6.G.4 G4 — Surface `<line-a2ui-surface>`

- **Owner:** webcomponents-supervisor.
- **Deps:** G1, G2, P5 (its registration harness, §10 SD40); R2 decided (plan §6).
- **Changes:** `packages/line-genui/src/a2ui/` (session, surface, reconciler); the `@websublime/line-genui/a2ui` export; `line-genui` `dependencies`.
- **Status:** preview. The export may change in any minor release and sits outside the PRD §7.1 policy until it targets a final A2UI v1.0 (ARCH §17.7; PRD Appendix D).

**Upstream pin**

- `line-genui` MUST pin `@a2ui/web_core` exactly at `0.14.0` (ARCH §17.7; §10 SD6).
- 0.13.0 lacks `validationSchema` and `spec()` mixins, which G2 and G1 need (R1 §6 Q1; R3 §2.4).
- R2 ran its spike on 0.14.0 (R2 §3).
- A newer version MUST land only through an AM, after the R1 and R2 probes run again on it (§10 SD6).

**Projection and messages**

- The surface MUST project directly on the `web_core` models and `NodeResolver` (ARCH §17.4; R2 §5a).
- The surface MUST load no Lit and no `A2uiLitElement` (ARCH §17.4).
- The render root MUST be light DOM (ARCH §17.4).
- Components MUST load lazily through each descriptor's `load()` (ARCH §17.4).
- The session MUST call `processMessages` once per message. A bad message then drops only itself (R1 §2.7; R2 §2.6; §10 SD51).
- `aria-busy` MUST cover the whole transport batch (ARCH §17.4; R2 §2.8).
- The `MessageProcessor` MUST receive `RELAXED_VALIDATION` (R1 §2.7; §10 SD52).
- The surface MUST catch every `web_core` throw (ARCH §17.4).
- The surface MUST enforce the depth limit itself while it walks `NodeResolver`. `web_core` `maxDepth` does not fire with `allowMissingRoot: true` (R2 §2.6; §10 SD53).
- A cycle MUST reject its message. Under `RELAXED_VALIDATION`, `web_core` throws at message level (R1 §2.7; §10 SD54).
- An unknown type MUST render an inert placeholder for that node (ARCH §17.4).
- A pending child MUST stay hidden and be replaced when it arrives. It MUST raise no error (R1 §2.5.2; §10 SD54).

**Errors**

- `line-a2ui-error` MUST carry the generic A2UI form `{version, error: {code, surfaceId, message, …}}` with the `web_core` error code (R2 §2.6; §10 SD55).
- Error codes MUST use the 0.14.0 names, for example `CATALOG_ERROR` (R1 §2.1).
- `line-a2ui-action` MUST carry the resolved A2UI `action` message (ARCH §17.4).

**Limits**

- Node count, depth and data-model size MUST have finite defaults (§10 SD56).
- A breach MUST reject the message and raise `line-a2ui-error` (§10 SD56).
- The default values come from a G4 stress test and land in this spec through an AM. No research note measured them (R1 §4; §10 SD56).

**URLs, text, theme**

- The URL policy MUST apply after the URL resolves against the document base (§10 SD57).
- The policy MUST cover Image, Video and Audio URLs and `openUrl` (§10 SD57).
- The default allowlist MUST be `https:`, `http:`, `mailto:`, `tel:` (ARCH §17.4).
- The default policy MUST reject `data:` (§10 SD57).
- `requiresUserActivation` MUST be honoured (ARCH §17.4).
- Text MUST render as plain text by default (ARCH §17.4).
- Markdown MUST render only through a hook the consumer supplies. The consumer owns sanitising, and line ships no renderer (§10 SD58).
- Agent theme hints MUST be ignored by default (ARCH §17.4).

**Accessibility**

- The surface MUST check required names from the descriptor before render (§10 SD36).
- A node without a required name MUST become a placeholder and raise `line-a2ui-error` (§10 SD36).
- A DOM check after render leaves axe's `button-name` violation in place (R2 §2.8).
- Each surface MUST hold one live region (ARCH §17.4).
- The live region MUST announce "Content updated." and an error sentence on error (R2 §6 Q3; §10 SD59).
- `line-stack` rendering a List MUST carry `role="list"` (R2 §6 Q4; §10 SD59).
- The surface MUST wrap Button text in a `<span>` (§10 SD59).
- The surface MUST NOT move focus to another component (ARCH §17.4; plan §5.6 D4).
- The reconciler MUST key by `instanceId` and keep focus across reorders (ARCH §17.4).
- On a reparent, the surface MUST use `moveBefore()` where the browser has it, and otherwise return focus to the same `instanceId` at batch end (plan §5.6 D4).
- The docs MUST state the template-list limit. `instanceId` is unstable across template-array insertions and reorders, so a kept element may rebind to another item (R2 §2.8; §10 SD60).
- The revisit trigger for that limit is a2ui#1745 (R2 §6 Q1; §10 SD60).

**Lifecycle mapping (§10 SD59)**

| Producer state | Surface behaviour |
|---|---|
| `building`, `retrying` | `aria-busy="true"` |
| `failed` | Inert state |

Source: R6 §2.1; R6 §6 Q7.

**Basic mapping.** The Phase 1 targets follow the ARCH §17.3 table. Icon has two extra rules (§10 SD33).

- An `{ "svgPath": … }` value MUST render through `<line-icon>` with its new `path` property (R10 §2.1; §10 SD33).
- `<line-icon>` then draws `<svg viewBox="0 0 24 24"><path>` and sets `d` through `setAttribute('d')` (§10 SD33).
- A bound name that maps to no icon MUST leave `<line-icon>` in the C8 neutral state and raise `line-a2ui-error` (§10 SD33).
- No resolver throw MUST reach the consumer (MANIFESTO Law 9).

**Acceptance**

- `<line-a2ui-surface>` renders C1–C4 from A2UI messages with zero axe-core violations (plan §7.2; evidence from P7).
- Each agent-exposed C5–C20 row adds its component to the surface render fixture and the surface axe test in its own PR (§6.C.6).
- Document `::part()` rules apply to the rendered elements (plan §7.2).
- G4 adds the `line-genui` registration row of §7.5 to the P5 harness. On the packed tarball, importing `./catalog` defines no element, and importing `./a2ui` defines only `line-a2ui-surface` (plan §7.2).
- A batch `[ok, invalid, ok]` applies the first and third message and raises one `line-a2ui-error`.
- A self-cycle rejects its message. A pending child shows nothing and raises no error until it arrives.
- An over-limit message is rejected with `line-a2ui-error`.
- Every emitted `line-a2ui-error` validates against `client_to_server.json` (R2 §2.6).
- URLs with a disallowed scheme or `data:` do not reach the DOM.
- An IconButton without a name renders a placeholder and raises `line-a2ui-error`.
- A focused element keeps focus across a reorder and a reparent in Chromium, Firefox and WebKit.
- The G4 stress test runs and its measured limits land through an AM.
- `package.json` lists `@a2ui/web_core` as exactly `0.14.0`.

#### 6.G.5 G5 — CEM drift and coverage tests

- **Owner:** webcomponents-supervisor.
- **Deps:** G1, P10, CEM entries of real components (plan §6).
- **Changes:** tests in `packages/line-genui`.

**Contract**

- The tests MUST read the `custom-elements.json` that the `line-components` build emits into the package (§10 SD26; §6.P.10, §7.3).
- The tests MUST look up entries by tag. `modules[]` order changes between runs (R4 §2.7).
- The drift test MUST fail when a descriptor names an attribute, property, slot or event that the manifest lacks (ARCH §17.3).
- The tests MUST apply the §7.3 content rules (§10 SD61; R4 §2.3, §2.4, §2.6).
- The drift test MUST read events only from `@fires` JSDoc.
- The tests MUST filter public members on `privacy`, `static` and `inheritedFrom`, read form association from the inherited static `formAssociated`, and take ARIA metadata from the descriptor.
- The coverage test MUST fail when a `line-components` component in the manifest has no descriptor. It does not cover `<line-a2ui-surface>` (ARCH §17.3).

**Acceptance**

- Both tests pass in the unit tier on the built manifest (plan §7.2).
- A descriptor that names a missing attribute fails the drift test.
- A component without a descriptor fails the coverage test.

#### 6.G.6 G6 — MCP Apps bridge

- **Owner:** webcomponents-supervisor.
- **Deps:** P1.
- **Changes:** `packages/line-themes/src/hosts/mcp-apps.css`; the `@websublime/line-themes/hosts/mcp-apps.css` export (plan §2.1 Appendix D table).

**Reference list**

- The bridge is CSS only, so `line-themes` gains no runtime (ARCH §17.6; MANIFESTO Law 10).
- The list MUST be the role-matched subset (§10 SD62).
- Under the written rule, a host key joins the list when line has one target with the same role (R5 §6 Q1; §10 SD62).
- The list MUST include 2 font families, 4 weights and the role-matched colours (§10 SD62).
- The list MUST also include the radii, sizes and line heights that the scale map matches (§10 SD62, SD63).
- The spec MUST list every excluded key with its reason (§10 SD62).
- The host publishes 76 keys (R5 §2.3).
- The table below lists every host key, each with its line target or its exclusion reason (§10 SD62; R5 §2.3, §6 Q3).

Reference host values come from `examples/basic-host/src/host-styles.ts` in `modelcontextprotocol/ext-apps` (`main`, read 2026-10-20). R5 §2.3 gives the same radii and size ranges. Line values come from `packages/line-themes/src/aliases.css:9-72`, `packages/line-tokens/src/typography.css:11-46`, `radii.css:9-15` and `focus-ring.css:16`.

**Mapping rules**

- A key joins by role match when a line target has the same role (§10 SD62).
- Each line target takes at most one key, because a custom property holds one value.
- Under nearest value, each host key is a candidate for the line step with the nearest value (§10 SD63). A key equally near two steps is a candidate for both. Each step takes its nearest candidate, and left-over keys leave the list.
- When two candidates are equally near, the key that comes first in the R5 §2.3 group order wins (§10 SD83). Text keys come before heading keys, and smaller steps before larger ones.
- Form **A** declares a line alias on `:where(html)` with the line step as fallback. Form **P** declares a line primitive on `body` with an `inherit` fallback (§10 SD17).
- Border width and shadows fall outside colour, font and radius, so they leave the list (ARCH §17.6; plan §7.2).
- The "Borderline calls" table at the end of §6.G.6 records each judgement call B1–B11 (§10 SD83).

| Key | On list | Line target | Form | Rule | Reason if excluded |
|---|---|---|---|---|---|
| `--color-background-primary` | Yes | `--line-gray-surface` | A | Role match: page surface (R5 §2.4b row 1) | — |
| `--color-background-secondary` | Yes | `--line-gray-bg` | A | Role match: subtle element background | — |
| `--color-background-tertiary` | Yes | `--line-gray-bg-hover` | A | Role match: third neutral background step (§10 SD83, B1) | — |
| `--color-background-inverse` | No | — | — | — | No line role for inverse (R5 §2.3) |
| `--color-background-ghost` | No | — | — | — | No line role for ghost (R5 §2.3) |
| `--color-background-info` | Yes | `--line-info-bg` | A | Role match: status background (§10 SD83, B2) | — |
| `--color-background-danger` | Yes | `--line-danger-bg` | A | Role match: status background (B2) | — |
| `--color-background-success` | Yes | `--line-success-bg` | A | Role match: status background (B2) | — |
| `--color-background-warning` | Yes | `--line-warning-bg` | A | Role match: status background (B2) | — |
| `--color-background-disabled` | No | — | — | — | No line role for disabled (R5 §2.3) |
| `--color-text-primary` | Yes | `--line-gray-text` | A | Role match: high-contrast text | — |
| `--color-text-secondary` | Yes | `--line-gray-text-low` | A | Role match: low-contrast text | — |
| `--color-text-tertiary` | No | — | — | — | No line role for a third text step (R5 §2.3) |
| `--color-text-inverse` | No | — | — | — | No line role for inverse |
| `--color-text-ghost` | No | — | — | — | No line role for ghost |
| `--color-text-info` | Yes | `--line-info-text-low` | A | Role match: status text (§10 SD83, B3) | — |
| `--color-text-danger` | Yes | `--line-danger-text-low` | A | Role match: status text (B3) | — |
| `--color-text-success` | Yes | `--line-success-text-low` | A | Role match: status text (B3) | — |
| `--color-text-warning` | Yes | `--line-warning-text-low` | A | Role match: status text (B3) | — |
| `--color-text-disabled` | No | — | — | — | No line role for disabled |
| `--color-border-primary` | Yes | `--line-gray-border` | A | Role match: neutral border (§10 SD83, B4) | — |
| `--color-border-secondary` | No | — | — | — | Line has one neutral border alias, taken by `--color-border-primary` (B4) |
| `--color-border-tertiary` | No | — | — | — | No line role for a third border step (R5 §2.3) |
| `--color-border-inverse` | No | — | — | — | No line role for inverse |
| `--color-border-ghost` | No | — | — | — | No line role for ghost |
| `--color-border-info` | Yes | `--line-info-border` | A | Role match: status border | — |
| `--color-border-danger` | Yes | `--line-danger-border` | A | Role match: status border | — |
| `--color-border-success` | Yes | `--line-success-border` | A | Role match: status border | — |
| `--color-border-warning` | Yes | `--line-warning-border` | A | Role match: status border | — |
| `--color-border-disabled` | No | — | — | — | No line role for disabled |
| `--color-ring-primary` | Yes | `--line-focus-ring-color` | P | Role match: the focus ring colour (B5) | — |
| `--color-ring-secondary` | No | — | — | — | Line has one ring colour, taken by `--color-ring-primary` (`focus-ring.css:16`) |
| `--color-ring-inverse` | No | — | — | — | No line role for inverse |
| `--color-ring-info` | No | — | — | — | No per-status ring colour in line |
| `--color-ring-danger` | No | — | — | — | No per-status ring colour in line |
| `--color-ring-success` | No | — | — | — | No per-status ring colour in line |
| `--color-ring-warning` | No | — | — | — | No per-status ring colour in line |
| `--font-sans` | Yes | `--line-font-sans` | P | Role match: sans family | — |
| `--font-mono` | Yes | `--line-font-mono` | P | Role match: mono family | — |
| `--font-weight-normal` | Yes | `--line-font-weight-4` | P | Nearest value: 400 → 400 | — |
| `--font-weight-medium` | Yes | `--line-font-weight-5` | P | Nearest value: 500 → 500 | — |
| `--font-weight-semibold` | Yes | `--line-font-weight-6` | P | Nearest value: 600 → 600 | — |
| `--font-weight-bold` | Yes | `--line-font-weight-7` | P | Nearest value: 700 → 700 | — |
| `--font-text-xs-size` | Yes | `--line-font-size-0` | P | Nearest value: 0.75rem → 0.75rem (wins the tie with heading-xs, B6) | — |
| `--font-text-sm-size` | No | — | — | — | Leftover: 0.875rem is 0.125rem from steps 0 and 1, both taken by exact matches |
| `--font-text-md-size` | Yes | `--line-font-size-1` | P | Nearest value: 1rem → 1rem (wins the tie with heading-md, B6) | — |
| `--font-text-lg-size` | Yes | `--line-font-size-2` | P | Nearest value: 1.125rem → 1.1rem | — |
| `--font-heading-xs-size` | No | — | — | — | Leftover: loses the tie at step 0 to text-xs |
| `--font-heading-sm-size` | No | — | — | — | Leftover: same as text-sm |
| `--font-heading-md-size` | No | — | — | — | Leftover: loses the tie at step 1 to text-md |
| `--font-heading-lg-size` | Yes | `--line-font-size-3` | P | Nearest value: 1.25rem → 1.25rem | — |
| `--font-heading-xl-size` | Yes | `--line-font-size-4` | P | Nearest value: 1.5rem → 1.5rem | — |
| `--font-heading-2xl-size` | Yes | `--line-font-size-5` | P | Nearest value: 1.875rem → 2rem | — |
| `--font-heading-3xl-size` | Yes | `--line-font-size-6` | P | Nearest value: 2.25rem → 2.5rem (equidistant from 2rem, which 2xl holds) | — |
| `--font-text-xs-line-height` | Yes | `--line-leading-3` | P | Nearest value: 1.4 → 1.375 (wins a five-way tie, B7) | — |
| `--font-text-sm-line-height` | No | — | — | — | Leftover: loses the tie at step 3 to text-xs |
| `--font-text-md-line-height` | Yes | `--line-leading-4` | P | Nearest value: 1.5 → 1.5 (wins the tie with text-lg) | — |
| `--font-text-lg-line-height` | No | — | — | — | Leftover: loses the tie at step 4 to text-md |
| `--font-heading-xs-line-height` | No | — | — | — | Leftover: loses the tie at step 3 to text-xs |
| `--font-heading-sm-line-height` | No | — | — | — | Leftover: loses the tie at step 3 to text-xs |
| `--font-heading-md-line-height` | No | — | — | — | Leftover: loses the tie at step 3 to text-xs |
| `--font-heading-lg-line-height` | No | — | — | — | Leftover: 1.3 is nearest step 2 (1.25), which heading-xl matches exactly |
| `--font-heading-xl-line-height` | Yes | `--line-leading-2` | P | Nearest value: 1.25 → 1.25 (B10) | — |
| `--font-heading-2xl-line-height` | No | — | — | — | Leftover: 1.2 is nearest step 2, which heading-xl matches exactly |
| `--font-heading-3xl-line-height` | Yes | `--line-leading-1` | P | Nearest value: 1.1 → 1.1 (B10) | — |
| `--border-radius-xs` | Yes | `--line-radius-1` | P | Nearest value: 2px → 2px | — |
| `--border-radius-sm` | Yes | `--line-radius-2` | P | Nearest value: 4px → 5px (wins the tie with md, B8) | — |
| `--border-radius-md` | No | — | — | — | Leftover: 6px is 1px from step 2, which sm wins by order |
| `--border-radius-lg` | No | — | — | — | Leftover: 8px is nearest step 2, which sm holds at 1px |
| `--border-radius-xl` | Yes | `--line-radius-3` | P | Nearest value: 12px → 1rem (16px) | — |
| `--border-radius-full` | Yes | `--line-radius-round` | P | Role match: fully rounded (B9) | — |
| `--border-width-regular` | No | — | — | — | Outside colour, font and radius (ARCH §17.6; plan §7.2) |
| `--shadow-hairline` | No | — | — | — | Outside colour, font and radius |
| `--shadow-sm` | No | — | — | — | Outside colour, font and radius |
| `--shadow-md` | No | — | — | — | Outside colour, font and radius |
| `--shadow-lg` | No | — | — | — | Outside colour, font and radius |

| Group | Keys | On list | Excluded |
|---|---|---|---|
| Colour | 37 | 19 | 18 |
| Font | 28 | 17 | 11 |
| Radius | 6 | 4 | 2 |
| Border width and shadow | 5 | 0 | 5 |
| Total | 76 | 40 | 36 |

| Exclusion reason | Keys |
|---|---|
| No line role (inverse ×4, ghost ×3, disabled ×3, text and border tertiary, ring secondary, four status rings) | 17 |
| Line target already taken by a role-matched key (`--color-border-secondary`) | 1 |
| Nearest-value leftover (4 sizes, 7 line heights, 2 radii) | 13 |
| Outside colour, font and radius (border width, 4 shadows) | 5 |

- The 40 keys land on 18 aliases (form A) and 22 primitives (form P).
- Line steps that get no host key keep their own value.

```css
@layer line {
  /* Form A: a line-themes alias, line step as fallback (R5 §2.4b row 1). */
  :where(html) {
    --line-gray-surface: var(--color-background-primary, var(--line-gray-2));
  }

  /* Form P: a line-tokens primitive, inherit fallback (R5 §2.4b row 3). */
  body {
    --line-radius-2: var(--border-radius-sm, inherit);
  }
}
```

**Scales and scope**

- Each host scale value MUST map to the nearest line reference value (R5 §6 Q3; §10 SD63).
- A host key without a match MUST leave the list (§10 SD63).
- Aliases (form A) MUST be declared on `:where(html)`, and primitives (form P) on `body` (§10 SD17, SD63).
- The bridge MUST NOT declare in nested `[data-accent]` or `[data-gray]` scopes (§10 SD63).
- Nested `[data-accent]` and `[data-gray]` scopes MUST fall back to line steps (§10 SD63).

**Load order**

- `mcp-apps.css` MUST load after the `line-themes` CSS (§10 SD85).
- Form A ties on specificity with the `line-themes` aliases, which sit on `:where(html, [data-accent], [data-gray])` inside the same `@layer line` (`packages/line-themes/src/aliases.css:6-7`). The sheet that loads later wins.
- The docs MUST state the order (§10 SD85).

**Primitive fallback**

- A key that maps onto a `line-tokens` primitive MUST use a `body`-scoped `var(--host, inherit)` (R5 §2.4b; §10 SD17).
- The bridge MUST NOT copy token literals (§10 SD17).
- Miguel approved the Law 10 reading that `line-themes` may name a token without copying its value (MANIFESTO Law 10; §10 SD17).
- Rules that read a primitive on `html` itself keep the token value. No shipped line rule does that (R5 §2.4b).

**Acceptance**

- `mcp-apps.css` maps every key on the reference list to a line theme alias or token (plan §7.2).
- It passes `lint-layers` and the prefix audit (plan §7.2; R5 §2.4b).
- A G6 browser test covers the root scope and a nested `data-accent`/`data-gray` scope in Chromium, Firefox and WebKit (§10 SD17, SD63).
- The same test shows a host primitive value applied under `body` and the line value kept without a host value (R5 P6).
- A G6 browser test loads `mcp-apps.css` after the `line-themes` CSS, in the documented order, and shows the host value on every form A alias (§10 SD85).

**Borderline calls**

| Id | Keys | Call made | Alternative |
|---|---|---|---|
| B1 | `--color-background-tertiary` | Maps to `--line-gray-bg-hover` | Excluded, which leaves 39 keys on the list |
| B2 | The four status backgrounds (`info`, `danger`, `success`, `warning`) | Map to `--line-<status>-bg` | Map to `--line-<status>-surface` |
| B3 | The four status text keys | Map to `--line-<status>-text-low` | Map to `--line-<status>-text` |
| B4 | `--color-border-primary`, `--color-border-secondary` | Primary takes `--line-gray-border`; secondary is excluded | Secondary takes `--line-gray-border` |
| B5 | `--color-ring-primary` | Maps to `--line-focus-ring-color` (form P) | — |
| B6 | `--font-text-xs-size` and `--font-heading-xs-size`; `--font-text-md-size` and `--font-heading-md-size` | The text keys win the ties at `--line-font-size-0` and `--line-font-size-1` | The heading keys win |
| B7 | The text-xs, text-sm, heading-xs, heading-sm and heading-md line heights | `--font-text-xs-line-height` wins the five-way tie at `--line-leading-3` | Another key in the tie wins |
| B8 | `--border-radius-sm`, `--border-radius-md` | `sm` wins the tie at `--line-radius-2` | `md` wins |
| B9 | `--border-radius-full` | Maps to `--line-radius-round` by role | Nearest value to `--line-radius-6` |
| B10 | `--font-heading-xl-line-height`, `--font-heading-3xl-line-height` | Heading line heights drive the shared `--line-leading-2` and `--line-leading-1` steps | — |
| B11 | `--border-radius-md`, `--border-radius-lg` | Both leave the list under nearest value. The round-4 option text had said all 6 radii | Map all 6 radii |

#### 6.G.7 G7 — Transport recipes

- **Owner:** webcomponents-supervisor.
- **Deps:** G4.
- **Changes:** Storybook stories and MDX under `apps/storybook`; `@ag-ui/a2ui-middleware` in `apps/storybook` devDependencies (R6 §6 Q2); a Bun test.
- line ships no transport code. The app owns the transport (ARCH §17.5).

**AG-UI**

- The deployed story MUST use an in-browser mock producer (§10 SD64).
- The middleware cannot run in a browser. It imports `crypto`, uses CommonJS-only `clarinet` and fails on jsDelivr (R6 §2.1).
- The mock MUST emit `ACTIVITY_SNAPSHOT`, `a2ui-surface`, `status: building` and then `a2ui_operations`, and accept `forwardedProps.a2uiAction` (R6 §2.1).
- The MDX MUST document the server convention pinned exactly to `@ag-ui/a2ui-middleware` 0.0.13, the npm `latest` on 2026-10-20 (npm registry; §10 SD64).
- A Bun test MUST run the pinned middleware and compare its output with the mock fixture (§10 SD64).
- G7 MUST first re-run R6 probe P5 against 0.0.13. R6 observed P5 on 0.0.12 (R6 §2.1). A behaviour change lands as an AM row.
- The recipe server MUST set `defaultCatalogId` to the v0_9 basic id (§10 SD43).
- The middleware's own fallback id is `…/v0_9/basic_catalog.json`, which `web_core` does not know (R6 §2.1).
- The recipe MUST log `line-a2ui-error` locally and send nothing (§10 SD65).
- The recipe MUST name the gap. AG-UI and the middleware define no error channel (R6 §2.1; ARCH §17.4).
- The revisit trigger is a middleware release with an error path (§10 SD65).

**A2A**

- The recipe MUST accept an array or a single message per DataPart (R6 §2.2; §10 SD66).
- The recipe MUST accept `application/json+a2ui` beside `application/a2ui+json` (R6 §2.2; §10 SD66).
- The recipe MUST target A2A v1.0 with `@a2a-js/sdk` 1.3.0 (R6 §2.2; §10 SD66).
- The recipe MUST send only `application/a2ui+json` with `[action]` (ARCH §17.5; §10 SD66).

**MCP**

- A2UI MUST arrive only as a tool-result `EmbeddedResource` (ARCH §17.5; §10 SD67).
- `_meta.ui.resourceUri` belongs to MCP Apps `ui://` resources (R6 §2.3).
- Capabilities MUST travel in `_meta.a2ui` per call (R6 §2.3; §10 SD67).
- MCP SDK v2 appears in MDX only (§10 SD67).

**SSE**

- One message travels per SSE event (ARCH §17.5).
- The stream MUST end with a named `end` event (R6 §2.4; §10 SD67).
- Capabilities MUST travel in the query string, because `EventSource` sends no body or header (R6 §2.4; §10 SD67).

**MCP Apps View delivery**

- The docs MUST show `vite-plugin-singlefile` first. It folds the lazy `load()` chunks into one file (R5 §2.2; §10 SD68).
- The docs MUST show a CDN listed in `resourceDomains` as the alternative (R5 §2.2; §10 SD68).
- The docs MUST tell server authors to list font origins. The default CSP has no `font-src` (R5 §2.2; §10 SD68).
- The docs MUST import ext-apps 2.x from `./app-with-deps`. The main entry pulls Zod 4 peers into a Zod 3 app (R5 §2.3; §10 SD69).

**Acceptance**

- Storybook holds one recipe per transport: AG-UI, A2A, MCP and SSE (plan §7.3).
- Each recipe renders C1–C4 through `<line-a2ui-surface>` in the deployed Storybook.
- The Bun comparison test passes on middleware 0.0.13.
- The A2A recipe renders both the array and the single-message DataPart.

### 6.D Stream D — Cross-Cutting Documentation

- Owner of every D task is webcomponents-supervisor (plan §4.0).
- Stream D documents what streams G and C ship (plan §4.4).

#### 6.D.1 D1 — Agent-driven UI guide

- **Owner:** webcomponents-supervisor.
- **Deps:** G1–G6.
- **Changes:** one Storybook MDX guide under `apps/storybook/stories/` [INFERENCE on the path, following Phase 00 spec §6.G] (§10 SD70).
- **Contract**
  - The guide MUST explain descriptors, `agentExposed` and the two catalogs (ARCH §17.3).
  - The guide MUST state the `line` catalog id and the basic opt-in rule (§10 SD42, SD43, SD44).
  - The guide MUST show the tool emitter with the provider argument, the 1024-character cap and the Anthropic per-request caps (§10 SD48, SD49).
  - The guide MUST state the preview status of `@websublime/line-genui/a2ui` (ARCH §17.7).
  - The guide MUST describe the URL policy, the Markdown hook, the limits and the error payload (§10 SD57, SD58, SD56, SD55).
  - The guide MUST state the template-list focus limit and its trigger (§10 SD60).
  - The guide MUST describe the MCP Apps bridge and View delivery (§10 SD62, SD68).
- **Acceptance:** the guide builds in Storybook, and every code sample compiles against the shipped exports.

#### 6.D.2 D2 — Recipes index

- **Owner:** webcomponents-supervisor.
- **Deps:** G7.
- **Changes:** one Storybook MDX page that links the four recipes.
- **Contract:** the index MUST list each transport with its inbound and outbound shape and its pinned versions (ARCH §17.5; §10 SD66, SD64, SD67).
- **Acceptance:** each link resolves in the deployed Storybook.

#### 6.D.3 D3 — Getting Started updates

- **Owner:** webcomponents-supervisor.
- **Deps:** C1–C20, G4, P6.
- **Changes:** `apps/storybook/stories/getting-started.mdx` (Phase 00 spec §6.G.1).
- **Contract**
  - Getting Started MUST cover installing the Phase 1 components and the opt-in `line-genui` package (plan §4.4).
  - It MUST give full subpath URLs for CDN use (§10 SD32).
- **Acceptance:** each install and CDN snippet works as written in the P6 check pages.

### 6.S Site

#### 6.S.1 S1 — Landing page

- **Owner:** webcomponents-supervisor for content; infra-supervisor for the `playwright.config.ts` and `checks.yml` changes (plan §4.0).
- **Deps:** every C task whose component the page uses (plan §6). Each section starts after its components ship (plan §2.8).
- **Changes:**
  - `apps/site/src/pages/index.astro` with hero, value proposition, features and a Storybook link (plan §2.8, PRD §5.3).
  - `apps/site/package.json` `devDependencies` gain `@websublime/line-components`, `@websublime/line-themes` and every other `@websublime/*` package the page imports, as `workspace:^` (R12 §2.2).
  - `playwright.config.ts` gains a third `webServer` entry that serves `apps/site/dist` through `astro preview` on its own port [INFERENCE: port number left to the implementer, distinct from 4319 and 4320] (§10 SD71).
  - `apps/site/__tests__/landing.e2e.ts`.
- **Contract:**
  - Each section loads its components through a processed `<script>import '@websublime/line-components/<c>';</script>` placed in that section (§10 SD72, R12 §2.1).
  - The page uses no Astro or Lit integration (§10 SD72, MANIFESTO Principle 5).
  - The guard test MUST assert that every `line-*` element on the built page matches `:defined` in Chromium, Firefox and WebKit (§10 SD72, R12 §6 Q3).
  - The `:not(:defined)` rule, the theme CSS scope and the stylesheet delivery are the implementer's choice, recorded in the PR (§10 SD73).
- **Acceptance:**
  - `bun run build` builds the site with the page.
  - The guard test fails when a section's `<script>` is removed by hand [run once, recorded in the Verify record].
  - The page passes the §7.4 axe ruleset.

### 6.Z Repo-wide

#### 6.Z.1 Z1 — Code of conduct

- **Owner:** main session (plan §4.0).
- **Deps:** none.
- **Changes:** `CODE_OF_CONDUCT.md` at the repository root. `README.md` links it.
- **Contract:**
  - The file MUST exist on `main` before the Phase 1 Version PR merges (PRD §10, plan §7.4).
  - The file names its source text and version, and the contact that receives reports (§10 SD74). Miguel supplies the text and the contact.
- **Acceptance:** the file exists and the README link resolves.

#### 6.Z.2 Z2 — PROCESS §4 and the `CLAUDE.md` ledger pointer

- **Owner:** main session.
- **Deps:** the Phase 1 ledger file exists.
- **Changes:**
  - `docs/PROCESS.md` §4 "Repo agents" (`docs/PROCESS.md:79-81`) maps the Phase 1 streams to owners as plan §4.0 does. `webcomponents-supervisor` implements C, D and G and the S content. `infra-supervisor` implements P and the S deploy changes. Stream Z stays with the main session per row.
  - `CLAUDE.md:48` points at the Phase 1 ledger `docs/plans/01-tasks-<slug>.md` (PROCESS §6 naming).
- **Contract:**
  - PROCESS §4 MUST keep the Phase 00 letters readable as history or drop them in the same commit. Live text MUST NOT name a stream that has no ledger (PROCESS §3).
- **Acceptance:** a grep of `PROCESS.md` and `CLAUDE.md` for the Phase 00 ledger path returns only historical mentions.

#### 6.Z.3 Z3 — Exit sweep and Phase 1 retrospective

- **Owner:** main session.
- **Deps:** every other Phase 1 row. The exit sweep starts before the last rows land (plan §7.4).
- **Changes:**
  - The exit sweep over the live documents and the ledger (plan §7.4, §10 step 7).
  - `docs/retrospective/01-<slug>.md` with a hand-off to Phase 2 (plan §10 step 7; `docs/plans/01-plan-core-primitives.md:614`).
- **Contract:**
  - The sweep MUST run before the last rows land (plan §7.4; retrospective lesson 9).
  - The retrospective MUST carry a hand-off section for Phase 2 (plan §7.4).
- **Acceptance:** the sweep's findings are recorded in the ledger, and the retrospective file exists with its hand-off section (§10 SD87).

## 7. Cross-Cutting Concerns

### 7.1 TypeScript 7 configuration and declaration wiring

Task P8 carries every change in this section (plan §2.9, D1, §10 SD7).

| File | Change | Source |
|---|---|---|
| `package.json` (root) | `"typescript": "^7.0.2"`; remove `"vite-plugin-dts"` | R11 §2.1; D1 (a) |
| `vite.config.shared.mjs` | Remove the `dts` import and plugin (lines 2, 24) | D1 (a); §10 SD7 |
| `packages/line-core/package.json` | `build` and `dev` as in §4.5 | §10 SD7; R11 §2.8 P-T |
| `packages/line-components/package.json` | `build` and `dev` as in §4.2 | §10 SD7 |
| `packages/line-genui/package.json` | `build` and `dev` as in §4.1 | §10 SD7 |
| `packages/line-{schemas,utils,icons}/package.json` | No script change; `tsc -b` now runs 7.x | D1 (a) |
| `tsconfig.base.json` | No change; `declarationMap: true` stays (line 19) | §10 SD7 |
| `apps/storybook/types/line-css.d.ts` | `declare module` lines for the six CSS specifiers R11 §2.7 RC1 lists | R11 OQ2 (b); plan §5.6 defaults |
| `apps/storybook/tsconfig.json` | Includes the new `.d.ts` | R11 OQ2 (b) |

- The Vite-built packages MUST emit every `.d.ts` with TypeScript 7.x `tsc --emitDeclarationOnly` (D1).
- `tsc` MUST run after `vite build`, because Vite empties `dist/` first [INFERENCE: Vite `emptyOutDir` default].
- The `--noEmit false` flag overrides `noEmit: true` in each package tsconfig (`packages/line-core/tsconfig.json:4`).
- `--checkers` stays at its default (§10 SD7, R11 §2.4).
- No TypeScript 6.0 package enters the workspace (D1 (b) rejected).
- The `declare module` lines keep `noUncheckedSideEffectImports` on for every other import (R11 OQ2 (b)).
- The existing "Typecheck" step type-checks `apps/storybook` against the emitted `line-core` declarations. That step and `verify-pack` check (a) verify the output (§10 SD7; `checks.yml:24-27`).
- Editors that rely on the TypeScript API for Astro or MDX keep 6.0-era behaviour. No CI step checks `.astro` or `.mdx` (R11 §2.9).
- The CEM analyser parses with its own nested TypeScript 5.4.5 and does not read the workspace version (R4 §2.9).

### 7.2 Versioning and changesets

| Package | Version today | Phase 1 changeset | Version at phase exit | Source |
|---|---|---|---|---|
| `line-tokens` | 0.1.3 | `minor` | 0.2.0 | plan §7.4; PRD §7.3 |
| `line-colors` | 0.1.3 | `minor` | 0.2.0 | plan §7.4 |
| `line-schemas` | 0.1.1 | `minor` | 0.2.0 | plan §7.4 |
| `line-themes` | 0.1.2 | `minor` | 0.2.0 | plan §7.4 |
| `line-utils` | 0.1.0 | `minor` | 0.2.0 | plan §7.4 |
| `line-core` | 0.1.1 | `minor` | 0.2.0 | plan §7.4 |
| `line-components` | 0.1.0 | `minor` | 0.2.0 | plan §7.4 |
| `line-icons` | 0.1.0 | `minor` | 0.2.0 | plan §7.4 |
| `line-genui` | 0.1.0 (seeded by P1) | `minor` | 0.2.0 | §10 SD3; R9 §2.6 |

- Every package is released at `0.2.0` through `release.yml` with provenance (plan §7.4).
- A package that no Phase 1 branch changes still needs a `minor` changeset before the Version PR, so all nine land at `0.2.0` [INFERENCE: plan §7.4 "Every package is released at `0.2.0`"] (§10 SD75).
- `0.1.0` of `line-genui` is never published (§10 SD3).
- Once `v0.2.0` ships, further Phase 1 changesets use `patch` (PROCESS §6).
- Canaries follow `0.2.0-<sha>-SNAPSHOT` (`.changeset/config.json:18`; R9 §2.6).
- Changesets bumps a dependent when a `peerDependencies` range it declares is bumped, and that bump may be `major` [INFERENCE: Changesets peer-dependent behaviour, not probed in R9]. P3 MUST prove the nine `0.2.0` versions in a dry run before the first `line-genui` release. If the dry run shows a `line-genui` major bump, P3 sets `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.onlyUpdatePeerDependentsWhenOutOfRange: true` in `.changeset/config.json` through an AM row [INFERENCE] (§10 SD76).
- R9 §2.6 ran on `@changesets/cli` 2.31.1, the repo version. npm `latest` is 3.0.3. Phase 1 stays on 2.x [INFERENCE: no decision moves it] (§10 SD77).

### 7.3 Custom Elements Manifest

- One manifest serves the G5 tests, Storybook and consumers. The `line-components` build emits it into the package (§10 SD26, D8).
- The analyser runs before the Storybook build, because `package.json:23` builds packages before apps (§10 SD26).
- `line-components` ships it with a `customElements` field, a `files` entry and an `exports` key (D8; §4.2).
- The analysis includes the `line-core` sources, because inheritance resolves by class name across the manifest (R4 §2.3).
- Module paths of `line-components` elements MUST resolve to files inside the tarball. `files` ships `src`, so the analyser's `src/…` paths resolve [INFERENCE: R4 OQ5 notes paths may need to point at `dist`; P10 checks it on the packed tarball].
- Tests look up each element by tag, because `modules[]` order changes per run (R4 §2.7, P9).

Content rules (§10 SD61):

| Fact | Rule | Source |
|---|---|---|
| Events | `@fires` is mandatory for every event. The drift test reads only JSDoc-described events | R4 §2.4, OQ3 (a) |
| Public members | The tests filter on `privacy`, `static` and `inheritedFrom` | R4 §2.3, OQ6 (a) |
| Form association | The tests read the inherited static `formAssociated` | R4 §2.6, OQ1 (a) |
| ARIA role and states | The descriptor holds them. The manifest carries none | R4 OQ2 (a); ARCH §17.3 |
| `schemaVersion` | Kept as the analyser emits it (`1.0.0`) | R4 OQ8 (a) |
| Per-item deprecation | Class- and member-level only | R4 OQ7 (a); §10 SD61 |

- No analyser plugin beyond `litPlugin()` is added (§10 SD61).
- `<line-a2ui-surface>` lives in `line-genui`. D8 names only `line-components`, so the shipped manifest does not cover it (§11 OQ-surface-manifest).

### 7.4 axe tier

| Item | Rule | Source |
|---|---|---|
| CI runner | Playwright with `@axe-core/playwright` 4.14.0 inside "Browser tier" | §10 SD78; R8 §2.4 |
| Engines | Chromium, Firefox, WebKit | `playwright.config.ts:22-26` |
| Ruleset | `withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])` | §10 SD79; R8 §2.4 |
| Pass condition | Zero violations, as a failing check | plan §7.1, §7.2 |
| Targets | Every story of every component; the `<line-a2ui-surface>` stories; the landing page | plan §7.1, §7.2; S1 |
| Author panel | `@storybook/addon-a11y` stays and gates nothing | §10 SD78; PRD §5.2 |

- axe misses roles set only through `ElementInternals` and closed shadow roots (R8 §2.4).
- Zero violations do not prove that an accessible name exists for such roles (R8 §2.4).
- Each component whose role lives only in internals gets a screen-reader pass recorded in its component spec (§10 SD39).
- Button, IconButton, Chip and the AvatarGroup overflow control put `button` on an inner native element, so axe's naming rules apply (§10 SD31).

### 7.5 Bundle splitting and isolation checks

All checks run on the packed tarball from `stageAndPack` (`scripts/verify-pack.mjs:71`), extracted into a temp `node_modules` layout (§10 SD4; R9 §2.2).

| Check | Method | Fails when | Source |
|---|---|---|---|
| Registration harness | Fresh happy-dom realm per subpath; wrap `customElements.define`; import the subpath; record names | A subpath registers a set other than its §4.2 row; the root `"."` registers anything | §10 SD4; R9 §2.2 |
| Isolation scan | esbuild `--metafile` bundle per subpath; scan inputs and tag strings | A bundle holds another component's module or tag | §10 SD4; R9 §2.2 |
| esbuild consumer bundle | One bare-import bundle of every subpath through esbuild | esbuild emits `ignored-bare-import` | §10 SD4; R9 §2.1 |
| `instanceof` harness | Consumer bundle importing `@websublime/line-core` and a subpath | The element is not `instanceof` the imported `LineElement` | §10 SD2; R9 §2.1; plan §7.4 |
| `line-genui` registration | Same harness on `./catalog` and `./a2ui` | `./catalog` defines any element; `./a2ui` defines anything but `line-a2ui-surface` | PRD §7.3; R9 §2.2; added by G4 |
| Undeclared bare specifiers | Parse `dist/**/*.js` imports of the three Vite packages | A bare specifier names no declared package | §10 SD2 (P9) |

- No `sideEffects` field exists on `line-components` or `line-genui`, so no static `sideEffects` check is needed (§10 SD4; R9 §2.2 static-check row).
- The checks run inside `bun test` (§10 SD4).
- Vite and webpack give no drop signal, so the matrix keeps one esbuild bundle only (§10 SD4; R9 §2.2).

### 7.6 Size measurement

| Item | Rule | Source |
|---|---|---|
| Quantity | Component only, with Lit, `line-core` and Zag external | §10 SD21; R9 §2.4 |
| Tool | esbuild `--bundle --minify --format=esm --target=es2022`, then `gzip -9 -n` | §10 SD21; R9 §2.4 |
| Artifact | The packed tarball | §10 SD21 |
| Output | A per-component table printed by `scripts/report-size.mjs` in the CI log | plan §7.1 "measured and reported" |
| Gate | None; the < 5 KB target is monitored, not blocking | PRD §1.6–§1.7; §10 SD21 |
| `line-core/styles` | Each `createSheet()` call carries `/* @__PURE__ */` | §10 SD20; R9 §2.1 |

- The Vite build report gives the same per-file gzip number and serves as a cross-check (R9 §2.4).
- The report also prints the shared baseline (Lit, `line-core`, `line-core/styles`, Zag core and vanilla) once, so readers see the first-component cost (R9 §2.4 table).

### 7.7 CDN contract

The docs promise two paths and the manifests gain no CDN field (§10 SD32).

| Path | URL form | Consumer setup | Known cost | Source |
|---|---|---|---|---|
| jsDelivr `+esm` | `https://cdn.jsdelivr.net/npm/@websublime/line-components@<v>/<subpath>/+esm` | None | Two copies of `lit-html` and `@lit/reactive-element` are accepted; the endpoint carries a beta notice | §10 SD32; R9 §2.3 |
| unpkg raw | `https://unpkg.com/@websublime/line-components@<v>/dist/<c>/index.js` | A documented import map and `globalThis.process = { env: { NODE_ENV: 'production' } }` before the first module | One Lit copy; 84 requests for `line-core`; cold Firefox CORS errors seen | §10 SD32; R9 §2.3 |

- The docs give full subpath URLs. A bare package URL returns 404 on both CDNs and is not promised (§10 SD32; R9 §2.3).
- The 14-entry import map R9 §2.3 lists is the `line-core` baseline. P6 adds the entries that `line-components` needs, such as `@websublime/line-core`, `@websublime/line-core/` and each `@zag-js/*` package a component imports, and the docs list the final map [INFERENCE: the extra entries follow from §4.2 dependencies] (§10 SD80).
- The `process` shim is needed because Zag 1.46.0 ESM reads `process.env.NODE_ENV` (R9 §2.3).
- A `+esm` page that loads a `line-core` version other than the one a `line-components` bundle was built against gets two `LineElement` classes [INFERENCE from R9 §2.3 version pinning]. The docs pin one version for every `@websublime/*` URL on a page.
- P6 verifies both paths (§10 SD32; plan §7.4).

### 7.8 Test conventions

| Tier | Runner | Covers | Source |
|---|---|---|---|
| Unit | `bun test` on happy-dom (`bunfig.toml` preload) | Rendering, props, events, slots, machine wiring | PRD §5.2; Phase 00 spec §7.1 |
| Browser | Playwright, three engines, `*.e2e.ts` | Focus, keyboard, axe, layout, everything happy-dom cannot model | PRD §5.2; `playwright.config.ts:5` |
| Packaging | `bun test` on the packed tarball | §7.5 checks | §10 SD4 |

- The browser tier is the source of truth where the two tiers disagree (plan §8 "happy-dom gaps" row, retrospective lesson 2; `docs/plans/01-plan-core-primitives.md:588`; happy-dom limits in R7 §2.2).
- Tests exercise the built artifact wherever the claim is about what ships (retrospective lesson 5, cited in R9 §2.2).
- Component tests take no DOM snapshots. They assert parts, attributes, slots and events through queries (§10 SD81).
- A component spec MAY use a string snapshot with the built-in serializer after a helper normalises the HTML (§10 SD81).
- No custom snapshot serializer is added until a component spec shows the built-in one limiting (§10 SD81; Phase 00 spec §6.C.7 note).
- Lit's template marker is random per load, so raw shadow `innerHTML` is not a stable snapshot (`node_modules/.bun/lit-html@3.3.3/node_modules/lit-html/development/lit-html.js:103`) [INFERENCE: that the markers stay in rendered DOM].
- Tags in test files use the `line-` prefix (`scripts/lint-layers.mjs:308-350`).

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A2UI churn. `web_core` ships breaking minors (0.12.0 → 0.13.0 in 11 days; 0.14.0 `latest` since 2026-10-17 with 12 entries marked BREAKING; plan §8, R1 §2.1) | High | High | `line-genui` pins `@a2ui/web_core` exactly at `0.14.0`. A newer version lands only through an AM after the R1 and R2 probes run again (§4.1, §6.G.4; §10 SD6). The surface keeps preview status (ARCH §17.7) |
| Zod split. The repo and `web_core` declare `zod ^3.25.76`, while Zod `latest` is 4.6.7 (plan §8) | Medium | High | Descriptors stay on the Zod 3 API (§6.G.1; R3 §2.2). The docs import ext-apps from `./app-with-deps`, so no Zod 4 peer enters a Zod 3 app (§6.G.7; §10 SD69) |
| The TypeScript 7.x move breaks the toolchain (R11 blocker B1, TS2882) | Medium | High | P8 emits declarations with 7.x `tsc --emitDeclarationOnly` and adds ambient CSS module lines (§6.P.8, §7.1; §10 SD7) |
| `line-components` inlines `line-core`, so consumers get two `LineElement` classes (R9 §2.1) | High | High | P9 derives `external` from each manifest before C1. The `instanceof` harness and the identity test run on the packed tarball (§6.P.9, §7.5; §10 SD2) |
| The reference icon resolvers emit no icon in a consumer bundle (R10 P6) | High | Medium | C22 fixes them before C2 against the §6.C.3 acceptance contract. The mechanism waits on R10 round 2, row 00-Z47 (§11 OQ-C22) |
| Repeated `updateProps` calls slow each machine down. One `prop()` read grew from 0.013 ms to 0.397 ms over 4,000 calls (R7 §2.3 P4) | Medium | Medium | C21 measures the host update rate per machine component and records a budget. It files the upstream Zag issue. A `line-core` `VanillaMachine` subclass replaces the props source only for components past the budget (§6.C.1; §10 SD18) |
| Changesets bumps `line-genui` to a major when its peer `line-components` moves from 0.1 to 0.2 [INFERENCE: not probed in R9 §2.6] | Medium | High | P3 proves `0.2.0` for all nine packages in a dry run before the first `line-genui` release. On a major bump, P3 sets `onlyUpdatePeerDependentsWhenOutOfRange` through an AM row (§6.P.3, §7.2) |
| Shipped manifest module paths point at files the tarball lacks (R4 OQ5) | Medium | Medium | `files` ships `src`. P10 checks the module paths on the packed tarball (§6.P.10, §7.3) |
| Anthropic strict mode caps each request at 20 strict tools, 24 optional params and 16 union-typed params across all strict schemas (R3 §2.6) | Medium | Medium | Acceptance holds per tool. The docs state the per-request caps, and a live provider call before each release is recorded in the release PR (§6.G.3; §10 SD49) |
| Catalog quality becomes the agent UX (plan §8) | High | Medium | Descriptions reach the catalog through `spec(…, {mixins})` and the `REF:` helper (§6.G.1; §10 SD41). Each component spec reviews its descriptor |
| Accessibility of agent-built trees is under-specified upstream (plan §8) | Medium | High | The surface checks required names before render, keeps one live region and follows the D4 focus rule. P7 runs the axe tier on the surface stories (§6.G.4, §7.4; §10 SD36, SD82) |
| axe misses roles set only through `ElementInternals` (R8 §2.4) | Medium | High | Interactive roles sit on inner native elements. Internals-only roles get a screen-reader pass in their component spec (§7.4; §10 SD31, SD39) |
| Template-list reorders rebind a kept element to another item, because `instanceId` is unstable until a2ui#1745 (R2 §2.8) | Medium | Medium | The docs state the limit, and a2ui#1745 is the revisit trigger (§6.G.4; §10 SD60) |
| Prompt injection through action labels (plan §8) | Medium | High | Agent strings stay untrusted and render as plain text. Markdown renders only through a consumer hook. The URL policy applies after base resolution and rejects `data:` (§6.G.4; §10 SD57, SD58) |
| Hostile or runaway agents exhaust the surface (ARCH §17.4) | Medium | High | Finite limits on node count, depth and data-model size. A breach rejects the message. The G4 stress test sets the values through an AM (§6.G.4; §10 SD56) |
| Scope creep toward a chat platform (plan §8) | Medium | Medium | Hold the §2 Non-Goals list. Headless chat primitives stay a product decision |
| happy-dom gaps hide browser bugs (plan §8) | High | Medium | The browser tier is the source of truth (§7.8) |
| Bugs show only in built output (plan §8) | Medium | High | Packaging checks run on the packed tarball, and the shipped manifest feeds the tests (§7.3, §7.5) |
| Eager imports in the catalog or surface regress Law 6 (plan §8) | Medium | High | Lazy `load()` per descriptor; the `line-genui` registration harness (§7.5); the "defines no element" criterion (§9.2) |
| The catalog schema weight grows per descriptor (plan §8; R3 §2.7) | Medium | Medium | CI prints bytes and o200k tokens per tool, report only (§6.G.3; §10 SD50) |
| CDN delivery breaks on one of the two promised paths (R9 §2.3) | Medium | Medium | P6 checks jsDelivr `+esm` and unpkg raw files before each release. The docs pin one version for every `@websublime/*` URL on a page (§6.P.6, §7.7; §10 SD32) |
| A2UI v1.0 goes final mid-phase (plan §8) | Low | Medium | The v1.0 emitter stays out of scope (§2). The surface keeps preview status |
| O4.a install scripts in `deploy-site.yml` (plan §8) | Medium | High | Ledger row `00-Z28` |
| O4.b Biome flag workaround (plan §8) | Low | Low | Ledger row `00-Z29`, blocked until the Biome release |
| O4.c stale Bun version in the Phase 00 spec (plan §8) | Low | Low | Ledger row `00-Z30` |

---

## 9. Acceptance Criteria

Phase 1 is complete when every item below holds. The list mirrors plan §7.1–§7.4 item by item. The 17 PRD §7.3 criteria keep their wording, and the plan's additions are in *italics*.

### 9.1 Components

- [ ] All listed components pass the 8-point test checklist (PRD §5.2)
  - Tasks: C1–C20 (§6.C.6).
  - Check: the "Unit tier" `bun test` and "Browser tier" `bun run e2e` steps in `.github/workflows/checks.yml` pass.
- [ ] Storybook documentation complete for every component
  - Tasks: C1–C20, P10.
  - Check: the Storybook build passes, and each component's autodocs page shows its attributes, slots, events and CSS parts from the shipped manifest (§6.P.10).
- [ ] Zero axe-core violations
  - Tasks: P7, C1–C20.
  - Check: `packages/line-components/__tests__/a11y/<c>.e2e.ts` passes in three engines with the §7.4 ruleset.
- [ ] CEM manifest generated and verified
  - Tasks: P10, G5.
  - Check: `bun run scripts/verify-pack.mjs` fails without `custom-elements.json` in the `line-components` tarball; the G5 drift and coverage tests pass.
- [ ] *Storybook loads the manifest through `setCustomElementsManifest`, and `@websublime/line-components` ships it with a `customElements` field and a `files` entry (D8).*
  - Task: P10.
  - Check: `apps/storybook/.storybook/preview.ts` calls `setCustomElementsManifest`; `verify-pack` check (a) covers the `customElements` field (§4.2).
- [ ] Changeset entry for every component
  - Tasks: C1–C20.
  - Check: each component PR adds a `.changeset/*.md` entry (§6.C.6).
- [ ] *Every Phase 1 component spec is APPROVED before code, with the Agent contract section filled (hand-off item 4).*
  - Tasks: C1–C20, step 1 of the §6.C.0 sequence.
  - Check: each `docs/specs/NNNN-<component>.md` reads `**Status:** APPROVED` before its implementation PR opens.
- [ ] *Every component fills the htmx Tests row per C9 (harness run, or `n/a` with a reason).*
  - Tasks: C1–C20 (§6.C.4 htmx column).
  - Check: the component spec Tests row; the harness under `packages/line-core/__tests__/integration/htmx/` where it applies.
- [ ] *Every component fills its row in `docs/COMPETITIVE-COMPONENT-ANALYSIS.md`.*
  - Tasks: C1–C20 (§6.C.6).
  - Check: the row exists for each of the 20 components.
- [ ] *Each component's gzipped size is measured and reported against the < 5 KB soft target (not gating, PRD §1.7).*
  - Tasks: P5, C1–C20.
  - Check: `scripts/report-size.mjs` prints the per-component table in the CI log (§7.6).

### 9.2 Agent-driven UI

- [ ] Every Phase 1 component in `@websublime/line-components` has an agent descriptor (exposed, or flagged `agentExposed: false` with a reason), and the CEM drift and coverage tests pass
  - Tasks: G1, G5, C5–C20.
  - Check: the G5 tests in `packages/line-genui` pass in the unit tier (§6.G.5).
- [ ] The inline form of `@websublime/line-genui/catalog.json` (the `line` catalog) validates against the A2UI v0.9.1 `client_capabilities.json#/$defs/Catalog`, `web_core` reads the catalog back with `Catalog.fromJson`, and the catalog's `validationSchema` compiles
  - Task: G2.
  - Check: the G2 tests listed in §6.G.2 Acceptance.
- [ ] The Phase 1 subset of the `basic` catalog is registered under the A2UI basic catalog id `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`, and unmapped basic types render an inert placeholder and raise `line-a2ui-error`
  - Tasks: G2, G4.
  - Check: a message with the v0_9 basic id renders mapped types and raises `line-a2ui-error` for each unmapped type (§6.G.2).
- [ ] The frontend-tool schemas validate as JSON Schema and use literal, flat parameters without the A2UI common types or dynamic bindings. The emitted tool definitions are accepted by OpenAI and Anthropic in strict mode and by Gemini, and every tool description stays at or under the self-imposed cap of 1024 characters
  - Task: G3.
  - Check: Ajv validation and the offline R3 P11 subset checks run in CI on every PR; the live provider calls are recorded in the release PR (§6.G.3).
- [ ] `@websublime/line-themes/hosts/mcp-apps.css` maps every MCP Apps standard host colour, font and border-radius variable on the reference list that the Phase 1 spec fixes, each to a line theme alias or token, and passes `lint-layers`
  - Task: G6.
  - Check: `bun run scripts/lint-layers.mjs` passes; the G6 browser test passes in three engines; the §6.G.6 key table is complete.
- [ ] `<line-a2ui-surface>` renders every agent-exposed Phase 1 component from A2UI messages with zero axe-core violations, and document `::part()` rules apply to the rendered elements
  - Tasks: G4 for C1–C4; C5–C20 for the rest; P7.
  - Check: the surface stories pass the §7.4 axe ruleset; the G4 acceptance tests in §6.G.4; each C5–C20 PR extends the surface render fixture (§6.C.6).
- [ ] Importing `@websublime/line-genui/catalog` defines no element; importing `@websublime/line-genui/a2ui` defines only `line-a2ui-surface`
  - Tasks: G1, G4 (on the P5 harness).
  - Check: the `line-genui` registration harness on the packed tarball (§7.5).

### 9.3 Documentation

- [ ] Storybook holds one recipe per transport (AG-UI, A2A, MCP, SSE)
  - Tasks: G7, D2.
  - Check: the four recipes render C1–C4 in the deployed Storybook; the Bun middleware comparison test passes (§6.G.7).
- [ ] The site landing page (hero, value proposition, features, Storybook link; PRD §5.3) is built with Phase 1 line://ui components and is live at `line-ui.websublime.com`
  - Task: S1.
  - Check: `apps/site/__tests__/landing.e2e.ts` asserts every `line-*` element is `:defined` in three engines; `deploy-site.yml` publishes the page (§6.S.1).

### 9.4 Platform and release

- [ ] Bundle splitting verified — families and independents work as documented
  - Task: P5.
  - Check: `packages/line-components/__tests__/bundle-splitting.test.ts` runs the §7.5 checks on the packed tarball.
- [ ] `scripts/lint-layers.mjs` carries the `line-genui` edges and passes
  - Task: P2.
  - Check: `ALLOWED_EDGES` equals the §3.3 block, and `bun run scripts/lint-layers.mjs` exits 0.
- [ ] The npm trusted publisher for `@websublime/line-genui` exists before its first release
  - Task: P4.
  - Check: the package settings show two trusted publishers and token publishing disallowed (§6.P.4).
- [ ] *CDN delivery through unpkg and jsDelivr is verified against the contract the spec fixes (PRD §1.7).*
  - Tasks: P6, D3.
  - Check: `packages/line-components/__tests__/cdn.e2e.ts` passes on both paths, and the release PR records both runs (§7.7).
- [ ] *The workspace builds, type-checks and emits declarations on TypeScript 7.x (O1). The Vite-built packages emit every `.d.ts` with 7.x `tsc --emitDeclarationOnly`, and the `tsc -b` packages with 7.x `tsc -b` (D1).*
  - Task: P8.
  - Check: `bun run build`, `bun --filter '@websublime/*' typecheck` and `verify-pack` exit 0; `tsc --version` prints 7.x (§6.P.8).
- [ ] *A consumer that imports `@websublime/line-core` and a `line-components` subpath gets one `LineElement` class (P9).*
  - Task: P9.
  - Check: `packages/line-components/__tests__/line-element-identity.test.ts` and the `instanceof` harness pass (§7.5).
- [ ] *The Phase 1 spec records the utility-class decision (PRD §9.13).*
  - Check: §10 SD1.
- [ ] *Every package is released at `0.2.0` through `release.yml` with provenance, and `line-genui` gets its first release per the spec.*
  - Tasks: P3, P4.
  - Check: the P3 dry run lists nine `0.2.0` versions; `npm view` shows `0.2.0` with provenance for all nine packages (§7.2).
- [ ] *A code of conduct is present before `v0.2.0` (PRD §10).*
  - Task: Z1.
  - Check: `CODE_OF_CONDUCT.md` exists on `main`, and the `README.md` link resolves.
- [ ] *Rows `00-Z28` and `00-Z30` are done, and row `00-Z29` is done or still blocked on the Biome release.*
  - Check: the ledger rows' status.
- [ ] *The exit sweep runs before the last rows land, and the Phase 1 retrospective is written with a hand-off to Phase 2 (retrospective lesson 9).*
  - Task: Z3.
  - Check: the retrospective file under `docs/retrospective/` exists with its hand-off section.

---

## 10. Design Decisions

Fork rows record Miguel's choice among options. Default rows record an orchestrator default that Miguel saw on 2026-10-20 and confirmed when he chose "proceed as proposed" at the end of round 4. Drafting rows record choices the drafting made inside the decisions; Miguel has not seen them. The Question column names the session id from the 00-Z46 decision record where one exists.

| ID | Question | Decision | Rejected | Evidence | Origin | Status |
|---|---|---|---|---|---|---|
| SD1 | Q13: Does line://ui ship utility classes (PRD §9.13)? | No. line://ui ships no utility classes | Ship a new set; rename the v0.7 set | PRD §9.13; plan §7.4 | Default R1 | Approved 2026-10-20 |
| SD2 | Q09: How do `@websublime/*` packages stay external (P9)? | Derive `external` from each manifest's `dependencies` and `peerDependencies`, by name or `name/…`; every bare specifier in `dist/` is declared | A `/^@websublime\//` regex; a per-package list | R9 §2.1 probe 6; ARCH §12; plan §7.4 | Default R1 | Approved 2026-10-20 |
| SD3 | Q14: What is the first `line-genui` version? | Seed `0.1.0`; a `minor` changeset yields `0.2.0`; `0.1.0` is never published; the canary-first effect on `latest` is accepted | Seed `0.0.0` to reach `0.1.0` | R9 §2.5, §2.6; PRD §7.1; plan §7.4 | Fork R1 | Approved 2026-10-20 |
| SD4 | Q08: What `sideEffects` value, chunk layout and isolation checks apply? | Remove the field; no component imports another (AvatarGroup by slot); default Rolldown chunks; registration harness, isolation scan and one esbuild consumer bundle on the packed tarball; AM to Phase 00 spec §4.7 | A `dist`+`src` glob; an explicit file list with a static check; `[]` with a named-import rule | R9 §2.1, §2.2; MANIFESTO Law 4, Law 6; ARCH §12 | Fork R1 | Approved 2026-10-20 |
| SD5 | Does `line-genui` carry `sideEffects`? | The field is omitted, extending §10 SD4, because `./a2ui` defines an element at module top | `sideEffects: false` | §10 SD4; R9 §2.1 | Drafting | Pending Miguel |
| SD6 | Q15: Which `@a2ui/web_core` version does `line-genui` pin? | Exactly `0.14.0`; a newer version only through an AM after the R1 and R2 probes run again | `0.13.0`; `latest` on the spec date as a range | R1 §2.1, §6 Q1; R2 §3; R3 §2.4; ARCH §17.7 | Fork R3 | Approved 2026-10-20 |
| SD7 | Q25: How does P8 wire TypeScript 7.x declarations (D1)? | Keep `declarationMap: true`; `build` runs `vite build && tsc -p tsconfig.json --noEmit false --emitDeclarationOnly`; `dev` adds `tsc --watch`; `verify-pack` and Typecheck verify; `--checkers` at its default | `declarationMap: false`; a `closeBundle` plugin; a pinned checker count or `--singleThreaded` | R11 §2.4, §2.8; plan §5.6 D1 | Default R1 | Approved 2026-10-20 |
| SD8 | Does `line-genui` have a root export? | No `"."` export | A root barrel | PRD Appendix D | Drafting | Pending Miguel |
| SD9 | Are the `line-genui` peers optional? | `line-components` and `line-icons` are required peers, with no `peerDependenciesMeta` | Optional peers | PRD §6.1; ARCH §17.1 | Drafting | Pending Miguel |
| SD10 | Q17: Which machine drives the ButtonGroup toolbar, and what is its tier label? | A custom roving-focus `createMachine` on `@zag-js/core` 1.46.0, tier Custom, buttons found through `slotchange`; the component spec opens with a slotted roving-focus probe; revisit when `@zag-js/toolbar` ships stable and the repo moves to Zag 2 | `@zag-js/toolbar` 2.0.0-next; `@zag-js/toggle-group` roving focus | R7 §2.1, §2.4; R8 §6 Q6; plan §5.6 D5 | Fork R2 | Approved 2026-10-20 |
| SD11 | Q18: Does Chip use `@zag-js/toggle` or a custom machine, and does it have a remove button? | Pre-built `@zag-js/toggle` 1.46.0, tier Pre-built, no remove button, not compound | A custom one-state machine; a sibling remove button | R7 §2.3, §2.4; R8 §2.2; plan §5.6 D6 | Fork R2 | Approved 2026-10-20 |
| SD12 | Q28: What entrypoints do the ten §12 family-rule components get? | Ten independents with one tag each; Kbd / Shortcut is one tag `line-kbd` at `./kbd` | Two tags under `./kbd`; two entrypoints; a Grid family | ARCH §12, §17.3; PRD §4.1; MANIFESTO Law 4 | Default R1 | Approved 2026-10-20 |
| SD13 | Does `line-components` declare `@zag-js/vanilla`? | No; components reach it through `@websublime/line-core/machine` | Declaring it | R7 §2.1; ARCH §8 | Drafting | Pending Miguel |
| SD14 | Q06: Does `<line-icon>` get a slot, and where does the A2UI name map live? | Attributes only, no slot; the map is per-set data in the `line-icons` `./a2ui` subpath | A default slot; the map in `line-genui`; the map in `line-components` `./icon` | R10 §6 Q1; ARCH §17.1; MANIFESTO Law 1 | Fork R2 | Approved 2026-10-20 |
| SD15 | Q49: What does the A2UI icon map hold? | No default set (the consumer registers one); each entry carries weight and the RTL mirror flag per name; the three Lucide collisions are accepted and documented | Lucide or Phosphor as default; fill or drifted glyphs for the collisions | R10 §2.3, §2.5, §6 Q2, Q5, Q7; ARCH §11 | Fork R2 | Approved 2026-10-20 |
| SD16 | Does the `line-themes` barrel import the MCP Apps bridge? | No; consumers import `./hosts/mcp-apps.css` on its own | Importing it from `src/index.css` | PRD Appendix D "Tiers" | Drafting | Pending Miguel |
| SD17 | Q30: How does `mcp-apps.css` handle `line-tokens` primitives? | A `body`-scoped `var(--host, inherit)` with no copied literals; Miguel approved the Law 10 reading that `line-themes` may name a token without copying its value | Copied literals; a second sheet in `line-tokens`; colour aliases only | R5 §2.4b; MANIFESTO Law 10 | Fork R4 | Approved 2026-10-20 |
| SD18 | Q20: How does C21 bound the cost of repeated `updateProps` calls? | C21 measures the host update rate per component and sets a budget; an upstream issue is filed; past the budget only, a `line-core` `VanillaMachine` subclass replaces the props source | Skip `updateProps` on shallow-equal props; wait for an upstream fix alone | R7 §2.3 P4, §6 OQ1; plan §5.6 D7 | Fork R1 | Approved 2026-10-20 |
| SD19 | Q31: How do components reach `ElementInternals`? | `LineElement` attaches internals for every component behind a protected `internals` accessor; `FormAssociated` reuses it; no `globalThis` registration; a `line-core` task before C1 measures the per-element cost | Private internals; an accessor on `FormAssociated` only; an opt-in controller; `globalThis` registration | R8 §2.5, §6 Q2; ARCH §14.8 | Fork R1 | Approved 2026-10-20 |
| SD20 | Q43: Does `line-core/styles` tree-shake per sheet? | `/* @__PURE__ */` on each `createSheet()` call | Leave as is; one subpath per sheet | R9 §2.1; Phase 00 spec §6.D.7 | Default R1 | Approved 2026-10-20 |
| SD21 | Q42: What does the < 5 KB soft target count? | The component alone with Lit, `line-core` and Zag external, measured with esbuild and `gzip -9 -n` on the packed tarball, reported per component, not gating | First-component cost; marginal cost over a baseline; size-limit with brotli | R9 §2.4, §6 Q6; PRD §1.6–§1.7 | Default R1 | Approved 2026-10-20 |
| SD22 | Where do the ambient CSS module declarations live? | `apps/storybook/types/line-css.d.ts`, included by `apps/storybook/tsconfig.json` | Another `.d.ts` path | R11 OQ2 (b) | Drafting | Pending Miguel |
| SD23 | Does P1 ship `line-genui` with empty modules? | P1 ships `./catalog` and `./a2ui` as zero-export modules; G2 adds the `./catalog.json` export key with its emitter | Shipping `./catalog.json` from P1 | Phase 00 spec §4.7 precedent; `scripts/verify-pack.mjs` check (a) | Drafting | Pending Miguel |
| SD24 | When does the `line-components` manifest baseline land, and what replaces the zero-export smoke step? | P9 removes `sideEffects` and declares `lit` and `@zag-js/core` before C1; P5 drops the Phase 00 zero-export smoke step through an AM to Phase 00 spec §9.1 | Landing the baseline with C1; keeping the smoke step | R9 §4; `.github/workflows/checks.yml:28-29`; Phase 00 spec §9.1 | Drafting | Pending Miguel |
| SD25 | When does the P6 CDN check run? | On `workflow_dispatch` and before each release, never on `pull_request` | Every PR | R9 §2.3 | Drafting | Pending Miguel |
| SD26 | Q22: Which manifest do the G5 tests read? | The `custom-elements.json` that the `line-components` build emits into the package; it also serves Storybook and consumers | `apps/storybook/customElements.json`; an in-memory manifest | R4 §2.3, §2.7; plan §5.6 D8 | Default R1 | Approved 2026-10-20 |
| SD27 | Where does the shipped manifest sit, and what goes away? | At the `line-components` root as `custom-elements.json` with a `./custom-elements.json` export; the root analyser config, the Storybook `analyze` script and the CI analyze step are removed; `verify-pack` check (a) gains `customElements` | A `dist/` location; keeping the root manifest | §10 SD26; R4 §2.7, §2.8; plan §5.6 D8 | Drafting | Pending Miguel |
| SD28 | Where does the C21 update-rate benchmark live? | `packages/line-core/__tests__/` | — | R7 §2.3 | Drafting | Pending Miguel |
| SD29 | R2 default: When does the controller start a machine? | In `hostConnected`, as today | After the first render | R7 §6 OQ7 | Default R2 | Approved 2026-10-20 |
| SD30 | R2 default: Which Zag major does Phase 1 use? | 1.x at `^1.46.0` until 2.0.0 ships stable | Zag 2.0.0-next | R7 §6 OQ8 | Default R2 | Approved 2026-10-20 |
| SD31 | Q45: Where does the role sit on interactive components? | An inner native `<button>` with host `aria-label` copied, for Button, IconButton, Chip and the AvatarGroup "+N" control | Host role through `ElementInternals` | R8 §2.2, §2.4, §6 Q1; ARCH §17.2 C5 | Fork R2 | Approved 2026-10-20 |
| SD32 | Q10: What CDN contract do the docs promise? | Two paths, no new manifest fields: jsDelivr `+esm` zero-config with two Lit copies accepted; unpkg raw files with a documented import map and a `process` shim; full subpath URLs; P6 verifies both | esm.unpkg.com; jsDelivr alone; `default`/`unpkg`/`jsdelivr` manifest fields | R9 §2.3; PRD §1.7 | Fork R1 | Approved 2026-10-20 |
| SD33 | Q05: What does the surface render for `svgPath` and for an unknown bound icon name? | `<line-icon>` gains a `path` property and draws `<svg viewBox="0 0 24 24"><path>` through `setAttribute('d')`; an unknown bound name leaves `<line-icon>` in the C8 neutral state and raises `line-a2ui-error` | A placeholder for `svgPath`; a native `<svg>`; a fallback glyph | R10 §2.1; R1 §2.7; ARCH §17.2 C1, C8; MANIFESTO Law 9 | Fork R3 | Approved 2026-10-20 |
| SD34 | What htmx outcome does the spec expect for the static rows? | `n/a` expected for the 14 static rows, confirmed or overturned by each component spec | Running the harness on every row | plan §2.4; ARCH §17.2 C9 | Drafting | Pending Miguel |
| SD35 | Q19: What do Button `pressed`, `loading` and `disabled` mean, and why is Chip not `Button[pressed]`? | The active press is `idle → active` (`data-active`, `:state(active)`); opt-in `pressed` is a toggle with `aria-pressed`; `loading` and `disabled` are props read by guards; a loading Button stays focusable with `aria-disabled`; the consumer supplies the loading text; Chip stays separate by role; ARCH §13.1 state list gets a text correction | `pressed` as active press only; `pressed` as toggle only; `loading`/`disabled` as finite states | R7 §2.4, §6 OQ4; R8 §2.2; ARCH §14.8 | Fork R2 | Approved 2026-10-20 |
| SD36 | Q16: How is the IconButton name checked, and is IconButton form-associated? | A descriptor-level required name; the surface rejects a nameless node to a placeholder with `line-a2ui-error` before render; the axe gate covers hand-written markup; `type="button"` only, not form-associated, ARCH §7 unchanged | A runtime dev warning; a DOM check after render alone; adding IconButton to ARCH §7 | R8 §2.4; R2 §2.8, §6 Q5; ARCH §13.1 | Fork R2 | Approved 2026-10-20 |
| SD37 | Q46–Q48: Presence tracking and unmount; AvatarGroup overflow and Avatar tier; Alert and Spinner roles | Deferred to the component specs: Presence after the R7 §6 OQ2 three-engine probe (R7 §6 OQ2, OQ3); AvatarGroup and Avatar (R7 §6 OQ5, OQ6; R8 §6 Q10); Alert and Spinner (R8 §6 Q8, Q9) | Deciding them in this spec | R7 §6 OQ2, OQ3, OQ5, OQ6; R8 §6 Q8–Q10 | Default R2 | Approved 2026-10-20 |
| SD38 | Q11: Which components carry `agentExposed: false`? | Portal, Presence and Visually Hidden, each with a recorded reason | Portal and Presence only; none | R8 §2.2; R7 §2.2; ARCH §17.4 | Fork R2 | Approved 2026-10-20 |
| SD39 | R2 default: How are roles set only through internals checked? | A screen-reader pass recorded in the component spec | No second check | R8 §2.4, §6 Q5 | Default R2 | Approved 2026-10-20 |
| SD40 | What do G6, G7 and G4 depend on beyond plan §6? | G6 on P1; G7 on G4; G4 on P5, whose harness gains the `line-genui` registration row | — | plan §6; §7.5 | Drafting | Pending Miguel |
| SD41 | Q54: How do descriptors attach descriptions? | Component descriptions through `spec(…, {mixins})`; property descriptions through a line helper that writes the `REF:` marker | Plain `.describe()`; the upstream helpers | R1 §2.4.3, §6 Q6; R3 §2.4, §6 Q6 | Default R3 | Approved 2026-10-20 |
| SD42 | Q53: What does `catalog.json` hold, and what is the `line` catalog id? | The document form with `$defs/anyFunction` and `$defs/theme`; a documented function derives the inline projection; id `https://line-ui.websublime.com/a2ui/catalogs/line/v1/catalog.json`, an identifier that need not resolve; `v1` bumps on an incompatible change | The inline form as the file; `toJson()` as emitted | R2 §2.7, §6 Q7; ARCH §17.3 | Fork R3 | Approved 2026-10-20 |
| SD43 | Q01a: Which catalog ids does the `basic` implementation answer to? | Only the v0_9 id `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json`, always registered; the AG-UI recipe server sets `defaultCatalogId` to it | Also the `v0_9_1` id; also the middleware fallback `…/v0_9/basic_catalog.json`; recipes on the `line` id only | R1 §2.4.1, §2.6; R6 §2.1; ARCH §17.3 | Fork R3 | Approved 2026-10-20 |
| SD44 | Q01b: Does a session advertise `basic` by default? | Capabilities list the basic id only on consumer opt-in until basic coverage is complete | Advertise by default; advertise a trimmed inline basic catalog | R1 §2.6; R6 §2.2, §2.3; ARCH §17.3 | Fork R3 | Approved 2026-10-20 |
| SD45 | Q50: Which protocol versions are advertised, accepted and emitted? | Advertise `v0.9` and `v0.9.1`; accept both; emit `v0.9.1` | Advertise `v0.9.1` alone | R1 §2.5.1, P10, §6 Q8; R2 §2.6 | Default R3 | Approved 2026-10-20 |
| SD46 | Q03a: How does the frontend-tool emitter build flat parameters? | A line-owned walker over the Zod 3 descriptor schema, checked with Ajv and the R3 P11 subset checks | `zod-to-json-schema`; `Catalog.toJson()` plus a rewrite; native `z.toJSONSchema` (Zod 4) | R3 §2.1, §2.2, §2.5, §6 Q4 | Fork R3 | Approved 2026-10-20 |
| SD47 | Which props does the tool walker leave out? | `ComponentId`, `ChildList` and `Action` props | Emitting them as literals | R3 §6 Q4 | Drafting | Pending Miguel |
| SD48 | Q04: How does the emitter reach Gemini? | One flat literal model per descriptor, serialised per provider through a provider argument; Gemini gets `parameters` with `nullable` | Gemini `parametersJsonSchema` with the strict schema | R3 §2.6 | Fork R3 | Approved 2026-10-20 |
| SD49 | Q51: How is provider acceptance proved, and what tool-name pattern applies? | Per tool; offline subset checks in CI on every PR; a live call to each provider before each release recorded in the release PR; Anthropic per-request caps documented; names match `^[a-zA-Z0-9_-]{1,64}$` | Offline checks alone; live calls in CI | R3 §2.6, §3 | Fork R3 | Approved 2026-10-20 |
| SD50 | Q03b: Does a tool definition get a token budget? | Report only: CI prints bytes and o200k tokens per tool | No budget; a gating budget | R3 §2.7 | Default R3 | Approved 2026-10-20 |
| SD51 | Q02a: One `processMessages` call per message or per batch? | One call per message; a bad message drops only itself; `aria-busy` covers the batch | One call per batch | R1 §2.7; R2 §2.6, §2.8; R6 §2.2 | Default R3 | Approved 2026-10-20 |
| SD52 | Q02b: Which `validationConfig` does the surface pass? | `RELAXED_VALIDATION` | None; `STRICT_VALIDATION`; custom with `allowUnknownElements: false` | R1 §2.7; R2 §2.0 | Default R3 | Approved 2026-10-20 |
| SD53 | Q02d: Where does the depth limit live? | A surface-side counter while it walks `NodeResolver` | `web_core` `maxDepth`, which does not fire with `allowMissingRoot: true` | R2 §2.6, §6 Q6; R1 §2.7 | Default R3 | Approved 2026-10-20 |
| SD54 | Q02 (K1): How do a cycle and a pending child behave (contradiction K1)? | A cycle rejects its message; a pending child stays hidden, is replaced on arrival and raises no error; ARCH §17.4 Errors row and plan §2.1 corrected | Treating a pending child as a resolver error | R1 §2.5.2, §2.7; R2 spike surface | Fork R3 | Approved 2026-10-20 |
| SD55 | Q02c: What payload does `line-a2ui-error` carry? | The generic A2UI form `{version, error: {code, surfaceId, message, …}}` with the `web_core` code | `VALIDATION_FAILED` with a computed JSON Pointer `path`; a hybrid of both | R2 §2.6; R1 §2.1, §2.7 | Fork R3 | Approved 2026-10-20 |
| SD56 | Q32a: What are the default limits for node count, depth and data-model size? | Finite defaults; a breach rejects the message with `line-a2ui-error`; the values come from a G4 stress test through an AM | `web_core` constants; unlimited unless configured | R1 §2.7, §4; ARCH §17.4 | Default R3 | Approved 2026-10-20 |
| SD57 | Q32b: How does the URL policy apply? | After resolution against the document base, to Image, Video and Audio URLs and `openUrl`; `data:` rejected | Allowing `data:` for images | R1 §2.6; R2 spike surface; R5 §2.2; ARCH §17.4 | Default R3 | Approved 2026-10-20 |
| SD58 | Q32c: What shape does the Markdown opt-in take? | A surface hook the consumer supplies; the consumer owns sanitising | A line-shipped renderer; plain text only | R1 §2.3; R6 §2.1; ARCH §17.4 | Default R3 | Approved 2026-10-20 |
| SD59 | Q59: What surface rendering details apply? | Live region "Content updated." plus an error sentence; `role="list"` on `line-stack` for List; Button text in a `<span>`; `building`/`retrying` → `aria-busy`, `failed` → inert | `<p>` for Button text | R2 §2.8, §6 Q3, Q4, Q8; R6 §2.1, §6 Q7 | Default R3 | Approved 2026-10-20 |
| SD60 | Q52: How does the reconciler treat template-list reorders? | Document the limit; revisit trigger a2ui#1745 | Keying by `componentId` plus data path; waiting for #1745 | R2 §2.8, §6 Q1; ARCH §17.4 | Default R3 | Approved 2026-10-20 |
| SD61 | Q44: What content rules govern the manifest? | `@fires` mandatory; tests filter on `privacy`, `static` and `inheritedFrom`; inherited static `formAssociated`; ARIA in the descriptor; `schemaVersion` as emitted; no analyser plugin | An ARIA plugin; a `schemaVersion` 2.1.0 plugin; a member-stripping plugin | R4 §2.3, §2.4, §2.6, §6 OQ1–OQ3, OQ6–OQ8 | Default R1 | Approved 2026-10-20 |
| SD62 | Q12: Which host keys are on the `mcp-apps.css` reference list? | The role-matched subset under a written rule. It holds 2 font families, 4 weights, the role-matched colours, and the radii, sizes and line heights that the scale map matches (§10 SD63). Every excluded key is listed with its reason | All 76 keys; the 71 colour, font and radius keys | R5 §2.3, §2.5, §6 Q1, Q3 | Fork R4 | Approved 2026-10-20 |
| SD63 | Q58: How do host scales align, and where is the bridge declared? | Nearest reference value; unmatched host keys leave the list; no declarations in nested `data-accent`/`data-gray` scopes, which fall back to line steps; G6 tests both scopes in three engines | A positional map; new roles; declaring in nested scopes | R5 §6 Q3, Q4 | Fork R4 | Approved 2026-10-20 |
| SD64 | Q24: What do the recipes pin from `@ag-ui/a2ui-middleware`? | An in-browser mock producer in the deployed story; an MDX server convention pinned to exactly 0.0.13; a Bun test that compares the pinned middleware with the mock | The MDX convention alone; the mock alone | R6 §2.1, §6 Q1, Q2; npm registry (`latest` 0.0.13 on 2026-10-20) | Default R4 | Approved 2026-10-20 |
| SD65 | Q23a: What does the AG-UI recipe do with `line-a2ui-error`? | Log it locally and send nothing; the recipe names the gap; revisit when the middleware ships an error path | An app-defined `forwardedProps.a2uiError` key; wait for upstream | R6 §2.1 | Fork R4 | Approved 2026-10-20 |
| SD66 | Q23b: What does the A2A recipe accept and target? | An array or a single message per DataPart; `application/json+a2ui` accepted beside `application/a2ui+json`; A2A v1.0 with `@a2a-js/sdk` 1.3.0; send `application/a2ui+json` with `[action]` | Array only; A2A v0.3 | R6 §2.2; ARCH §17.5 | Default R4 | Approved 2026-10-20 |
| SD67 | Q57: What are the MCP and SSE recipe conventions? | MCP: tool-result `EmbeddedResource` only, capabilities in `_meta.a2ui`, SDK v2 in MDX only. SSE: a named `end` event, capabilities in the query string | `_meta.ui.resourceUri`; an `extensions` entry; a closing message; capabilities in a header or first POST | R6 §2.3, §2.4, §6 Q6, Q9; ARCH §17.5 | Default R4 | Approved 2026-10-20 |
| SD68 | Q56: How does line://ui load into an MCP Apps View? | `vite-plugin-singlefile` first; a CDN listed in `resourceDomains` as the alternative; server authors list font origins; ARCH §17.6 condition stated | One path only | R5 §2.2, §6 Q6, Q7 | Default R4 | Approved 2026-10-20 |
| SD69 | Q55: Which ext-apps entry do the docs show? | ext-apps 2.x `./app-with-deps` | The main entry; 1.7.5; inline helper copies | R5 §2.1, §6 Q5; ARCH §17.6 | Default R4 | Approved 2026-10-20 |
| SD70 | Where does the D1 guide live? | One MDX file under `apps/storybook/stories/` | — | Phase 00 spec §6.G | Drafting | Pending Miguel |
| SD71 | How does the browser tier serve the landing page? | A third Playwright `webServer` runs `astro preview` on `apps/site/dist`; the port is left to the implementer | A build-time HTML check | R12 §6 Q3 | Drafting | Pending Miguel |
| SD72 | Q40: How does the landing page load components and guard registration? | A processed `<script>import</script>` per section, no Astro or Lit integration; a Playwright guard asserts every `line-*` is `:defined` in three engines | One shared module; a build-time HTML check; review only | R12 §2.1, §2.2, §6 Q3; MANIFESTO Principle 5 | Default R1 | Approved 2026-10-20 |
| SD73 | Q41: Unupgraded state, theme CSS scope and stylesheet delivery on the site? | Left to the S1 implementer and recorded in the PR | Fixing them in the spec | R12 §2.4, §2.5, §6 Q1, Q2, Q5 | Default R1 | Approved 2026-10-20 |
| SD74 | Which code of conduct text and contact does Z1 use? | Miguel supplies the text, its version and the contact | — | PRD §10; plan §7.4 | Drafting | Pending Miguel |
| SD75 | Do untouched packages get a changeset? | Every package gets a `minor` changeset so all nine reach `0.2.0` | Bumping only changed packages | plan §7.4 | Drafting | Pending Miguel |
| SD76 | What if Changesets bumps `line-genui` to a major through its peers? | P3 sets `onlyUpdatePeerDependentsWhenOutOfRange` through an AM row | Accepting a major | R9 §2.6 method | Drafting | Pending Miguel |
| SD77 | Which `@changesets/cli` major does Phase 1 use? | Stay on 2.x (2.31.1) | Move to 3.x | R9 §2.6 | Drafting | Pending Miguel |
| SD78 | Q21: Which runner makes zero axe violations a failing CI check? | Playwright with `@axe-core/playwright` 4.14.0 as the gate; `@storybook/addon-a11y` stays as the author panel | Storybook addon plus Vitest addon; Playwright with the addon removed | R8 §2.4; PRD §5.2 | Default R1 | Approved 2026-10-20 |
| SD79 | R2 default: Which axe ruleset does the gate run? | WCAG 2.0 and 2.1 A and AA tags | Other tag sets | R8 §2.4, §6 Q4 | Default R2 | Approved 2026-10-20 |
| SD80 | Which import map does the unpkg path document? | P6 extends the 14-entry `line-core` map with the `line-components` entries; the docs pin one version for every `@websublime/*` URL on a page | The `line-core` map alone | R9 §2.3 | Drafting | Pending Miguel |
| SD81 | Q27: Do component tests add a custom DOM snapshot serializer? | No DOM snapshots; tests assert parts, attributes, slots and events through queries; a normalised string snapshot with the built-in serializer is allowed | A custom serializer or `@open-wc/semantic-dom-diff`; Playwright screenshots as the default | Phase 00 spec §6.C.7, §11 Q2; PRD §5.2 | Default R1 | Approved 2026-10-20 |
| SD82 | Q32d: Where does the surface check required accessible names? | A descriptor check before render; a nameless node becomes a placeholder and raises `line-a2ui-error` | A DOM check after render; both | R2 §2.8, §6 Q5; ARCH §17.3 | Fork R2 | Approved 2026-10-20 |
| SD83 | How does the G6 key map break ties and settle borderline role calls? | The tie-break rule and the borderline calls B1–B11 in §6.G.6 | The alternatives in the §6.G.6 "Borderline calls" table | R5 §2.3, §2.4b; `packages/line-themes/src/aliases.css`; `packages/line-tokens/src/` | Drafting | Pending Miguel |
| SD84 | Which reset modules do Chip and AvatarGroup take (ARCH §14.7)? | `common` and `button`, because each renders an inner native `<button>` (§10 SD31) | `common` only | ARCH §14.7; R8 §6 Q1 | Drafting | Pending Miguel |
| SD85 | In which order do `mcp-apps.css` and the `line-themes` CSS load? | `mcp-apps.css` loads after the `line-themes` CSS; the docs state the order; a G6 browser test checks it | Leaving the order unstated | `packages/line-themes/src/aliases.css:6-7`; §6.G.6 | Drafting | Pending Miguel |
| SD86 | Which tasks must merge before each C1–C20 row? | The §6.C.4 Deps column. P7 lands before C1; C5 and C6 depend on C1; C11 depends on C10; C5–C20 depend on G1 and G5 | Only the plan §6 dependencies | plan §6; ARCH §13.1; §10 SD4, SD10 | Drafting | Pending Miguel |
| SD87 | Which task owns the exit sweep and the Phase 1 retrospective? | Task Z3, owned by the main session, depending on every other Phase 1 row | No task row | plan §7.4, §10 step 7 (`docs/plans/01-plan-core-primitives.md:570`, `:614`) | Drafting | Pending Miguel |
| SD88 | Q07: Decide the resolver loading mechanism now, or after more research? | R10 round 2 first (row 00-Z47); the mechanism settles OQ-C22 | Decide now from the contract; decide now on fetch-by-URL | R10 §3 P6, §6 Q3 | Fork R1 | Approved 2026-10-20 |

---

## 11. Open Questions

| ID | Question | Options | Blocks | Evidence |
|---|---|---|---|---|
| OQ-C22 | How do the `line-icons` reference resolvers load icons in a consumer bundle? | The template `import()` with a documented import map or bundler plugin; one literal `import()` per mapped name; `import.meta.glob` per set; fetching the SVG from a consumer-set base URL | C22 and C2. No other task waits on it. The spec moves to APPROVED only after it is settled (§10 SD88) | R10 §3 P6, §6 Q3; R10 round 2, `docs/research/01-research-icon-round2.md` (row 00-Z47, pending) |
| OQ-surface-manifest | Where do the G4 Storybook API docs for `<line-a2ui-surface>` come from? The element lives in `line-genui`, outside the manifest D8 ships (§7.3) | Hand-written MDX; a `line-genui` manifest | The G4 Storybook docs | plan §5.6 D8; §6.P.10; §7.3 |

- `sideEffects: false` on `line-icons` stays unless the OQ-C22 answer needs a change (§4.3; R10 §6 Q4).
- The `lucide-static` peer floor is re-checked by the C22 owner. The mapped names were checked against 1.16.0, 1.56.0 and 1.59.0, while `latest` is 1.60.0 (§4.3; R10 P4, P8; npm registry on 2026-10-20).

---

## 12. Amendments

PROCESS §3 requires that any change to this spec after approval lands as a row here, in the same commit as the change.

| ID | Date | Trigger | Change | Reason | Evidence |
|---|---|---|---|---|---|

*End of spec.*
