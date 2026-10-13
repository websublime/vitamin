# PHASE PLAN: Phase 01 — Core Primitives

**Status:** APPROVED — Miguel at the plan gate on 2026-10-13
**Author:** line://ui orchestrator (row 00-Z27)
**Date:** 2026-10-13
**Phase Version Target:** `line://ui` v0.2.0 (also called "Phase 1" in the PRD)
**Source PRD:** [`docs/PRD.md`](../PRD.md) (v0.8.17)
**Source Architecture:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) (v0.8.3)

> **What this document is.** A phase plan (PROCESS §1–§2, the lifecycle and gate rules). It sets scope, streams, dependencies, research targets, acceptance criteria and risks for Phase 1 (PRD §7.3, the Core Primitives phase).
>
> **What this document is NOT.** It is not a spec. The research notes and `docs/specs/01-spec-core-primitives.md` come after plan approval. The plan follows the PRD. Where the research note [`00-research-generative-ui.md`](../research/00-research-generative-ui.md) disagrees with the PRD, the PRD wins, because research is evidence (PROCESS §1).

---

## 1. Phase Overview

Phase 1 rests on two pillars.

1. **Agent-driven UI foundation.** This stream ships `@websublime/line-genui`, the 9th published package (PRD §6.1).
2. **Core primitives.** The phase ships 20 components in the `@websublime/line-components` umbrella.

The phase runs in a fixed order (PRD v0.8.17 §7.3).

1. The four validating components (Button, Icon, Stack, Separator) ship first.
2. Stream G follows on them and adds their descriptors.
3. The other 16 components follow, each with its descriptor in the same PR.

The site landing page dogfoods the Phase 1 components and is an exit criterion (PRD v0.8.17).

### 1.1 What the phase validates

PRD §7.3 lists what the phase validates.

- The architecture and the parts convention.
- The slot/part decision rule.
- The umbrella build pipeline with subpath exports per component.
- Bundle splitting.
- Automatic documentation.
- Agent-driven rendering through A2UI.

### 1.2 Inputs from Phase 00

