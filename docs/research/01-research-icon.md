# Research: Icon — A2UI basic icon names, Lucide and Phosphor mapping, `line-icons` Phase 1 subpaths

**Row:** `00-Z44` (Phase 1 plan §5.2 R10)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.2, §2.5, §5.2, §5.5, §7; `docs/PRD.md` §6.1, §6.2 (the
`line-icons` note) and the Icon row of the component catalogue; `docs/ARCHITECTURE.md` §11, §12, §17.1, §17.3;
`docs/MANIFESTO.md` Laws 4, 6, 9; `docs/specs/00-spec-design-system.md` §4.8, §6.A.3, §6.E, AM-033, AM-035, AM-064;
`packages/line-icons/` (`src/`, `package.json`, `README.md`, `__tests__/`); `bun.lock`;
`docs/research/01-research-a2ui-web-core.md` (R1) §2.6; `docs/research/01-research-packaging.md` (R9) §2.1.
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
> - The A2UI v0.9.1 basic catalog, the `web_core` 0.14.0 v0.9 basic catalog and the `web_core` 0.14.0 v1 basic
>   catalog hold the same 59 `Icon.name` values on 2026-10-19 (P2). `Icon.name` has three `oneOf` branches: the enum,
>   an `{ svgPath }` object and a `DataBinding`. R1 §2.6 named only two.
> - Upstream renders the names as Material Icons ligatures, with four overrides: `play` → `play_arrow`, `rewind` →
>   `fast_rewind`, `favoriteOff` → `favorite_border`, `starOff` → `star_border` (P3). "Off" for favourite and star
>   means the outline glyph, not a slashed one.
> - All 59 names map to canonical icons in the locked `lucide-static` 1.56.0 and `@phosphor-icons/core` 2.1.1 (P4).
>   Lucide has no filled glyphs, so `favorite`/`favoriteOff` and `star`/`starOff` collapse to one glyph each.
>   Phosphor covers all 59, but `favorite`, `star` and `starHalf` need the `fill` weight. Material mirrors 9 names in
>   RTL and leaves the other 50 unmirrored (P5).
> - The Phase 00 reference resolvers do not survive a Vite 8 production build. Vite leaves
>   `` import(`lucide-static/icons/${name}.svg?raw`) `` as an unresolved bare specifier, and no icon reaches `dist`
>   (P6). Today's tests run only under Bun.
> - A per-name `import()` map of the 59 Lucide icons builds into 56 chunks of 268–423 B gzipped each (P7). A static
>   map of all 59 costs 4.0 KB gzipped for Lucide and 7.3 KB for Phosphor (P7).
> - `line-icons` exposes only `"."` today. Plan §2.5 names `./registry` and `./resolvers/*`. `<line-icon>` itself is
>   the `./icon` subpath of `line-components` (plan §2.2, the components table).

---

## 1. Question

Plan §5.2 R10 reads: "A2UI basic icon names and their mapping to the Lucide and Phosphor resolvers; the
`line-icons` Phase 1 subpaths".

1. **Q1.** Are the 59 `Icon.name` values still the same in the published A2UI v0.9.1 basic catalog and in the
   `web_core` 0.14.0 basic catalogs on 2026-10-19?
2. **Q2.** What is the state of `line-icons` today: the registry contract, both resolvers, the exports map, the peer
   ranges against the locked versions, and the npm `latest` of both icon sets?
3. **Q3.** What does each of the 59 names map to in Lucide and in Phosphor, with match quality, semantic drift,
   filled versus outline variants and RTL mirroring, each name probed in the locked tarball?
4. **Q4.** What must `line-icons` expose in Phase 1 for `<line-icon>` and for the A2UI basic catalog?
5. **Q5.** What do the 59 icons weigh gzipped per set, and do per-icon imports keep Law 6?

## 2. Findings

All facts were retrieved on 2026-10-19 unless a row says otherwise.

