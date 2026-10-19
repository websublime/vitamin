# Research: MCP Apps

**Row:** `00-Z34` (Phase 1 plan §5.1 R5)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` (§2.1 item 7 and its subpath table, §3, §5.1 R5, §5.3, §5.5, §6, §7.2), `docs/ARCHITECTURE.md` (§4, §17.1, §17.4, §17.6, §17.8, §17.9), `docs/PRD.md` (§7.3 Phase 1 items and exit criteria, Appendix D, revision v0.8.12), `docs/MANIFESTO.md` (Laws 2, 6, 10), `docs/research/00-research-generative-ui.md` (§2.2, §4.8), `packages/line-themes/src/aliases.css`, `packages/line-themes/package.json`, `packages/line-tokens/src/{radii,typography,focus-ring,border-width,shadows}.css`, `scripts/lint-layers.mjs`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - MCP Apps (SEP-1865, extension id `io.modelcontextprotocol/ui`) has a stable spec dated 2026-01-26. The SDK `@modelcontextprotocol/ext-apps` 2.0.3 is `latest` on 2026-10-19, and npm lists no publish since 2026-09-25. It implements protocol version `2026-01-26`. Its main entry needs `zod ^4.2.0` and `@modelcontextprotocol/client ^2.0.0` as peers, while `./app-with-deps` bundles both.
> - A View is one HTML5 document of MIME type `text/html;profile=mcp-app`, served from a `ui://` resource and rendered in a sandboxed iframe. The default CSP allows inline script and inline style only. A probe in Chromium 156, Firefox 157 and WebKit 27.2 rendered a generic inlined Lit 3.3.3 element under that CSP and blocked `data:`, `blob:` and CDN imports. A CDN works once its origin is in `_meta.ui.csp.resourceDomains`.
> - The published host variable list has 76 keys. 37 are colours, 28 are typography, 6 are border radii, 1 is a border width and 4 are shadows. The stable spec, the draft spec and the SDK 2.0.3 type and JSON schema agree on all 76.
> - `line-themes` has aliases for colour roles only. Every font, radius, border-width, shadow and focus-ring target is a `line-tokens` primitive. So the primitive fallback question covers the 39 non-colour keys, plus the 7 ring keys if they map onto `--line-focus-ring-color`.
> - A primitive bridge rule that falls back to itself resolves to the guaranteed-invalid value when the host omits the variable. The probe confirmed this in all three engines. The same row declared on `body` with `var(--host-var, inherit)` inherited the `line-tokens` value in all three engines.
> - A host without MCP Apps renders no View. The tool behaves as a plain tool, and the host shows its `content` array, which the spec requires to be meaningful. No line://ui code runs in that case.

---

## 1. Question

Plan §5.1 R5 reads "ext-apps SDK version, the standard host variable reference list (ARCHITECTURE §17.9), the primitive fallback strategy (§17.6)". The row adds four sub-questions.

1. What is the status of the MCP Apps extension, and which ext-apps SDK packages, versions, licence and spec revision apply?
2. How is a View delivered (iframe sandbox, CSP defaults, MIME type), and how do line://ui components load in it, inlined or from a CDN?
3. Which standard host variables does the host pass (theme, styles, CSS variables)? The complete published list feeds ARCHITECTURE §17.9 and the plan §5.5 question on the `mcp-apps.css` reference list.
4. What is the primitive fallback strategy of ARCHITECTURE §17.6? This note answers two readings of it.
   - 4a. Protocol level. What does a host without MCP Apps render, and how does a tool result degrade?
   - 4b. CSS level. How does the bridge treat `line-tokens` primitives, given that "a primitive cannot fall back to itself" (ARCHITECTURE §17.6)?
5. Where does the current SDK contradict ARCHITECTURE §17.6, §17.9 or `00-research-generative-ui.md` §4.8?

## 2. Findings

All retrievals and probes ran on 2026-10-19.

### 2.1 Extension status and SDK

