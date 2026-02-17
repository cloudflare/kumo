---
"@cloudflare/kumo": patch
---

Fix `kumo add` to consolidate imports from `@cloudflare/kumo` into a single statement using inline `type` syntax.

Previously, running `kumo add DeleteResource` would produce non-conformant code with duplicate imports:
```typescript
import { Dialog, DialogRoot } from '@cloudflare/kumo';
import { Input } from '@cloudflare/kumo';
import { Button } from '@cloudflare/kumo';
```

Now it produces a single consolidated import:
```typescript
import { Dialog, DialogRoot, Input, Button, type DialogProps } from '@cloudflare/kumo';
```

This satisfies ESLint's `import/no-duplicates` rule with `prefer-inline: true`.
