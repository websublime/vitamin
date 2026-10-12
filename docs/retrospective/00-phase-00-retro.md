# Phase 00 retrospective

## Summary

- Phase 00 built the line://ui foundation and shipped no UI component, as Manifesto Law 6 and plan §2 require.
- It delivered 8 published packages, 2 apps and 6 GitHub Actions workflows.
- `0.1.0` of all 8 packages reached npm `latest` on 2026-10-06 through `release.yml` with SLSA provenance. Later Phase 00
  changes shipped as `0.1.x` patches.
- The HTMX spike ended with the exploratory exit (section 00-H1 below).
- The exit date of record is **2026-10-12**. On that date an exit sweep checked every spec §9, plan §7 and PRD §7.2
  criterion in three slices. The local slice ran every command once on `main` after the 00-H1 merge (`aa3f554`). The
  static slice read the files, and the remote slice queried GitHub Actions, npm and the deployed URLs.
- Row `00-Z19` closed the gaps the sweep found (spec AM-062, PRD v0.8.14, plan §7.5 and §7.6). Row `00-C18` (AM-061)
  added the missing `SEMANTIC_MAP` test.

## Exit criteria

Each spec §9 bullet has one row. `S9.x.y` is bullet `y` of spec §9.x in document order. Plan-only rows (`P7.x.y`)
and PRD-only rows (`PRD.n`) follow. "Pass" means the evidence was observed on 2026-10-12.

