---
"@websublime/line-colors": patch
---

The built palette CSS keeps the authored whitespace inside `--line-*` values (cssnano 8.0.10), so `getPropertyValue()` returns strings such as `light-dark(#fefdfb, #16120c)`; computed colours are unchanged.
