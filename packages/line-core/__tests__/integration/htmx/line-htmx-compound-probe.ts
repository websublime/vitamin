/**
 * `<line-htmx-compound-probe>` — the compound fixture of the §6.F.4 htmx harness (AM-063).
 *
 * Private, never published. Compound, not value-bearing and not form-associated.
 * Arrow keys move focus among three internal buttons and commit nothing. A
 * button's `click`, which a pointer click, Enter and Space all produce, is the
 * only commit and fires `line-select` with `detail.id` once (ARCHITECTURE
 * §17.2 rule C9). On `slotchange` the default slot reflects the number of
 * assigned elements as `data-slotted`.
 *
 * @module __tests__/integration/htmx/line-htmx-compound-probe
 */

import { html } from 'lit';
import { LineElement } from '../../../src/line-element.js';

/** The `detail.id` of each internal button, in focus order. */
export const COMPOUND_PROBE_IDS = ['one', 'two', 'three'] as const;

const STEPS: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export class LineHtmxCompoundProbe extends LineElement {
  override render() {
    return html`
      <div part="root" role="group" aria-label="Items" @keydown=${this.#onKeyDown}>
        ${COMPOUND_PROBE_IDS.map(
          (id) => html`<button part="item" type="button" @click=${() => this.#select(id)}>${id}</button>`,
        )}
      </div>
      <slot @slotchange=${this.#onSlotChange}></slot>
    `;
  }

  #select(id: string): void {
    this.dispatchEvent(new CustomEvent('line-select', { detail: { id }, bubbles: true }));
  }

  #onKeyDown(event: KeyboardEvent): void {
    const step = STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const buttons = [...(this.shadowRoot?.querySelectorAll('button') ?? [])];
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    buttons.at((current + step) % buttons.length)?.focus();
  }

  #onSlotChange(event: Event): void {
    this.dataset.slotted = String((event.target as HTMLSlotElement).assignedElements().length);
  }
}

customElements.define('line-htmx-compound-probe', LineHtmxCompoundProbe);

declare global {
  interface HTMLElementTagNameMap {
    'line-htmx-compound-probe': LineHtmxCompoundProbe;
  }
}
