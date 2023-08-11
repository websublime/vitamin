import { registerComponent as registerCheckbox } from '@websublime/vitamin-ui/plugin/checkbox.js';
import { registerComponent as registerIcon } from '@websublime/vitamin-ui/plugin/icon.js';
import { registerComponent as registerLimiter } from '@websublime/vitamin-ui/plugin/limiter.js';
import { registerComponent as registerRange } from '@websublime/vitamin-ui/plugin/range.js';
import { registerComponent as registerSwitch } from '@websublime/vitamin-ui/plugin/switch.js';

export function registerComponents() {
  customElements.get('ui-icon') || registerIcon();
  customElements.get('ui-switch') || registerSwitch();
  customElements.get('ui-checkbox') || registerCheckbox();
  customElements.get('ui-range') || registerRange();
  customElements.get('ui-limiter') || registerLimiter();
}
