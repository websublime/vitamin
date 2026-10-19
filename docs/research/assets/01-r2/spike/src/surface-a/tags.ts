import { BASIC_CATALOG_ID } from '../catalog/basic.ts';
import { LINE_CATALOG_ID } from '../catalog/line.ts';

/** Adapter tag per catalog type. The catalogs carry these as `tagName`, with no element constructor. */
export const ADAPTER_TAGS: Record<string, Record<string, string>> = {
  [BASIC_CATALOG_ID]: {
    Text: 'line-a2ui-text',
    Image: 'line-a2ui-image',
    Icon: 'line-a2ui-icon',
    Row: 'line-a2ui-row',
    Column: 'line-a2ui-column',
    List: 'line-a2ui-list',
    Divider: 'line-a2ui-divider',
    Button: 'line-a2ui-button',
  },
  [LINE_CATALOG_ID]: {
    Button: 'line-a2ui-line-button',
    Icon: 'line-a2ui-line-icon',
    Stack: 'line-a2ui-line-stack',
    Separator: 'line-a2ui-line-separator',
  },
};
