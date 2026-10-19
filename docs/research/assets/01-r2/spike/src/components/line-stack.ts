import { LineElement } from '@websublime/line-core';
import { css, html } from 'lit';

/**
 * Throwaway `<line-stack>` for the R2 spike. It is not the Phase 1 component.
 *
 * The host is the flex container, so slotted children are its flex items.
 *
 * @summary Flex stack in one direction.
 * @slot - Stack items.
 * @cssprop --line-stack-gap - Gap between items.
 */
export class LineStack extends LineElement {
  static properties = {
    direction: { reflect: true },
    justify: { reflect: true },
    align: { reflect: true },
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--line-stack-gap, 0.5rem);
    }
    :host([direction='row']) {
      flex-direction: row;
    }
    :host([justify='center']) {
      justify-content: center;
    }
    :host([justify='end']) {
      justify-content: flex-end;
    }
    :host([justify='spaceBetween']) {
      justify-content: space-between;
    }
    :host([justify='spaceAround']) {
      justify-content: space-around;
    }
    :host([justify='spaceEvenly']) {
      justify-content: space-evenly;
    }
    :host([align='start']) {
      align-items: flex-start;
    }
    :host([align='center']) {
      align-items: center;
    }
    :host([align='end']) {
      align-items: flex-end;
    }
  `;

  declare direction: string | undefined;
  declare justify: string | undefined;
  declare align: string | undefined;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('line-stack', LineStack);