| Input | State | Source |
|---|---|---|
| Retrospective hand-off item 1 (dependency refresh) | Done | Row `00-Z20` (#253), AM-064 (the dependency refresh amendment) |
| Retrospective hand-off item 2 (htmx rule, harness, guide) | Done | Row `00-Z17` (#252), AM-063 (the htmx rule C9 amendment) |
| Agent contract section with rules C1–C9 and every descriptor field | In the component spec template | Row `00-G4` (#231), AM-043 (the agent contract template amendment); C9 added by `00-Z17` |
| htmx Tests row | In the component spec template | [`COMPONENT-SPEC-TEMPLATE.md`](../specs/COMPONENT-SPEC-TEMPLATE.md) |
| htmx harness | Exists | `packages/line-core/__tests__/integration/htmx/` |
| htmx guide | Exists | `apps/storybook/stories/htmx.mdx` |
| `LineElement`, mixins, `LineMachineController`, reset sheets | Exist | `line-core` |
| Icon resolvers | Exist | `line-icons` |

- Hand-off item 3 (the genui stream) becomes the first pillar.
- Hand-off item 4 (the C1–C9 agent contract) needs no template work. In Phase 1 it becomes an obligation. Every component spec fills the Agent contract section, and the coherence review checks it.

---

## 2. Scope — In

### 2.1 Agent-driven UI foundation (`@websublime/line-genui`)

PRD §7.3 lists ten items.

1. Choose the projection technique in the Phase 1 research stage (R2), before the spec (ARCHITECTURE §17.4). The candidates are light-DOM adapter elements rendered through `@a2ui/web_core` `renderA2uiNode` and direct projection on the `web_core` models and binder. The outcome binds the renderer, and the spec designs one renderer on it.
2. Descriptor API, protocol-neutral Zod descriptors in `line-genui/src/catalog/` (§17.3).
3. `line` and `basic` catalog emitters for A2UI v0.9.1 (§17.3).
4. Frontend-tool JSON Schema emitter, `{name, description, parameters}` (§17.3, PRD Appendix D).
5. `<line-a2ui-surface>`, light DOM, built on `@a2ui/web_core`, with preview status (§17.4, §17.7).
6. CEM drift test and descriptor coverage test (§17.3).
7. MCP Apps theming bridge `@websublime/line-themes/hosts/mcp-apps.css` (§17.6). The Phase 1 spec settles the fallback strategy for `line-tokens` primitives.
8. Transport recipes in Storybook for AG-UI, A2A, MCP and SSE (§17.5).
9. Layer edges `line-genui -> line-core`, `line-components`, `line-icons` in the Phase 1 spec edge table and in `ALLOWED_EDGES` (§17.1).
10. `infra-supervisor` bootstraps the npm trusted publisher for `@websublime/line-genui` in the AM-038 order (the Phase 00 spec's trusted publisher bootstrap amendment) before its first release.

PRD Appendix D defines these surfaces.

| Surface | Content | Status |
|---|---|---|
| `@websublime/line-genui/catalog` | Descriptors, the `line` catalog, the `basic` catalog implementations, emitters; no DOM | Normal policy (PRD §7.1) |
| `@websublime/line-genui/catalog.json` | Emitted JSON of the `line` catalog | Normal policy |
| `@websublime/line-genui/a2ui` | Session and `<line-a2ui-surface>` | Preview |
| `@websublime/line-themes/hosts/mcp-apps.css` | CSS-only MCP Apps theming bridge | Normal policy |

PRD Appendix D and ARCHITECTURE §17.7 set the preview policy.

- `@websublime/line-genui/a2ui` may change in any minor release.
- `@websublime/line-genui/a2ui` sits outside the PRD §7.1 breaking-changes policy until it targets a final A2UI v1.0.
- The agent contract, the descriptor API and both catalogs follow the normal PRD §7.1 policy.

The package has four dependency rules.

- `line-genui` depends on `line-core` (ARCHITECTURE §17.1).
- `line-components` and `line-icons` are peers, loaded lazily (§17.1, §12).
- No package depends on `line-genui` (§17.1).
- `line-genui` pins `@a2ui/web_core` exactly, because upstream ships breaking changes in minor versions (§17.7).

ARCHITECTURE §17.4 sets the renderer rules.

| Topic | Rule |
|---|---|
| Render root | Light DOM, so document `::part()` rules reach the rendered elements |
| Loading | Lazy `import()` through each descriptor's `load()`; no eager `define()` |
| Composition | The surface creates elements by tag and wires children through slots |
| Events | `line-a2ui-action` and `line-a2ui-error` |
| Errors | Every `web_core` throw is caught and replaced by an inert placeholder |
| Theme | Agent theme hints are ignored by default; the host owns styling |
| Text | Plain text by default; Markdown only through an opt-in sanitising renderer |
| URLs | A policy hook with the default allowlist `https:`, `http:`, `mailto:`, `tel:`; `requiresUserActivation` is honoured |
| Limits | Configurable maximum node count, depth and data-model size |
| Accessibility | One live region per surface, `aria-busy` during batches, no focus moves on agent updates, stable ids, required names validated |

ARCHITECTURE §17.3 maps these basic catalog types in Phase 1.

| A2UI basic component | line://ui target |
|---|---|
| Text | Native `<p>`, `<h1>`–`<h5>`, `<small>` by `variant` |
| Image | Native `<img>` behind the URL policy; `variant: "avatar"` maps to Avatar |
| Icon | `<line-icon>` with A2UI icon names mapped to a `line-icons` resolver |
| Video, AudioPlayer | Native `<video>` and `<audio controls>` |
| Row, Column, List | `<line-stack>` |
| Divider | `<line-separator>` |
| Button | `<line-button>` |

### 2.2 Core primitives (20 components)

| Component | Zag.js (PRD §7.3) | Entrypoint (ARCHITECTURE §12) |
|---|---|---|
| Button | Custom | `./button` |
| IconButton | Custom | `./icon-button` |
| ButtonGroup | Static | `./button-group` |
| Alert | Static | `./alert` |
| Chip | Static | `./chip` |
| Badge | Static | Spec settles by the §12 family rule |
| Avatar | Static | `./avatar` |
| AvatarGroup | Custom | `./avatar-group` |
| Separator | Static | Spec settles by the §12 family rule |
| Visually Hidden | Static | Spec settles by the §12 family rule |
| Portal | Static | Spec settles by the §12 family rule |
| Icon | Static | `./icon` |
| Kbd / Shortcut | Static | Spec settles by the §12 family rule |
| Skeleton | Static | Spec settles by the §12 family rule |
| Presence | Pre-built | `./presence` |
| Stack | Static | Spec settles by the §12 family rule |
| Grid | Static | Spec settles by the §12 family rule |
| Center | Static | Spec settles by the §12 family rule |
| Aspect Ratio | Static | Spec settles by the §12 family rule |
| Spinner | Static | `./spinner` |

- PRD §7.3 names Button, Icon, Stack and Separator as the validating set, and the plan gate confirmed it (O2.b (a)). They ship first, and stream G validates on them.
- The PRD says "From then on, every component ships its descriptor in the same PR".

### 2.3 Component specs and the agent contract

- Each component gets one spec at `docs/specs/NNNN-<component>.md`, numbered by its PRD §4 spec link (for example `0002-button.md`, `0022-spinner.md`).
- Each spec is APPROVED before code (PRD §8.3).
- Each spec fills the Agent contract section (PRD §8.1, ARCHITECTURE §17.2–§17.3).
- Each spec fills its row in [`COMPETITIVE-COMPONENT-ANALYSIS.md`](../COMPETITIVE-COMPONENT-ANALYSIS.md), per AM-048 (the per-component competitive fill amendment).

### 2.4 htmx native paths

- The template's htmx Tests row applies to value-bearing or compound components (rule C9).
- C9 says ButtonGroup and AvatarGroup are not compound.
- Button is value-bearing only if its descriptor binding map names a value prop.
- The htmx row may apply to no Phase 1 component. Each component spec decides, and it marks the row `n/a` with a reason when the row does not apply.

### 2.5 Icon surface

- `<line-icon>` ships in Phase 1.
- The `line-icons` registry gains its Phase 1 subpaths `./registry` and `./resolvers/*` (PRD §6.2 note, Phase 00 spec §6.E).
- The A2UI basic `Icon` maps A2UI icon names to a `line-icons` resolver (ARCHITECTURE §17.3).

### 2.6 Platform and release

- Scaffold `packages/line-genui` with `exports`, `files` and `repository`.
- Add the layer edges (PRD item 9).
- Extend publish and `verify-pack` coverage to the 9th package.
- Bootstrap the trusted publisher (PRD item 10, AM-038 order).
- Verify bundle splitting (PRD exit criterion, ARCHITECTURE §12 `sideEffects` contract).
- Verify CDN delivery through unpkg and jsDelivr, which PRD §1.7 promises "from Phase 1 onwards".
- Add a mechanism for the zero-axe-violation criterion. Today axe runs only through Storybook `@storybook/addon-a11y`, and no Playwright axe tier exists.
- Add a code of conduct "before Phase 1 / v0.2.0" (PRD §10). No `CODE_OF_CONDUCT` file exists today.

### 2.7 Release target

- Phase 1 ships `v0.2.0` as a minor release (PRD §7.1, changeset rule in PROCESS §6).
- `line-genui` is a new package at `0.0.0`. A `minor` changeset on it yields `0.1.0`, so the first `line-genui` version is a spec question (§5.5).

### 2.8 Site landing page

- `apps/site/src/pages/index.astro` is a placeholder at `https://line-ui.websublime.com`.
- The Phase 00 plan (its O4) shipped the scaffold only and left full landing content to Phase 1.
- The landing page (hero, value proposition, features, Storybook link) is built with Phase 1 line components and is an exit criterion (O3 (b), PRD v0.8.17).
- The landing page depends on the components it uses.
- PRD §5.3 lists the full site structure.

### 2.9 TypeScript 7

- Phase 1 moves the workspace from `typescript ^5.9.3` to 7.x (O1 (c)). npm `latest` is 7.0.2 on 2026-10-13.
- R11 verifies the toolchain on 7.x first. A blocker found by R11 returns the work to the plan (PROCESS §2).
- The PR that performs the upgrade (P8) updates every live document that states TypeScript 5 in one commit. These documents are `CLAUDE.md` Tech Stack, `.claude/agents/webcomponents-supervisor.md` lines 15 and 72, and the Phase 00 spec §1 diagram line 74 and §6.A.3 line 444 through an `AM-nnn`.
- After that commit, a grep for the old framing returns zero live hits (PROCESS §3).
- The Phase 00 plan keeps "TypeScript 5.x" as Phase 00 record.

---

## 3. Scope — Out

- Phase 2+ components (PRD §7.4 onward) and the basic-catalog types they bring (TextField, CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs, Modal, Card; ARCHITECTURE §17.3).
- An A2UI v1.0 emitter stays out until v1.0 is final (§17.3).
- ARCHITECTURE §17.8 items stay out, each with its revisit trigger:

| Item | Decision | Trigger to revisit |
|---|---|---|
| WebMCP for form-associated elements | Defer | WebMCP spec issue #94 resolved and a second engine signals support |
| `<line-mcp-app-frame>` | Defer | line://ui targets chat hosts; needs a sandbox-proxy origin and a security review |
| Server-side A2UI → `<line-*>` HTML | Defer | A Phase 1+ spec takes it up; the H1 htmx spike informs it without deciding it |
| Model-authored `<line-*>` markup | Reject | The Sanitizer API reaches Baseline and an allowlist story exists |
| json-render and OpenUI renderers | Out of scope | Upstream ships a web-components renderer |
| Headless chat primitives | Separate catalogue question | A product decision |
| Dev-time AI (Storybook 11 MCP, llms.txt) | Schedule with Storybook 11 | Storybook 11 stable |

- Transport code stays out. Transports exist as Storybook recipes only (§17.5).
- `LineHtmxElement` stays deferred until after 1.0 (retrospective H1 outcome, PRD v0.8.15).
- SSR/SSG investigation comes after Phase 1 (PRD §1.7, MANIFESTO Out of Scope).
- `line-form` and cross-field validation come after 1.0.

---

## 4. High-Level Task Breakdown

### 4.0 Streams and owners

| Stream | Name | Owner |
|---|---|---|
| G | Agent-driven UI foundation (`line-genui`) | webcomponents-supervisor |
| P | Platform and release (9th package, edges, publish, trusted publisher, bundle splitting, CDN, axe tier) | infra-supervisor |
| C | Core primitives (20 components, spec + implementation + descriptor + stories + changeset) | webcomponents-supervisor |
| D | Cross-cutting documentation (agent-driven UI guide, recipes index, Getting Started updates) | webcomponents-supervisor |
| S | Site landing page (dogfoods the Phase 1 components; exit criterion per O3 (b)) | Proposal: webcomponents-supervisor for content, infra-supervisor for deploy changes |
| Z | Repo-wide (code of conduct, process alignment) | Main session / per row |

PROCESS §4 assigns owners by the Phase 00 stream letters (A–H), so it needs an update when the Phase 1 ledger is created (§10).

### 4.1 Stream G — agent-driven UI foundation

The projection technique (PRD §7.3 item 1) is research item R2 (§5.1), so stream G starts with the descriptor API.

| Task | Content | PRD §7.3 item |
|---|---|---|
| G1 | Descriptor API | 2 |
| G2 | `line` and `basic` catalog emitters (A2UI v0.9.1) | 3 |
| G3 | Frontend-tool JSON Schema emitter | 4 |
| G4 | `<line-a2ui-surface>` (preview) | 5 |
| G5 | CEM drift test and descriptor coverage test | 6 |
| G6 | MCP Apps bridge `line-themes/hosts/mcp-apps.css`; the spec settles the `line-tokens` primitive fallback (ARCHITECTURE §17.6) | 7 |
| G7 | Transport recipes in Storybook (AG-UI, A2A, MCP, SSE); recipes pin middleware versions | 8 |

Stream G also writes the descriptors of Button, Icon, Stack and Separator.

### 4.2 Stream P — platform and release

| Task | Content |
|---|---|
| P1 | Scaffold `packages/line-genui` |
| P2 | Layer edges in the Phase 1 spec edge table and in `ALLOWED_EDGES`; `scripts/lint-layers.mjs:59–68` has 8 entries today, and `dependencies` and `peerDependencies` both count |
| P3 | Publish, `verify-pack` and Changesets coverage of the 9th package |
| P4 | Trusted publisher bootstrap (AM-038 order) before the first `line-genui` release |
| P5 | Bundle-splitting verification |
| P6 | CDN delivery check (unpkg, jsDelivr) |
| P7 | axe-core tier for the zero-violation exit criterion |
| P8 | TypeScript 7.x upgrade (O1), after R11 and before C1 |

### 4.3 Stream C — core primitives

- C1–C4 cover the validating components Button, Icon, Stack and Separator (O2.b (a)). They ship first, before stream G, without descriptors, and stream G adds their descriptors.
- C5–C20 cover the remaining 16 components. Each ships its descriptor in the same PR.
- Each row runs the same sequence.
  1. Component spec APPROVED.
  2. Implementation.
  3. Descriptor in the same PR (C5–C20; stream G writes the C1–C4 descriptors).
  4. Storybook docs.
  5. Changeset.
  6. CEM entry.
- Each component passes the 8-point checklist of PRD §5.2.

### 4.4 Stream D — cross-cutting documentation

- Stream D writes an agent-driven UI guide.
- Stream D writes a recipes index for the transport recipes.
- Stream D updates Getting Started for `line-genui` and the Phase 1 components.

### 4.5 Stream S — site

- Stream S builds the landing page (hero, value proposition, features, Storybook link) with Phase 1 line components (O3 (b)).
- Each part of the page starts after the components it uses ship.

### 4.6 Stream Z — repo-wide

- Z1 adds the code of conduct (PRD §10).
- Z2 aligns PROCESS §4 and the `CLAUDE.md` ledger pointer with the Phase 1 streams.
- The O4 items are Phase 00 ledger rows `00-Z28` (O4.a, class `decision`), `00-Z29` (O4.b, `blocked` until the Biome release) and `00-Z30` (O4.c, class `amendment`).
- These rows do not wait for the Phase 1 ledger.

---

## 5. External Dependencies & Research Targets

PROCESS §2 requires one research note per item, at `docs/research/01-research-<slug>.md`.

### 5.1 A2UI and agent-driven UI

| Item | Research target |
|---|---|
| R1 A2UI v0.9.1 and `@a2ui/web_core` | Current version (0.13.0 on 2026-10-13; the research note of 2026-10-06 saw 0.12.0), its `zod` and `lit` ranges, the catalog meta-schema, common-type schemas, `renderA2uiNode` vs models/binder, every throw path, A2UI v1.0 status |
| R2 Projection technique evidence | The research note §6 spike exit questions cover slot assignment, layout, the accessibility tree, document `::part()` reach, Law 6 bundle analysis, throw paths, meta-schema validation, live-region/focus policy under axe and a screen reader, and gzipped weight. The research stage produces this evidence, and the note states the choice the spec builds on (O2.c (a)) |
| R3 Descriptor API and emitters | Zod 3 sharing with `web_core`, Zod → JSON Schema for frontend tools, provider limits (no `$ref`/`oneOf` beyond common types, descriptions ≤ 1024 chars) |
| R4 Custom Elements Manifest | Analyser output for Lit components, the C7 JSDoc tags, the missing `formAssociated` and ARIA metadata |
| R5 MCP Apps | ext-apps SDK version, the standard host variable reference list (ARCHITECTURE §17.9), the primitive fallback strategy (§17.6) |
| R6 Transports | AG-UI 1.0 and the `@ag-ui/a2ui-middleware` version, A2A DataPart, MCP EmbeddedResource, the pins the recipes will use |

### 5.2 Components and platform

| Item | Research target |
|---|---|
| R7 Zag.js and machines | `@zag-js/presence` (Presence is pre-built) through `LineMachineController`; custom machines for Button, IconButton, AvatarGroup (ARCHITECTURE §13.1–§13.2) |
| R8 Accessibility | WAI-ARIA patterns for the 20 components; the axe-core tier (Playwright vs Storybook); the §17.9 question on exposing `FormAssociated` internals for `ElementInternals` ARIA |
| R9 Packaging | Umbrella subpath exports and `sideEffects`, bundle-splitting verification, CDN delivery (unpkg, jsDelivr) of ESM builds, the per-component soft size target (< 5 KB gzipped, PRD §1.7), npm trusted publishing for a new package and its first version |
| R10 Icon | A2UI basic icon names and their mapping to the Lucide and Phosphor resolvers; the `line-icons` Phase 1 subpaths |
| R11 TypeScript 7.x toolchain | Verify `tsc -b`, `vite-plugin-dts` 5.1.2 (through `unplugin-dts` 1.1.2 and `@microsoft/api-extractor`), the CEM analyser 0.11.0 (it bundles its own `typescript ~5.4.2`) and Storybook 10 on 7.x; a blocker returns the work to the plan (PROCESS §2) |
| R12 Site dogfooding | Astro 7 static output with the Phase 1 components, client-side upgrade of the Phase 1 components |

### 5.3 Upstream facts the research must re-check

- `@a2ui/web_core` moved from 0.12.0 to 0.13.0 within one week. R1 re-verifies the version before the spec pins it.
- `npm view @a2ui/web_core@0.13.0` on 2026-10-13 lists `lit ^3.3.3`, `zod ^3.25.76`, `@lit/context ^1.1.6` and `zod-to-json-schema ^3.25.2`. The repo also declares `zod ^3.25.76`, while Zod `latest` is 4.6.7.

### 5.4 Decisions at the plan gate (Miguel, 2026-10-13)

#### O1 TypeScript major

The repo and npm supply these facts.

- Root `package.json` has `typescript ^5.9.3`.
- Phase 00 spec §6.A.3 says "latest 5.x" (spec line 444, diagram line 74).
- `CLAUDE.md` says "TypeScript 5+".
- npm on 2026-10-13 lists 5.9.3 as the last 5.x (2025-09-30) and 6.0.3 as the last 6.x (2026-04-16).
- npm `latest` is 7.0.2 (2026-07-08), which ships native per-platform binaries.

| Option | What it decides | Resolution |
|---|---|---|
| (a) | Stay on TypeScript 5.x | Rejected |
| (b) | Move to TypeScript 6.x | Rejected |
| (c) | Move to TypeScript 7.x | Chosen — Miguel, 2026-10-13 |

- R11 supplies the evidence.
- PRD §2 names no TypeScript major and sets "All dependencies — Latest stable versions".
- Row `00-Z20` (AM-064) applied that row as the latest version within each current major.
- Option (c) matches the literal PRD §2 row. Options (a) and (b) rely on the AM-064 reading.
- A move still changes `CLAUDE.md`, `.claude/agents/webcomponents-supervisor.md`, and the Phase 00 spec §1 diagram and §6.A.3 (through an `AM-nnn`) in one commit (PROCESS §3).
- PRD §2 needs no change, because its "Latest stable versions" row already covers 7.x.

#### O2 Stream order and the validating set

| Sub-question | Option | What it decides | Resolution |
|---|---|---|---|
| O2.a Order | (a) | Stream G first, as PRD §7.3 stated; G1 runs on throwaway elements, then G2–G5, then Button, Icon, Stack, Separator with descriptors, then the other 16 | Rejected |
| O2.a Order | (b) | The four validating components first, then stream G on real components, then the 16; this contradicts "This stream opens Phase 1" and needs a PRD revision (PRD v0.8.17) | Chosen — Miguel, 2026-10-13 |
| O2.a Order | (c) | Interleaved; G1 and G2 first, then the four components with descriptors, then G3–G5 validated on them, then the 16 | Rejected |
| O2.b Validating set | (a) | Keep Button, Icon, Stack, Separator; each covers a Phase 1 basic-catalog type (Button, Icon, Row/Column/List, Divider) | Chosen — Miguel, 2026-10-13 |
| O2.b Validating set | (b) | Another set; needs a PRD revision | Rejected |
| O2.c G1 evidence | (a) | In the research stage (R2), so the spec designs one renderer; this moves the decision out of the stream and needs a PRD §7.3 item 1 and ARCHITECTURE §17.4 revision in the same commit as the plan (PROCESS §3; PRD v0.8.17, ARCHITECTURE v0.8.3) | Chosen — Miguel, 2026-10-13 |
| O2.c G1 evidence | (b) | As the first ledger task, so the spec states both candidates and an `AM-nnn` records the outcome | Rejected |

The O2 option texts keep the task numbering of the draft, in which G1 was the projection task. §4.1 renumbers stream G after the decision.

#### O3 Site scope

| Option | What it decides | Resolution |
|---|---|---|
| (a) | Landing page only (hero, value proposition, features, Storybook link), parallel and outside the exit criteria, where PRD §7.3 put it before v0.8.17 | Rejected |
| (b) | A landing page that dogfoods the Phase 1 components (PRD §5.3 "line://ui components (dogfooding)") and counts as an exit criterion; needs a PRD revision to add the criterion (PRD v0.8.17) | Chosen — Miguel, 2026-10-13 |
| (c) | The full PRD §5.3 structure (landing, docs, getting started, theming showcase, changelog, Storybook link); it stays outside the exit criteria and needs a PRD §7.3 revision of the "Parallel" line, because the PRD names only a landing page | Rejected |

#### O4 Phase 00 residual risks

Each item has two options, an own ledger row or a plan risk entry. Miguel asked for one recommendation per residual risk.

| Item | Fact | Options | Recommendation | Resolution |
|---|---|---|---|---|
| O4.a `deploy-site.yml` install scripts | The Install step runs `bun install --frozen-lockfile` without `--ignore-scripts` in the same job whose Deploy step holds `CLOUDFLARE_API_TOKEN` and runs `bun x --no-install wrangler pages deploy dist` from `node_modules`. The token sits only in the Deploy step `env`, but an install script can rewrite code that step runs. Default-trusted packages with install scripts today are `esbuild` and `workerd`. AM-067 (row `00-Z26`, Miguel's decision on 2026-10-13) applied `--ignore-scripts` to the release and snapshot workflows and rejected extending it to `deploy-site.yml`. | Own row, or plan risk entry | Own Z row, class `decision`, because it reopens an AM-067 choice and changes `.github/`. It lands before `line-genui` adds `@a2ui/web_core` and its dependencies to the workspace install. One option for that row splits build and deploy into two jobs with `--ignore-scripts` in the deploy job, the shape `deploy-storybook.yml` already uses. | Own row chosen (Miguel, 2026-10-13); ledger row `00-Z28`, class `decision`. The plan risk entry was rejected. |
| O4.b Biome `--vcs-use-ignore-file=false` | `scripts/generate-palettes.mjs` and `scripts/generate-role-maps.mjs` pass the flag so Biome 2.5.15 can format a temp output dir outside the repo root. Without it Biome panics (biomejs/biome#12158). PR biomejs/biome#11869 fixes it; it merged on 2026-09-21, and a maintainer wrote on 2026-10-05 "Will be available in the next release". npm `latest` is still 2.5.15 on 2026-10-13. | Own row, or plan risk entry | Keep it in the plan as a watch item with the trigger "a Biome release after 2.5.15 that contains PR #11869". The row is created when the trigger fires, because a row created now would sit blocked. | Own row chosen now (Miguel, 2026-10-13) over the recommended watch item; ledger row `00-Z29`, status `blocked` until a Biome release after 2.5.15 ships PR #11869. |
| O4.c Stale Bun version in the Phase 00 spec | `docs/specs/00-spec-design-system.md` line 2009 (§6.F.5 publish path, step 4) says "Bun 1.3.14 fills `workspace:` ranges from the versions in `bun.lock`". The repo runs Bun 1.4.3 (`.bun-version`, `engines.bun >=1.4.3`). Miguel reports the behaviour persists on 1.4.3 (unverified; the O4.c row runs a Bun 1.4.3 probe). | Own row, or plan risk entry | Own Z row now, class `amendment` (one factual `AM-nnn` in the Phase 00 spec, no code, a Bun 1.4.3 probe as evidence). The Phase 1 plan cannot amend the Phase 00 spec, and `CLAUDE.md` asks to fix drift in the session it is found. | Own row chosen now (Miguel, 2026-10-13); ledger row `00-Z30`, class `amendment`. The plan risk entry was rejected. |

### 5.5 Spec-level questions

These questions belong to the Phase 1 spec. They are neither research items nor plan forks.

- Should a session advertise the basic catalog id by default before basic coverage is complete (ARCHITECTURE §17.9)?
- Which components carry `agentExposed: false`? Portal, Presence and Visually Hidden are the candidates.
- Which MCP Apps host variables form the `mcp-apps.css` reference list (§17.9)?
- The utility-class decision is "Deferred to Phase 1 spec" (PRD §9.13).
- The spec fixes the first `line-genui` version (§2.7).
- Each component spec fills its htmx row (§2.4).
- The spec decides whether DOM snapshots need a custom serializer (Phase 00 spec §6.F.3 snapshot note).

---

## 6. Task Dependencies

These dependencies are fixed.

```
P1 scaffold line-genui ──────────────► G code (G1–G7)
P2 layer edges ──────────────────────► line-genui declares dependencies/peers
R11 TypeScript 7.x toolchain ────────► P8 TypeScript 7.x upgrade ──► C1
R2 projection evidence ──────────────► spec designs one renderer
component spec APPROVED ─────────────► component implementation (C1–C20)
C1–C4 shipped ───────────────────────► stream G validates on them (PRD §7.3)
CEM entries of real components ──────► G5 drift and coverage tests
components the landing page uses ────► S landing page sections
P4 trusted publisher ────────────────► first line-genui release
P7 axe tier ─────────────────────────► evidence for the zero-axe criteria
```

The plan gate chose this sequence (O2.a (b), O2.c (a)).

1. Research (R1–R12, including the R2 projection evidence).
2. Spec.
3. P1 scaffold, P2 edges and P8 TypeScript 7.
4. C1–C4 (Button, Icon, Stack, Separator), without descriptors.
5. Stream G (G1–G7), including the descriptors of C1–C4.
6. C5–C20, each with its descriptor in the same PR.

- Stream S builds each part of the landing page after the components it uses ship.
- P4 lands before the first `line-genui` release.
- P7 lands before the axe criteria can be evidenced.

---

## 7. Acceptance Criteria for Phase 1

The plan mirrors the 17 PRD §7.3 exit criteria in their wording. Plan-level additions are in *italics*.

### 7.1 Components

- [ ] All listed components pass the 8-point test checklist (§5.2)
- [ ] Storybook documentation complete for every component
- [ ] Zero axe-core violations
- [ ] CEM manifest generated and verified
- [ ] Changeset entry for every component
- [ ] *Every Phase 1 component spec is APPROVED before code, with the Agent contract section filled (hand-off item 4).*
- [ ] *Every component fills the htmx Tests row per C9 (harness run, or `n/a` with a reason).*
- [ ] *Every component fills its row in `docs/COMPETITIVE-COMPONENT-ANALYSIS.md`.*
- [ ] *Each component's gzipped size is measured and reported against the < 5 KB soft target (not gating, PRD §1.7).*

### 7.2 Agent-driven UI

- [ ] Every Phase 1 component in `@websublime/line-components` has an agent descriptor (exposed, or flagged `agentExposed: false` with a reason), and the CEM drift and coverage tests pass
- [ ] `@websublime/line-genui/catalog.json` (the `line` catalog) validates against the A2UI v0.9.1 catalog meta-schema
- [ ] The Phase 1 subset of the `basic` catalog is registered under the A2UI basic catalog id, and unmapped basic types render an inert placeholder and raise `line-a2ui-error`
- [ ] The frontend-tool schemas validate as JSON Schema, use no `$ref` or `oneOf` beyond the A2UI common types, and keep every description at or under 1024 characters
- [ ] `@websublime/line-themes/hosts/mcp-apps.css` maps every MCP Apps standard host colour, font and border-radius variable on the reference list that the Phase 1 spec fixes, each to a line theme alias or token, and passes `lint-layers`
- [ ] `<line-a2ui-surface>` renders every agent-exposed Phase 1 component from A2UI messages with zero axe-core violations, and document `::part()` rules apply to the rendered elements
- [ ] Importing `@websublime/line-genui/catalog` defines no element; importing `@websublime/line-genui/a2ui` defines only `line-a2ui-surface`

### 7.3 Documentation

- [ ] Storybook holds one recipe per transport (AG-UI, A2A, MCP, SSE)
- [ ] The site landing page (hero, value proposition, features, Storybook link; §5.3) is built with Phase 1 line://ui components and is live at `line-ui.websublime.com`

### 7.4 Platform and release

- [ ] Bundle splitting verified — families and independents work as documented
- [ ] `scripts/lint-layers.mjs` carries the `line-genui` edges and passes
- [ ] The npm trusted publisher for `@websublime/line-genui` exists before its first release
- [ ] *CDN delivery through unpkg and jsDelivr is verified (PRD §1.7).*
- [ ] *The workspace builds, type-checks and emits declarations on TypeScript 7.x (O1).*
- [ ] *The Phase 1 spec records the utility-class decision (PRD §9.13).*
- [ ] *Every package is released at `0.2.0` through `release.yml` with provenance, and `line-genui` gets its first release per the spec.*
- [ ] *A code of conduct is present before `v0.2.0` (PRD §10).*
- [ ] *Rows `00-Z28` and `00-Z30` are done, and row `00-Z29` is done or still blocked on the Biome release.*
- [ ] *The exit sweep runs before the last rows land, and the Phase 1 retrospective is written with a hand-off to Phase 2 (retrospective lesson 9).*

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A2UI churn; `web_core` ships breaking minors (0.12.0 → 0.13.0 within a week) | High | High | Pin exactly (ARCHITECTURE §17.7), keep a version seam in `line-genui`, re-verify in R1 |
| Zod split; the repo and `web_core` declare `zod ^3.25.76` while Zod `latest` is 4.6.7, and descriptors share Zod types with `web_core` | Medium | High | Keep the repo on Zod 3 until `web_core` moves (relies on the same AM-064 reading of PRD §2); R3 checks the sharing |
| The TypeScript 7.x move (O1) breaks the toolchain | Medium | High | R11 verifies 7.x first; a blocker returns to the plan (PROCESS §2) |
| Catalog quality becomes the agent UX | High | Medium | Descriptor descriptions reviewed in each component spec; research note §7 |
| Accessibility of agent-built trees is under-specified upstream | Medium | High | Renderer accessibility rules (§17.4), R2 screen-reader check, P7 axe tier |
| Prompt injection through action labels | Medium | High | Agent strings stay untrusted; plain text by default (§17.4) |
| Scope creep toward a chat platform | Medium | Medium | Hold the §3 out-of-scope list; headless chat primitives stay a product decision |
| happy-dom gaps hide browser bugs | High | Medium | The browser tier is the source of truth (retrospective lesson 2) |
| Bugs show only in built output | Medium | High | Test the built artifact (retrospective lesson 5) |
| Eager imports in the catalog or surface regress Law 6 | Medium | High | Lazy `load()` per descriptor; P5 bundle-splitting check; the "defines no element" exit criterion |
| The catalog schema weight grows per descriptor | Medium | Medium | Measure the emitted catalog size in R2/R3 and per component PR |
| A2UI v1.0 goes final mid-phase | Low | Medium | The v1.0 emitter stays out of scope (§3); the surface keeps preview status |
| O4.a install scripts in `deploy-site.yml` | Medium | High | Ledger row `00-Z28` (§5.4 O4.a) |
| O4.b Biome flag workaround | Low | Low | Ledger row `00-Z29`, blocked until the Biome release (§5.4 O4.b) |
| O4.c stale Bun version in the Phase 00 spec | Low | Low | Ledger row `00-Z30` (§5.4 O4.c) |

---

## 9. Deliverable Summary

- Phase 1 ships "20 components and `line-genui`" (PRD §7.3) as `v0.2.0`.
- Every component meets the agent contract.

---

## 10. Next Steps After This Plan is Approved

1. The research stage writes one note per §5 item at `docs/research/01-research-<slug>.md`. Research that contradicts the plan returns to a plan and PRD revision before spec work (PROCESS §2).
2. Until the Phase 1 ledger exists, each opening PR (each research note, the spec, the coherence review) gets its own row in stream Z of the Phase 00 ledger.
3. The spec `docs/specs/01-spec-core-primitives.md` is grounded in research only. Component specs `docs/specs/NNNN-<component>.md` are written just-in-time (PRD §8.2).
4. The coherence review runs 3 clean rounds with the lenses plan↔PRD, spec↔research and spec↔ARCHITECTURE (PROCESS §5).
5. The ledger `docs/plans/01-tasks-core-primitives.md` follows the spec's streams. In the same change, PROCESS §4 stream ownership and the `CLAUDE.md` ledger pointer follow the Phase 1 streams.
6. Work is delegated to the supervisors, the exit sweep runs, and the retrospective `docs/retrospective/01-<slug>.md` closes the phase.

---

## 11. Resolved Questions (2026-10-13)

| Id | Question | Resolution |
|---|---|---|
| O1 | Which TypeScript major does Phase 1 use? | TypeScript 7.x (7.0.2), after R11 verifies the toolchain |
| O2.a | In which order do stream G and the validating components run? | Button, Icon, Stack and Separator first, then stream G on them, then the other 16 |
| O2.b | Which components form the validating set? | Button, Icon, Stack and Separator |
| O2.c | Where is the projection technique evidence produced? | In the research stage (R2), so the spec designs one renderer |
| O3 | What is the site scope in Phase 1? | A landing page that dogfoods the Phase 1 components and is an exit criterion |
| O4.a | How is the `deploy-site.yml` install-script risk handled? | Ledger row `00-Z28`, class `decision` |
| O4.b | How is the Biome `--vcs-use-ignore-file=false` workaround tracked? | Ledger row `00-Z29`, blocked until a Biome release after 2.5.15 ships PR #11869 |
| O4.c | How is the stale Bun version in the Phase 00 spec fixed? | Ledger row `00-Z30`, class `amendment` |
