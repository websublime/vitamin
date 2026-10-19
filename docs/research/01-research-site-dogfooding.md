# Research: Site dogfooding on Astro 7 static output

**Row:** `00-Z40` (Phase 1 plan §5.2 R12, decision O3 (b))
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §1, §2.8, §3, §4.0, §4.5, §5.2, §5.4 O3, §6, §7.3; `docs/PRD.md` §1.7, §5.3, §7.3 (v0.8.17); `docs/MANIFESTO.md` Principle 5, Laws 6, 8, Out of Scope; `docs/ARCHITECTURE.md` §12; `docs/specs/00-spec-design-system.md` §5, §6.A.3, §6.F.5 `deploy-site.yml`, §6.F.6, §10 D7, AM-029, AM-045, AM-046, AM-068; `apps/site/**`; `.github/workflows/deploy-site.yml`, `checks.yml`; `playwright.config.ts`; `scripts/lint-layers.mjs`; `packages/line-core/src/styles/index.ts`, `src/line-element.ts`, `__tests__/integration/hello-world/`; `packages/line-themes`, `line-tokens`, `line-colors`, `line-components` manifests; `apps/storybook/.storybook/preview.ts`, `stories/getting-started.mdx`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - Astro 7 static output passes `<line-*>` tags through as plain HTML. A processed `<script>` that imports the component module is bundled by Vite into a hashed `type="module"` file and rendered where it is declared. The browser upgrades the tags on the client. No integration and no adapter are needed (probe, Astro 7.3.8).
> - The theme CSS imports from the Astro frontmatter by bare package specifier (`import '@websublime/line-themes'`). Astro emits one linked, minified stylesheet, and the `--line-*` properties reach the shadow DOM of an upgraded element in Chromium, Firefox and WebKit. Tokens plus indigo, slate and the full themes barrel weigh 88,051 B raw and 10,982 B gzipped.
> - A side-effect-only `<script>import '…'</script>` is silently dropped when the imported file sits under a `package.json` whose `sideEffects` excludes it. The build exits 0, emits no chunk and no `<script>` tag, and prints no warning. The ARCHITECTURE §12 `sideEffects` list therefore decides whether the landing page registers its components at all.
> - Lit SSR adds server-rendered declarative shadow DOM. Astro removed `@astrojs/lit` in Astro 5.0, and the community `@semantic-ui/astro-lit` 5.3.0 loads under Astro 7.3.8 but fails to prerender any line://ui element, because `line-core` builds its reset sheets with `new CSSStyleSheet()` at module load. SSR/SSG stays out of Phase 1 scope (plan §3, PRD §1.7).
> - Before upgrade, the page paints with the element undefined (throttled probe, first paint at 20 ms, upgrade at 3,021 ms). A `:not(:defined)` rule hides that state, and the shared Lit chunk loads only after the entry chunk, because Astro emits no `modulepreload` link.
> - `deploy-site.yml` needs no change. The build job already builds packages before the site (AM-029), and the deploy job's manifests-only `--ignore-scripts` install still succeeds and still resolves wrangler 4.148.0 once `apps/site` declares workspace devDependencies (AM-068).

---

## 1. Question

Plan §5.2 R12: "Astro 7 static output with the Phase 1 components, client-side upgrade of the Phase 1 components". Decision O3 (b) makes the landing page an exit criterion (plan §2.8, §4.5, §7.3; PRD §7.3 v0.8.17).

- **Q1** How does Astro 7 with static output and no adapter (AM-046) render custom elements and bundle their imports?
- **Q2** Is Lit SSR available to Astro 7 on 2026-10-19, and what would it add?
- **Q3** What happens between first paint and upgrade, and how does `:not(:defined)` handle it?
- **Q4** How do the CSS packages (`line-tokens`, `line-colors`, `line-themes`, `data-accent`) load into a static Astro page?
- **Q5** What does a real build emit, and how large is it?
- **Q6** Does dogfooding change `deploy-site.yml` (AM-068)?

