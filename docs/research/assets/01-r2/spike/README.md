# R2 projection spike

Throwaway spike for research item R2 (row `00-Z42`, Phase 1 plan §5.1). It renders the same A2UI v0.9.1 streams
with both projection candidates and measures the nine plan targets. The note
`docs/research/01-research-projection-technique.md` reports the results. The components here are minimal stand-ins
on the real `LineElement`, not Phase 1 components.

- **(a) adapters.** `src/surface-a/`. One light-DOM adapter element per node, built on `A2uiLitElement` with
  `createRenderRoot()` returning `this`, rendered through `renderA2uiNode` from `@a2ui/web_core/v0_9/universal`.
  The variant `a-contents` gives every adapter `display: contents`. The variant `a-shadow` keeps the upstream shadow
  root and serves only as the control of the `::part()` check.
- **(b) direct projection.** `src/surface-b/`. `NodeResolver` from `@a2ui/web_core/v0_9`, one `effect` per node,
  `line-*` and native elements created directly in the surface's light DOM.
- **Shared.** `src/session.ts` (one `MessageProcessor`, one `processMessages` call per message, every throw turned
  into an A2UI `error` message) and `src/surface-base.ts` (live region, `aria-busy`, lazy `load()`, required button
  names, `line-a2ui-error` and `line-a2ui-action`).

Nothing in the repository installs, builds or tests this directory. It has no `package.json`, and no file name
matches Bun's test patterns. `playwright.config.ts` here sets its own `testMatch` (`checks/*.check.ts`).

## Versions

| Package or input | Version | Source |
|---|---|---|
| Bun | 1.4.3 | `.bun-version` |
| Vite | 8.3.4 | `bun.lock` |
| Playwright | 1.64.0 (Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2) | `bun.lock` |
| Lit | 3.3.3 | `bun.lock` |
| Zod | 3.25.76 | `bun.lock` |
| `@a2ui/web_core` | 0.14.0, exact | `bun add -E` (R1 version; `latest` on 2026-10-19) |
| `@axe-core/playwright` | 4.14.0, exact (axe-core 4.14.0) | `bun add -E` (R8 tier) |
| `ajv`, `ajv-formats` | 8.20.0, 3.0.1, exact | `bun add -E` |
| A2UI v0.9.1 schemas | `a2ui-project/a2ui` at `cbaa5ee62c737b50d0695c1e5794d0f648b61dca` | `scripts/fetch-spec.ts` |
| `LineElement` | `packages/line-core` built from the same checkout | `vite.config.mts` alias |

## Rerun every check from a clean copy

Run from the repository root of a checkout that contains this directory. The browsers come from the existing
Playwright cache, because `HOME` points at the temporary directory.

```sh
REPO="$(git rev-parse --show-toplevel)"
BROWSERS="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/Library/Caches/ms-playwright}"   # Linux: $HOME/.cache/ms-playwright
WORK="$(mktemp -d)"
git -C "$REPO" archive HEAD | tar -x -C "$WORK"
cd "$WORK"
git init -q                       # the root `prepare` script runs `git config`
export HOME="$WORK" PLAYWRIGHT_BROWSERS_PATH="$BROWSERS"
bun install
bun add -E @a2ui/web_core@0.14.0 @axe-core/playwright@4.14.0 ajv@8.20.0 ajv-formats@3.0.1
bun run --filter @websublime/line-core build
cp -R docs/research/assets/01-r2/spike "$WORK/r2-spike"
cd "$WORK/r2-spike"
bunx playwright install chromium firefox webkit   # no-op when the 1.64.0 builds are cached
bun scripts/fetch-spec.ts         # A2UI v0.9.1 schemas → out/spec
bun scripts/catalog.ts            # target 7 and the catalog size → out/results/catalog.json
bun scripts/build.ts              # one Vite 8 build per bundle page → out/dist/{a,b,a-eager}
bunx playwright test              # 6 checks × 3 browsers → out/results, out/screens
bun scripts/evidence.ts           # condensed evidence → out/evidence
```

`out/evidence` holds the files committed under `docs/research/assets/01-r2/`. Delete `$WORK` afterwards.

## What each step answers

| Step | Plan targets | Output |
|---|---|---|
| `checks/render.check.ts` | 1 slot assignment, 2 layout, 3 accessibility tree, 4 `::part()` reach | `render-<browser>.json`, `screens/*.png` |
| `checks/a11y.check.ts` | 8 axe-core, live region | `a11y-<browser>.json` |
| `checks/focus.check.ts` | 8 focus rules, `aria-busy` per batch | `focus-<browser>.json`, `busy-<browser>.json` |
| `checks/throws.check.ts` | 6 throw paths | `throws-<browser>.json` |
| `checks/bundle.check.ts` | 5 Law 6 bundle analysis, 9 weight | `bundle-<browser>.json` |
| `scripts/catalog.ts` | 7 meta-schema validation, catalog size | `catalog.json`, `line-catalog.emitted.json` |

