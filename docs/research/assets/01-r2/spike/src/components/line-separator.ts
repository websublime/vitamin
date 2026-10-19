import { LineElement } from '@websublime/line-core';
import { css, html } from 'lit';

/**
 * Throwaway `<line-separator>` for the R2 spike. It is not the Phase 1 component.
 *
 * @summary Horizontal or vertical separator.
 * @csspart root - The visible rule.
 */
export class LineSeparator extends LineElement {
  static properties = {
    orientation: { reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      align-self: stretch;
    }
    [part='root'] {
      block-size: 1px;
      background: currentColor;
    }
    :host([orientation='vertical']) [part='root'] {
      inline-size: 1px;
      block-size: 100%;
    }
  `;

  declare orientation: string | undefined;

  updated() {
    this.setAttribute('role', 'separator');
    this.setAttribute('aria-orientation', this.orientation === 'vertical' ? 'vertical' : 'horizontal');
  }

  render() {
    return html`<div part="root"></div>`;
  }
}

customElements.define('line-separator', LineSeparator);
