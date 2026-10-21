# Research: Icon round 2 — how the `line-icons` resolvers load icons in a consumer bundle

**Row:** `00-Z47` (Phase 1 plan §4.3 C22; spec question of row `00-Z46`)
**Date:** 2026-10-20
**Repo sources:** `docs/research/01-research-icon.md` (R10) §2.2, §2.4, §2.5, §3 P6–P7, §6 Q3, Q4, Q6;
`docs/research/01-research-packaging.md` (R9) §2.1, §2.3; `packages/line-icons/` (`src/index.ts`, `src/resolvers/*.ts`,
`package.json`, `README.md`, `__tests__/`); `docs/ARCHITECTURE.md` §11, §17.2, §17.3; `docs/MANIFESTO.md` Laws 6, 9, 10;
`docs/PRD.md` §1.7 and the Icon row of the component catalogue; `docs/plans/01-plan-core-primitives.md` §1.2, §2.5,
§4.3 (C22), §5.5; `bun.lock`; `tsconfig.base.json`.
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
> - Today's template `import()` renders no icon in Vite 8.3.4 or esbuild 0.28.2 output, in any engine (P3, P4). An
>   import map cannot fix it. The mapped URL serves `image/svg+xml`, and Chromium, Firefox and WebKit all refuse it as
>   a module script (P4, P5). A consumer fix exists for each bundler, but in Vite and esbuild it means a plugin that
>   rewrites the `line-icons` dist file (P3).
> - webpack 5.112.0 fails to build a consumer of today's Phosphor resolver. Webpack matches `?raw` against
>   `@phosphor-icons/core`'s `exports` map and reports "not exported" (P3). R10 did not record this.
> - `lucide-static` 1.56.0 also ships one ES module per icon, `dist/esm/icons/<name>.mjs` (1879 files,
>   `export default` SVG string) (P2). A literal `import()` of those files renders in all three bundlers with no
>   consumer configuration, and on both CDNs with an import map (P4, P5). Under jsDelivr `+esm` with no map it rendered
>   only in a simulated rewrite, with the candidate module served locally (§2.6). `@phosphor-icons/core` 2.1.1 has no
>   JS form of its icons, so a Phosphor resolver needs `?raw` or fetch (P2).
> - `import.meta.glob` is not Vite-only. webpack added it in 5.109 (2026-07-24), and 5.112.0 renders the probe (P4).
>   esbuild and both CDNs leave the call in place. With the call at the module's top level, as in the probe, the module
>   throws an uncaught `TypeError` when it loads (P4, P5).
>   A glob over a whole set puts a map of every file in the entry: 34.7 KB gzipped for Lucide in Vite, and 178 KB
>   with Phosphor's six weights (P9).
> - Fetching the SVG from a base URL renders in every bundler and on both CDNs (P4, P5). Its entry is 1054–1334 B
>   gzipped with no map, and each icon costs one request (P9). It needs a CSP `connect-src` entry. A
>   `require-trusted-types-for 'script'` policy blocks both `innerHTML` and `DOMParser` in all three engines (P13).
>   unpkg's 404 lacks CORS headers, so a missing icon looks like a network error there (P5, P6).
> - One literal `import()` per mapped name costs 1154–3057 B gzipped over baseline for 56 or 58 names, plus one chunk
>   of 191–844 B per icon (P9). A name outside the map has no chunk, so a generic `<line-icon name="x">` cannot render
>   it (P4).

---

## 1. Question

Plan §4.3 C22 (`docs/plans/01-plan-core-primitives.md:287`) fixes the reference resolvers for consumer bundlers, and
§5.5 (line 421) leaves the mechanism to the spec. The options are (a) the template `import()` plus an import map or
a bundler plugin, (b) one literal `import()` per mapped name, (c) `import.meta.glob` per set, and (d) fetching an SVG
URL. R10 §6 Q3 asked for "a matrix like R9 §2.1 across Vite, esbuild and webpack, CDN delivery (R9), and the Law 9
path for a missing icon".

1. **Q1 Matrix.** For each mechanism, does an icon render in Vite 8.3.x, esbuild, webpack 5 and two no-build pages
   (jsDelivr `+esm`, unpkg raw files with an import map), in Chromium, Firefox and WebKit? What must a consumer
   configure?
2. **Q2 Weight.** What do the entry and each icon weigh gzipped, and does a page with one icon pay for others (Law 6)?
3. **Q3 Law 9.** What happens for an unknown name or library, and for a failed fetch?
4. **Q4 Contract.** Which mechanisms keep `IconResolver` and `IconRegistry` unchanged, and how do they relate to the
   Phase 1 subpaths that plan §2.5 names (`./registry` and `./resolvers/*`, `docs/plans/01-plan-core-primitives.md:172`),
   taken as `./resolvers/lucide` and `./resolvers/phosphor` with `"."` kept (R10 §6 Q4 (a))?
5. **Q5 CDN.** Which mechanisms work under the two CDN candidates of plan §5.5
   (`docs/plans/01-plan-core-primitives.md:424`, R9 §2.3): jsDelivr `+esm` with no import map, and unpkg raw files
   with an import map and a `process` shim?

## 2. Findings

All facts were retrieved on 2026-10-20.

### 2.1 Inputs

