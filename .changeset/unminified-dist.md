---
"@cloudflare/kumo": minor
---

Ship unminified `dist` output without sourcemaps or declaration maps

Consumers' bundlers minify (and tree-shake) the library code anyway, so
pre-minifying only obscured the shipped modules, and the declaration maps
pointed at source files that aren't published. The package shrinks from
~13.9 MB to ~6.5 MB unpacked, and the code in `node_modules` is now
readable. No API or behavior changes; final application bundle sizes are
effectively unchanged.
