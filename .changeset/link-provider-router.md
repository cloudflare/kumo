---
"@cloudflare/kumo": major
---

Links now resolve navigation in one place. `LinkProvider` decides whether a link renders through your router or a plain `<a>`, and whether it opens in a new tab. `Link`, `Sidebar` menu buttons, and `Breadcrumbs.Link` follow these rules in this change; the remaining link-like components move over in follow-up changes. Links that open in a new tab get a visible icon and a localized screen-reader announcement automatically.

## How links resolve

- Relative URLs (`/zones`, `settings`, `?q=1`) are internal and render through `router`, unless `isClientRoute` returns `false`.
- In-page fragments (`#top`) always render a plain `<a>`, so the browser scrolls to them. Router links don't.
- Absolute `http(s)` URLs are external and render a plain `<a>`, unless they match `origin`. Protocol-relative URLs (`//example.com`) and hrefs that the URL parser resolves to another host (such as `/\example.com`) are treated the same way: external unless they match `origin`.
- `mailto:`, `tel:`, and other non-HTTP schemes, links with `download`, and links with a `target` other than `_self` always render a plain `<a>`.
- External links stay in the current tab unless the provider sets `externalLinks="new-tab"`. A link's own `target` always wins: `target="_blank"` opens a new tab, including for internal paths, and `target="_self"` keeps the current tab.

## Migration

### `LinkProvider`

- The `component` prop is replaced by `router`:

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

- The router component only receives internal links, and `href` is always a string. Previously it received every link, including external URLs and `mailto:`. Remove URL classification and `target`/`rel` logic from your wrapper. Use the new provider props instead:
  - `externalLinks="new-tab"` to open external links in new tabs
  - `isClientRoute(url)` to send some internal paths to a plain `<a>`, such as paths owned by another app on the same origin
  - `origin` to treat absolute URLs on your own origin as internal. Pass the same value during server rendering and hydration.
- Kumo components never pass `to` to the router component. `Breadcrumbs.Link` used to pass only `to`, and `LinkButton`, `Sidebar`, and `DropdownMenu.Item` passed both `to` and `href`. Read `href` in your wrapper.
- `useLinkComponent` and `LinkComponentProps` are removed. Use `useLink` and `RouterLinkProps`.

### `Link`

- `to` is removed. Use `href`.
- `render` is removed. For custom link UI, use `useLink`, which returns `Component`, `linkProps`, and `newTabCue`. Render all three.
- `Link.ExternalIcon` is removed. Remove manual icons; links that open in a new tab show the icon automatically. Hide it with `newTabIcon={false}`; the announcement stays.

### `Sidebar` and `Breadcrumbs`

- `Sidebar.MenuButton` and `Sidebar.MenuSubButton` with `href`, and `Breadcrumbs.Link`, resolve through `LinkProvider`. External URLs and links with `target="_blank"` no longer reach your router component.

## New-tab behavior (all link components)

Every link that opens in a new tab, whether from `target="_blank"` or from `externalLinks="new-tab"`, now:

- gets `rel="noopener"`. A `rel` you pass is kept, and `noopener` is added to it unless it already has `noopener`, `noreferrer`, or `opener`. Add `noreferrer` yourself if the destination shouldn't see where the visit came from.
- shows a new-tab icon (`newTabIcon={false}` hides it).
- adds "(opens in a new tab)" to its accessible name, whether the link is named by its content, `aria-label`, or `aria-labelledby`. Translate it with `KumoLocaleProvider` (`translations.link.opensInNewTab`).

`Link` now renders inline instead of `inline-flex`, so the icon follows the last word of wrapped text. A `Link` whose direct child is an `<svg>` or a `Badge` keeps `inline-flex` and its old alignment. If you relied on flex behavior for other content, add `className="inline-flex items-center"`.

Update tests that depend on the old output:

- Tests that match exact accessible names, for example `getByRole("link", { name: "Docs" })`, need the suffix: `"Docs (opens in a new tab)"`.
- The `aria-label` attribute itself includes the suffix, and `aria-labelledby` gains the id of a visually hidden element.
- The link contains an extra `<span class="sr-only" data-kumo-part="new-tab-cue">`, so exact `textContent` or `toHaveTextContent` checks change.
- The visible icon is not an element: Kumo's stylesheet draws it as a `::after` on links with the `data-kumo-new-tab-icon` attribute. Assert on that attribute instead of looking for an `<svg>`. A word joiner glues the icon to the last word, so it wraps with the text; it has empty alt text and is not part of the accessible name. Apps that don't load Kumo's CSS get the announcement but no icon.

## Added

- `useLink` hook, plus the `RouterLinkProps`, `RouterLinkComponent`, `LinkProviderProps`, `ExternalLinksPolicy`, `UseLinkOptions`, `UseLinkResult`, and `LinkElementType` types
- `newTabIcon` on `Link`
- `link.opensInNewTab` in `KumoTranslations`
