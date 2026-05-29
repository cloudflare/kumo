---
"@cloudflare/kumo": patch
---

fix(styles): show pointer cursor on clickable Kumo elements by default

Adds a global `cursor: pointer` rule scoped to elements rendered by Kumo
components, identified by the new `data-kumo-component` and `data-kumo-part`
attributes. Interactive component roots and parts now opt into the rule by
setting these attributes, which gives the library a stable scoping primitive
that doesn't couple to Tailwind class names.

Components updated to set `data-kumo-component` / `data-kumo-part`:
Button, LinkButton, Link, Checkbox, Radio, Switch, Select (trigger, option),
DropdownMenu (item, link-item, checkbox-item, radio-item, submenu-trigger),
Combobox (trigger, item, clear, chip-remove), Autocomplete (item),
Dialog (trigger, close), Popover (trigger), Tabs (tab),
Collapsible (trigger, default-trigger), Breadcrumbs (link),
TableOfContents (item, group-link), Sidebar (menu-button, menu-sub-button,
trigger, rail), MenuBar (option), Toast (close), SensitiveInput
(toggle-visibility, copy, masked-container).