## 2. Findings

### 2.1 Q1: Astro static output and custom elements

- Astro processes a `<script>` with no attributes other than `src`. It bundles imports from local files and npm packages, compiles TypeScript, emits `type="module"`, deduplicates the script per page and inlines it when small (Astro docs, "Scripts and event handling").
- The same page shows a custom element defined in a processed `<script>`. Astro does not render custom-element tags on the server; the tag reaches the HTML unchanged.
- Since Astro 5.0, scripts are no longer hoisted to `<head>`. They render where they are declared, and several scripts on one page are no longer bundled together (Astro docs, "Upgrade to v5", `<script>` tags are rendered directly as declared).
- The Astro docs recommend this path for Lit after the Lit integration was removed. Their example is `<script>import "../components/MyTabs";</script>` followed by `<my-tabs>` (Astro docs, "Upgrade to v5", Removed: The Lit integration).
- Probe 3.2 confirms the path on Astro 7.3.8 (the version locked in `bun.lock`). The HTML keeps `<line-probe id="lp">Click</line-probe>` as written. The script becomes `<script type="module" src="/_astro/probe-subclass.astro_astro_type_script_index_0_lang.<hash>.js">` at the position of the `<script>` tag, at the end of `<body>`.
- This path matches MANIFESTO Principle 5 ("Astro … No adapters, no wrappers").
- Versions on 2026-10-19 (registry.npmjs.org): `astro` latest 7.4.0 (2026-10-15). `apps/site` locks 7.3.8 (2026-10-08) through `^7.3.8`, and every probe ran on 7.3.8. The 7.4.0 changelog adds `--timings`, font-provider hooks and `experimental.redirectPage`; none of them touches script or CSS bundling. `astro@7.4.0` depends on `vite ^8.3.4`.

### 2.2 Q1: the `sideEffects` trap

- The repo's isolated Bun linker gives `apps/site` access only to the packages it declares. Today `apps/site/package.json` declares `astro` and `wrangler`, so the site must add `@websublime/*` packages before it can import them. Spec §5 (line 399) and `scripts/lint-layers.mjs` (lines 185–202) allow apps to reference `@websublime/*` only in `devDependencies`, as `apps/storybook` does.
- Probe 3.3 imported the `line-core` hello-world fixture (`packages/line-core/__tests__/integration/hello-world/line-hello-world.ts`) from a bare side-effect `<script>` import. `line-core` declares `"sideEffects": false`. The build exited 0, emitted no JS for the page and dropped its `<script>` tag. Nothing was printed.
- Adding the fixture path to `line-core`'s `sideEffects` in the throwaway copy restored the chunk and the tag. The cause is the `sideEffects` field, not Astro.
- `line-components` declares `"sideEffects": []` today (Phase 00 placeholder, spec §4 manifest). ARCHITECTURE §12 (lines 438, 466) says the field will list "exactly the per-component dist files". The landing page imports exactly those files as side effects, so a file missing from the list leaves its tag unregistered on the live site, and the build stays green.
- R9 (row `00-Z38`, branch `docs/00-z38-r9-packaging`, unmerged on 2026-10-19) reports two related facts in a peer message. Vite 8 lib mode can move a `define()` into a hashed shared chunk when one component imports another, so listing only entry files is not enough. `sideEffects: []` also drops sibling side-effect imports during the package's own build. R9's note owns these facts; this note does not re-verify them.

### 2.3 Q2: Lit SSR and the Astro integration

