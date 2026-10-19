/**
 * Records every `customElements.define` call made after this module runs. Entry modules import it first, but chunks a
 * bundle imports statically still evaluate earlier, so the bundle check also asks the registry.
 */
const defines: string[] = [];

const define = customElements.define.bind(customElements);
customElements.define = (name, elementClass, options) => {
  defines.push(name);
  define(name, elementClass, options);
};

Object.assign(globalThis, { spikeDefines: defines });
