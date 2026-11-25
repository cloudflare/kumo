---
"@cloudflare/kumo": major
---

`Button` accepts `href` and replaces `LinkButton`. Link buttons, `Banner.Action`, and `Toolbar.Link` resolve through `LinkProvider` like `Link`.

## Migration

### `LinkButton` → `Button` with `href`

- `LinkButton` and `LinkButtonProps` are removed. Replace `<LinkButton href="…">` with `<Button href="…">`.
- `href` only changes the element, not the styling: a `Button href` takes the same `variant`, `size`, and `shape` defaults as any `Button` (`variant="secondary"`). `LinkButton` had its own default of `"ghost"`, so a `LinkButton` without a `variant` needs `variant="ghost"` to look the same.
- `external` (and the undocumented `linksExternal`) are removed. Use the provider's `externalLinks="new-tab"`, or `target="_blank"` on the button.
- An icon-only `Button href` (`shape="square"` or `"circle"`) now requires `aria-label`, `aria-labelledby`, or `title`, like an icon-only `Button`. As on `Button`, `title` also becomes the link's `aria-label` when there's no other name. `loading` isn't accepted with `href`.
- A disabled `Button href` still renders a disabled `<button>` instead of a link, with the same behavior as any disabled `Button`. Its `ref` points at that `<button>`.
- The rendered element has `data-kumo-component="Button"` and `data-kumo-part="link"`, both when enabled and when disabled. It used to have `data-kumo-component="LinkButton"`.
- `ButtonProps` now includes the link variant. Wrappers built on `Omit<ButtonProps, …>` lose button-only props such as `type`, `form`, `name`, and `value`. Build them on the new `ButtonElementProps` (button only) or `ButtonLinkProps` (link only) instead. `Button`'s ref is typed `HTMLButtonElement | HTMLAnchorElement`.
- `href` must be a string. `<Button href={url}>` with a `url` that may be `undefined` doesn't compile; render `url ? <Button href={url}>…</Button> : <Button>…</Button>` instead.

### `Banner.Action` and `Toolbar.Link`

- `external` is removed. Use the provider's `externalLinks="new-tab"`, or `target="_blank"`.
- `Banner.Action` links render `data-kumo-component="Button"` instead of `"LinkButton"`. `Toolbar.Link` keeps `data-kumo-component="Toolbar.Link"`; both have `data-kumo-part="link"`.
- `ToolbarLinkProps` is now derived from the `Button` link props, so an icon-only `Toolbar.Link` with `shape="square"` or `"circle"` requires `aria-label`, `aria-labelledby`, or `title`.
- `ToolbarButtonProps` keeps the same rule: an icon-only `Toolbar.Button` with `shape="square"` or `"circle"` now requires `aria-label`, `aria-labelledby`, or `title`, like `Button`. Without one, screen readers announced it as just "button". This is a type-only change.

## New-tab behavior

`Button href`, `Banner.Action href`, and `Toolbar.Link` get the same new-tab icon, `rel`, and accessible-name suffix as `Link`. An icon-only `Button href` (`shape="square"` or `"circle"`) hides the visible icon by default to keep its shape; pass `newTabIcon` to show it.

Tests that looked for `data-kumo-component="LinkButton"` should look for `data-kumo-component="Button"` with `data-kumo-part="link"`.

## Added

- `href` and `newTabIcon` on `Button`
