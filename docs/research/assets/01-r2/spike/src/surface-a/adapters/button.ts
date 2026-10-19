import { html, nothing } from 'lit';
import '../../components/line-button.ts';
import { LineA2uiAdapter } from '../adapter.ts';

/** Basic `Button` as `<line-button>`; its single `child` lands in the default slot. */
export class ButtonAdapter extends LineA2uiAdapter {
  protected press = () => {
    const action = this.props.action;
    if (typeof action === 'function') action();
  };

  render() {
    const { label, description } = this.a11y;
    return html`<line-button
      variant=${(this.props.variant as string) ?? nothing}
      aria-label=${label}
      aria-description=${description}
      style=${this.flex || nothing}
      @click=${this.press}
      >${this.child(this.props.child as string)}</line-button
    >`;
  }
}

/**
 * Line `Button`, with a `label` and an optional `icon` for the prefix slot. `renderA2uiNode` returns a directive, not
 * an element, so the slot name goes on the icon's adapter element after each render.
 */
export class LineButtonAdapter extends ButtonAdapter {
  render() {
    const { label, description } = this.a11y;
    return html`<line-button
      variant=${(this.props.variant as string) ?? nothing}
      aria-label=${label}
      aria-description=${description}
      @click=${this.press}
      >${this.child(this.props.icon as string)}${String(this.props.label ?? '')}</line-button
    >`;
  }

  updated() {
    super.updated();
    // The icon adapter may not be upgraded yet, so the selector matches any child element.
    for (const el of this.querySelectorAll(':scope > line-button > *')) el.slot = 'prefix';
  }
}

customElements.define('line-a2ui-button', ButtonAdapter);
customElements.define('line-a2ui-line-button', LineButtonAdapter);
