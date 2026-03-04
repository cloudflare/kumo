---
"@cloudflare/kumo": patch
---

Simplify Select placeholder implementation by using Base UI's native placeholder prop on SelectBase.Value instead of manually injecting placeholder items into the items array. This provides a cleaner, more intuitive API that aligns with standard HTML select behavior while maintaining backward compatibility with the null-value placeholder pattern.
