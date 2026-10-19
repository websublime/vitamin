import { type ComponentNode, effect, NodeResolver, type SurfaceModel } from '@a2ui/web_core/v0_9';
import { BASIC_CATALOG_ID } from '../catalog/basic.ts';
import { LINE_CATALOG_ID } from '../catalog/line.ts';
import { type Loader, placeholder, SurfaceBase } from '../surface-base.ts';

type Props = Record<string, unknown>;
type Action = () => Promise<void>;

/** Maps one catalog type onto a `line-*` tag or a native element. */
interface Projector {
  /** The `line-*` tag whose module `load()` imports, if any. */
  component?: string;
  tag(props: Props): string;
  apply(el: HTMLElement, props: Props, surface: DirectSurface): void;
}

const COMPONENTS: Record<string, Loader> = {
  'line-button': () => import('../components/line-button.ts'),
  'line-icon': () => import('../components/line-icon.ts'),
  'line-stack': () => import('../components/line-stack.ts'),
  'line-separator': () => import('../components/line-separator.ts'),
};

const TEXT_TAGS: Record<string, string> = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', caption: 'small' };
const URL_SCHEMES = ['https:', 'http:', 'mailto:', 'tel:'];

// Resolved props hold `ResolvedBinding` or `WritableBinding` objects for dynamic values (R1 §2.5.2).
function val(value: unknown): unknown {
  return value && typeof value === 'object' && 'value' in value ? value.value : value;
}

function setAttr(el: Element, name: string, value: unknown) {
  if (value === undefined || value === null || value === '' || value === false) el.removeAttribute(name);
  else el.setAttribute(name, String(value));
}

function a11y(props: Props): Props {
  const value = val(props.accessibility);
  return value && typeof value === 'object' ? { ...value } : {};
}

function common(el: HTMLElement, props: Props) {
  setAttr(el, 'aria-label', val(a11y(props).label));
  setAttr(el, 'aria-description', val(a11y(props).description));
  el.style.flexGrow = props.weight === undefined ? '' : String(props.weight);
}

function stack(direction: 'row' | 'column' | 'list'): Projector {
  return {
    component: 'line-stack',
    tag: () => 'line-stack',
    apply(el, props, surface) {
      common(el, props);
      const nodes = Array.isArray(props.children) ? (props.children as ComponentNode[]) : [];
      setAttr(el, 'justify', val(props.justify));
      setAttr(el, 'align', val(props.align));
      if (direction === 'list') {
        setAttr(el, 'direction', val(props.direction) === 'horizontal' && 'row');
        el.setAttribute('role', 'list');
        surface.reconcile(
          el,
          nodes.map((node) => surface.listItem(surface.mount(node))),
        );
        return;
      }
      setAttr(el, 'direction', direction);
      surface.reconcile(
        el,
        nodes.map((node) => surface.mount(node)),
      );
    },
  };
}

function button(labelled: 'child' | 'label'): Projector {
  return {
    component: 'line-button',
    tag: () => 'line-button',
    apply(el, props, surface) {
      common(el, props);
      setAttr(el, 'variant', val(props.variant));
      if (typeof props.action === 'function') surface.actions.set(el, props.action as Action);
      if (labelled === 'child') {
        surface.reconcile(el, props.child ? [surface.mount(props.child as ComponentNode)] : []);
        return;
      }
      const label = surface.text(el, String(val(props.label) ?? ''));
      const icon = props.icon ? surface.mount(props.icon as ComponentNode) : undefined;
      if (icon) icon.slot = 'prefix';
      surface.reconcile(el, icon ? [icon, label] : [label]);
    },
  };
}

const BASIC: Record<string, Projector> = {
  Text: {
    tag: (props) => TEXT_TAGS[String(val(props.variant))] ?? 'p',
    apply(el, props) {
      common(el, props);
      el.textContent = String(val(props.text) ?? '');
    },
  },
  Image: {
    tag: () => 'img',
    apply(el, props) {
      common(el, props);
      const url = new URL(String(val(props.url) ?? ''), location.href);
      setAttr(el, 'src', URL_SCHEMES.includes(url.protocol) ? url.href : undefined);
      el.setAttribute('alt', String(val(props.description) ?? ''));
      el.style.objectFit = String(val(props.fit) ?? '');
    },
  },
  Icon: {
    component: 'line-icon',
    tag: () => 'line-icon',
    apply(el, props) {
      Object.assign(el, { name: val(props.name), label: val(a11y(props).label) });
    },
  },
  Row: stack('row'),
  Column: stack('column'),
  List: stack('list'),
  Divider: {
    component: 'line-separator',
    tag: () => 'line-separator',
    apply(el, props) {
      common(el, props);
      setAttr(el, 'orientation', val(props.axis) === 'vertical' ? 'vertical' : 'horizontal');
    },
  },
  Button: button('child'),
};

