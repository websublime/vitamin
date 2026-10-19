import { ComponentContext, type SurfaceModel } from '@a2ui/web_core/v0_9';
import { renderA2uiNode } from '@a2ui/web_core/v0_9/universal';
import { nothing, render } from 'lit';
import { BASIC_CATALOG_ID } from '../catalog/basic.ts';
import { LINE_CATALOG_ID } from '../catalog/line.ts';
import { type Loader, SurfaceBase } from '../surface-base.ts';
import type { LineA2uiAdapter } from './adapter.ts';

const native: Loader = () => import('./adapters/native.ts');
const stack: Loader = () => import('./adapters/stack.ts');
const icon: Loader = () => import('./adapters/icon.ts');
const separator: Loader = () => import('./adapters/separator.ts');
const button: Loader = () => import('./adapters/button.ts');

const LOADERS: Record<string, Record<string, Loader>> = {
  [BASIC_CATALOG_ID]: {
    Text: native,
    Image: native,
    Icon: icon,
    Row: stack,
    Column: stack,
    List: stack,
    Divider: separator,
    Button: button,
  },
  [LINE_CATALOG_ID]: { Button: button, Icon: icon, Stack: stack, Separator: separator },
};

/**
 * Technique (a). Renders the root through `renderA2uiNode(context, catalog)`, as upstream `<a2ui-surface>` does, and
 * each adapter renders its children the same way. The adapter modules load lazily per type, and each adapter element
 * upgrades in place when its module arrives (R1 §2.5.3).
 */
export class AdapterSurface extends SurfaceBase {
  protected loaderFor(catalogId: string, type: string): Loader | undefined {
    return LOADERS[catalogId]?.[type];
  }

  protected attachSurface(surface: SurfaceModel) {
    const draw = () => {
      try {
        if (!surface.componentsModel.get('root')) {
          render(nothing, this.root);
          return;
        }
        const context = new ComponentContext(surface, 'root', '/');
        render(renderA2uiNode(context, context.componentModel.catalog), this.root);
      } catch (err) {
        this.reportThrown(err, { source: 'render' });
      }
    };
    surface.componentsModel.onCreated.subscribe((model) => {
      if (model.id === 'root') draw();
    });
    surface.componentsModel.onDeleted.subscribe((id) => {
      if (id === 'root') draw();
    });
    draw();
  }

  // Each adapter updates in its own microtask, so the tree settles level by level.
  protected async flush() {
    for (;;) {
      const adapters = [...this.root.querySelectorAll<LineA2uiAdapter>('[data-line-a2ui-adapter]')];
      const pending = adapters.filter((el) => el.isUpdatePending);
      if (pending.length === 0) return;
      await Promise.all(pending.map((el) => el.updateComplete));
    }
  }
}

customElements.define('line-a2ui-surface', AdapterSurface);
