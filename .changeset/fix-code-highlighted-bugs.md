---
"@cloudflare/kumo": patch
---

fix(code): Fix CodeHighlighted dark mode, layout, and SSR issues

- Fix dark mode: Make `<pre>` background transparent so container's `bg-kumo-base` handles theming and border-radius is respected
- Fix layout: Wrap Shiki output in overflow container to prevent line highlight negative margins from being clipped
- Fix width: Add `w-full` to container for proper full-width display
- Fix SSR: Remove `"use client"` directive from `@cloudflare/kumo/code/server` entry point so server utilities work in RSC/SSR contexts