const LINE: Record<string, Projector> = {
  Button: button('label'),
  Icon: {
    component: 'line-icon',
    tag: () => 'line-icon',
    apply(el, props) {
      Object.assign(el, { name: val(props.name), label: val(props.label) });
    },
  },
  Stack: {
    component: 'line-stack',
    tag: () => 'line-stack',
    apply(el, props, surface) {
      common(el, props);
      setAttr(el, 'direction', val(props.direction));
      setAttr(el, 'justify', val(props.justify));
      setAttr(el, 'align', val(props.align));
      const nodes = Array.isArray(props.children) ? (props.children as ComponentNode[]) : [];
      surface.reconcile(
        el,
        nodes.map((node) => surface.mount(node)),
      );
    },
  },
  Separator: {
    component: 'line-separator',
    tag: () => 'line-separator',
    apply(el, props) {
      common(el, props);
      setAttr(el, 'orientation', val(props.orientation));
    },
  },
};

const PROJECTORS: Record<string, Record<string, Projector>> = { [BASIC_CATALOG_ID]: BASIC, [LINE_CATALOG_ID]: LINE };

/**
 * Technique (b). Walks the `NodeResolver` signal tree and creates `line-*` elements directly in the surface's light
 * DOM. Each node keeps one element for its lifetime, and one effect per node applies its props.
 */
export class DirectSurface extends SurfaceBase {
  readonly actions = new WeakMap<Element, Action>();
  #records = new Map<string, { node: ComponentNode; el: HTMLElement; tag: string }>();
  #items = new WeakMap<Node, HTMLElement>();
  #texts = new WeakMap<Element, Text>();
  #projectors: Record<string, Projector> = {};

  protected loaderFor(catalogId: string, type: string): Loader | undefined {
    const component = PROJECTORS[catalogId]?.[type]?.component;
    return component ? COMPONENTS[component] : undefined;
  }

  protected attachSurface(surface: SurfaceModel) {
    this.#projectors = PROJECTORS[surface.catalog?.id ?? ''] ?? {};
    const resolver = new NodeResolver(surface);
    effect(() => {
      const rootNode = resolver.rootNode.value;
      this.reconcile(this.root, rootNode ? [this.mount(rootNode)] : []);
    });
    // One delegated listener runs the action of the nearest projected button.
    this.addEventListener('click', (event) => {
      for (const target of event.composedPath()) {
        const action = target instanceof Element ? this.actions.get(target) : undefined;
        if (!action) continue;
        action();
        return;
      }
    });
  }

  protected async flush() {}

  /**
   * Returns the element of a node. The resolver replaces a node when its position in the parent's child list changes,
   * so elements are keyed by `instanceId` and rebound to the new node, which keeps focus on a moved sibling.
   */
  mount(node: ComponentNode): HTMLElement {
    const key = node.instanceId;
    const known = this.#records.get(key);
    if (known?.node === node) return known.el;
    const projector = this.#projectors[node.type];
    let el: HTMLElement;
    let tag = `placeholder:${node.state}`;
    if (node.state === 'pending') {
      el = placeholder('pending', node.componentId);
      el.hidden = true;
    } else if (node.isPlaceholder || !projector) {
      el = placeholder(node.state, node.componentId);
    } else {
      tag = projector.tag(node.props.peek() as Props);
      el = known?.tag === tag ? known.el : document.createElement(tag);
      el.dataset.a2uiId = node.componentId;
      const bound = el;
      node.addCleanup(effect(() => projector.apply(bound, node.props.value as Props, this)));
    }
    this.#records.set(key, { node, el, tag });
    // Deletion waits a microtask, so a successor that mounts in the same update keeps the element.
    node.onDestroyed.subscribe(() =>
      queueMicrotask(() => {
        if (this.#records.get(key)?.node === node) this.#records.delete(key);
      }),
    );
    return el;
  }

  /** Gives a List child the `listitem` role, wrapping it unless it is a `line-stack`. */
  listItem(child: HTMLElement): HTMLElement {
    if (child.localName === 'line-stack') {
      child.setAttribute('role', 'listitem');
      return child;
    }
    let item = this.#items.get(child);
    if (!item) {
      item = document.createElement('div');
      item.setAttribute('role', 'listitem');
      this.#items.set(child, item);
    }
    this.reconcile(item, [child]);
    return item;
  }

  /** Returns the element's own label text node, updated in place. */
  text(el: Element, value: string): Text {
    let node = this.#texts.get(el);
    if (!node) {
      node = document.createTextNode('');
      this.#texts.set(el, node);
    }
    if (node.data !== value) node.data = value;
    return node;
  }

  /** Makes `parent`'s child nodes equal `desired`, moving only nodes that are out of place. */
  reconcile(parent: Element, desired: Node[]) {
    for (const child of [...parent.childNodes]) {
      if (!desired.includes(child)) child.remove();
    }
    // The anchor never moves: the child that holds focus, else the first desired child already in place.
    const focused = desired.findIndex((child) => child.parentNode === parent && child.contains(document.activeElement));
    const anchor = Math.max(
      focused,
      desired.findIndex((child) => child.parentNode === parent),
      0,
    );
    if (desired[anchor] && desired[anchor].parentNode !== parent) parent.append(desired[anchor]);
    for (let i = anchor - 1; i >= 0; i--) {
      if (desired[i].nextSibling !== desired[i + 1]) parent.insertBefore(desired[i], desired[i + 1]);
    }
    for (let i = anchor + 1; i < desired.length; i++) {
      if (desired[i].previousSibling !== desired[i - 1]) parent.insertBefore(desired[i], desired[i - 1].nextSibling);
    }
  }
}

customElements.define('line-a2ui-surface', DirectSurface);
