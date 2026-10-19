import type { SurfaceModel } from '@a2ui/web_core/v0_9';
import { type A2uiErrorMessage, type Session, toA2uiError } from './session.ts';

export type Loader = () => Promise<unknown>;

/** The live-region texts the screen-reader script expects (README). */
export const ANNOUNCE_UPDATED = 'Content updated.';
export const ANNOUNCE_ERROR = 'Some content could not be shown.';

/** Creates the inert element that stands in for a node the surface cannot render. */
export function placeholder(reason: string, componentId: string): HTMLElement {
  const el = document.createElement('div');
  el.dataset.lineA2uiPlaceholder = reason;
  el.dataset.a2uiId = componentId;
  el.inert = true;
  return el;
}

/**
 * Behaviour both techniques share (ARCHITECTURE §17.4): light DOM, one live region, `aria-busy` per batch, lazy
 * loading per type, errors as `line-a2ui-error`, actions as `line-a2ui-action`, and required button names. The
 * subclass owns the projection.
 */
export abstract class SurfaceBase extends HTMLElement {
  readonly live = document.createElement('div');
  readonly root = document.createElement('div');
  readonly busyLog: string[] = [];
  #session: Session | undefined;
  #pending = new Set<Promise<unknown>>();
  #loaded = new Set<string>();
  #named = new WeakSet<Element>();
  #batchErrors = 0;
  #announceTimer: number | undefined;

  /** Returns the lazy loader for a component type of a catalog, or nothing for native types. */
  protected abstract loaderFor(catalogId: string, type: string): Loader | undefined;
  protected abstract attachSurface(surface: SurfaceModel): void;
  /** Resolves when the technique has flushed its pending renders. */
  protected abstract flush(): Promise<void>;

  connectedCallback() {
    if (this.live.isConnected) return;
    this.live.dataset.lineA2uiLive = '';
    this.live.setAttribute('role', 'status');
    this.live.setAttribute('aria-live', 'polite');
    this.live.style.cssText =
      'position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    this.root.dataset.lineA2uiRoot = '';
    this.root.setAttribute('aria-busy', 'false');
    this.append(this.live, this.root);
  }

  get surfaceId(): string {
    return this.getAttribute('surface-id') ?? '';
  }

  set session(session: Session) {
    this.#session = session;
    session.onError((message) => this.reportError(message));
    session.onAction((message) =>
      this.dispatchEvent(new CustomEvent('line-a2ui-action', { detail: message, bubbles: true, composed: true })),
    );
    session.onSurface((surface) => {
      if (surface.id !== this.surfaceId) return;
      const catalogId = surface.catalog?.id ?? '';
      for (const model of surface.componentsModel.values) this.load(catalogId, model.type);
      surface.componentsModel.onCreated.subscribe((model) => this.load(catalogId, model.type));
      this.attachSurface(surface);
    });
  }

  get session(): Session | undefined {
    return this.#session;
  }

  /** Feeds one batch of messages, holding `aria-busy` until the projection settles. */
  async feed(messages: unknown[]): Promise<void> {
    this.#batchErrors = 0;
    this.root.setAttribute('aria-busy', 'true');
    this.busyLog.push('true');
    const before = this.root.innerHTML;
    this.#session?.process(messages, this.surfaceId);
    await this.settle();
    this.checkNames();
    this.root.setAttribute('aria-busy', 'false');
    this.busyLog.push('false');
    if (this.#batchErrors > 0) this.announce(ANNOUNCE_ERROR);
    else if (this.root.innerHTML !== before) this.announce(ANNOUNCE_UPDATED);
  }

  async settle(): Promise<void> {
    while (this.#pending.size > 0) await Promise.all([...this.#pending]);
    await this.flush();
    const frame = Promise.withResolvers<number>();
    requestAnimationFrame(frame.resolve);
    await frame.promise;
  }

  reportError(message: A2uiErrorMessage) {
    this.#batchErrors++;
    this.dispatchEvent(new CustomEvent('line-a2ui-error', { detail: message, bubbles: true, composed: true }));
  }

  /** Reports an error thrown inside the projection itself. */
  reportThrown(err: unknown, extra: Record<string, unknown>) {
    this.reportError(toA2uiError(err, this.surfaceId, extra));
  }

  protected load(catalogId: string, type: string) {
    const key = `${catalogId}#${type}`;
    if (this.#loaded.has(key)) return;
    this.#loaded.add(key);
    const loader = this.loaderFor(catalogId, type);
    if (!loader) return;
    const promise = loader().catch((err) => this.reportThrown(err, { source: 'load', type }));
    this.#pending.add(promise);
    promise.finally(() => this.#pending.delete(promise));
  }

  // Required names (§17.4): a button whose text, label and labelled icon are all empty raises an error once.
  protected checkNames() {
    for (const button of this.root.querySelectorAll('line-button')) {
      if (this.#named.has(button)) continue;
      const name =
        button.getAttribute('aria-label') ||
        button.textContent?.trim() ||
        button.querySelector('line-icon[aria-label]')?.getAttribute('aria-label');
      if (name) continue;
      this.#named.add(button);
      const componentId = button.closest('[data-a2ui-id]')?.getAttribute('data-a2ui-id') ?? '';
      this.reportError({
        version: 'v0.9.1',
        error: {
          code: 'MISSING_ACCESSIBLE_NAME',
          surfaceId: this.surfaceId,
          message: `Button '${componentId}' has no accessible name.`,
          componentId,
        },
      });
    }
  }

  // Clearing first lets the same text announce again.
  protected announce(text: string) {
    clearTimeout(this.#announceTimer);
    this.live.textContent = '';
    this.#announceTimer = window.setTimeout(() => {
      this.live.textContent = text;
    }, 100);
  }
}
