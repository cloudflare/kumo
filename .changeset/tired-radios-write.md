---
"@cloudflare/kumo": patch
---

fix(dropdown): improve external link detection to handle http:// and protocol-relative urls

updated the external link check to use a regex that matches `https://`, `http://`, and protocol-relative URLs (`//`). previously only `https://` links opened in a new tab.
