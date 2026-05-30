---
"@cloudflare/kumo": minor
---

**Dialog: `busy` prop, `size="2xl"`, and `verticalAlign="top"` with `topOffset`**

Three additive Dialog improvements, all non-breaking:

- **`<Dialog.Root busy>`**: when true, blocks user-initiated dismissal (Escape key, outside click, focus-out, and `<Dialog.Close>` button presses) so an in-flight async action can't be abandoned by a stray keystroke or backdrop click. Programmatic close (controlled `open={false}` or `actionsRef.close()`) still works, so the dialog can be dismissed once the async work resolves. Designed to flip dynamically while a Save handler is in flight, complementing the existing static `disablePointerDismissal`.
- **`<Dialog size="2xl">`**: new size variant (min 1024px) for data-dense layouts that need more horizontal real estate than `xl` (768px) provides — side-by-side forms, summary tables, multi-pane previews.
- **`<Dialog verticalAlign="top" topOffset={N}>`**: anchor the dialog to the top of the viewport with a configurable pixel offset, instead of the default vertical centring. Useful for apps with a persistent navbar where a centered dialog would visually compete with the chrome.
