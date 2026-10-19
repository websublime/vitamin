import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import '../../components/line-stack.ts';
import { childKey, LineA2uiAdapter } from '../adapter.ts';

type Children = Parameters<typeof childKey>[0][];

/** Basic `Row`, `Column` and `List`, and line `Stack`, as `<line-stack>`. */
export class StackAdapter extends LineA2uiAdapter {
  protected direction(): string | typeof nothing {
    return typeof this.props.direction === 'string' ? this.props.direction : nothing;
  }

  render() {
    const children = (Array.isArray(this.props.children) ? this.props.children : []) as Children;
    const { label, description } = this.a11y;
    return html`<line-stack
      direction=${this.direction()}
      justify=${(this.props.justify as string) ?? nothing}
      align=${(this.props.align as string) ?? nothing}
      aria-label=${label}
      aria-description=${description}
      style=${this.flex || nothing}
      >${repeat(children, childKey, (child) => this.child(child))}</line-stack
    >`;
  }
}

export class RowAdapter extends StackAdapter {
  protected direction() {
    return 'row';
  }
}

export class ColumnAdapter extends StackAdapter {
  protected direction() {
    return 'column';
  }
}

/** Upstream `List.js` wraps each child too; the adapter element itself cannot take the `listitem` role. */
export class ListAdapter extends StackAdapter {
  render() {
    const children = (Array.isArray(this.props.children) ? this.props.children : []) as Children;
    const { label, description } = this.a11y;
    return html`<line-stack
      role="list"
      direction=${this.props.direction === 'horizontal' ? 'row' : nothing}
      align=${(this.props.align as string) ?? nothing}
      aria-label=${label}
      aria-description=${description}
      style=${this.flex || nothing}
      >${repeat(children, childKey, (child) => html`<div role="listitem">${this.child(child)}</div>`)}</line-stack
    >`;
  }
}

customElements.define('line-a2ui-row', RowAdapter);
customElements.define('line-a2ui-column', ColumnAdapter);
customElements.define('line-a2ui-list', ListAdapter);
customElements.define('line-a2ui-line-stack', StackAdapter);
