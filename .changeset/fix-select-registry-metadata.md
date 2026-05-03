---
"@cloudflare/kumo": patch
---

fix(registry): correct Select component metadata for AI-generated code

The component registry metadata was incorrectly typing Select's `value`, `defaultValue`, and `onValueChange` props as `string`, causing AI agents to produce broken code when implementing Select with object values (e.g., rendering `object.value` in the trigger instead of the label).

Changes:
- `value` type: `string` → `T` (generic, matches actual component interface)
- `defaultValue` type: `string` → `T`
- `onValueChange` type: `(value: string) => void` → `(value: T) => void`
- Added missing `renderValue` prop: `(value: T) => ReactNode` — required for object values
- Added missing `items` prop: supports both `Record<string, string>` and `Array<{ label, value }>` forms
- Added missing `isItemEqualToValue` prop: required for object equality comparison
