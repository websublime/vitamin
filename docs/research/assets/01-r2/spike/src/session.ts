import type { Catalog } from '@a2ui/web_core/catalog';
import { MessageProcessor, RELAXED_VALIDATION, STRICT_VALIDATION, type SurfaceModel } from '@a2ui/web_core/v0_9';

export const VERSION = 'v0.9.1';

/** An A2UI v0.9.1 `error` message in its generic form (`client_to_server.json`). */
export interface A2uiErrorMessage {
  version: typeof VERSION;
  error: { code: string; surfaceId: string; message: string; [key: string]: unknown };
}

/** An A2UI v0.9.1 `action` message. */
export interface A2uiActionMessage {
  version: typeof VERSION;
  action: Record<string, unknown>;
}

export type ValidationMode = 'none' | 'relaxed' | 'strict' | Record<string, unknown>;

export interface SessionOptions {
  catalogs: Catalog[];
  validation?: ValidationMode;
}

type Listener<T> = (value: T) => void;

/**
 * Converts anything `web_core` throws into a generic A2UI `error` message. `web_core` errors carry no wire-level
 * JSON Pointer, so the `VALIDATION_FAILED` form is never produced (R1 §2.7, §6 Q9).
 */
export function toA2uiError(err: unknown, surfaceId: string, extra: Record<string, unknown> = {}): A2uiErrorMessage {
  const e = err as { code?: unknown; message?: unknown; name?: unknown };
  const code = typeof e?.code === 'string' && e.code !== 'VALIDATION_FAILED' ? e.code : 'UNKNOWN_ERROR';
  const message = typeof e?.message === 'string' ? e.message : String(err);
  return { version: VERSION, error: { code, surfaceId, message, errorName: String(e?.name ?? 'Error'), ...extra } };
}

// A message that fails before parsing may still name its surface.
function surfaceIdOf(message: unknown): string | undefined {
  if (!message || typeof message !== 'object') return undefined;
  for (const body of Object.values(message)) {
    const id = (body as { surfaceId?: unknown } | null)?.surfaceId;
    if (typeof id === 'string') return id;
  }
  return undefined;
}

/**
 * Wraps one `MessageProcessor`. Each message goes through its own `processMessages` call, so a rejected message
 * drops only itself (R1 §2.7). Nothing thrown by `web_core` leaves this class.
 */
export class Session {
  readonly processor: MessageProcessor;
  #errorListeners = new Set<Listener<A2uiErrorMessage>>();
  #actionListeners = new Set<Listener<A2uiActionMessage>>();
  #surfaceListeners = new Set<Listener<SurfaceModel>>();

  constructor(options: SessionOptions) {
    const mode = options.validation ?? 'relaxed';
    const validationConfig =
      mode === 'none'
        ? undefined
        : mode === 'relaxed'
          ? RELAXED_VALIDATION
          : mode === 'strict'
            ? STRICT_VALIDATION
            : { ...RELAXED_VALIDATION, ...mode };
    this.processor = new MessageProcessor(
      options.catalogs,
      (action) => {
        for (const listener of this.#actionListeners) listener({ version: VERSION, action: { ...action } });
      },
      validationConfig ? { validationConfig } : {},
    );
    this.processor.onSurfaceCreated((surface) => {
      surface.onError.subscribe((payload) => this.emitError(toA2uiError(payload, surface.id, { source: 'onError' })));
      for (const listener of this.#surfaceListeners) listener(surface);
    });
  }

  /** Processes messages one by one and returns how many were applied. */
  process(messages: unknown[], fallbackSurfaceId: string): number {
    let applied = 0;
    for (const message of messages) {
      try {
        this.processor.processMessages(message as never);
        applied++;
      } catch (err) {
        this.emitError(toA2uiError(err, surfaceIdOf(message) ?? fallbackSurfaceId, { source: 'processMessages' }));
      }
    }
    return applied;
  }

  /** Renderer-side API that can throw (R1 §2.7): capabilities. */
  capabilities(versions: string[], fallbackSurfaceId: string): unknown {
    try {
      return this.processor.getClientCapabilities({ versions: versions as never, includeInlineCatalogs: true });
    } catch (err) {
      this.emitError(toA2uiError(err, fallbackSurfaceId, { source: 'getClientCapabilities' }));
      return undefined;
    }
  }

  /** Renderer-side API that can throw (R1 §2.7): the client data model. */
  dataModel(fallbackSurfaceId: string): unknown {
    try {
      return this.processor.getClientDataModel();
    } catch (err) {
      this.emitError(toA2uiError(err, fallbackSurfaceId, { source: 'getClientDataModel' }));
      return undefined;
    }
  }

  emitError(message: A2uiErrorMessage) {
    for (const listener of this.#errorListeners) listener(message);
  }

  onError(listener: Listener<A2uiErrorMessage>) {
    this.#errorListeners.add(listener);
    return () => this.#errorListeners.delete(listener);
  }

  onAction(listener: Listener<A2uiActionMessage>) {
    this.#actionListeners.add(listener);
    return () => this.#actionListeners.delete(listener);
  }

  onSurface(listener: Listener<SurfaceModel>) {
    this.#surfaceListeners.add(listener);
    for (const surface of this.processor.getSurfaces().values()) listener(surface);
    return () => this.#surfaceListeners.delete(listener);
  }
}
