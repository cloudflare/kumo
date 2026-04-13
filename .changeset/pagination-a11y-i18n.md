---
"@cloudflare/kumo": patch
---

fix(pagination, input): accessibility and i18n improvements

**Pagination:**

- Add `labels` prop for internationalization of all UI strings
- All aria-labels and visible text can now be customized for different locales
- Default English labels maintained for backwards compatibility

**Input:**

- Fix accessibility check that incorrectly required both `placeholder` AND `aria-label`
- Now `aria-label` alone is sufficient (correct per WCAG)

Example i18n usage:

```tsx
<Pagination
  labels={{
    firstPage: "Première page",
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    lastPage: "Dernière page",
    pageNumber: "Numéro de page",
    pageSize: "Taille de page",
    perPageLabel: "Par page :",
    showingInfo: (range, total) => `Affichage de ${range} sur ${total}`,
  }}
  // ...
/>
```
