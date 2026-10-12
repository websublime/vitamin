# Phase 00 retrospective

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

### What a Phase 1 spec needs if the outcome is committed

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
