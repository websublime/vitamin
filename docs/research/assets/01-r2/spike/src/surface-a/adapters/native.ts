import { html, nothing } from 'lit';
import { LineA2uiAdapter } from '../adapter.ts';

/** Basic `Text` as a native element chosen by `variant`. */
export class TextAdapter extends LineA2uiAdapter {
  render() {
    const text = String(this.props.text ?? '');
    const { label, description } = this.a11y;
    const style = this.flex || nothing;
    switch (this.props.variant) {
      case 'h1':
        return html`<h1 aria-label=${label} aria-description=${description} style=${style}>${text}</h1>`;
      case 'h2':
        return html`<h2 aria-label=${label} aria-description=${description} style=${style}>${text}</h2>`;
      case 'h3':
        return html`<h3 aria-label=${label} aria-description=${description} style=${style}>${text}</h3>`;
      case 'h4':
        return html`<h4 aria-label=${label} aria-description=${description} style=${style}>${text}</h4>`;
      case 'h5':
        return html`<h5 aria-label=${label} aria-description=${description} style=${style}>${text}</h5>`;
      case 'caption':
        return html`<small aria-label=${label} aria-description=${description} style=${style}>${text}</small>`;
      default:
        return html`<p aria-label=${label} aria-description=${description} style=${style}>${text}</p>`;
    }
  }
}

const URL_SCHEMES = ['https:', 'http:', 'mailto:', 'tel:'];

/** Basic `Image` as a native `<img>` behind the default URL allowlist. */
export class ImageAdapter extends LineA2uiAdapter {
  render() {
    const url = new URL(String(this.props.url ?? ''), location.href);
    const src = URL_SCHEMES.includes(url.protocol) ? url.href : nothing;
    const fit = typeof this.props.fit === 'string' ? `object-fit:${this.props.fit};` : '';
    return html`<img src=${src} alt=${String(this.props.description ?? '')} style=${`${fit}${this.flex}` || nothing} />`;
  }
}

customElements.define('line-a2ui-text', TextAdapter);
customElements.define('line-a2ui-image', ImageAdapter);
