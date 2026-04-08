---
"@cloudflare/kumo": patch
---

Adjust semantic tint usage for status/error ring styles across core form and feedback components.

- Update background styles in `Badge` and `Banner` components to use `*-tint` tokens.
- Update `kumo-danger` to a darker token to improve a11y contrast.
- Update error ring styling in form components to use semantic tokens (now darker with token swap).
- Removed `text-color-badge-red-subtle` token in replacement of the `danger` token.
- Update theme generator color mappings used by these tints to improve visual consistency.