---
"@cloudflare/kumo": major
---

`Button` accepts `href` and replaces `LinkButton`. Link buttons, `Banner.Action`, and `Toolbar.Link` resolve through `LinkProvider` like `Link`.

## Migration

### `LinkButton` → `Button` with `href`

- `LinkButton` and `LinkButtonProps` are removed. Replace `<LinkButton href="…">` with `<Button href="…">`.
- `href` only changes the element, not the styling: a `Button href` takes the same `variant`, `size`, and `shape` defaults as any `Button` (`variant="secondary"`). `LinkButton` had its own default of `"ghost"`, so a `LinkButton` without a `variant` needs `variant="ghost"` to look the same.
- `external` (and the undocumented `linksExternal`) are removed. Use the provider's `externalLinks="new-tab"`, or `target="_blank"` on the button.
- An icon-only `Button href` (`shape="square"` or `"circle"`) now requires `aria-label`, `aria-labelledby`, or `title`, like an icon-only `Button`. `loading` isn't accepted with `href`.
- A disabled `Button href` still renders a disabled `<button>` instead of a link, with the same behavior as any disabled `Button`.
- The rendered element has `data-kumo-component="Button"` and `data-kumo-part="link"`, both when enabled and when disabled. It used to have `data-kumo-component="LinkButton"`.
- `ButtonProps` now includes the link variant. Use `Exclude<ButtonProps, { href: string }>` for button-only props. `Button`'s ref is typed `HTMLButtonElement | HTMLAnchorElement`.

### `Banner.Action` and `Toolbar.Link`

- `external` is removed. Use the provider's `externalLinks="new-tab"`, or `target="_blank"`.
- Link actions render `data-kumo-component="Button"` instead of `"LinkButton"`.
- `ToolbarLinkProps` is now derived from the `Button` link props.

## New-tab behavior

`Button href`, `Banner.Action href`, and `Toolbar.Link` get the same new-tab icon, `rel`, and accessible-name suffix as `Link`. An icon-only `Button href` (`shape="square"` or `"circle"`) hides the visible icon by default to keep its shape; pass `newTabIcon` to show it.

Tests that looked for `data-kumo-component="LinkButton"` should look for `data-kumo-component="Button"` with `data-kumo-part="link"`.

## Added

- `href` and `newTabIcon` on `Button`
