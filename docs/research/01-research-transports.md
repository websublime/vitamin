# Research: Agent transports for the Storybook recipes

**Row:** `00-Z35` (Phase 1 plan §5.1 R6)
**Date:** 2026-10-19
**Repo sources:** `docs/plans/01-plan-core-primitives.md` §2.1 item 8, §3, §4.1 G7, §4.4, §5.1 R6, §5.3, §5.5, §6, §7.3; `docs/ARCHITECTURE.md` §17.1, §17.4, §17.5, §17.6, §17.9; `docs/PRD.md` §7.3 items 8 and exit criteria, Appendix D; `docs/research/00-research-generative-ui.md` §2.2, §4.7, §4.8; `apps/storybook/package.json`; `LICENSE`
**Status:** Evidence. Research carries no rules (`docs/PROCESS.md` §1).

> **TL;DR**
>
> - AG-UI 1.0 is a published normative spec, and A2UI travels in `ACTIVITY_SNAPSHOT` events with `activityType: "a2ui-surface"` and `content.a2ui_operations`. `@ag-ui/a2ui-middleware` 0.0.12 also sends lifecycle snapshots (`content.status`) on the same `messageId`, and it has an inbound action channel (`forwardedProps.a2uiAction.userAction`) but no error channel.
> - The middleware is server code. It imports Node `crypto` and depends on CommonJS `clarinet`. jsDelivr cannot bundle it, and esm.sh serves it with a stubbed `crypto` whose `createHash` throws on the action path. A browser recipe uses `@ag-ui/client` against a producer and states the middleware version as the server convention it mirrors.
> - A2A carries A2UI in a `DataPart` whose `metadata.mimeType` is `application/a2ui+json`. Upstream disagrees with itself on the payload shape (an array per part in the extension spec, one message per part in the protocol text and in both reference implementations) and still writes A2A v0.3 shapes, while `@a2a-js/sdk` 1.3.0 speaks A2A v1.0.
> - MCP carries A2UI in a tool result `EmbeddedResource` (`type: "resource"`, `resource.mimeType: "application/a2ui+json"`, JSON in `resource.text`). The upstream guide also reuses MCP Apps' `_meta.ui.resourceUri` key for `a2ui://` templates, which MCP Apps reserves for `ui://` HTML resources.
> - Plain SSE has no upstream A2UI binding (A2UI marks SSE "Proposed"), so the recipe defines its own framing. Native `EventSource` and `fetch` streams need no package.
> - The pins on 2026-10-19 are `@ag-ui/client` 1.0.3 (with `@ag-ui/core`, `@ag-ui/encoder` and `@ag-ui/proto` 1.0.3), `@ag-ui/a2ui-middleware` 0.0.12, `@a2a-js/sdk` 1.3.0, `@modelcontextprotocol/client` 2.3.1 and `eventsource-parser` 4.1.2. All four client packages ran end to end at these versions in headless Chromium 156, loaded from jsDelivr with no local bundler.
> - The middleware's default catalog id differs from the A2UI basic catalog id, so an agent on the AG-UI convention does not render under the `basic` catalog registration that ARCHITECTURE §17.3 describes unless its server sets `defaultCatalogId`.

---

## 1. Question

Plan §5.1 R6 asks for "AG-UI 1.0 and the `@ag-ui/a2ui-middleware` version, A2A DataPart, MCP EmbeddedResource, the pins the recipes will use". The recipes are plan §2.1 item 8 and §4.1 G7 ("recipes pin middleware versions"), and plan §7.3 requires "one recipe per transport (AG-UI, A2A, MCP, SSE)".

1. AG-UI. What is the protocol status, which client packages and versions exist, and how do A2UI messages travel (middleware version, event types, outbound path)?
2. A2A. How does A2UI travel in a `DataPart` (MIME type, metadata), and which SDK and version apply?
3. MCP. How does A2UI travel in an `EmbeddedResource`, and where is the boundary with MCP Apps (R5)?
4. Plain SSE. What does a minimal recipe need?
5. Pins. Which exact versions would a recipe use on 2026-10-19, under which licences, and does each run in a browser without a bundler?
6. Consistency. Do research note 00-Z10 §4.7 and ARCHITECTURE §17 still match upstream?

## 2. Findings

All facts were retrieved on 2026-10-19 unless a row says otherwise. Version histories come from `npm view <pkg> time --json`.

### 2.1 AG-UI

#### Protocol status

