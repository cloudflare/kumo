---
"@cloudflare/kumo": patch
---

`Button`, `LinkButton`, `Badge`, `DropdownMenu` items, `Sidebar.MenuButton` and `InputGroup.Button` no longer crash with React error #306 when `icon` is an element passed from a React Server Component. React can deliver such an element as a lazy reference, which Kumo now unwraps before deciding whether to render `icon` as an element or a component (#891).
