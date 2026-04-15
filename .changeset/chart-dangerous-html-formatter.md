---
"@cloudflare/kumo": minor
---

feat(chart): rename `formatter` to `dangerousHtmlFormatter` for XSS awareness

BREAKING CHANGE: The `formatter` property in `KumoChartOption['tooltip']` has been renamed to `dangerousHtmlFormatter`. This change makes the security implications of using HTML formatters more explicit to developers. The API remains identical—only the name has changed.

Migration: Replace `formatter` with `dangerousHtmlFormatter` in your chart tooltip configurations.
