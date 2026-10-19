import { html, nothing } from 'lit';
import '../../components/line-separator.ts';
import { LineA2uiAdapter } from '../adapter.ts';

/** Basic `Divider` and line `Separator` as `<line-separator>`. */
export class SeparatorAdapter extends LineA2uiAdapter {
  render() {
    const vertical = this.props.axis === 'vertical' || this.props.orientation === 'vertical';
    return html`<line-separator
      orientation=${vertical ? 'vertical' : 'horizontal'}
      style=${this.flex || nothing}
    ></line-separator>`;
  }
}

customElements.define('line-a2ui-divider', SeparatorAdapter);
customElements.define('line-a2ui-line-separator', class extends SeparatorAdapter {});
