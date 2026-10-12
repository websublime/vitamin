# @websublime/line-themes

Role-mapped theme layers (accent, gray, semantics, aliases, defaults) consumed via CSS subpaths. Depends on `@websublime/line-colors` and `@websublime/line-schemas` (wired in B2).

Select a hue for a role with `data-accent="{hue}"` and `data-gray="{hue}"`. The Radix `gray` hue is `neutral` (`accent/neutral`, `gray/neutral`). The gray role keeps `--line-gray-*` and `data-gray`.

## Cascade layer

Every rule of this package sits inside the cascade layer `line`, and every selector uses `:where()`. `@websublime/line-tokens`, `@websublime/line-colors` and `@websublime/line-themes` share that one layer. A rule of yours outside `@layer` beats every rule in `line` at any specificity and in any order. If your stylesheets declare their own layers, start them with `@layer line;` or put `line` first in your layer order statement, so every layer you declare later wins. Load the CSS as it is, because `@import '…' layer(line)` would nest the layer as `line.line`.
