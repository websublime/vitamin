import { LineElement } from '@websublime/line-core';
import { css, html } from 'lit';

// A few stroke paths stand in for a `line-icons` resolver (R10 owns the real mapping).
const PATHS: Record<string, string> = {
  check: 'M5 12l5 5 9-9',
  close: 'M6 6l12 12M18 6L6 18',
  mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
  send: 'M3 20l18-8L3 4v6l12 2-12 2z',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z',
};
const FALLBACK = 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18';

/**
 * Throwaway `<line-icon>` for the R2 spike. It is not the Phase 1 component.
 *
 * A labelled icon exposes `role="img"` with the label as its name. An unlabelled icon is hidden from assistive
 * technology.
 *
 * @summary Inline SVG icon by name.
 * @csspart svg - The SVG element.
 */
export class LineIcon extends LineElement {
  static properties = {
    name: { reflect: true },
    label: {},
  };

  static styles = css`
    :host {
      display: inline-block;
      inline-size: 1em;
      block-size: 1em;
      line-height: 0;
    }
    svg {
      inline-size: 100%;
      block-size: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }
  `;

  declare name: string | undefined;
  declare label: string | undefined;

  updated() {
    if (this.label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    }
  }

  render() {
    const d = PATHS[this.name ?? ''] ?? FALLBACK;
    return html`<svg part="svg" viewBox="0 0 24 24" aria-hidden="true"><path d=${d}></path></svg>`;
  }
}

customElements.define('line-icon', LineIcon);
