---
"@cloudflare/kumo": patch
---

Input and InputArea now automatically apply error styling when the `error` prop is truthy. You no longer need to set `variant="error"` separately - just pass an error message and the styling is applied automatically. The `variant="error"` prop is now deprecated but still works for backwards compatibility.
