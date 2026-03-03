---
"@cloudflare/kumo": minor
---

Add `role` prop to Dialog component supporting both `"dialog"` (default) and `"alertdialog"` ARIA roles

**New Feature:**

- `Dialog.Root` now accepts a `role` prop to specify the dialog's ARIA semantics
- When `role="alertdialog"` is used, the dialog uses Base UI's AlertDialog primitives for proper accessibility
- This provides correct screen reader announcements for confirmation and destructive action dialogs

**When to use `role="alertdialog"`:**

- Destructive actions (delete, discard, remove)
- Confirmation flows requiring explicit user acknowledgment
- Actions that cannot be undone
- Critical warnings or errors

**Example:**

```tsx
// Standard dialog (default)
<Dialog.Root>
  <Dialog.Trigger render={(p) => <Button {...p}>Edit</Button>} />
  <Dialog>...</Dialog>
</Dialog.Root>

// Alert dialog for destructive actions
<Dialog.Root role="alertdialog">
  <Dialog.Trigger render={(p) => <Button variant="destructive" {...p}>Delete</Button>} />
  <Dialog>...</Dialog>
</Dialog.Root>
```
