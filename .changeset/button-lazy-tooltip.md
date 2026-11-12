---
"@cloudflare/kumo": patch
---

`Button`, `LinkButton` and `Label` no longer load the tooltip code up front. Base UI's tooltip and floating-ui now load the first time a `Button` or `LinkButton` with `title`, or a `Label` with `tooltip`, mounts. Until then the button renders without its tooltip, and server rendering always outputs the button alone. If the button has focus when its tooltip arrives, it keeps focus. A bundle that imports only `Button` from the root now loads 14.8 KB gzip up front instead of 51.0 KB, and one that imports only `buttonVariants` drops from 51.0 KB to 12.5 KB.
