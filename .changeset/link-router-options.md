---
"@cloudflare/kumo": minor
---

Link components accept `routerOptions` for per-link router options, such as React Router's `state` and `replace`.

- `Link`, `ResolvedLink`, `useLink`, `Button href`, `Banner.Action`, `Toolbar.Link`, `DropdownMenu.LinkItem`, `Breadcrumbs.Link`, `Sidebar.MenuButton`, `Sidebar.MenuSubButton`, `TableOfContents.Item`, and `TableOfContents.Group` accept `routerOptions`.
- The `LinkProvider` router component receives it as the `routerOptions` prop, only when the link renders through the router. Links that render a plain `<a>` (other origins, new tabs, downloads) drop it.
- Type it once by augmenting the new `Register` interface:

```ts
declare module "@cloudflare/kumo" {
  interface Register {
    routerOptions: { state?: unknown; replace?: boolean };
  }
}
```

Without `Register`, `routerOptions` accepts any object. This replaces passing router props through `Link`'s removed `render` prop.