| ID | Criterion | Status | Evidence |
|---|---|---|---|
| S9.1.1 | 8 packages with `package.json`, `tsconfig.json`, `src/`, `README.md` | Pass | `ls -d packages/*/{package.json,tsconfig.json,src,README.md}` lists all four entries in each of the 8 packages. |
| S9.1.2 | 2 apps under `apps/` | Pass | `ls apps` lists `site` and `storybook`. |
| S9.1.3 | Every `exports` map matches spec §4 | Pass | A script parsed the spec §4.1–§4.8 `exports` blocks, AM-010 `./contrast-table` and AM-052 `./neutral` included, and deep-compared them with each `packages/*/package.json`. All 8 match in the same key order (tokens 20, colors 33, schemas 2, themes 6, utils 3, core 4, components 1, icons 1). |
| S9.1.4 | `scripts/lint-layers.mjs` passes | Pass | `bun run scripts/lint-layers.mjs` exits 0 with "lint-layers: OK — dependency graph, prefix audit, and colour-literal guard all pass." |
| S9.1.5 | `line-components` builds as a zero-export module, asserted in CI | Pass | The build logs `dist/index.js 0.00 kB`. Loading `packages/line-components/dist/index.js` with `bun -e` prints `exports 0`. The same assertion is the `checks.yml:28-29` step. |
| S9.1.6 | Prefix audit passes | Pass | `scripts/lint-layers.mjs:255-334` audits `src/` and `dist/`, and the run above reports the prefix audit as passing. |
| S9.2.1 | 31 hue CSS files in `line-colors/src/` and `dist/` | Pass | `packages/line-colors/src/` holds 31 hue files besides `index.css` and `special.css`, `neutral.css` included. `bun run build` exits 0 and emits `dist/`. |
| S9.2.2 | `special.css` committed and built | Pass | `packages/line-colors/src/special.css` is tracked, export `./special` maps to `./dist/special.css`, and `bun run build` exits 0. |
| S9.2.3 | 31 `accent/*.css` and 6 `gray/*.css` | Pass | `packages/line-themes/src/accent/` holds 31 files. `gray/` holds mauve, neutral, olive, sage, sand and slate. |
| S9.2.4 | `semantics.css`, `aliases.css`, `defaults.css` committed | Pass | `ls packages/line-themes/src` lists all three. |
| S9.2.5 | `bun test` passes the CSS snapshot suites and the 3 `cascade-layer.test.ts` suites | Pass | `bun test` exits 0 with 308 pass, 0 fail and 69 snapshots across 18 files. The run covers the palette, role-mapping, auto-pair and schema suites and `cascade-layer.test.ts` in line-tokens, line-colors and line-themes. |
| S9.2.6 | Every rule inside `@layer line`, barrels hold only `@import`, `cascade-layer.e2e.ts` passes in 3 engines | Pass | The 3 `cascade-layer.test.ts` suites pass. `playwright test --list` shows `packages/line-themes/__tests__/cascade-layer.e2e.ts` under chromium, firefox and webkit, and `bun run e2e` exits 0 with 105 passed, 0 failed. |
| S9.2.7 | `scripts/validate-contrast.mjs` passes | Pass | Exit 0 with "OK — 62 step-9/contrast pairs (31 hues × light/dark) meet ≥ 3:1". The only warnings are orange light and dark at 2.97:1, allowlisted by AM-014. |
| S9.2.8 | `scripts/verify-palettes-fresh.mjs` passes | Pass | Exit 0 with "33 committed palette CSS files match a fresh generation." |
| S9.2.9 | `aliases.css` declares exactly 54 alias variables, asserted by a test | Pass | `packages/line-themes/__tests__/schema.test.ts:121-130` asserts 54 declarations and `ALIASES.length * ROLES.length` = 54. `bun test packages/line-themes` reports 132 pass, 0 fail. |
| S9.2.10 | No hue shares a role name; `hue-role-names.e2e.ts` passes | Pass | `neutral.css` exists in `line-colors/src/`, `line-themes/src/accent/` and `line-themes/src/gray/`, and no `gray` hue file remains. The 4 tests of `hue-role-names.e2e.ts` pass in 3 engines inside `bun run e2e`. |
| S9.2.11 | No `[data-theme]` selector in `line-themes` output | Pass | `grep -rn data-theme packages/line-themes/src packages/line-themes/dist` finds nothing. `role-mapping.snapshot.test.ts:42-52` snapshots the 31 accent and 6 gray `dist/` files. |
| S9.3.1 | `LineElement` with Inspector, Metadata and Direction mixins | Pass | `packages/line-core/src/line-element.ts:19` declares `LineElement extends DirectionMixin(MetadataMixin(InspectorMixin(LitElement)))`. Its tests pass in `bun test packages/line-core` (63 pass, 0 fail). |
| S9.3.2 | `FormAssociated` passes the unit tier and the browser tier | Pass | The unit tier `packages/line-core/__tests__/form-associated.test.ts:51` passes. The browser tier `__tests__/integration/form-associated/form-associated.e2e.ts` passes FormData, submission, reset and validity in 3 engines. |
| S9.3.3 | `LineMachineController` re-exports four primitives, itself and `Attrs`, and no `bindable` | Pass | `packages/line-core/src/machine/index.ts:3-4` exports `Attrs`, `mergeProps`, `normalizeProps`, `spreadProps`, `VanillaMachine` and `LineMachineController`, plus the `LineMachineControllerOptions` type that spec §6.D.6 requires. `grep -rn bindable packages/line-core/src` finds nothing. |
| S9.3.4 | A broken machine flips `fallback = true` without throwing | Pass | `line-machine-controller.test.ts:126` asserts `fallback` is true at :130, :140 and :150, and it passes. |
| S9.3.5 | Hello-world passes on `bun test` and Playwright | Pass | `line-hello-world.test.ts` passes in `bun test packages/line-core`. `line-hello-world.e2e.ts:14` passes in 3 engines. |
| S9.3.6 | Biome rejects `@zag-js/vanilla` outside `line-core` | Pass | On the clean tree `bun run lint` exits 0. A scratch file in `packages/line-utils/src/` that imported `VanillaMachine` made `bun run lint` exit 1 with `lint/style/noRestrictedImports` (rule at `biome.json:44-51`). The file was deleted, and `git status --porcelain` was empty. |
| S9.3.7 | 11 reset sheets export singleton `CSSStyleSheet` objects | Pass | `packages/line-core/src/styles/` holds 11 `reset.*.css` files. `styles/index.ts:24-40` builds each with `new CSSStyleSheet()` and `replaceSync`, then exports 11 module-level constants. |
| S9.4.1 | `IconRegistry` and `IconResolver` exported | Pass | `packages/line-icons/src/index.ts:1` exports the `IconResolver` type, and `:8` exports `class IconRegistry`. |
| S9.4.2 | Lucide and Phosphor factories exported and tested | Pass | `index.ts:30-31` exports both factories. `resolvers.lucide.test.ts` and `resolvers.phosphor.test.ts` pass in `bun test packages/line-icons` (37 pass, 0 fail). |
| S9.4.3 | At least 3 icons from each library | Pass | `registry.test.ts:13-18` resolves Lucide `house`, `search` and `x`, and `:24-29` resolves Phosphor `house`, `magnifying-glass` and `x`. |
| S9.5.1 | Bun ≥ 1.3.14 in `engines.bun`; pnpm removed | Pass | Root `package.json` declares `engines.bun` `>=1.3.14`. `git ls-files` and `git grep -i pnpm` outside the docs find no pnpm file or setting. |
| S9.5.2 | Biome ≥ 2.4.15 operational; ESLint and Prettier removed | Pass | `bun.lock` resolves `@biomejs/biome@2.4.15`, and `bun run lint` checks 233 files with 0 errors. No manifest or config names ESLint or Prettier. `prettier@2.8.8` appears only as a transitive dependency of `@changesets/*`. |
| S9.5.3 | Vite ≥ 8.0.13 with Rolldown 1.0.x | Pass | `node_modules/vite/package.json` is 8.0.14 with `dependencies.rolldown` 1.0.2. The build logs "vite v8.0.14 building client environment". |
| S9.5.4 | All spec §6.A.3 dependencies at the declared minimum | Pass | `bun.lock` against the spec §6.A.3 table shows every floor met, for example lit 3.3.3, vite 8.0.14, @zag-js/vanilla 1.41.0, typescript 5.9.3, postcss 8.5.15, storybook 10.4.1, playwright 1.60.0, @changesets/cli 2.31.0 and astro 7.3.7. |
| S9.5.5 | `@websublime/*` scope verified by a canary publish | Pass | `npm view` shows the `canary` dist-tag on all 8 `@websublime/line-*` packages, set by snapshot-deploy run https://github.com/websublime/line-ui/actions/runs/37474782644. |
| S9.5.6 | Vite 8 and Rolldown library-mode smoke build in CI with a non-empty `dist/` (AM-062) | Pass | `bun run build`, the `checks.yml:22-23` step, builds `line-core` with Vite 8.0.14 in library mode and emits 7 JS files, including `dist/index.js` 0.42 kB, `dist/machine/index.js` 1.27 kB and `dist/styles/index.js` 4.53 kB. That step passed in https://github.com/websublime/line-ui/actions/runs/38246314939. |
| S9.6.1 | `checks.yml` runs the full pipeline on every PR | Pass | `.github/workflows/checks.yml:2` triggers on `pull_request`. It runs lint :20-21, build :22-23, typecheck :24-25, layer-lint :30-31, palette freshness :32-33, contrast :34-35, unit :38-39, e2e :42-43, Storybook build :44-45 and CEM :46-47. Its PR #248 run passed: https://github.com/websublime/line-ui/actions/runs/38246314939. |
| S9.6.2 | `release.yml` publishes on push to `main` | Pass | Every `release.yml` run is a push to `main` and succeeded, the latest being https://github.com/websublime/line-ui/actions/runs/38254035341. `release.yml:41-44` runs `changesets/action` with `publish: bun run release`, which calls `scripts/publish.mjs` (AM-036). |
| S9.6.3 | `snapshot-version.yml` and `snapshot-deploy.yml` operational; no `next` branch | Pass | `snapshot-version.yml` ran once by dispatch on `main`, and its `plan` job succeeded: https://github.com/websublime/line-ui/actions/runs/38257662173. `snapshot-deploy.yml` succeeded on `main` in https://github.com/websublime/line-ui/actions/runs/37456833604 and https://github.com/websublime/line-ui/actions/runs/37474782644, and its `snapshot-deploy.yml:16-23` step fails any other ref. `git ls-remote --heads origin` lists no `next`. |
| S9.6.4 | `deploy-site.yml` deploys `apps/site` to `https://line-ui.websublime.com` | Pass | Every run is a push to `main` and succeeded, the latest being https://github.com/websublime/line-ui/actions/runs/38254035340. `curl -sL https://line-ui.websublime.com` returns 200 with the Astro placeholder page. |
| S9.6.5 | Storybook production on push to `main` and a preview on a same-repo PR | Pass | Production run https://github.com/websublime/line-ui/actions/runs/38254035380, and `https://line-ui-storybook.websublime.com` returns 200. Preview run https://github.com/websublime/line-ui/actions/runs/38246314723 on PR #248, and `https://pr-248.line-ui-storybook-preview.pages.dev` returns 200. |
| S9.6.6 | `bunfig.toml` declares the test preload | Pass | `bunfig.toml:4-5` holds `[test]` and `preload = ["./bun-test-preload.ts"]`. |
| S9.6.7 | CI asserts the preload entry | Pass | The anchored grep at `checks.yml:36-37` matches `bunfig.toml:5` exactly. |
| S9.6.8 | One RC publish verified end to end | Pass | Snapshot-deploy run https://github.com/websublime/line-ui/actions/runs/37474782644 published canary `0.1.0-1b3a3c23…-SNAPSHOT` of all 8 packages. The `line-core` attestation for that version names `.github/workflows/snapshot-deploy.yml`, `refs/heads/main` and `workflow_dispatch`. |
| S9.7.1 | Storybook 10 boots with `bun --filter '@websublime/line-storybook' dev` | Pass | The dev server logged "Storybook ready!" on port 6006 with no error or warning line. `GET /`, `GET /index.json` and the getting-started docs iframe returned 200. |
| S9.7.2 | The three MDX guides ship and render | Pass | `apps/storybook/stories/` holds `getting-started.mdx`, `theming.mdx` and `customisation.mdx`. `apps/storybook/__tests__/storybook-smoke.e2e.ts` renders all three without console errors in 3 engines inside `bun run e2e`. |
| S9.7.3 | Palette and role stories render all 31 hues and all role combinations | Pass | `palettes.stories.ts:35-37` maps the 31 hues, and `roles.stories.ts:73-97` covers 31 accent hues, 6 gray hues, the semantic roles and the aliases. The smoke tier renders every palette and role story in 3 engines. |
| S9.7.4 | `docs/specs/COMPONENT-SPEC-TEMPLATE.md` committed | Pass | The file is tracked. |
| S9.7.5 | `docs/COMPETITIVE-COMPONENT-ANALYSIS.md` skeleton committed | Pass | The file is tracked. |
| S9.8.1 | `LineHtmxElement` and a runnable example under `__experimental__/htmx/` | Pass | `packages/line-core/__experimental__/htmx/` tracks `line-htmx-element.ts`, `README.md`, `example/index.html`, `example/line-htmx-counter.ts` and `example/server.ts`. |
| S9.8.2 | Spike outcome documented with evidence | Pass | Section 00-H1 below records the exploratory exit of 2026-10-12, backed by 25 files under `assets/00-h1/`. |
| S9.9.1 | PRD §7.2 "Review pending" tasks verified | Pass | PRD v0.8.14 marks all 16 §7.2 tasks Done, and each maps to a done ledger row, for example Bun to A1 (#174), Biome to A2 (#175) and dependencies to A3 (#176). |
| S9.9.2 | `0.1.0` of all 8 packages on `latest` with provenance; later bumps per PROCESS §6 | Pass | Release run https://github.com/websublime/line-ui/actions/runs/37483208484 published `0.1.0` of all 8, and every `0.1.0` carries SLSA v1 provenance. Later bumps are patches only (see What shipped). |
| S9.9.3 | Phase 00 retrospective committed | Pass | This file. |
| P7.2.4 | Zod schema tests pass; `HUES`, `ACCENT_HUES`, `GRAY_HUES`, `SEMANTIC_MAP` match the generated CSS | Covered by 00-C18 | `schema.test.ts` checks the three hue lists against `dist/` (:72, :79, :86) and the `src/` file sets (:94-104). Row `00-C18` (AM-061) adds the `SEMANTIC_MAP` against `semantics.css` assertion to the same file and merges before this row. |
| P7.3.3 | Inspector with `localStorage` flag, hover outline, version display and metadata | Pass | `packages/line-core/src/mixins/inspector.ts` reads the flag `line-ui:inspector` = `on` (:11-14), adds the hover outline sheet (:157-160), writes `data-line-version` (:162-166) and exposes `data-line-docs` plus a Ctrl/Cmd+Shift+L panel (:252-276). `inspector.test.ts` passes. |
| P7.5.3 | All dependencies at or above the spec §6.A.3 minimums | Pass | Plan §7.5 follows the spec by Miguel's decision of 2026-10-12, and S9.5.4 holds. npm already offers newer versions inside the current majors (vite 8.3.4, zag 1.46.0, postcss 8.5.29, biome 2.5.15) and TypeScript 7.0.2, which is hand-off item 1. |
| P7.6.3 | Storybook preview deploys verified; site on production only (AM-045) | Pass | The preview evidence is S9.6.5. `.github/workflows/deploy-site.yml:2` triggers on push to `main` only, and the workflow has no `pull_request` run. |
| PRD.1 | All tasks Done with review completed | Pass | PRD v0.8.14 §7.2 reads Done for all 16 tasks, and every mapped ledger row is done. |
| PRD.FA | FormAssociated works with native `<form>`, including `:invalid` and `:valid` | Pass | `form-associated.e2e.ts:144` drives `checkValidity`, `reportValidity`, `:invalid`, `:valid` and submission, and the helper at :63-71 reads them. The unit tier is `form-associated.test.ts:85-98`. |
| PRD.CI | CI/CD operational with canary RCs, Storybook previews and the site on production only | Pass | The checks evidence is S9.6.1, the canary evidence S9.6.8, the Storybook preview S9.6.5 and the production-only site S9.6.4. |

The remaining plan §7 and PRD §7.2 bullets restate spec §9 bullets, and their evidence is the rows below.

| Source | Bullet | Rows |
|---|---|---|
| Plan §7.1 | Structure; design-system exports; runtime packages; downward-only layers | S9.1.1, S9.1.2; S9.1.3; S9.1.5, S9.4.1; S9.1.4 |
| Plan §7.2 | Palettes committed; role maps and aliases; snapshot tests; contrast; PostCSS and the smoke build | S9.2.1, S9.2.2, S9.2.8; S9.2.3, S9.2.4, S9.2.9; S9.2.5, S9.2.11; S9.2.7; S9.2.1, S9.5.6 |
| Plan §7.3 | Mixins; FormAssociated tiers; `LineMachineController`; hello-world | S9.3.1; S9.3.2; S9.3.3, S9.3.4; S9.3.5 |
| Plan §7.4 | Registry against Lucide and Phosphor | S9.4.2, S9.4.3 |
| Plan §7.5 | Bun; Biome; npm scope | S9.5.1; S9.5.2; S9.5.5 |
| Plan §7.6 | Workflows; RC pipeline | S9.6.1, S9.6.2, S9.6.3; S9.6.8 |
| Plan §7.7 | Storybook and CEM; base docs; template; competitive analysis | S9.7.1, S9.6.1; S9.7.2; S9.7.4; S9.7.5 |
| Plan §7.8 | Spike completed; outcome documented | S9.8.1; S9.8.2 |
| Plan §7.9 | "Review pending" verified; `0.1.0` with provenance; retrospective | S9.9.1; S9.9.2; S9.9.3 |
| PRD §7.2 | Monorepo; design-system pipeline; palettes and snapshots; schemas; contrast; `LineElement`; Inspector; icons; HTMX; npm scope; base docs | S9.1.1, S9.1.2; S9.1.3, S9.2.1, S9.5.6; S9.2.1–S9.2.5; P7.2.4; S9.2.7; S9.3.1, S9.3.5; P7.3.3; S9.4.1–S9.4.3; S9.8.1, S9.8.2; S9.5.5; S9.7.2, S9.6.5 |

## What shipped

### Packages

Every current `latest` carries SLSA v1 provenance (npm, 2026-10-12). The decoded attestations of `line-core@0.1.0` and
`line-tokens@0.1.2` name `.github/workflows/release.yml`.

| Package | npm `latest` |
|---|---|
| `@websublime/line-colors` | 0.1.2 |
| `@websublime/line-components` | 0.1.0 |
| `@websublime/line-core` | 0.1.0 |
| `@websublime/line-icons` | 0.1.0 |
| `@websublime/line-schemas` | 0.1.1 |
| `@websublime/line-themes` | 0.1.2 |
| `@websublime/line-tokens` | 0.1.2 |
| `@websublime/line-utils` | 0.1.0 |

### Apps

| App | URL | State |
|---|---|---|
| `apps/storybook` | https://line-ui-storybook.websublime.com | Storybook 10 with the three guides and the palette and role stories; a `pr-<number>` preview per same-repo PR |
| `apps/site` | https://line-ui.websublime.com | Astro 7 placeholder page, scaffold-only by plan O4 |

### CI workflows

| Workflow | Trigger | Job |
|---|---|---|
| `checks.yml` | pull request | Lint, build, typecheck, pack check, zero-export smoke, layer lint, palette freshness, contrast, preload grep, unit, e2e, Storybook build, CEM |
| `release.yml` | push to `main` | Changesets Version PR, then `scripts/publish.mjs` with trusted publishing |
| `snapshot-version.yml` | manual dispatch | Dry-run snapshot plan |
| `snapshot-deploy.yml` | manual dispatch on `main` | Canary publish |
| `deploy-storybook.yml` | push to `main`, same-repo PR | Storybook production and PR previews on Cloudflare Pages |
| `deploy-site.yml` | push to `main` | Site production on Cloudflare Pages |

### By stream

| Stream | Shipped | Main PRs |
|---|---|---|
| A — tooling | Bun 1.3.14 workspaces, Biome 2.4.15, dependencies at the spec minimums, the `@websublime` npm scope | #174–#177 |
| B — monorepo | 8 packages and 2 apps, the downward-only layer graph with `scripts/lint-layers.mjs`, per-package builds, Changesets | #178–#183 |
| C — design system | `line-tokens` (18 families and reset), `line-colors` (31 hues and the special scales), `line-schemas`, `line-themes` (31 accent and 6 gray role maps, semantics, 54 aliases, auto-pair defaults), `line-utils`; generators, freshness guard and contrast validator; the `neutral` hue; shadows from the gray role | #184–#193, #196, #233, #236, #240 |
| D — runtime core | `LineElement` with the Inspector, Metadata, Direction and FormAssociated mixins, `LineMachineController`, 11 reset sheets, the hello-world fixture | #197–#199, #202, #205, #207, #210–#212 |
| E — icons | `IconRegistry` with Lucide and Phosphor resolvers as optional peers | #213, #214 |
| F — infrastructure | Storybook 10 with CEM, the happy-dom unit tier, the Playwright tier and Storybook smoke tier, the six workflows, the staged publisher, the Cloudflare deploys, native toolbar menus | #194, #195, #201, #204, #209, #215, #217, #221, #228, #229, #235, #245 |
| G — documentation | Getting Started, Theming and Customisation guides, palette and role stories, `COMPONENT-SPEC-TEMPLATE.md`, `COMPETITIVE-COMPONENT-ANALYSIS.md` | #231, #232, #237–#239, #243 |
| H — HTMX spike | `HtmxElement` reference under `__experimental__/htmx/`, exploratory exit | #248 |
| Z — repo-wide | The lifecycle process, MIT metadata, the `0.1.0` release decision, legacy cleanup, the agent-driven UI decision (PRD v0.8.6), Cloudflare hosting, `color-scheme` as the mode switch, `@layer line`, the MDX table fix | #200, #203, #206, #208, #216, #219, #220, #222–#225, #227, #230, #242, #244, #246 |

## Lessons learned

1. **Probe a research premise before the spec relies on it.** Research R14 called Changesets package-manager-agnostic
   for publishing. Under Bun, `changeset publish` falls back to `npm publish`, which dropped `dist/` and shipped
   `workspace:^` unrewritten, so every tarball would have been uninstallable. AM-036 replaced it with a staged
   publisher (`docs/context/00-f9.md`, PR #215). AM-001 and AM-019 corrected two more unprobed package facts.
2. **happy-dom is not a browser, so the browser tier is the source of truth.** happy-dom 20.10.5 has no
   `attachInternals` (AM-032), returns `light-dark()` uncomputed (AM-015, AM-020) and never matches `:dir(rtl)`
   (AM-031). Plan §7.3 required two tiers for `ElementInternals`, and each of these gaps moved a check into
   Playwright.
3. **The decision-change grep must cover exit criteria and status tables.** AM-016 had to finish AM-001, and AM-025
   had to finish AM-024. After AM-045 the site-preview wording survived in PRD §7.2 and plan §7.6, and the PRD §7.2
   statuses never left Todo or Review pending. Only the exit sweep found the last two, and PRD v0.8.14 fixed them.
4. **Tokens that share one name pattern need a naming invariant and a test.** The Radix `gray` hue and the gray role
   both wrote `--line-gray-*`, so the role mapping declared a self-reference cycle in the published `0.1.0` CSS.
   AM-052 renamed the hue to `neutral`, and `hue-role-names.e2e.ts` now guards the invariant (PR #236).
5. **Test the built artifact, not the source.** Minifiers dropped empty keyframes (AM-027), and lightningcss lowered
   `light-dark()` in the Storybook build (AM-050). MDX 3 rendered the GFM tables of the deployed guides as pipes
   (AM-056, PR #244). The Storybook smoke tier against `storybook-static` (AM-057, PR #245) came after these bugs.
6. **Check a CSS architecture against real consumer stacks before freezing it.** PRD T2 held that `:where()` and
   Shadow DOM made `@layer` unnecessary. The cascade compares layers before specificity, so Tailwind v4's
   `@layer base` lost to every unlayered package rule. AM-058 reversed T2 after `0.1.x` had shipped
   (`docs/context/00-z15.md`, PR #246).
7. **Workspace tools need throwaway probes.** `bun --filter` orders builds by `dependencies` only and raced the
   Storybook build against `line-schemas` in CI (AM-029, PR #209). `bun --filter <pkg> run` matched no package
   (AM-024), and `bun pm pack` filled `workspace:` ranges from a stale `bun.lock` (AM-036).
8. **Write runbooks from observed registry behaviour.** npm showed a published version 0.5–6 minutes after CI
   logged it. A canary publish set `latest` on packages that had none, against npm's own docs (AM-042, PR #221).
9. **Run the exit sweep before the last rows land.** The sweep found a workflow that had never run
   (`snapshot-version.yml`), a missing test (`SEMANTIC_MAP`, row `00-C18`), a criterion worded against a check that
   CI does not run (AM-062) and the stale PRD and plan wording above. Each needed its own row or decision on
   2026-10-12.

## Open items

| Item | Detail | Owner |
|---|---|---|
| Legacy `0.0.0-stage` versions | `line-colors`, `line-schemas`, `line-themes`, `line-utils` and `line-icons` still list a pre-scope `0.0.0-stage` version (AM-042). It does not affect `latest`. | No row yet |
| `bun test packages/<x>` without tests | `components`, `schemas` and `utils` have no test files, so the command exits 1 with "filters did not match any test files". PROCESS §5 names that command in the Verify record. | No row yet |
| Storybook chunk size | The Storybook build warns that some chunks exceed 500 kB after minification. | No row yet |
| `noBarrelFile` warnings | `bun run lint` reports 5 warnings, at `line-core/src/index.ts:1`, `line-core/src/machine/index.ts:3`, `line-icons/src/index.ts:30`, `line-schemas/src/index.ts:7` and `line-utils/src/index.ts:6`. | No row yet |
| `.npmrc` warning | `bun install` prints a non-fatal "invalid _auth value" warning at `.npmrc:2:49`, although the file holds only the two registry keys of AM-037. | No row yet |
| Placeholder site | https://line-ui.websublime.com serves a placeholder page. That is the plan O4 scope, and the full landing page is Phase 1 parallel work. | Phase 1 |
| AM-034 row cells | The AM-034 row of the spec amendment table has 6 unescaped pipes instead of 7. | `00-Z18`, PR #249 |
| Action pins in `checks.yml` | `checks.yml` uses tag-pinned `actions/checkout@v4` and `oven-sh/setup-bun@v2`, while the release workflows pin full SHAs (AM-040). AM-025 deferred SHA pinning by Miguel's decision. | No row yet |

## Hand-off to Phase 1

1. **Dependency refresh within the current majors.** Move vite to 8.3.x, the Zag.js packages to 1.46, postcss to the
   latest 8.5.x and Biome to 2.5. This task runs when Phase 1 opens, before the first component work. It does not
   replace the agent-driven UI foundation, which stays the first stream of Phase 1 (item 3, PRD §7.3). TypeScript 7 is
   a separate decision, because spec §6.A.3 pins TypeScript to 5.x.
2. **Row `00-Z17` before the first component spec.** It moves to the Phase 1 ledger when that ledger is created. It
   adds the `hx-trigger` commit-event rule to the component spec template, the htmx check in the Playwright tier and
   the Storybook HTMX guide.
3. **The agent-driven UI foundation stream.** It opens Phase 1 and ships `@websublime/line-genui` (PRD §7.3,
   ARCHITECTURE §17).
4. **The C1–C8 agent contract in the component spec template.** Every Phase 1 component spec fills the Agent contract
   section (ARCHITECTURE §17.2 and §17.3, AM-043).

## 00-H1 — `LineHtmxElement` htmx spike

### Setup

- **Row and spec:** ledger `00-H1`, spec §6.H.1 and §6.H.2 as amended by AM-059 (factual corrections) and AM-060
  (Miguel's decisions of 2026-10-12).
- **Code:** [`packages/line-core/__experimental__/htmx/`](../../packages/line-core/__experimental__/htmx/README.md),
  excluded from the build and from `exports` (spec D6). It holds the `HtmxElement` mixin, the `<line-htmx-counter>`
  example built as `FormAssociated(HtmxElement(LineElement))`, the consumer page and a `Bun.serve` that keeps the
  state server-side. The README explains how to run it.
- **htmx:** 2.0.11 (npm `latest`) and 4.0.0 (npm `next`), exact root devDependencies aliased `htmx2` and `htmx4`.
  The server picks the major per page load (`?htmx=2|4`).
- **Browsers:** Chromium 148.0.7778.96, Firefox 150.0.2 and WebKit 26.4 through Playwright 1.60.0, on Bun 1.3.14.
- **Capture:** a throwaway Playwright script, deleted after the run, drove the committed example on 2026-10-12. It
  started one fresh server per run and made 16 checks on the page and 4 probes on fresh pages in each of the 6
  runs (3 engines × 2 majors). Each check is named after the observation it expects, and all 120 matched.
- **Evidence:** [`assets/00-h1/`](assets/00-h1/). [`results.json`](assets/00-h1/results.json) holds every check
  with its observed detail. Each run adds `<browser>-htmx<major>-before.png` and `-after.png`, a network log with
  the `hx-*` headers and bodies, and a console log with the htmx events that reached the hosts.
  [`pack-and-build.txt`](assets/00-h1/pack-and-build.txt) shows that `bun run build`, `npm pack --dry-run` and
  `bun pm pack --dry-run` carry nothing from `__experimental__` and no htmx.

### Findings

Both majors behave the same in all three engines unless a cell says otherwise. Check names refer to
[`results.json`](assets/00-h1/results.json).

| Dimension | htmx 2.0.11 | htmx 4.0.0 | Evidence |
|---|---|---|---|
| `hx-*` forwarding | htmx acts on host `hx-*` natively, and a click on an internal button also fires a host-level `click` trigger, because `click` is composed. Host `hx-vals` does not inherit into the shadow root. The mixin's copy of host `hx-headers` onto an internal wrapper puts `X-Line-Consumer: page` on the internal request. A slotted light-DOM `hx-post` works without the mixin and inherits host `hx-vals` and `hx-headers` implicitly. | Same, with three differences. Host `hx-vals:inherited` does not inherit into the shadow root either. The forwarded copy must be named `hx-headers:inherited`. The slotted button inherits only host `hx-vals:inherited`. | `hostNative`, `forwarding`, `slottedLightDom`; [`chromium-htmx2-network.json`](assets/00-h1/chromium-htmx2-network.json), [`chromium-htmx4-network.json`](assets/00-h1/chromium-htmx4-network.json) |
| Server-driven state | Swaps into the shadow root, into the host's light DOM (projected by a named slot) and into `global #counter-log` all work. A server-sent `Undo` inside the shadow root is live. A `<line-htmx-counter>` that the server renders and htmx swaps in upgrades and honours its attributes. The settle hook turns the server count into a form value that the page's htmx form posts (`count=-7`). A swap into a Lit-bound node breaks the next render ("This `ChildPart` has no `parentNode`"). | Same. | `shadowSwap`, `hostSwap`, `globalSwap`, `swappedContentLive`, `serverRendered`, `formValue`, `litBoundSwapBreaksPart`; [`webkit-htmx2-after.png`](assets/00-h1/webkit-htmx2-after.png), [`webkit-htmx4-after.png`](assets/00-h1/webkit-htmx4-after.png) |
| Swap-aware lifecycle | Processing in `updated()` makes the first render live and the Lit-inserted reset button live; without it both stay inert. A Lit change to a bound `hx-post` works because `updated()` re-processes, since htmx 2 captures the path when it wires the element. Re-processing after a swap is redundant, because htmx processes swapped content itself. htmx events reach host listeners with `composed: true`, except settle events of `global` swaps, which never reach the host. Three reconnects and three re-renders during a `load` request add no duplicate request. | Same, except htmx 4 reads the verb when the event fires and names its events `htmx:before:request`, `htmx:after:settle` and so on. | `initialLoad`, `baselineInert`, `litInsertedElement`, `updatedNeededForLitInserted`, `litBoundAttribute`, `settleNotNeededForSwappedContent`, `composedEvents`, `globalSwap`, `reconnect`, `inFlightRerender`; [`firefox-htmx2-console.json`](assets/00-h1/firefox-htmx2-console.json), [`firefox-htmx4-console.json`](assets/00-h1/firefox-htmx4-console.json) |

### Blockers

The spike found no blocker in the exercised scope. A committed adapter would still have to own four constraints:

- A swap target inside a shadow root must hold no Lit binding (`litBoundSwapBreaksPart`).
- Host-level `hx-*` with the default `click` trigger fires for every click inside the shadow root (`hostNative`).
- The settle hook misses swaps into `global` targets (`globalSwap`).
- Forwarding depends on the htmx major, and the spike forwards one attribute (`forwarding`).

The spike did not test forwarded selector-valued attributes, htmx loaded as an ES module, host attribute changes
after the first render, a changed `hx-trigger` under htmx 4, out-of-band swaps or `<hx-partial>` into shadow content,
closed shadow roots, declarative shadow DOM, or the cost of processing a large shadow tree after every render.

### Recommendation

The recommendation is **exploratory**. Spec §6.H.2 pairs the committed exit with an example that runs end to end,
and the exploratory exit with blockers. The example ran end to end on both majors with no blocker, so the facts
allow committed. The reasons below are about scope, and Miguel decides.

1. The paths a headless primitive offers htmx already work without the adapter. Host-level `hx-*`, slotted
   light-DOM `hx-*`, a form-associated value in an htmx form and htmx events on the host all worked on both majors
   in all three engines (`hostNative`, `slottedLightDom`, `formValue`, `composedEvents` in
   [`results.json`](assets/00-h1/results.json)). The mixin processes only the shadow root, so none of these paths
   goes through it. The adapter matters only for a component that renders `hx-*` inside its own shadow root, and
   none of the 20 Phase 1 components (PRD §7.3) or the 15 Phase 2 form controls (PRD §7.4) does that.
2. Rendering `hx-*` inside a shadow root brings rules a spec would have to settle first. A swap into a Lit-bound
   node breaks the template, a host click trigger fires on every internal click, the settle hook misses `global`
   swaps, and forwarding branches on the htmx major with no answer yet for selector-valued attributes
   (`litBoundSwapBreaksPart`, `hostNative`, `globalSwap`, `forwarding` in
   [`results.json`](assets/00-h1/results.json)).
3. htmx is between majors. 4.0.0 stays on npm `next` until early 2027 with new event names and explicit
   inheritance, and the mixin already listens for two settle events and writes two forwarding forms. The event
   names differ between [`chromium-htmx2-console.json`](assets/00-h1/chromium-htmx2-console.json) and
   [`chromium-htmx4-console.json`](assets/00-h1/chromium-htmx4-console.json), and the `forwarding` check records
   `hx-headers` under htmx 2 and `hx-headers:inherited` under htmx 4. A Phase 1 public API would ship before
   `latest` moves.

Picking the adapter up later is cheap. The mixin is 125 lines, and the capture ran all 120 checks across both
majors and three engines in under two minutes.

### Outcome

Miguel chose the **exploratory** exit on 2026-10-12 (spec §6.H.2, plan §2.8). `LineHtmxElement` is deferred as a
nice-to-have after 1.0. No planned component renders `hx-*` inside its own shadow root, so the adapter would be a
public API with no first-party consumer. htmx is between majors, and picking the adapter up later is cheap. The value
for the HTMX persona lies in the native paths, and nothing guards them yet. `hostNative` shows one gap, because the
default `click` trigger on a compound host fires for every click inside it.

- `packages/line-core/__experimental__/htmx/` stays where it is as a reference. It is not built and not exported.
- Ledger row `00-Z17` guards the native paths instead. It adds a component-spec-template rule next to C1–C8 that
  makes a compound component name the commit event it offers as `hx-trigger`. It adds an htmx check to the
  Playwright tier of value-bearing and compound components, which covers a value in `<form hx-post>`, `hx-trigger`
  on the commit event and content swapped into slots. It also adds a Storybook HTMX guide.
- `00-Z17` targets htmx 4 in its design. Its checks run on htmx 2 and htmx 4 for as long as upstream supports 2.x.
  The htmx 4.0.0 announcement says 2.x stays supported indefinitely, and npm `latest` moves to 4 in early 2027.

### Conditions for a future revisit

A later decision to commit the adapter would need a Phase 1+ spec that settles these points.

1. **Packaging.** The folder graduates to `packages/line-core/src/htmx/` with a `./htmx` subpath export and a Vite
   entry. The spec decides whether `line-core` declares htmx as an optional peer with a range over the supported
   majors or declares nothing, and checks the effect on `scripts/lint-layers.mjs` and `scripts/verify-pack.mjs`.
2. **Majors.** The spec names the supported htmx majors and what changes when 4.x becomes `latest`.
3. **Finding htmx.** The `globalThis.htmx` lookup covers a script tag. An ES-module consumer needs a registration
   path, which the spike did not test.
4. **Forwarding contract.** The spec lists the forwarded host attributes, names the forward-target marker under
   Manifesto Law 2, writes the `:inherited` suffix per major, rewrites selector-valued attributes to `global …`, and
   tests updates after the first render.
5. **Authoring rule.** A swap target inside a shadow root holds no Lit binding, and a test enforces it.
6. **Settle hook.** The spec fixes the hook's name and contract. The hook runs for swaps into the shadow root and
   into the host itself, and it misses `global` swaps.
7. **Consumer guidance.** A host whose shadow root holds interactive elements should not carry a host-level `click`
   trigger. A component event or an explicit `hx-trigger` avoids the double request.
8. **Test tier.** A Playwright fixture under `packages/line-core/__tests__/integration/htmx/` runs in chromium,
   firefox and webkit against each supported major and covers the 20 checks of this spike. Whether htmx runs under
   happy-dom for the `bun test` tier is unknown.
9. **Cost.** The spec sets a budget for `htmx.process` after every render in a large shadow tree.
10. **First consumer.** The spec names the component that needs the adapter, because PRD §7.3 and §7.4 list none.

### Server-side A2UI → `<line-*>` HTML

PRD Appendix D and ARCHITECTURE §17 defer server-side A2UI → `<line-*>` HTML until this spike reports. The spike
bears on that item in three ways. A `<line-htmx-counter>` that the server rendered as plain HTML and htmx swapped in
upgraded, loaded and honoured its attributes on both majors (`serverRendered`). The upgrade is the platform's
custom-element upgrade on insertion, and only the counter's own internal `hx-*` controls needed the mixin, so
server-rendered `<line-*>` markup comes alive with the component's script on the page. Server state reached the
component through attributes the server wrote and through light-DOM children a slot projects, and both survived Lit
re-renders (`hostSwap`, `survivesRerender`). A server that patched content inside a component's shadow root would
break Lit's template instead (`litBoundSwapBreaksPart`). A server-side renderer would therefore emit attributes and
slotted children, the surface that Manifesto Law 8 has the catalog descriptors state as props and slots. The spike
did not test declarative shadow DOM or a server that turns A2UI messages into HTML, so it informs the deferred item
and decides nothing.
