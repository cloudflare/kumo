---
"@cloudflare/kumo": patch
---

Hide the native scrollbars of the LayerDialog body and Sidebar content with Kumo's own CSS. Base UI only hides them with a style element it injects into the document head, so client routers that swap the head (such as Astro's ClientRouter) or a Content Security Policy that blocks inline styles could leave empty scrollbar tracks along the dialog body.
