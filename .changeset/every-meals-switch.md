---
"@cloudflare/kumo": minor
---

Sidebar: mobile rewrite, smooth collapse transitions, and new props

**New features:**

- `mobileBreakpoint` prop on Provider — configurable viewport width for mobile detection
- `contentClassName` prop on Sidebar root — pass-through class for the inner content container
- Controlled mobile state — `open` prop now controls the mobile sidebar too, not just desktop

**Fixes:**

- Replaced Base UI Dialog mobile sidebar with a plain `<nav>` + backdrop for simpler, more predictable transitions
- Collapsible sections now animate closed smoothly when the sidebar collapses instead of snapping shut
- Removed `hidden` class from `Sidebar.MenuSub` so sub-menus participate in collapse animations
- Removed `inertValue` React-version helper — `SidebarSlidingView` now sets `inert` imperatively for React 18 compatibility
- Restored `inert` on closed `SidebarCollapsibleContent` while removing its `data-open` attribute

**Styling:**

- `bg-kumo-tint` → `bg-(--sidebar-active-bg)` CSS variable for active/hover/focus backgrounds
- Icon opacity `0.5` → `0.4`; chevron gains hover opacity transition
- Header gains `shrink-0` and animated padding on collapse
- Content scroll area gains animated `gap` transition and `tabIndex={-1}` on viewport
- Sliding views container gains `max-w-(--sidebar-width)` to prevent overflow
- Mobile sidebar uses `--sidebar-animation-duration` CSS variable for slide transition
