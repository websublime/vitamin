# @websublime/line-colors

Radix-derived color palette: 31 hues (12-step base + 12-step alpha) plus four special scales (`blackA`, `whiteA`, `blackP3A`, `whiteP3A`). One CSS subpath per hue.

The Radix `gray` hue ships as `neutral`: tokens `--line-neutral-*`, subpath `@websublime/line-colors/neutral`. A hue never shares a name with a role, and `--line-gray-*` is the gray role in `@websublime/line-themes`.

## Cascade layer

Every rule of this package sits inside the cascade layer `line`, and every selector uses `:where()`. `@websublime/line-tokens`, `@websublime/line-colors` and `@websublime/line-themes` share that one layer. A rule of yours outside `@layer` beats every rule in `line` at any specificity and in any order. If your stylesheets declare their own layers, start them with `@layer line;` or put `line` first in your layer order statement, so every layer you declare later wins. Load the CSS as it is, because `@import '…' layer(line)` would nest the layer as `line.line`.
