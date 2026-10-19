import { Catalog } from '@a2ui/web_core/catalog';
import {
  AccessibilityAttributesSchema,
  ActionSchema,
  ChildListSchema,
  ComponentIdSchema,
  DynamicStringSchema,
} from '@a2ui/web_core/v0_9';
import { z } from 'zod';

/** Spike-only id. The real `line` catalog id is a spec decision. */
export const LINE_CATALOG_ID = 'https://line-ui.websublime.com/a2ui/spike/catalog.json';

// Descriptions use the `REF:` marker form of the generated basic catalog, so `toJson()` keeps the `$ref`s (R1 §2.4.3).
const accessibility = AccessibilityAttributesSchema.describe('REF:#/$defs/AccessibilityAttributes').optional();

export const LINE_APIS = [
  {
    name: 'Button',
    schema: z
      .object({
        accessibility,
        label: DynamicStringSchema.describe('REF:#/$defs/DynamicString|Visible label, placed in the default slot.'),
        icon: ComponentIdSchema.describe(
          'REF:#/$defs/ComponentId|Optional Icon, placed in the prefix slot.',
        ).optional(),
        variant: z.enum(['default', 'primary']).describe('Semantic variant hint.').optional(),
        action: ActionSchema.describe('REF:#/$defs/Action'),
      })
      .strict(),
  },
  {
    name: 'Icon',
    schema: z
      .object({
        accessibility,
        name: z.enum(['check', 'close', 'mail', 'send', 'star']).describe('Icon name.'),
        label: DynamicStringSchema.describe(
          'REF:#/$defs/DynamicString|Accessible name; omit for a decorative icon.',
        ).optional(),
      })
      .strict(),
  },
  {
    name: 'Stack',
    schema: z
      .object({
        accessibility,
        children: ChildListSchema.describe('REF:#/$defs/ChildList|Stack items, in order.'),
        direction: z.enum(['row', 'column']).describe('Main axis.').optional(),
        justify: z.enum(['start', 'center', 'end', 'spaceBetween']).describe('Main-axis distribution.').optional(),
        align: z.enum(['start', 'center', 'end', 'stretch']).describe('Cross-axis alignment.').optional(),
      })
      .strict(),
  },
  {
    name: 'Separator',
    schema: z
      .object({
        accessibility,
        orientation: z.enum(['horizontal', 'vertical']).describe('Orientation of the rule.').optional(),
      })
      .strict(),
  },
];

/** Builds the four-component `line` catalog, with the adapter tag of each type for technique (a). */
export function lineCatalog(tagNames?: Record<string, string>) {
  const components = LINE_APIS.map((api) => (tagNames ? { ...api, tagName: tagNames[api.name] } : api));
  return new Catalog(LINE_CATALOG_ID, '0.9', components, []);
}