- **Versions** (P1). Locked in `bun.lock`: `lucide-static` 1.56.0, `@phosphor-icons/core` 2.1.1, `vite` 8.3.4,
  `playwright` 1.64.0. npm `latest`: `lucide-static` 1.60.0 (published 2026-10-20T06:15Z), `@phosphor-icons/core`
  2.1.1, `vite` 8.3.4, `esbuild` 0.28.2 (R9's version and npm `latest`; `bun.lock` holds 0.28.1 as a transitive
  dependency), `webpack` 5.112.0 (R9's version and npm `latest`),
  `@websublime/line-icons` 0.1.0. The published 0.1.0 `dist/` is identical to the repo's `packages/line-icons/dist/`
  (`diff -r`, P1). The probes install the published package.
- **Engines** (P4). The repo's Playwright browsers: Chromium build 1248 (HeadlessChrome 156.0.8078.4), Firefox 1555
  (157.0) and WebKit 2370 (Version 27.2).
- **Names.** Three per set. `house` is A2UI `home` in both sets; `heart` with the `fill` weight is A2UI `favorite` in
  Phosphor; `rocket` is outside the 59 names in both sets; `definitely-not-an-icon` exists in neither. The registry is
  also asked for library `material`, which nobody registered.
- **Candidates.** Mechanisms (b)–(d) do not exist in `line-icons`. The probes wrote them as small packages under
  `node_modules/@probe/*`, so bundlers treat them as dependencies. Each keeps the `assertIconName` guard and returns the
  `IconResolver` shape. The (b) maps hold the 56 Lucide and 58 Phosphor files of R10 §2.3.

### 2.2 Matrix (Q1)

"3/3" means `house` and every other in-set name rendered an `<svg>` with drawn children in all three engines. The
no-build pages load `IconRegistry` from the CDN and the candidate module from a local server, as a CDN would serve its
raw file.

| Mechanism | Vite 8.3.4 | esbuild 0.28.2 | webpack 5.112.0 | jsDelivr `+esm`, no build | unpkg raw + import map |
|---|---|---|---|---|---|
| (a) today, `` `lucide-static/icons/${name}.svg?raw` `` | builds; 0/3, bare specifier left | builds; 0/3, same | **build fails** on the Phosphor import | 0/3 without a map; 0/3 with a map (SVG MIME) | 0/3 (SVG MIME) |
| (a) plus a consumer fix | 3/3 with a transform plugin | 3/3 with an `onLoad` plugin and `.svg` text loader | 3/3 with a `?raw` rule and a Phosphor alias | no fix found | no fix found |
| (a′) template `` `lucide-static/dist/esm/icons/${name}.mjs` `` (Lucide) | 0/3; 3/3 with an import map to a CDN | same as Vite | 3/3, no config | 0/3 without a map; 3/3 with a map | 3/3 |
| (b) literal `import('…/<name>.svg?raw')` per name | 3/3, no config | 3/3 with `--loader:.svg=text` | 3/3 with a `?raw` rule and a Phosphor alias | 0/3 (SVG MIME, with a map to raw files; the `.svg/+esm` URL returns 404, P6) | 0/3 (SVG MIME) |
| (b′) literal `import('lucide-static/dist/esm/icons/<name>.mjs')` (Lucide) | 3/3, no config | 3/3, no config | 3/3, no config | 3/3 (simulated rewrite, see §2.6) | 3/3 |
| (c) `import.meta.glob` per set | 3/3 | builds; 0/3, uncaught `TypeError` | 3/3 | 0/3, uncaught `TypeError` | 0/3, uncaught `TypeError` |
| (d) `fetch(base + file)` | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |

**(a) today.** Vite and esbuild keep `` import(`lucide-static/icons/${e}.svg?raw`) `` verbatim in the output (P3).
Chromium reports "Failed to resolve module specifier", Firefox "was a bare specifier, but was not remapped", and
WebKit "does not resolve to a valid URL" (P4). An import map that sends `lucide-static/` and `@phosphor-icons/core/`
to jsDelivr or unpkg resolves the specifier. Then the response is `image/svg+xml` with `?raw` ignored, and all three
engines reject it as a module script (P4 `index-map`, P5). This confirms the R10 §2.5 inference and goes further: an
import map is not a fix. Webpack builds a context module over `lucide-static/icons` and fails without a loader for
`.svg` ("Module parse failed"). It also fails on the Phosphor import, because `"./assets?raw" is not exported` by
`@phosphor-icons/core` (P3).

**What a consumer must configure for (a).** These were the probe's working fixes (P3, P4).

| Bundler | Configuration | Output |
|---|---|---|
| Vite | A `transform` plugin that matches `@websublime/line-icons/dist/resolvers/{lucide,phosphor}.js` and replaces the template `import()` with an `import.meta.glob(…, { query: '?raw' })` lookup | 11 215 icon chunks (2143 Lucide, 9072 Phosphor) |
| esbuild | An `onLoad` plugin on the same files that rewrites the template to a relative path, plus `loader: { '.svg': 'text' }`. esbuild expands template `import()` only for `./` and `../` paths | 11 216 chunks |
| webpack | `module.rules: [{ resourceQuery: /raw/, type: 'asset/source' }]`, or `experiments.futureDefaults: true` (5.109+ maps `?raw` to `asset/source`). For Phosphor, also `resolve.alias['@phosphor-icons/core/assets']` pointing at the folder | 11 215 chunks; Lucide only: 2143 |

`@vite-ignore` turns off Vite's own dynamic-import analysis (Vite docs). [INFERENCE] `resolve.alias` cannot reach a
specifier that is only built at run time. The plugin above patches a third-party dist file.

**(a′) and (b′): `lucide-static`'s ES modules.** `lucide-static` 1.56.0 ships `dist/esm/icons/<name>.mjs` for the
1879 canonical icons, with no alias files. Each one is `export default` of the SVG string (P2). The package has no
`exports` field, so every deep path resolves. A literal `import()` of those files needs no loader in any bundler.
The template form (a′) works zero-config only in webpack, which builds a context of all 1879 modules (P3). Vite and
esbuild leave the template as a bare specifier, as in (a). The separate `lucide` package ships icon nodes
(`dist/esm/icons/house.mjs` exports an array of `[tag, attrs]` pairs). It is not a peer of `line-icons`, and the
probes did not use it (P2).

**(b) and `?raw`.** Vite resolves `?raw` natively. esbuild strips the query when it resolves the file, but it fails
with "No loader is configured for .svg files" (114 errors) unless the consumer sets a text loader (P3). Webpack needs
a rule or `futureDefaults`. With `futureDefaults` and no rule, the Lucide map builds and renders 3/3 (P3, P4). Webpack
also checks `?raw` against Phosphor's `exports` patterns (`./assets/regular/*.svg`) and rejects every Phosphor file
until the consumer adds an alias that bypasses the `exports` map (P3).

**(b) and a generic name.** The map knows only the names it lists. `rocket` failed with the resolver's own "Unknown
Lucide icon" error and no request (P4). A generic `<line-icon name="x" library="lucide">` for a name outside the map
cannot render without a fallback. [INFERENCE] A literal map of the full set (1879 Lucide or 1512 × 6 Phosphor
entries) would weigh about as much as the (c) map in §2.3.

**(c) and `tsc -b`.** `line-icons` builds with `tsc -b`, which emits `import.meta.glob(…)` verbatim (P10). The repo's
TypeScript 5.9.3 rejects the call with TS2339 without `import.meta.glob` typings. With `vite/client` types in scope it
compiles (P10). An ambient `ImportMeta` declaration was not probed. The transform therefore happens in the consumer's
bundler:

- Vite transforms a glob inside `node_modules`. The pattern must start with `./`, `../` or `/`. The bare pattern
  `lucide-static/icons/*.svg` gives the warning "Invalid glob pattern", and Vite leaves the call untransformed (P11).
- The relative pattern is written from the dist file to the peer folder, here `../../../lucide-static/icons/*.svg`.
  It matched under npm's hoisted layout (P3) and under `bun install --linker isolated`. There the peer is linked as a
  sibling inside `.bun/<pkg>/node_modules/`, and the Vite build emitted 2143 icon chunks (P12).
- webpack 5.109 added `import.meta.glob`, compatible with Vite's options (`eager`, `import`, `query`, `base`) (webpack
  blog, 2026-07-24). 5.112.0 also rejects a bare pattern ("must be relative … aliases are not resolved") (P11).
