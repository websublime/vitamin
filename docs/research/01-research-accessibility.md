# Research: Accessibility of the Phase 1 components

**Row:** `00-Z37` (Phase 1 plan §5.2 R8)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.2, §2.6, §4.2 (P7), §5.2 (R8), §5.5, §6, §7.1;
`docs/PRD.md` §1.3 (line 59), §1.6–§1.7 (lines 135, 145), §4 Phase 1 table (lines 231–251), §5.1 (line 452),
§5.2 (lines 499–518); `docs/ARCHITECTURE.md` §6, §7, §8, §9, §13.1, §13.2, §13.5, §14.8, §14.9, §15, §17.2,
§17.3, §17.4, §17.9; `docs/MANIFESTO.md` Principle 2, Laws 3 and 7, Out of Scope; `docs/specs/COMPONENT-SPEC-TEMPLATE.md`
(Keyboard, Accessibility, Tests rows); `packages/line-core/src/line-element.ts`;
`packages/line-core/src/mixins/form-associated.ts`; `apps/storybook/.storybook/main.ts` and `preview.ts`;
`playwright.config.ts`; `.github/workflows/checks.yml`; `bun.lock`; `docs/research/00-research-generative-ui.md` §4
(C5 row), §5 (renderer accessibility).
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
> - Only Button and IconButton (APG Button), Alert (APG Alert) and the AvatarGroup overflow control (APG Disclosure) map to an APG pattern. ButtonGroup maps to the ARIA `group` role, or to APG Toolbar if it gets arrow-key navigation. The other 15 components have no APG pattern and rely on ARIA role rules (`separator`, `img`, `status`, `progressbar`) or on no role at all.
> - Cross-root ID references still fail in Firefox 158 and Safari 27 without a flag. Reference target shipped unflagged only in Chrome 152 (stable 2026-08-25). `ElementInternals` ARIA (`role`, `aria*`, `aria*Elements`) works in all three engines, but Safari lacks `ElementInternals.ariaDescription`.
> - axe-core 4.14.0 checks open shadow roots in all three browsers. It skips closed roots. Its naming rules ignore roles set only through `ElementInternals`, even when the internals are exposed through the community WeakMap protocol, and it reports a false `label` violation when reference target supplies the label.
> - The repo's Storybook addon resolves axe-core 4.11.4, which flags `aria-prohibited-attr` on a host that carries `aria-label` (the C5 pattern); 4.14.0 does not. The addon has no CI path in the repo today. A CI path needs the Vitest addon (+53 packages, about 40 MB, Chromium by default). `@axe-core/playwright` 4.14.0 adds about 3.5 MB and runs inside the existing three-browser Playwright step.
> - `FormAssociated` keeps `#internals` private, and a second `attachInternals()` throws `NotSupportedError` in all three engines. Only Button is form-associated in Phase 1, so 19 components have no `ElementInternals` at all today, and `LineElement.reflectState` is a no-op for them.

## 1. Question

Plan §5.2 R8: "WAI-ARIA patterns for the 20 components; the axe-core tier (Playwright vs Storybook); the §17.9
question on exposing `FormAssociated` internals for `ElementInternals` ARIA".

- **Q1** For each of the 20 Phase 1 components, which APG pattern applies (or none), and which role, states,
  properties and keys follow from it? What is the current WAI-ARIA status?
- **Q2** Which shadow DOM accessibility facts do the components rely on? Cross-root ARIA references and the
  reference target status, `ElementInternals` ARIA reflection, `delegatesFocus`.
- **Q3** How do the two axe tiers compare? `@axe-core/playwright` against `@storybook/addon-a11y` on Storybook 10:
  versions, shadow-root coverage, CI cost. This feeds plan task P7.
- **Q4** ARCHITECTURE §17.9: should `line-core` expose the `FormAssociated` internals for `ElementInternals` ARIA?
  Which options exist and what evidence bears on them?
- **Q5** Which findings contradict ARCHITECTURE or the PRD accessibility statements?

## 2. Findings

### 2.1 Specification status (retrieved 2026-10-19)

