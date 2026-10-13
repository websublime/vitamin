---
"@websublime/line-tokens": patch
---

The built CSS keeps the authored whitespace inside `--line-*` values (cssnano 8.0.10), so `getPropertyValue()` returns strings such as `4 / 3` instead of `4/3`; computed styles are unchanged.