- esbuild leaves the call in place. `import.meta.glob` is `undefined` in browsers. The probe candidate called it at the
  module's top level, so the module threw when it was evaluated (P4, P5). [INFERENCE] A call inside the async
  resolver would reject the resolver's promise instead.
- Vite's dev server and its dependency optimiser were not probed.

**(d) fetch.** The resolver fetches `new URL(file, base)` and returns `res.text()`. Bundlers see no icon import (P3).
A path-only base such as `/node_modules/lucide-static/icons/` threw "Invalid base URL" in all three engines until the
probe resolved it against `document.baseURI` (P5 `d-self`, first run).

### 2.3 Weight (Q2)

Entries are measured with `gzip -9 -n`. Every probe app carries the same registry and harness. Its baseline with no
resolver is 993 B (Vite), 711 B (esbuild) and 709 B (webpack) (P9). Chunk figures are min / median / max gzipped bytes.

| Build | Vite entry | esbuild entry | webpack entry | Icon chunks | Per-icon chunk (Vite / esbuild / webpack) |
|---|---|---|---|---|---|
| (a) today, both resolvers | 1897 | 976 | build fails | 0 | none |
| (a) today, Lucide only, `?raw` rule | — | — | 44 693 | 2143 | — / — / 307–373–672 |
| (a) plus fix, both sets | 177 468 | 172 242 | 229 305 | 11 215–11 216 | 164–310–1174 / 120–339–1209 / 221–368–1238 |
| (a′) template `.mjs` (Lucide) | 1761 + CDN icons | 841 + CDN icons | 39 866 | 0 / 0 / 1879 | — / — / 283–351–649 |
| (b) `?raw`, 56 Lucide names | 2827 | 1865 | 3623 | 56 | 252–301–406 / 253–302–407 / 312–360–468 |
| (b) `?raw`, 58 Phosphor files | 2977 | 2018 | 3766 | 58 | 191–269–783 / 194–272–786 / 247–322–844 |
| (b′) `.mjs`, 56 Lucide names | 2825 | 1869 | 3484 | 56 | 222–271–376 / 368–421–526 / 292–343–451 |
| (c) glob, Lucide | 34 708 | fails at run time | 47 785 | 2143 | 246–311–607 / — / 307–373–672 |
| (c) glob, both sets | 178 047 | fails at run time | 246 294 | 11 215 | 164–310–1174 / — / 221–368–1238 |
| (d) fetch, both sets | 1334 | 1062 | 1054 | 0 | one SVG request per icon |

