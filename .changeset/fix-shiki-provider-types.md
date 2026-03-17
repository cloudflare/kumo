---
"@cloudflare/kumo": patch
---

Fix TypeScript return types for ShikiProvider and CodeHighlighted components.

Changed return type from `ReactNode` to `React.JSX.Element` to resolve JSX compatibility errors. This fixes issues when consuming these components in projects with stricter TypeScript configurations (e.g., `skipLibCheck: false`), where `ReactNode` was incorrectly inferred as a valid JSX element return type.
