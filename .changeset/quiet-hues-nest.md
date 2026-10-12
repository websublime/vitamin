---
"@websublime/line-colors": patch
---

Every palette rule now sits in the cascade layer `line`, so your rules outside `@layer` win at any specificity, and a layered stylesheet wins by starting with `@layer line;`.
