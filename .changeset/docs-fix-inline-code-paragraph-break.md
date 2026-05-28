---
"@cloudflare/kumo-docs-astro": patch
---

Fix stray `<p>` elements rendering around inline `<code>` in MDX docs (notably on the Select page's Grouped Options section). Replace inline `<code class="...">` tags with markdown backticks so Prettier line-wrapping no longer breaks the surrounding paragraph.