| Fact | Value | Source |
|---|---|---|
| Spec | SEP-1865 "MCP Apps", Extensions Track, "Status: Stable (2026-01-26)", created 2025-11-21 | `specification/2026-01-26/apps.mdx` line 9 |
| Draft | `specification/draft/apps.mdx`, "Status: Draft", last spec commit 2026-07-22 (#721) | ext-apps commit log |
| Extension id | `io.modelcontextprotocol/ui`; the `ui://` prefix and the label are reserved | stable spec lines 40, 1767–1768 |
| Official extension | Listed under "Official Extension Repositories" on modelcontextprotocol.io | extensions overview |
| npm package | `@modelcontextprotocol/ext-apps`, `latest` and `release-2.0` both 2.0.3 | `npm view` (P1) |
| Release dates | 1.0.0 on 2026-01-26, 1.7.5 on 2026-07-23, 2.0.0 on 2026-09-08, 2.0.3 on 2026-09-25 | `npm view … time` (P1) |
| Version on 2026-10-19 | 2.0.3 is `latest`; npm lists no publish since 2026-09-25 | `npm view … time` (P1) |
| Subpath exports | `.`, `./react`, `./server`, `./app-bridge`, `./schema.json`, `./app-with-deps`, `./react-with-deps` | `npm view … exports` (P1) |
| Runtime dependency | `@standard-schema/spec ^1.1.0` only | `npm view` (P1) |
| Peers (2.0.3) | `@modelcontextprotocol/client ^2.0.0`, `@modelcontextprotocol/core ^2.0.0`, `@modelcontextprotocol/server ^2.0.0` (server helpers only), `zod ^4.2.0`, `react`/`react-dom` 17–19 | `npm view` (P1); 2.0.0 release notes |
| Peers (1.7.5) | `@modelcontextprotocol/sdk ^1.29.0`, `zod ^3.25.0 \|\| ^4.0.0` | `npm view …@1.7.5` (P7) |
| Protocol version | `LATEST_PROTOCOL_VERSION = "2026-01-26"`; the bundles also carry `"2025-11-21"` | `dist/src/spec.types.d.ts` line 19 (P4) |
| Wire compatibility | "The MCP Apps wire protocol is unchanged: 2.x Views run in 1.x hosts and 2.x hosts render 1.x Views" | v2.0.0 release notes |
| 2.0.1–2.0.3 | No library changes; example-package fixes only | release notes |
| Licence | `package.json` says `MIT`. The tarball `LICENSE` describes a transition to Apache-2.0 for new code and specs, with unconsented MIT contributions staying MIT. GitHub reports `NOASSERTION`. | P1, P4, `gh api repos/modelcontextprotocol/ext-apps` |

- The core MCP spec moved on. Its current revision is `2026-07-28`, which negotiates extensions per request in `_meta["io.modelcontextprotocol/clientCapabilities"]` and through `server/discover`. The ext-apps stable spec still shows the `initialize`-based negotiation of the older core revisions (stable spec lines 1494–1518). The View ↔ host dialect (`ui/initialize`, `protocolVersion: "2026-01-26"`) is unaffected. This matters for the R6 MCP transport recipe more than for R5.
- The community client matrix lists MCP Apps support in Claude (web), Claude Desktop, VS Code GitHub Copilot, Microsoft 365 Copilot, Goose, Postman, MCPJam, ChatGPT, Cursor, Archestra.AI and PostHog Code.

### 2.2 View delivery and loading line://ui

#### Resource and sandbox

- The resource URI MUST start with `ui://`. The content MUST be one valid HTML5 document with `mimeType` `text/html;profile=mcp-app`, sent as `text` or base64 `blob` (stable spec lines 265–270). The SDK exports the MIME type as `RESOURCE_MIME_TYPE` (`dist/src/constants.d.ts`).
- A tool links to its View through `_meta.ui.resourceUri`. The flat `_meta["ui/resourceUri"]` key is deprecated and "will be removed before GA" (stable spec lines 335–347).
- Every View renders in a sandboxed iframe (stable spec line 1698). A web host MUST put a sandbox proxy on a different origin between itself and the View. The proxy needs `allow-scripts` and `allow-same-origin` (stable spec lines 472–475).
- The reference host `examples/basic-host/src/sandbox.ts` gives the inner iframe `sandbox="allow-scripts allow-same-origin allow-forms"`. It writes the View HTML with `document.write`, falls back to `srcdoc`, and sets CSP as an HTTP header on the proxy page.

#### CSP

- If `_meta.ui.csp` is absent, the host MUST apply this policy (stable spec lines 275–284). The draft adds `object-src 'none'` (draft lines 281–294, commit #715 of 2026-07-17).

  ```
  default-src 'none';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  media-src 'self' data:;
  connect-src 'none';
  ```

- `resourceDomains` adds origins to `script-src`, `style-src`, `img-src`, `font-src` and `media-src`. `connectDomains` feeds `connect-src`, `frameDomains` feeds `frame-src`, and `baseUriDomains` feeds `base-uri`. The host "MAY further restrict but MUST NOT allow undeclared domains" (stable spec lines 114–156, 286, 1729–1744).
- The default policy has no `font-src`, so fonts fall back to `default-src 'none'`. Remote fonts that the host sends in `styles.css.fonts` load only if the server declares their origin in `resourceDomains` (reading of stable spec lines 275–284 and 920–957; not probed).
- In the draft, `_meta.ui` may sit on the `resources/list` entry, on the `resources/read` content item, or on both. The content item wins (draft lines 263–272).

#### Loading line://ui

Probe P6 ran these checks in all three engines.

| Check | Default CSP | CSP with `https://cdn.jsdelivr.net` in `resourceDomains` |
|---|---|---|
| Lit 3.3.3 element inlined in a `<script type="module">` renders, and its shadow styles apply | yes | yes |
| Lit uses `adoptedStyleSheets` (1 sheet) | yes | yes |
| `light-dark()` follows `documentElement.style.colorScheme = 'dark'` | yes | yes |
| `import('data:text/javascript,…')` | blocked | blocked |
| `import(blob:…)` | blocked | blocked |
| `import('https://cdn.jsdelivr.net/npm/lit@3.3.3/+esm')` | blocked | loaded |
| `<link rel="stylesheet">` to `@websublime/line-themes/dist/index.css` on jsDelivr | blocked | loaded |

- Inside a View `'self'` is the sandbox origin, and that origin serves no line://ui files. A View therefore loads line://ui in one of two ways.
  - Inline. Everything sits in the one HTML document. The ext-apps quickstart uses `vite-plugin-singlefile`. Version 2.3.4 (published 2026-10-17, peer `vite ^5.4.21 || ^6 || ^7 || ^8`) sets `codeSplitting: false` on Vite 8 and `inlineDynamicImports: true` on earlier majors. So a lazy `import()` folds into the single module (`dist/esm/index.js` lines 94–95). Its README warns that some apps still end up with non-inlined chunks.
  - CDN. The server lists the CDN origin in `resourceDomains`.
- A2UI's guide "A2UI in MCP Apps" (last commit 2026-10-14) runs a Lit or Angular micro-app with an A2UI surface inside the double-iframe sandbox. It builds a self-contained HTML file and names `vite-plugin-singlefile` for Vite projects.

### 2.3 Host context and the standard variables

- The host returns `hostContext` in the `ui/initialize` result and pushes changes with `ui/notifications/host-context-changed` (stable spec lines 531–620, 1219–1224). The theming fields are listed below.
  - `theme` is `"light"` or `"dark"`.
  - `styles.variables` is a `Record<McpUiStyleVariableKey, string | undefined>`.
  - `styles.css.fonts` holds `@font-face` or `@import` CSS.
- Hosts "can provide any subset of standardized variables, or not pass `styles` at all". They should use `light-dark()` for theme-aware values. Views "should set default fallback values" for the variables they use (stable spec lines 891–906).
- The rationale says spacing is "intentionally excluded". It also says "No UI component library — no single library works across all host environments" (stable spec lines 1640–1644).

The SDK 2.0.3 helpers behave as follows. The bodies were read from `dist/src/app.js` (P4).

| Helper | Effect |
|---|---|
| `applyDocumentTheme(theme)` | Sets `data-theme` on `<html>` and `documentElement.style.colorScheme = theme` |
| `applyHostStyleVariables(styles, root = documentElement)` | Calls `root.style.setProperty(key, value)` for each defined key, so the values land in the inline style of `<html>` |
| `applyHostFonts(css)` | Appends `<style id="__mcp-host-fonts">` to `<head>` once |
| `getDocumentTheme()` | Reads `data-theme`, else the `.dark` class |

- Four entries export the helpers (P11). `.` and `./react` import `zod/v4`, `@modelcontextprotocol/client` and `@modelcontextprotocol/core` as externals, so they need those peers. `./app-with-deps` has no external imports. It bundles Zod 4 and the MCP client, and `dist/src/app-with-deps.js` contains `ZodError`. `./react-with-deps` imports only `react`, so it bundles the same code [INFERENCE from its import list; its contents were not grepped].
- The helpers carry the weight of the `App` client and Zod 4 under either entry, because the bundlers did not tree-shake that code away.
  - Unbundled files. `app-with-deps.js` is 98,441 B gzipped; `app.js` is 9,627 B gzipped plus its peers (P11).
  - Main entry `.`, helpers only (P8). Vite 8.3.4 library build 343,098 B minified and 81,457 B gzipped, with Zod present; Bun 1.4.3 102,015 B gzipped.
  - `./app-with-deps`, helpers only (P11). Vite 8.3.4 389,281 B minified and 80,897 B gzipped, with `ZodError` present; Bun 1.4.3 93,017 B gzipped.
  - A View that already uses the `App` class pays this cost once.

The complete published list has 76 keys. The stable spec (lines 797–889), the draft spec, `McpUiStyleVariableKey` in `dist/src/spec.types.d.ts` and `dist/src/generated/schema.json` in 2.0.3 agree (P4, P5).

| Group | Count | Keys |
|---|---|---|
| Background colour | 10 | `--color-background-{primary,secondary,tertiary,inverse,ghost,info,danger,success,warning,disabled}` |
| Text colour | 10 | `--color-text-{primary,secondary,tertiary,inverse,ghost,info,danger,success,warning,disabled}` |
| Border colour | 10 | `--color-border-{primary,secondary,tertiary,inverse,ghost,info,danger,success,warning,disabled}` |
| Ring colour | 7 | `--color-ring-{primary,secondary,inverse,info,danger,success,warning}` |
| Font family | 2 | `--font-sans`, `--font-mono` |
| Font weight | 4 | `--font-weight-{normal,medium,semibold,bold}` |
| Text size | 4 | `--font-text-{xs,sm,md,lg}-size` |
| Heading size | 7 | `--font-heading-{xs,sm,md,lg,xl,2xl,3xl}-size` |
| Text line height | 4 | `--font-text-{xs,sm,md,lg}-line-height` |
| Heading line height | 7 | `--font-heading-{xs,sm,md,lg,xl,2xl,3xl}-line-height` |
| Border radius | 6 | `--border-radius-{xs,sm,md,lg,xl,full}` |
| Border width | 1 | `--border-width-regular` |
| Shadow | 4 | `--shadow-{hairline,sm,md,lg}` |

- Plan §7.2 (line 464) names "colour, font and border-radius" variables. Those groups hold 37 + 28 + 6 = 71 keys. Border width and shadows (5 keys) fall outside that wording.
- The reference host `basic-host/src/host-styles.ts` sends every key. Its radii are 2, 4, 6, 8, 12 and 9999 px. Its text sizes run from 0.75 to 1.125 rem, and its heading sizes from 0.75 to 2.25 rem.

The table below shows where each group could land in line://ui today.

| Host group | Keys | Existing line target | Layer |
|---|---|---|---|
| Colours | 37 | Colour role aliases `--line-{gray,info,danger,success,warning,accent}-{surface,bg,bg-hover,bg-active,border,solid,solid-hover,text-low,text}` | `line-themes` (`aliases.css`, 54 aliases) |
| Ring colours | (7 of the 37) | `--line-focus-ring-color` (defaults to `var(--line-accent-8)`) | `line-tokens` (`focus-ring.css`) |
| Font family | 2 | `--line-font-sans`, `--line-font-mono` | `line-tokens` |
| Font weight | 4 | `--line-font-weight-1..9` (numeric 100–900) | `line-tokens` |
| Sizes and line heights | 22 | `--line-font-size-0..8` (9 steps), `--line-leading-0..5` | `line-tokens` |
| Border radius | 6 | `--line-radius-1..6` (2px, 5px, 1rem, 2rem, 4rem, 8rem), `--line-radius-round` | `line-tokens` |
| Border width | 1 | `--line-border-0..5` | `line-tokens` |
| Shadow | 4 | `--line-shadow-1..6` | `line-tokens` |

- `line-themes` declares no font, radius, shadow, border or focus-ring property (`grep` over `packages/line-themes/src/*.css`). Its manifest depends on `line-colors` and `line-schemas` only, and `ALLOWED_EDGES` gives `line-themes` no edge to `line-tokens` (`scripts/lint-layers.mjs` line 63).
- Some host colour keys have no line alias with the same role. These are `inverse` in all four colour families, `ghost` and `disabled` in the three families other than ring, and the tertiary steps of text and border.

### 2.4 Primitive fallback strategy

#### 2.4a Hosts without MCP Apps, and tool result degradation

- "If host does not support MCP Apps, tool behaves as standard tool (text-only fallback)" (stable spec line 389).
- "Servers SHOULD provide text-only fallback behavior for all UI-enabled tools". "Tools MUST return meaningful content array even when UI is available". "Servers MAY register different tool variants based on host capabilities" (stable spec lines 1556–1560). The server checks support with `getUiCapability(clientCapabilities)` against `RESOURCE_MIME_TYPE` (lines 1531–1554).
- `content` carries the text for the model and for text-only hosts. `structuredContent` feeds the View and is "not added to model context". `_meta` carries data that is not for the model (stable spec lines 1471–1475).
- The core extensions overview says the same thing: "a server offering UI-enhanced tools should still return meaningful text content for clients that don't support the UI extension".
- Effect on line://ui. A host without MCP Apps fetches no `ui://` resource, so no View and no line component renders. The user sees the host's own rendering of `content`. The degraded output belongs to the server author, and line://ui ships nothing for it.
- A host with MCP Apps may still omit `styles` or any key. The View's own fallbacks then apply (§2.3), and that is where §2.4b starts.

#### 2.4b CSS fallbacks in the bridge

The probe (P6) ran each rule in a View under the default CSP, with and without host variables. Results were the same in Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2.

| Rule shape | Host sends the key | Host omits the key |
|---|---|---|
| Alias. `:where(html) { --line-gray-surface: var(--color-background-primary, var(--line-gray-2)) }` | `light-dark(#ffffff, #1a1a1a)` computes to `rgb(26, 26, 26)` in dark | Falls back to the line step, `rgb(240, 240, 240)` |
| Primitive on `html`, self-referencing. `:where(html) { --line-radius-2: var(--border-radius-sm, var(--line-radius-2)) }` | `6px` | Guaranteed-invalid. `getPropertyValue` returns `""`, and a `border-radius` that uses the token computes to `0px` |
| Primitive on `body`, CSS-wide keyword fallback. `body { --x: var(--border-radius-sm, inherit) }` with `html { --x: 7px }` | `6px` | Inherits `7px` from `html` |
| `inherit()` function (`CSS.supports('width', 'inherit(--x)')`) | WebKit `true`; Chromium and Firefox `false` | same |

- The self-reference fails only when the fallback is used. CSS Values 5 substitutes the fallback lazily, after the first argument turns out guaranteed-invalid, and a cyclic substitution context yields the guaranteed-invalid value (css-variables-2 §3, editor's draft retrieved 2026-10-19). So the cycle bites exactly when the host omits the key.
- css-variables-2 lists "Allowed variables to resolve to a CSS-wide keyword (only possible by providing it as a fallback)" among its changes. That is the basis of the `inherit` row.
- On `html` an `inherit` fallback would get the initial value, because the root has no parent [INFERENCE from the CSS cascade definition of `inherit`; not probed]. The `body` row works because `line-tokens` declares the primitives on `html`.
- Host values set by `applyHostStyleVariables` sit in the inline style of `<html>`, so they beat every `:where(html)` rule in `@layer line` and inherit into `body` and into shadow trees.
- The prefix audit in `lint-layers` checks declarations only (`scripts/lint-layers.mjs` lines 21–22, 255–292). A bridge that reads `--color-*` and declares only `--line-*` passes it.

The spec can choose among the four strategies below. The table records evidence only, and the choice belongs to the spec (§6 Q2).

| Option | Mechanism | Evidence for | Evidence against |
|---|---|---|---|
| (a) Copy literals | `--line-radius-2: var(--border-radius-sm, 5px)` in `line-themes` | Simple, and works on `html` | Copies `line-tokens` values into `line-themes`, which can drift (`00-research-generative-ui.md` §4.8) |
| (b) Second host sheet in `line-tokens` | `line-tokens` ships its own MCP Apps sheet for the primitive rows and can use its own literals | Each layer declares only its own properties | ARCHITECTURE §17.6, plan §2.1 (item 7 and the subpath table) and PRD §7.3 name one path, `line-themes/hosts/mcp-apps.css` |
| (c) `body` scope with `inherit` | `body { --line-radius-2: var(--border-radius-sm, inherit) }` in the bridge | No literals and no cycle; same result in three engines (P6) | Applies to `body` and below only; a rule that reads a primitive on `html` itself keeps the `line-tokens` value. `line-themes` still declares `line-tokens` property names. |
| (d) Colour aliases only | The bridge leaves primitives alone | Keeps `line-themes` within its own names | Fails plan §7.2 line 464 and PRD §7.3 line 899, which require every font and border-radius key on the list |

### 2.5 Re-check of `00-research-generative-ui.md` (2026-10-06)

| Statement in the prior note | Status on 2026-10-19 |
|---|---|
| §2.2 "Stable spec 2026-01-26" | Holds |
| §2.2 "`@modelcontextprotocol/ext-apps` 2.0.3" | Holds; still `latest` |
| §2.2 "MIT SDK" | Incomplete. `package.json` says MIT, but the `LICENSE` file describes a mixed MIT and Apache-2.0 transition (§2.1) |
| §2.2 hosts "Claude, ChatGPT, VS Code, M365 Copilot, Cursor, Goose" | Holds. The matrix also lists Claude Desktop, Postman, MCPJam, Archestra.AI and PostHog Code |
| §2.2 "76 standard host CSS variables" | Holds; the list is identical in spec, draft and SDK |
| §4.8 "default CSP allows inline script and style" | Holds (P6) |
| §4.8 "inlined … or loaded from a CDN listed in `resourceDomains`" | Holds (P6). Lazy `import()` needs inlining by the bundler or a declared CDN |
| §4.8 "The SDK also sets `color-scheme`" | Holds. `applyDocumentTheme` also sets `data-theme` |
| §4.8 "a self-reference is a cycle and resolves to invalid" | Holds only when the fallback is taken, which is the case that matters (P6) |
| §4.8 "copying literals … and a second host sheet in `line-tokens`" as the two choices | A third option exists, the `body`-scoped `inherit` fallback (§2.4b (c)) |
| §4.8 draft mapping table | Covers 30 of the 76 keys. It routes `--color-ring-primary`, `--font-*`, `--border-radius-*` and `--shadow-*` to `line-tokens` primitives, not to theme aliases. `--border-radius-{xs..xl}` → `--line-radius-{1..5}` pairs host values of 2–12 px with line values of 2px to 4rem |
| §4.8 "A2UI in MCP Apps … with no extra code" | The guide still exists (last commit 2026-10-14). See §4 on the Zod peer split |

## 3. Probes

All probes ran on 2026-10-19 in `mktemp -d` directories with `HOME=<tmpdir>`. Each directory was deleted afterwards.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view @modelcontextprotocol/ext-apps version dist-tags license time.modified repository.url peerDependencies dependencies exports --json`; `npm view … time --json` | 0 | 2.0.3 `latest`; peers and exports as in §2.1; last publish 2026-09-25 |
| P2 | `gh api repos/modelcontextprotocol/ext-apps`; `gh release list`; `gh release view v2.0.0`, `v2.0.1`, `v2.0.3` | 0 | Licence `NOASSERTION`; release notes quoted in §2.1 |
| P3 | `gh api …/contents/specification/{2026-01-26,draft}/apps.mdx`; `gh api "…/commits?path=specification/draft"` | 0 | Stable 1,768 lines, draft 2,654 lines; last draft commit 2026-07-22 |
| P4 | `npm pack @modelcontextprotocol/ext-apps@2.0.3`, then extract `McpUiStyleVariableKey` from `spec.types.d.ts` and every `--*` key from `generated/schema.json` | 0 | 76 keys in each, symmetric difference empty; `LATEST_PROTOCOL_VERSION = "2026-01-26"`; helper bodies as in §2.3 |
| P5 | `diff` of the "Current Standardized Variables" to "Custom Fonts" sections, stable vs draft | 0 | Identical |
| P6 | `bun build el.ts --minify --format esm` (a Lit 3.3.3 element, 28.96 KB), then `bun probe.mjs`. The harness serves a host page, a sandbox proxy on another origin with the CSP as an HTTP header, and an inner iframe `sandbox="allow-scripts allow-same-origin allow-forms"` filled by `document.write`, as in basic-host. It runs Playwright 1.64.0 with Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2. | 0 | Results in §2.2 and §2.4b. The first two runs returned no data, because an unescaped `</script>` in the harness ended the proxy script early. The third run escaped it. Chromium logged each blocked load as a `script-src` or `style-src` violation |
| P7 | `bun add @modelcontextprotocol/ext-apps@2.0.3 zod@3.25.76`; `bun add @modelcontextprotocol/client@^2 @modelcontextprotocol/core@^2`; `npm view @modelcontextprotocol/ext-apps@1.7.5 peerDependencies` | 0, 0, 0 | `warn: incorrect peer dependency "zod@3.25.76"`; client and core 2.3.1; 1.7.5 accepts `zod ^3.25.0 \|\| ^4.0.0` |
| P8 | `bun build helpers.js --minify` and `vite build` (Vite 8.3.4, library mode) on an entry that imports only `applyHostStyleVariables`, `applyDocumentTheme` and `applyHostFonts` from `.` | 0, 0 | Bun 0.38 MB, 102,015 B gzipped. Vite 343,098 B, 81,457 B gzipped, with `ZodError` present |
| P9 | `npm pack vite-plugin-singlefile@2.3.4`, grep `dist/esm/index.js` and `README.md`; `npm view vite-plugin-singlefile time` | 0 | `codeSplitting: false` on Vite ≥ 8; 2.3.4 published 2026-10-17, 2.3.3 before it on 2026-04-17 |
| P10 | `npm view @websublime/line-themes version dist-tags`; `npm view @websublime/line-tokens version` | 0 | `line-themes` 0.1.2 and `line-tokens` 0.1.3 on npm; jsDelivr served the `line-themes` CSS in P6 |
| P11 | `npm pack @modelcontextprotocol/ext-apps@2.0.3`; grep the `from"…"` imports and the `export{…}` lists of `app.js`, `app-with-deps.js`, `react/index.js` and `react/react-with-deps.js`; `gzip -c … \| wc -c`; `bun build` and `vite build` (8.3.4) of the three helpers imported from `app-with-deps.js` | 0, 0, 0, 0 | All four entries export the helpers. `app.js` and `react/index.js` import `zod/v4`, `@modelcontextprotocol/client` and `@modelcontextprotocol/core`; `app-with-deps.js` imports nothing; `react-with-deps.js` imports only `react`. Gzipped sizes: `app-with-deps.js` 98,441 B, `app.js` 9,627 B, helpers-only builds as in §2.3 |

## 4. Fit with line://ui

- **Law 1 and Law 5.** The bridge is CSS only and changes no component. The probe shows host values reaching a shadow root through inherited custom properties.
- **Law 2.** The bridge reads unprefixed `--color-*`, `--font-*`, `--border-*` and `--shadow-*` names but declares only `--line-*` names, which the `lint-layers` prefix audit accepts (§2.4b). `data-theme` comes from the SDK, not from a line package, so PRD v0.8.12 ("No line package declares a mode class or attribute") still holds.
- **Law 6 and ARCHITECTURE §17.4.** Lazy `import()` through descriptor `load()` works in a View only when the bundler inlines the chunks (vite-plugin-singlefile sets `codeSplitting: false` on Vite 8) or when the chunks come from a `resourceDomains` origin. `data:` and `blob:` module URLs are blocked by default (P6).
- **Law 10.** `line-themes` has no `line-tokens` edge (`lint-layers.mjs` line 63). Options (a) and (c) of §2.4b make `line-themes` declare `line-tokens` property names without a package edge. Law 10 names "palette values inside themes" as leakage, so option (a) copies `line-tokens` values into `line-themes` as well. Whether either counts as leakage is a reading for the spec, and this note does not decide it.
- **PRD v0.8.12 and ARCHITECTURE §4.** `color-scheme` is the only mode switch. `applyDocumentTheme` sets it, and the host colours arrive as `light-dark()` values that resolve per element (P6).
- **ARCHITECTURE §17.1 theming scopes.** `aliases.css` re-declares every alias in `:where(html, [data-accent], [data-gray])`. A bridge that maps aliases only on `html` would be overridden inside any nested `[data-accent]` or `[data-gray]` scope (from the selector in `aliases.css` lines 7–28; not probed).
- **A2UI inside a View (ARCHITECTURE §17.1, plan §5.3).** ext-apps 2.x wants `zod ^4.2.0` through its main entry and bundles Zod 4 in `./app-with-deps`. `@a2ui/web_core` 0.13.0 and the repo declare `zod ^3.25.76` (plan §5.3). A View that bundles `line-genui` with the 2.x main entry gets a peer warning (P7). With either 2.x entry it carries two Zod copies [INFERENCE from the two ranges and the bundled copy]. ext-apps 1.7.5 accepts either Zod major but is the superseded major. R1 and R3 own the Zod question.
- **ARCHITECTURE §17.8.** The deferred host element `<line-mcp-app-frame>` would build on the `./app-bridge` export. Nothing in this note changes its trigger.

## 5. Contradictions

### 5.1 With ARCHITECTURE, the plan or the PRD

- **C1. Bridge targets.** `docs/ARCHITECTURE.md:1534` says the bridge "maps the standard MCP host variables onto line theme aliases". `line-themes` declares aliases for colour roles only (`packages/line-themes/src/aliases.css`). The 28 font keys, 6 radius keys, 1 border-width key, 4 shadow keys and the focus-ring target have no `line-themes` alias. They can map only onto `line-tokens` primitives. `docs/plans/01-plan-core-primitives.md:464` and `docs/PRD.md:899` already say "alias or token", and `docs/ARCHITECTURE.md:1536` names the primitive case. So the plan and PRD are consistent with the source, and the alias-only wording of ARCHITECTURE line 1534 is narrower than both.
- **C2. Bridge scope.** `docs/ARCHITECTURE.md:1534` maps "the standard MCP host variables", which reads as all 76 keys. `docs/ARCHITECTURE.md:1561`, `docs/plans/01-plan-core-primitives.md:464` and `docs/PRD.md:899` limit the reference list to colour, font and border-radius variables, which hold 71 keys (§2.3). The 5 remaining keys, `--border-width-regular` and `--shadow-{hairline,sm,md,lg}`, fall inside the ARCHITECTURE line 1534 wording and outside the other three.

### 5.2 Conditions ARCHITECTURE leaves unstated

These are not contradictions, because the statements hold under conditions the text does not name.

- `docs/ARCHITECTURE.md:1533` says line://ui "works unchanged inside an MCP Apps View". P6 supports a narrower fact. A generic Lit 3.3.3 element, inlined in a module script, rendered with its shadow styles and adopted stylesheet under the default CSP, and `light-dark()` followed `color-scheme`. The `line-themes` CSS loaded only in the CDN check. P6 ran no line://ui component, no `line-core` mixin and no Zag machine. The lazy loading of `docs/ARCHITECTURE.md:1504` needs inlined chunks or a declared CDN origin.
- `docs/ARCHITECTURE.md:1535` has the app apply host styles "with the ext-apps SDK (`applyHostStyleVariables`, `applyDocumentTheme`)". The helpers behave as stated in 2.0.3. Four entries export them (§2.3, P11). The main entry `.` needs the `zod ^4.2.0` and `@modelcontextprotocol/client ^2` peers, while `./app-with-deps` is self-contained. A helpers-only Vite 8 build weighs about 81 KB gzipped under either entry (81,457 B from `.`, 80,897 B from `./app-with-deps`), because the `App` client and Zod 4 come along.

### 5.3 With the prior research note

`00-research-generative-ui.md` is evidence, not a rule, so these findings are corrections to record, not contradictions to send back. §2.5 records four of them.

- The SDK licence is not plain MIT.
- The draft mapping covers 30 of the 76 keys and routes several of them to `line-tokens` primitives.
- The host and line radius scales do not match.
- A third primitive fallback option exists, the `body`-scoped `inherit` rule.

## 6. Open questions for the spec

- **Q1. Reference list (ARCHITECTURE §17.9, plan §5.5).** Options:
  - (a) all 76 keys;
  - (b) the 71 colour, font and border-radius keys that plan §7.2 line 464 names;
  - (c) a subset that has a line target with the same role, such as the 30 keys of the prior draft table.

  The decision needs a key-by-key line target for each candidate (§2.3 tables), plus a ruling on keys with no matching role (`inverse`, `ghost`, `disabled`, tertiary). Option (c) needs a criterion that justifies leaving keys out.
- **Q2. Primitive fallback (ARCHITECTURE §17.6 line 1536).** Options (a) copy literals, (b) a second sheet in `line-tokens`, (c) a `body`-scoped `var(--host, inherit)`, and (d) colour aliases only (§2.4b). The evidence that decides it is listed below.
  - The Law 10 reading of `line-themes` declaring `line-tokens` names.
  - Whether any line rule reads primitives on `html` itself.
  - A drift test for (a).
  - A plan, PRD and ARCHITECTURE path change for (b).
  - Plan line 464 for (d).
- **Q3. Scale alignment.** The host and line scales differ in step count and value. Radius has 6 host keys against 6 numbered line steps plus `round`, with 2–12 px against 2px–8rem. Font size has 11 against 9, line height 11 against 6, weight 4 named against 9 numeric, and shadow 4 against 6. Options are a positional map, a nearest-value map, or new line roles. The evidence is the reference host values (§2.3) and the values real hosts send, which this note did not capture.
- **Q4. Nested theming scopes.** Options are to declare the bridge in `:where(html, [data-accent], [data-gray])` so host colours win inside nested scopes, or on `html` only so nested `data-*` scopes revert to line steps. The evidence is a browser test of both against `aliases.css` and the PRD §9.4 intent for nested scopes.
- **Q5. SDK entry and major in docs and recipes.** The options are listed below. The evidence is R1 and R3 on the Zod major of `line-genui`, the R6 MCP recipe pins, and a helpers-only weight budget (§2.3).
  - (a) ext-apps 2.x main entry `.`, with the `zod ^4.2` and client 2.x peers.
  - (b) ext-apps 2.x `./app-with-deps`, self-contained with Zod 4 and the client bundled (about 81 KB gzipped for the helpers alone).
  - (c) ext-apps 1.7.5, which accepts Zod 3.
  - (d) Inline equivalents of the helpers with no SDK.
- **Q6. Delivery recipe.** Options are one inlined file (`vite-plugin-singlefile`, `codeSplitting: false`), a CDN in `resourceDomains` (jsDelivr verified in P6), or both. The evidence is R9 on CDN delivery and a build of a View with a `line-genui` lazy `load()` under both.
- **Q7. Fonts.** Should the docs tell server authors to list the host font origins in `resourceDomains`, given that the default CSP has no `font-src`? The evidence is a capture of the `styles.css.fonts` value that real hosts send (not captured here).

## 7. Sources

All retrieved on 2026-10-19.

MCP Apps
- Stable spec 2026-01-26: https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx
- Draft spec: https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx
- Repository and releases: https://github.com/modelcontextprotocol/ext-apps, https://github.com/modelcontextprotocol/ext-apps/releases/tag/v2.0.0, https://github.com/modelcontextprotocol/ext-apps/releases/tag/v2.0.3
- npm package: https://www.npmjs.com/package/@modelcontextprotocol/ext-apps
- Migration guide to 2.x: https://apps.extensions.modelcontextprotocol.io/api/documents/migrate-to-v2.html
- Patterns (host context): https://github.com/modelcontextprotocol/ext-apps/blob/main/docs/patterns.md
- CSP and CORS: https://github.com/modelcontextprotocol/ext-apps/blob/main/docs/csp-cors.md
- Quickstart (vite-plugin-singlefile): https://github.com/modelcontextprotocol/ext-apps/blob/main/docs/quickstart.md
- Reference host sandbox: https://github.com/modelcontextprotocol/ext-apps/blob/main/examples/basic-host/src/sandbox.ts
- Reference host style values: https://github.com/modelcontextprotocol/ext-apps/blob/main/examples/basic-host/src/host-styles.ts
- MCP Apps overview: https://modelcontextprotocol.io/extensions/apps/overview
- Extensions overview and negotiation: https://modelcontextprotocol.io/extensions/overview
- Client matrix: https://modelcontextprotocol.io/extensions/client-matrix
- Core versioning (current 2026-07-28): https://modelcontextprotocol.io/specification/versioning

A2UI
- A2UI in MCP Apps: https://github.com/a2ui-project/a2ui/blob/main/docs/public/guides/a2ui-in-mcp-apps.md

CSS
- CSS Custom Properties Level 2 (editor's draft): https://drafts.csswg.org/css-variables-2/

Tooling
- vite-plugin-singlefile: https://www.npmjs.com/package/vite-plugin-singlefile
