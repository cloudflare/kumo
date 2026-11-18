---
"@cloudflare/kumo": major
---

Links now resolve navigation in one place. `LinkProvider` decides whether a link renders through your router or a plain `<a>`, and whether it opens in a new tab. Links that open in a new tab get a visible icon and a localized screen-reader announcement automatically.

**Breaking changes**

- `LinkProvider`'s `component` prop is replaced by `router`. The router component receives internal links only, with `href` as a string. Map it to your router's destination prop:

  ```tsx
  const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
    ({ href, ...props }, ref) => (
      <ReactRouterLink ref={ref} to={href} {...props} />
    ),
  );

  <LinkProvider router={RouterLink}>
    <App />
  </LinkProvider>;
  ```

  Remove any URL classification from your wrapper. Use the new provider props instead: `externalLinks="new-tab"`, `isClientRoute`, and `origin`.

- `Link.ExternalIcon` is removed. Links with `target="_blank"` (or opened in a new tab by `externalLinks="new-tab"`) show the icon automatically. Hide it with `newTabIcon={false}`; the announcement stays.
- `Link`'s `to` prop is removed. Use `href`.
- `Link`'s `render` prop is removed. Use `useLink` for custom link UI.
- `useLinkComponent` and `LinkComponentProps` are removed. Use `useLink` and `RouterLinkProps`.
- Links that open in a new tab now default to `rel="noopener noreferrer"` and include "(opens in a new tab)" in their accessible name. This also applies to `LinkButton`, `Banner.Action`, and `Sidebar` links. Update tests that match exact accessible names. Translate the text with `KumoLocaleProvider` (`link.opensInNewTab`).
- Router components no longer receive a `to` prop from `LinkButton`, `Sidebar`, `Breadcrumbs`, or `DropdownMenu.Item`. They receive `href`.
