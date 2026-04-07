---
"@cloudflare/kumo": minor
---

Add Enter key navigation to Pagination page number input and new `pageSelector` prop for dropdown mode

- The page number input in `Pagination.Controls` now navigates on Enter key press (previously only on blur)
- New `pageSelector` prop on `Pagination.Controls`: set to `"dropdown"` to render a Select dropdown instead of a text input for page selection
