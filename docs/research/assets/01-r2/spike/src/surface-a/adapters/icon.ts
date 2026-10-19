import { html, nothing } from 'lit';
import '../../components/line-icon.ts';
import { LineA2uiAdapter } from '../adapter.ts';

/** Basic `Icon` as `<line-icon>`; the label comes from `accessibility.label`. */
export class IconAdapter extends LineA2uiAdapter {
  protected label(): string | undefined {
    const label = (this.props.accessibility as { label?: unknown } | undefined)?.label;
    return typeof label === 'string' ? label : undefined;
  }

  render() {
    const name = typeof this.props.name === 'string' ? this.props.name : nothing;
    return html`<line-icon name=${name} .label=${this.label()} style=${this.flex || nothing}></line-icon>`;
  }
}

/** Line `Icon`, which carries its own `label` prop. */
export class LineIconAdapter extends IconAdapter {
  protected label(): string | undefined {
    return typeof this.props.label === 'string' ? this.props.label : undefined;
  }
}

customElements.define('line-a2ui-icon', IconAdapter);
customElements.define('line-a2ui-line-icon', LineIconAdapter);
