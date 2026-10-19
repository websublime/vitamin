import { LineElement } from '@websublime/line-core';
import { css, html, nothing } from 'lit';

/**
 * Throwaway `<line-button>` for the R2 spike. It is not the Phase 1 component.
 *
 * @summary Native button with prefix and label slots.
 * @slot - Label content.
 * @slot prefix - Leading content, such as an icon.
 * @csspart root - The native button.
 * @csspart label - The label wrapper.
 */
export class LineButton extends LineElement {
  static properties = {
    variant: { reflect: true },
    label: { attribute: 'aria-label' },
  };

  static styles = css`
    :host {
      display: inline-block;
    }
    [part='root'] {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      inline-size: 100%;
      font: inherit;
    }
  `;

  declare variant: string | undefined;
  declare label: string | undefined;

  // The host keeps `aria-label` for consumers, and the inner button carries the name (ARCHITECTURE §17.2 C5).
  render() {
    return html`<button part="root" type="button" aria-label=${this.label ?? nothing}>
      <slot name="prefix"></slot><span part="label"><slot></slot></span>
    </button>`;
  }
}

customElements.define('line-button', LineButton);
