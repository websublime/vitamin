---
"@websublime/line-core": patch
"@websublime/line-components": patch
---

The library builds keep every declared dependency external, and `@websublime/line-components` now declares `lit` and `@zag-js/core` and no longer sets `sideEffects`.