### 2.1 The 59 names (Q1)

- The published v0.9.1 basic catalog is `specification/v0_9_1/catalogs/basic/catalog.json` in
  `a2ui-project/a2ui` at `main` commit `cbaa5ee` (2026-10-17T18:25:44Z). Its last change was `4d4b3e3`
  (2026-07-31). Its `catalogId` is `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json` (P2).
- Its `Icon.name` enum holds 59 names. The `web_core` 0.14.0 enums in
  `src/v0_9/basic_catalog/components/basic_components.js` and `src/catalogs/basic/v1/components/basic_components.js`
  hold the same 59, with no name added or removed (P2). R1 §2.6 lists them.
- `Icon.name` is `oneOf` three branches (P2):
  1. the 59-name string enum;
  2. `{ "svgPath": string }`, `additionalProperties: false`. The `web_core` 0.14.0 v0.9 catalog types `svgPath` as
     `z.string()` (`src/v0_9/basic_catalog/components/basic_components.js:147`). The v1 catalog types it as
     `DynamicStringSchema` (`src/catalogs/basic/v1/components/basic_components.js:129`), so under v1 the path itself
     can be a binding;
  3. `DataBinding` from `common_types.json`.
- `component` and `name` are the only required properties. The schema describes `name` only as "The name of the icon
  to display." and says nothing about glyph style (P2).
- The `web_core` 0.14.0 universal `a2ui-icon` element (`src/universal/basic_catalog/components/Icon.js`) renders a
  string as `<i class="material-icons a2ui-icon">` with a Material ligature name. The name is camelCase turned into
  snake_case, with four overrides. An `svgPath` renders as `<svg viewBox="0 0 24 24"><path d=…>` (P3).

| A2UI name | Material ligature upstream renders |
|---|---|
| `play` | `play_arrow` |
| `rewind` | `fast_rewind` |
| `favoriteOff` | `favorite_border` (outline heart) |
| `starOff` | `star_border` (outline star) |
| the other 55 | snake_case of the name (`arrowBack` → `arrow_back`) |

- The `--a2ui-icon-font-family` default is `'Material Icons', 'Material Symbols Outlined'` (P3). The reference glyph
  set is therefore Material Icons, which is filled by default.

### 2.2 `line-icons` today (Q2)

**Registry contract** (`packages/line-icons/src/index.ts`, Phase 00 spec §6.E.1):

- `IconResolver = (name: string, options?: IconResolverOptions) => Promise<string | SVGElement>`.
- `IconResolverOptions` is an untyped index signature.
- `IconRegistry` has `register(library, resolver)`, `has(library)` and `resolve(library, name, options?)`.
  `resolve` throws `[line-icons] No resolver registered for library "<library>".` for an unknown library.
- `iconRegistry` is a shared instance.

**Resolvers** (`src/resolvers/`, Phase 00 spec §6.E.2, AM-033, AM-035):

