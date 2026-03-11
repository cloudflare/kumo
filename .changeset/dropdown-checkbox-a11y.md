---
"@cloudflare/kumo": patch
---

fix(dropdown): use Base UI CheckboxItemIndicator for proper accessibility

Replace custom Checkbox component with Base UI's CheckboxItemIndicator in DropdownMenuCheckboxItem. The previous implementation nested an interactive Checkbox inside the menuitemcheckbox role, causing duplicate accessibility labels. CheckboxItemIndicator is automatically aria-hidden and only renders when checked, following the standard Base UI pattern.
