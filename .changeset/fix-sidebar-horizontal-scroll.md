---
"@cloudflare/kumo": patch
---

Fix horizontal scroll in `Sidebar.Content`: always apply `overflow-x: hidden` on the scroll viewport, not just when collapsed. Base UI's `ScrollArea.Viewport` sets `overflow: scroll` as an inline style, which allowed ~14px of horizontal overflow when consumer content (e.g. search buttons with keyboard shortcuts) exceeded the sidebar width.
