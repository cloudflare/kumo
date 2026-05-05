---
"@cloudflare/kumo": patch
---

Remove z-50 from mobile Sidebar Dialog backdrop and panel. The z-50 caused portaled floating elements (Popover, DropdownMenu, Select, Combobox) opened from inside the Sidebar to render behind the Dialog backdrop. Matches the pattern used by Kumo's own Dialog component, which relies on DOM order for stacking with no explicit z-index. Also adds `data-sidebar-backdrop` and `data-sidebar-popup` attributes as stable CSS hooks.