The fixtures live in `src/fixtures.ts`. The page `pages/reference.html` holds hand-written `line-*` markup for the final
state of `showcase` and `slots`, and the slot and layout checks compare each candidate against it.

## Screen-reader pass (manual, VoiceOver)

The spike does not automate VoiceOver and changes no system setting. Run the pass in Safari and in Chrome on macOS,
once per candidate.

### Setup

1. Follow the recipe up to `bun scripts/fetch-spec.ts`, then start the dev server in `$WORK/r2-spike`:
   `bunx vite --config vite.config.mts`.
2. Open the pages below at `http://127.0.0.1:4331`. Replace `<v>` with `a` for adapters and `b` for direct
   projection.
3. Turn VoiceOver on with its usual shortcut. `VO` means Control+Option.
4. "Feed next step" feeds one batch of the fixture. With `delay=4000` the batch arrives 4 s after activation, which
   leaves time to move focus back into the surface.

| Page | URL |
|---|---|
| Reference | `/pages/reference.html?fixture=showcase` |
| Showcase | `/pages/surface.html?v=<v>&fixture=showcase&manual` |
| Focus | `/pages/surface.html?v=<v>&fixture=focus&manual&delay=4000` |
| Missing name | `/pages/surface.html?v=<v>&fixture=missing-name&manual` |
| Unknown type | `/pages/surface.html?v=<v>&fixture=unknown-type&manual` |
| Streaming | `/pages/surface.html?v=<v>&fixture=streaming&manual` |

### Checks and expected announcements

The expectations come from the automated run. Playwright's `ariaSnapshot` of the rendered surface equals the
reference page for both candidates in all three engines, apart from the live region. The Chromium tree of (a) holds
6 more `generic` nodes than (b) for `showcase`.

| # | Page and steps | Expected, (a) | Expected, (b) |
|---|---|---|---|
| S1 | Showcase. Activate "Feed next step" once. | "Content updated." once, politely. The VoiceOver cursor stays on "Feed next step". | Same as (a). |
| S2 | Showcase. Feed step 2, then read the surface with `VO`+Right from "R2 spike surface". | "Inbox, heading level 2"; "Grace"; "Avatar of the user, image"; a separator; "list, 2 items"; "Draft saved"; "Reply sent"; "Send, button"; a separator; "Close, button"; "Full width, button". The mail and check icons are silent. Note any extra empty group stop. | The same sequence with no extra stops, as on the reference page. |
| S3 | Focus. Feed step 1. Activate "Feed next step", then Tab to "Beta" within 4 s. | "Content updated."; focus stays on the button, now "Beta 2". `VO`+F3 reads "Beta 2, button". | Same as (a). |
| S4 | Focus. Repeat S3 for step 3, which inserts "Gamma" before "Beta 2". | Focus stays on "Beta 2"; `VO`+Left reaches "Gamma, button", then "Alpha, button". | Same as (a). |
| S5 | Focus. Repeat S3 for step 4, which changes Beta's variant. | Focus stays on "Beta 2"; only "Content updated." is spoken. | Same as (a). |
| S6 | Focus. Repeat S3 for step 5, which moves "Beta 2" to the front. | Focus is lost, because Lit's keyed `repeat` moves the focused element itself. VoiceOver lands on the page or the web area. Note where. | Focus stays on "Beta 2"; the siblings move around it. `VO`+Right reaches "Alpha, button", then "Gamma, button". |
| S7 | Missing name. Feed step 1, then Tab into the surface. | "Some content could not be shown."; the button reads as "button" with no name. | Same as (a). |
| S8 | Unknown type. Feed step 1, then read the surface. | "Some content could not be shown."; "Kept" is read; the placeholder is silent. | Same as (a). |
| S9 | Streaming. Feed steps 1–4 one by one, resting the cursor on the surface. | "Content updated." after each step, and no partial content read while a batch is busy. | Same as (a). |
| S10 | Focus. Repeat S3 for step 6, which moves "Beta 2" into a new Column. | Focus is lost, because the button gets a new parent. Note where VoiceOver lands. | Same as (a): the element moves to the new parent and blurs. |

Record each observation per browser in the table below and send it to the orchestrator.

| # | Safari (a) | Safari (b) | Chrome (a) | Chrome (b) |
|---|---|---|---|---|
| S1 | | | | |
| S2 | | | | |
| S3 | | | | |
| S4 | | | | |
| S5 | | | | |
| S6 | | | | |
| S7 | | | | |
| S8 | | | | |
| S9 | | | | |
| S10 | | | | |
