---
"@cloudflare/kumo": patch
---

Fix Shiki highlighter lifecycle in `ShikiProvider` and `CodeHighlighted`.

`ShikiProvider` no longer re-creates the highlighter when a parent rerender passes an equivalent inline `languages` array — initialization is keyed on the normalized language set. Highlighters are now disposed on unmount and when the engine or language set changes, instead of leaking. `CodeHighlighted` memoizes the highlighted HTML so unrelated rerenders (such as copy-button state changes) no longer re-highlight unchanged code, and initialization errors are logged once instead of on every render. Reinitializing after a failed initialization now clears the stale error state instead of showing it during the retry.
