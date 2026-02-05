---
"@cloudflare/kumo": patch
---

fix(Table): Add indeterminate prop and fix checkbox click handling

- Added `indeterminate` prop to `Table.CheckHead` and `Table.CheckCell` components to support indeterminate checkbox state (shows minus icon when some but not all rows are selected)
- Fixed checkbox click handling - clicking directly on the checkbox now works correctly (previously only clicking the cell area next to the checkbox worked)
- Updated Table demos (`TableSelectedRowDemo` and `TableFullDemo`) with proper React state management for interactive row selection