- Both call `assertIconName(name)` first. It accepts only `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, so camelCase A2UI names
  such as `arrowBack` are rejected and need a name map.
- `createLucideResolver()` runs `` import(/* @vite-ignore */ `lucide-static/icons/${name}.svg?raw`) ``.
- `createPhosphorResolver({ weight? })` takes the weight from `options.weight`, then the factory default, then
  `regular`. It rejects any weight outside the six and runs
  `` import(/* @vite-ignore */ `@phosphor-icons/core/assets/${weight}/${file}.svg?raw`) ``, where `file` is `name`
  for `regular` and `<name>-<weight>` otherwise.
- The tests (`__tests__/resolvers.*.test.ts`) run under `bun:test` and compare the result with the file read through
  `require.resolve`. Nothing tests a bundler build (§2.5, P6).

**Manifest** (`packages/line-icons/package.json`, Phase 00 spec §4.8):

| Field | Value |
|---|---|
| `version` | `0.1.0` |
| `exports` | `"."` only (`types`, `import`) |
| `sideEffects` | `false` |
| `dependencies` | `@websublime/line-tokens: workspace:^` |
| `peerDependencies` | `lucide-static ^1.16.0`, `@phosphor-icons/core ^2.1.1`, both optional |

**Versions** (P1, P8):

| Package | Peer range | Root devDependency | Locked (`bun.lock`) | npm `latest` |
|---|---|---|---|---|
| `lucide-static` | `^1.16.0` | `^1.56.0` | 1.56.0 (published 2026-10-13) | 1.59.0 (published 2026-10-17); `next` is 1.3.0 |
| `@phosphor-icons/core` | `^2.1.1` | `^2.1.1` | 2.1.1 | 2.1.1; the registry document was last modified 2024-03-29 |

- `lucide-static` 1.56.0 ships 2143 files in `icons/`. 1879 are canonical icons in `icon-nodes.json`, and 264 are
  alias files. An alias file differs from its target only in the `class` attribute. For example, `trash-2.svg` is an
  alias of `trash` (`Trash as Trash2` in `dist/lucide-static.d.ts`), and `home.svg` is an alias of `house` (P4).
- `lucide-static` has no `exports` field, so every deep path is importable. Its `sideEffects` is `false`.
- `@phosphor-icons/core` 2.1.1 ships 1512 icons per weight. Its `exports` maps `./assets/<weight>/*.svg` and
  `./<weight>/*.svg` for the six weights (P4).
- All 56 Lucide names of the mapping exist in 1.16.0 (the peer floor) and in 1.59.0 (`latest`) (P8).

### 2.3 Mapping of the 59 names (Q3)

Every proposed name was checked in the locked tarballs (P4). Lucide names must be keys of
`icon-nodes.json`, so none is an alias. Phosphor names must exist in all six weights. All 59 rows pass, and 59
Phosphor names exist in all six weights. "Material" is the glyph `web_core` renders (§2.1). "Mirror" means the
Material Symbols Android drawable sets `android:autoMirrored="true"` (P5).

The match column uses three grades. **exact** means the same glyph concept, **near** means the same meaning with a
visibly different glyph, and **none** means no icon carries the meaning.

| # | A2UI name | Material | Lucide | L match | Phosphor (weight) | P match | Mirror | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | accountCircle | `account_circle` | `circle-user` | exact | `user-circle` | exact | | |
| 2 | add | `add` | `plus` | exact | `plus` | exact | | |
| 3 | arrowBack | `arrow_back` | `arrow-left` | exact | `arrow-left` | exact | yes | |
| 4 | arrowForward | `arrow_forward` | `arrow-right` | exact | `arrow-right` | exact | yes | |
| 5 | attachFile | `attach_file` | `paperclip` | exact | `paperclip` | exact | | |
| 6 | calendarToday | `calendar_today` | `calendar` | near | `calendar-blank` | near | | Material marks one day |
| 7 | call | `call` | `phone` | exact | `phone` | exact | | Same glyph as `phone` |
| 8 | camera | `camera` | `camera` | near | `camera` | near | | Material `camera` is a shutter aperture; `aperture` exists in both sets |
| 9 | check | `check` | `check` | exact | `check` | exact | | |
| 10 | close | `close` | `x` | exact | `x` | exact | | |
| 11 | delete | `delete` | `trash` | exact | `trash` | exact | | `trash-2` is a Lucide alias of `trash` |
| 12 | download | `download` | `download` | exact | `download-simple` | exact | | Phosphor `download` is a tray |
| 13 | edit | `edit` | `pencil` | exact | `pencil-simple` | exact | | |
| 14 | event | `event` | `calendar-days` | near | `calendar-dots` | near | | Material marks one date |
| 15 | error | `error` | `circle-alert` | exact | `warning-circle` | exact | | |
| 16 | fastForward | `fast_forward` | `fast-forward` | exact | `fast-forward` | exact | | |
| 17 | favorite | `favorite` (filled) | `heart` | near | `heart` (fill) | exact | | Lucide has no filled heart |
| 18 | favoriteOff | `favorite_border` | `heart` | exact | `heart` (regular) | exact | | Lucide collides with `favorite`; `heart-off` / `heart-break` mean something else |
| 19 | folder | `folder` | `folder` | exact | `folder` | exact | | |
| 20 | help | `help` | `circle-question-mark` | exact | `question` | exact | yes | |
| 21 | home | `home` | `house` | exact | `house` | exact | | `home` is a Lucide alias |
| 22 | info | `info` | `info` | exact | `info` | exact | | |
| 23 | locationOn | `location_on` | `map-pin` | exact | `map-pin` | exact | | |
| 24 | lock | `lock` | `lock` | exact | `lock` | exact | | |
| 25 | lockOpen | `lock_open` | `lock-open` | exact | `lock-open` | exact | | |
| 26 | mail | `mail` | `mail` | exact | `envelope-simple` | exact | | |
| 27 | menu | `menu` | `menu` | exact | `list` | exact | | |
| 28 | moreVert | `more_vert` | `ellipsis-vertical` | exact | `dots-three-vertical` | exact | | |
| 29 | moreHoriz | `more_horiz` | `ellipsis` | exact | `dots-three` | exact | | |
| 30 | notificationsOff | `notifications_off` | `bell-off` | exact | `bell-slash` | exact | | |
| 31 | notifications | `notifications` | `bell` | exact | `bell` | exact | | |
| 32 | pause | `pause` | `pause` | exact | `pause` | exact | | |
| 33 | payment | `payment` | `credit-card` | exact | `credit-card` | exact | | |
| 34 | person | `person` | `user` | exact | `user` | exact | | |
| 35 | phone | `phone` | `phone` | exact | `phone` | exact | | Same glyph as `call` |
| 36 | photo | `photo` | `image` | exact | `image` | exact | | |
| 37 | play | `play_arrow` | `play` | exact | `play` | exact | | |
| 38 | print | `print` | `printer` | exact | `printer` | exact | | |
| 39 | refresh | `refresh` | `refresh-cw` | exact | `arrow-clockwise` | exact | | |
| 40 | rewind | `fast_rewind` | `rewind` | exact | `rewind` | exact | | |
| 41 | search | `search` | `search` | exact | `magnifying-glass` | exact | | |
| 42 | send | `send` | `send` | near | `paper-plane-right` | exact | yes | Lucide plane points up-right |
| 43 | settings | `settings` | `settings` | exact | `gear` | exact | | |
| 44 | share | `share` | `share-2` | exact | `share-network` | exact | | |
| 45 | shoppingCart | `shopping_cart` | `shopping-cart` | exact | `shopping-cart` | exact | | |
| 46 | skipNext | `skip_next` | `skip-forward` | exact | `skip-forward` | exact | | |
| 47 | skipPrevious | `skip_previous` | `skip-back` | exact | `skip-back` | exact | | |
| 48 | star | `star` (filled) | `star` | near | `star` (fill) | exact | | Lucide has no filled star |
| 49 | starHalf | `star_half` | `star-half` | near | `star-half` (fill) | near | yes | Material draws a half-filled full star; both sets draw only the left half |
| 50 | starOff | `star_border` | `star` | exact | `star` (regular) | exact | | Lucide collides with `star`; Lucide `star-off` means something else, and Phosphor has no `star-off` |
| 51 | stop | `stop` (filled square) | `square` | near | `stop` | exact | | Lucide square is an outline |
| 52 | upload | `upload` | `upload` | exact | `upload-simple` | exact | | |
| 53 | visibility | `visibility` | `eye` | exact | `eye` | exact | | |
| 54 | visibilityOff | `visibility_off` | `eye-off` | exact | `eye-slash` | exact | | |
| 55 | volumeDown | `volume_down` | `volume-1` | exact | `speaker-low` | exact | yes | |
| 56 | volumeMute | `volume_mute` | `volume` | exact | `speaker-none` | exact | yes | |
| 57 | volumeOff | `volume_off` | `volume-x` | exact | `speaker-x` | exact | yes | |
| 58 | volumeUp | `volume_up` | `volume-2` | exact | `speaker-high` | exact | yes | |
| 59 | warning | `warning` | `triangle-alert` | exact | `warning` | exact | | |

The table below counts the grades and the glyph collisions per set.

| Set | exact | near | none | Unique files | Collisions |
|---|---|---|---|---|---|
| Lucide 1.56.0 | 51 | 8 | 0 | 56 | `call`/`phone`, `favorite`/`favoriteOff`, `star`/`starOff` |
| Phosphor 2.1.1 | 55 | 4 | 0 | 58 (55 regular, 3 fill) | `call`/`phone` |

- No name is a gap. The two names that look like gaps, `favoriteOff` and `starOff`, are outline glyphs upstream
  (§2.1), so each maps to the outline heart or star.
- **Filled versus outline.** Material Icons draws filled glyphs. Lucide 1.56.0 SVGs set `fill="none"` and
  `stroke="currentColor"`, so every Lucide glyph is an outline. Phosphor `regular` is an outline, and `fill` is solid.
  A Phosphor map needs a weight per name (rows 17, 48, 49). `IconResolverOptions.weight` already carries it.
- **RTL.** 9 names carry `autoMirrored` in Material: `arrowBack`, `arrowForward`, `help`, `send`, `starHalf` and the
  four `volume*`. The other 50 do not (P5). The media names (`play`, `fastForward`, `rewind`, `skipNext`,
  `skipPrevious`) are not mirrored. Neither Lucide nor Phosphor marks mirroring in its files.
- `IconRegistry` has no per-name metadata today, so a mirror flag or a weight per name has no place in the contract.

### 2.4 Phase 1 subpaths (Q4)

- Plan §2.5: "The `line-icons` registry gains its Phase 1 subpaths `./registry` and `./resolvers/*` (PRD §6.2 note,
  Phase 00 spec §6.E)." PRD §6.2 says the registry API "will likely add subpaths such as `./registry` and
  `./resolvers/*` in Phase 1".
- The `<line-icon>` element is not in `line-icons`. Plan §2.2 lists Icon as `Static` with subpath `./icon`, which is
  a `line-components` subpath (ARCHITECTURE §12). `line-icons` therefore needs only the registry and the resolvers
  for `<line-icon>`.
- The source today splits cleanly along the plan's names. `src/index.ts` holds the registry, and
  `src/resolvers/lucide.ts` and `src/resolvers/phosphor.ts` hold one resolver each. `src/resolvers/icon-name.ts` is
  internal (AM-035).
- `line-genui` has `line-icons` as a lazily loaded peer (ARCHITECTURE §17.1). The A2UI basic `Icon` needs a map
  from the 59 camelCase names to kebab-case names per set, plus a Phosphor weight per name (§2.3), and an answer for
  the `svgPath` and `DataBinding` branches (§2.1).
- `sideEffects: false` holds for these subpaths, because the registry and resolvers define no element.
  `<line-icon>` registration lives in `line-components` and falls under R9 §2.1.
- A `./resolvers/*` pattern with `sideEffects: false` lets a consumer import one resolver without pulling the other
  library's code. The dynamic `import()` inside a resolver survives every `sideEffects` value (R9 §2.1).

### 2.5 Bundle weight and Law 6 (Q5)

The table below measures the raw SVG files of the §2.3 mapping, taken from the tarballs (P7).

| Set | Files | Raw bytes | Sum of per-file gzip | One gzip of all files |
|---|---|---|---|---|
| Lucide 1.56.0 | 56 | 24 707 | 15 724 | 2 972 |
| Phosphor 2.1.1 (55 regular, 3 fill) | 58 | 24 451 | 15 486 | 6 170 |

The next table measures Vite 8.3.4 production builds (P6, P7). Vite reports the Phase 00 entry chunk as 1.45 kB
gzipped; the figures here come from `gzip -9c`.

| Build | Chunks | Raw | Gzipped | Observed |
|---|---|---|---|---|
| Phase 00 resolvers, Lucide and Phosphor registered, `house` resolved | 1 | 3 081 B | 1 486 B | No SVG in `dist`; both `import()` calls stay as bare specifiers |
| Static `?raw` imports of the 59 Lucide names | 1 | | 4 017 B | |
| Static `?raw` imports of the 59 Phosphor names | 1 | | 7 257 B | |
| One `import()` per name, Lucide | 57 | | entry 2 173 B; 56 icon chunks of 268–423 B | |

- The Phase 00 resolvers rely on `@vite-ignore` with a bare package prefix. Vite keeps the expression verbatim, so a
  browser receives `` import(`lucide-static/icons/house.svg?raw`) ``. [INFERENCE] Without an import map a browser
  rejects that bare specifier, and the `?raw` query has no meaning outside Vite.
- A per-name `import()` map gives one chunk per icon. A page that shows one icon loads the map plus one chunk of
  under 0.5 KB gzipped. A static map makes every page that renders an A2UI `Icon` load all 59.
- The static Phosphor map (7.3 KB) is above the PRD §1.7 soft target of 5 KB per component, and the static Lucide map
  (4.0 KB) is under it.
- Law 6 governs `line-components` subpaths, and it states that "a button must not drag in a dialog". A map inside
  `line-icons` or `line-genui` reaches the Button bundle only if Button imports it. ARCHITECTURE §11 says Button
  exposes a slot and does not import `<line-icon>`.

## 3. Probes

Run in `mktemp -d` with `HOME=<tmpdir>`, deleted afterwards. Exit codes are 0 unless stated.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view lucide-static version dist-tags`; same for `@phosphor-icons/core`, `@a2ui/web_core` | 0 ×3 | `lucide-static` `latest` 1.59.0, `next` 1.3.0; Phosphor `latest` 2.1.1; `web_core` `latest` 0.14.0 |
| P2 | `npm pack @a2ui/web_core@0.14.0`; `curl` of `specification/v0_9_1/catalogs/basic/catalog.json` at `cbaa5ee`; Node script extracting the enum containing `visibilityOff` from the three sources, then `diff` of the sorted lists | 0, 0, 0, 0 | 59 names in each; both diffs empty; `name.oneOf` has enum, `{svgPath}`, `DataBinding`; `required` is `component`, `name` |
| P3 | Read `src/universal/basic_catalog/components/Icon.js` in the 0.14.0 tarball | 0 | `ICON_NAME_OVERRIDES` of four names; `material-icons` class; `svgPath` rendered as one `<path>` |
| P4 | `npm pack lucide-static@1.56.0 @phosphor-icons/core@2.1.1`; Node script checking each Lucide name in `icon-nodes.json` and `icons/`, and each Phosphor name in all six weight folders | 0, 0 | First pass: `trash-2` not canonical, Phosphor `star-off` absent in all weights. Final table: 59 rows, 0 missing; 59 Phosphor names in all six weights; `diff trash-2.svg trash.svg` differs only in `class` |
| P5 | `curl` of `symbols/android/<name>/materialsymbolsoutlined/<name>_24px.xml` at `google/material-design-icons` `49d4db3` (2026-10-09) for the 59 ligatures; the 4 absent from Symbols (`favorite_border`, `star_border`, `payment`, `phone`) fetched from `android/<category>/<name>/materialicons/black/res/drawable/baseline_<name>_24.xml` | 0 | 9 files contain `autoMirrored`; the other 50, the 4 classic files included, do not |
| P6 | Vite 8.3.4 `vite build` of an app importing a copy of `packages/line-icons/src`, registering both resolvers and resolving `house`; rerun for the review with `wc -c` and `gzip -9c` | 0, 0 | One chunk of 3 081 B raw, 1 486 B with `gzip -9c` (Vite reports 1.45 kB); it contains `` import(`lucide-static/icons/${e}.svg?raw`) `` and `` import(`@phosphor-icons/core/assets/${i}/${a}.svg?raw`) ``; no SVG asset or chunk |
| P7 | Node `zlib.gzipSync(level 9)` over the mapped files; three Vite builds (static Lucide map, static Phosphor map, per-name `import()` Lucide map); `gzip -9c` of each chunk | 0 ×4 | Figures in §2.5 |
| P8 | `npm pack lucide-static@1.16.0 lucide-static@1.59.0`; check the 56 mapped names in each `icons/` | 0 | 1960 and 2159 files; no mapped name missing in either |

## 4. Fit with line://ui

- **Law 4.** Components take icons through slots (ARCHITECTURE §11). The basic catalog `Icon` is the one place where
  an agent names an icon, so the name map serves `line-genui` and `<line-icon>`, not other components.
- **Law 6 and PRD §1.7.** §2.5 gives the per-icon and whole-map weights for the spec's choice.
- **Law 9.** `IconRegistry.resolve` throws for an unknown library, and both resolvers throw for an invalid name or a
  missing file. A bound `DataBinding` can deliver any string at runtime, so a renderer meets these throws on agent
  input.
- **ARCHITECTURE §11.** "Zero icons bundled in `line-icons` core" holds with a resolver per set. A built-in A2UI map
  holds names, not SVGs, so it bundles no icon.
- **ARCHITECTURE §17.1, §17.3.** `line-genui` loads `line-icons` lazily as a peer. The basic `Icon` row maps names to
  "a `line-icons` resolver" and is silent on the `svgPath` branch (§5 C1).
- **PRD §6.2, Phase 00 spec §4.8.** The exports map grows in Phase 1. The optional peers and `sideEffects: false`
  fit per-resolver subpaths.

## 5. Contradictions

- **C1 (new).** ARCHITECTURE §17.3 (`docs/ARCHITECTURE.md:1481`) and plan §2.1 (`docs/plans/01-plan-core-primitives.md:120`)
  map the basic `Icon` as "A2UI icon names mapped to a `line-icons` resolver"; plan §2.5 (line 172) repeats it. The
  v0.9.1 schema and `web_core` 0.14.0 also accept `{ "svgPath": … }` (§2.1, P2, P3), which no name resolver covers.
  The v0.9 catalog types the path as a string, and the v1 catalog as a `DynamicString` that may be bound. The
  documents do not say how that branch renders.
- **C2 (new).** Plan §1.2 (`docs/plans/01-plan-core-primitives.md:53`) lists "Icon resolvers | Exist | `line-icons`",
  and plan §2.5 builds on them. P6 shows that the reference resolvers emit no icon in a Vite 8 production build and
  leave a bare `?raw` specifier in the output. They work under Bun, which is the only environment the Phase 00 tests
  cover. PRD §7 Phase 00 exit criterion "agnostic resolver verified with at least one icon library"
  (`docs/PRD.md:836`) was met under Bun only.
- **C3 (new).** The PRD component catalogue (`docs/PRD.md:243`) says of Icon: "Icons are delivered via slot".
  ARCHITECTURE §11 (`docs/ARCHITECTURE.md:420-425`) gives `<line-icon>` `name`, `library` and `src` attributes
  resolved through the registry, and §17.3 (`docs/ARCHITECTURE.md:1481`) maps A2UI names onto it. A name-driven
  basic `Icon` needs the attribute form.
- **First-wave fact changed.** R1 §2.6 says "`Icon.name` is `oneOf` a 59-name enum or a path binding". The `oneOf` has
  three branches: the enum, `{ svgPath }` and `DataBinding` (P2). The 59 names themselves are unchanged.

## 6. Open questions for the spec

1. **Where does the A2UI name map live?** (a) A `line-icons` subpath such as `./a2ui`; (b) inside `line-genui`;
   (c) in the `line-components` `./icon` module. Evidence: the layer edge table (`line-genui -> line-icons` exists;
   nothing yet lets `line-icons` know A2UI), whether non-A2UI consumers want the 59 aliases, and §2.5 weights.
2. **Which set does the basic catalog resolve against by default?** (a) Lucide; (b) Phosphor; (c) none, the consumer
   registers one; (d) Material-compatible output. Evidence: §2.3 (Lucide has 8 near and 3 collisions, Phosphor 4
   near and 1), §2.5 weights, and whether upstream visual parity with Material matters.
3. **How do resolvers load icons in a consumer bundle?** (a) Keep the template `import()` and document an import map
   or bundler plugin; (b) one literal `import()` per mapped name (P7); (c) `import.meta.glob` per set (Vite only);
   (d) fetch an SVG URL. Evidence: a matrix like R9 §2.1 across Vite, esbuild and webpack, CDN delivery (R9), and the
   Law 9 path for a missing icon.
4. **What shape do the Phase 1 subpaths take?** (a) `./registry` plus `./resolvers/lucide` and `./resolvers/phosphor`
   with `"."` kept; (b) the same with `"."` removed; (c) a `./resolvers/*` pattern. Evidence: R9 §2.1 packaging
   checks, and the Phase 00 consumers of `"."` (README, tests).
5. **Where do per-name weight and RTL mirroring live?** (a) In the map entry (`{ lucide, phosphor, weight, mirror }`);
   (b) in `<line-icon>` attributes; (c) not handled. Evidence: the 9 mirrored names (P5), the 3 fill names, and
   R8 for RTL.
6. **How does the basic `Icon` render `svgPath` and an unknown bound name?** Options: inline SVG path, inert
   placeholder plus `line-a2ui-error` (ARCHITECTURE §17.3 for unmapped types), or a fallback icon. Evidence: R1 §2.7
   throw paths, R2's renderer choice, Law 9, and the `svgPath` type per version (`z.string()` in v0.9,
   `DynamicStringSchema` in v1, which a renderer must resolve before drawing).
7. **Do the Lucide collisions matter?** `favorite`/`favoriteOff` and `star`/`starOff` render the same Lucide glyph.
   Options: accept, apply `fill: currentColor` to the filled names, or use the drifted `heart-off` and `star-off`.
   Evidence: §2.3, and how `<line-icon>` styles an injected SVG.

## 7. Sources

All retrieved 2026-10-19.

- A2UI v0.9.1 basic catalog, `a2ui-project/a2ui` @ `cbaa5ee` —
  https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v0_9_1/catalogs/basic/catalog.json
- `@a2ui/web_core` 0.14.0 tarball — https://www.npmjs.com/package/@a2ui/web_core/v/0.14.0
- `lucide-static` 1.16.0, 1.56.0, 1.59.0 tarballs — https://www.npmjs.com/package/lucide-static
- `@phosphor-icons/core` 2.1.1 tarball — https://www.npmjs.com/package/@phosphor-icons/core
- Material Design Icons, `google/material-design-icons` @ `49d4db3` —
  https://github.com/google/material-design-icons/tree/49d4db35df873165d6bd6ba09b063c7dafbac2f4
- Vite 8.3.4 (workspace `node_modules`), dynamic import and `@vite-ignore` — https://vite.dev/guide/features#dynamic-import
- HTML Standard, resolving a module specifier — https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier
- R1 `docs/research/01-research-a2ui-web-core.md` §2.6, §2.7; R9 `docs/research/01-research-packaging.md` §2.1
