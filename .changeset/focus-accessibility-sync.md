---
"@cloudflare/kumo": patch
"@cloudflare/kumo-docs-astro": patch
---

Improved focus and keyboard accessibility styles across Kumo components and docs navigation.

- Added the `kumo-focus` semantic token to the theme generator config and generated `theme-kumo.css` output.
- Updated focus ring behavior across interactive components (including `Button`, `Input`, `InputGroup`, `Select`, `Checkbox`, `Radio`, `Switch`, `Sidebar`, `Tabs`, `Menubar`, and related controls) for more consistent and visible keyboard focus visibility.
- Text-entry controls use a lighter opacity `kumo-focus` ring to keep pointer and keyboard focus visually consistent where browsers apply `:focus-visible` heuristics to typed-input controls.
- Refined `Select` and `Input` styling/state combinations to align focus visuals with current semantic token usage.
- Updated docs `SidebarNav` keyboard-focus affordances (links, section toggles, search trigger) and adjusted collapsible list overflow so focus rings remain visible.
- Replace raw colors in `Select` with kumo semantic tokens.
