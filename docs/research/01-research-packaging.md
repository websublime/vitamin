# Research: Packaging — subpath exports, `sideEffects`, bundle splitting, CDN, size, first `line-genui` release

**Row:** `00-Z38` (Phase 1 plan §5.2 R9)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` (§1.1, §2.1 item 10, §2.2, §2.6, §2.7, §4.2, §5.2 R9, §5.5,
§6, §7.1, §7.4), `docs/PRD.md` (v0.8.17; §1.6, §1.7, §6.1, §6.2, §6.5, §7.1, §7.3, Appendix D),
`docs/ARCHITECTURE.md` (v0.8.3; §10, §12, §13.1, §13.2, §17.1, §17.4), `docs/specs/00-spec-design-system.md`
(§4.6, §4.7, §6.A A4, §6.F.2, §6.F.5, §7.2, AM-038, AM-041, AM-042, AM-066), `docs/PROCESS.md` §6,
`vite.config.shared.mjs`, `packages/line-components/{package.json,vite.config.mjs,src/index.ts}`,
`packages/line-core/{package.json,vite.config.mjs,src/**}`, `scripts/publish.mjs`, `scripts/verify-pack.mjs`,
`.changeset/config.json`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - A module that `sideEffects` marks pure is dropped, with everything it imports, when the importer uses none of
>   its exports. Vite 8.3.4, esbuild 0.28.2 and webpack 5.112.0 behave the same in 288 probe builds. Only esbuild
>   warns. A bare `import '@websublime/line-components/button'` registers nothing under today's `sideEffects: []`.
> - Listing "exactly the per-component dist files" (ARCHITECTURE §12) is not enough. Vite library mode moves a
>   `customElements.define()` into a hashed shared chunk when one component imports another, and then
>   `import '…/avatar'` registers nothing in all three bundlers. `["./dist/*.js"]` (chunks included), or no
>   `sideEffects` field at all, registers every documented tag. `sideEffects` cannot tree-shake subpaths
>   reached through the root specifier, which is the rationale §12 gives.
> - The shared Vite config externalises only `lit` and `@zag-js/*`, so the `line-components` build inlines
>   `line-core`. A consumer that imports both gets two `LineElement` classes, and `instanceof` returns `false`.
> - jsDelivr `/+esm` ran a `LineElement` + `LineMachineController` component in Chromium, Firefox and WebKit with no
>   import map, but it loaded two copies of `lit-html` and `@lit/reactive-element`. Raw unpkg files need an import
>   map with 14 entries and a `process` shim, because Zag's ESM reads `process.env.NODE_ENV`. Bare package URLs
>   404 on both CDNs, because the `exports` maps carry no `default` condition and the manifests no `main`.
> - Lit alone weighs 5943 B gzipped and Zag core + vanilla 5390 B (`gzip -9 -n`), so a per-component target under
>   5 KB holds only when the shared runtime is excluded. Component-only weights in the probe were 219–473 B.
> - npm trusted publishing still needs the package to exist, and an unvalidated configuration expires after
>   48 hours. Since 2026-10-02, `npm stage publish` from a local session can create a new package without a
>   token. A `minor` changeset on `line-genui@0.0.0` yields `0.1.0`, and on `0.1.0` it yields `0.2.0`.

## 1. Question

Plan §5.2 R9 reads: "Umbrella subpath exports and `sideEffects`, bundle-splitting verification, CDN delivery
(unpkg, jsDelivr) of ESM builds, the per-component soft size target (< 5 KB gzipped, PRD §1.7), npm trusted
publishing for a new package and its first version".

- **Q1.** Which `sideEffects` shapes keep or drop `customElements.define()` registrations in Vite 8 (Rolldown),
  esbuild and webpack 5, for the ARCHITECTURE §12 families and independents?
- **Q2.** How can plan §7.4 "Bundle splitting verified — families and independents work as documented" be checked?
- **Q3.** What do unpkg and jsDelivr serve for the line packages, and what does a consumer need for `lit` and
  `@zag-js/*` (bare specifiers, `?module`, `+esm`, import maps)?
- **Q4.** How can the < 5 KB gzipped soft target be measured reproducibly, and what counts?
- **Q5.** Can a trusted publisher be configured for `@websublime/line-genui` before its first publish (plan P4)?
- **Q6.** What first version does the Changesets rule produce for `line-genui` (plan §2.7, §5.5)?

## 2. Findings

### 2.1 `sideEffects` and subpath exports (Q1)

**Repo state (2026-10-19).**

- `packages/line-components/package.json` declares `"sideEffects": []` and one export, `"."`. The Phase 00 spec
  §4.7 sets the same value.
- `packages/line-core/package.json` declares `"sideEffects": false`.
- `vite.config.shared.mjs:20` sets `external: [/^lit/, /^@zag-js\//]`. Nothing externalises `@websublime/*`.
- Published versions: `@websublime/line-core` `latest` 0.1.1, `@websublime/line-components` `latest` 0.1.0;
  `@websublime/line-genui` returns E404.

**Probe shape.** The probe follows the ARCHITECTURE §10 layout. Each subpath entry is `src/<c>/index.ts`, which
re-exports `./<c>.js`. The define lives in that non-entry module. `button`, `avatar` and `toggle` (a copy of the
`line-core` hello-world, which runs a Zag machine) are independents. `dialog` is a family that registers
`line-dialog` and `line-dialog-trigger`. `avatar-group` does `import '../avatar/avatar.js'`, the way a component
that renders another would. The root `index.ts` exports a constant and a type only.

**Bundler semantics.** A module marked side-effect-free is evaluated only if the importer uses one of its exports.
Otherwise the bundler skips the module and the modules it imports. esbuild prints `[ignored-bare-import]` "Ignoring
this import because … was marked as having no side effects". Vite and webpack drop the import silently. The webpack
tree-shaking guide lists "Re-exports with Side Effects" as a known pitfall.

**Consumer matrix.** Line-core inlined (today's config), 7 scenarios × 4 `sideEffects` values × 3 bundlers. All 84
builds exited 0, and all three bundlers produced the same tag set in every cell.

| `sideEffects` in the published manifest | `import '…/button'` | `import '…/avatar'` | `import '…/avatar-group'` | `import '…/dialog'` | `import { LineButton }`, used | `import { LineButton }`, unused | `import { VERSION } from '…'` |
|---|---|---|---|---|---|---|---|
| `[]` (today) | none | none | none | none | button | none | none |
| entry files only (`./dist/button.js`, …) | button | **none** | avatar-group only | both dialog tags | button | button | none |
| `["./dist/*.js"]` (chunks included) | button | avatar | avatar + avatar-group | both dialog tags | button | button | none |
| field absent (`true`) | button | avatar | avatar + avatar-group | both dialog tags | button | button | none |

- The `avatar` failure comes from chunking. With `avatar-group` importing `avatar.ts`, Rolldown emits
  `dist/avatar-CpRBFxD2.js` with the define. `dist/avatar.js` becomes `export { t as LineAvatar } from
  "./avatar-CpRBFxD2.js"`, and `dist/avatar-group.js` does `import "./avatar-CpRBFxD2.js"`. The hashed chunk is
  outside an entry-file list.
- No `button` bundle contained Zag code or another component's tag. The root import bundle was 116 bytes and
  contained no component.
- ARCHITECTURE §13.1 says SplitButton "bundles both internally" (Button and Menu), so cross-component imports are
  planned in the catalogue.

**The package's own build reads the same field.** With `sideEffects: []`, `vite build` of `line-components`
dropped `import '../avatar/avatar.js'` from `avatar-group`. `line-avatar` was never registered by that subpath.
With `true`, with the field absent, or with `["./src/**/*.ts"]`, the import survived as `import
"./avatar-<hash>.js"`. When the imported file is itself a lib entry, neither effect appears (cross-check by the
R12 research row, 2026-10-19).

**Other build shapes.**

| Build | `sideEffects` | Result in all 3 bundlers |
|---|---|---|
| `@websublime/*` external, default chunks | entry files only | `import '…/avatar'` registers nothing; the rest as documented |
| `@websublime/*` external, default chunks | `["./dist/*.js"]` | every documented tag |
| `output.preserveModules: true` | entry files only | every bare import registers nothing; `dist/button.js` is `export { LineButton } from "./button/button.js"` |
| `output.preserveModules: true` | `["./dist/*/*.js"]` only | every bare import registers nothing; the entry re-export file is pure |
| `output.preserveModules: true` | entry files + `./dist/*/*.js`, or `./dist/**/*.js`, or absent | every documented tag |

- Every file on the path from a subpath entry to its `define()` must be side-effectful. A pure file anywhere on
  that path drops the registration.
- `await import('@websublime/line-components/avatar')` with no export used registered the component in all three
  bundlers, under `[]`, entry files only and `./dist/*.js`. The lazy `load()` that ARCHITECTURE §17.4 prescribes
  for `line-genui` is unaffected by the field.

**Root specifier.** A hypothetical root barrel (`export *` from every component) tested the §12 rationale.

| `sideEffects` | `import { VERSION }` from root | `import { LineButton }` from root |
|---|---|---|
| component files listed (`./dist/*.js`) | all 6 tags, all 3 bundlers | all 6 tags |
| components and chunks listed, `index.js` pure | all 6 tags in Vite and esbuild, none in webpack | button |
| `[]` | none | button |

- Listing component files makes them non-removable. Unused components reached through a root re-export are
  removed only when they are marked pure. With no barrel (§12), unused subpaths never enter the module graph,
  whatever `sideEffects` says.

**`line-core` is inlined into `line-components`.** The `line-components` dist chunk `styles-<hash>.js` held
`line-core`'s mixins, `LineElement` and all 11 reset sheets. A consumer bundle importing `LineElement` from
`@websublime/line-core` and `LineButton` from `…/button` contained two copies of the Direction and Inspector
mixins. At run time on happy-dom, `LineButton.prototype instanceof LineElement` printed `false`. With
`/^@websublime\//` added to `external`, `dist/toggle.js` imports `@websublime/line-core` and
`@websublime/line-core/styles` instead.

**`line-core/styles` is not tree-shakable per sheet.** `dist/styles/index.js` builds each sheet with a top-level
call (`var f = d(t), …`) and no `/* @__PURE__ */` annotation. Importing `commonReset` alone bundled all 11 sheets,
1161 B gzipped.

### 2.2 Verifying bundle splitting (Q2)

The probe ran four checks, each cheap enough for CI.

| Check | What it proves | Probe evidence |
|---|---|---|
| Registration harness: import one subpath in a fresh realm, wrap `customElements.define`, record names | Each entrypoint registers exactly the ARCHITECTURE §12 tag set, family or independent | `bun registers.mjs <subpath>` on happy-dom printed `[]` for the root, `["line-dialog","line-dialog-trigger"]` for `./dialog`, `["line-avatar","line-avatar-group"]` for `./avatar-group` |
| Consumer-bundle matrix: bare import, named import and root import of each subpath through Vite, esbuild and webpack | Registrations survive tree-shaking in each bundler | §2.1 tables; the runtime harness ignores `sideEffects`, so it misses the drops this check catches |
| Isolation scan of each consumer bundle (tag strings, esbuild `--metafile` inputs) | "A button must not drag in a dialog" (§12) | `button` bundles held no other tag and no Zag code |
| Static dist check: every `.js` file reachable from an `exports` target is covered by `sideEffects` or the field is absent | The §2.1 path rule holds for every chunk name the build emits | Derived from §2.1; hashed chunk names change per build, so a list of literal names goes stale |

- Retrospective lesson 5 ("Test the built artifact", plan §8) applies. The probe built from `dist/` with the
  published `exports` map, not from `src/`.
- esbuild's `ignored-bare-import` warning is the only built-in signal. Vite and webpack give none.
- The same harness answers the `line-genui` exit criterion "Importing `@websublime/line-genui/catalog` defines no
  element; importing `@websublime/line-genui/a2ui` defines only `line-a2ui-surface`" (plan §7.2).

### 2.3 CDN delivery (Q3)

**Endpoints (curl, 2026-10-19).**

| URL | Result |
|---|---|
| `unpkg.com/@websublime/line-core@0.1.1/dist/index.js` | 200 on retry; bare `lit` and relative imports kept. First tries timed out at 30 s and returned 500 |
| `unpkg.com/…/dist/index.js?module` | 200; `lit` rewritten to `https://unpkg.com/lit@^3.3.3?module`, relative paths gain `?module` |
| `unpkg.com/@websublime/line-core@0.1.1` and `…/machine` | 404 `Not found` |
| `unpkg.com/@websublime/line-tokens@0.1.0/package.json` | 503 `error code: 1102` after 65 s |
| `cdn.jsdelivr.net/npm/@websublime/line-core@0.1.1/dist/index.js` | 200, raw, bare `lit` kept, `access-control-allow-origin: *`, `max-age=31536000, immutable` |
| `cdn.jsdelivr.net/npm/@websublime/line-core@0.1.1/+esm` | 200, "Bundled by jsDelivr using Rollup v4.62.2 and esbuild v0.28.1", `lit` rewritten to `/npm/lit@3.3.3/+esm` |
| `cdn.jsdelivr.net/npm/@websublime/line-core@0.1.1/machine/+esm` | 200; resolves the `./machine` export; imports `/npm/@zag-js/vanilla@1.46.0/+esm` |
| `cdn.jsdelivr.net/npm/@websublime/line-core@0.1.1` | 404 "Couldn't resolve the default file in @websublime/line-core." |
| `esm.unpkg.com/@websublime/line-core@0.1.1/machine` | 200, bundled, imports `https://esm.unpkg.com/@zag-js/vanilla@1.46.0`; the package root timed out at 60 s and `@zag-js/store` returned 520 `BUILD_FAILED` once |

- jsDelivr resolves the default file from `jsdelivr`, then `browser`, then `main` (jsDelivr README). unpkg uses the
  `default` export condition, or an `unpkg` field or condition (unpkg.com docs). The line `exports` maps carry only
  `types` and `import`, and no manifest has `main`, so both CDNs 404 on a bare package URL.
- The unpkg.com docs no longer describe `?module` for JavaScript. They point no-build apps to import maps and to
  `esm.unpkg.com`. `?module` still rewrote imports on 2026-10-19.
- jsDelivr's esm page says to use its main domain in production "once this feature is out of beta".

**Browser run.** Playwright, the repo's Chromium 1248, Firefox 1555 and WebKit 2370 builds. The page imported
`LineElement` and `LineMachineController` from `@websublime/line-core@0.1.1`, plus `html` from Lit and
`createMachine` from `@zag-js/core`, defined a toggle, clicked it, and expected `idle → active`.

| Page | Chromium | Firefox | WebKit | Lit copies (`litHtmlVersions`, `reactiveElementVersions`) |
|---|---|---|---|---|
| jsDelivr `+esm`, no import map | pass, 16 requests | pass | pass | 2, 2 |
| unpkg `?module` | fail: `process is not defined` in `@zag-js/store`, Law 9 fallback rendered | fail (cold): CORS and MIME errors on unpkg responses | fail: `process` | 1, 1 |
| unpkg `?module` + `globalThis.process = { env: { NODE_ENV: 'production' } }` | pass, 97 requests | not re-run | pass | 1, 1 |
| unpkg raw + import map for `lit`, `@zag-js/vanilla`, `@zag-js/core` only | fail: bare `@lit/reactive-element` not mapped | fail, same | fail, same | 0 |
| unpkg raw + full import map (14 entries) | fail: `process` | fail (cold): CORS | fail: `process` | 1, 1 |
| unpkg raw + full import map + `process` shim | pass, 84 requests | not re-run | pass | 1, 1 |

- The full map needs `lit`, `lit/`, `@lit/reactive-element`, `@lit/reactive-element/`, `lit-element/`, `lit-html`,
  `lit-html/`, `@zag-js/vanilla`, `@zag-js/core`, `@zag-js/store`, `@zag-js/utils`, `@zag-js/types`,
  `@zag-js/dom-query` and `proxy-compare`.
- `process.env.NODE_ENV` appears in `@zag-js/store/dist/utils.mjs`, `@zag-js/utils/dist/guard.mjs` and
  `@zag-js/utils/dist/warning.mjs` (1.46.0). jsDelivr's `+esm` build of `@zag-js/core` contains no `process.env`.
- jsDelivr pins versions inside each bundle at build time. `lit@3.3.3/+esm` side-imports `lit-html@3.3.2` and
  `@lit/reactive-element@2.1.2`, while `lit-element@4.2.2/lit-element.js/+esm` imports `lit-html@3.3.1` and
  `@lit/reactive-element@2.1.1`. That explains the two copies.
- The Firefox failures in the first run were CORS and MIME errors on cold unpkg responses. The same URLs returned
  200 with `access-control-allow-origin: *` minutes later. The error responses lacking the CORS header is an
  inference.
- Not probed: `@websublime/line-components` over a CDN, because no published version has components yet. With
  `line-core` inlined (§2.1), a CDN page that also loads `line-core` would load two `LineElement` classes
  [INFERENCE].

### 2.4 Per-component size (Q4)

**Measurements.** esbuild 0.28.2 bundled each case with `--bundle --minify --format=esm --target=es2022`. Python 3
`gzip.compress(data, 9, mtime=0)` produced the gzip column, which matches the CLI `gzip -9 -n`. Node
`zlib.gzipSync` at level 9 gives slightly larger numbers (5974 B for Lit, 5401 B for Zag core + vanilla, per the
reviewer lens). Node `zlib.brotliCompressSync` at quality 11 produced the brotli column. The probe components come
from §2.1, with `@websublime/*` external.

| Bundle | Minified B | gzip-9 B | brotli-11 B |
|---|---|---|---|
| Lit 3.3.3 (`LitElement`, `html`, `css`) | 15468 | 5943 | 5396 |
| `line-core` `LineElement` (Lit external) | 3073 | 1233 | 1051 |
| `line-core/styles` (any import, all 11 sheets) | 4133 | 1161 | 960 |
| `line-core/machine` controller (Zag external) | 895 | 469 | 402 |
| `@zag-js/core` + `@zag-js/vanilla` | 14478 | 5390 | 4954 |
| `@zag-js/presence` `machine` + `connect` (rest of Zag external) | 4115 | 1480 | 1325 |
| probe button, component only (Lit, `line-core`, Zag external) | 306 | 219 | 165 |
| probe toggle with a machine, component only | 891 | 473 | 402 |
| probe dialog family (2 tags), component only | 489 | 237 | 182 |
| probe button, everything bundled | 22439 | 7881 | 7117 |
| probe toggle, everything bundled | 38211 | 13468 | 12231 |
| probe button + toggle, everything bundled | 38384 | 13509 | 12290 |

- Lit alone exceeds 5 KB gzipped, so every component fails the target once the shared runtime counts. The
  second component adds only its own bytes (button + toggle is 41 B more than toggle alone).
- The Vite build report lists gzip per emitted file and excludes externals and shared chunks. Its 0.58 kB for
  `dist/toggle.js` matched `gzip -9 -n` on the same file (582 B).
- size-limit 14.2.0 (`@size-limit/esbuild`, `@size-limit/file`) uses brotli quality 11 by default and gzip level 9
  with `gzip: true`; `ignore` takes package names. It reported 312 B for the button and 555 B for the toggle
  (component only, gzip), against 219 B and 473 B from plain esbuild + gzip on the same files. Each tool needs its
  own baseline.
- PRD §1.6 says "Monitored, not blocking", and plan §7.1 asks that each size be "measured and reported".

### 2.5 Trusted publishing for a new package (Q5)

- **The package must exist.** The `npm trust` docs (npm 12.2.0, last edited 2026-06-02) say "The package you're
  configuring must already exist on the npm registry." The website flow starts at the package's settings page
  (trusted-publishers docs, last commit 2026-10-06). Neither describes a pending publisher.
- **48-hour expiry.** Since 2026-10-02 an unvalidated configuration "expire[s] 48 hours after creation", and its
  first successful publish validates it (GitHub changelog). The docs add that it binds the configuration "to the
  repository's immutable identity". The change answers a slug-reclaim attack reported by Bloom Security (The
  Hacker News, 2026-10-13).