- **(d) per icon.** The raw files weigh 221–483 B with `gzip -9 -n` (Lucide `house` 289, `rocket` 369; Phosphor
  `house` 229, `rocket` 483, `heart-fill` 221). jsDelivr serves them brotli-encoded at 255–449 B, and unpkg serves
  them gzip-encoded (P6).
- esbuild's (b′) chunks are larger because esbuild keeps the `@license` block of each `.mjs` file (P9).
- **Law 6.** Every mechanism that works loads one chunk or one file per icon shown, and no other icon's SVG (P4
  requests). They differ in the map that the entry carries. A glob or a webpack context carries every file name of the
  set: 34.7–47.8 KB gzipped for Lucide, 172–246 KB with Phosphor's six weights. The (b) map of 56 or 58 names costs
  1154–3057 B over baseline, and fetch costs 341–351 B. The glob builds also write every icon of the set to the
  consumer's `dist`: 2144 files and 8.8 MB on disk for Lucide in Vite, and 11 216 files and 47 MB for both sets (P9).
- PRD §1.7 sets a soft target of < 5 KB gzipped per component (`docs/PRD.md:147`). The (b) and (d) entries stay
  under it. The glob and context maps exceed it several times over (P9).

### 2.4 Law 9 path (Q3)

`IconRegistry.resolve` is `async`, so every throw reaches the caller as a rejected promise. The unknown library
`material` rejected with `[line-icons] No resolver registered for library "material".` in every run (P4, P5).

| Mechanism | Unknown name (`definitely-not-an-icon`) | Before any network? | Uncaught? |
|---|---|---|---|
| (a) today | Rejects like every other name (unresolved specifier) | yes | no |
| (a) plus Vite plugin | Rejects with `TypeError: c[e] is not a function` | yes | no |
| (a) plus esbuild plugin | Rejects with "Module not found in bundle: …" | yes | no |
| (a), (a′) in webpack | Rejects with "Cannot find module './definitely-not-an-icon.svg'" | yes | no |
| (a′) over a CDN | 404. jsDelivr: "Failed to fetch dynamically imported module"; unpkg: CORS block, then rejection | no | no |
| (b), (b′) | Rejects with the resolver's own error, from a synchronous map lookup | yes | no |
| (c) in Vite or webpack | Rejects with the resolver's own error, from a map lookup | yes | no |
| (c) in esbuild or a CDN | Nothing resolves. The module throws `import.meta.glob is not a function` when it loads, and the page's importing module fails | — | **yes** |
| (d) jsDelivr or self-hosted | HTTP 404 with `access-control-allow-origin: *`; the resolver sees `res.ok === false` | no | no |
| (d) unpkg | The 404 carries no CORS header. `fetch` rejects with `TypeError` ("Failed to fetch", "NetworkError when attempting to fetch resource.", "Load failed"), so the status is not readable | no | no |
| (d) blocked by CSP | `connect-src 'self'` blocks the request, and `fetch` rejects with the same `TypeError` | no | no |

- Component rule C8 asks that missing or partial props degrade "to an empty or neutral state"
  (`docs/ARCHITECTURE.md:1472`). Every mechanism except (c) in esbuild or on a CDN gives the caller a rejection that
  `<line-icon>` can catch and turn into an empty state [INFERENCE]. The (b) and (c) lookups know a miss before any
  request, so such a resolver could also resolve to an empty value instead of throwing. The contract's return type
  `Promise<string | SVGElement>` (`packages/line-icons/src/index.ts:1`) has no "absent" value besides an empty string.
- jsDelivr caches a 404 for 86 400 s, and a hit with `max-age=31536000, immutable` (P6).
- The Law 9 sentence "Components never throw uncaught errors at the consumer" (`docs/MANIFESTO.md:55`) is broken only
  by (c) outside Vite and webpack, where the probe's top-level call threw when the module loaded, before any resolver
  ran (P4, P5). [INFERENCE] A call placed inside the resolver would turn this into a rejection.

### 2.5 Contract shape (Q4)

| Mechanism | `IconResolver` / `IconRegistry` | Resolver factory | Consumer configuration |
|---|---|---|---|
| (a) | unchanged | unchanged | Vite: dist-patching plugin; esbuild: plugin and text loader; webpack: `?raw` rule or `futureDefaults`, and an alias for Phosphor. No CDN fix |
| (a′) | unchanged | unchanged (Lucide); no Phosphor equivalent | webpack: none. Vite, esbuild, CDNs: an import map for `lucide-static/` |
| (b) `?raw` | unchanged | unchanged signature; only mapped names resolve | Vite: none. esbuild: `.svg` text loader. webpack: `?raw` rule or `futureDefaults`, and an alias for Phosphor. CDNs: not possible |
| (b′) `.mjs` | unchanged | unchanged signature; only mapped names resolve; Lucide only | none in the three bundlers; an import map on raw CDN files |
| (c) | unchanged | unchanged signature | Vite or webpack ≥ 5.109 only; `line-icons` needs `import.meta.glob` typings to compile, for example `vite/client` (P10) |
| (d) | unchanged | gains a `base` option, or a built-in default base URL | a base URL (CDN or self-hosted), `connect-src`, and a Trusted Types policy where the page enforces one |

