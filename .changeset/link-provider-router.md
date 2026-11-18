---
"@cloudflare/kumo": major
---

Links now resolve navigation in one place. `LinkProvider` decides whether a link renders through your router or a plain `<a>`, and whether it opens in a new tab. `Link`, `Button` with `href`, `Banner.Action`, `Toolbar.Link`, `DropdownMenu.LinkItem`, `Sidebar` menu buttons, `Breadcrumbs.Link`, `TableOfContents.Item` and `.Group`, and `PoweredByCloudflare` all follow the same rules. Links that open in a new tab get a visible icon and a localized screen-reader announcement automatically.

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

### `LinkButton` → `Button` with `href`

- `LinkButton` and `LinkButtonProps` are removed. Replace `<LinkButton href="…">` with `<Button href="…">`.
- `Button` defaults to `variant="secondary"`. `LinkButton` defaulted to `"ghost"`, so add `variant="ghost"` where you relied on that default.
- `external` (and the undocumented `linksExternal`) are removed. Use the provider's `externalLinks="new-tab"`, or `target="_blank"` on the button.
- An icon-only `Button href` (`shape="square"` or `"circle"`) now requires `aria-label`, `aria-labelledby`, or `title`, like an icon-only `Button`. `loading` isn't accepted with `href`.
- A disabled `Button href` still renders a disabled `<button>` instead of a link, with the same behavior as any disabled `Button`.
- The rendered element has `data-kumo-component="Button"` and `data-kumo-part="link"`, both when enabled and when disabled. It used to have `data-kumo-component="LinkButton"`.
- `ButtonProps` now includes the link variant. Use `Exclude<ButtonProps, { href: string }>` for button-only props. `Button`'s ref is typed `HTMLButtonElement | HTMLAnchorElement`.

### `Banner.Action` and `Toolbar.Link`

- `external` is removed. Use the provider's `externalLinks="new-tab"`, or `target="_blank"`.
- Link actions render `data-kumo-component="Button"` instead of `"LinkButton"`.
- `ToolbarLinkProps` is now derived from the `Button` link props.

### `DropdownMenu`

- `DropdownMenu.Item`'s `href` prop is removed. Replace `<DropdownMenu.Item href="…">` with `<DropdownMenu.LinkItem href="…">`. `icon`, `variant`, and `inset` work the same. `selected` isn't supported on `LinkItem`.
- `Item href` opened every `http(s)://` and `//` URL in a new tab with `rel="noreferrer"`. `LinkItem` doesn't. To keep that behavior, set `externalLinks="new-tab"` on `LinkProvider` or pass `target="_blank"` on the item.
- `DropdownMenu.LinkItem` now resolves through `LinkProvider`. Before, it always rendered a plain `<a>`, so internal items did a full page load even with a router configured. Now they render through `router`.
- `DropdownMenu.LinkItem` no longer accepts `render`. Configure routing on `LinkProvider`, and use `newTabIcon` to hide the new-tab icon.

### `Sidebar` and `Breadcrumbs`

- `Sidebar.MenuButton` and `Sidebar.MenuSubButton` with `href`, and `Breadcrumbs.Link`, resolve through `LinkProvider`. External URLs and links with `target="_blank"` no longer reach your router component.

### `TableOfContents`

- `TableOfContents.Item` and `TableOfContents.Group` with `href` resolve through `LinkProvider`. Items with in-page fragments (`#intro`) stay plain anchors.
- `TableOfContents.Item`'s `render` is now only for custom non-link elements, such as `render={<button type="button" />}`. Remove `render={<RouterLink />}`; configure the router on `LinkProvider` instead. An element passed to `render` doesn't go through `LinkProvider`.

### `PoweredByCloudflare`

- The badge no longer always opens in a new tab. It follows the provider's `externalLinks` policy, which defaults to the current tab. Pass `target="_blank"` to keep the old behavior. When it opens in a new tab, it shows the new-tab icon and announcement like any other link; `newTabIcon={false}` hides the icon.

## New-tab behavior (all link components)

Every link that opens in a new tab, whether from `target="_blank"` or from `externalLinks="new-tab"`, now:

- gets `rel="noopener noreferrer"` unless you pass `rel`
- shows a new-tab icon (`newTabIcon={false}` hides it)
- adds "(opens in a new tab)" to its accessible name, whether the link is named by its content, `aria-label`, or `aria-labelledby`. Translate it with `KumoLocaleProvider` (`translations.link.opensInNewTab`).

Update tests that depend on the old output:

- Tests that match exact accessible names, for example `getByRole("link", { name: "Docs" })`, need the suffix: `"Docs (opens in a new tab)"`.
- The `aria-label` attribute itself includes the suffix, and `aria-labelledby` gains the id of a visually hidden element.
- The link contains an extra `<svg aria-hidden="true">` and a `<span class="sr-only" data-kumo-part="new-tab-cue">`, so exact `textContent` or `toHaveTextContent` checks change.
- Tests that looked for `data-kumo-component="LinkButton"` should look for `data-kumo-component="Button"` with `data-kumo-part="link"`.

## Added

- `useLink` hook, plus the `RouterLinkProps`, `RouterLinkComponent`, `LinkProviderProps`, `ExternalLinksPolicy`, `UseLinkOptions`, `UseLinkResult`, and `LinkElementType` types
- `newTabIcon` on `Link`, `Button` with `href`, `DropdownMenu.LinkItem`, `TableOfContents.Item`, and `PoweredByCloudflare`
- `link.opensInNewTab` in `KumoTranslations`
