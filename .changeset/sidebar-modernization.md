---
"@cloudflare/kumo": minor
---

Sidebar: comprehensive modernization

**Breaking changes:**
- Removed `Sidebar.Input` — build custom search triggers inline
- Removed `Sidebar.MenuAction` — unused in practice
- Removed `Sidebar.GroupContent` and group-level collapsible props (`collapsible`, `defaultOpen`, `open`, `onOpenChange`) from `Sidebar.Group` — use `Sidebar.Collapsible` at the item level instead
- Replaced Base UI Collapsible dependency with custom CSS grid-rows implementation
- `SidebarState` type is now `"expanded" | "collapsed" | "peeking"` (was `"expanded" | "collapsed"`)

**New features:**
- `contained` prop on Provider — absolute positioning for embedded/demo sidebars
- `peekable` prop on Provider — hover/focus collapsed sidebar to temporarily expand
- `animationDuration` prop on Provider — configurable animation timing
- `Sidebar.SlidingViews` + `Sidebar.SlidingView` — animated horizontal transitions between navigation surfaces
- Animated `SidebarPanelIcon` replacing Phosphor `SidebarSimpleIcon`
- Enhanced `Sidebar.Trigger` with `aria-expanded` and dynamic `aria-label`
- Keyboard-accessible resize handle (arrow keys, Home, End)
- Custom `Sidebar.Collapsible` with keyboard auto-expand on focus

**Token/styling fixes:**
- `border-kumo-hairline` → `border-kumo-line` throughout
- Hardcoded `duration-250` → `--sidebar-animation-duration` CSS custom property
- `bg-kumo-base` → `bg-(--sidebar-bg)` for theme overridability
- Focus styles: `ring-2/ring-kumo-brand` → `outline-none/text-kumo-strong/bg-kumo-tint`
- Icon opacity-50, updated spacing (header h-58px, footer h-12, menu gap-y-px)
- `isolate` on sidebar root with low z-index (z-1, z-2) instead of z-20/z-50
- Mobile sidebar now has correct `data-state`/`data-side`/`data-variant`/`data-collapsible` attributes