| Item | Fact on 2026-10-19 | Source |
|---|---|---|
| `@astrojs/lit` | Removed in Astro 5.0 (PR withastro/astro#11680); "will not receive further updates for compatibility with 5.x and above". Last release 4.3.0 on 2024-06-17; npm marks no deprecation | Astro docs "Upgrade to v5", "Lit" integration page; npm |
| `@semantic-ui/astro-lit` | Community fork, 5.3.0 on 2026-03-16. Prerequisite "Astro v5.0 or later"; no `astro` peer range. Depends on `@lit-labs/ssr ^3.3.1` (latest is 4.1.0) and peers `lit ^3.2.0`, `@webcomponents/template-shadowroot ^0.2.1` | Semantic-Org/Astro-Lit README; npm |
| `@lit-labs/ssr` | 4.1.0 (2026-05-14), a Lit Labs package, "experimental" | lit.dev SSR overview; npm |
| `@lit-labs/ssr-client` | 1.1.8 (2025-12-23); `lit-element-hydrate-support.js` must load before `lit` | lit.dev SSR client usage |
| `lit` | 3.3.3 (2026-05-14), the repo's version | npm |
| Declarative shadow DOM | Baseline widely available since 2026-08-20 (newly available 2024-02-20; Chrome 111, Firefox 123, Safari 16.4) | `web-features` 3.43.0 |

- Lit SSR renders a component's shadow root into `<template shadowrootmode>` so the browser paints it before JavaScript runs. `lit-element-hydrate-support` then makes the element reuse that DOM instead of re-rendering it (lit.dev, SSR overview and client usage).
- The lit.dev SSR overview still says "Declarative shadow DOM is not implemented in all major browsers yet". `web-features` contradicts that sentence, so the page is stale on this point.
- Lit SSR runs `constructor()`, `willUpdate()` and `render()` on the server, but not `connectedCallback()`, `firstUpdated()` or a controller's `hostConnected()` (lit.dev, "Authoring components for Lit SSR").
- Probe 3.5 added `@semantic-ui/astro-lit` 5.3.0 to the throwaway site and rendered `<LineProbe client:load>`. Astro 7.3.8 loaded the integration and reached prerender. Prerender failed with `ReferenceError: CSSStyleSheet is not defined`. The failing code is `createSheet()` in `packages/line-core/src/styles/index.ts:24–27`, which every reset sheet export calls at module load (`commonReset` at line 30 onward).
- The same configuration injected client scripts into every page, including the untouched placeholder. `index.html` grew from 1,122 B to 1,516 B, and `before-hydration.js` (5,768 B) and `client.js` (599 B) appeared in `dist/_astro/`.
- Lit SSR therefore needs a `line-core` change before it can render any line://ui element. The plan keeps "SSR/SSG investigation" after Phase 1 (plan §3 line 226; PRD §1.7 line 147; MANIFESTO Out of Scope line 65).

### 2.4 Q3: the window before upgrade

- A module script is deferred, so it runs before `DOMContentLoaded`. In probe 3.4 every element was `:defined` at `DOMContentLoaded` in all three engines on localhost.
- The browser can still paint before the module script arrives. Probe 3.6 delayed each `/_astro/*.js` response by 1,500 ms in Chromium. First paint and first contentful paint came at 20 ms. At 700 ms the element was undefined, had no shadow root, and showed its light-DOM text `Click`. The page rule `line-probe:not(:defined) { opacity: 0 }` held it at opacity 0. The element upgraded at `DOMContentLoaded`, 3,021 ms.
- 3,021 ms equals two sequential 1,500 ms delays. The entry chunk imports the shared `lit.<hash>.js` chunk, and the HTML carries no `<link rel="modulepreload">` (zero occurrences), so the browser finds the second chunk only after the first arrives.
- `:defined` matches every standard element and every custom element that is defined. It ships with autonomous custom elements, Baseline widely available since 2022-07-15 (`web-features` 3.43.0, `css.selectors.defined`).
- The guard has trade-offs:
  - `visibility: hidden` or `opacity: 0` hides the unupgraded light DOM and keeps its layout box. The box can still change size at upgrade.
  - With no guard, the user sees slotted text unstyled until upgrade.
  - With JavaScript failing, a hiding rule keeps the content hidden for good. MANIFESTO Law 8 (line 53) preserves progressive enhancement only "where the underlying native element supports it".

### 2.5 Q4: theme CSS in a static page

- `line-tokens`, `line-colors` and `line-themes` export CSS through extensionless subpaths (`"."`: `./dist/index.css`, `"./accent/*"`, `"./semantics"`, `"./defaults"`, `"./aliases"`), each with `"sideEffects": ["*.css"]`.
- The Astro docs say an extensionless CSS import from an npm package needs `vite.ssr.noExternal` (Astro docs, "Styling", Import a stylesheet from an npm package). Probe 3.2 imported `@websublime/line-tokens`, `@websublime/line-colors/indigo`, `@websublime/line-colors/slate` and `@websublime/line-themes` in the frontmatter without that setting, and the CSS reached the output. [INFERENCE] Vite does not externalize linked workspace packages for SSR, so the setting matters only for a registry-installed copy; the site consumes workspace links.
- Astro merges CSS shared by pages into one chunk. It links chunks above 4 kB with `<link rel="stylesheet">` and inlines smaller ones (Astro docs, "Styling", Bundle control). The probe's theme CSS was linked from `<head>`, so it blocks render and is present at first paint.
- The four `@layer line { … }` blocks of the inputs came out as one `@layer line { … }` block. The document had exactly one cascade layer, `line`, in all three engines. `light-dark()` (101 uses) and the `@media (color-gamut: p3)` blocks survived minification.
- `data-accent="indigo"` on `<html>` themed the shadow DOM of the probe element. Its button background equalled `--line-accent-solid`: `rgb(62, 99, 221)` (`#3e63dd`) in Chromium and Firefox, and `color(display-p3 0.276 0.384 0.837)` in WebKit, which takes the P3 branch.
- The `line-themes` barrel holds the role maps of all 31 accent hues and the gray hues. It is 73,296 B raw and 5,890 B gzipped, against 3,975 B for one hue palette (`line-colors/indigo`). Every `data-accent` value needs its palette imported (Getting Started guide, `apps/storybook/stories/getting-started.mdx`).

### 2.6 Q6: `deploy-site.yml`

- `on.push.paths` already lists `packages/**`, so a package change rebuilds and redeploys the site.
- The build job runs `bun --filter './packages/*' build && bun --filter '@websublime/line-site' build` (AM-029). Packages must emit `dist/` first, because the site imports `line-core`'s `dist/index.js` and the CSS `dist/` files. Probe 3.2 ran exactly this command.
- The deploy job checks out `/package.json`, `/bun.lock`, `/.bun-version`, `/packages/*/package.json` and `/apps/*/package.json`, then runs `bun install --frozen-lockfile --ignore-scripts` (AM-068). Probe 3.7 replayed that install with the site's new workspace devDependencies. It exited 0, linked the four packages, and `bun x --no-install wrangler --version` in `apps/site` printed `4.148.0`.
- `checks.yml` runs `bun run build`, which builds every app, so a pull request that breaks the site build fails checks. A dropped side-effect script (§2.2) passes it.
- `playwright.config.ts` already matches `apps/**/*.e2e.ts`. An e2e test for the site needs a `webServer` entry for the built site; none exists today.

## 3. Probes

All probes ran on 2026-10-19 in `mktemp -d` (`r12-probe-*`) with `HOME=<tmp>`, `PLAYWRIGHT_BROWSERS_PATH` pointed at the developer's Playwright cache, and `ASTRO_TELEMETRY_DISABLED=1`. The directory was deleted afterwards. Bun 1.4.3, Astro 7.3.8, Vite 8.3.4, Lit 3.3.3, Playwright 1.64.0. Gzip sizes are Python `gzip` level 9.

### 3.1 Setup and baseline

| Command | Exit | Observation |
|---|---|---|
| `git -C <worktree> archive HEAD \| tar -x -C <tmp>/repo` | 0 | HEAD `a9369ad` |
| `git init -q && git add -A && git commit -qm base` | 0 | |
| `bun install --frozen-lockfile` | 0 | 704 packages, 17.6 s |
| `bun --filter './packages/*' build && bun --filter '@websublime/line-site' build` | 0 | 25.8 s; 1 page |

Baseline `dist/`: `index.html` 1,122 B (599 B gz), `favicon.svg` 728 B. No JS and no CSS file; the placeholder inlines its `<style>`.

### 3.2 Throwaway page with a `LineElement` subclass

- `apps/site/package.json` gained devDependencies `@websublime/line-core`, `line-tokens`, `line-colors`, `line-themes` (`workspace:^`) and `lit ^3.3.3`; `bun install` exit 0.
- `src/probe/line-probe.ts` defines `line-probe`, a `LineElement` subclass with `commonReset`, `buttonReset` (from `@websublime/line-core/styles`) and one Lit `css` sheet that paints the button with `--line-accent-solid`.
- `src/pages/probe-subclass.astro` imports the four CSS entries in the frontmatter, sets `<html data-accent="indigo">`, holds `<line-probe>Click</line-probe>`, a processed `<script>import '../probe/line-probe.ts';</script>` and `<style is:global>line-probe:not(:defined) { opacity: 0; }</style>`.
- `bun --filter '@websublime/line-site' build` → exit 0, 4.4 s.

| File | Raw B | Gzip B |
|---|---:|---:|
| `_astro/dist.<hash>.css` (tokens + indigo + slate + themes) | 88,051 | 10,982 |
| `_astro/probe-subclass…<hash>.js` (Lit + `LineElement` + 2 resets + probe) | 22,291 | 7,831 |
| `probe-subclass/index.html` | 475 | 329 |

Inputs of the CSS chunk (`dist/` files): tokens 15,654 / 3,113; indigo 3,975 / 952; slate 4,073 / 964; themes 73,296 / 5,890; the full `line-colors` barrel, not imported, 123,326 / 23,896.

### 3.3 The hello-world fixture and `sideEffects`

- `src/pages/probe-fixture.astro` used the same CSS and `<script>import '../../../../packages/line-core/__tests__/integration/hello-world/line-hello-world.ts';</script>`.
- Build exit 0. `probe-fixture/index.html` (385 B) had no `<script>`, and `dist/_astro/` held no chunk for it.
- With `line-core`'s `sideEffects` set to `["./__tests__/**"]` in the throwaway copy, a rebuild (exit 0, 2.5 s) emitted the script tag and these files:

| File | Raw B | Gzip B |
|---|---:|---:|
| `_astro/lit.<hash>.js` (shared Lit chunk) | 14,876 | 5,693 |
| `_astro/probe-fixture…<hash>.js` (Zag core, `LineElement`, `LineMachineController`, resets, fixture) | 22,607 | 7,845 |
| `_astro/probe-subclass…<hash>.js` (now without Lit) | 7,442 | 2,414 |
| `probe-fixture/index.html` | 493 | 337 |

- The `sideEffects` edit was reverted after the browser probes.

### 3.4 Browser upgrade (`bun probe-browser.mjs`, exit 0)

Served `dist/` (the 3.3 rebuild) with `python3 -m http.server`, then loaded both pages in Playwright Chromium, Firefox and WebKit.

| Check | Chromium | Firefox | WebKit |
|---|---|---|---|
| `line-probe` `:defined` at `DOMContentLoaded` | yes | yes | yes |
| Shadow root, `adoptedStyleSheets` | yes, 3 | yes, 3 | yes, 3 |
| Button background = `--line-accent-solid` | `rgb(62, 99, 221)` | `rgb(62, 99, 221)` | `color(display-p3 0.276 0.384 0.837)` |
| Document cascade layers | `line` | `line` | `line` |
| Fixture `data-state` before → after click | idle → active | idle → active | idle → active |

### 3.5 Lit SSR through the community integration

| Command | Exit | Observation |
|---|---|---|
| `bun add -d @semantic-ui/astro-lit@5.3.0 @webcomponents/template-shadowroot@0.2.1` | 0 | |
| `bun --filter '@websublime/line-site' build` with `integrations: [lit()]` and `<LineProbe client:load>` | 1 | `[ERROR] [build] Caught error rendering /probe-ssr: ReferenceError: CSSStyleSheet is not defined` from the bundled `createSheet()` |
| Same build with the SSR page removed and the integration still configured | 0 | `index.html` 1,516 B; `before-hydration.js` 5,768 B; `client.js` 599 B |
| `git checkout -- apps/site/astro.config.mjs`, `bun remove …` | 0 | Integration removed; rebuild matched 3.2 |

### 3.6 Throttled upgrade (`bun probe-throttle.mjs`, exit 0)

Chromium, `page.route('**/_astro/*.js')` delayed 1,500 ms, on `/probe-subclass/` of the 3.3 build.

| Time | `readyState` | `:defined` | Shadow root | Opacity | Paint entries |
|---|---|---|---|---|---|
| 700 ms | `interactive` | false | none | 0 | first-paint 20 ms, first-contentful-paint 20 ms |
| upgrade | `complete` | true | yes | 1 | `domContentLoadedEventStart` 3,021 ms |

### 3.7 Deploy-job replay

| Command | Exit | Observation |
|---|---|---|
| Copy `package.json`, `bun.lock`, `.bun-version`, `packages/*/package.json`, `apps/*/package.json` into an empty dir | 0 | The AM-068 sparse set |
| `bun install --frozen-lockfile --ignore-scripts` | 0 | 704 packages; `apps/site/node_modules/@websublime/` links four packages |
| `bun x --no-install wrangler --version` in `apps/site` | 0 | `4.148.0` |
| `bun run scripts/lint-layers.mjs` on the probe copy | 0 | "lint-layers: OK" with the site devDependencies |

## 4. Fit with line://ui

- **MANIFESTO Principle 5.** The site uses the tags with a plain `<script>` and no framework integration, which is the "no adapters" path.
- **MANIFESTO Law 6 and ARCHITECTURE §12.** The site depends on the `sideEffects` list being complete (§2.2). The landing page is a consumer that exercises the contract on every build.
- **MANIFESTO Law 8.** A `:not(:defined)` rule that hides content trades the no-JavaScript fallback for no flash (§2.4).
- **MANIFESTO Law 10 and the Getting Started guide.** The site can load tokens alone, single palettes and the themes barrel or its subpaths (§2.5).
- **PRD §5.3.** It names "Astro + MDX". `apps/site` has no MDX integration today. The O3 (b) scope is a landing page, which needs none.
- **PRD §1.7, plan §3.** SSR/SSG stays post-Phase 1, and §2.3 records what it would require.
- **Phase 00 spec §5 and AM-029.** The site adds `@websublime/*` as `devDependencies`, and the two-phase build already orders packages before apps.
- **Phase 00 spec AM-046 and §10 D7.** Static output with no adapter holds. The D7 revisit trigger ("server-side features") is not touched by client-side upgrade.
- **Phase 00 spec AM-068.** The build and deploy jobs work unchanged (§2.6).

## 5. Contradictions

None found against the plan, PRD §5.3 or ARCHITECTURE.

- The Phase 00 spec §6.F.6 scaffold tree (`docs/specs/00-spec-design-system.md` lines 2254–2263) lists `package.json`, `astro.config.mjs`, `src/pages/index.astro` and `public/favicon.svg`. `apps/site` also holds `README.md` and `tsconfig.json`, and the tree's comment says `"astro": "^7.x"` where the §6.A.3 row (line 463) says `^7.3.8`. This is minor drift in Phase 00 record and changes no design.
- Plan §5.4 O4.a (line 392) describes `deploy-site.yml` as one job. AM-068 (row `00-Z28`) has since split it in two. The plan row records the state at the 2026-10-13 gate, so this is history, not a contradiction.
- Two upstream documents disagree with observation. The lit.dev SSR overview calls declarative shadow DOM not yet supported in all major browsers (§2.3). The Astro styling guide requires `vite.ssr.noExternal` for extensionless CSS imports, which workspace links did not need (§2.5).

## 6. Open questions for the spec

1. **Unupgraded state.** Options: a `:not(:defined)` rule with `visibility: hidden`, with `opacity: 0`, with reserved dimensions, or no rule. Evidence that decides: layout shift measured on the real landing page at upgrade, the content shown when JavaScript fails (Law 8), and whether the rule lives in the site or in `line-themes`.
2. **Theme CSS scope.** Options: the `line-themes` barrel (73,296 B raw / 5,890 B gz), or `./semantics`, `./defaults`, `./aliases` plus the `./accent/<hue>` and `./gray/<hue>` maps the page uses. Evidence: whether the subset covers every role the used components read, and whether the site keeps the guide's recommended setup for dogfooding value.
3. **Registration guard.** Options: a Playwright `apps/site/**/*.e2e.ts` test that asserts every `line-*` tag on the built page is `:defined`, a build-time check of the emitted HTML, or reliance on review. Evidence: the silent drop in §2.2, and the cost of a `webServer` entry that serves `apps/site/dist` in `checks.yml`.
4. **Script layout and preloading.** Options: one shared module that imports every used subpath, or one `<script>` per section, with or without hand-written `<link rel="modulepreload">` for shared chunks. Evidence: the chunk graph Vite emits for the real component set and the waterfall in §2.4 measured on a throttled profile.
5. **Stylesheet delivery.** Options: Astro's default (linked above 4 kB) or `build.inlineStylesheets: 'always'`. Evidence: first paint with an 11 kB gzipped render-blocking stylesheet versus caching across future site pages.
6. **SSR trigger.** SSR stays out of Phase 1. If a later phase opens it, the evidence it needs is a `line-core` reset-sheet strategy that runs in Node (or a `CSSStyleSheet` shim), an Astro 7 compatible Lit integration on `@lit-labs/ssr` 4.x, and LineMachineController behaviour without `hostConnected` on the server.

## 7. Sources

All retrieved 2026-10-19.

- Astro docs, Scripts and event handling: https://docs.astro.build/en/guides/client-side-scripts/
- Astro docs, Styling (npm stylesheets, bundle control): https://docs.astro.build/en/guides/styling/
- Astro docs, Upgrade to v5 (script rendering, Lit removal): https://docs.astro.build/en/guides/upgrade-to/v5/
- Astro docs, Lit integration (deprecated): https://docs.astro.build/en/guides/integrations-guide/lit/
- Astro changelog 7.4.0: https://github.com/withastro/astro/blob/main/packages/astro/CHANGELOG.md
- Semantic-Org/Astro-Lit README: https://github.com/Semantic-Org/Astro-Lit/blob/main/README.md
- Lit SSR overview: https://lit.dev/docs/ssr/overview/
- Lit SSR client usage: https://lit.dev/docs/ssr/client-usage/
- Lit SSR authoring: https://lit.dev/docs/ssr/authoring/
- `web-features` 3.43.0 `data.json` (declarative-shadow-dom, autonomous-custom-elements, cascade-layers, light-dark): https://unpkg.com/web-features/data.json
- npm registry (`npm view <pkg> version time --registry=https://registry.npmjs.org`): `astro`, `@astrojs/lit`, `@semantic-ui/astro-lit`, `@lit-labs/ssr`, `@lit-labs/ssr-client`, `@lit-labs/ssr-dom-shim`, `lit`, `@webcomponents/template-shadowroot`
