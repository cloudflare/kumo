---
"@cloudflare/kumo": minor
---

Add `fullScreenOnMobile` prop to `Sidebar`. When set, the mobile navigation
sheet expands to the full viewport instead of leaving a sliver of the page
visible, giving nav items comfortable touch targets. The backdrop is suppressed
and the divider border dropped, since neither has anything to separate. Defaults
to `false`.

Also adds `Sidebar.Close`, a ghost button that dismisses the mobile sheet. It is
intended for `Sidebar.Header` in full-screen mobile layouts where the backdrop is
hidden and there is no adjacent page content to tap.

Also fixes `Breadcrumbs.Link` shrinking alongside the current crumb. Flexbox
distributed truncation across every crumb, turning the trail into unreadable
stubs; ancestors now hold their width so only the current page truncates.