- **Staged publishing can now create a package.** The GitHub changelog of 2026-10-02 says "You can now create a
  new npm package with `npm stage publish`, using a local session or a granular access token, including a stage-only
  token." The first version waits in the staged queue until a maintainer approves it with 2FA. "After package
  creation, you can manage its settings and configure trusted publishing."
- Staging a package that does not exist publishes a public placeholder `0.0.0-stage` (staged-publishing docs, last
  commit 2026-09-29). That matches the five `0.0.0-stage` versions AM-042 recorded and AM-066 deprecated.
- `npm stage publish` and `npm trust` need npm ≥ 11.15.0, and staged publishing also needs Node ≥ 22.14.0.
  `npm trust` needs account 2FA and rejects granular tokens that bypass 2FA.
- The docs disagree on the configuration limit. The `npm trust` page says "the registry only supports one
  configuration per package". The trusted-publishers page and the 2026-09-03 changelog allow up to 10.
- Configurations created after 2026-09-03 allow `npm stage publish` by default, and `npm publish` must be ticked.
  AM-038 step (4) already ticks it.
- AM-042 recorded two first-publish effects. When a package had no `latest`, npm set `latest` to the version
  published with `--tag canary`. Five packages also got `0.0.0-stage`.
- `scripts/publish.mjs` treats an E404 from `npm view` as "new" and publishes, so the publisher needs no change for a
  ninth package. P3 still extends its coverage (plan §4.2).