- AG-UI 1.0 is a written behavioural spec with a JSON Schema. The spec is authoritative for behaviour and the schema for structure ([spec 1.0](https://docs.ag-ui.com/spec/1.0/index.md)).
- 1.0 makes activity events normative. `ACTIVITY_SNAPSHOT` and `ACTIVITY_DELTA` carry "structured progress" as messages whose content is an object ([key changes](https://docs.ag-ui.com/spec/1.0/changelog.md)).
- `@ag-ui/core` 1.0.3 exports `PROTOCOL_VERSION = "1.0"`, and `HttpAgent` 1.0.3 sends `protocolVersion: "1.0"` in `RunAgentInput` (probe P6).
- The HTTP + SSE binding is mandatory for HTTP implementations. The client POSTs `RunAgentInput` as JSON with `Accept: text/event-stream`, and each SSE `data:` holds exactly one event. The stream has no resumption, and a stream without a terminal event is a truncated run ([HTTP + SSE](https://docs.ag-ui.com/spec/1.0/basic/transports/http-sse.md), [transports](https://docs.ag-ui.com/spec/1.0/basic/transports.md)).
- `forwardedProps` is an application channel. "The protocol attaches no meaning to the payload, and intermediaries MUST NOT alter it" ([run input](https://docs.ag-ui.com/spec/1.0/basic/run-input.md)).
- A consumer MUST strip activity messages from the `messages` it sends back ([activity](https://docs.ag-ui.com/spec/1.0/events/activity.md)).
- The spec says applications "MUST NOT render streamed content as executable markup" ([spec 1.0](https://docs.ag-ui.com/spec/1.0/index.md), Security).
- AG-UI calls itself a user-interaction protocol, not a generative-UI spec, and lists A2UI as one of the specs it carries ([generative UI](https://docs.ag-ui.com/concepts/generative-ui-specs.md)).
- The monorepo releases by date tag; the latest is `release/2026-10-18` (`gh release list -R ag-ui-protocol/ag-ui`).

#### Activity event shape

| Field | `ACTIVITY_SNAPSHOT` | `ACTIVITY_DELTA` |
|---|---|---|
| `messageId` | Required; creates or replaces one activity message | Required; names an existing activity |
| `activityType` | Open string; consumers MUST tolerate unknown values | Required; repeats or retypes |
| Payload | `content: Record<string, any>` | `patch`, an RFC 6902 patch against `content` |
| `replace` | Optional; absent means replace | n/a |

Source: `@ag-ui/core` 1.0.2 `dist/version-*.d.ts` (read before 1.0.3 shipped; P6 exercised the same events on 1.0.3) and the [activity spec](https://docs.ag-ui.com/spec/1.0/events/activity.md).

#### The A2UI middleware convention (`@ag-ui/a2ui-middleware` 0.0.12)

- Published 2026-10-06; the changelog dates it 2026-10-05. 0.0.11 (2026-09-30) moved it onto `@ag-ui/core` 1.0 types. No release followed by 2026-10-19.
- Dependencies are `@ag-ui/a2ui-toolkit` 0.0.5 and `clarinet ^0.12.6`. Peers are `@ag-ui/client >=1.0.0` and `rxjs 7.8.1`.
- The middleware wraps an agent on the server. It injects a `render_a2ui` tool and its usage guide, streams the tool arguments, and emits activity events.
- It exports the constants `A2UIActivityType = "a2ui-surface"` and `A2UI_OPERATIONS_KEY = "a2ui_operations"`.
- Inbound events observed in probe P5 (all `replace: true`, one `messageId` per tool call, `a2ui-surface-<toolCallId>`):

| Order | `content` |
|---|---|
| 1 | `{ "status": "building" }` |
| 2 | `{ "status": "building", "progressTokens": 33 }` |
| 3 | `{ "a2ui_operations": [ { "version": "v0.9", "createSurface": {…} }, { "version": "v0.9", "updateComponents": {…} } ] }` |

- The type declarations document two more lifecycle states, `status: "retrying"` (with `attempt`, `maxAttempts`, `errors`) and `status: "failed"` (with `error`), plus an optional `debugExposure` stamp.
- Every operation carries `"version": "v0.9"`, not `"v0.9.1"`.
- When neither config nor arguments name a catalog, the middleware uses `https://a2ui.org/specification/v0_9/basic_catalog.json`. The A2UI basic catalog's own id is `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json` (`specification/v0_9_1/catalogs/basic/catalog.json`, `catalogId`), and `@a2ui/web_core` 0.13.0 uses the latter. The config field `defaultCatalogId` overrides the default.
- Outbound, the client puts `forwardedProps.a2uiAction.userAction = { name, surfaceId, sourceComponentId, timestamp, context }` on the next run. These are the fields of the A2UI v0.9.1 `action` message body. The middleware turns them into a synthetic `log_a2ui_event` tool call and tool result in the agent's history (probe P5).
- The middleware has no error channel. Its bundle contains no `a2uiError` or `a2ui_error` string.
- The middleware does not run fully in a browser as published.
  - `dist/index.mjs` imports `createHash` and `randomUUID` from Node's `crypto`.
  - `clarinet` 0.12.6 ships CommonJS only, and the middleware's `package.json` has no `exports` field.
  - jsDelivr answers `500 Failed to bundle @ag-ui/a2ui-middleware@0.0.12 as ESM` (probe P8).
  - esm.sh serves it with an `unenv` stub for `crypto`. The render path runs in Chromium, but a run that carries `forwardedProps.a2uiAction` throws `[unenv] crypto.createHash is not implemented yet!` (probe P9).
- The `main` branch README documents an `a2uiGenerationToolNames` option that 0.0.12 does not declare, so `main` is ahead of npm.

#### Client packages

| Package | Version on 2026-10-19 | Published | Licence | Notes |
|---|---|---|---|---|
| `@ag-ui/client` | 1.0.3 | 2026-10-16 | MIT | `HttpAgent`, `AbstractAgent`, `Middleware`; subscriber hooks `onActivitySnapshotEvent`, `onActivityDeltaEvent` |
| `@ag-ui/core` | 1.0.3 | 2026-10-16 | MIT | Types, `EventType`, `PROTOCOL_VERSION` |
| `@ag-ui/encoder`, `@ag-ui/proto` | 1.0.3 | 2026-10-16 | MIT | Pulled in by the client |
| `@ag-ui/a2ui-middleware` | 0.0.12 | 2026-10-06 | MIT | Server only |
| `@ag-ui/a2ui-toolkit` | 0.0.5 | 2026-10-06 | MIT | Middleware dependency |

- 1.0.0 shipped on 2026-09-17. The four `@ag-ui/*` 1.x packages move in lockstep and pin each other exactly.
- `@ag-ui/client` 1.0.3 depends on `zod ^3.25.76`, the same range as the repo, and imports `zod/v4`. It also depends on `rxjs 7.8.1`, `uuid`, `fast-json-patch`, `untruncate-json` and `compare-versions`.
- Adjacent middlewares exist but are not A2UI carriers: `@ag-ui/a2a-middleware` 0.0.6 (2026-10-13), `@ag-ui/mcp-apps-middleware` 0.1.2 (2026-10-08), `@ag-ui/mcp-middleware` 0.0.2.

### 2.2 A2A

#### Protocol and SDK

- A2A protocol v1.0.0 was released on 2026-03-12 and v1.0.1 on 2026-05-28 (`gh release list -R a2aproject/A2A`).
- `@a2a-js/sdk` 1.3.0 (2026-09-29, Apache-2.0) implements A2A v1.0.0 and offers an opt-in v0.3 compatibility layer under `./compat/v0_3/*` (package README). The last 0.3 line release is 0.3.14 (2026-07-09).
- A v1.0 `Part` is a oneof of `text`, `raw`, `url` and `data`, with `metadata`, `filename` and `media_type` (`specification/a2a.proto` at `v1.0.1`). In JSON, v1.0 drops the `kind` discriminator. The spec's migration table lists the current DataPart as `{ "data": {...}, "mediaType": "application/json" }` and the legacy one as `{ "kind": "data", "data": {...} }`.
- The extension activation header is `A2A-Extensions` in v1.0 and was `X-A2A-Extensions` in v0.3 (`docs/topics/extensions.md` at `v1.0.1` and `v0.3.0`).

#### How A2UI travels

The A2UI v0.9.1 A2A extension (`specification/v0_9_1/docs/a2ui_extension_specification.md`, commit `cbaa5ee` of 2026-10-17) sets these rules.

- The extension URI is `https://a2ui.org/a2a-extension/a2ui/v0.9.1`. Agents may advertise it in `AgentCard.capabilities.extensions` with `params.supportedCatalogIds` and `params.acceptsInlineCatalogs`. Activation is optional.
- A part is A2UI when `metadata.mimeType` is `application/a2ui+json`. The prose writes `DataPart.data.metadata["mimeType"]`, but every example puts `metadata` on the part.
- `data` "MUST be an array of messages". Receivers process the list in order, keep going after a failed message, and should not repaint until the list is done.
- Client to server uses the same MIME type, with `[{ "version": "v0.9.1", "action": {…} }]`.
- The client sends `message.metadata.a2uiClientCapabilities` (catalogs per A2UI version) on every message, and `message.metadata.a2uiClientDataModel` when a surface sets `sendDataModel`.
- The examples use A2A v0.3 shapes (`"kind": "data"`, the `X-A2A-Extensions` header).

Upstream practice departs from that text in three ways.

| Source | MIME type | Payload per DataPart | A2A shape |
|---|---|---|---|
| Extension spec v0.9.1 and v1.0 | `application/a2ui+json` | Array of messages | v0.3 examples |
| A2UI protocol v0.9.1, "A2A binding" | n/a | "Each A2UI envelope corresponds to the payload of a single A2A message Part" | n/a |
| `python/a2ui_a2a/src/a2ui/a2a/parts.py` | `application/json+a2ui` for v0.8, v0.9 or no version; `application/a2ui+json` otherwise | One message object | v0.3 (`a2a.types.DataPart`) |
| `samples/agent/node/restaurant_finder/src/a2a.ts` | `application/a2ui+json` | One message object ("one data part per A2UI message") | v0.3 (`kind: 'data'`) |
| `samples/client/lit/shell` | `application/a2ui+json` | Reads parts | `@a2a-js/sdk ^0.3.13` |

Probe P6 shows how `@a2a-js/sdk` 1.3.0 handles the convention on A2A v1.0.

- On the wire, the server sends `{"data":[…],"metadata":{"mimeType":"application/a2ui+json"}}`. The part has no `kind`, and it has no `mediaType` when the SDK value is empty.
- On the client, the SDK hands over `{ content: { $case: "data", value: [...] }, metadata: { mimeType: "application/a2ui+json" }, mediaType: "" }`.
- The client sent `A2A-Version: 1.0` and the method `SendMessage`, and `message.metadata.a2uiClientCapabilities` arrived intact at the executor.
- The v0.3 compat translator keeps `metadata` and sets `mediaType: ""` when it lifts a v0.3 DataPart (`dist/client/index.js`, `toCorePart`).

### 2.3 MCP

#### Protocol and SDK

- The current MCP revision is 2026-07-28 (`schema/2026-07-28/schema.ts`, `LATEST_PROTOCOL_VERSION`). It drops the `initialize` handshake. Clients send capabilities per request in `_meta["io.modelcontextprotocol/clientCapabilities"]`, which has an `extensions` map, and servers MUST implement `server/discover`.
- The `EmbeddedResource` shape is unchanged from 2025-11-25: `{ type: "resource", resource: TextResourceContents | BlobResourceContents, annotations?, _meta? }`.
- The TypeScript SDK v2 splits into `@modelcontextprotocol/client` and `@modelcontextprotocol/server`, both Apache-2.0. v2.0.0 shipped on 2026-07-27, and the README calls v2 "the stable release line". v1 (`@modelcontextprotocol/sdk`, MIT) gets fixes for at least six months after the v2 release.
- `@modelcontextprotocol/client` 2.3.1 (2026-10-05) defaults to `mode: 'legacy'`, the 2025 `initialize` sequence. `mode: 'auto'` probes `server/discover` first. Its `SUPPORTED_PROTOCOL_VERSIONS` list tops out at `2025-11-25` (`@modelcontextprotocol/core` 2.3.1).
- Client 2.3.1 depends on `zod ^4.2.0`, `eventsource`, `eventsource-parser ^3.0.8`, `pkce-challenge`, `jose`, `cross-spawn` (stdio only) and `@modelcontextprotocol/core`. It maps `./_shims` to a browser shim through the `browser` export condition.

#### How A2UI travels

The guide "A2UI over MCP" (`docs/public/guides/a2ui_over_mcp.md`, commit `cbaa5ee`) sets these patterns.

- A tool result carries a fallback `TextContent` plus an `EmbeddedResource`. Its `resource` is a `TextResourceContents` with `mimeType: "application/a2ui+json"`, a URI such as `a2ui://recipe-card/data`, and the JSON array of A2UI messages in `text`.
- The guide's sample splits the layout from the data. It serves the layout (`createSurface`, `updateComponents`) as an MCP resource at `a2ui://…` with the same MIME type, and the tool result carries only an `updateDataModel`. The tool definition and the result both point to the template through `_meta.ui = { resourceUri: "a2ui://…", mimeType: "application/a2ui+json" }`.
- Actions travel as `tools/call` of `a2ui_action` with all five fields `name`, `surfaceId`, `sourceComponentId`, `timestamp` and `context`. The guide tells servers to declare all five so SDKs do not strip them.
- Errors travel as `tools/call` of `a2ui_error` with `code`, `surfaceId`, `path` and `message`.
- The guide offers two places for client capabilities. Option A puts `capabilities.a2ui.clientCapabilities` in `initialize` with `protocolVersion: "2025-11-25"`. Option B sends `_meta.a2ui.clientCapabilities` on each tool call. MCP 2026-07-28 has no `initialize`, so only Option B or an `extensions` entry fits that revision.
- Resource `annotations.audience: ["user"]` hides the JSON from the model.
- The upstream sample serves the deprecated HTTP+SSE MCP transport (`--transport sse`).

Probe P6 ran `@modelcontextprotocol/client` 2.3.1 in Chromium against `@modelcontextprotocol/server` 2.3.1 (`createMcpHandler`). The tool result arrived as `content: [text, resource]` with `resource.mimeType = "application/a2ui+json"`, and an `a2ui_action` call reached the server with all five fields.

#### Boundary with MCP Apps (R5)

- MCP Apps (`io.modelcontextprotocol/ui`, stable spec 2026-01-26) puts a whole HTML View in a sandboxed iframe. A2UI over MCP sends JSON that the host renders. R5 owns MCP Apps, the ext-apps SDK and the theming bridge.
- The two meet at `_meta.ui.resourceUri`. MCP Apps says UI resources "MUST use the `ui://` URI scheme" and the `mimeType` "MUST be `text/html;profile=mcp-app`" (other types reserved), and a host that supports MCP Apps "renders tool results using the specified UI resource". The A2UI guide puts `a2ui://` URIs with `application/a2ui+json` under the same key.
- A2UI also documents the opposite nesting. "A2UI in MCP Apps" runs a renderer inside a View, and "MCP Apps in A2UI" embeds a View in a surface. Research note 00-Z10 §4.8 already places the first case in `line-genui` with no transport code.

### 2.4 Plain SSE

- A2UI has no SSE binding.
  - The transports page lists SSE as "💡 Proposed" and REST as "📋 Planned", and its SSE, WebSocket and HTTP examples are `// TODO` (`docs/public/concepts/transports.md`).
  - The v0.9.1 spec names "SSE with JSON RPC" under "Other transports".
  - The v0.9.1 transport contract asks for ordered delivery, message framing ("newlines in JSONL, WebSocket frames, or SSE events"), a metadata channel for capabilities and `sendDataModel`, and an optional return channel for `action`.
- A minimal recipe therefore defines its own convention. Probe P6 exercised these pieces in Chromium 156 with no package.
  - `EventSource` (GET) receives one A2UI message per `data:` event. `EventSource` reconnects when the server closes the stream, so the recipe needs an end signal. The probe used a named `end` event.
  - `fetch` reads JSONL through `res.body.pipeThrough(new TextDecoderStream())`, splits on `\n` and parses each line. The probe served `Content-Type: application/jsonl`.
  - `fetch` with SSE framing (POST body, custom headers) parses the stream with `eventsource-parser` 4.1.2 `EventSourceParserStream`.
  - The return path is a `fetch` POST of `{ "version": "v0.9", "action": {…} }` or of an `error` message as JSON.
- `EventSource` cannot POST or set headers. Capabilities therefore ride the URL, a cookie or a prior request; with `fetch`, they can ride a header or the body. No upstream convention fixes either.
- `eventsource-parser` 4.1.2 (2026-10-12, MIT) is zero-dependency ESM.

### 2.5 Pins, licences and browser use

All versions are npm `latest` on 2026-10-19 (`npm view --prefer-online`).

| Transport | Package | Pin | Licence | Runs in the browser | Without a bundler |
|---|---|---|---|---|---|
| AG-UI | `@ag-ui/client` | 1.0.3 | MIT | Yes (P6, full run) | Through jsDelivr or esm.sh, or a hand-written import map for about ten bare imports |
| AG-UI | `@ag-ui/a2ui-middleware` | 0.0.12 | MIT | Render path only, under esm.sh's `crypto` stub; the action path throws (P9) | jsDelivr cannot bundle it (P8) |
| A2A | `@a2a-js/sdk` (`/client`) | 1.3.0 | Apache-2.0 | Yes for text and data parts (P6); bare `Buffer` calls sit on the raw-file paths; `engines.node >=20` | Through jsDelivr or esm.sh; one bare import (`jose`) |
| MCP | `@modelcontextprotocol/client` | 2.3.1 | Apache-2.0 | Yes (P6, full run) | Through jsDelivr; esm.sh's build throws `t.lazy is not a function` |
| MCP (v1 line) | `@modelcontextprotocol/sdk` | 1.32.1 | MIT | Not probed | Not probed |
| SSE | none (native `EventSource`, `fetch`) | n/a | n/a | Yes | Yes |
| SSE | `eventsource-parser` (optional) | 4.1.2 | MIT | Yes | Yes (both CDNs; zero dependencies) |

- `@ag-ui/*` 1.0.3 shipped on 2026-10-16 and replaced 1.0.2 (2026-10-05). Every other pin is older than 2026-10-13. The probes ran on 1.0.3, and an earlier run on 1.0.2 gave the same results.
- esm.sh returned `500 … no space left on device` for `@ag-ui/a2ui-middleware` and `@a2a-js/sdk/client` on the first run. Both URLs served on the rerun, so that failure was a CDN outage.
- Storybook in this repo builds with Vite and deploys static files to Cloudflare Pages (`CLAUDE.md` Tech Stack). The "without a bundler" column therefore matters for consumer snippets, not for the Storybook build.
- The repo is MIT (`LICENSE`). MIT and Apache-2.0 dev dependencies of a private app need no relicensing.
- `@a2ui/web_core` moved from 0.13.0 (2026-10-09) to 0.14.0 (2026-10-17). R1 owns that pin.

## 3. Probes

All probes ran on 2026-10-19 in `mktemp -d` directories with `HOME=<tmpdir>` for `bun` and `npm`. The directories were deleted afterwards. P4–P6 ran twice, first with `@ag-ui/*` 1.0.2 and then with 1.0.3. The table records the 1.0.3 run; P6a and P7 come from the first run.

| Id | Command | Exit | Observed |
|---|---|---|---|
| P1 | `npm view <pkg> version license --prefer-online` for 12 packages; `dist-tags --json` for 18 on the first run | 0 | Versions and licences in §2.5 |
| P2 | `npm view <pkg> time --json` for 13 packages | 0 | Dates in §2.1–§2.5 |
| P3 | `npm pack` of 12 tarballs and `tar -xzf` | 0 | Type declarations, `package.json` and bundles read in §2 |
| P4 | `bun add @ag-ui/client@1.0.3 @ag-ui/core@1.0.3 @ag-ui/a2ui-middleware@0.0.12 rxjs@7.8.1 @a2a-js/sdk@1.3.0 express@5.3.0 @modelcontextprotocol/client@2.3.1 @modelcontextprotocol/server@2.3.1 @modelcontextprotocol/node@2.1.1 eventsource-parser@4.1.2 zod@4` (Bun 1.4.3) | 0 | 101 packages installed; `@ag-ui/client` and `@ag-ui/core` resolved to 1.0.3 |
| P5 | `bun run probe-a-middleware.ts`: an `AbstractAgent` stub emits a `render_a2ui` tool call, wrapped by `new A2UIMiddleware({ injectA2UITool: true })`, run with `forwardedProps.a2uiAction.userAction` | 0 | Three `ACTIVITY_SNAPSHOT` events (§2.1 table); tools injected `["render_a2ui"]`; the action became a `log_a2ui_event` tool call and a tool result |
| P6 | `node browser.mjs`: Playwright 1.64.0, headless Chromium 156.0.8078.4, against a local Express 5.3.0 server on Bun with an AG-UI SSE producer, an `@a2a-js/sdk` 1.3.0 JSON-RPC server, an MCP 2.3.1 `createMcpHandler` endpoint and plain SSE/JSONL routes; clients loaded from jsDelivr | 0 | AG-UI 1.0.3: `onActivitySnapshotEvent` saw `status` then `a2ui_operations`, and the server received `forwardedProps.a2uiAction` and `protocolVersion: "1.0"`. A2A: `SendMessage` returned a data part with `metadata.mimeType`, and the capabilities metadata reached the executor. MCP: `[text, resource]` with `application/a2ui+json`, and `a2ui_action` received all five fields. SSE, `eventsource-parser` and POST passed. JSONL failed once with `TypeError: Failed to fetch` and passed on two reruns. Imports: §2.5 |
| P6a | First run of P6 (1.0.2), before the executor was fixed to publish `{ kind: "message", data }` | 0 (step failed) | `JsonRpcTransportError: Unhandled event kind: undefined`; a probe bug, fixed and rerun |
| P7 | `curl -X POST /a2a` with A2A v1.0 `SendMessage` | 0 | `{"data":[…],"metadata":{"mimeType":"application/a2ui+json"}}` with no `kind` |
| P8 | `curl` of the failing CDN URLs | 0 | jsDelivr `500 Failed to bundle @ag-ui/a2ui-middleware@0.0.12 as ESM` on both runs; esm.sh `500 no space left on device` on the first run only |
| P9 | `node browser2.mjs`: the P5 stub run in Chromium with `@ag-ui/a2ui-middleware` 0.0.12, `@ag-ui/client` 1.0.3 and `rxjs` 7.8.1 from esm.sh | 0 (one step failed) | With `forwardedProps.a2uiAction`, the run throws `[unenv] crypto.createHash is not implemented yet!`. Without it, the run emits `RUN_STARTED`, three `ACTIVITY_SNAPSHOT` events, the tool-call events and `RUN_FINISHED` |

## 4. Fit with line://ui

- ARCHITECTURE §17.1 and §17.5 ("The app owns the transport … ships no transport code") hold. Every transport in the probes delivered plain A2UI messages inbound and took an A2UI `action` body outbound, which is the interface §17.4 gives `<line-a2ui-surface>` (messages in, `line-a2ui-action` and `line-a2ui-error` out). The probes did not render a surface. No transport import needs to enter `line-genui`, `line-core` or `line-components`.
- Plan §3 ("Transport code stays out") holds if the packages in §2.5 stay dev dependencies of `apps/storybook` or CDN imports in MDX snippets, never dependencies of a published package.
- Law 6 is unaffected because the recipes add no bytes to published packages.
- The AG-UI spec's ban on rendering streamed content as executable markup matches §17.4's plain-text default and the §17.8 rejection of model-authored `<line-*>` markup.
- The AG-UI lifecycle snapshots (`status: building | retrying | failed`) map naturally onto §17.4's `aria-busy` during batches. The spec decides whether the recipe shows that mapping (§6 Q7).
- The middleware's catalog id default touches §17.3 and §17.9 ("advertise the basic catalog id by default"). §5.1 item 3 states the mismatch.
- MCP SDK v2 brings `zod ^4.2.0` into `apps/storybook`, beside the repo's `zod ^3.25.76` (plan §5.3, §8 Zod risk). The split stays inside a private app and does not touch the descriptor-sharing question R3 covers.
- PRD §1.7 CDN delivery and plan P6 concern line packages. The CDN results here concern third-party clients and are evidence only for recipe snippets.

## 5. Contradictions

Three findings contradict ARCHITECTURE as written. Five more show ARCHITECTURE, the plan or research note 00-Z10 as less precise or less current than upstream without contradicting it.

### 5.1 Contradictions

1. **AG-UI has no error channel.** `docs/ARCHITECTURE.md:1506` says `line-a2ui-error` "carries an A2UI `error` message" and gives the reason "The app sends both through its transport". `docs/ARCHITECTURE.md:1524` lists only `forwardedProps.a2uiAction` as the AG-UI outbound path, and `@ag-ui/a2ui-middleware` 0.0.12 defines no error path (§2.1). Under the convention §17.5 names, an app cannot send the error message through AG-UI. Research note 00-Z10 §4.7 (`docs/research/00-research-generative-ui.md:283`) carries the same row.
2. **A2A payload shape.** `docs/ARCHITECTURE.md:1525` says a "DataPart with `mimeType: application/a2ui+json` holding an array of messages". The A2UI extension spec agrees, but the A2UI v0.9.1 protocol text and both reference implementations put one message object in each DataPart, and the Python implementation still emits the deprecated `application/json+a2ui` for v0.8 and v0.9 (§2.2). A recipe built to the ARCHITECTURE row rejects what upstream agents send today. Research note 00-Z10 §4.7 (`docs/research/00-research-generative-ui.md:284`) carries the same row.
3. **Basic catalog id on AG-UI.** `docs/ARCHITECTURE.md:1472` says the `basic` catalog "registers line components under the A2UI basic catalog id, so agents that know only the basic catalog render with line://ui". The A2UI basic catalog id is `https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json` (`specification/v0_9_1/catalogs/basic/catalog.json`, `catalogId`; also the id `@a2ui/web_core` 0.13.0 uses). `@ag-ui/a2ui-middleware` 0.0.12 falls back to `https://a2ui.org/specification/v0_9/basic_catalog.json` when neither its config nor the tool arguments name a catalog, and P5 observed that id in `createSurface` (§2.1). An agent on the AG-UI convention that §17.5 (`docs/ARCHITECTURE.md:1524`) names therefore does not render under that registration unless its server sets `defaultCatalogId`.

### 5.2 Precision gaps (no contradiction)

- `docs/ARCHITECTURE.md:1525` writes `mimeType` without saying where it sits. Upstream puts it in the part's `metadata`, while A2A v1.0 also has a top-level `mediaType` that A2UI does not use. The upstream examples are A2A v0.3 shapes, and `@a2a-js/sdk` 1.3.0 is A2A v1.0.
- `docs/ARCHITECTURE.md:1526` describes only the tool-result `EmbeddedResource`. The upstream guide's main pattern splits the layout into an `a2ui://` resource that `_meta.ui.resourceUri` points to, and that key collides with MCP Apps (§2.3).
- `docs/ARCHITECTURE.md:1527` gives "JSONL" as the inbound framing for SSE. Over SSE the framing is one message per SSE event, and JSONL applies to `fetch` streams. Upstream has no SSE binding.
- `docs/ARCHITECTURE.md:1529` ("Recipes pin the middleware version") and `docs/plans/01-plan-core-primitives.md:258` (G7 "recipes pin middleware versions") assume a recipe consumes the middleware. The middleware does not run fully in a browser (§2.1), so a browser recipe can pin it only as the documented server convention or in a mock producer that mirrors its output.
- Research note 00-Z10 §2.2 (`docs/research/00-research-generative-ui.md:62`) gives `@ag-ui/client` 1.0.2. That was right on 2026-10-06; 1.0.3 shipped on 2026-10-16.

Research note 00-Z10 §4.7 and ARCHITECTURE §17.5 agree with each other. ARCHITECTURE adds only the words "`@ag-ui/a2ui-middleware` convention" to the AG-UI row.

## 6. Open questions for the spec

| # | Question | Options | Evidence that decides it |
|---|---|---|---|
| Q1 | What does each recipe talk to, given that Storybook is static on Cloudflare Pages? | (a) An in-browser mock producer per transport (a custom `fetch`, an `AbstractAgent` subclass, an in-memory MCP transport); (b) a dev-only local server documented beside the story; (c) both | Whether the plan §7.3 criterion needs a live round trip on the deployed Storybook; P6 shows every client works against a local producer |
| Q2 | Where do the pins live? | (a) `apps/storybook` devDependencies bundled by Vite; (b) CDN URLs with exact versions in MDX snippets; (c) both, with one version source | jsDelivr served all four clients, and esm.sh's MCP client build throws (§2.5); MCP v2 adds Zod 4 to the app |
| Q3 | How does an AG-UI recipe handle `line-a2ui-error`? | (a) An app-defined `forwardedProps` key, documented as non-upstream; (b) log it locally and send nothing; (c) wait for an upstream channel | §5.1 item 1; a later `@ag-ui/a2ui-middleware` release |
| Q4 | Which A2A shapes does the A2A recipe accept and send? | Accept an array or a single object per part; accept `application/json+a2ui`; target A2A v1.0 (`@a2a-js/sdk` 1.3.0) or v0.3 (0.3.14 or the compat layer) as upstream samples do | §5.1 item 2; the A2UI extension spec for v1.0 when it lands |
| Q5 | Which basic catalog id does an AG-UI agent name? | (a) The recipe's server sets `defaultCatalogId` to the A2UI basic catalog id; (b) the `basic` catalog also answers to `…/v0_9/basic_catalog.json`; (c) the recipe uses the `line` catalog id only | §5.1 item 3; ARCHITECTURE §17.9 basic-catalog question |
| Q6 | Which MCP pattern and SDK line does the MCP recipe show? | Tool-result `EmbeddedResource` only, or template plus `_meta.ui` plus `updateDataModel`; capabilities in `_meta.a2ui` or as a 2026-07-28 `extensions` entry; SDK v2 (Apache-2.0, Zod 4) or v1 (MIT) | §2.3; R5 on the `_meta.ui` collision with MCP Apps |
| Q7 | Does the AG-UI recipe show the lifecycle states? | (a) Map `status: building` and `retrying` to `aria-busy` and `failed` to an inert state; (b) ignore any activity content without `a2ui_operations` | §2.1 lifecycle table; §17.4 accessibility rules |
| Q8 | Which envelope versions does the surface accept? | `"v0.9"` (middleware output), `"v0.9.1"`, or both | R1 on `@a2ui/web_core` version handling |
| Q9 | What does the SSE recipe use for its end signal and its capabilities channel? | A named `end` event or a closing message; capabilities in the query string, a header (fetch only) or the first POST | §2.4; no upstream convention exists |

## 7. Sources

All retrieved on 2026-10-19.

AG-UI
- Spec 1.0: https://docs.ag-ui.com/spec/1.0/index.md
- Key changes: https://docs.ag-ui.com/spec/1.0/changelog.md
- Transports: https://docs.ag-ui.com/spec/1.0/basic/transports.md
- HTTP + SSE binding: https://docs.ag-ui.com/spec/1.0/basic/transports/http-sse.md
- Run input: https://docs.ag-ui.com/spec/1.0/basic/run-input.md
- Activity events: https://docs.ag-ui.com/spec/1.0/events/activity.md
- Generative UI specs: https://docs.ag-ui.com/concepts/generative-ui-specs.md
- A2UI middleware source, README and changelog: https://github.com/ag-ui-protocol/ag-ui/tree/main/middlewares/a2ui-middleware
- Releases: https://github.com/ag-ui-protocol/ag-ui/releases
- npm: https://www.npmjs.com/package/@ag-ui/client, https://www.npmjs.com/package/@ag-ui/a2ui-middleware

A2UI (commit `cbaa5ee62c737b50d0695c1e5794d0f648b61dca`, 2026-10-17)
- Transports page: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/docs/public/concepts/transports.md
- v0.9.1 protocol: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v0_9_1/docs/a2ui_protocol.md
- v0.9.1 A2A extension: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v0_9_1/docs/a2ui_extension_specification.md
- v1.0 A2A extension: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v1_0/extensions/a2a/docs/a2ui_extension_specification.md
- Client-to-server schema: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v0_9_1/json/client_to_server.json
- Basic catalog: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/specification/v0_9_1/catalogs/basic/catalog.json
- Python A2A parts: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/python/a2ui_a2a/src/a2ui/a2a/parts.py
- Node agent sample: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/samples/agent/node/restaurant_finder/src/a2a.ts
- Lit shell sample: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/samples/client/lit/shell/client.ts
- A2UI over MCP: https://github.com/a2ui-project/a2ui/blob/cbaa5ee62c737b50d0695c1e5794d0f648b61dca/docs/public/guides/a2ui_over_mcp.md

A2A
- Releases: https://github.com/a2aproject/A2A/releases
- v1.0.1 proto: https://github.com/a2aproject/A2A/blob/v1.0.1/specification/a2a.proto
- v1.0.1 specification: https://github.com/a2aproject/A2A/blob/v1.0.1/docs/specification.md
- Extensions, v1.0.1 and v0.3.0: https://github.com/a2aproject/A2A/blob/v1.0.1/docs/topics/extensions.md, https://github.com/a2aproject/A2A/blob/v0.3.0/docs/topics/extensions.md
- JS SDK: https://github.com/a2aproject/a2a-js, https://www.npmjs.com/package/@a2a-js/sdk

MCP
- Schema 2026-07-28: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2026-07-28/schema.ts
- TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP Apps stable spec: https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx
- npm: https://www.npmjs.com/package/@modelcontextprotocol/client, https://www.npmjs.com/package/@modelcontextprotocol/sdk

SSE
- WHATWG server-sent events: https://html.spec.whatwg.org/multipage/server-sent-events.html
- `eventsource-parser`: https://github.com/rexxars/eventsource-parser

CDNs used in probes
- esm.sh: https://esm.sh
- jsDelivr: https://www.jsdelivr.com
