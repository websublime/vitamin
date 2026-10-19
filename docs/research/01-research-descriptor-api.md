# Research: Descriptor API and emitters

**Row:** `00-Z43` (Phase 1 plan §5.1 R3)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.1 (items 2–4), §4.1, §5.1, §5.3, §5.5, §7.2, §8; `docs/PRD.md` §2 (stack row, §2.1), §7.3, Appendix D; `docs/ARCHITECTURE.md` §17.1–§17.3, §17.7; `docs/specs/00-spec-design-system.md` AM-064; `docs/research/00-research-generative-ui.md` §4.4; `docs/research/01-research-a2ui-web-core.md` (R1); `docs/research/01-research-mcp-apps.md` (R5); `docs/research/01-research-transports.md` (R6); root and `packages/line-schemas` `package.json`; `bun.lock`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - **Zod lines.** `zod` 3.25.76 (2025-07-08) is the last 3.x release, and 4.6.7 (2026-10-12) is `latest`. Under 3.25.76 the bare `zod` and `zod/v3` give the Zod 3 API, and `zod/v4` gives the Zod 4.0.0 API. Under 4.6.7 the bare `zod` gives Zod 4.6.7, and `zod/v3` is a separate Zod 3 build. `zod-to-json-schema`, which `web_core` depends on, has been deprecated since November 2025.
> - **Sharing.** Only the Zod 3 API composes with the `web_core` common types. A `zod/v4` object that holds `DynamicStringSchema` type-checks, then throws on parse. A pure Zod 4 descriptor passes into `Catalog` without error, but `toJson()` emits no props and the binder leaves `{path}` bindings unresolved. Under a root `zod` 4.6.7, `zod/v3` descriptors work at runtime but fail `tsc` with TS2589.
> - **Zod 4 pull.** `@modelcontextprotocol/ext-apps` 2.0.3 and the MCP SDK v2 need `zod ^4.2.0`. A Vite 8.3.4 bundle of the `web_core` catalog imports plus ext-apps carries 2 to 4 Zod copies and weighs 133.9–166.8 KB gzipped, against 54.0 KB for the catalog imports alone. Upstream A2UI has no plan to move to Zod 4 and tracks a Zod-agnostic schema layer as P2 (#2160).
> - **Provider limits.** The A2UI common types carry `oneOf`, `allOf`, recursion, open maps and a cross-document `$ref`. OpenAI strict mode, Anthropic strict tool use and Gemini `parameters` each reject some of these. OpenAI and Anthropic document no subset for non-strict tools. Gemini's only JSON Schema keyword list sits on the deprecated `GenerationConfig._responseJsonSchema` field and omits `allOf`. No provider documents a 1024-character description limit. Community error reports show OpenAI's API rejecting a function description over 1024 characters, and no source covers property descriptions.
> - **Emitters and weight.** The three Zod → JSON Schema paths produce different shapes for the same props (§2.5). The probe `line` catalog for the four validating components is 2,374 B (547 o200k tokens), plus 5,780 B (1,298 tokens) of common types. One frontend tool costs 73 tokens (Separator) to 778 tokens (Button), and the bundled common types make up most of the larger figure.

---

## 1. Question

Plan §5.1 R3 reads "Descriptor API and emitters | Zod 3 sharing with `web_core`, Zod → JSON Schema for frontend tools, provider limits (no `$ref`/`oneOf` beyond common types, descriptions ≤ 1024 chars)". Plan §8 adds the Zod split ("Keep the repo on Zod 3 until `web_core` moves (relies on the same AM-064 reading of PRD §2); R3 checks the sharing") and asks R2 and R3 to measure the emitted catalog size.

1. Which Zod versions are current, and what does each package line export?
2. Can a descriptor written against the Zod 3 API, or against the Zod 4 API, compose with the `web_core` common types?
3. How many Zod copies and how many gzipped bytes land when `web_core` meets ext-apps 2.x, and does upstream A2UI plan a Zod 4 move?
4. How can a protocol-neutral descriptor hold its props schema, description, events and lazy `load()`? What does prior art do?
5. How do `zod-to-json-schema`, `Catalog.toJson()` and native `z.toJSONSchema` compare on the props of Button, Icon, Stack and Separator?
6. What do OpenAI, Anthropic, Gemini and AG-UI accept on the day, and do the plan's flat-schema and 1024-character rules match them?
7. How heavy is the emitted `line` catalog, and how many tokens does each descriptor cost?

## 2. Findings

All facts were retrieved on 2026-10-19 unless a row says otherwise. Component specs for the four validating components do not exist yet, so the probes use illustrative props (§3, "Probe descriptors").

### 2.1 Zod lines and exports

| Line | Version | Published | Notes |
|---|---|---|---|
| 3.x | 3.25.76 | 2025-07-08 | Last 3.x publish; no 3.26 exists |
| 4.x | 4.0.0 | 2025-07-09 | Package root switched to Zod 4 |
| 4.x | 4.2.0 | 2025-12-15 | Floor of the MCP SDK v2 and ext-apps 2.x ranges |
| 4.x | 4.6.7 | 2026-10-12 | `latest`; other dist-tags `next`, `alpha`, `beta`, `canary` are stale pre-releases |

| Subpath | Under `zod@3.25.76` | Under `zod@4.6.7` |
|---|---|---|
| `.` | Zod 3 API, same module instance as `zod/v3` | Zod 4.6.7 Classic (`toJSONSchema`, `fromJSONSchema`, `compile`) |
| `./v3` | Zod 3 API | Zod 3 API, a separate build whose files differ from 3.25.76 |
| `./v4` | Zod 4.0.0 Classic (`toJSONSchema`; no `fromJSONSchema`, no `compile`) | Same as `.` |
| `./v4-mini`, `./v4/mini` | Zod 4.0.0 Mini | Zod 4.6.7 Mini |
| `./v4/core` | Zod 4.0.0 core | Zod 4.6.7 core |
| `./v4/locales`, `./v4/locales/*` | Present | Present |
| `./mini`, `./compile`, `./locales` | Absent | Present |

- Zod's versioning page says `zod/v4` and `zod/v3` "will remain available forever", that "no code changes were made between the latest `3.25.x` release and `4.0.0`", and that "A Zod 3 `ZodType` is not assignable to a Zod 4 `ZodType`" (zod.dev/v4/versioning).
- The library-authors guide tells libraries to put `zod` in `peerDependencies`, to build against `zod/v4/core`, and to tell the majors apart at runtime by the `_zod` property.
- `zod-to-json-schema` 3.25.2 (2026-03-27) is `latest`. Its README says "As of November 2025, this project will no longer be actively maintained" and points to native `z.toJSONSchema`. Its peer range is `zod ^3.25.28 || ^4`, and it converts Zod 3 schemas only ("so long as you still provide v3-schemas"). It imports `zod/v3` in its ESM build.
- No 3.x install satisfies `zod ^4.2.0`. The `zod/v4` inside 3.25.76 reports version 4.0.0 (P4).
- The repo resolves two Zod packages today. `bun.lock` holds `zod@3.25.76` at the root and `astro/zod` 4.6.5 nested for `apps/site`. `@websublime/line-schemas` 0.1.1 lists `zod ^3.25.76` under `dependencies` and imports the bare `zod`.
- Zod 4 calls the `Function` constructor to build parsers. The P9 harness wraps `globalThis.Function` before importing Zod and counts calls in each phase, using a schema with two `z.object` nodes. Under Zod 4.6.7 and under the `zod/v4` of 3.25.76, Zod makes 0 calls on import, 1 when building the schema, 2 on the first parse and 0 on the next two parses, so 3 in total. Under Zod 3 it makes 0. The first-parse count matches the two object nodes, so a one-object schema would give 2 in total [INFERENCE]. When `Function` throws, as under a CSP without `'unsafe-eval'`, Zod 4 falls back to its interpreter and parsing still succeeds. `z.config({ jitless: true })` removes every call (P9; zod.dev/compile, "Content Security Policy"). The MCP Apps default View CSP has no `'unsafe-eval'` (R5 §2.2).

### 2.2 Sharing with the `web_core` common types

The probe built the four descriptors in several ways and ran each through `Catalog`, `toJson()`, `validationSchema`, `MessageProcessor`, `NodeResolver` and `scrapeSchemaBehavior` from `@a2ui/web_core` 0.14.0 (P5).

| Variant | Construction and parse | `toJson()` of `Icon.name` | `{path: "/icon"}` after `NodeResolver` |
|---|---|---|---|
| V1. Zod 3 API (`zod` under 3.25.76) with `DynamicStringSchema` and siblings | Builds; parses | `{"$ref": "common_types.json#/$defs/DynamicString", "description": "Represents a string"}` | Bound, value `"home"` |
| V1d. V1 with `.describe()` on the common type | Builds; parses | Inline `oneOf` of string, `DataBinding`, `FunctionCall` (as R1 §2.4.3 found) | Bound |
| V2. `zod/v4` object holding `DynamicStringSchema` | Builds; `safeParse` throws `Invalid element at key "name": expected a Zod schema`; `z.toJSONSchema` throws | Not reached | Not reached |
| V3. Pure `zod/v4` descriptors, common types re-declared in Zod 4 | Builds; parses | `{"type": "object", "properties": {"component": {"const": "Icon"}}, …}`, so every prop is gone | Unbound; the component gets the raw `{path: "/icon"}` |
| V1 under a root `zod@4.6.7` with descriptors importing `zod/v3` | Same as V1 | Same as V1 | Bound |
| V3 under a root `zod@4.6.7` | Same as V3 | Same as V3 | Unbound |

- `scrapeSchemaBehavior` classifies V1 `Icon` as `DYNAMIC` per prop and V3 `Icon` as `STATIC` as a whole. That matches the silent failure that upstream PR #2753 (open, last updated 2026-10-02) describes for catalogs built with Zod 4.
- `validationSchema` builds for every variant that reaches `Catalog`, V3 included, so it does not detect the empty props.
- Under a root `zod@4.6.7`, Bun 1.4.3 nests `zod@3.25.76` under `@a2ui/web_core` (P3). Descriptors that import `zod/v3` from the root then use one Zod 3 build while `web_core` uses another. Both builds read `_def`, so the runtime works (P5).

P6 type-checked three files with TypeScript 5.9.3 (`strict`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `skipLibCheck`).

| File | Root `zod@3.25.76` | Root `zod@4.6.7` (descriptor imports `zod/v3`) |
|---|---|---|
| Zod 3 object with `DynamicStringSchema`, `ChildListSchema`, assigned to `ComponentApi` | Exit 0 | Exit 2, two TS2589 "Type instantiation is excessively deep and possibly infinite" |
| Zod 4 object holding `DynamicStringSchema` | Exit 0, so the V2 runtime throw is not caught at compile time | Exit 0 |
| Zod 4 object assigned to `ComponentApi` | Exit 2, TS2740 (missing `_type`, `_parse`, …) | Exit 2, TS2740 |

### 2.3 The Zod 4 pull

| Package | Version | `zod` range | Kind |
|---|---|---|---|
| `@a2ui/web_core` | 0.14.0 | `^3.25.76` | dependency |
| `zod-to-json-schema` | 3.25.2 | `^3.25.28 \|\| ^4` | peer |
| `@modelcontextprotocol/ext-apps` | 2.0.3 | `^4.2.0` | peer |
| `@modelcontextprotocol/client`, `/core` | 2.3.1 | `^4.2.0` | dependency |
| `@modelcontextprotocol/sdk` (v1) | 1.32.1 | `^3.25 \|\| ^4.0` | dependency and peer |
| `@ag-ui/client` | 1.0.3 | `^3.25.76`, imports `zod/v4` (R6 §2.1) | dependency |
| `@ag-ui/core` | 1.0.3 | `^3.25.18 \|\| ^4.0.0`, optional; `./schemas` imports `zod/v4` | peer |

P7 built five import sets as Vite 8.3.4 libraries (`minify: true`, `gzip -9`) under two root Zod versions. Zod copies come from an esbuild metafile of the same entry, grouped by package directory and API subpath, and agree with a count of `"$ZodObject"` in the Vite output.

| Import set | Root `zod@3.25.76`: min / gzip | Zod copies | Root `zod@4.6.7`: min / gzip | Zod copies |
|---|---|---|---|---|
| `Catalog` plus four common types (`DynamicString`, `ComponentId`, `ChildList`, `Action`) | 235,045 / 53,991 | 1 (Zod 3) | 306,892 / 67,982 | 2 (Zod 3, Zod 3) |
| The above plus `App` and three style helpers from ext-apps `.` | 712,907 / 163,797 | 4 (Zod 3; Zod 4.0.0 from the root `zod/v4`; Zod 4.6.7 nested under `core`; Zod 4.6.7 nested under `client`) | 595,828 / 133,924 | 3 (Zod 3, Zod 3, Zod 4.6.7) |
| The above with ext-apps `./app-with-deps` instead | 714,226 / 153,363 | 2 (Zod 3; Zod 4 inlined in `app-with-deps.js`) | 786,262 / 166,763 | 3 (Zod 3, Zod 3, inlined Zod 4) |
| ext-apps `.` alone | 477,330 / 110,221 | 3 (Zod 4) | 288,360 / 66,471 | 1 |
| ext-apps `./app-with-deps` alone | 478,674 / 99,437 | 1 (inlined) | 478,674 / 99,437 | 1 (inlined) |

- Under a root Zod 4, `web_core` alone carries two Zod 3 copies. `web_core` uses its nested 3.25.76, and the root `zod-to-json-schema` imports `zod/v3` from the root 4.6.7.
- Under a root Zod 3, ext-apps `.` resolves `zod/v4` to the Zod 4.0.0 API inside 3.25.76, against its `^4.2.0` peer. Importing the module and constructing `App` succeeded (P8). That covers construction only, not the 4.2 features the range asks for.
- The copy counts reflect Bun 1.4.3's layout, which nested one `zod@4.6.7` under each MCP package when the root held 3.25.76. Another package manager may hoist them differently.

Upstream A2UI `main` (`cbaa5ee`, 2026-10-17) shows these facts.

- `typescript/core/web_core/package.json` declares `zod ^3.25.76` and `zod-to-json-schema ^3.25.2`. `typescript/catalogs/mcp` also declares `zod ^3.25.76`. `docs/public/roadmap.md` does not mention Zod.
- #1222 (open, 2026-04-17). The triage comment of 2026-06-29 says a Zod 4 upgrade "is a breaking change because we expose Zod types in our public API" and that "We do not have immediate plans to upgrade to Zod v4 in the current release cycle".
- #1263 (closed 2026-06-29). It closed with "There are currently no plans to migrate to Zod v4 due to compatibility constraints with internal ecosystems using Zod v3". The opener reported the Zod 4 CSP problem (§2.1).
- #2002 (open, 2026-07-14) proposes making `zod` a peer. A maintainer reported on 2026-07-30 that a working change is breaking, because users "must provide the zod dependency manually".
- #2160 (open, 2026-08-03, label P2) proposes an `A2uiSchema<T>` interface with Zod 3 and Zod 4 implementations. The triage comment of 2026-09-25 says "Abstracting the Zod dependency into `@a2ui/schema-zod3` remains a priority on our P2 roadmap". No `schema-zod3` package or schema interface exists in the `main` tree.
- PR #2135 ("Accept both zod 3 and 4") was closed on 2026-08-04 as "too hacky". PR #2753 (Zod-version-agnostic binder introspection) is open. #2901 (open, 2026-09-30) reports that the `REF:` description markers and canonical `$ref`s diverge across SDKs.

### 2.4 Descriptor API shape and prior art

ARCHITECTURE §17.3 lists the descriptor fields: catalog name, tag, `load()`, prop schema, slot map, binding map, action map, accessibility requirements, agent-facing description and `agentExposed`. The prior art below is evidence only.

| Concern | A2UI `web_core` 0.14.0 | Vercel AI SDK `tool()` (`ai` 7.0.143) | CopilotKit `useFrontendTool` (1.79.1) | json-render `defineCatalog` (0.21.1) |
|---|---|---|---|---|
| Name | `ComponentApi.name` | Key in the tools record | `name` | Key in `components` |
| Props schema | `ComponentApi.schema`, typed Zod 3 `z.ZodTypeAny` | `inputSchema`, Zod or JSON Schema | `parameters`, Zod | `props`, Zod |
| Zod handling | Dependency `^3.25.76`; reads `_def` | Peer `^3.25.76 \|\| ^4.1.8`; imports `zod/v3`, `zod/v4`, `zod/v4/core`; vendors `zod3ToJsonSchema`; reads Standard Schema `~standard` | Peer `>=3.25`; depends on `zod-to-json-schema ^3.24.5` | Dependency `^4.3.6` and peer `^4.0.0` |
| Description | Object `.describe()`, emitted only in the mixin layout (below) | `description`, a string or a function | `description` | `description` |
| Slots and children | `ComponentId` and `ChildList` props | — | — | `slots: string[]` |
| Events and actions | `Action` prop; `actionHandler` on the processor | `execute` | `handler` | Catalog-level `actions` with `params` |
| Element and loading | `WebComponentImplementation` `{tagName, element}`; `element` defines eagerly (R1 §2.5.3) | — | — | A separate registry maps names to React components |
| Other | `allowedParents`, `allowedChildren` | `strict`, `inputExamples`, `needsApproval` | `render` | `catalog.prompt()` |

The probes give four facts for the line descriptor.

- A descriptor object with `load: () => import('./button.js')` code-splits under Vite 8.3.4. The catalog chunk holds the `import()` and no `customElements.define`, and the element module lands in its own chunk (P14).
- A V1 props object is a valid `ComponentApi.schema` as it stands, so the same Zod 3 object can feed `Catalog` and a frontend-tool emitter (P5).
- `Catalog.toJson()` drops a component-level `.describe()` on a plain code-defined schema. With `spec(schema, { mixins: ['ComponentCommon'] })`, `toJson()` writes the `allOf` layout of the basic catalog and keeps the description inside the component's branch (P13). Without a mixin, the component JSON carries no `ComponentCommon` (`accessibility`, `weight`).
- `Catalog` takes `instructions` as its sixth constructor argument and writes it into `toJson()` (P13).

### 2.5 Zod → JSON Schema, compared

The probe ran each path on the same four props objects (P10, P11). "Faithful Zod 4 types" means the v0.9 common types rebuilt with Zod 4.6.7 `z.fromJSONSchema` from `common_types.json`. The probe first had to delete the `FunctionCall.oneOf` reference to `catalog.json#/$defs/anyFunction`, because `fromJSONSchema` throws "External $ref is not supported". "Hand types" means a short probe transliteration without recursion or descriptions.

| Aspect | `zod-to-json-schema` 3.25.2 on Zod 3 | `Catalog.toJson()` (`web_core` 0.14.0) | `z.toJSONSchema`, Zod 4.6.7 | `z.toJSONSchema`, Zod 4.0.0 (`zod/v4` in 3.25.76) |
|---|---|---|---|---|
| Maintenance | Deprecated since November 2025 | Moves with `web_core` | Native, current | Frozen with 3.25.76 |
| Targets | `jsonSchema7` (default), `jsonSchema2019-09`, `openApi3`, `openAi` | A2UI catalog document | `draft-2020-12` (default), `draft-07`, `draft-04`, `openapi-3.0` | Default `draft-2020-12` probed |
| Common types | Inlined as `anyOf`. Each copy carries its `REF:#/$defs/<Name>` marker as `description` text, for example `"description": "REF:#/$defs/DataBinding"`. Recursion becomes JSON-pointer `$ref`s such as `#/properties/name/anyOf/2`, and deeper levels fall back to `{}` with "Recursive reference detected … Defaulting to any" | External `$ref` to `common_types.json#/$defs/<Name>`, with the type's description beside it | Needs Zod 4 common types, which `web_core` does not ship. Faithful types give `$defs` named by `meta({ id })` plus synthetic `__schema0` names, keep `oneOf`, and lose the `returnType` `const` branch of `DynamicString` | With hand types, writes an `"id"` keyword inside each `$defs` entry, which Ajv strict rejects ("NOT SUPPORTED: keyword \"id\"") |
| Unions | `anyOf` | `oneOf` (from the common types) | `anyOf` for `z.union`; `oneOf` where `fromJSONSchema` built it | `anyOf` |
| Optional props | Left out of `required`. The `openAi` target makes them required and nullable, and drops their `.describe()` text | Left out of `required` | Left out of `required` | Left out of `required` |
| Object closure | `additionalProperties: false` | `unevaluatedProperties: false` at component level; nested objects follow the common types | `additionalProperties: false` in `output` mode, absent in `io: "input"` mode | `additionalProperties: false` |
| Ajv strict compile | Compiles (default target); the `openAi` target needs `allowUnionTypes` | Fails strict types on the common types; compiles non-strict | Compiles | Fails on `id` |
| `openapi-3.0` target | — | — | `definitions` instead of `$defs`; an optional `$ref` prop is wrapped in `allOf` | — |

The probe labels eight emitter paths, and §2.6 refers to them by letter.

- A. `zod-to-json-schema` 3.25.2, default target, on the V1 props.
- B. `zod-to-json-schema` 3.25.2, `openAi` target, on the V1 props.
- C. The `toJson()` component definition, with `component` removed and the common types bundled under local `$defs`.
- D, E, F. Zod 4.6.7 `z.toJSONSchema` with faithful types, as `draft-2020-12` output, `draft-2020-12` input and `openapi-3.0`.
- G, H. `z.toJSONSchema` with hand types, under Zod 4.0.0 and Zod 4.6.7.

The table gives the parameter schemas' size in minified JSON bytes and o200k_base tokens.

| Path | Button | Icon | Stack | Separator |
|---|---|---|---|---|
| A. `zod-to-json-schema` default | 2,955 B, 664 tok | 1,458 B, 345 tok | 1,195 B, 280 tok | 289 B, 62 tok |
| B. `zod-to-json-schema` `openAi` | 3,793 B, 886 tok | 1,868 B, 447 tok | 1,311 B, 324 tok | 293 B, 72 tok |
| C. `toJson()` component, common types bundled locally | 3,378 B, 746 tok | 1,571 B, 379 tok | 1,162 B, 275 tok | 238 B, 49 tok |
| D. Zod 4.6.7, faithful types, `draft-2020-12` | 4,789 B, 1,076 tok | 1,572 B, 376 tok | 1,281 B, 289 tok | 294 B, 62 tok |
| H. Zod 4.6.7, hand types | 1,680 B, 395 tok | 672 B, 167 tok | 749 B, 189 tok | 294 B, 62 tok |

H is smaller only because the hand types drop recursion and descriptions, so it does not compare with A–D.

### 2.6 Provider limits on the day

| Provider | Tool name | Description length | Schema field | Strict-mode subset |
|---|---|---|---|---|
| OpenAI function calling and Structured Outputs | "Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64" (`openai-openapi` `FunctionObject.name`, commit `33248a6`) | No limit in the guides or the OpenAPI spec. The API rejects a function description over 1024 characters with `string_above_max_length` (community reports of 2023-12-19 and 2024-12-30) | `parameters`, a JSON Schema object | With `strict: true`, every object needs `additionalProperties: false` and every property must be `required` (optional fields become `["T", "null"]`). The root must be an object and not `anyOf`. Supported types are string, number, boolean, integer, object, array, enum and `anyOf`. `$defs`, `$ref` and recursion are supported. `allOf`, `not`, `dependentRequired`, `dependentSchemas` and `if`/`then`/`else` are not. Limits are 5000 properties, 10 nesting levels, 120,000 characters of names, enum values and consts, and 1000 enum values |
| Anthropic tool use | `^[a-zA-Z0-9_-]{1,128}$` (Messages API reference) | None documented | `input_schema`, JSON Schema 2020-12 with `type: "object"` | With `strict: true`, supported are the basic types, primitive `enum`, `const`, `anyOf`, `allOf` without `$ref`, local `$ref`/`$defs`/`definitions`, `default`, `required`, a format list, and `minItems` 0 or 1. `additionalProperties` must be `false`. Recursion, external `$ref`, numeric constraints and `minLength`/`maxLength` are not supported. Limits are 20 strict tools per request, 24 optional parameters and 16 union-typed parameters across all strict schemas |
| Google Gemini | "Must be a-z, A-Z, 0-9, or contain underscores, colons, dots, and dashes, with a maximum length of 128" | Required; no length documented | `parameters` (OpenAPI 3.0.3 Schema subset) or `parametersJsonSchema` (JSON Schema), mutually exclusive | The `Schema` object allows `type`, `format`, `title`, `description`, `nullable`, `enum`, `items`, `properties`, `required`, `anyOf`, `propertyOrdering`, `default`, `example` and min/max keywords, with no `$ref`, `oneOf`, `allOf`, `const` or `additionalProperties`. The `parametersJsonSchema` field documents no keyword list. The API reference gives one only for `GenerationConfig._responseJsonSchema`, which is marked deprecated ("Use `responseFormat` instead"). That list adds `$defs`, `$ref`, `oneOf` ("interpreted the same as `anyOf`") and `additionalProperties`, says a `$ref` may have no non-`$` siblings, and allows cycles only in non-required properties. The structured-output guide lists types and keywords without `$ref`, `oneOf` or `allOf`, while its examples use `anyOf` and `$ref: "#"`. Applying the `_responseJsonSchema` list to `parametersJsonSchema` is [INFERENCE] |
| AG-UI 1.0 (`@ag-ui/core` 1.0.3 `ToolSchema`) | `string`, no pattern | `string`, no limit | `parameters`, any non-null value, optional; plus `metadata`; `looseObject` | None. The model provider behind the agent applies its own rules |

- OpenAI's Responses API normalises a tool to strict mode when `strict` is omitted and falls back to non-strict if it cannot. Chat Completions stays non-strict by default.
- PRD Appendix D's `{name, description, parameters}` matches the AG-UI `Tool` type. All four probe tools pass `ToolSchema.safeParse` under every emitter (P11).
- A tool name that passes all three providers must satisfy OpenAI's `[a-zA-Z0-9_-]`, at most 64 characters.

The probe checked every emitted parameter schema against these subsets (P11). It counts keyword violations and does not call any provider.

| Common-type construct | Where it sits (v0.9 `common_types.json`) | OpenAI strict | Anthropic strict | Gemini `parameters` | Gemini `parametersJsonSchema` (deprecated `_responseJsonSchema` list, [INFERENCE]) | OpenAI and Anthropic non-strict |
|---|---|---|---|---|---|---|
| `oneOf` | `DynamicString`, `DynamicBoolean`, `DynamicValue`, `ChildList`, `Action`, `FunctionCall` | Not in the supported list | Not in the supported list | Absent | Read as `anyOf` | No subset documented |
| `allOf` with `$ref` | The `FunctionCall` branch of each `Dynamic*` type | `allOf` unsupported | Unsupported | Absent | Absent from the list | No subset documented |
| Recursion | `FunctionCall.args` → `DynamicValue` → `FunctionCall` | Supported | Unsupported | Absent | Unrolled to a limited depth in non-required properties | No subset documented |
| Open maps (`additionalProperties` as a schema) | `FunctionCall.args`, `Action.event.context` | Unrepresentable, because every object needs `additionalProperties: false` | `additionalProperties` must be `false` | Absent | Listed | No subset documented |
| Cross-document `$ref` | `FunctionCall.oneOf` → `catalog.json#/$defs/anyFunction` | Only local refs are shown | External `$ref` unsupported | No `$ref` | Not stated | Unresolvable without bundling |
| `$ref` with a `description` sibling | Every `toJson()` property that uses a common type | Not stated | Not stated | No `$ref` | Not allowed | No subset documented |

- Separator uses no common type. It passes Anthropic strict under every path except C (`unevaluatedProperties`) and E (no `additionalProperties: false`). It passes OpenAI strict only under B, because the other paths leave optional props out of `required`. Under Gemini `parameters` it fails only on `$schema`, `additionalProperties` and, under C, `unevaluatedProperties`.
- Stack passes OpenAI strict only under B, and fails Anthropic strict wherever `ChildList` keeps its `oneOf` (C–F). Button and Icon fail all three strict subsets under every path that keeps the common types (A–F).
- The four probe tools hold 16 to 20 optional parameters across all objects (A, C, D; P12), against Anthropic's cap of 24 across all strict tools in one request.

### 2.7 Catalog weight

Measured on the probe descriptors (P12), whose descriptions are one short sentence each. Tokens use o200k_base through `gpt-tokenizer` 4.1.0, offline. No Anthropic or Gemini tokenizer runs offline, so their counts differ by an unmeasured margin.

| Item | Minified JSON | gzip | o200k tokens |
|---|---|---|---|
| `line` catalog `toJson()`, four components | 2,374 B | 847 B | 547 |
| … with `.describe()` on `Icon`'s two common types | 2,657 B | 905 B | 614 |
| Component Button / Icon / Stack / Separator | 885 / 310 / 522 / 297 B | 454 / 180 / 280 / 203 B | 191 / 74 / 131 / 61 |
| `$defs.anyComponent` (`oneOf` plus `discriminator`) | 180 B | 120 B | 44 |
| `validationSchema` of the same catalog | 6,265 B | 1,557 B | 1,425 |
| v0.9 `common_types.json`, whole | 5,780 B | 1,688 B | 1,298 |
| v0.9 basic catalog `toJson()` (18 components, 14 functions), for scale | 29,240 B | 5,371 B | 7,250 |
| Frontend tool with name and description, path C: Button / Icon / Stack / Separator | 3,534 / 1,734 / 1,295 / 377 B | 1,070 / 641 / 560 / 234 B | 778 / 413 / 305 / 73 |

- A 1024-character description costs about 211 o200k tokens (P12), so the 1024 cap bounds the description share of a descriptor at roughly that figure.
- An agent that reads the `line` catalog also needs the common types it references. Upstream PR #3167 (merged 2026-10-14) prunes `common_types` in the agent SDK's prompt generator.

## 3. Probes

All probes ran on 2026-10-19 under Bun 1.4.3 in `mktemp -d` (`/var/folders/…/tmp.31Dld0tfZ3`, and `tmp.XJcPH14TLp` for the P9 per-phase rerun) with `HOME` set to that directory. Each directory was deleted afterwards. No provider API was called.

The probe descriptors below are illustrative and are not spec text.

- Button has `child` (`ComponentId`), `variant`, `type`, `disabled` (`DynamicBoolean`) and `action` (`Action`).
- Icon has `name` and `label` (`DynamicString`).
- Stack has `children` (`ChildList`), `direction`, `gap`, `align`, `justify` and `wrap`.
- Separator has `orientation` and `decorative`.

| # | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view zod dist-tags time exports`; `npm view zod-to-json-schema …`; `npm view` of `@a2ui/web_core`, ext-apps, MCP client/core/sdk, `@ag-ui/client`, `@ag-ui/core`, `ai`, `@ai-sdk/provider-utils`, CopilotKit, `@json-render/core` | 0 | §2.1 and §2.3 tables; `zod-to-json-schema` deprecation notice |
| P2 | `gh search issues/prs --repo a2ui-project/a2ui zod`; `gh issue view 1222 1263 2002 2160 2901`; `gh pr view 2135 2753`; `gh api …/contents/typescript/core/web_core/package.json?ref=cbaa5ee` | 0 | §2.3 upstream list |
| P3 | `bun add zod@3.25.76 @a2ui/web_core@0.14.0 zod-to-json-schema@3.25.2 lit@3.3.3 ajv@8 ajv-formats @ag-ui/core@1.0.3 typescript@5.9.3 gpt-tokenizer`; `bun add zod@4.6.7 @a2ui/web_core@0.14.0 lit@3.3.3 typescript@5.9.3` | 0, 0 | One `zod` 3.25.76; with root 4.6.7, `@a2ui/web_core/node_modules/zod` is 3.25.76 |
| P4 | `bun exports.mjs` in both layouts | 0, 0 | §2.1 subpath table; `zod/v4` in 3.25.76 reports 4.0.0 |
| P5 | `bun share.mjs` in both layouts | 0, 0 | §2.2 variant table |
| P6 | `tsc --strict --noEmit … ts/{z3,z4mixed,z4api}.ts` in both layouts | 0, 0, 2 and 2, 0, 2 | §2.2 TypeScript table |
| P7 | `bun add zod@{3.25.76,4.6.7} @a2ui/web_core@0.14.0 lit@3.3.3 @modelcontextprotocol/ext-apps@2.0.3 @modelcontextprotocol/client@2.3.1 @modelcontextprotocol/core@2.3.1 vite@8.3.4 esbuild`; `vite build` (library, ES) × 10; `node meta.mjs` (esbuild metafile) × 6 | 0 | §2.3 weight table |
| P8 | `bun extapps.mjs` (import ext-apps `.`, `new App(…)`) in both layouts | 0, 0 | Works under the 3.25.76 `zod/v4` |
| P9 | `bun csp.mjs {zod,zod/v4,zod/v3}`, `csp2.mjs` (`jitless`), `csp3.mjs` (throwing `Function`); rerun with per-phase counts | 0; one run exit 1 | `Function` calls for import / build / first parse / two more parses: 0 / 1 / 2 / 0 under Zod 4.6.7 and `zod/v4`, 0 / 0 / 0 / 0 under Zod 3; 0 with `jitless`; parse still correct under a throwing `Function`. The exit 1 came from a probe bug that chained `.optional()` on `zod/mini` |
| P10 | `bun emit3.mjs` (`zod-to-json-schema`, `toJson()`, `validationSchema`, Zod 4.0.0); `bun from.mjs`; `bun from2.mjs`; `bun emit4h.mjs` | 0, 0, 0, 0 | §2.5; `from.mjs` reported three `External $ref is not supported` throws |
| P11 | `bun analyze.mjs` (Ajv 2020/2019/07 strict and loose, `ToolSchema.safeParse`, subset checks) | 1, then 0 | The first run hit a probe bug (`ToolSchema` lives in `@ag-ui/core/schemas`). §2.5 and §2.6 results |
| P12 | `bun weight.mjs`; `bun counts.mjs` | 0, 0 | §2.7 table; 16–20 optional parameters |
| P13 | `bun desc.mjs`; `bun desc2.mjs` (`spec()` mixins) | 0, 0 | Component description only in the mixin layout; `instructions` emitted |
| P14 | `vite build -c vite.lz.mjs` (descriptor with `load: () => import('./button.js')`) | 0 | Separate element chunk; no `define` in the catalog chunk |
| P15 | `curl` of the OpenAI guides (`.md`), `openai-openapi` `openapi.yaml` at `33248a6`, Anthropic `define-tools.md`, `structured-outputs.md`, `messages/create.md`, Gemini `function-calling.md.txt`, `api/generate-content.md.txt`, `structured-output.md.txt`, AG-UI `concepts/tools.md`, Zod docs sources | 0 | §2.6 and §2.1 citations |
| P16 | `npm pack @ai-sdk/provider-utils@5.0.62 @copilotkit/react-core@1.79.1 @json-render/core@0.21.1`; grep of their Zod imports | 0 | §2.4 Zod handling row |

## 4. Fit with line://ui

- **ARCHITECTURE §17.3 (descriptors reuse the common types).** Reuse works only with the Zod 3 API (§2.2). Under the current `web_core`, the rule ties the descriptor API to Zod 3. The Zod 4 failure modes are a runtime throw (V2) and silent loss of props and bindings (V3).
- **ARCHITECTURE §17.3 (`line-components` gains no Zod).** The probe descriptor held `load: () => import(…)` and code-split cleanly (P14), so descriptors can live in `line-genui` without touching component code.
- **ARCHITECTURE §17.3 (agent-facing description).** A component description reaches the catalog JSON only through the `spec()` mixin layout (§2.4). The common-type descriptions reach it through `toJson()` and through `zod-to-json-schema`. The latter path also leaks the `REF:` marker text.
- **ARCHITECTURE §17.3 and PRD Appendix D (frontend-tool emitter).** `{name, description, parameters}` matches AG-UI `Tool`. The parameters need local bundling of the common types, because `toJson()` writes external `$ref`s (§2.5, path C).
- **ARCHITECTURE §17.1 and Law 6.** A View that bundles the catalog imports with ext-apps 2.x carries 2 to 4 Zod copies (§2.3). The catalog imports alone already weigh 54.0 KB gzipped with Zod 3 at the root.
- **PRD §2 and AM-064.** AM-064 kept Zod 4 out of scope by reading "Latest stable versions" as the latest in the current major. Zod 3's current major has had no release since 2025-07-08, and its JSON Schema bridge is deprecated (§2.1). Upstream gives no date for leaving Zod 3 (§2.3).
- **Plan §8 (Zod split, catalog weight).** The plan mitigates the split by staying on Zod 3 "until `web_core` moves". The upstream issues show no move scheduled. §2.7 gives the first catalog weight figures.
- **MCP Apps default CSP (R5 §2.2).** Zod 4 parsing still works without `'unsafe-eval'` (P9). The blocked `new Function` attempt would surface as a CSP violation in a browser [INFERENCE, not run in a browser].

## 5. Contradictions

1. **The common-type exemption keeps the constructs that provider limits reject.** `docs/ARCHITECTURE.md:1473` gives "provider limits" as the reason schemas stay flat and exempts "the A2UI common types" from the no-`$ref`/`oneOf` rule. `docs/PRD.md:898`, `docs/plans/01-plan-core-primitives.md:318` and `:463` repeat the exemption. The v0.9 common types carry `oneOf`, `allOf` with `$ref`, recursion, open maps and a cross-document `$ref` (§2.6). OpenAI strict mode, Anthropic strict tool use and Gemini `parameters` each reject some of these. OpenAI and Anthropic document no subset for non-strict tools. Gemini documents no subset for `parametersJsonSchema`. Its only JSON Schema keyword list belongs to the deprecated `GenerationConfig._responseJsonSchema` field and omits `allOf`. The rule therefore meets its stated purpose only for non-strict OpenAI and Anthropic tools (§6 Q3, Q4).
2. **The flat-schema rule has two scopes.** `docs/ARCHITECTURE.md:1473` applies it to "Schemas" inside §17.3, which covers the catalogs and the tools. `docs/PRD.md:898` and `docs/plans/01-plan-core-primitives.md:463` apply it to the frontend-tool schemas. `Catalog.toJson()` always writes `$defs.anyComponent` as a `oneOf` with a `discriminator` (§2.7), and that union is not a common type. The `line` catalog can meet only the narrower reading. This is the evidence R1 §4 asked R3 for, and the scope itself stays open (§6 Q5).
3. **"Descriptions ≤ 1024 chars" is a provider limit for one description only.** `docs/plans/01-plan-core-primitives.md:318` lists it under "provider limits", and `docs/ARCHITECTURE.md:1473` applies it to "every description". No provider documents a 1024-character limit (§2.6). Community error reports show OpenAI's API rejecting a function description over 1024 characters, and they are the only source. No source limits property descriptions. As a self-imposed cap the rule conflicts with no provider.

This note changes three first-wave and prior facts.

- R5 §4 (`01-research-mcp-apps.md:245`) says "With either 2.x entry it carries two Zod copies [INFERENCE …]". Measured under Bun 1.4.3, the count is 2 to 4 (§2.3). It is 4 with the main entry under a root Zod 3, 2 with `./app-with-deps` under a root Zod 3, and 3 with either entry under a root Zod 4.
- R1 §2.3 gives Bun weights and leaves the real build to R2 and R9. Vite 8.3.4 gives 53,991 B gzipped for the same `Catalog` plus four common types under a root Zod 3, and 67,982 B under a root Zod 4 (§2.3). This adds a figure and changes none.
- `docs/research/00-research-generative-ui.md:205` says "line://ui and `web_core` both declare `zod ^3.25.76`, so the descriptors share types with `web_core` directly". That holds for the Zod 3 API only, and not for the `zod/v4` API that the same install exports (§2.2). The note sits outside the hierarchy and is listed for completeness.

## 6. Open questions for the spec

1. **Which Zod API do descriptors use?**
   - (a) Stay on Zod 3. The repo stays on `zod ^3.25.76`, and descriptors import the bare `zod`.
   - (b) Use the `zod/v4` API inside 3.25.76 for descriptors.
   - (c) Move the repo to Zod 4, and have descriptors import `zod/v3` to compose with `web_core`.
   - (d) Move to Zod 4 and stop reusing the `web_core` common types. `line-genui` would own Zod 4 common types and its own emitters.
   - (e) Wait for the upstream schema abstraction (#2160) before choosing.
   - Deciding evidence: (a) is the only option that composes and type-checks today (§2.2), but it rests on a line with no release since 2025-07-08 and on a deprecated JSON Schema bridge (§2.1). (b) cannot hold the common types (V2) and silently empties the catalog (V3). (c) runs but fails `tsc` with TS2589, and puts two Zod 3 builds in the bundle (§2.2, §2.3). (d) breaks the ARCHITECTURE §17.3 reuse rule, and `toJson()` and the binder see no props (V3). (e) has no date (§2.3). Two further facts bear on (c) and (d). `line-schemas` publishes bare-`zod` Zod 3 schemas, so they would change API under a root Zod 4. Zod 4 also attempts `new Function` under CSP (§2.1).
2. **Which path emits the frontend-tool parameters?**
   - Options: `zod-to-json-schema` on Zod 3; `Catalog.toJson()` per component with the common types bundled locally; native `z.toJSONSchema` (needs Zod 4 types).
   - Deciding evidence: §2.5 table (deprecation, leaked `REF:` markers, pointer `$ref`s, external refs, Ajv strict results, `io` modes); the Q1 choice.
3. **Do frontend tools target strict modes?**
   - Options: (a) non-strict only, keeping the common types; (b) strict for every provider, which rules out `oneOf`, `allOf`, recursion and open maps; (c) a strict variant emitted per provider.
   - Deciding evidence: §2.6 construct table; OpenAI's Responses API falls back to non-strict; Anthropic's caps of 24 optional and 16 union parameters across strict tools; the 16–20 optional parameters in the four probe tools.
4. **Do frontend-tool parameters carry A2UI dynamic types at all?**
   - Options: (a) the same common types as the catalog (`DynamicString` with bindings and function calls); (b) literal types for the controlled tier (`string` for `DynamicString`, no `FunctionCall`); (c) both, chosen per emitter call.
   - Deciding evidence: the controlled tier fills props through a tool call with no A2UI data model (PRD Appendix D, Tiers). §2.6 shows which constructs each strict mode rejects. §2.7 shows that bundled common types make up most of the Button and Icon tool weight.
5. **What does the flat-schema rule cover?** (needs a plan and PRD revision, §5 item 2)
   - Options: (a) frontend-tool schemas only, as PRD §7.3 and plan §7.2 word it; (b) catalogs too, as ARCHITECTURE §17.3 words it.
   - Deciding evidence: `toJson()` always writes `anyComponent` as `oneOf` plus `discriminator` (§2.7); the A2UI catalog format requires common-type `$ref`s (R1 §2.4.1).
6. **How do descriptors attach descriptions?** (extends R1 §6 Q6)
   - Options: (a) component description through `spec(…, { mixins })` and the basic-catalog layout; (b) a line `REF:`-aware helper for common types; (c) plain `.describe()`, which accepts an inline `oneOf`.
   - Deciding evidence: §2.4 (`toJson()` drops a component-level description without mixins); R1 §2.4.3 (helper bug, `.describe()` inlining); §2.5 (the `REF:` leak through `zod-to-json-schema`).
7. **Which tool-name pattern and size budget apply?**
   - Options: name pattern `^[a-zA-Z0-9_-]{1,64}$` or a provider-specific one; a per-descriptor token budget, or none.
   - Deciding evidence: §2.6 name rules; §2.7 weights (73–778 tokens per tool, about 211 tokens per full 1024-character description, 547 tokens for the four-component catalog plus 1,298 for unpruned common types).

## 7. Sources

All retrieved 2026-10-19.

Zod
- npm registry, `zod` (`dist-tags`, `time`, `exports`): https://www.npmjs.com/package/zod
- Versioning: https://zod.dev/v4/versioning
- Library authors: https://github.com/colinhacks/zod/blob/main/packages/docs/content/library-authors.mdx
- JSON Schema (source at `cc4cd4e`, 2026-09-13): https://github.com/colinhacks/zod/blob/main/packages/docs/content/json-schema.mdx
- `z.compile` and CSP: https://github.com/colinhacks/zod/blob/main/packages/docs/content/compile.mdx
- Zod 4.6 announcement: https://github.com/colinhacks/zod/blob/main/packages/docs/content/blog/zod-4-6.mdx
- `zod-to-json-schema` (README, deprecation notice): https://www.npmjs.com/package/zod-to-json-schema

A2UI
- npm registry, `@a2ui/web_core` 0.14.0 (tarball `src/catalog/types.d.ts`, `src/catalog/spec_annotations.d.ts`, `src/v0_9/schemas/common_types.json`): https://www.npmjs.com/package/@a2ui/web_core
- Repository at `main` `cbaa5ee` (2026-10-17): https://github.com/a2ui-project/a2ui
- Issue #1222: https://github.com/a2ui-project/a2ui/issues/1222
- Issue #1263: https://github.com/a2ui-project/a2ui/issues/1263
- Issue #2002: https://github.com/a2ui-project/a2ui/issues/2002
- Issue #2160: https://github.com/a2ui-project/a2ui/issues/2160
- Issue #2901: https://github.com/a2ui-project/a2ui/issues/2901
- PR #2135: https://github.com/a2ui-project/a2ui/pull/2135
- PR #2753: https://github.com/a2ui-project/a2ui/pull/2753
- PR #3167: https://github.com/a2ui-project/a2ui/pull/3167

MCP and AG-UI
- npm registry, `@modelcontextprotocol/ext-apps` 2.0.3: https://www.npmjs.com/package/@modelcontextprotocol/ext-apps
- npm registry, `@modelcontextprotocol/client` 2.3.1: https://www.npmjs.com/package/@modelcontextprotocol/client
- npm registry, `@ag-ui/core` 1.0.3 (`dist/schemas.mjs`, `ToolSchema`): https://www.npmjs.com/package/@ag-ui/core
- AG-UI tools: https://docs.ag-ui.com/concepts/tools

Providers
- OpenAI Structured Outputs, "Supported schemas": https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI function calling, "Strict mode": https://developers.openai.com/api/docs/guides/function-calling
- OpenAI OpenAPI spec at `33248a6` (`FunctionObject`, `FunctionTool`): https://github.com/openai/openai-openapi/blob/main/openapi.yaml
- OpenAI community, function description limit (2023-12-19): https://community.openai.com/t/function-call-description-max-length/529902
- OpenAI community, `string_above_max_length` error (2024-12-30): https://community.openai.com/t/improve-tool-schema-documentation/1075387
- Anthropic, define tools: https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
- Anthropic, structured outputs ("JSON Schema limitations", "Schema complexity limits"): https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- Anthropic, Messages API reference (`Tool.name`, `input_schema`): https://platform.claude.com/docs/en/api/messages/create
- Gemini, function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Gemini API reference, `FunctionDeclaration`, `Schema` and `GenerationConfig._responseJsonSchema` (deprecated, "Use `responseFormat` instead"; the only JSON Schema keyword list): https://ai.google.dev/api/generate-content
- Gemini, structured output ("JSON schema support"; lists types and keywords without `$ref`, `oneOf` or `allOf`): https://ai.google.dev/gemini-api/docs/structured-output

Prior art
- Vercel AI SDK `tool()`: https://ai-sdk.dev/docs/reference/ai-sdk-core/tool
- npm registry, `@ai-sdk/provider-utils` 5.0.62: https://www.npmjs.com/package/@ai-sdk/provider-utils
- CopilotKit frontend tools: https://docs.copilotkit.ai/frontend-tools
- json-render catalog: https://json-render.dev/docs/catalog

Tooling
- `gpt-tokenizer` 4.1.0 (o200k_base): https://www.npmjs.com/package/gpt-tokenizer
- Ajv 8.20.0: https://ajv.js.org/
- Vite 8.3.4: https://www.npmjs.com/package/vite