**Bootstrap paths for `@websublime/line-genui`.**

| Path | Steps | Leaves behind |
|---|---|---|
| A. AM-038 order | Short-lived granular token in the `npm` environment publishes a canary through `snapshot-deploy.yml`, token deleted, trusted publishers added, OIDC canary within 48 h, then "Require 2FA and disallow tokens" | A token-published first version without provenance; `latest` on the canary until a stable (AM-042) |
| B. Local staged create | Miguel runs `npm stage publish` (session, 2FA), approves, adds trusted publishers, then a CI publish validates them within 48 h | A public `0.0.0-stage` placeholder (deprecated by AM-066 for the other five); no token |
| C. Local direct publish | Miguel runs `npm publish` from a session with 2FA, then the same trusted-publisher steps | A locally built first version without provenance; no token |

### 2.6 First `line-genui` version under Changesets (Q6)

`@changesets/cli` 2.31.1 (the repo's version; npm `latest` is 3.0.3, 2026-09-14), run in the probe copy.

| Manifest version | Changeset | `changeset version` result |
|---|---|---|
| `0.0.0` | `minor` | `0.1.0` |
| `0.0.0` | `patch` | `0.0.1` |
| `0.0.0` | `major` | `1.0.0` |
| `0.1.0` | `minor` | `0.2.0` |
| `0.1.0` | `patch` | `0.1.1` |
| `0.0.0` | `minor`, `--snapshot` | `0.1.0-<40-char sha>-SNAPSHOT` |

- PROCESS §6 says "Once a phase's minor release has shipped, further changesets in that phase use `patch`, even
  for new capability, so the next minor stays the next phase's version". Phase 1 is `v0.2.0` (PRD §7.3).
- The other eight packages sit at `0.1.x` today, from `0.1.0` (`line-components`, `line-icons`, `line-utils`) to
  `0.1.3` (`line-colors`, `line-tokens`).
- `changeset version --snapshot` failed under the repo's `@changesets/changelog-github` without a GitHub token, so
  the snapshot row ran with `changelog: false` in the throwaway copy.

## 3. Probes

All probes ran on 2026-10-19 in `/tmp/r9probe.2VJm` (a `git archive HEAD` copy of `e89db15` plus `git init`), with
`HOME` set to the temp dir. The directory was deleted afterwards.

| # | Command | Exit | Observed |
|---|---|---|---|
| 1 | `git archive HEAD \| tar -x`, `git init`, `bun install` | 0 | 704 packages |
| 2 | `bun run build` in `line-core`, then in `line-components` with the probe components and `sideEffects: []` | 0, 0 | `avatar-group.js` lacks the `avatar` import; `styles-<hash>.js` holds `line-core` |
| 3 | `line-components` build with `sideEffects` `true`, absent, `["./src/**/*.ts"]` | 0 ×3 | `dist/avatar-<hash>.js` holds the define; `avatar-group.js` imports it |
| 4 | `npm install lit@3.3.3 @zag-js/core@1.46.0 @zag-js/vanilla@1.46.0 vite@8.3.4 esbuild@0.28.2 webpack@5.112.0` | 0 | consumer project |
| 5 | Consumer matrix, `line-core` inlined: `npx vite build`, `npx esbuild --bundle --format=esm`, webpack 5 Node API `mode: 'production'` | 0 ×84 | §2.1 matrix; esbuild `ignored-bare-import` warning under `[]` |
| 6 | Builds with `/^@websublime\//` external, default chunks and `PRESERVE=1` (`output.preserveModules`) | 0, 0 | §2.1 other build shapes |
| 7 | Consumer matrices on build 6 (8 package variants × 7 scenarios × 3 bundlers) | 0 ×168 | §2.1 table |
| 8 | Root-barrel matrix (3 values × 2 scenarios × 3 bundlers) | 0 ×18 | §2.1 root specifier table |
| 9 | Dynamic `import()` matrix (3 values × 2 scenarios × 3 bundlers) | 0 ×18 | registered in every cell |
| 10 | `bun run.mjs` (happy-dom) on an esbuild bundle of `LineElement` + `LineButton` | 0 | prints `false` |
| 11 | `bun registers.mjs <subpath>` for 6 subpaths | 0 ×6 | §2.2 tag sets |
| 12 | esbuild `--minify` + zlib gzip 9 / brotli 11 for 12 bundles | 0 | §2.4 table |
| 13 | `npx size-limit --json` (3 checks, limit 5 kB) | 1 | the everything-bundled toggle failed at 13497 B, as intended |
| 14 | `curl` on unpkg, jsDelivr and esm.unpkg.com URLs | — | §2.3 endpoint table |
| 15 | `node cdn-probe.mjs` (Playwright; 4 pages × 3 engines, then 5 unpkg pages × Chromium and WebKit) | 0, 0 | §2.3 browser table |
| 16 | `changeset version` with a probe `line-genui` (5 cases) | 0 ×5 | §2.6 table |
| 17 | `changeset version --snapshot` with `changelog-github`, then with `changelog: false` | 1, 0 | `@changesets/get-github-info` error, then `0.1.0-<sha>-SNAPSHOT` |

## 4. Fit with line://ui

- **Law 6 and ARCHITECTURE §12.** §2.1 shows that bundle isolation holds (a button bundle carries no dialog and no
  Zag code). Registration through a bare import depends on the `sideEffects` value, the chunk layout, and on
  whether `line-core` is external.
- **ARCHITECTURE §13.1–§13.2.** SplitButton bundles Button and Menu (Phase 3). AvatarGroup has an overflow popover.
  Either shape produces the shared-chunk case of §2.1 if one component module imports another.
- **ARCHITECTURE §17.1, §17.4 and PRD §6.1.** `line-genui` depends on `line-core` and loads component subpaths with
  `import()`. Dynamic imports survive every `sideEffects` value. `line-core` inlined into `line-components` would
  give `line-genui` a second `LineElement`.
- **PRD §1.6–§1.7 and plan §7.1.** §2.4 measures the soft target. §2.3 tests the CDN promise.
- **Phase 00 spec §4.7, §6.F.2.** Both set today's `sideEffects: []` and `external` list. Changing either is a
  Phase 1 spec decision.
- **Phase 00 spec §7.2, AM-038, AM-041, AM-042, AM-066.** §2.5 maps the bootstrap order and its recorded effects
  onto one new package. The 48-hour rule and the `npm publish` tick are unchanged.
- **PROCESS §6 and plan §2.7, §5.5.** §2.6 gives the arithmetic. The choice stays with the spec.

## 5. Contradictions

- **C1 — `docs/ARCHITECTURE.md:438`, `docs/ARCHITECTURE.md:466`, `docs/PRD.md:699`.** These lines say the umbrella
  "declares `"sideEffects"` listing exactly the per-component dist files, so bundlers can tree-shake unused subpaths
  even when consumers use the root specifier". The probe contradicts both halves.
  - An entry-file list drops registrations whose `define()` sits in a shared chunk or a preserved module (§2.1).
    Correct registration needs every file on the import path, chunks included, to be side-effectful.
  - Listing a file makes it non-removable. Tree-shaking through the root specifier works when the files are marked
    pure, the opposite of the stated mechanism (§2.1 root specifier table). With no barrel, unused subpaths never
    enter the graph regardless of the field.
- **C2 — `docs/PRD.md:148`.** "ESM builds are CDN-compatible by default via the package.json `exports` field" holds
  only for transforming endpoints (jsDelivr `+esm`, esm.unpkg.com). Raw files on both CDNs keep bare `lit` and
  `@zag-js/*` specifiers. They need a 14-entry import map and a `process` shim. Bare package URLs return 404 on
  both CDNs, because neither reads an `exports` map that has only `types` and `import` conditions (§2.3).
- **Internal tension, Phase 3 — `docs/ARCHITECTURE.md:438` vs `docs/ARCHITECTURE.md:481`.** §12 says "Importing one
  component never imports or executes another". §13.1 says SplitButton "bundles both internally". Phase 1 is
  unaffected unless AvatarGroup imports Avatar.
- **Bootstrap paths B and C — `docs/PRD.md:859`, `docs/plans/01-plan-core-primitives.md:75`.** Both lines fix the
  `line-genui` trusted-publisher bootstrap "in the AM-038 order", which is path A (§2.5). Paths B and C depart from
  that order. Choosing either needs a PRD and plan revision before the spec.

## 6. Open questions for the spec

1. **`sideEffects` value for `line-components` (and `line-genui`).** The spec chooses one of four values.
   (a) The field is absent.
   (b) `["./dist/**/*.js"]` plus a source glob for the package's own build.
   (c) An explicit list with deterministic chunk names (`chunkFileNames`), checked by the §2.2 static check.
   (d) `[]` with a documented "named import or `import()` only" rule.
   The §2.1 matrices decide it. A barrel-free root makes (a) and (b) register every documented tag.
2. **Chunk layout.** The candidates are default Rolldown chunks, `preserveModules`, or a rule that no component
   module imports another, with families in one module tree. The §2.1 other build shapes and ARCHITECTURE §13.1
   SplitButton decide it.
3. **Externalise `@websublime/*` in the `line-components` and `line-genui` builds.** Evidence: duplicate mixins
   and `instanceof` `false` (§2.1). This needs an `AM-nnn` to Phase 00 spec §6.F.2 or a Phase 1 spec section.
4. **Bundle-splitting verification.** Which of the four §2.2 checks run, on which artifact (packed tarball or
   `dist/`), in which bundlers, and in which `checks.yml` step. Evidence: §2.2; only esbuild warns.
5. **CDN contract.** Which delivery path the docs promise (jsDelivr `+esm`, esm.unpkg.com, raw files plus an import
   map), whether manifests gain a `default` condition, `main`, `jsdelivr` or `unpkg`, how the `process` shim is
   documented or avoided, and whether two Lit copies under `+esm` are acceptable. Evidence: §2.3 tables.
6. **What the < 5 KB counts.** The target can count the component only with the runtime external, the
   first-component cost with everything bundled, or the marginal cost over a baseline of Lit + `line-core`. The
   spec also names the tool (esbuild + `gzip -9 -n`, size-limit, the Vite report) and the gzip level. §2.4 decides
   it. The first-component cost fails for every component, because Lit alone is 5943 B.
7. **Per-sheet tree-shaking of `line-core/styles`.** Whether the sheets gain `/* @__PURE__ */` or per-file
   entries. Evidence: all 11 sheets (1161 B gzipped) ride with any one import (§2.1).
8. **`line-genui` bootstrap path.** The spec picks path A, B or C (§2.5). Only path A matches the current PRD
   (`docs/PRD.md:859`) and plan (§2.1 item 10); B and C need a PRD and plan revision first (§5). What each path
   leaves behind decides it, and so does whether a `0.0.0-stage` placeholder or a version without provenance is
   acceptable.
9. **First `line-genui` version** (plan §5.5). The candidates are `0.1.0` (`0.0.0` + `minor`), `0.2.0` (manifest
   seeded at `0.1.0` + `minor`, aligned with the other packages at `v0.2.0`), or a canary first. Per AM-042 a canary
   first sets `latest` to the snapshot until a stable ships. §2.6, PROCESS §6 and PRD §7.1 decide it.

## 7. Sources

All retrieved 2026-10-19.

- npm registry, `npm view <pkg> version time`: `vite` 8.3.4 (2026-10-08), `rolldown` 1.2.14 (2026-10-14; Vite
  8.3.4 installs 1.2.13), `esbuild` 0.28.2 (2026-08-08), `webpack` 5.112.0 (2026-10-15), `lit` 3.3.3 (2026-05-14),
  `@zag-js/vanilla` 1.46.0 (2026-10-11), `size-limit` 14.2.0 (2026-10-07), `@changesets/cli` 3.0.3 (2026-09-14),
  `npm` 12.2.0 (2026-09-30); `@websublime/line-core` and `@websublime/line-components` dist-tags;
  `@websublime/line-genui` E404.
- webpack, "Tree Shaking" guide — https://webpack.js.org/guides/tree-shaking/
- esbuild, API (`ignored-bare-import`, side-effect annotations) — https://esbuild.github.io/api/#ignore-annotations
- Rolldown, `treeshake` options — https://rolldown.rs/reference/InputOptions.treeshake
- Vite, library mode — https://vite.dev/guide/build#library-mode
- npm, `package.json` `sideEffects` — https://docs.npmjs.com/cli/v11/configuring-npm/package-json#sideeffects
- unpkg docs (default entry, `unpkg` field and condition, import maps, esm.unpkg.com) — https://unpkg.com/
- jsDelivr README (default file from `jsdelivr`, `browser`, `main`) — https://github.com/jsdelivr/jsdelivr
- jsDelivr esm page (beta notice) — https://www.jsdelivr.com/esm
- size-limit — https://github.com/ai/size-limit; `@size-limit/file` 14.2.0 `index.js` (brotli 11 default, gzip
  level 9)
