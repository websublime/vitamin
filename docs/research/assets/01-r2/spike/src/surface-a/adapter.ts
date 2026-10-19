import { A2uiLitElement } from '@a2ui/web_core/v0_9/universal';
import { html, nothing, type TemplateResult } from 'lit';
import type { SurfaceBase } from '../surface-base.ts';

/** Adapter nesting limit. A self-referencing component stops here when no `validationConfig` catches the cycle. */
export const MAX_DEPTH = 32;

/** Set by the harness for the shadow-root control of the `::part()` check. */
export const adapterOptions = { shadow: false };

type Props = Record<string, unknown>;
type ChildRef = string | { id?: string; componentId?: string; basePath?: string } | undefined;

/**
 * Base of every technique (a) adapter. It renders into its own light DOM, because `A2uiLitElement` defaults to a
 * shadow root that document `::part()` rules cannot cross (R1 §2.5.3). Each subclass renders one `line-*` element or
 * native element and its children through `renderA2uiNode`.
 */
export class LineA2uiAdapter extends A2uiLitElement<never> {
  depth = 0;
  #reported = new Set<string>();

  createRenderRoot() {
    return adapterOptions.shadow ? super.createRenderRoot() : this;
  }

  get props(): Props {
    return (this.controller?.props ?? {}) as Props;
  }

  get componentId(): string {
    return this.context?.componentModel?.id ?? '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.dataset.lineA2uiAdapter = '';
    const parent = this.parentElement?.closest<LineA2uiAdapter>('[data-line-a2ui-adapter]');
    this.depth = (parent?.depth ?? 0) + 1;
  }

  willUpdate(changed: Map<PropertyKey, unknown>) {
    super.willUpdate(changed as never);
    this.dataset.a2uiId = this.componentId;
  }

  // Lit renders asynchronously, so a throw here never reaches the surface's try/catch around `processMessages`.
  protected performUpdate() {
    try {
      super.performUpdate();
    } catch (err) {
      this.surface?.reportThrown(err, { source: 'adapter', componentId: this.componentId });
      const failed = document.createElement('div');
      failed.dataset.lineA2uiPlaceholder = 'error';
      failed.inert = true;
      this.replaceChildren(failed);
    }
  }

  get surface(): SurfaceBase | undefined {
    return this.closest<SurfaceBase>('line-a2ui-surface') ?? undefined;
  }

  /** Renders a child reference, or an inert placeholder for an unknown type or a runaway depth. */
  protected child(ref: ChildRef): TemplateResult | typeof nothing | unknown {
    const id = typeof ref === 'object' ? (ref.id ?? ref.componentId) : ref;
    const model = id ? this.context?.dataContext?.surface?.componentsModel?.get(id) : undefined;
    if (!(id && model)) return nothing;
    if (!model.catalog.components.get(model.type)?.tagName) {
      return this.failed(id, 'unknown-type', 'UNKNOWN_COMPONENT_TYPE', `Component '${id}' has unknown type.`);
    }
    if (this.depth >= MAX_DEPTH) {
      return this.failed(id, 'depth', 'DEPTH_LIMIT', `Component '${id}' exceeds depth ${MAX_DEPTH}.`);
    }
    return this.renderNode(ref as never);
  }

  protected failed(id: string, reason: string, code: string, message: string) {
    if (!this.#reported.has(id)) {
      this.#reported.add(id);
      this.surface?.reportError({
        version: 'v0.9.1',
        error: { code, surfaceId: this.surface?.surfaceId ?? '', message, componentId: id },
      });
    }
    return html`<div data-line-a2ui-placeholder=${reason} data-a2ui-id=${id} inert></div>`;
  }

  /** `aria-label` and `aria-description` from the A2UI `accessibility` prop. */
  protected get a11y(): { label: string | typeof nothing; description: string | typeof nothing } {
    const value = this.props.accessibility as Props | undefined;
    return {
      label: typeof value?.label === 'string' && value.label ? value.label : nothing,
      description: typeof value?.description === 'string' && value.description ? value.description : nothing,
    };
  }

  // The adapter host is the flex item, unless the page gives adapters `display: contents`, so weight goes on both.
  protected get flex(): string {
    return typeof this.props.weight === 'number' ? `flex-grow:${this.props.weight}` : '';
  }

  updated() {
    this.style.flexGrow = typeof this.props.weight === 'number' ? String(this.props.weight) : '';
  }
}

/** The stable key upstream uses for child lists (`List.js` `getChildKey`). */
export function childKey(child: ChildRef): string {
  return typeof child === 'object' ? `${child.basePath ?? ''}/${child.id}` : String(child);
}
