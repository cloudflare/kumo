---
"@cloudflare/kumo": patch
---

Component registry codegen now reads props from unions nested inside intersections (and intersections nested inside unions), so discriminated prop types such as a future `Button` with `href` keep their props in `ai/component-registry.json`. Output for existing components is unchanged.