- All four fit the subpaths of Q4. Each resolver file is self-contained, so `./resolvers/lucide` carries only the
  Lucide map or glob, and `./registry` carries none (P3).
- Keeping `"."` with its re-exports is safe under `sideEffects: false`. A webpack build that imports only
  `IconRegistry` or `createLucideResolver` from `"."` dropped the Phosphor module and built, while the same import
  plus `createPhosphorResolver` failed (P3 `al`, `a`).
- A Phosphor map needs the weight in the key. The (b) probe keyed it by file name (`heart-fill`), so `options.weight`
  still selects the file (P4).

### 2.6 CDN (Q5)

| Mechanism | jsDelivr `+esm`, no import map | unpkg raw + import map (+ `process` shim) |
|---|---|---|
| (a) | fails: `+esm` keeps the template as a bare specifier (P7) | fails: SVG MIME |
| (a′) | fails without a map; works with an import map for `lucide-static/` | works |
| (b) `?raw` | fails: SVG MIME; jsDelivr returns 404 for `…/icons/house.svg/+esm` (P6) | fails: SVG MIME |
| (b′) | works in the simulation (see below) | works |
| (c) | fails: uncaught `TypeError` | fails: uncaught `TypeError` |
| (d) | works; needs a base URL | works; needs a base URL |

- jsDelivr's `+esm` build of `@websublime/line-icons@0.1.0` keeps both template imports verbatim (P7).
- jsDelivr rewrites **literal** bare dynamic imports. `shiki@3.13.0/dist/langs.mjs/+esm` turns
  `import('@shikijs/langs/abap')` into `import("/npm/@shikijs/langs@3.13.0/abap/+esm")` (P7).
  `lucide-static@1.56.0/dist/esm/icons/house.mjs/+esm` returns 200 `application/javascript` (P6). The (b′) simulation
  replaced each literal with that URL form and rendered 3/3 (P5 `b2-jsd-esmsim`). [INFERENCE] A published (b′)
  resolver gets the same rewrite. Which `lucide-static` version jsDelivr picks for an optional peer was not observed.
- The raw `.mjs` files are served as `application/javascript` (jsDelivr) and `text/javascript` (unpkg), with
  `access-control-allow-origin: *` on a 200 (P6).
- Cold latency differs widely (P8). A first request for an uncached `lucide-static@1.16.0` icon took 0.31–0.52 s on
  jsDelivr and 1.4–2.0 s for `+esm`. unpkg returned 500 after 30.2–30.8 s, then 200 after 12.6 s or on the third try.
  Warm requests took 46–102 ms over curl. In the browsers, each (d) SVG took 15–51 ms, and single `.mjs` loads took
  up to 296 ms (P5 resource timing).
- The icon pages loaded no Zag code, so the unpkg pages needed no `process` shim (P5). The shim in the CDN contract
  matters for the components, not for these resolvers.

### 2.7 Injection, sanitising and CSP

- The resolver returns markup, and the probe harness injected it with `innerHTML` (P4). Under
  `require-trusted-types-for 'script'`, both `innerHTML` and `DOMParser.parseFromString` reject a plain string in
  Chromium 156, Firefox 157 and WebKit 27.2 (P13). A string resolver then needs a Trusted Types policy, whatever the
  mechanism. [INFERENCE] An `SVGElement` built with `createElementNS`, which the contract already allows, avoids these
  sinks.
- `Element.prototype.setHTML` and `Sanitizer` exist in Chromium 156 and Firefox 157 but not in WebKit 27.2.
  `setHTML` removed a `<script>` and an `onload` attribute from a test SVG (P13).
- Across both full sets, Lucide's 2143 files use 8 elements (`svg`, `path`, `rect`, `circle`, `line`, `ellipse`,
  `polyline`, `polygon`) and 22 attributes. Phosphor's 9072 files use `svg` and `path`, with `viewBox`, `fill`, `d` and
  `opacity`. Neither set contains `script`, `style`, `href`, `use`, `foreignObject` or an `on*` attribute. Every
  Lucide file starts with a license comment (P14).
- A 22-line allowlist sanitiser built on `DOMParser` (`image/svg+xml`) with those elements and attributes weighs 837 B
  minified and 477 B gzipped. In all three engines it removed `<script>`, `<foreignObject>`, `<a href="javascript:…">`,
  `on*` and `style`, kept Lucide `house` intact, and returned `null` for a non-SVG document (P14). It is a probe,
  not a recommendation.
- (d) needs `connect-src` to list the icon origin. `connect-src 'self'` blocked jsDelivr in all three engines, and
  `connect-src 'self' https://cdn.jsdelivr.net` let the icons through (P13). [INFERENCE] The import-based mechanisms
  over a CDN need the origin in `script-src` instead; P13 tested only (d).

## 3. Probes

