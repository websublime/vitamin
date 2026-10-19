# Research: TypeScript 7.x toolchain

**Row:** `00-Z39` (Phase 1 plan §5.2 R11, decision O1 in §5.4)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.9, §4.2 (P8), §5.2 (R11), §5.4 (O1), §6, §7.4, §8; `docs/PRD.md` §2, §6.3; `docs/MANIFESTO.md` Law 10, Out of Scope; `docs/PROCESS.md` §2, §3, §5; `docs/specs/00-spec-design-system.md` §1 diagram, §6.A.3, §6.B, §7.1; `CLAUDE.md` Tech Stack; `.claude/agents/webcomponents-supervisor.md`; `.claude/agents/infra-supervisor.md`; `package.json`; `bun.lock`; `bunfig.toml`; `tsconfig.base.json` and every package `tsconfig.json`; `vite.config.shared.mjs`; `custom-elements-manifest.config.mjs`; `.github/workflows/checks.yml` and `release.yml`; `docs/context/00-z20.md`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
> - npm `latest` for `typescript` is 7.0.2 (published 2026-07-08) on 2026-10-19. It ships a Node launcher and 20 per-platform native Go binaries as optional dependencies, with no install scripts.
> - TypeScript 7.0 ships no JS API. `import 'typescript'` returns only `version` and `versionMajorMinor`. A new API with a different shape is planned for 7.1, whose stable date is 2026-11-24 in the iteration plan.
> - Blocker B1 is that replacing `typescript` with 7.0.2 fails `bun run build`, because `unplugin-dts` 1.1.2 (inside `vite-plugin-dts` 5.1.2) needs `ts.createProgram`. `line-core` and `line-components` emit nothing, and `verify-pack` and the Storybook build then fail.
> - With the TypeScript 6.0 API installed beside 7.0.2 (`@typescript/typescript6`), every probed command passes except typecheck. The `.d.ts` files of the Vite-built packages then come from TypeScript 6.0.3, which contradicts the plan §7.4 criterion "emits declarations on TypeScript 7.x".
> - Typecheck fails on 7.0.2 (and on 6.0.3) with six TS2882 errors in `apps/storybook`, because `noUncheckedSideEffectImports` now defaults to `true`. Three fixes were verified; the choice is open.
> - `tsc -b`, `--watch`, the strict flags of `tsconfig.base.json` and Lit decorator emit behave as on 5.9.3. The CEM analyser 0.11.0 keeps its own TypeScript 5.4.5 and is unaffected. Exit codes and the quote style in `.d.ts` literal types differ.

## 1. Question

Plan §5.2 R11 sets the target as "Verify `tsc -b`, `vite-plugin-dts` 5.1.2 (through `unplugin-dts` 1.1.2 and `@microsoft/api-extractor`), the CEM analyser 0.11.0 (it bundles its own `typescript ~5.4.2`) and Storybook 10 on 7.x; a blocker returns the work to the plan (PROCESS §2)". Decision O1 (§5.4) chose TypeScript 7.x and names R11 as its evidence.

- Q1. Which 7.x version is current, and how is it distributed?
- Q2. Does the 7.x `tsc` CLI match 5.x for the commands this repo runs?
- Q3. Do tools that `import 'typescript'` get a working API on 7.x?
- Q4. Which 6.0/7.0 breaking changes touch `tsconfig.base.json`?
- Q5. Does each repo tool pass on 7.x (typecheck, `tsc -b`, `bun run build`, CEM analyse, Storybook build, `verify-pack`)?
- Q6. If a tool needs the 5.x or 6.x JS API, does a side-by-side install work?
- Q7. Which documents does a move to 7.x change?

## 2. Findings

### 2.1 Version and release state (Q1)

| Fact | Value | Source (retrieved 2026-10-19) |
|---|---|---|
| `typescript` dist-tag `latest` | 7.0.2, published 2026-07-08T15:55Z | `npm view typescript dist-tags time` |
| Other 7.0 versions on `typescript` | 7.0.1-rc (2026-06-18) only; the 7.0 beta shipped as `@typescript/native-preview` | `npm view typescript time` |
| Last 6.x and 5.x | 6.0.3 (2026-04-16), 5.9.3 (2025-09-30) | same |
| `next` tag | 7.1.0-dev.20261019.1, published 2026-10-19T08:21Z, one of 96 `7.1.0-dev.*` nightlies since 2026-07-08 | `npm view typescript dist-tags versions time --prefer-online`; `https://registry.npmjs.org/typescript/7.1.0-dev.20261019.1` returns HTTP 200 |
| Stale tags | `beta` is 6.0.0-beta and `rc` is 7.0.1-rc | `npm view typescript dist-tags` |
| GitHub release | `v7.0.2` on microsoft/TypeScript, published there 2026-08-20 and marked latest, copied from typescript-go | `gh release list --repo microsoft/TypeScript` |
| 7.1 schedule | Beta 2026-10-06, RC 2026-11-10, stable 2026-11-24; "Stabilize API" is the first item | microsoft/TypeScript#63703 (updated 2026-10-16) |
| 7.1 beta on npm | None on 2026-10-19, so the planned beta has slipped | `npm view typescript versions` |