| Document | Status | Source |
|---|---|---|
| WAI-ARIA 1.2 | W3C Recommendation, 6 June 2023 | [TR/wai-aria-1.2](https://www.w3.org/TR/wai-aria-1.2/) |
| WAI-ARIA 1.3 | Working Draft, 4 June 2026 (FPWD 23 January 2024); Editor's Draft 12 October 2026 | [publication history](https://www.w3.org/standards/history/wai-aria-1.3/), [ED](https://w3c.github.io/aria/) |
| APG | 30 patterns on the index; pattern pages link roles to the 1.3 Editor's Draft | [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) |
| HTML-AAM | Editor's Draft, 29 July 2026 | [html-aam](https://w3c.github.io/html-aam/) |
| WCAG 2.2 | W3C Recommendation, latest edition 12 December 2024 | [WCAG22 history](https://www.w3.org/standards/history/WCAG22/) |
| EN 301 549 | V4.1.1 published September 2026, references WCAG 2.2; the legal EAA/WAD reference stays V3.2.1 (WCAG 2.1 AA) until cited in the Official Journal | [AccessibleEU, 2026-09-07](https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en) |

ARIA 1.2 to 1.3 differences that touch Phase 1:

- `aria-description` exists only in 1.3. ARIA 1.2 has no such attribute.
- 1.3 renames `img` to `image` and keeps `img` as a synonym. axe-core 4.13.0 treats `role=image` as `img`
  ([changelog](https://github.com/dequelabs/axe-core/blob/develop/CHANGELOG.md)).
- `generic` prohibits `aria-label` and `aria-labelledby` in both versions ("Name From: prohibited").
- An autonomous custom element without a `role` attribute maps to `generic` (HTML-AAM §3.5.12).

### 2.2 APG pattern per component (Q1)

The role facts come from the ARIA 1.2 role tables and match the 1.3 ED, except where noted. "Name required" means
ARIA "Accessible Name Required: True".

| Component | APG pattern | Role and where it sits | Required states and properties | Keyboard |
|---|---|---|---|---|
| Button | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `button`; name required, from contents or author | `aria-disabled` when unavailable; `aria-pressed` for a toggle; `aria-haspopup` for a menu button; `aria-describedby` for a description | `Enter` and `Space` activate; focus after activation depends on the action |
| IconButton | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `button`; no visible text, so the name comes from `aria-label` or `aria-labelledby` | As Button | As Button |
| ButtonGroup | None for a plain group; [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) if it gains arrow-key navigation | `group` (name from author, optional); or `toolbar` (label required by APG, `aria-orientation` when vertical) | `group`: none. `toolbar`: `aria-label`/`aria-labelledby`, `aria-orientation` | `group`: each button is its own Tab stop. `toolbar`: one Tab stop, arrows move focus, `Home`/`End` optional; APG: "Use toolbar as a grouping element only if the group contains 3 or more controls" |
| Alert | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) | `alert`; implicit `aria-live=assertive`, `aria-atomic=true` | None | "Not applicable"; alerts must not move focus |
| Chip | None | Static chip: no role (text). Remove control: `button` with a name. A selectable chip is a toggle button (`aria-pressed`) | Remove button name, for example "Remove <label>" | Remove button: `Enter`/`Space` (APG Button) |
| Badge | None | No role; text content. A dot badge has no text and needs a text alternative or `aria-hidden` | None | None |
| Avatar | None | Image: `img` (1.3 `image`), name required, or `none` when decorative. Initials fallback needs the same name | Name (`alt` on an inner `<img>`, or `aria-label` with `role=img`) | None |
| AvatarGroup | None for the group; [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) for the overflow control | Group: `group` or `list`/`listitem`. Overflow "+N": `button` | Overflow button: `aria-expanded` (true when shown); `aria-controls` optional | Overflow button: `Enter`/`Space` toggle. APG has no non-modal popover pattern |
| Separator | None for a static separator; [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) only for a focusable one | `separator` (`<hr>` maps to it); Children Presentational; name optional; decorative use maps to `none` | `aria-orientation` (default `horizontal`); `aria-valuenow` only if focusable | None (static) |
| Visually Hidden | None | No role; content stays in the accessibility tree | None | None |
| Portal | None | No role; it moves nodes, so reading order and focus order follow the new DOM position (WCAG 1.3.2, 2.4.3) | None | None |
| Icon | None | Decorative: `aria-hidden="true"`. Meaningful: `img` with a name | Name when meaningful | None |
| Kbd / Shortcut | None | `<kbd>` has "No corresponding role" (HTML-AAM §3.5.82). The control that owns a shortcut can state it with `aria-keyshortcuts` | None | None |
| Skeleton | None | No role for placeholders; the region being loaded can carry `aria-busy="true"` | `aria-busy` on the loading container (ARIA: AT "MAY ignore changes" until it is false) | None |
| Presence | None | No role; Zag `@zag-js/presence` 1.46.0 emits no `aria-*` or `role` (probe P6) | None | None |
| Stack | None | No role (`generic`) | None | None |
| Grid | None | No role. The ARIA `grid` role and the APG [Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) pattern describe an interactive widget with arrow-key navigation, including "Layout Grids for Grouping Widgets". A CSS grid wrapper is neither | None | None |
| Center | None | No role | None | None |
| Aspect Ratio | None | No role | None | None |
| Spinner | None | Three candidates. `status` (polite live region, name from author). `progressbar` (name required; omit `aria-valuenow` when indeterminate). `img` (name required, no live update) | Name for `progressbar`/`img`; `aria-busy` on the region it reports on | None |

Notes on the table:

- APG Alert says screen readers "do not inform users of alerts that are present on the page before page load
  completes" and warns against alerts that disappear automatically (WCAG 2.2.3).
- ARIA `status` says authors "SHOULD ensure an element with role status does not receive focus as a result of
  change in status".
- `@zag-js/avatar` 1.46.0 exists. Its `dist` carries no `aria-*` or `role` strings (probe P6). The PRD lists
  Avatar as Static, so this is information for R7, not a proposal.
- `Element.ariaNotify()` is in Chrome 141, Firefox 150 and Safari 27 (BCD 8.1.6). Safari 26 lacks it, so it is
  outside "latest 2 stable" (PRD line 144) on 2026-10-19.

### 2.3 Shadow DOM facts (Q2)

Browser data come from `@mdn/browser-compat-data` 8.1.6 (published 2026-10-15). BCD lists the current stable
releases on 2026-10-19 as Chrome 155, Firefox 158 and Safari 27.

| Feature | Chrome | Firefox | Safari | Notes |
|---|---|---|---|---|
| `attachShadow({ referenceTarget })`, `ShadowRoot.referenceTarget` | 152 | 144 behind `dom.shadowdom.referenceTarget.enabled` | 26 behind `referenceTarget` | BCD marks it experimental and non-standard-track |
| `<template shadowrootreferencetarget>` | 152 | 144 (flag) | 26 (flag) | Declarative form |
| `ElementInternals.role` | 103 | 119 | 16.4 | |
| `ElementInternals.ariaLabel` and the other string `aria*` | 81 | 119 | 16.4 | |
| `ElementInternals.ariaDescription` | 83 | 119 | not supported | Probe P1 confirms `false` in WebKit 27.2 |
| `ElementInternals.ariaLabelledByElements` / `ariaDescribedByElements` | 135 | 136 | 16.4 | Element reflection |
| `attachShadow({ delegatesFocus })` | 53 | 94 | 13.1 | `ShadowRoot.delegatesFocus` getter: Safari 15 |
| `ElementInternals.states` | 90 | 126 | 17.4 | |
| CSS `:state()` | 125 (90–124 used `:--foo`) | 126 | 17.4 | |
| `HTMLElement.attachInternals` | 77 | 93 | 16.4 | |

Reference target status:

- Chrome Platform Status lists an origin trial in 133–135 and a ship stage at milestone 152, owners at Microsoft
  ([chromestatus 5188237101891584](https://chromestatus.com/feature/5188237101891584), updated 2026-07-22). The
  Chrome 151 beta post (2026-07-03) announced it; BCD records 152. Chrome 152 reached stable on 2026-08-25
  ([chromiumdash](https://chromiumdash.appspot.com/schedule)).
- Firefox: standards position positive (mozilla/standards-positions#1035). Bug 1952585 "Implement reference
  target" is `NEW` with 18 dependencies, last changed 2026-10-09.
- WebKit: standards position issue WebKit/standards-positions#356 is open with no position label (updated
  2026-04-03). Chrome Platform Status records "No signal". Safari 26 ships it behind a flag.
- Specs: whatwg/dom PR #1353 and whatwg/html PR #10995 are both open and unmerged on 2026-10-19.
- On 2026-10-19, Chrome 152+ ships it, while Firefox and Safari keep it behind flags.

Cross-root reference behaviour (probe P1, P5):

- A `<label for>` or `aria-labelledby` in the document cannot reach an element inside a shadow root. The inner
  `<input>` gets an empty name in Chromium.
- An `aria-labelledby` inside a shadow root cannot reach a light-DOM id. The inner `<button>` gets an empty name.
- Reference target fixes the first case in Chromium 156 (`input.labels.length === 1`, name "Email"). Firefox 157
  and WebKit 27.2 in Playwright report `'referenceTarget' in ShadowRoot.prototype === false`.
- Element reflection fixes the second case in every engine. Setting `button.ariaLabelledByElements =
  [lightDomSpan]` from inside the shadow root gives the name "Outside label" in Chromium, and the property reads
  back in all three engines.

`ElementInternals` facts:

- HTML: `internals.role` and `internals.aria*` set default semantics "which will be used unless the page author
  overrides" them with attributes ([HTML §4.13.7.4](https://html.spec.whatwg.org/multipage/custom-elements.html)).
- HTML: `attachInternals()` throws `NotSupportedError` when "this's attached internals is non-null". Probe P1
  confirms the throw in Chromium 156, Firefox 157 and WebKit 27.2.
- Chromium exposes `internals.role = 'separator'` plus `ariaOrientation = 'vertical'` as a vertical separator,
  and `internals.role = 'button'` plus host `aria-label` as a named button (probe P1).

`delegatesFocus` facts (probe P1):

- `host.focus()` moves focus to the first focusable shadow element in all three engines.
- `document.activeElement` is the host, `shadowRoot.activeElement` is the inner `<button>`, and the host matches
  `:focus`.

Accessible name on a host whose role sits inside (ARCHITECTURE §17.2 C5, probe P1):

- Host `aria-label` alone leaves the inner `<button>` unnamed. Chromium exposes the host as `generic` named
  "Save" and the inner button with an empty name. axe reports `button-name` inside the shadow root.
- Copying the host label to the inner button names the button "Save". The host still exposes a named `generic`
  node in Chromium.

### 2.4 The axe-core tiers (Q3)

Versions on 2026-10-19 (npm):

| Package | Latest | Published | Relevant dependency |
|---|---|---|---|
| `axe-core` | 4.14.0 | 2026-10-05 | none |
| `@axe-core/playwright` | 4.14.0 | 2026-10-15 | `axe-core ~4.14.0`; peer `playwright-core >= 1.0.0` |
| `@storybook/addon-a11y` | 10.6.2 | 2026-10-12 | `axe-core ^4.2.0`; the repo lock resolves 4.11.4 (`node_modules/.bun/axe-core@4.11.4`) |
| `@storybook/addon-vitest` | 10.6.2 | 2026-10-12 | peers `vitest ^3‖^4‖^5`, `@vitest/browser-playwright ^4‖^5` |
| `vitest`, `@vitest/browser-playwright` | 5.0.5 | 2026-10-15 | |
| `@storybook/test-runner` | 0.26.0 | 2026-10-09 | Jest 30 + Playwright |
| `playwright` | 1.64.1 (repo locks 1.64.0) | 2026-10-14 | Bundles Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2 (probe P1) |

What axe-core changed in 2026:

- 4.12.0 (2026-06-01) partially supports the `ElementInternals` role in `aria-allowed-attr`,
  `aria-prohibited-attr` and `aria-required-parent/children`, and adds the `axe.externalAPIs({ elementInternals })`
  API.
- 4.13.0 (2026-08-05) adds "support ARIA element internals properties" across checks, rules and commons, and
  enables ElementInternals support by default. It also lets more elements be named under `aria-prohibited-attr`.
- 4.14.0 (2026-10-05) enables `label-content-name-mismatch` by default.
- In the page, axe finds internals through the WCCG protocol. It reads a global `globalThis._elementInternals`
  WeakMap, or a public `_internals`, `internals` or `internals_` property, or an `internals` or `privateInternals`
  symbol. Extensions pass the data through `axe.externalAPIs({ elementInternals })` instead
  ([external-apis.md](https://github.com/dequelabs/axe-core/blob/develop/doc/external-apis.md)).
- The axe [element-internals.md](https://github.com/dequelabs/axe-core/blob/v4.14.0/doc/element-internals.md) at
  v4.14.0 still says only `role` is supported; the 4.13.0 changelog says more. The protocol itself is a Draft, last updated
  2026-04-24 ([community-protocols](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/element-internals-declaration.md)).

What each axe version reported on the same fixtures. P1 and P5 ran in Chromium, Firefox and WebKit with identical
axe results; P2 ran in Chromium.

| Fixture | axe 4.14.0 | axe 4.11.4 | Chromium accessibility tree |
|---|---|---|---|
| Inner `<img>` without `alt` in an open shadow root | `image-alt` | `image-alt` | Not read |
| Same in a closed shadow root | nothing | nothing | Not read |
| Host `aria-label`, unnamed inner `<button>` | `button-name` | `aria-prohibited-attr` + `button-name` | Named generic host, unnamed button |
| Host label copied to the inner button | nothing | `aria-prohibited-attr` (incomplete) | Named button |
| Host `role` via private internals, host `aria-label` | nothing | `aria-prohibited-attr` (false positive) | Named button |
| Host `role=button` or `img` via internals, no name (private, WeakMap or `_internals`) | nothing | nothing | Not read; no name source exists in the fixture |
| Same with `role` attributes instead | `aria-command-name`, `role-img-alt` | same | Not read |
| `<label for>` to a host using reference target | `label` (false positive) | `label` | Named "Email" |
| Inner `<button>.ariaLabelledByElements` to light DOM | nothing | not run | Named "Outside label" |

The naming rules explain the gap. `aria-command-name` selects `[role="link"], [role="button"], [role="menuitem"]`
and `role-img-alt` selects `:is([role='img'], [role='image'])` in 4.14.0 (`lib/rules/*.json`). Both read the
`role` attribute, so an internals-only role escapes them.

Tier comparison:

| Topic | Playwright + `@axe-core/playwright` | Storybook `addon-a11y` |
|---|---|---|
| Engine | axe-core pinned `~4.14.0` by the package | Whatever the lock resolves (4.11.4 today) |
| Where it runs | Any page the e2e tier opens; the smoke tier already opens `storybook-static/iframe.html?id=…` | The preview iframe, per story, from the panel |
| CI path in this repo | `bun run e2e` already runs in `checks.yml` with all three browsers installed | None today. The Storybook docs say CI failures need the Vitest addon (or the test-runner) and `parameters.a11y.test: 'error'`; `preview.ts` sets no `a11y` parameter |
| Browsers | chromium, firefox, webkit (existing projects) | Vitest addon setup uses "Playwright's Chromium browser"; more `instances` are configurable |
| Open shadow roots | Checked (probe P1) | Same engine, same coverage |
| Closed shadow roots | Not checked | Not checked |
| Default rules | axe's default rule set unless `withTags` or `withRules` narrows it | WCAG 2.0/2.1 A and AA plus best practice; `region` rule disabled |
| Added dependencies | 2 packages, about 3.5 MB (probe P4) | `@storybook/addon-vitest`, `vitest`, `@vitest/browser-playwright`: +53 packages, about 40 MB over `storybook` + `playwright` (probe P4); test-runner instead adds Jest 30 |
| Run time | Median `analyze()` on the 12-fixture page: 194 ms (Chromium), 343 ms (Firefox), 302 ms (WebKit) on the developer Mac (probe P3) | Not measured |
| Developer feedback | Test report only | Panel with violations, passes, incomplete, highlighting |

### 2.5 Exposing `FormAssociated` internals (Q4)

Repo facts (read on 2026-10-19):

- `FormAssociated` stores `#internals` as a private field set by `this.attachInternals()` in the constructor
  (`packages/line-core/src/mixins/form-associated.ts:77–83`).
- `LineElement.reflectState` is an empty hook (`packages/line-core/src/line-element.ts:30–32`). Only
  `FormAssociated` overrides it, so a component without the mixin reflects neither `data-*` nor `:state()`.
  ARCHITECTURE §14.8 places the wiring "In LineElement or FormAssociated mixin".
- ARCHITECTURE §7 lists Button as the only form-associated Phase 1 component. IconButton is "same machine as
  Button" (§13.1) and is not on the §7 list.
- A component that calls `attachInternals()` itself and also uses `FormAssociated` throws `NotSupportedError`
  (probe P1).

Phase 1 components that could set default ARIA through internals, by the §2.2 table: Button and IconButton (if
the role sits on the host), ButtonGroup (`group`), Alert (`alert`), Separator (`separator`, `aria-orientation`),
Spinner (`status` or `progressbar`), Icon and Avatar (`img`), Skeleton (`aria-busy`).

| Option | What it changes | Evidence for | Evidence against |
|---|---|---|---|
| (a) Keep internals private; components set `role`/`aria-*` attributes on the host | Nothing in `line-core` | axe reads attributes, so naming rules fire (probe P2) | The component writes attributes the author also owns, and HTML gives the author's attribute precedence only when internals hold the default |
| (b) Protected accessor on `FormAssociated` | Form-associated components read `this.internals` | Smallest change | Covers Button only; 19 components still lack internals |
| (c) `LineElement` attaches internals for every component; `FormAssociated` reuses them | One `attachInternals()` per element in the base | Fixes the no-op `reflectState` for static components too; one owner, so no double attach | Every element gets internals; cost not measured |
| (d) A Lit `ReactiveController` owns internals (the WCCG protocol example) | Components opt in per class | Matches the protocol's own Lit example; registers in `globalThis._elementInternals` | Two opt-in paths (controller and mixin) must not both attach |
| Protocol registration (any of b–d) | `globalThis._elementInternals.set(this, internals)` | axe 4.12+ reads it for `aria-allowed-attr`, `aria-prohibited-attr`, parent/child rules | Naming rules still skip internals-only roles (probe P2); the protocol is a Draft and calls itself "a temporary stopgap"; it exposes form state on `globalThis` |

## 3. Probes

All probes ran on 2026-10-19 on macOS (darwin 25.6.0, arm64), in `mktemp -d` directories with `HOME` set to the
directory and `PLAYWRIGHT_BROWSERS_PATH` pointing at the existing Playwright cache. The directories were deleted
afterwards. Probe code is not committed.

| Id | Command | Exit | Observed |
|---|---|---|---|
| P0 | `npm pack @mdn/browser-compat-data` (8.1.6) and a Python query of `data.json` | 0 | The §2.3 table |
| P1 | `bun add playwright@1.64.0 @axe-core/playwright@4.14.0 axe-core-4114@npm:axe-core@4.11.4`, then `node probe.mjs` | 1, then 0 | First run failed with "Please use browser.newContext()" from `AxeBuilder.analyze`; fixed by creating the page from an explicit context. Second run: 12 fixtures × 3 browsers × 2 axe versions; results in §2.3 and §2.4 |
| P2 | `node probe2.mjs` (internals-only `button`/`img`, private vs WeakMap vs `_internals`, against attribute roles) | 0 | 4.14.0 and 4.11.4 both report `aria-command-name` and `role-img-alt` only for attribute roles |
| P3 | `node probe3.mjs` (20 × `AxeBuilder.analyze()` per browser) | 0 | Launch+load 219/1371/588 ms; median analyze 194/343/302 ms; max 258/497/396 ms (Chromium/Firefox/WebKit) |
| P4 | `bun add -d storybook@10.6.2 playwright@1.64.0`, then `+ vitest@5.0.5 @vitest/browser-playwright@5.0.5 @storybook/addon-vitest@10.6.2`, then `+ @axe-core/playwright@4.14.0` | 0 | Base 109,260 KB; Vitest route +40,816 KB and 65→99 top-level dirs (53 packages); axe route +3,468 KB (2 packages) |
| P5 | `node probe4.mjs` (inner button `ariaLabelledByElements` to a light-DOM span) | 0 | Property reads back in all engines; Chromium name "Outside label"; axe 4.14.0 reports nothing |
| P6 | `npm pack @zag-js/presence@1.46.0 @zag-js/avatar@1.46.0`, grep `dist/*.mjs` for `aria-` and `role` | 0 | No matches in either package |

## 4. Fit with line://ui

- **Law 3 (WCAG 2.1 AA, axe zero violations per spec).** Probes P1 and P2 show that zero axe violations do not
  prove a name exists when the role comes from `ElementInternals`, and do not hold under closed shadow roots.
  The spec-level A11y row (template line 216) would need a second check for those components, for example a
  browser accessibility-tree assertion.
- **Principle 2 and PRD line 145 (Zag provides WCAG for state-machine components).** In Phase 1 only Presence
  uses a pre-built Zag machine, and it emits no ARIA (P6). Button, IconButton and AvatarGroup use custom
  machines. Law 3 already requires static and custom-machine components to meet the bar on their own, so every
  Phase 1 role and name is line://ui's own work.
- **ARCHITECTURE §17.2 C5.** The host label must move to the element that carries the role (P1). C5 also names
  `aria-description`, which is an ARIA 1.3 draft attribute and has no `ElementInternals` support in Safari.
- **ARCHITECTURE §14.9 `delegatesFocus`.** The support figures (Chrome 53, Firefox 94, Safari 15) match BCD for
  the `ShadowRoot.delegatesFocus` getter; the `attachShadow` option itself is Safari 13.1. The behaviour holds in
  all three engines (P1).
- **ARCHITECTURE §17.3 and plan §2.1.** A2UI basic `List` maps to `<line-stack>`, which has no role. A list
  rendered this way loses `list`/`listitem` semantics unless the renderer or Stack adds them.
- **ARCHITECTURE §17.4 renderer accessibility.** The surface renders in light DOM, so its own live region and
  `aria-busy` are visible to axe. The per-component findings above still apply to what it renders.
- **Manifesto Out of Scope (localisation).** Strings such as "Remove", "Loading" and "Show more" (Chip remove,
  Spinner, AvatarGroup overflow) must come from the consumer through slots or attributes.
- **Manifesto Out of Scope (custom test runners) and PRD §2.** The Storybook CI route adds Vitest as a third test
  runner beside `bun test` and Playwright. The Playwright route adds none.
- **PRD browser target (latest 2 stable).** Reference target is in Chrome only; `ariaNotify` misses Safari 26.
  `ElementInternals` ARIA and element reflection are inside the target.
- **Plan P7 and §6.** The existing Playwright step already installs all three browsers and serves
  `storybook-static` on port 4320, which a Playwright axe tier can reuse.

## 5. Contradictions

1. **PRD §5.2, line 505.** The A11y row says `@storybook/addon-a11y` + axe-core test "ARIA compliance, keyboard
   nav". axe audits the rendered DOM against rules (Storybook docs, "Accessibility tests") and presses no keys.
   Keyboard navigation (checklist item 7, line 517) needs interaction tests.
2. **PRD §5.2, line 507.** The Interaction row names `@storybook/test`. npm `latest` for that package is 8.6.15;
   Storybook 10.6.2 exports the same API as `storybook/test`.
3. **ARCHITECTURE §13.1, line 479.** IconButton has "`aria-label` required (TypeScript enforced)". TypeScript
   checks property access in TypeScript code. It does not check HTML markup, and `<line-a2ui-surface>` creates
   elements by tag at run time (§17.4). The requirement cannot be enforced by types alone.
4. **PRD line 233 against ARCHITECTURE §13.1 line 480 and §8.** The PRD gives ButtonGroup "shared navigation".
   ARCHITECTURE makes it Static with `role="group"`, and §8 defines Static as "zero interaction state". Shared
   arrow-key navigation is the APG Toolbar pattern, which needs roving focus state.
5. **PRD line 237 against ARCHITECTURE §8.** Chip is Static, but its use cases include "filters, selections".
   A selectable chip carries a pressed or selected state and acts as a button, which a zero-interaction-state
   component does not have.
6. **ARCHITECTURE §9, line 369.** Field "sets `aria-labelledby` on child control". When the control's role sits on
   an inner native element (§15.1 for Input), an ID reference on the host does not reach it in Firefox or Safari
   (P1). The rule works only when the host carries the role, or through reference target (Chrome only) or element
   reflection. Field ships after Phase 1, but the rule is in ARCHITECTURE now.
7. **ARCHITECTURE §14.8, line 1114.** "`CustomStateSet` browser support: Chrome 90+". The `:state()` selector the
   section uses starts at Chrome 125; Chrome 90–124 supported only `:--foo` (BCD). Both are inside the
   latest-2 target today.

## 6. Open questions for the spec

1. **Role placement per interactive component (Button, IconButton, AvatarGroup overflow).** The options are an
   inner native `<button>` with name forwarding, or a host role through `ElementInternals`. Evidence: P1 and P2 (axe sees the
   inner button's name but not an internals-only role's name), form submission for Button (§7), and a screen
   reader pass on the named `generic` host that forwarding leaves behind.
2. **§17.9 internals ownership.** Options (a)–(d) in §2.5, with or without protocol registration. Evidence: the
   list of components that need internals (§2.5), a per-element cost measurement of `attachInternals()`, and
   whether static components must reflect `:state()` (§14.8).
3. **P7 tier.** Options: Playwright + `@axe-core/playwright` only; Storybook addon with the Vitest addon only;
   both (panel for authors, Playwright as the CI gate). Evidence: §2.4 table, the Manifesto test-runner clause,
   and a timed run over the real `storybook-static` once components exist.
4. **axe ruleset.** Options: WCAG 2.0/2.1 A and AA tags (PRD target), add WCAG 2.2 tags (EN 301 549 V4.1.1
   direction), add best practice. Evidence: §2.1, and whether the PRD target moves.
5. **Second check where axe is blind.** Options: assert the Chromium accessibility tree through CDP, use
   Playwright `ariaSnapshot` (its own computation, unverified against internals), or a manual screen-reader pass
   per spec. Evidence: P1 and P2 show the blind spots; a probe of `ariaSnapshot` on internals roles is still
   needed.
6. **ButtonGroup.** The options are `group` with independent Tab stops (Static), or `toolbar` with roving focus
   (machine). Evidence: Contradiction 4 and the APG "3 or more controls" note.
7. **Chip.** Options: display-only with a remove button, or a toggle button with `aria-pressed`, or defer
   selection chips to the Phase 2 selection components. Evidence: Contradiction 5.
8. **Alert role.** Options: always `alert`, a variant that switches to `status`, or no live role for static
   content. Evidence: APG note on alerts present at load, and the PRD's "persistent feedback" wording.
9. **Spinner role.** Options: `status`, indeterminate `progressbar`, `img`. Evidence: §2.2 rows and a
   screen-reader pass of each.
10. **AvatarGroup hover expansion.** The options are expansion on both hover and focus, or expansion only on
    activation. Evidence: WCAG 1.4.13 (content on hover or focus) applies if expansion reveals content.
11. **List semantics for A2UI `List`.** Options: a role attribute on `<line-stack>`, a list wrapper in the
    renderer, or no list semantics. Evidence: §17.3 mapping and an axe/AX-tree check of the rendered output.
12. **IconButton enforcement.** Options: a runtime dev warning, a descriptor-level "required names validated" check
    (§17.4), or axe only. Evidence: Contradiction 3 and P1 (`button-name` fires only on an inner native button).
13. **IconButton form association.** The options are adding IconButton to the §7 list, or keeping it
    `type="button"` only. Evidence: §13.1 "same machine as Button".

## 7. Sources

All retrieved 2026-10-19.

- WAI-ARIA 1.2 Recommendation: https://www.w3.org/TR/wai-aria-1.2/
- WAI-ARIA 1.3 publication history: https://www.w3.org/standards/history/wai-aria-1.3/
- WAI-ARIA 1.3 Editor's Draft: https://w3c.github.io/aria/
- APG patterns index: https://www.w3.org/WAI/ARIA/apg/patterns/
- APG Button: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- APG Alert: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
- APG Toolbar: https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
- APG Disclosure: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- APG Grid: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- APG Window Splitter: https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
- HTML-AAM: https://w3c.github.io/html-aam/
- HTML custom elements (`attachInternals`, accessibility semantics): https://html.spec.whatwg.org/multipage/custom-elements.html
- WCAG 2.2 history: https://www.w3.org/standards/history/WCAG22/
- EN 301 549 V4.1.1 news (AccessibleEU, 2026-09-07): https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en
- `@mdn/browser-compat-data` 8.1.6: https://www.npmjs.com/package/@mdn/browser-compat-data
- Chrome Platform Status, Reference Target: https://chromestatus.com/feature/5188237101891584
- Chrome 151 beta post: https://developer.chrome.com/blog/chrome-151-beta
- Chromium schedule API: https://chromiumdash.appspot.com/fetch_milestone_schedule?mstone=152
- Firefox bug 1952585: https://bugzilla.mozilla.org/show_bug.cgi?id=1952585
- Mozilla standards position #1035: https://github.com/mozilla/standards-positions/issues/1035
- WebKit standards position #356: https://github.com/WebKit/standards-positions/issues/356
- whatwg/dom PR #1353: https://github.com/whatwg/dom/pull/1353
- whatwg/html PR #10995: https://github.com/whatwg/html/pull/10995
- axe-core changelog: https://github.com/dequelabs/axe-core/blob/develop/CHANGELOG.md
- axe-core ElementInternals doc (v4.14.0): https://github.com/dequelabs/axe-core/blob/v4.14.0/doc/element-internals.md
- axe-core external APIs doc: https://github.com/dequelabs/axe-core/blob/develop/doc/external-apis.md
- axe-core rule selectors (v4.14.0): https://github.com/dequelabs/axe-core/tree/v4.14.0/lib/rules
- WCCG ElementInternals protocol: https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/element-internals-declaration.md
- Storybook accessibility tests (10.6): https://storybook.js.org/docs/writing-tests/accessibility-testing
- Storybook Vitest addon (10.6, web components): https://storybook.js.org/docs/writing-tests/integrations/vitest-addon?renderer=web-components
- npm registry (`axe-core`, `@axe-core/playwright`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, `@storybook/test`, `@storybook/test-runner`, `vitest`, `playwright`, `@zag-js/*`): https://registry.npmjs.org/
