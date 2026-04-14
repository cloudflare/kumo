---
"@cloudflare/kumo": patch
---

fix(pagination, input): accessibility and i18n improvements

**Pagination:**

- Add `labels` prop for internationalization of aria-label strings
- Customizable labels: `firstPage`, `previousPage`, `nextPage`, `lastPage`, `pageNumber`, `pageSize`
- Default English labels maintained for backwards compatibility
- For visible text customization, use existing render props:
  - `Pagination.Info` children for "Showing X of Y" text
  - `Pagination.PageSize` label prop for "Per page:" text

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
  }}
  page={page}
  setPage={setPage}
  perPage={10}
  totalCount={100}
>
  <Pagination.Info>
    {({ pageShowingRange, totalCount }) => (
      <>
        Affichage de {pageShowingRange} sur {totalCount}
      </>
    )}
  </Pagination.Info>
  <Pagination.PageSize
    label="Par page :"
    value={perPage}
    onChange={setPerPage}
  />
  <Pagination.Controls />
</Pagination>
```
