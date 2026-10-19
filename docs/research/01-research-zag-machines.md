# Research: Zag.js and the machines

**Row:** `00-Z36` (Phase 1 plan §5.2 R7)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` (§2.2, §5.2, §5.5, §6), `docs/PRD.md` (§4 catalogue rows, §7.3), `docs/ARCHITECTURE.md` (§6, §8, §12, §13), `docs/MANIFESTO.md`, `packages/line-core/src/machine/**`, `packages/line-core/src/line-element.ts`, `packages/line-core/__tests__/line-machine-controller.test.ts`, `packages/line-core/package.json`, root `package.json`, `bun.lock`, `docs/research/00-research-design-system-foundation-round2.md`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - Every Zag.js package Phase 1 can touch was at 1.46.0 on npm `latest` on 2026-10-14 (published 2026-10-11) and
>   still is on 2026-10-19. The repo floor `^1.46.0` equals it. `2.0.0-next.3` sits on the `next` tag (2026-09-14)
>   and is a prerelease.
> - Presence is the only Phase 1 component with a pre-built machine (`@zag-js/presence` 1.46.0). It has three states,
>   no anatomy and no prop getters. Its `connect` returns `skip`, `present`, `setNode` and `unmount`, and the
>   machine reacts to `present` through `watch`.
> - `LineMachineController` starts Presence correctly, but it has no path for prop changes. A change of the host
>   `present` property never reaches the machine (probe P2). `VanillaMachine.updateProps` does drive the machine
>   (P3), but each call wraps one more closure, so the cost of each update grows with the number of earlier
>   updates (P4).
> - Neither Zag nor Ark UI ships a Button or an AvatarGroup. The nearest Zag machines are `@zag-js/toggle` (pressed
>   as context, disabled as a prop, one `idle` state) and `@zag-js/avatar` (`loading`/`loaded`/`error`, parts
>   `root`/`image`/`fallback`). Chakra UI and MUI build AvatarGroup without a machine. The AvatarGroup overflow
>   popover maps to `@zag-js/popover`, which the catalogue schedules for Phase 3.
> - The ARCHITECTURE §8 Input example omits `initialState`, which `createMachine` requires in 1.46.0. It fails `tsc`
>   (TS2345) and, through the controller, mounts in static fallback (probe A1). Section 5 lists seven more
>   mismatches between ARCHITECTURE §6, §8, §13 and the current Zag API or the repo code.

---

## 1. Question

Plan §5.2 R7 reads "`@zag-js/presence` (Presence is pre-built) through `LineMachineController`; custom machines for
Button, IconButton, AvatarGroup (ARCHITECTURE §13.1–§13.2)". The task splits it into five sub-questions.

| # | Sub-question |
|---|---|
| Q1 | Which Zag.js packages does each of the 20 Phase 1 components (plan §2.2) use, at which version on 2026-10-14, against the repo floor? |
| Q2 | What is the `@zag-js/presence` machine API? |
| Q3 | How does Presence run through `LineMachineController`? |
| Q4 | What does `createMachine` require, how do other Zag-based libraries treat Button, IconButton and AvatarGroup, and what state does each need? |
| Q5 | Where do ARCHITECTURE §8 and §13 disagree with the current Zag.js API? |

## 2. Findings

### 2.1 Q1 — Packages and versions

All dates come from `npm view <pkg> time --json`, retrieved 2026-10-19. No `@zag-js/*` package was published between
2026-10-11 and 2026-10-19, so the 2026-10-14 `latest` equals today's.

| Package | `latest` on 2026-10-14 | Published | Repo declaration | Role in Phase 1 |
|---|---|---|---|---|
| `@zag-js/core` | 1.46.0 | 2026-10-11T18:40Z | `^1.46.0` (root and `line-core` `dependencies`) | `createMachine` for Button, IconButton, AvatarGroup |
| `@zag-js/vanilla` | 1.46.0 | 2026-10-11 | `^1.46.0` (root and `line-core`) | `VanillaMachine` inside `LineMachineController` |
| `@zag-js/presence` | 1.46.0 | 2026-10-11T18:41Z | not declared | Presence |
| `@zag-js/types`, `dom-query`, `utils`, `store` | 1.46.0 | 2026-10-11 | transitive | Pulled in by core, vanilla and presence |
| `@zag-js/popover` | 1.46.0 | 2026-10-11 | not declared | Candidate for the AvatarGroup overflow popover (§2.4) |
| `@zag-js/avatar` | 1.46.0 | 2026-10-11 | not declared | Exists; Avatar is Static in the PRD (§6 OQ6) |
| `@zag-js/toggle` | 1.46.0 | 2026-10-11 | not declared | Nearest Zag precedent for a pressed state |

- `bun.lock` resolves `@zag-js/core` and `@zag-js/vanilla` to 1.46.0.
- Zag packages pin their siblings exactly. `@zag-js/presence@1.46.0` depends on `@zag-js/core`, `types` and
  `dom-query` at `1.46.0`, and `@zag-js/vanilla@1.46.0` pins `core` at `1.46.0` the same way.
- The `next` tag carries `2.0.0-next.3` (2026-09-14). The `v2` branch changelog adds a `defaultPropKey` schema field
  (custom schemas without it keep the old behaviour) and `watchEffect` for effects. Several machines rename `prev`
  to `previous`. No Phase 1 package is named in those breaking renames.

Per-component map (tiers from PRD §7.3 and plan §2.2):

| Component | Tier | Zag packages |
|---|---|---|
| Button | Custom | `@zag-js/core` (`createMachine`); runtime through `line-core` (`@zag-js/vanilla`) |
| IconButton | Custom | Same machine as Button (ARCHITECTURE §13.1) |
| AvatarGroup | Custom | `@zag-js/core`; overflow popover open (§6 OQ5) |
| Presence | Pre-built | `@zag-js/presence` 1.46.0 |
| ButtonGroup, Alert, Chip, Badge, Avatar, Separator, Visually Hidden, Portal, Icon, Kbd / Shortcut, Skeleton, Stack, Grid, Center, Aspect Ratio, Spinner | Static | None |

- Zag 1.46.0 has no machine for any of the 16 static components except Avatar (`@zag-js/avatar`).
- `@zag-js/dom-query` 1.46.0 exports `visuallyHiddenStyle`. It arrives transitively and is not a machine.
- Ark UI's `Portal` (React, `main` on 2026-10-19) uses React `createPortal` and `dom-query` helpers, and no machine.

### 2.2 Q2 — `@zag-js/presence` 1.46.0 API

Read from the published `dist` and the Zag docs page (both 2026-10-19).

| Item | Value |
|---|---|
| Exports | `machine`, `connect`, `props`, types `Api`, `Machine`, `Props`, `Service` |
| Schema type | Not exported; a maintainer recommends `type S = typeof machine extends Machine<infer S> ? S : never` (zag#3068, 2026-04-10) |
| Props | `present`, `onExitComplete`, `onEnterComplete` (docs say "only available from v1.43.2"), `immediate` |
| States | `unmounted`, `unmountSuspended`, `mounted`; `initialState` is `mounted` when `present` is truthy |
| Root events | `NODE.SET` (action `setupNode`), `PRESENCE.CHANGED` (actions `setInitial`, `syncPresence`) |
| State events | `MOUNT`, `UNMOUNT`, `UNMOUNT.SUSPEND` |
| Watch | `track([() => prop("present")], () => send({ type: "PRESENCE.CHANGED" }))` |
| Refs | `node`, `styles` (computed style of the node) |
| `connect` result | `skip` (true until the first presence change), `present` (`mounted` or `unmountSuspended`), `setNode(node)`, `unmount()` |
| Exit signal | `onExitComplete()` plus a non-bubbling `exitcomplete` `CustomEvent` dispatched on the node |

- Exit logic. When `present` turns false and the document is hidden, the machine sends `UNMOUNT` at once.
  Otherwise it waits one animation frame and reads `animationName` from the node's computed style. It unmounts
  directly when the name is `none`, equals the previous name, `display` is `none`, the duration is `0s`, or
  `getAnimations()` shows no running animation. Otherwise it enters `unmountSuspended` and waits for `animationend`
  or `animationcancel` on the node.
- The docs state "The presence machine requires using **CSS animations** to animate the component's exit". CSS
  transitions do not count.
- `trackExitAnimation` sets `animation-fill-mode: forwards` on the node and restores it on cleanup.
- Event targets resolve through `composedPath()[0]` (`dom-query` `getEventTarget`), and the listeners sit on the node
  itself, so a node inside a shadow root works for target matching.
- `immediate` appears in `props` and in the docs ("skip deferring present-state changes to the next frame"), but the
  1.46.0 machine never reads it (`grep -c immediate presence.machine.mjs` → 0). It dates from 0.56.0.
- `connect` uses no anatomy and no `normalize` call. The component supplies the element, `hidden` and `data-state`.
- Ark UI's `Presence` (React 5.39.3, which depends on `@zag-js/presence` 1.45.0) adds `lazyMount`, `unmountOnExit`,
  `hideMode` and `skipAnimationOnMount` on top of the machine. It renders `data-state="open|closed"` and
  `hidden={!api.present}`. Those options live in the adapter, not in Zag.

### 2.3 Q3 — Presence through `LineMachineController`

**Controller facts** (`packages/line-core/src/machine/line-machine-controller.ts`):

- The constructor takes `(host, { machine, props?, staticFallbackOnFailure? })`.
- `hostConnected` builds a new `VanillaMachine`, subscribes `host.requestUpdate()` and calls `start()`.
- `hostDisconnected` unsubscribes and calls `stop()`.
- The getters are `state`, `context`, `refs`, `service` and `fallback`, and `send` forwards events.
- No method forwards `updateProps`, and the `VanillaMachine` instance stays private.

**`VanillaMachine` 1.46.0 facts** (`dist/machine.mjs`):

- `userProps` may be an object or a function. `prop(key)` re-evaluates it on every read.
- `machine.watch` runs once in `start()`. Its trackers re-run only inside `publish()`, which fires on a context or
  state change or on `updateProps`.
- `updateProps(next)` replaces the props source with a closure that merges the previous source and `next`, then
  calls `notify()`. Keys whose value is `undefined` are skipped.
- The `service` object has no `updateProps`.
- `stop()` clears subscriptions and cleanups, so a stopped instance does not restart. The controller already builds
  a fresh instance on each connect.
- `computed(key)` calls `machine.computed[key]` on every access without a cache.

**Probe results** (§3 holds the commands):

| Probe | Setup | Observed |
|---|---|---|
| P1 | Throwaway `LineElement` with `props: () => ({ present: this.present })` | Without `present` it starts `unmounted`. With `present` it starts `mounted`, `api.skip` is `true` |
| P2 | Same element, then `el.present = true` | After the Lit update and four frames the state stays `unmounted`, while `service.prop('present')` already reads `true` |
| P3 | Bare `VanillaMachine` with a connected node and `updateProps` | `{present: true}` gives `mounted`. `{present: false}` gives `unmounted` and one `onExitComplete`. `{present: undefined}` leaves the prop at `false` |
| P4 | 4,000 `updateProps` calls on one instance | 100 calls 1.4 ms; next 900 calls 53.4 ms; next 1,000 calls 154.7 ms; next 2,000 calls 645.1 ms. One `prop()` read grew from 0.013 ms to 0.397 ms |

- P2 shows the gap. `prop()` sees the new value, but no tracker re-runs, so `PRESENCE.CHANGED` never fires.
- P4 shows quadratic growth. Each call nests one more merge closure, and `notify()` re-reads the tracked prop through
  the whole chain. A first P4 run with 10,010 calls hit the 5,000 ms test timeout after about 31 s. The `v2` branch
  keeps the same `updateProps` body.
- The controller starts the machine before the first render. Presence still works because `setNode` sends the root
  event `NODE.SET` later, from `firstUpdated`.
- happy-dom runs no CSS animations, so the `unmountSuspended` path and `animationend` handling stay unverified. They
  need the Playwright tier.
- Zag's adapter guide (retrieved 2026-10-19) lists "User props update reactively" and "Controlled and uncontrolled
  values stay in sync" as checks every adapter should pass. It also says "Declare Zag and your framework as peer
  dependencies". `line-core` declares them as `dependencies`.
- Zag maintainers closed the community `@zag-js/lit` PR (zag#2698) on 2026-10-02 and wrote "we've decided not to add
  any more framework adapters to the core repo". `packages/frameworks` on `main` (2026-10-19) holds `preact`,
  `react`, `solid`, `svelte`, `vanilla` and `vue`. That PR's controller started the machine in `hostUpdated`, after
  the first render.

**Size data** (`bun build --minify --external lit`, then `gzip -9`, 2026-10-19). R9 owns the budget question.

| Entry | Raw | Gzipped |
|---|---|---|
| `line-core/machine` surface | 19,164 B | 7,077 B |
| plus `@zag-js/presence` | 25,203 B | 8,873 B |
| plus `@zag-js/toggle` | 21,563 B | 8,007 B |
| plus `@zag-js/avatar` | 23,898 B | 8,705 B |
| plus `@zag-js/popover` | 92,299 B | 31,108 B |

The entries re-export each package namespace, so these figures are upper bounds for one component.

### 2.4 Q4 — Custom machines

**What `createMachine` requires** (`@zag-js/core` 1.46.0 `dist/types.d.ts`, `create-machine.mjs`):

- `createMachine(config)` runs `ensureStateIndex(config)` and returns the config unchanged.
- `Machine<T>` requires `initialState: ({ prop }) => T["state"]` and `states`. Everything else is optional.
- The optional keys are `props`, `context` (each value a `bindable`), `computed`, `refs`, `watch`, `on`, `entry`,
  `exit`, `effects`, `implementations` (`guards`, `actions`, `effects`) and `debug`.
- Schema keys are `state`, `props`, `context`, `refs`, `computed`, `event`, `action`, `guard`, `effect` and `tag`.
- Nested states use `initial` and dot targets (`open.idle`). `setup<T>()` returns `guards.and/or/not`, `choose` and
  a typed `createMachine`.
- A missing action, guard or effect implementation logs `[zag-js] No implementation found …` at runtime and does not
  throw.
- `bindable` reads `value` from props on every `get()`, so a controlled value read through a props function stays
  live. `onChange` fires only when the new value differs.
- Zag's "Building Machines" guide says effects must return a cleanup function or `undefined`.

**How other libraries treat the three components** (retrieved 2026-10-19):

| Library | Button | AvatarGroup | Related machine or component |
|---|---|---|---|
| Zag 1.46.0 | No machine | No machine | `toggle`, `avatar`, `popover` machines |
| Ark UI 5.39.3 (React) | No component | No component | `Toggle`, `Avatar`, `Presence`, `Portal` components |
| Chakra UI 3.37.0 | `loading` prop sets `disabled` and `data-loading`, no machine | `Group` with `spaceX="-3"`, no machine | Built on Ark |
| MUI v9 | — | `max` (default 5), `total`, `spacing`, `renderSurplus`, no hover or popover | — |
| React Aria | `data-pressed` while pressed, `aria-pressed` for toggles, `isPending` | — | `usePress` |

- Zag's `toggle` machine keeps `pressed` in a `bindable` context, takes `disabled` as a prop and has one state,
  `idle`. `connect` renders `type="button"`, `aria-pressed`, `data-state="on|off"` and `data-pressed`.
- Zag's `avatar` machine has states `loading`, `loaded` and `error`, effects `trackImageRemoval` and
  `trackSrcChange`, and parts `root`, `image` and `fallback`.
- React Aria documents that "Pending buttons remain focusable, but are otherwise disabled" and that "Pending state
  changes are announced to assistive technologies".

**State each component needs:**

| Component | ARCHITECTURE source | States named | Inputs from the host | Evidence gaps |
|---|---|---|---|---|
| Button | §13.1 | `idle`, `pressed`, `loading`, `disabled` | `disabled`, `loading`, `type` (`submit`, `reset`, `button`), form owner | `disabled` and `loading` arrive as host props, so states driven by them need the prop path P2 lacks |
| IconButton | §13.1 | Same machine as Button | Adds a required accessible name | None beyond Button |
| AvatarGroup | §13.2 | `collapsed`, `expanded`, `overflow_open` | `max`, `size`, `spacing` | The popover needs positioning, dismissal and focus return; Zag puts those in `@zag-js/popover` |

- Probe B1 ran a throwaway Button-like machine with a guard `isInteractive` that reads `prop('disabled')`. The guard
  saw the live host value through a props function, so `POINTER_DOWN` moved `idle` → `pressed` and was blocked
  after `disabled = true`. Guards and actions read props at event time. Only `watch` trackers miss changes.
- §13.1 uses "pressed" twice. The states list names `pressed` next to `idle`, and the ToggleButton bullet says
  "Button with `pressed` state". React Aria separates the active press (`data-pressed`) from the toggle state
  (`aria-pressed`).
- The AvatarGroup popover maps to Zag's `popover` machine, but PRD §4 line 281 lists Popover as Pre-built, and PRD
  §7.5 places it in Phase 3. ARCHITECTURE §13.7 already coordinates several machines inside one custom machine
  (Menubar over N `@zag-js/menu` instances).
- Zag's composition guide shares `ids` between machines and passes `getRootNode` for shadow DOM ("the root node can
  be derived from calling `element.getRootNode()`").

### 2.5 Q5 — ARCHITECTURE §8 and §13 against Zag 1.46.0

Section 5 states each mismatch with its line. The supporting facts:

- Probe A1 copied the §8 Input example with a matching schema. `tsc` 5.9.3 reports `TS2345 … Property 'initialState'
  is missing … but required in type 'Machine<InputSchema>'`. Mounted through the controller, it throws
  `TypeError: machine.initialState is not a function` and renders the static fallback.
- The example names actions `validate` and `setValue` without `implementations`, so they would only log warnings.
- The Zag guide says computed values are "memoized per framework (React `useMemo`, Solid `createMemo`, etc.)".
  `VanillaMachine` has no memo (§2.3).
- `@zag-js/vanilla` 1.46.0 `index` exports `mergeProps`, `normalizeProps`, `toStyleString`, `spreadProps`,
  `VanillaMachine` and the type `Attrs`. Since 1.44.0 `normalizeProps` returns `style` as an object, and
  `toStyleString` gives the string form. `line-core` re-exports `mergeProps`, `normalizeProps`, `spreadProps`,
  `VanillaMachine` and `Attrs`, and leaves out `toStyleString`.
- `@zag-js/editable` 1.46.0 declares `state: "edit" | "preview"`.
- `@zag-js/password-input` exists since 2025-05-26 and `@zag-js/date-input` since 2026-03-02, both at 1.46.0.

## 3. Probes

Run on 2026-10-19 in throwaway directories. The probe copy came from `git archive HEAD` of this worktree plus
`git init`, with `HOME=<tmpdir>` for every `bun` command. Both directories were deleted afterwards.

| # | Command | Exit | Output summary |
|---|---|---|---|
| 1 | `npm view @zag-js/{core,vanilla,presence,avatar,popover,toggle,types,utils,dom-query,store,anatomy} version dist-tags --json` | 0 | All `latest` 1.46.0; `next` 2.0.0-next.3 |
| 2 | `npm view @zag-js/core time --json`, same for `presence` | 0 | 1.46.0 at 2026-10-11T18:40Z / 18:41Z; nothing later |
| 3 | `npm pack @zag-js/{presence,vanilla,core,avatar,toggle,popover,editable}@1.46.0` and `tar -xzf` | 0 | `dist` sources read for §2.2–§2.5 |
| 4 | `git archive HEAD \| tar -x`, `git init -q`, `bun install --frozen-lockfile` | 0 | 704 packages installed |
| 5 | `bun add -d @zag-js/presence@1.46.0` in `packages/line-core` | 0 | 1 package installed |
| 6 | `bun test packages/line-core/__tests__/probe-r7.test.ts` (first run, P4 with 10,010 calls) | 1 | 5 pass; P4 timed out at 5,000 ms after about 31 s |
| 7 | Same, P4 reduced to 4,000 calls with a 60 s timeout | 0 | 6 pass, 15 `expect()` calls; P1–P4, A1, B1 as in §2.3–§2.5 |
| 8 | `tsc -p tsconfig.probe.json` with `types: ["bun"]` | 2 | TS2688, no `bun` type package in the repo; config dropped |
| 9 | `tsc -p tsconfig.probe.json` on the §8 example alone | 2 | TS2345, `initialState` missing (tsc 5.9.3) |
| 10 | `bun build probe-{a,b}.ts --minify --external lit` and `gzip -9c` | 0 | 7,077 B and 8,873 B gzipped |
| 11 | `bun add -d @zag-js/{popover,avatar,toggle}@1.46.0`, then the same build per package | 0 | 31,108 B, 8,705 B, 8,007 B gzipped |
| 12 | `rm -rf` both temp directories | 0 | Deleted |

## 4. Fit with line://ui

- **Principle 2 (state machines).** Button, IconButton and AvatarGroup need custom `createMachine` configs because
  Zag ships no machine for them. Presence is the only pre-built machine in Phase 1.
- **Law 9 (graceful failure).** Probe A1 confirms the controller turns a malformed config into a static fallback
  without throwing at the consumer.
- **Law 5 (machines own logic, Lit owns DOM).** Presence needs a DOM node through `setNode` and reads its computed
  style, so the component must hand the machine an element after render.
- **Law 6 (bundle isolation) and Law 4 (no component imports).** An AvatarGroup that embeds `@zag-js/popover` adds up
  to about 24 KB gzipped over the machine surface (§2.3), and it would use a machine rather than a Popover
  component.
- **ARCHITECTURE §6.** Zag's refusal of new adapters (zag#2698) confirms that `LineMachineController` stays a
  first-party adapter. The prop path that Zag's adapter guide asks for is missing (P2).
- **ARCHITECTURE §12.** Presence (`./presence`) and AvatarGroup (`./avatar-group`) have their own entrypoints in plan
  §2.2. Their Zag packages would load only through those entrypoints.
- **PRD §7.3 exit criteria.** Presence exit animations cannot be evidenced in happy-dom. The Playwright tier (plan P7)
  is the place where the 8-point checklist can cover them.

## 5. Contradictions

| # | Statement | Location | Current fact |
|---|---|---|---|
| C1 | §8 "Custom machine example — Input" calls `createMachine<InputSchema>({ props, context, computed, states })` | `docs/ARCHITECTURE.md:315-344` | `initialState` is required by `Machine<T>` in `@zag-js/core` 1.46.0; probe A1 fails `tsc` (TS2345) and falls back at runtime |
| C2 | "computed states (memoized, consistent)" | `docs/ARCHITECTURE.md:305` | `VanillaMachine` 1.46.0 recomputes on every `computed(key)` call; Zag memoizes only in framework adapters |
| C3 | "controlled/uncontrolled for free via `bindable` … watch for reactive side effects" | `docs/ARCHITECTURE.md:305` | Through `LineMachineController`, host prop changes never re-run `watch` trackers (P2). Controlled reads work only when `props` is a function |
| C4 | "`#ctrl = new LineMachineController(this, machineConfig)`" | `docs/ARCHITECTURE.md:307` | The code takes `(host, { machine, props?, staticFallbackOnFailure? })` (`line-machine-controller.ts:39`) |
| C5 | "Components declare their tier by what they assign to the `machine` property … The base class handles all three cases" | `docs/ARCHITECTURE.md:254` | `LineElement` has no `machine` property; each component composes its own controller (`line-element.ts`, controller tests) |
| C6 | "Re-exports the four public primitives of `@zag-js/vanilla` — `normalizeProps`, `spreadProps`, `mergeProps`, and the `VanillaMachine` type" | `docs/ARCHITECTURE.md:261` | Vanilla 1.46.0 exports five values (adds `toStyleString`, 1.44.0) and the type `Attrs`; `line-core` re-exports `VanillaMachine` as a value |
| C7 | Editable "Machine: idle → editing → idle" | `docs/ARCHITECTURE.md:511` | `@zag-js/editable` 1.46.0 states are `preview` and `edit` (Phase 2) |
| C8 | Custom tier is for components "where no pre-built machine exists" | `docs/ARCHITECTURE.md:300`, `docs/PRD.md:258`, `docs/PRD.md:260` | PasswordInput and DateInput are Custom, but `@zag-js/password-input` and `@zag-js/date-input` exist at 1.46.0 (Phase 2) |

C4 and C5 compare ARCHITECTURE with the repo code rather than with Zag. C7 and C8 concern Phase 2 rows.

## 6. Open questions for the spec

| # | Question | Options | Evidence that decides |
|---|---|---|---|
| OQ1 | How do host prop changes reach a machine? | (a) The controller exposes `updateProps`. (b) The controller calls `updateProps` from `hostUpdate` with a props function. (c) Components send events from `updated()` and machines avoid prop `watch` | P2 and P4; an upstream fix for the closure chain or a measured update rate per component; a `line-core` change needs its own row |
| OQ2 | Which node does Presence track? | (a) The host element. (b) An internal part. (c) The first slotted child | A Playwright probe of `::part()` and host-attribute animation selectors in Chromium, Firefox and WebKit |
| OQ3 | What does "unmount" mean for a custom element? | (a) `hidden` on the tracked node. (b) Removing or restoring slotted content. (c) Ark-style `lazyMount` and `unmountOnExit` options | Plan §5.5 `agentExposed` decision for Presence; R8 accessibility-tree findings |
| OQ4 | What does Button's `pressed` mean, and are `loading` and `disabled` states or props? | (a) Active press only. (b) Toggle `aria-pressed`. (c) Both, as React Aria splits them. Then finite states as §13.1 lists, or the Zag `toggle` pattern (props plus context) | R8's APG button findings; the OQ1 outcome, because prop-driven states need it |
| OQ5 | How does AvatarGroup open its overflow popover? | (a) Hand-written popover logic in the custom machine. (b) The custom machine plus a second controller on `@zag-js/popover`. (c) The native `popover` attribute | R9 size budget against the ~24 KB measurement; R8 keyboard and touch equivalents of "hover expands"; Phase 3 Popover order |
| OQ6 | Does Avatar stay Static while `@zag-js/avatar` models image loading? | (a) Static with native `<img>` events. (b) Pre-built `@zag-js/avatar` | The plan and PRD tier; R9 size; fallback behaviour without JavaScript |
| OQ7 | When does the controller start a machine? | (a) `hostConnected`, as now. (b) After the first render, as zag#2698 did | A probe with a machine whose entry effect queries the shadow root |
| OQ8 | Which Zag major does Phase 1 pin? | (a) 1.x (`^1.46.0`). (b) 2.x once it leaves `next` | A 2.0.0 stable release and its migration notes |

## 7. Sources

All retrieved 2026-10-19.

- npm registry, `@zag-js/*` metadata: https://www.npmjs.com/package/@zag-js/presence, https://www.npmjs.com/package/@zag-js/core, https://www.npmjs.com/package/@zag-js/vanilla
- Zag presence machine source: https://github.com/chakra-ui/zag/tree/main/packages/machines/presence
- Zag vanilla adapter source: https://github.com/chakra-ui/zag/tree/main/packages/frameworks/vanilla
- Zag vanilla changelog (1.44.0 `toStyleString`): https://github.com/chakra-ui/zag/blob/main/packages/frameworks/vanilla/CHANGELOG.md
- Zag `v2` branch changesets: https://github.com/chakra-ui/zag/tree/v2/.changeset
- Zag docs, Presence: https://zagjs.com/components/react/presence
- Zag docs, Building Machines: https://zagjs.com/guides/building-machines
- Zag docs, Building a Framework Adapter: https://zagjs.com/guides/framework-adapters
- Zag docs, Composition: https://zagjs.com/guides/composition
- Zag discussion "Official Lit wrapper support?": https://github.com/chakra-ui/zag/discussions/2681
- Zag PR "feat: create @zag-js/lit (WIP)", closed 2026-10-02: https://github.com/chakra-ui/zag/pull/2698
- Zag issue "Please export machine schemas", closed 2026-04-10: https://github.com/chakra-ui/zag/issues/3068
- Zag PR "feat(vanilla): updateProps and fix composition", merged 2026-01-13: https://github.com/chakra-ui/zag/pull/2917
- Ark UI React components and Presence: https://github.com/chakra-ui/ark/tree/main/packages/react/src/components
- Chakra UI AvatarGroup source: https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/components/avatar/avatar.tsx
- MUI AvatarGroup API: https://mui.com/material-ui/api/avatar-group/
- React Aria Button: https://react-aria.adobe.com/Button
