import { Catalog } from '@a2ui/web_core/catalog';
import {
  ButtonApi,
  ColumnApi,
  DividerApi,
  IconApi,
  ImageApi,
  ListApi,
  RowApi,
  TextApi,
  ThemeSchema,
} from '@a2ui/web_core/v0_9/basic_catalog';

/** The only basic catalog id `web_core` 0.14.0 knows (R1 §2.6). */
export const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

/** The eight Phase 1 basic types the spike maps (ARCHITECTURE §17.3). */
export const BASIC_APIS = [TextApi, ImageApi, IconApi, RowApi, ColumnApi, ListApi, DividerApi, ButtonApi];

/**
 * Builds the Phase 1 subset of the basic catalog. Technique (a) passes the adapter tag of each type, so
 * `renderA2uiNode` can create it; technique (b) passes nothing. No entry carries an element constructor, so
 * `renderA2uiNode` never defines an element itself (R1 §2.5.3).
 */
export function basicCatalog(tagNames?: Record<string, string>) {
  const components = BASIC_APIS.map((api) => (tagNames ? { ...api, tagName: tagNames[api.name] } : api));
  return new Catalog(BASIC_CATALOG_ID, '0.9', components, [], { themeSchema: ThemeSchema });
}