- npm, `npm trust` (npm 12.2.0, last edited 2026-06-02) — https://docs.npmjs.com/cli/v12/commands/npm-trust
- npm, "Trusted publishing for npm packages" (last commit 2026-10-06) — https://docs.npmjs.com/trusted-publishers/
  and https://github.com/npm/documentation/blob/main/content/packages-and-modules/securing-your-code/trusted-publishers.mdx
- npm, "Staged publishing for npm packages" (last commit 2026-09-29) — https://docs.npmjs.com/staged-publishing/
- GitHub changelog, "npm staged publishing now supports creating new packages" (2026-10-02) —
  https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/
- GitHub changelog, "Unvalidated npm trusted publishing configurations now expire" (2026-10-02) —
  https://github.blog/changelog/2026-10-02-unvalidated-npm-trusted-publishing-configurations-now-expire/
- GitHub changelog, "Multiple trusted publishing configurations for npm" (2026-09-03) —
  https://github.blog/changelog/2026-09-03-multiple-trusted-publishing-configurations-for-npm/
- The Hacker News, "GitHub Tightens npm Publishing After Flaw Left 1,500+ Packages Vulnerable to Hijacking"
  (2026-10-13) — https://thehackernews.com/2026/10/github-tightens-npm-publishing-after.html
- Changesets config options — https://github.com/changesets/changesets/blob/main/docs/config-file-options.md
- Probe artifacts (§3), deleted after the run.