All probes ran on 2026-10-20 in `/tmp/z47probe.H9rh` (`mktemp -d`), with `HOME` and the npm cache set to that
directory and its own `package.json`. Browsers came from the repo's Playwright cache through
`PLAYWRIGHT_BROWSERS_PATH`. A Node static server on `127.0.0.1:4517` served the pages and set the CSP headers. The
directory was deleted afterwards. Exit codes are 0 unless stated.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view <pkg> version dist-tags.latest time.modified` for `lucide-static`, `lucide`, `@phosphor-icons/core`, `@websublime/line-icons`, `vite`, `esbuild`, `webpack`; `npm install` of the locked or R9 versions; `diff -r` of the installed `line-icons/dist` against `packages/line-icons/dist` | 0 | Versions in §2.1; no diff |
| P2 | `ls`, `cat` and `package.json` reads in `lucide-static`, `lucide` 1.56.0 and `@phosphor-icons/core` 2.1.1 | 0 | 1879 `dist/esm/icons/*.mjs` in `lucide-static`, no alias files; Phosphor `dist/index.mjs` (445 658 B) holds names and tags, no `<svg` |
| P3 | `node build.mjs <app> <bundler> [variant]`: Vite `build()` API, esbuild `build()` (`--bundle --splitting --format=esm --minify`), webpack Node API (`mode: 'production'`), for 12 apps and 6 variants (standard, plugin, alias, no loader, no rule, `futureDefaults`) | 0; the script catches build errors and prints `ok: false` | webpack (a): "./assets?raw is not exported"; webpack without a rule: "Module parse failed"; esbuild without a loader: 114 errors; Vite bare glob: warning; output counts in §2.2 and §2.3 |
| P4 | `node run.mjs <pages>` (Playwright 1.64.0), each bundled `index.html` in Chromium, Firefox and WebKit; the webpack pages rerun after their HTML shell was fixed to load after `<body>`; three Vite/esbuild outputs rerun with an import map | 0 | §2.2 matrix and §2.4 errors; `uncaught` empty except (c) in esbuild |
| P5 | `node run.mjs` on 18 no-build pages: (a) with and without an import map on jsDelivr `+esm` and unpkg raw; (a′), (b), (b′), (c), (d) on both CDNs; (b′) `+esm` simulation; (d) self-hosted | 0 | §2.2 and §2.6; resource timing per icon |
| P6 | `curl -sS -D -` on `.svg`, `.mjs`, `+esm` and 404 URLs on both CDNs; `-H 'Accept-Encoding: br, gzip'` | 0 | `.svg/+esm` 404 on jsDelivr; `.mjs/+esm` 200; jsDelivr 404 keeps `access-control-allow-origin: *` with `max-age=86400`; unpkg 404 has no CORS header; br/gzip encodings |
| P7 | `curl` of `@websublime/line-icons@0.1.0/+esm` and of `shiki@3.13.0/dist/langs.mjs` raw and `/+esm` | 0 | Template imports kept; literal `@shikijs/langs/abap` rewritten to `/npm/@shikijs/langs@3.13.0/abap/+esm` |
| P8 | `curl -w '%{http_code}:%{time_total}'` ×5 on warm URLs and ×3 on cold `lucide-static@1.16.0` URLs (`squirrel`, `turtle`) | 0 | §2.6 latency |
| P9 | `gzip -9 -n -c <entry> \| wc -c` (Apple gzip 479.0.0.700.1); chunks with Python `gzip.compress(data, 9, mtime=0)` after a 60-file parity check against the CLI (0 mismatches); `du -sh` | 0 | §2.3 |
| P10 | The repo's `tsc` 5.9.3 on a file using `import.meta.glob`, with `tsconfig.base.json` options, without and with `types: ["vite/client"]` | 2, 0 | TS2339 "Property 'glob' does not exist on type 'ImportMeta'"; then verbatim emit |
| P11 | Vite and webpack builds of a glob with the bare pattern `lucide-static/icons/*.svg` | 0, 0 (`ok: false` for webpack) | Vite: "Invalid glob pattern", call left verbatim; webpack: "must be relative … aliases are not resolved" and a resolve error |
| P12 | `npm pack` of the glob candidate with `lucide-static` and Phosphor peers; `bun install --linker isolated` (bun 1.4.3); Vite `build()` | 0, 0, 0 | The peer is linked next to the package in `.bun/…/node_modules/`; 2144 files, `house-D9y7aevS.js` among them |
| P13 | (d) page under three CSP headers (`connect-src 'self'`; plus `https://cdn.jsdelivr.net`; plus `require-trusted-types-for 'script'`); feature page testing `setHTML`, `Sanitizer`, `DOMParser`; sanitiser page under Trusted Types | 0 | §2.7 |
| P14 | Python `xml.etree` inventory of all 2143 Lucide and 9072 Phosphor files; esbuild `--minify` of the probe sanitiser; sanitiser page in three engines | 0 | §2.7 |

## 4. Fit with line://ui

- **ARCHITECTURE §11.** "Each library is a resolver: given a name, returns the SVG", and "Zero icons bundled in
  `line-icons` core" (`docs/ARCHITECTURE.md:443-444`). Every mechanism keeps the SVGs out of `line-icons`. (b) and
  (c) move them into the consumer's chunks, and (d) leaves them on a server.
- **`src` attribute.** ARCHITECTURE §11 (`docs/ARCHITECTURE.md:439`) and the PRD Icon row (`docs/PRD.md:244`) give
  `<line-icon>` a `src` that loads an SVG file. That path faces the same fetch, CORS, CSP and sanitising facts as (d)
  in §2.4 and §2.7.
- **Law 6.** §2.3 shows lazy loading per icon in every working mechanism. The cost that differs is the entry map, and
  a glob or context map exceeds the PRD §1.7 soft target.
- **Law 9 and C8.** §2.4. Only (c) outside Vite and webpack threw before the component could catch, with the call at
  the module's top level as in the probe. [INFERENCE] A call inside the resolver would reject instead.
- **Law 10.** No mechanism adds a `line-icons` dependency. The sanitiser in §2.7 needs none. A Trusted Types policy
  name would be a new public surface.
- **ARCHITECTURE §17.4 Text and URL rows.** Agent strings are untrusted. A2UI bound names reach the resolver at run
  time (R10 §4), and `assertIconName` still runs before any import or fetch in every candidate.
- **R9.** Lazy `import()` survives every `sideEffects` value (R9 §2.1), and the (b) chunks confirmed it under
  `sideEffects: false` (P3). The CDN rows follow R9 §2.3: `+esm` rewrites only what it can see statically.

## 5. Contradictions

- **C1 (new).** Plan §5.5 lists "(c) `import.meta.glob` per set (Vite only)" (`docs/plans/01-plan-core-primitives.md:421`),
  as R10 §6 Q3 did (`docs/research/01-research-icon.md:326`). webpack supports `import.meta.glob` since 5.109
  (2026-07-24), and 5.112.0 rendered the probe in all three engines (§2.2, P3, P4).
- **C2 (new).** Plan §5.5 option (a) reads "the template `import()` plus a documented import map or bundler plugin"
  (`docs/plans/01-plan-core-primitives.md:421`). An import map cannot make it work. The mapped URL serves an SVG,
  which every engine refuses as a module script (§2.2, P4, P5).
- **Added fact (not a contradiction).** Plan §1.2 says the resolvers are "verified under Bun only" and "emit no icon"
  in a Vite 8 build (`docs/plans/01-plan-core-primitives.md:53`), and §2.5 repeats the Vite fact (line 174). Both
  still hold. The same failure holds for esbuild 0.28.2, and webpack 5.112.0 does not complete the build when the
  Phosphor resolver is imported (§2.2, P3). R10 P6 tested Vite only (`docs/research/01-research-icon.md:279`).
- **R10 inference confirmed.** R10 §2.5 inferred "Without an import map a browser rejects that bare specifier, and the
  `?raw` query has no meaning outside Vite" (`docs/research/01-research-icon.md:258-259`). On the browser side this
  is now measured. All three engines reject the bare specifier, and the CDNs ignore `?raw` and serve `image/svg+xml`
  (P4, P5, P6). Among the bundlers, Vite gives `?raw` a meaning natively, and webpack does so with a rule or
  `futureDefaults`. esbuild strips the query, and only its `.svg` text loader makes the import work (P3).

## 6. Open questions for the spec

1. **Which loading mechanism do the reference resolvers use (C22)?** Options:
   (a) keep the template `import()` and document a per-bundler fix;
   (a′) a template `import()` of `lucide-static/dist/esm/icons/*.mjs` (Lucide only);
   (b) a literal per-name map with `?raw`;
   (b′) a literal per-name map of the Lucide `.mjs` files;
   (c) `import.meta.glob`;
   (d) fetch from a base URL;
   or a mix per set, for example (b′) for Lucide and (b) or (d) for Phosphor.
   Evidence: §2.2 matrix, §2.3 weights, §2.4, §2.6.
   The evidence rules out (a), (a′) and (c) for jsDelivr `+esm` with no import map, since all three fail there
   (§2.6). It rules out (b) `?raw` on either CDN candidate. It rules out (a) without consumer configuration in every
   bundler (§2.2).
2. **Must a generic `<line-icon name="x">` resolve any name of the set?** If yes, (b) and (b′) need a full-set map or a
   fallback (§2.2, P4). If the map covers only the A2UI names, a name outside it fails before any request.
   Evidence: §2.3 map weights, and R10 §6 Q1 on where the A2UI map lives.
3. **Does Phosphor stay a reference set under a no-build CDN page?** `@phosphor-icons/core` 2.1.1 has no JS form of
   its icons (P2), so under both CDN paths only (d) renders it (§2.6). Options: (d) for Phosphor only; Phosphor
   documented as bundler-only; or a different Phosphor package. The last was not probed.
4. **If (d): who owns the base URL?** Options: a required `base` option; a default jsDelivr URL pinned to a version;
   or a self-hosting recipe. Evidence: §2.6 cold latency, §2.4 (unpkg 404 without CORS), §2.7 `connect-src`, and the
   `src` attribute (§4).
5. **How does `<line-icon>` inject a string?** Options: `innerHTML` with a documented Trusted Types policy; a parse
   and allowlist step (§2.7, 477 B gzipped); `setHTML` where it exists (not WebKit 27.2); or resolvers that return
   `SVGElement`. Evidence: §2.7, and whether `src` and agent-supplied names count as untrusted (ARCHITECTURE §17.4).
6. **What does a miss resolve to?** Options: the resolver rejects and `<line-icon>` renders an empty state (C8), or the
   resolver resolves to an empty value. Evidence: §2.4. The contract type has no "absent" value besides `''`.
7. **Which bundler floor does the documentation state?** (b) with `?raw` needs a text loader in esbuild and a rule or
   `futureDefaults` in webpack, plus a Phosphor alias (§2.5). (c) needs webpack ≥ 5.109. (b′) and (d) need nothing.

## Addendum A1 (2026-10-20, row 00-Z48)

This addendum records the element and attribute inventory of the locked icon files. Spec §6.C.3 cites it for the
measured attribute allowlist.

### A1.1 Inventory

`bun.lock` locks `lucide-static` 1.56.0 and `@phosphor-icons/core` 2.1.1 (`bun.lock:1206`, `bun.lock:636`). The counts
give the number of files that use each name at least once (A1-P1).

| Set | Files | Elements (files) | Attributes (files) |
|---|---|---|---|
| `lucide-static` 1.56.0, `icons/*.svg` | 2143 | `svg` 2143, `path` 2063, `circle` 474, `rect` 422, `line` 78, `ellipse` 15, `polyline` 3, `polygon` 2 | `class` 2143, `fill` 2143, `height` 2143, `stroke` 2143, `stroke-linecap` 2143, `stroke-linejoin` 2143, `stroke-width` 2143, `viewBox` 2143, `width` 2143, `xmlns` 2143, `d` 2063, `cx` 488, `cy` 488, `r` 474, `rx` 428, `x` 422, `y` 422, `x1` 78, `x2` 78, `y1` 78, `y2` 78, `ry` 64, `points` 5 |
| `@phosphor-icons/core` 2.1.1, `assets/**/*.svg` | 9072 | `svg` 9072, `path` 9072 | `d` 9072, `fill` 9072, `viewBox` 9072, `xmlns` 9072, `opacity` 1510 |

- Lucide uses 23 attribute names, and Phosphor uses 5. Both sets use `xmlns`.
- Without `xmlns`, Lucide uses 22 names and Phosphor 4. The union is 23 names. Phosphor adds `opacity` alone.
- The two sets use 8 element names in all. Neither set uses `g`.

### A1.2 Comparison with the spec

- The 23 measured attributes of spec §6.C.3 equal the union above without `xmlns`.
- The spec does not list `xmlns`. Every file of both sets carries it on the root `svg`. `xmlns` is a namespace
  declaration rather than a presentation attribute (Namespaces in XML 1.0, §3).
- The 8 elements found match the spec's element allowlist except `g`, which the spec marks as a choice beyond the probe.

### A1.3 Probe

The probe ran on 2026-10-20 from the repo root with a script in `/tmp`. It read `node_modules` and wrote nothing to the
repo.

| # | Command | Exit | Observed |
|---|---|---|---|
| A1-P1 | `bun /tmp/inv.ts` (bun 1.4.3), script below | 0 | Counts as in A1.1 |

```ts
import { Glob } from "bun";
const roots = [["lucide-static","node_modules/lucide-static/icons","*.svg"],["@phosphor-icons/core","node_modules/@phosphor-icons/core/assets","**/*.svg"]];
for (const [name, dir, pat] of roots) {
  const els = new Map(), atts = new Map(); let n = 0;
  for await (const f of new Glob(pat).scan(dir)) {
    n++; const t = await Bun.file(`${dir}/${f}`).text();
    const se = new Set(), sa = new Set();
    for (const m of t.matchAll(/<([a-zA-Z][\w:-]*)([^>]*)>/g)) { se.add(m[1]); for (const a of m[2].matchAll(/([a-zA-Z_:][\w:.-]*)\s*=/g)) sa.add(a[1]); }
    se.forEach(e => els.set(e, (els.get(e)||0)+1)); sa.forEach(a => atts.set(a, (atts.get(a)||0)+1));
  }
  console.log(name, require(`${process.cwd()}/node_modules/${name}/package.json`).version, "files", n);
  console.log(" elements", [...els].sort().map(([k,v])=>`${k}:${v}`).join(" "));
  console.log(" attributes", [...atts].sort().map(([k,v])=>`${k}:${v}`).join(" "));
}
```

## 7. Sources

All retrieved 2026-10-20.

- `lucide-static` 1.56.0 and 1.60.0, `lucide` 1.56.0 — https://www.npmjs.com/package/lucide-static,
  https://www.npmjs.com/package/lucide
- `@phosphor-icons/core` 2.1.1 — https://www.npmjs.com/package/@phosphor-icons/core
- `@websublime/line-icons` 0.1.0 — https://www.npmjs.com/package/@websublime/line-icons
- Vite 8.3.4, glob import and dynamic import — https://vite.dev/guide/features#glob-import,
  https://vite.dev/guide/features#dynamic-import
- esbuild 0.28.2, glob-style imports and loaders — https://esbuild.github.io/api/#glob,
  https://esbuild.github.io/content-types/#text
- webpack 5.109 release notes (`import.meta.glob`, `?raw` under `futureDefaults`), 2026-07-24 —
  https://webpack.js.org/blog/2026-07-24-webpack-5-109/
- webpack asset modules — https://webpack.js.org/guides/asset-modules/
- jsDelivr `+esm` endpoint — https://www.jsdelivr.com/esm; shiki 3.13.0 via jsDelivr —
  https://cdn.jsdelivr.net/npm/shiki@3.13.0/dist/langs.mjs/+esm
- unpkg — https://unpkg.com
- HTML Standard, module script MIME check — https://html.spec.whatwg.org/multipage/webappapis.html#fetching-scripts
- Trusted Types — https://w3c.github.io/trusted-types/dist/spec/; HTML Sanitizer API —
  https://wicg.github.io/sanitizer-api/
- Playwright 1.64.0 (workspace `node_modules`) — https://playwright.dev
- R9 `docs/research/01-research-packaging.md` §2.1, §2.3; R10 `docs/research/01-research-icon.md` §2.2–§2.5, §3, §6
- Probe artifacts (§3), deleted after the run.
