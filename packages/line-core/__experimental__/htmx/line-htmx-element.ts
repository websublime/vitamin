import type { PropertyValues } from 'lit';
import type { LineElement } from '../../src/line-element.js';

/**
 * Generic constructor type used for Lit mixin composition.
 * Matches the shape declared in spec §6.D.5.
 */
// biome-ignore lint/complexity/noBannedTypes: `{}` is the conventional mixin base constraint.
// biome-ignore lint/suspicious/noExplicitAny: spec §6.D.5 mandates `any[]` for the mixin constructor signature.
type Constructor<T = {}> = new (...args: any[]) => T;

/** Settle events of htmx 2 (`htmx:afterSettle`) and htmx 4 (`htmx:after:settle`). */
export const HTMX_SETTLE_EVENTS = ['htmx:afterSettle', 'htmx:after:settle'] as const;

/** Host attributes the mixin copies into the shadow root. */
export const HTMX_FORWARDED_ATTRIBUTES = ['hx-headers'] as const;

/** Marks the one shadow element that receives the forwarded host attributes. */
export const HTMX_FORWARD_TARGET = 'data-line-htmx-forward';

/** The slice of the page's htmx global, 2.x or 4.x, that the mixin calls. */
export interface HtmxApi {
  readonly version: string;
  process(root: Element | ShadowRoot): void;
}

/** Narrows the page's `htmx` global, which is `undefined` until the htmx script runs. */
export function isHtmx(value: unknown): value is HtmxApi {
  return (
    typeof value === 'object' &&
    value !== null &&
    'process' in value &&
    typeof value.process === 'function' &&
    'version' in value &&
    typeof value.version === 'string'
  );
}

/** Public surface `HtmxElement` adds to an element. */
export interface HtmxElementMembers {
  /**
   * Called after an htmx swap settles on the host or inside its shadow root,
   * once the shadow root is re-processed. A swap that targets the document
   * (`global <selector>`) settles outside the host and does not call it.
   */
  htmxSettledCallback?(event: Event): void;
}

/**
 * HtmxElement mixin (H1 spike, spec §6.H.1). Wires a `LineElement` shadow root
 * to the page's htmx, 2.x or 4.x.
 *
 * - Processes the shadow root in `updated()`, after every render. Lit renders
 *   after `connectedCallback`, so the shadow root is empty there (AM-059).
 * - Re-processes on both majors' settle events through one handler per
 *   instance, added on connect and removed on disconnect (AM-059, AM-060).
 * - Copies each host attribute in `HTMX_FORWARDED_ATTRIBUTES` onto the shadow
 *   element marked `data-line-htmx-forward`. htmx 2 inherits it implicitly,
 *   and htmx 4 only through the `:inherited` suffix, so the copy is named
 *   `hx-headers` under htmx 2 and `hx-headers:inherited` under htmx 4.
 *
 * Experimental. Excluded from the build and from `exports` (spec D6).
 */
export function HtmxElement<T extends Constructor<LineElement>>(Base: T): T & Constructor<HtmxElementMembers> {
  class HtmxLineElement extends Base {
    #onSettle = (event: Event): void => {
      this.#process();
      this.htmxSettledCallback?.(event);
    };

    #hostObserver = new MutationObserver(() => this.#forward());

    htmxSettledCallback?(event: Event): void;

    override connectedCallback(): void {
      super.connectedCallback();
      for (const name of HTMX_SETTLE_EVENTS) {
        this.addEventListener(name, this.#onSettle);
      }
      this.#hostObserver.observe(this, { attributeFilter: [...HTMX_FORWARDED_ATTRIBUTES] });
      if (this.hasUpdated) {
        this.#forward();
      }
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      for (const name of HTMX_SETTLE_EVENTS) {
        this.removeEventListener(name, this.#onSettle);
      }
      this.#hostObserver.disconnect();
    }

    protected override updated(changed: PropertyValues): void {
      super.updated(changed);
      this.#forward();
      this.#process();
    }

    #forward(): void {
      const htmx: unknown = Reflect.get(globalThis, 'htmx');
      const target = this.shadowRoot?.querySelector(`[${HTMX_FORWARD_TARGET}]`);
      if (!(isHtmx(htmx) && target)) {
        return;
      }
      const suffix = Number.parseInt(htmx.version, 10) >= 4 ? ':inherited' : '';
      for (const name of HTMX_FORWARDED_ATTRIBUTES) {
        const value = this.getAttribute(name);
        if (value === null) {
          target.removeAttribute(name + suffix);
        } else {
          target.setAttribute(name + suffix, value);
        }
      }
    }

    #process(): void {
      const htmx: unknown = Reflect.get(globalThis, 'htmx');
      if (this.shadowRoot && isHtmx(htmx)) {
        htmx.process(this.shadowRoot);
      }
    }
  }
  return HtmxLineElement;
}
