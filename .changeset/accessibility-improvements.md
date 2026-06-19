---
"@cloudflare/kumo": minor
---

Improve accessibility across Kumo components, charts, and docs.

### Components

- Improve CommandPalette screen reader context with a dialog title, named inputs, busy, loading, and empty-state announcements, localizable labels for status and action text, and decorative icons hidden from assistive technology.
- Hide Banner icons from assistive technology because they duplicate the surrounding banner text.
- Improve SensitiveInput semantics with localizable labels and status text, warnings for missing or generic primary names, clearer warning and error text, compact hit areas that do not change the visual layout where possible, and decorative icons that are hidden from assistive technology.
- Add accessible-name warnings for Switch, associate Switch groups with descriptions and errors, announce invalid and error states, and expand Switch hit areas without changing compact visuals where possible.
- Improve Button icon-only guidance with accessible-name warnings, decorative icon handling, and compact hit areas that preserve the existing visual size where possible.
- Associate Checkbox, Radio, and Switch groups with group descriptions and error messages so assistive technology receives the surrounding form context.
- Associate helper and error text for aria-label-only Select, Combobox, Autocomplete, SensitiveInput, and InputGroup patterns.
- Add Combobox and Autocomplete warnings for placeholder-only naming, and document localized clear, show, and remove labels.
- Make Breadcrumbs navigation and copy action labels localizable, hide decorative separators and icons from assistive technology, and keep clipboard actions focus-visible.
- Add localized Table selection and resize labels, slimmer resize hit areas, and more targeted metadata so row and column controls are announced clearly.
- Expand compact control hit areas without changing compact visuals where possible by using non-layout or pseudo-element targets.

### Charts

- Add chart wrapper label and description support so charts can expose concise names and longer context.
- Merge ECharts aria and reduced-motion options with Kumo defaults instead of replacing app-provided configuration.
- Announce Timeseries loading state and add non-drag range controls with localizable labels and value formatting.
- Improve Sankey labels and descriptions, enable aria support, add keyboard node and link actions, and make action labels localizable.
- Clarify ChartLegend static versus interactive semantics, use native buttons for interactive items, expose aria-pressed state, and expand compact hit areas without changing compact visuals where possible.

### Blocks

- Improve DeleteResource confirmation with alert-dialog semantics, a dialog description, and announced error messages.

### Docs

- Add skip link behavior and improve SidebarNav disclosure state, current-page announcements, mobile drawer focus management, and inert background behavior.
- Improve StickyDocHeader handling for hidden duplicate content and expand icon link hit areas without changing compact visuals where possible.
- Hide decorative icons from assistive technology and respect reduced-motion preferences in docs UI where motion is used.
- Clean up demos and snippets that used empty links, clickable divs, placeholder-only controls, unlabeled icons, and placeholder href values.
- Add accessibility and internationalization guidance to affected docs pages so examples call out labels, descriptions, clear, show, and remove actions, chart context, dialog errors, and compact target patterns.