- The npm publish times show no stable 7.x after 7.0.2, so `latest` was also 7.0.2 on 2026-10-13 (the plan's date) and 2026-10-14 (the research brief's date).
- `@typescript/native-preview` stopped at 7.0.0-dev.20260707.2 (2026-07-07). The 7.0 announcement moves nightlies to `typescript@next`.
- The 7.0 announcement says code that compiles cleanly on 6.0 (with `stableTypeOrdering`, without `ignoreDeprecations`) "should compile identically in TypeScript 7.0", and that 7.0 turns every 6.0 deprecation into a hard error.

### 2.2 Native per-platform binaries (Q1)

- `typescript@7.0.2` lists 20 packages `@typescript/typescript-<os>-<cpu>@7.0.2` in both `dependencies` and `optionalDependencies`. The platforms are aix-ppc64, darwin-arm64, darwin-x64, freebsd-arm64, freebsd-x64, linux-arm, linux-arm64, linux-loong64, linux-mips64el, linux-ppc64, linux-riscv64, linux-s390x, linux-x64, netbsd-arm64, netbsd-x64, openbsd-arm64, openbsd-x64, sunos-x64, win32-arm64 and win32-x64.
- The main package declares one bin, `tsc`. It has no `tsserver` bin, no `main`, no `types` and no `scripts`. `engines.node` is `>=16.20.0`.
- `bin/tsc` runs `lib/tsc.js`, which resolves `@typescript/typescript-${process.platform}-${process.arch}` and starts its `lib/tsc` binary through `process.execve` (Node newer than 22.15, non-Windows) or `execFileSync`.
- The `lib.*.d.ts` files ship inside the platform package (`lib/`), not in `typescript`.
- `@typescript/typescript-darwin-arm64@7.0.2` holds a Mach-O arm64 binary, 27.5 MB unpacked.
- `@typescript/typescript-linux-x64@7.0.2` holds a statically linked ELF x86-64 Go binary, 27.9 MB unpacked, with no `libc` field. CI runs on `ubuntu-latest`; no Linux install was run (probe P-L).
- Bun 1.4.3 installed only the darwin-arm64 package, and `bun.lock` records every platform entry with its `os` and `cpu` (probe P-C).
- `bun install --frozen-lockfile --ignore-scripts` (the AM-067 install of `release.yml` and the snapshot workflows) exits 0, `tsc --version` prints 7.0.2, and the release-path build `bun --filter './packages/*' build` exits 0 (probe P-C2).
- `npm view <pkg> dist.attestations` returns nothing for `typescript` 5.9.3, 6.0.3 and 7.0.2, and for `@typescript/typescript6@6.0.2`, so none carries an npm provenance attestation.

### 2.3 JS API status (Q3)

