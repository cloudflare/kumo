---
"@cloudflare/kumo": major
---

Links now resolve navigation in one place. `LinkProvider` decides whether a link renders through your router or a plain `<a>`, and whether it opens in a new tab. `Link`, `Button href`, `Banner.Action`, `Toolbar.Link`, `DropdownMenu.LinkItem`, `Sidebar`, and `Breadcrumbs` all use the same rules. Links that open in a new tab get a visible icon and a localized screen-reader announcement automatically.

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

- `LinkButton` and `LinkButtonProps` are removed. Use `Button` with `href`. `Button href` defaults to `variant="secondary"` like every `Button`; `LinkButton` defaulted to `"ghost"`, so add `variant="ghost"` where you relied on that default. A disabled `Button href` renders a disabled `<button>`, as `LinkButton` did.
- The `external` prop is removed from `LinkButton`, `Banner.Action`, and `Toolbar.Link`. Set `externalLinks="new-tab"` on `LinkProvider`, or pass `target="_blank"` on the link.
- `DropdownMenu.Item`'s `href` prop is removed. Use `DropdownMenu.LinkItem`. `DropdownMenu.LinkItem` no longer accepts `render`; it resolves through `LinkProvider`.
- `Link.ExternalIcon` is removed. Links with `target="_blank"` (or opened in a new tab by `externalLinks="new-tab"`) show the icon automatically. Hide it with `newTabIcon={false}`; the announcement stays. Remove any icons you added by hand.
- `Link`'s `to` prop is removed. Use `href`.
- `Link`'s `render` prop is removed. Use `useLink` for custom link UI.
- `useLinkComponent` and `LinkComponentProps` are removed. Use `useLink` and `RouterLinkProps`.
- Links that open in a new tab now default to `rel="noopener noreferrer"` and include "(opens in a new tab)" in their accessible name. Update tests that match exact accessible names. Translate the text with `KumoLocaleProvider` (`link.opensInNewTab`).
- Rendered link buttons use `data-kumo-component="Button"` with `data-kumo-part="link"` instead of `data-kumo-component="LinkButton"`.
- Router components receive `href` instead of `to` from every Kumo component.
