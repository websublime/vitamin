// First import, so it records every later `customElements.define`.
import '../define-log.ts';
import '../surface-a/surface.ts';
import { Catalog } from '@a2ui/web_core/catalog';
import { BASIC_APIS, BASIC_CATALOG_ID } from '../catalog/basic.ts';
import { ButtonAdapter } from '../surface-a/adapters/button.ts';
import { IconAdapter } from '../surface-a/adapters/icon.ts';
import { ImageAdapter, TextAdapter } from '../surface-a/adapters/native.ts';
import { SeparatorAdapter } from '../surface-a/adapters/separator.ts';
import { ColumnAdapter, ListAdapter, RowAdapter } from '../surface-a/adapters/stack.ts';
import { ADAPTER_TAGS } from '../surface-a/tags.ts';
import { run } from './app.ts';

/**
 * The upstream idiom (`toWebComponentImplementation`): each catalog entry carries its element constructor, so the
 * catalog module imports every adapter and every `line-*` component it wraps.
 */
const ELEMENTS: Record<string, CustomElementConstructor> = {
  Text: TextAdapter,
  Image: ImageAdapter,
  Icon: IconAdapter,
  Row: RowAdapter,
  Column: ColumnAdapter,
  List: ListAdapter,
  Divider: SeparatorAdapter,
  Button: ButtonAdapter,
};
const tags = ADAPTER_TAGS[BASIC_CATALOG_ID];
const entries = BASIC_APIS.map((api) => ({ ...api, tagName: tags[api.name], element: ELEMENTS[api.name] }));

await run([new Catalog(BASIC_CATALOG_ID, '0.9', entries, [])]);