- The 7.0 announcement states "While TypeScript 7.0 is here, it does not ship with an API" and expects 7.1 to ship "a new (and different) API".
- `typescript@7.0.2` exports `.` as `./lib/version.cjs`, which exports only `version` and `versionMajorMinor`. Any tool that calls `ts.createProgram`, `ts.sys` or another compiler function gets `undefined` (probe P-C3).
- 7.0.2 also exports `./unstable/sync`, `./unstable/async`, `./unstable/ast` and related subpaths. They are labelled unstable, and the package vendors `vscode-jsonrpc` for them.
- The 7.1 nightlies `7.1.0-dev.20261016.1` and `7.1.0-dev.20261019.1` still map `.` to `./lib/version.cjs` and move the API to `./sync`, `./async`, `./ast` and others. A tool written against the 5.x/6.x API needs new code for 7.1 as well.
- typescript-go merged the emit API (microsoft/typescript-go#4699) on 2026-07-24. The 7.1 iteration plan lists it under "Stabilize API".
- The TypeScript team's bridge is `@typescript/typescript6` (latest 6.0.2, 2026-07-06). It has one bin, `tsc6`, and depends on `@typescript/old: npm:typescript@^6`, which resolved to 6.0.3. Its entry re-exports the 6.0 API.
- The announcement recommends npm aliases, `typescript: npm:@typescript/typescript6@^6.0.2` together with `@typescript/native: npm:typescript@^7.0.2`, because tools such as typescript-eslint import `typescript` through peer dependencies.
- The `unplugin-dts` 1.1.2 error message recommends installing `@typescript/typescript6` beside `typescript` instead.

### 2.4 `tsc` CLI parity with 5.9.3 (Q2)

- `tsc --all` lists 137 flags in both versions.
- Only in 5.9.3: `--charset`, `--importsNotUsedAsValues`, `--keyofStringsOnly`, `--noImplicitUseStrict`, `--noStrictGenericChecks`, `--out`, `--preserveValueImports`, `--suppressExcessPropertyErrors`, `--suppressImplicitAnyIndexErrors`. The repo uses none of them.
- Only in 7.0.2: `--builders`, `--checkers`, `--deduplicatePackages`, `--ignoreConfig`, `--pprofDir`, `--quiet`, `--singleThreaded`, `--stableTypeOrdering`, `--watchInterval`.
- Every option in `tsconfig.base.json`, plus `composite`, `outDir`, `rootDir`, `noEmit` and `--build`, exists in 7.0.2.
- `tsc -b --verbose`, `tsc -b --clean` and `tsc -b --watch` work on the three `tsc -b` packages. Watch mode picked up a file change and recompiled with 0 errors (probe P-W).
- 7.0.2 runs 4 type-checker workers by default (`--checkers`). The announcement warns that varying `--checkers` "may surface order-dependent results" and suggests one fixed number across environments.
- Diagnostics text for TS1484, TS2375 and TS2322 is identical between 5.9.3 and 7.0.2 (probe P-F).
- Exit codes on a type error differ, though both stay non-zero (probe P-X).

| Command with one type error | 5.9.3 exit | 7.0.2 exit |
|---|---|---|
| `tsc -p . --noEmit` | 2 | 1 |
| `tsc -p .` (emit) | 2 | 2 |
| `tsc -b` | 1 | 2 |

- Emit output of the three `tsc -b` packages (probe P-D):
  - `line-icons` `.js` files are byte-identical, and only the `.map` files differ.
  - `line-utils` `dist/` is byte-identical.
  - `line-schemas` `.d.ts` files differ only in quote style, and their maps differ. 7.0.2 keeps the source's single quotes in literal types (`readonly ['amber', …]`), while 5.9.3 printed double quotes.
- A Lit fixture with `@customElement` and `@property`, compiled under `tsconfig.base.json`, gives identical `.js` (`__decorate` from `tslib`) and `.d.ts` on both versions (probe P-F). typescript-go issue #914 ("Not transpiling decorators") closed as completed on 2025-12-12.

### 2.5 Breaking changes against `tsconfig.base.json` (Q4)

The 7.0 announcement adopts the 6.0 defaults and removes every 6.0 deprecation. The 6.0 release notes list them. `typescript-go/CHANGES.md` adds JS-file and checker differences; the repo type-checks no `.js` files.

| `tsconfig.base.json` option | 6.0/7.0 change | Effect here (probe) |
|---|---|---|
| `target: "es2022"` | `es5` removed; default becomes the latest stable ES version | None, the value is explicit |
| `module: "esnext"` | `amd`, `umd`, `systemjs`, `none` removed; default `esnext` | None |
| `moduleResolution: "bundler"` | `node`/`node10` and `classic` removed; `bundler` recommended | None |
| `strict: true` | Default is now `true` | None |
| `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noUnusedParameters`, `noUnusedLocals` | No change listed | Same diagnostics (TS2375, TS2322) |
| `verbatimModuleSyntax`, `isolatedModules` | No change listed | Same TS1484 diagnostic |
| `useDefineForClassFields: false`, `experimentalDecorators: true`, `emitDecoratorMetadata: false` | Not deprecated | Identical decorator emit |
| `lib: ["ES2022", "DOM", "DOM.Iterable"]` | 6.0 folds `dom.iterable` into `dom`; `dom.iterable` stays valid as an empty file | None; the `DOM.Iterable` entry is now redundant |
| `skipLibCheck: true` | 7.0 reports conflicting declarations at every site, including non-`.d.ts` files | No new error |
| `declaration`, `declarationMap`, `sourceMap` | No change listed | Maps differ byte-wise; `.d.ts` quote style (§2.4) |
| `importHelpers: true` | No change listed | `tslib` helpers emitted as before |

Defaults the base config does not set:

| Default | Change | Effect here (probe) |
|---|---|---|
| `noUncheckedSideEffectImports` | Now `true` | Six TS2882 errors in `apps/storybook` (RC1, §2.7) |
| `types` | Now `[]`; `@types/*` are no longer auto-included | None today; no type-checked file uses Node globals or `node:` imports |
| `rootDir` | Now the `tsconfig.json` directory | None; every emitting package sets `rootDir: "./src"` |
| `esModuleInterop`, `allowSyntheticDefaultImports` | Cannot be `false` | None; the base leaves them unset (Phase 00 spec §7.1 note) |
| `libReplacement` | Now `false` | None |
| `stableTypeOrdering` | Always `true` in 7.0 | None observed |
| File arguments with a `tsconfig.json` present | Error TS5112 unless `--ignoreConfig` | None; no script passes file arguments |

### 2.6 Each tool on 7.x (Q5)

| Tool (version) | How it uses TypeScript | `typescript@7.0.2` alone | 7.0.2 + TS 6.0 API |
|---|---|---|---|
| `tsc -b` for `line-schemas`, `line-utils`, `line-icons` | CLI | exit 0 | exit 0 |
| Per-package `tsc --noEmit` (`typecheck`) | CLI | exit 1 (TS2882 and errors caused by the missing `line-core` dist) | exit 1 (TS2882 only) |
| `vite-plugin-dts` 5.1.2 | Re-exports `unplugin-dts/vite` | Throws at config load | `.d.ts` built by TS 6.0.3 |
| `unplugin-dts` 1.1.2 | `require('typescript')`, needs `createProgram`; falls back to `@typescript/typescript6`; uses `@volar/typescript` 2.4.28 | Fails (B1) | exit 0 |
| `@microsoft/api-extractor` | Optional peer of `unplugin-dts` and `vite-plugin-dts`, loaded only with `bundleTypes` | Listed in `bun.lock` only in the `optionalPeers` of `unplugin-dts` (`:1708`) and `vite-plugin-dts` (`:1726`); no package entry, not installed | Not installed |
| `@custom-elements-manifest/analyzer` 0.11.0 | Own dependency `typescript ~5.4.2`, resolved to 5.4.5 | exit 0 | exit 0 |
| `storybook` 10.6.2 build | Reads the installed `typescript` version and its presence in `package.json` (language detection, telemetry); no compiler API | exit 1, because `@websublime/line-core` has no dist | exit 0 |
| `astro` 7.3.8 build | `astro build` names `typescript` only in a package-name list; `astro check`, unused here, loads `typescript` and `@astrojs/check` | Not reached; the build chain stops after `packages/*` | exit 0 |
| `bun test` (Bun 1.4.3) | Bun's own transpiler | Not run | exit 0, 310 pass |

- The analyser's manifest is identical across all five probe set-ups after sorting `modules` by `path`. Its module order changes from run to run on 5.9.3 too, so the order does not depend on TypeScript (shared with R4).
- `vite.config.shared.mjs` calls `dts({ outDir: 'dist', tsconfigPath: './tsconfig.json' })` with no `bundleTypes`, so `@microsoft/api-extractor` is outside the repo's build path.
- The analyser parses source with its own TypeScript 5.4.5. Its issue open-wc/custom-elements-manifest#267 ("Update to TypeScript 5.5") has been open since 2024-07-22.

### 2.7 Blockers and required changes (Q5)

**B1. `unplugin-dts` needs the TypeScript JS API, and 7.0 has none.**

- The failing tool is `unplugin-dts` 1.1.2, a dependency of `vite-plugin-dts` 5.1.2, which `vite.config.shared.mjs` loads.
- `bun run build` exits 1. `line-core` and `line-components` fail with the same error, and the `apps/*` half of the build never runs.
- The error reads `[unplugin-dts] The installed "typescript" package does not provide the JavaScript Compiler API (this happens with TypeScript 7+), and the fallback "@typescript/typescript6" was not found.`
- Downstream, `verify-pack` reports 10 failures (every `dist` export target of `line-core` and `line-components` is missing). The Storybook build fails with `Rolldown failed to resolve import "@websublime/line-core"`.
- Upstream, the TypeScript 7.0 announcement says 7.0 ships no API. qmhc/unplugin-dts#465 ("TS 7.0 - Thoughts about Future of unplugin-dts") closed on 2026-04-28 through commit `d150536`, "auto fallback to @typescript/typescript6 for TS 7+ compatibility", released in `unplugin-dts` 1.0.0 (2026-04-30).
- A search of qmhc/unplugin-dts issues and PRs on 2026-10-19 found no work on a native 7.x path or on the 7.1 API.
- With the fallback installed, declarations of the Vite-built packages come from TypeScript 6.0.3, so the build passes but is not "on 7.x" for those files (§5 C-1).

**RC1. `noUncheckedSideEffectImports` now defaults to `true` (required change, not a blocker).**

- Six TS2882 errors appear in `apps/storybook`, in `.storybook/preview.ts` lines 3–4 (`@websublime/line-colors`, `@websublime/line-themes`) and `stories/customisation.stories.ts` lines 1–4 (`@websublime/line-tokens/border-width`, `/radii`, `/sizing`, `/typography`).
- The cause is that these packages export only `.css` targets, so the side-effect imports resolve to no declarations.
- `tsc6` (6.0.3) reports the same six errors, so the change comes from 6.0.
- `bun --filter '@websublime/*' typecheck` exits 1, so the `checks.yml` Typecheck step fails on any 6.x or 7.x set-up without a fix.
- Three fixes were verified on 7.0.2 (§6 OQ2).

### 2.8 Side-by-side set-ups (Q6)

| Set-up (root `devDependencies`) | `tsc` bin | API seen by `unplugin-dts` | Result |
|---|---|---|---|
| C. `typescript ^7.0.2` + `@typescript/typescript6 ^6.0.2` | 7.0.2 | 6.0.3 through the fallback | All pass except RC1 |
| D. `typescript: npm:@typescript/typescript6@^6.0.2` + `@typescript/native: npm:typescript@^7.0.2` (the TS team's layout) | 7.0.2 (`tsc6` is 6.0.3) | 6.0.3 as `typescript` | All pass except RC1 |
| E. `typescript ^5.9.3` + `@typescript/native: npm:typescript@^7.0.2` | 7.0.2 | 5.9.3 as `typescript` | All pass except RC1 |

- Bun resolved `@typescript/typescript6` from the `unplugin-dts` directory in its isolated layout, so the fallback works without config.
- Package scripts run the root `tsc`. A probe script in `apps/storybook` printed `Version 7.0.2` under set-up D.
- In E both packages declare a `tsc` bin. Bun linked `tsc` to `@typescript/native` and `tsserver` to 5.9.3 in 4 of 4 installs. That order is observed, not documented.
- In D and E the package named `typescript` is 6.0.3 or 5.9.3, so editors and tools that read `typescript` see that version.
- The emitted files of `line-core` and `line-components` are byte-identical to 5.9.3 in C, D and E.
- TypeScript 7.0.2 can emit the declarations itself. `tsc -p packages/<pkg> --noEmit false --emitDeclarationOnly` exits 0 for both packages and writes the same file set as `vite-plugin-dts` (9 files and 1 file). Five `line-core` files differ beyond quote style, because 7.0.2 keeps `import type` forms and leading module doc comments. `verify-pack` was not run on that output (probe P-T).

### 2.9 Editors and embedded languages

- The 7.0 announcement states that Vue, MDX, Astro and Svelte workflows "will need to continue using TypeScript 6.0 for now", because Volar-based tools need the programmatic API.
- The repo has Astro pages (`apps/site`) and Storybook MDX. No CI step type-checks `.astro` or `.mdx`, so the effect is limited to editor support.
- The 7.0 language server ships as the VS Code extension `TypeScriptTeam.native-preview`. The repo has no `.vscode/` settings that pin a TypeScript SDK.

### 2.10 Documents a move to 7.x changes (Q7)

The plan (§2.9 line 202, §5.4 line 361) names `CLAUDE.md` Tech Stack, `.claude/agents/webcomponents-supervisor.md` lines 15 and 72, and the Phase 00 spec §1 diagram line 74 and §6.A.3 line 444. A grep on 2026-10-19 confirms those hits and finds more.

| File:line | Text today | Changes when |
|---|---|---|
| `CLAUDE.md:23` | "TypeScript 5+ (strict, …)" | Any move |
| `.claude/agents/webcomponents-supervisor.md:15`, `:72` | "TypeScript 5+" | Any move |
| `docs/specs/00-spec-design-system.md:74` | "TypeScript 5.x (types + dual emission)" | Any move (AM) |
| `docs/specs/00-spec-design-system.md:444` | `typescript` "latest 5.x" | Any move (AM) |
| `package.json:79`, `bun.lock:36`, `:1674` | `typescript ^5.9.3` / 5.9.3 | Any move (code) |
| `docs/specs/00-spec-design-system.md` §6.A.3 table (`:440` area) | No `@typescript/typescript6` row | Set-up C or D |
| `docs/specs/00-spec-design-system.md:2411-2438` (§7.1 canonical `tsconfig.base.json`) | No `noUncheckedSideEffectImports` | RC1 fixed in the base config |
| `docs/specs/00-spec-design-system.md:608`, `:2462-2463` | `.d.ts` via `vite-plugin-dts` | Declarations move to `tsc` (OQ1 option d) |
| `docs/specs/00-spec-design-system.md:1667-1668` (§6.F.2 `vite.config.shared.mjs` block) | `import dts from 'vite-plugin-dts'` | Declarations move to `tsc` (OQ1 option d) |
| `docs/specs/00-spec-design-system.md:440` (§6.A.3 `vite-plugin-dts` row) | `vite-plugin-dts` `^5.1.2` (devDependency) | Declarations move to `tsc` (OQ1 option d) |
| `docs/context/00-z20.md:49` | "`typescript` 5.9.3" as latest in its major | PROCESS §3 does not exclude `docs/context/`; the P8 author decides whether this dated record is live |

- `docs/plans/00-plan-design-system.md:137`, `:318` and `docs/retrospective/00-phase-00-retro.md:53` keep "TypeScript 5.x" and 5.9.3 as Phase 00 record (plan §2.9 line 204, PROCESS §3).
- `docs/PRD.md` and `docs/ARCHITECTURE.md` name no TypeScript major.

## 3. Probes

All probes ran on 2026-10-19 on darwin 25.6.0 arm64 with Bun 1.4.3 and Node 22.23.3. The base was a `git archive` of `HEAD` `2c82b07` in `/tmp/r11-probe.*`. Each set-up was a fresh copy with `git init` and one commit, `HOME=<tmp>/home`, and its root `devDependencies` edited with `jq`. The directory was deleted afterwards and no probe code is committed.

### 3.1 Set-ups

| Id | Root `devDependencies` change | Install |
|---|---|---|
| A | None (`typescript ^5.9.3`) | `bun install --frozen-lockfile` |
| B | `typescript ^7.0.2` | `bun install` |
| C | `typescript ^7.0.2`, `@typescript/typescript6 ^6.0.2` | `bun install` |
| D | `typescript npm:@typescript/typescript6@^6.0.2`, `@typescript/native npm:typescript@^7.0.2` | `bun install` |
| E | `typescript ^5.9.3`, `@typescript/native npm:typescript@^7.0.2` | `bun install` |

### 3.2 Command results (exit codes, CI order)

| Command | A | B | C | D | E |
|---|---|---|---|---|---|
| install | 0 | 0 | 0 | 0 | 0 |
| `node_modules/.bin/tsc --version` | 0 (5.9.3) | 0 (7.0.2) | 0 (7.0.2) | 0 (7.0.2) | 0 (7.0.2) |
| `bun run build` | 0 | 1 | 0 | 0 | 0 |
| `bun --filter '@websublime/*' typecheck` | 0 | 1 | 1 | 1 | 1 |
| `tsc -b --clean packages/line-schemas packages/line-utils packages/line-icons` | 0 | 0 | 0 | 0 | 0 |
| `tsc -b --verbose` (same three) | 0 | 0 | 0 | 0 | 0 |
| `bun run scripts/verify-pack.mjs` | 0 | 1 | 0 | 0 | 0 |
| `bun --filter '@websublime/line-storybook' analyze` | 0 | 0 | 0 | 0 | 0 |
| `bun --filter '@websublime/line-storybook' build` | 0 | 1 | 0 | 0 | 0 |

- B `build` failed with the B1 error in `line-core` and `line-components`; the other six packages exited 0.
- B `typecheck` gave 11 errors in `apps/storybook`. Six are TS2882 (RC1). Five come from the missing `line-core` dist (TS2307 ×2, TS4112 ×2, TS2345 ×1).
- C, D and E `typecheck` gave the six TS2882 errors only.
- B `verify-pack` printed "10 failure(s)", all missing `dist` targets of `line-core` and `line-components`. A and C printed "8 package(s) packed and checked, 0 failures".
- B Storybook build failed with `Rolldown failed to resolve import "@websublime/line-core" from "./stories/customisation.stories.ts"`.

### 3.3 Focused probes

| Id | Command | Exit | Observation |
|---|---|---|---|
| P-C | `ls node_modules/.bun` (set-up C) | 0 | Only `@typescript+typescript-darwin-arm64@7.0.2` installed; `bun.lock` lists darwin-arm64, linux-x64 and win32-x64 entries with `os`/`cpu` |
| P-C2 | `rm -rf node_modules && bun install --frozen-lockfile --ignore-scripts`, then `tsc --version`, then `bun --filter './packages/*' build` (C) | 0, 0, 0 | 7.0.2; both Vite packages log "Declaration files built" |
| P-C3 | `node -e` with `createRequire` from the `unplugin-dts` directory (C, D, E) | 0 | `typescript` is 7.0.2 with `createProgram` undefined in C; the fallback is 6.0.3 with `createProgram` a function; D gives 6.0.3, E gives 5.9.3 |
| P-A | `node -e` with `createRequire` from the analyser directory (C) | 0 | `typescript` resolves to 5.4.5 |
| P-M | `jq -S '.modules|=sort_by(.path)'` on `customElements.json`, A against B–E | 0 | Identical in all four; raw module order differed in 3 of 3 runs on A |
| P-D | `diff -rq` of `packages/*/dist`, A against C | 0 | `line-core`, `line-components`, `line-utils` identical; `line-schemas` `.d.ts` quote-only; `line-icons` maps only |
| P-F | Fixture with a Lit element and three flag violations, `tsc -p . --noEmit`, then the clean element emitted, on 5.9.3 and 7.0.2 | check 2 / 1, emit 0 / 0 | Same TS1484, TS2375, TS2322 text; identical decorator `.js` and `.d.ts` |
| P-X | One type error, `--noEmit`, emit and `-b` on both versions | see §2.4 | 5.9.3 gives 2, 2, 1; 7.0.2 gives 1, 2, 2 |
| P-W | `tsc -b --watch` in `packages/line-schemas` (C), touch `src/index.ts` | killed after 9 s | "Found 0 errors. Watching for file changes." twice |
| P-H | `tsc --all` on both versions, flag lists compared | 0 | §2.4 lists |
| P-S | `tsc6 --noEmit` in `apps/storybook` (D) | 2 | The same six TS2882 errors |
| P-R1a | `tsc --noEmit --noUncheckedSideEffectImports false` in `apps/storybook` (D) | 0 | No errors |
| P-R1b | `declare module '*.css' {}` in `apps/storybook/src` (D) | 1 | Still six TS2882; the wildcard does not match package specifiers |
| P-R1c | `declare module` for `@websublime/line-colors`, `@websublime/line-themes` and `@websublime/line-tokens/*` (D) | 0 | No errors |
| P-R1d | `packages/line-colors/dist/index.d.css.ts` containing `export {};`, with and without `--allowArbitraryExtensions` (D) | — | The `line-colors` error remains without the flag and disappears with it |
| P-T | `tsc -p packages/line-core` and `packages/line-components` with `--noEmit false --emitDeclarationOnly --outDir <tmp>` (C) | 0, 0 | Same `.d.ts` file set as `vite-plugin-dts`; content differences in §2.8 |
| P-B | `rm -rf node_modules && bun install` three more times after the first install (E), then `readlink node_modules/.bin/tsc` | 0 | `../@typescript/native/bin/tsc` each time |
| P-U | `bun test` (C) | 0 | 310 pass, 0 fail |
| P-L | `npm pack @typescript/typescript-linux-x64@7.0.2`, `file package/lib/tsc` | 0 | Statically linked ELF x86-64 Go binary |

## 4. Fit with line://ui

- PRD §2 (`docs/PRD.md:174`) sets "All dependencies — Latest stable versions". `typescript` 7.0.2 is `latest`, and `@typescript/typescript6` 6.0.2 is the `latest` of its own package.
- PRD §6.3 (`docs/PRD.md:733`) makes `.d.ts` files a distribution artifact. B1 sits on that artifact for every Vite-built package, including `line-genui` from Phase 1.
- Plan §6 orders R11 → P8 → C1, so C1 waits until the plan resolves B1 (PROCESS §2).
- Plan §8 (`:494`) lists "The TypeScript 7.x move (O1) breaks the toolchain" as Medium likelihood. B1 shows that it happens for a plain version swap.
- The Phase 00 spec §7.1 `tsconfig.base.json` block is normative. RC1 fixed in the base config changes that block through an AM row.
- MANIFESTO Out of Scope (`docs/MANIFESTO.md:69`) fixes the stack as Bun + Vite (Rolldown) + Biome. Emitting declarations with `tsc` keeps Vite for JS and replaces only a Vite plugin.
- MANIFESTO Law 10 (`docs/MANIFESTO.md:57`) keeps runtime code out of CSS-only packages. A `.d.css.ts` declaration in `line-colors`, `line-themes` or `line-tokens` (RC1 option c) adds a type file, not runtime code.
- PROCESS §5 adds `security-reviewer` to Verify for a dependency version change. P8 adds native executables from 20 optional packages, and none of the `typescript` versions carries npm provenance.
- AM-067 `--ignore-scripts` installs keep working, because `typescript` 7.0.2 and its platform packages have no install scripts.
- CLAUDE.md lists `tsc -b` for TS-only packages and Vite 8 for runtime packages. Both stay true under set-ups C and D.

## 5. Contradictions

- **C-1. The plan §7.4 exit criterion does not hold for the Vite-built packages.** `docs/plans/01-plan-core-primitives.md:479` says "The workspace builds, type-checks and emits declarations on TypeScript 7.x (O1)." With `typescript@7.0.2` alone the build fails (B1). With a TS 6.0 API beside it, the build passes, but `line-core` and `line-components` declarations are emitted by TypeScript 6.0.3. Only the three `tsc -b` packages emit on 7.x.
- **C-2. The move is more than a version change.** `docs/plans/01-plan-core-primitives.md:200` ("moves the workspace from `typescript ^5.9.3` to 7.x") and `:273` (P8 "TypeScript 7.x upgrade") describe a version change. A working 7.x workspace also needs a second TypeScript package or a new declaration route (B1), and a tsconfig or source change for TS2882 (RC1). Neither is in P8's scope today.
- **C-3. `@microsoft/api-extractor` is not part of the toolchain.** `docs/plans/01-plan-core-primitives.md:331` says `vite-plugin-dts` 5.1.2 runs "through `unplugin-dts` 1.1.2 and `@microsoft/api-extractor`". `bun.lock` names `api-extractor` only in the `optionalPeers` of `unplugin-dts` (`:1708`) and `vite-plugin-dts` (`:1726`). It has no package entry and is not installed. `unplugin-dts` loads it only with `bundleTypes`, which `vite.config.shared.mjs` does not set.
- **C-4. The P8 document list misses files.** `docs/plans/01-plan-core-primitives.md:202` and `:361` list the documents P8 changes. Depending on the fixes chosen, P8 also changes the places below (§2.10).
  - Phase 00 spec §6.A.3 table, for a `@typescript/typescript6` row (OQ1 options a and b) or the `vite-plugin-dts` row at `:440` (OQ1 option d)
  - Phase 00 spec §6.F.2 `vite.config.shared.mjs` block at `:1667-1668` (OQ1 option d)
  - Phase 00 spec §6.B at `:608` and the §7.1 matrix at `:2462-2463` (OQ1 option d)
  - Phase 00 spec §7.1 `tsconfig.base.json` block at `:2411-2438` (OQ2 option a in the base config)
  - `docs/context/00-z20.md:49`, a further grep hit for 5.9.3

No contradiction found with the PRD, ARCHITECTURE or MANIFESTO.

## 6. Open questions for the spec

These follow the plan revision that C-1 and C-2 require (PROCESS §2).

- **OQ1. How do Vite-built packages get their `.d.ts` on 7.x?**
  - (a) `typescript ^7.0.2` + `@typescript/typescript6 ^6.0.2` through the `unplugin-dts` fallback. Evidence is set-up C (all green except RC1, declarations from 6.0.3).
  - (b) The TS team's alias layout. Evidence is set-up D (same result; the package named `typescript` is 6.0.3 for every tool and editor).
  - (c) Keep `typescript ^5.9.3` and add 7.x as an alias. Evidence is set-up E (same result; an undocumented `tsc` bin collision; it keeps 5.x under the `typescript` name that O1 option (a) rejected).
  - (d) Emit declarations with TypeScript 7.x `tsc --emitDeclarationOnly` and drop `vite-plugin-dts`. Evidence is P-T (same file set, content differs). It still needs a `verify-pack` run, a decision on `declarationMap`, and the build wiring.
  - (e) Wait for TypeScript 7.1 stable (planned 2026-11-24) and an `unplugin-dts` release on the new API. No upstream commitment was found.
  - The deciding evidence is the reading of plan §7.4, either "`tsc` is 7.x" or "every `.d.ts` is emitted by 7.x".
- **OQ2. How is TS2882 resolved?**
  - (a) `noUncheckedSideEffectImports: false` in `tsconfig.base.json` or in `apps/storybook/tsconfig.json`. P-R1a exits 0. The base option changes the Phase 00 spec §7.1 block.
  - (b) Ambient `declare module` lines for the CSS package specifiers in `apps/storybook`. P-R1c exits 0, and the check stays on for every other import.
  - (c) Ship `index.d.css.ts` declarations in the CSS packages and set `allowArbitraryExtensions` in consumers. P-R1d works for `line-colors`. It changes published output and needs a MANIFESTO Law 10 reading.
  - The deciding evidence is whether Phase 1 code in `packages/*/src` will import CSS packages for side effects, and whether the check should stay on for every other import in `apps/storybook`.
- **OQ3. Should CI fix the number of type-checker workers?** The options are the default `--checkers 4`, a pinned `--checkers` value in the `typecheck` and `build` scripts, or `--singleThreaded`. The announcement warns of rare order-dependent results across checker counts; the probes saw none. The deciding evidence is a CI run of the Phase 1 workspace at two checker counts.

## 7. Sources

All retrieved 2026-10-19.

- Announcing TypeScript 7.0 (2026-07-08): https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- Announcing TypeScript 7.0 RC (2026-06-18): https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/
- Announcing TypeScript 7.0 Beta (2026-04-21): https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/
- TypeScript 6.0 release notes, breaking changes and deprecations: https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/release-notes/TypeScript%206.0.md
- typescript-go `CHANGES.md`: https://github.com/microsoft/typescript-go/blob/main/CHANGES.md
- TypeScript 7.1 Iteration Plan, microsoft/TypeScript#63703: https://github.com/microsoft/TypeScript/issues/63703
- Release v7.0.2: https://github.com/microsoft/TypeScript/releases/tag/v7.0.2
- typescript-go emit API, PR #4699: https://github.com/microsoft/typescript-go/pull/4699
- typescript-go decorators transpile, issue #914: https://github.com/microsoft/typescript-go/issues/914
- npm registry: `npm view typescript`, `typescript@7.0.2`, `typescript@7.1.0-dev.20261016.1`, `typescript@7.1.0-dev.20261019.1` (https://registry.npmjs.org/typescript/7.1.0-dev.20261019.1), `@typescript/typescript6`, `@typescript/native-preview`, `@typescript/typescript-darwin-arm64@7.0.2`, `@typescript/typescript-linux-x64@7.0.2`, `vite-plugin-dts`, `unplugin-dts`, `@microsoft/api-extractor`, `@custom-elements-manifest/analyzer`, `storybook`, `astro`, `vite` — https://www.npmjs.com/package/typescript
- `typescript@7.0.2` tarball contents (`lib/tsc.js`, `lib/getExePath.js`, `lib/version.cjs`): `npm pack typescript@7.0.2`
- unplugin-dts releases (1.0.0 fallback, 1.1.2): https://github.com/qmhc/unplugin-dts/releases
- unplugin-dts#465, TS 7.0 and the future of unplugin-dts: https://github.com/qmhc/unplugin-dts/issues/465
- unplugin-dts commit `d150536`: https://github.com/qmhc/unplugin-dts/commit/d150536
- unplugin-dts 1.1.2 source, `dist/shared/unplugin-dts.BdKczvjp.mjs` lines 29–58 (TS loader) and 333–336 (`getTsLibFolder`), from the installed package
- custom-elements-manifest#267, Update to TypeScript 5.5: https://github.com/open-wc/custom-elements-manifest/issues/267
