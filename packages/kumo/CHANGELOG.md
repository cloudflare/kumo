# @cloudflare/kumo

## 1.18.0

### Minor Changes

- b1e51a8: Add Enter key navigation to Pagination page number input and new `pageSelector` prop for dropdown mode
  - The page number input in `Pagination.Controls` now navigates on Enter key press (previously only on blur)
  - New `pageSelector` prop on `Pagination.Controls`: set to `"dropdown"` to render a Select dropdown instead of a text input for page selection

- e676f0b: Add disabled option support, groups, group labels, and separators to Select
  - `Select.Option` now accepts `disabled` and `className` props
  - New `Select.Group` and `Select.GroupLabel` sub-components for organizing options under labeled headers
  - New `Select.Separator` sub-component for visual dividers between groups
  - The `items` object-map prop now accepts `SelectItemDescriptor` values with `disabled` metadata

- a685953: Expose `delay` and `closeDelay` props on Tooltip component to control open and close timing. These props are forwarded to the underlying Base UI Trigger component.

### Patch Changes

- dacf445: Input and InputArea now automatically apply error styling when the `error` prop is truthy. You no longer need to set `variant="error"` separately - just pass an error message and the styling is applied automatically. The `variant="error"` prop is now deprecated but still works for backwards compatibility.
- 44c26f5: Adjust semantic tint usage for status/error ring styles across core form and feedback components.
  - Update background styles in `Badge` and `Banner` components to use `*-tint` tokens.
  - Update `kumo-danger` to a darker token to improve a11y contrast.
  - Update error ring styling in form components to use semantic tokens (now darker with token swap).
  - Removed `text-color-badge-red-subtle` token in replacement of the `danger` token.
  - Update theme generator color mappings used by these tints to improve visual consistency.

- 2bb8628: Fix CodeBlock crash when an unsupported `lang` value is passed at runtime. The `codeVariants()` function now uses optional chaining with a nullish coalescing fallback to the default language, matching the defensive pattern already used by `switchVariants()` and `badgeVariants()`.
- e8bcf6f: fix(select): use ring-kumo-hairline token in Select popup (missed in PR #355)
- c3beded: Fix Select popup scrolling and height behavior; align popup/list structure with Base UI. Split popup into frame (Popup) and scroll container (List) to match Combobox pattern and fix touch scroll on long lists.
- 4a2fb02: fix(loader): add ARIA attributes for screen reader accessibility

  Added `role="status"` and `aria-label="Loading"` to the Loader SVG component to make it accessible to screen readers. This resolves a WCAG 2.1 SC 4.1.3 (Status Messages) violation where assistive technology users received no indication that content was loading.

- 5e4c7b1: Refine badge semantics/fill styling and banner tone updates
  - Rework `Badge` variant model to prioritize semantic variants (`primary`, `secondary`, `error`, `warning`, `success`, `info`) with updated descriptions and `primary` as default.
  - Keep token color variants for product-specific use cases while updating class mappings so semantic and token variants are distinct.
  - Slight updates to token color variants to meet a11y contrast requirements.
  - Update token color variants by replacing `yellow` with `purple` since `yellow` doesn't meet a11y contrast requirements, and keeping docs/demo examples in sync.
  - Update badge docs demos/content to focus on primary semantic badges and a consolidated "other variants" section.
  - Adjust banner variant surfaces (`default`, `alert`, `error`) to stronger tinted backgrounds and borders.
  - Update theme generator badge/semantic token mappings and regenerate `theme-kumo.css` to match the new badge color system.

- 6458fae: Fix Switch label click not toggling when a custom `id` prop is provided

  The `id` was not being forwarded to Base UI's `Switch.Root`, causing a mismatch between the label's `htmlFor` and the button's actual `id`.

- cf6b917: Align semantic token documentation and docs presentation updates.
  - Update `colors.mdx` token documentation structure.
  - Replaced `kumo-ring` with `kumo-hairline` for border/ring colors and all its instances in kumo components and docs.
  - Sync `packages/kumo/ai/USAGE.md` token reference categories and descriptions with the docs token guide.
  - Adjust the typo in the recessed dark token value in theme generator config and regenerate `theme-kumo.css`.
  - Updated `kumo-fill-hover` token value from `neutral-700` to `neutral-800`

## 1.17.0

### Minor Changes

- 355a1b5: Badge: add color-based variants and deprecate semantic variants
  - Add color variants: `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `neutral`, `inverted`
  - Add subtle variants for each color (`red-subtle`, `orange-subtle`, etc.) with lighter backgrounds and darker text
  - Retain `outline` and `beta` variants unchanged
  - Deprecate `primary` (use `inverted`), `secondary` (use `neutral`), `destructive` (use `red`), `success` (use `green`)
  - Dark mode support: subtle variants flip to dark backgrounds with light text, regular color variants darken slightly, inverted flips to white bg with black text
  - Default variant changed from `primary` to `neutral`

- 250a6dd: Add `action` prop to Banner for rendering CTA buttons alongside structured title/description content without resorting to the `children` prop.
- 8c244d2: Refresh semantic surface color tokens and component surface usage.
  - Add and adopt `kumo-canvas` as the page-level surface token in theme output and docs usage.
  - Rebalance neutral token values in `kumo-binding.css` and generated theme variables for improved light/dark surface hierarchy.
  - Update surface-related component styling (`LayerCard`, `MenuBar`, `Tabs`) to align with the refreshed `canvas`/`elevated`/`recessed` layering model.
  - Update token usage guidance in `ai/USAGE.md` to reflect page vs component background roles.

- ef15662: Make timeseries' highlighted on hovering a data point
- cd0c22f: Add Shadow DOM support via `KumoPortalProvider` and `container` prop on all portal-based components

  All overlay components (Dialog, DropdownMenu, Combobox, Select, Tooltip, Popover, CommandPalette, Toast) now support rendering inside Shadow DOM or custom containers.

  **New exports:**
  - `KumoPortalProvider` - Context provider to set default portal container for all overlays
  - `PortalContainer` - Type for portal container (HTMLElement, ShadowRoot, or ref)

  **Component updates:**
  All portal-based components now accept an optional `container` prop:
  - `Dialog` - `container` prop on Dialog component
  - `DropdownMenu.Content` - `container` prop
  - `Combobox.Content` - `container` prop
  - `Select` - `container` prop
  - `Tooltip` - `container` prop
  - `Popover.Content` - `container` prop
  - `CommandPalette.Root` and `CommandPalette.Dialog` - `container` prop
  - `Toasty` (Toast provider) - `container` prop

  **Usage:**

  Set once at the app level:

  ```tsx
  <KumoPortalProvider container={shadowRoot}>
    <App />
  </KumoPortalProvider>
  ```

  Or override per component:

  ```tsx
  <Dialog container={customContainer}>
    <Dialog.Title>Modal inside shadow DOM</Dialog.Title>
  </Dialog>
  ```

  When no provider or prop is set, components default to `document.body` (existing behavior).

- 17f21f3: SkeletonLine: add `blockHeight` prop to set a container height and vertically center the skeleton line within it
- d1f697b: Table: add `sticky` prop to `Table.Head` and `Table.Cell` for pinning columns to left/right edges, and `sticky` prop to `Table.Header` for sticky header rows. Uses `isolate` stacking context with `z-0`/`z-1`/`z-2` layering.
- 56e3640: Add `toml` as a supported language for syntax highlighting in the Code component
- f0c8952: Add `title` prop to `Button` — wraps the button in a `Tooltip` when provided.

### Patch Changes

- 7721bc5: Checkbox.Group & Radio.Group: remove fieldset border box and simplify styling
  - Remove `rounded-lg border border-kumo-line p-4` wrapper from both group fieldsets
  - Downsize legend from `text-lg` to `text-base` with inline-flex layout
  - Drop `font-medium` from Checkbox.Item and Radio.Item labels

- 6c21970: Fix missing disabled styling on Combobox triggers. `TriggerValue` and `TriggerMultipleWithInput` now apply `opacity-50` and `cursor-not-allowed` when disabled, matching the behaviour of the `Select` component.
- 0e4247a: Update dialog backdrop overlay to use `bg-kumo-recessed` token
- 0060bb9: Remove `ai/schemas.ts` from version control (now fully generated at build time)
- 04a1f07: Fix LayerCard.Primary stacking order when sandwiched between LayerCard.Secondary elements
- 94d50e2: Fix SensitiveInput focus ring and global CSS pollution
  - Fix focus ring not showing on container when inner input is focused (focus-within:outline)
  - Add defensive styles to eye toggle and copy buttons to prevent global CSS pollution
  - Fix inputVariants parentFocusIndicator using wrong selector ([&:has(:focus-within)] → focus-within:)

- db75c51: SkeletonLine: move `.skeleton-line` styles into `@layer base` so Tailwind utility classes (e.g. `className="h-6"`) can override the default height
- eb68b35: Tabs indicator now uses `translate-x` for its transition animation, replacing the CSS `left` transition with a GPU-accelerated transform.
- e21a6df: fix flow component not reflecting padding prop
- 29c56fd: `Surface`: replace `as` prop with Base UI `render` prop for polymorphism

  The `as` prop used a hand-rolled generic `forwardRef` pattern (with `as any` casts) that conflicted with how the rest of the library handles polymorphism via Base UI's `useRender` hook.

  `Surface` now accepts a `render` prop, consistent with `Link` and other components. The old `as` prop is kept as a deprecated alias and continues to work unchanged — no migration required.

  ```tsx
  // Still works (deprecated)
  <Surface as="section">...</Surface>

  // Preferred going forward
  <Surface render={<section />}>...</Surface>
  ```

- 9272b4a: Switch: polish squircle styling
  - Use `ring-inset` on thumb to prevent border protruding beyond the track
  - Make thumb ring transparent to remove visible border outline
  - Switch focus indicator from `ring` to `outline` with `outline-offset-2` to avoid clashing with the track's own ring border

- 6b15bac: fix(Tabs): update segmented tab spacing and track styling
  - Adjust segmented `Tabs` list styling colour to `bg-kumo-recessed` and added `ring` to make the Tabs background more visible
  - Remove extra edge spacing and keep the segmented track/indicator alignment consistent

- cfe814d: update toast styling to use a subtle ring and background that reflect each state.
- 7ac73d2: update status text token values for info and danger to improve a11y contrast ratio on banners.
- dcbf185: Add `truncate` prop to `Text` component. When `true`, applies `truncate min-w-0` classes to clip overflowing text with an ellipsis.

## 1.16.0

### Minor Changes

- c5f69b9: Make Chart components keyboard focusable with tabindex. Timeseries adds `ariaDescription` prop

### Patch Changes

- b3c44f1: Generate component-registry files at build time, remove from git

  Eliminates contributor friction by generating component-registry.json,
  component-registry.md, and schemas.ts during the build process instead of
  tracking them in git. Contributors will no longer see stale diffs or need to
  manually regenerate these files.
  - Add ai/component-registry.json and ai/component-registry.md to .gitignore
  - Convert ai/schemas.ts to a stub file for TypeScript compilation
  - Add codegen:registry to build script for deterministic generation

- 759f4e8: feat(code): add HCL (HashiCorp Configuration Language) as a supported syntax highlighting language
- a67fac7: fix(flow): connector lines no longer misalign when the page scrolls or a sidebar shifts the layout

  `getBoundingClientRect` values were stored in React state per node and later subtracted against a freshly-read container rect at connector-draw time. Any layout shift (sidebar open/close, page scroll, inner container scroll) between those two reads produced stale coordinates, causing connector lines to jump out of place or disappear entirely.

  Fix: add `scroll` and `resize` listeners (capture phase) at the `FlowNode`, `FlowParallelNode`, and `FlowNodeList` levels so all rects are remeasured after any layout shift. Connector computation in `FlowNodeList` and `FlowParallelNode` is also moved from the render phase into `useLayoutEffect` so the container rect and node rects are always read in the same synchronous pass.

- 15a344e: Add missing HCL language import to server-side Shiki bundle

  The HCL language was added to SupportedLanguage type and the client-side
  provider in a previous commit, but the server.tsx BUNDLED_LANGS object
  was missed. This caused typecheck failures when building.

- 5d8d3a9: Sidebar: polish animations, fix separator reflow bug, improve header spacing
- 7e82920: Fix connector alignment and spacing between adjacent parallel nodes in Flow diagrams

## 1.15.0

### Minor Changes

- 73f554a: Add success and info toast variants with semantic token styling. Migrate error/warning variants from raw CSS to semantic tokens for consistent theming.

### Patch Changes

- 9fbf3a8: Fix Radio compound component to use Object.assign pattern, enabling sub-component detection (Radio.Group, Radio.Item) in the component registry.
- 3430785: Revert outline button variant ring width from `ring-2` (2px) back to `ring` (1px) to restore visual consistency with existing dashboard usage.

## 1.14.1

### Patch Changes

- 839b0cb: fix: update styling for mostly-used components with new greyscale tokens (combobox, dialog, input, layerCard, select & tabs) as well as homegrid and component preview backgrounds.
- 7083a17: Remove es2022 build target that caused Jest/babel-jest test failures in stratus

## 1.14.0

### Minor Changes

- 8b2d6a0: Add radio card appearance via `appearance="card"` prop on Radio.Group and Radio.Item. Cards display a bordered, selectable container with title and description. Also adds `description` prop to Radio.Item for helper text. Supports vertical and horizontal orientations, error state, and disabled state.
- abbf586: Expose Chart `optionUpdateBehavior` to control how ECharts applies option updates; `notMerge` now defaults to `false`.
- c6aa554: Add neutral variant to Switch component and improve accessibility
  - New `variant="neutral"` option: monochrome switch with squircle shape, matching the design from stratus
  - Improved off-state visibility for default variant with darker background/ring colors
  - Removed `error` variant (not useful for toggle switches)
  - Added defensive fallback so invalid variant values don't cause runtime crashes

### Patch Changes

- f2e17d7: removed `outline-none` to bring back focus states on all buttons
- eba693e: Fix flaky vitest "Closing rpc while fetch was pending" error in deep-imports test
- db91f50: Fix InputArea label click not focusing textarea. Use FieldBase.Control with render callback to properly associate the label with the textarea element.
- 80afd4d: Fix TypeScript return types for ShikiProvider and CodeHighlighted components.

  Changed return type from `ReactNode` to `React.JSX.Element` to resolve JSX compatibility errors. This fixes issues when consuming these components in projects with stricter TypeScript configurations (e.g., `skipLibCheck: false`), where `ReactNode` was incorrectly inferred as a valid JSX element return type.

- dc9742d: Fix table header font size to ensure consistent rendering across dashboards with different default font sizes
- f94fee7: Add dedicated `kumo-placeholder` text color token and use it for Input, InputArea, SensitiveInput, and CommandPalette placeholder text. The new token provides better visual distinction between placeholder and active text in both light and dark modes.
- 66012b7: Replace the package-level ESLint pass with Oxlint JS plugin coverage for the remaining jsx-a11y rules, and pin the library build to `es2022` with a post-build browser-compat test that blocks newer runtime APIs from shipping in `dist`.
- e8acdd8: fix(Select): prevent chevron overflow with long multi-select values

  Added `min-w-0 truncate` to the value element and `shrink-0` to the chevron icon so that long option names truncate gracefully instead of pushing the chevron outside the select bounds.

## 1.13.1

### Patch Changes

- c272f6a: Fix combobox caret icon to use text-kumo-subtle with fill-current instead of invalid fill-kumo-subtle token
- 5e12c15: fix TimeseriesChart brush cursor not activating when loading prop transitions from true to false

## 1.13.0

### Minor Changes

- 56a8b35: add xAxisTickFormat, yAxisTickFormat, and tooltipValueFormat props to TimeseriesChart; deprecate yAxisTickLabelFormat

  ## Deprecation: yAxisTickLabelFormat is deprecated

  If you were using `yAxisTickLabelFormat` to customize tooltip output, switch to `tooltipValueFormat`.

  **Before:**

  ```tsx
  <TimeseriesChart yAxisTickLabelFormat={(v) => `${v} req/s`} />
  ```

  **After:**

  ```tsx
  <TimeseriesChart tooltipValueFormat={(v) => `${v} req/s`} />
  ```

## 1.12.1

### Patch Changes

- eda8362: Fix combobox caret icon visibility by using fill-kumo-subtle instead of fill-kumo-ring

## 1.12.0

### Minor Changes

- 4d6de27: reorganize greyscale tokens and update color preferences

### Patch Changes

- 2ff49b7: updated button styles for outline and secondary
- 59f7935: Fix Jest module resolution failures and reduce Shiki bundle size

  **Jest Fix:**
  - Add `chunkFileNames` config to prevent double-dash filenames (e.g., `combobox--ec3iibR.js`) that Jest cannot resolve
  - Move chunks to `dist/chunks/` subdirectory for cleaner structure

  **Bundle Size Reduction:**
  - Switch from full Shiki bundle to fine-grained imports via `shiki/core`
  - Reduce from ~300 language/theme chunks to ~16 bundled languages
  - Total JS files reduced from 358 to ~163 (54% reduction)

  **Supported Languages:**
  `javascript`, `typescript`, `jsx`, `tsx`, `json`, `jsonc`, `html`, `css`, `python`, `yaml`, `markdown`, `graphql`, `sql`, `bash`, `shell`, `diff`

  **Breaking Change:**
  - `BundledLanguage` type is now deprecated, use `SupportedLanguage` instead
  - Only the languages listed above are bundled; other Shiki languages are no longer available out of the box

- 9eaf584: Fix npm publish failure by removing cross-package dependency from prepublish hook

## 1.11.0

### Minor Changes

- 140f4ab: **Select: Improved label API to match Input component pattern**
  - `hideLabel` is now deprecated. When `label` is provided, the label is **visible by default** (previously hidden by default).
    - For visible labels: `<Select label="Country" />` (no changes needed if you were using `hideLabel={false}`)
    - For hidden labels: Use `<Select aria-label="Select a country" />` instead of `<Select label="Country" hideLabel={true} />`
  - **Bug fix**: Placeholder text now displays correctly when using object map `items` format (e.g., `items={{ a: "Option A" }}`). Previously, placeholders only worked with array format items.

  **Backward compatibility**: `hideLabel={true}` still works but shows a deprecation warning in development. Existing code using `hideLabel={false}` requires no changes.

  **Migration guide:**

  ```tsx
  // Before (label hidden by default)
  <Select label="Country" />                    // label was sr-only
  <Select label="Country" hideLabel={false} />  // label was visible

  // After (label visible by default, matching Input)
  <Select label="Country" />                    // label is now visible
  <Select aria-label="Country" />               // use aria-label for hidden labels
  ```

- f1c6392: Add optional `id` prop to `Flow.Node` for stable node identification and connector test IDs
- da03394: Avoid adding multiple toasts with the same ID. Use a subtle bump animation when a toast with an existing ID is added.

### Patch Changes

- a53ec1b: Fix theme token flicker by generating stable light/dark fallback variables with safer scope and layer precedence.
- cb121bc: fix: add defensive styles to prevent global CSS pollution

  ## Problem

  When Kumo components are used in applications with aggressive global styles (e.g., Stratus's `cfBaseStyles` layer), certain elements get polluted:
  - `label { margin-bottom: 1rem }` adds unwanted margins to all labels
  - `button { background: gray }` affects unstyled button wrappers (e.g., tooltip triggers)
  - `a { color: var(--text-color-primary) }` can override link colors if the consuming app defines `--text-color-primary` differently

  ## Solution

  Add defensive Tailwind utility classes directly to components. These:
  1. Reset commonly-polluted properties to safe defaults
  2. Use `cn()` (tailwind-merge) so consumer styles via `className` still override them
  3. Are no-ops in clean CSS environments (no visual change in Kumo docs)

  ## Changes

  ### Label margins (`m-0`)
  - **Label**: `labelVariants()` now includes `m-0`
  - **Field**: `FieldBase.Label` gets `m-0`
  - **Checkbox**: label wrapper gets `m-0`
  - **Radio**: label wrapper gets `m-0`
  - **Switch**: label wrapper gets `m-0`

  ### Button trigger resets
  - **Tooltip trigger** (when `!asChild`): `bg-transparent border-none shadow-none p-0 m-0 h-auto min-h-0 leading-[0] inline-flex items-center`
  - **Collapsible trigger**: `bg-transparent border-none shadow-none p-0 m-0`

  ### Link color namespace fix
  - **Link**: Changed from `text-primary` to `text-kumo-link` to avoid collision with consuming apps that define `--text-color-primary` differently

  ### Label tooltip composition
  - **Label**: Tooltip trigger now uses `<Button variant="ghost" size="xs" shape="square">` with `asChild`, leveraging composition instead of relying on defensive resets

  ## Docs

  Added "Custom Trigger" section to Tooltip docs demonstrating that `className` can fully override defensive styles when not using `asChild`.

- c6a3fb3: fix(dropdown): use Base UI CheckboxItemIndicator for proper accessibility

  Replace custom Checkbox component with Base UI's CheckboxItemIndicator in DropdownMenuCheckboxItem. The previous implementation nested an interactive Checkbox inside the menuitemcheckbox role, causing duplicate accessibility labels. CheckboxItemIndicator is automatically aria-hidden and only renders when checked, following the standard Base UI pattern.

- 1bfffaa: Fix Field error message line height by adding `leading-snug` for consistent text spacing
- 5d16fdb: Improve info banner dark mode contrast for WCAG AA compliance. Changes `kumo-info` from `blue-700` (L=48.8%) to `blue-400` (L=70.7%), achieving 7.97:1 contrast ratio against the banner background.
- 8b964f5: Fix Combobox.TriggerValue icon misalignment caused by inherited line-height

  The caret icon span was inheriting `line-height` from the parent button's `text-base` class, causing the span's height to exceed the icon's height (e.g., 21.5px vs 16px). The icon sits at the top of the span by default, so when the span is centered via `top-1/2 -translate-y-1/2`, the icon appears offset.

  Added `flex items-center` to the icon wrapper to ensure proper vertical centering regardless of inherited styles. This matches the pattern used in TriggerInput.

- 529274d: fix(Pagination): use aria-label instead of label for PageSize select

  The Select component now shows visible labels by default. Since Pagination.PageSize
  already displays "Per page:" text next to the select, the internal Select should use
  `aria-label` for accessibility without showing a duplicate visible label.

- 2f0e572: chore(toast): replace inline XIcon with Phosphor icon
- ee1099d: Prevent password managers autofilling Pagination input field
- 6dc952f: fix(tabs): improve focus ring and hover styling
  - Fixed focus ring to use proper `ring-kumo-ring` token instead of browser default blue
  - Segmented variant: inset focus ring to avoid overlap with adjacent tabs, hidden on active tab
  - Underline variant: added padding for better focus ring spacing around text
  - Added subtle hover states for both variants

- 2352344: fix(Tabs): pass TabItem render prop through to Base UI for custom tab rendering (e.g., link-based tabs)

## 1.10.0

### Minor Changes

- 5505610: Add Shiki-powered `CodeHighlighted` component for syntax highlighting
  - **New entry point**: `@cloudflare/kumo/code` - keeps Shiki out of main bundle
  - **ShikiProvider**: Lazy-loads Shiki on first render, shares instance across all children
  - **CodeHighlighted**: Syntax highlighting with line numbers, line highlighting, copy button
  - **Server utilities**: `@cloudflare/kumo/code/server` for SSR/static highlighting
  - **Themes**: Ships with `github-light` and `vesper` defaults, supports any Shiki theme
  - **i18n**: Customizable labels via provider or per-component
  - **CSS customization**: `--kumo-code-highlight-bg` variable for highlight color
  - **Deprecates**: Legacy `Code` and `CodeBlock` components (will be removed in v2)

- 003128b: feat(combobox): add size prop with xs, sm, base, lg variants matching Input component
- 1cad157: feat(flow): make nested lists work inside parallel nodes
- 9d89256: Add `role` prop to Dialog component supporting both `"dialog"` (default) and `"alertdialog"` ARIA roles

  **New Feature:**
  - `Dialog.Root` now accepts a `role` prop to specify the dialog's ARIA semantics
  - When `role="alertdialog"` is used, the dialog uses Base UI's AlertDialog primitives for proper accessibility
  - This provides correct screen reader announcements for confirmation and destructive action dialogs

  **When to use `role="alertdialog"`:**
  - Destructive actions (delete, discard, remove)
  - Confirmation flows requiring explicit user acknowledgment
  - Actions that cannot be undone
  - Critical warnings or errors

  **Example:**

  ```tsx
  // Standard dialog (default)
  <Dialog.Root>
    <Dialog.Trigger render={(p) => <Button {...p}>Edit</Button>} />
    <Dialog>...</Dialog>
  </Dialog.Root>

  // Alert dialog for destructive actions
  <Dialog.Root role="alertdialog">
    <Dialog.Trigger render={(p) => <Button variant="destructive" {...p}>Delete</Button>} />
    <Dialog>...</Dialog>
  </Dialog.Root>
  ```

- e6218d2: Add TimeseriesChart component with ECharts integration, supporting legends, gradient fills, custom axis formatting, loading skeleton state, and configurable color palettes.
- a7eb061: feat(select): auto-render options from items prop when children omitted

  The Select component now automatically renders Select.Option elements from the items prop when children are not explicitly provided.

### Patch Changes

- 5943e77: Add missing `success` background and tint semantic color tokens (`bg-kumo-success`, `bg-kumo-success-tint`) for parity with `info`, `warning`, and `danger`. Fix `text-kumo-success` dark mode contrast by using `green-400` instead of `green-500`. Add new `success` Badge variant for positive state indicators.
- 35d5c42: fix(breadcrumbs): improve mobile breadcrumb readability

  breadcrumbs now render a compact mobile trail for deeper hierarchies by collapsing early levels to `...` and keeping the trailing path visible. labels in breadcrumb links and the current page now truncate correctly to prevent stacking or overlap on narrow viewports.

- 02d0d65: fix(badge): prevent crash when unknown variant is passed

  Add defensive fallback to primary variant when an unrecognized variant string is provided to Badge component. This prevents "Cannot read properties of undefined (reading 'classes')" errors when consumers use a variant that doesn't exist in their installed version.

- 3170d65: fix(code): Fix CodeHighlighted dark mode, layout, and SSR issues
  - Fix dark mode: Make `<pre>` background transparent so container's `bg-kumo-base` handles theming and border-radius is respected
  - Fix layout: Wrap Shiki output in overflow container to prevent line highlight negative margins from being clipped
  - Fix width: Add `w-full` to container for proper full-width display
  - Fix SSR: Remove `"use client"` directive from `@cloudflare/kumo/code/server` entry point so server utilities work in RSC/SSR contexts

- 31ce577: fix(CommandPalette): add explicit text-base class to Item component for consistent 14px font size
- ee5a632: Fix Select to render description and error when hideLabel is true

  Previously, the `description` and `error` props were silently ignored when
  `hideLabel` was `true` (the default). Now, helper text and error messages
  display correctly even when the label is visually hidden.

- 409d32b: Fix TypeScript errors when consumers type-check their projects with kumo installed.

  Previously, TypeScript would attempt to type-check raw `.tsx` and `.ts` source files
  shipped in the package (block sources in `dist/src/blocks/`, `ai/schemas.ts`, and
  `scripts/theme-generator/*.ts`), causing build failures in downstream projects.

  This change:
  - Moves block source files to a separate `dist/blocks-source/` directory
  - Compiles `ai/schemas.ts` and `scripts/theme-generator/*.ts` to JavaScript
  - Updates package exports to point to compiled `.js` files with proper `.d.ts` types

- 7816318: fix(inputs): expand small control hit areas
- e7f0c80: Fix pagination component to properly wrap numbers in `tabular-nums` class for consistent number alignment. Both the page range and total count now use tabular numerals.
- c0341b4: Simplify Select placeholder implementation by using Base UI's native placeholder prop on SelectBase.Value instead of manually injecting placeholder items into the items array. This provides a cleaner, more intuitive API that aligns with standard HTML select behavior while maintaining backward compatibility with the null-value placeholder pattern.
- 35d5c42: fix(breadcrumbs): enhance mobile breadcrumb display for better readability
- abb7f8c: Add `variant="compact"` prop to Table.Header for a more condensed header style
- 8972cc4: Fix Combobox group label styling to use semantic token and correct padding
- bb49d4b: Standardize z-index usage with isolation containment
  - Add `isolation: isolate` to components with internal stacking (Tabs, MenuBar, InputGroup, Flow/Parallel)
  - Simplify internal z-index values to `z-0`/`z-1`/`z-2` instead of arbitrary values like `z-10`/`z-20`
  - Remove superfluous `z-10` from CommandPalette List
  - Update Toast viewport to `z-1` (matching Base UI's documented pattern)
  - Update ClipboardText viewport to use `isolate` instead of `z-50`

  This prevents z-index values from leaking outside component boundaries.

## 1.9.0

### Minor Changes

- 23865db: feat(dropdown): add LinkItem for navigation links and fix icon rendering

  **New Features:**
  - Add `DropdownMenu.LinkItem` for navigation links (semantic `<a>` element with proper menu item behavior)
  - Upgrade `@base-ui/react` from 1.0.0 to 1.2.0
  - Add new primitives: `csp-provider` and `drawer` from Base UI 1.2.0

  **Bug Fixes:**
  - Fix `icon` prop not rendering on `DropdownMenu.Item` when no `href` is provided

  **Deprecations:**
  - `href` prop on `DropdownMenu.Item` is deprecated. Use `DropdownMenu.LinkItem` instead.

  **Migration:**

  ```tsx
  // Before (deprecated)
  <DropdownMenu.Item href="https://example.com">Link</DropdownMenu.Item>

  // After (recommended)
  <DropdownMenu.LinkItem href="https://example.com" target="_blank">
    Link
  </DropdownMenu.LinkItem>
  ```

  `DropdownMenu.LinkItem` gives you full control over link attributes (`target`, `rel`, etc.) without the component making assumptions about your intent.

- 68c2f0d: Add `positionMethod` prop to `Popover.Content` to control CSS positioning strategy. Use `"fixed"` when the popover needs to escape stacking contexts (e.g., inside sticky headers). Defaults to `"absolute"`.

### Patch Changes

- 89cb5ec: Improve Flow diagram components with disabled node support and better connector rendering:
  - Add `disabled` prop to FlowNode for greying out connectors
  - Add `align` prop to FlowParallelNode for start/end alignment
  - Improve connector path rendering with smarter junction detection
  - Fix panning behavior to not interfere with node interactions

## 1.8.0

### Minor Changes

- cf4ff38: Refactor Banner component with softer styling and i18n-friendly props
  - Added `title` and `description` props for structured content with i18n support
  - Softened visual appearance: reduced background opacity (20% -> 10%), muted border colors
  - Text now uses `text-kumo-default` for readability, with colored icons for variant indication
  - Added `iconClasses` to variant config for per-variant icon coloring
  - Component now uses `forwardRef` and sets `displayName` per conventions
  - Deprecated `children` and `text` props in favor of `title`/`description`
  - Legacy `children` prop still works for backwards compatibility

### Patch Changes

- 0ca3b05: Fix Checkbox ring color to use `ring-kumo-contrast` when checked or indeterminate
- f69df6d: Fix Combobox dropdown scrolling regression and improve scroll behavior.

  **Bug fix:** The `overflow-hidden` class was accidentally re-introduced during a semantic color token migration, which overrode `overflow-y-auto` and caused dropdown content to be clipped instead of scrollable.

  **Improvement:** Restructured Combobox.Content to use flexbox layout so that when using `Combobox.Input` inside the dropdown (searchable popup pattern), the input stays fixed at the top while only the list scrolls. Previously, the entire popup content would scroll together.

  **Scrollbar fix:** Moved horizontal padding from the popup container to individual child components, so the scrollbar renders flush with the popup edge instead of being inset (which was clipping the checkmark indicators).

## 1.7.0

### Minor Changes

- d9b6498: feat(flow): add FlowDiagram components for building directed flow diagrams

  New components for visualizing workflows and data flows:
  - `FlowDiagram` - Root container with pan/scroll support for large diagrams
  - `FlowNode` - Individual node with automatic connector points
  - `FlowNode.Anchor` - Custom attachment points for connectors within nodes
  - `FlowParallelNode` - Container for parallel branches with junction connectors

  Adds `motion` as a new dependency for smooth panning interactions.

### Patch Changes

- 835a7c0: Deprecate DateRangePicker in favor of DatePicker with `mode="range"`
  - Added `@deprecated` JSDoc comments to DateRangePicker component and its exports
  - IDEs will now show deprecation warnings guiding users to use DatePicker instead

- 391f13a: Prevented ClipboardText from overflowing with long text values.
- d0e1d29: chore(kumo): add test scripts to root package.json

## 1.6.0

### Minor Changes

- 50d4251: Add DatePicker component built on react-day-picker v9

  **New Component: DatePicker**
  - Three selection modes: `single`, `multiple`, and `range`
  - Forwards all react-day-picker props for maximum flexibility
  - Styled with Kumo tokens (no external CSS import needed)
  - Supports localization via date-fns locales
  - Supports timezone via `timeZone` prop
  - Custom modifiers for highlighting specific dates
  - Footer prop for messages/usage limits
  - Accessible keyboard navigation with Kumo-styled focus rings

  **Usage:**

  ```tsx
  // Single date
  <DatePicker mode="single" selected={date} onSelect={setDate} />

  // Multiple dates
  <DatePicker mode="multiple" selected={dates} onSelect={setDates} max={5} />

  // Date range
  <DatePicker mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
  ```

  **Composing with Popover:**

  ```tsx
  <Popover>
    <Popover.Trigger asChild>
      <Button variant="outline" icon={CalendarDotsIcon}>
        Pick a date
      </Button>
    </Popover.Trigger>
    <Popover.Content className="p-3">
      <DatePicker mode="single" selected={date} onSelect={setDate} />
    </Popover.Content>
  </Popover>
  ```

  **Note:** Consider using `DatePicker` with `mode="range"` instead of `DateRangePicker` for new projects - it offers more flexibility and a smaller bundle size.

  **Internal changes:**
  - Added `react-day-picker` v9 as a dependency
  - Updated lint rule to allow components without KUMO\_\*\_VARIANTS exports
  - Updated component registry codegen to handle variant-less components
  - Disabled `jsx-a11y/no-autofocus` rule (intentional prop forwarding)

- 93361ed: feat(clipboard-text): add slide animation with tooltip on copy

### Patch Changes

- c71bd9b: Updated the MenuBar so its child buttons align with the container’s outer corners.
- 46ecf42: Fix `kumo add` to consolidate imports from `@cloudflare/kumo` into a single statement using inline `type` syntax.

  Previously, running `kumo add DeleteResource` would produce non-conformant code with duplicate imports:

  ```typescript
  import { Dialog, DialogRoot } from "@cloudflare/kumo";
  import { Input } from "@cloudflare/kumo";
  import { Button } from "@cloudflare/kumo";
  ```

  Now it produces a single consolidated import:

  ```typescript
  import {
    Dialog,
    DialogRoot,
    Input,
    Button,
    type DialogProps,
  } from "@cloudflare/kumo";
  ```

  This satisfies ESLint's `import/no-duplicates` rule with `prefer-inline: true`.

- a9167fa: Fix z-index stacking issues with nested portaled components (e.g., Select inside Dialog)
  - Remove unnecessary z-index values from Dialog, Select, Combobox, and Dropdown
  - Delete `.z-modal { z-index: 9999 }` - DOM order now handles stacking naturally
  - Components opened later correctly appear on top without z-index wars

- f02494d: fix(dropdown): improve external link detection to handle http:// and protocol-relative urls

  updated the external link check to use a regex that matches `https://`, `http://`, and protocol-relative URLs (`//`). previously only `https://` links opened in a new tab.

## 1.5.1

### Patch Changes

- 2c8a5ad: Changed ClipboardIcon to CopyIcon in ClipboardText component
- 31cc2e1: Fix AI command USAGE.md path resolution to work correctly from bundled dist output
- 1ae7dfd: fix(cli): include block source files in build for `kumo add` command

  The `kumo add` command was failing because block source files (`.tsx`) were not being copied to `dist/` during the build process. This adds copying of block source files from `src/blocks/` to `dist/src/blocks/` so the CLI can install them into user projects.

- fa3eba3: fix(Table): Add indeterminate prop and fix checkbox click handling
  - Added `indeterminate` prop to `Table.CheckHead` and `Table.CheckCell` components to support indeterminate checkbox state (shows minus icon when some but not all rows are selected)
  - Fixed checkbox click handling - clicking directly on the checkbox now works correctly (previously only clicking the cell area next to the checkbox worked)
  - Updated Table demos (`TableSelectedRowDemo` and `TableFullDemo`) with proper React state management for interactive row selection

- 3bc976e: fix: delete-resource shouldn't nest buttons within each other
- 752fdf1: support overwriting text in pagination component

## 1.5.0

### Minor Changes

- d7a6da3: fix(cli): resolve broken doc/docs/ls commands by fixing registry path from catalog/ to ai/
  fix(dialog): wrap sub-components to isolate @base-ui/react type references from downstream consumers
  fix(label): render as `<label>` element with htmlFor support instead of `<span>`
  feat(input): add Textarea alias for InputArea
  feat(toast): add ToastProvider alias for Toasty
  feat(button): require aria-label on icon-only buttons (shape="square" | "circle") via discriminated union
  fix(docs): add Tailwind 4 @source directive to usage example, add confirmation dialog recipe, update Select basic example, document icon-only button aria-label pattern

## 1.4.1

### Patch Changes

- b64847d: fix: CLI commands now find component registry and run codegen:registry before publish
- ea583d8: fix(cli): resolve registry path for docs and ls commands

## 1.4.0

### Minor Changes

- 71d667b: Add CloudflareLogo component with glyph and full logo variants, color schemes (brand/black/white), and exported SVG path data for custom implementations

### Patch Changes

- 262e0e6: Replace `.toSorted()` with `.sort()` on spread copies to fix TypeError on Chrome <110

## 1.3.0

### Minor Changes

- 6a40edf: add 'Delete Resource' block

## 1.2.0

### Minor Changes

- 833ce8b: Add variant support, custom content, and action buttons to Toast component.

### Patch Changes

- d10c711: "fix: adjusted bullet size for sensitive input"

## 1.1.0

### Minor Changes

- 001f9e7: fixes to figma plugin init + zod v4 in kumo

### Patch Changes

- 6dc9a73: Fix `kumo` CLI bin resolution in repo checkouts so `pnpm install` doesn't warn when `dist/` hasn't been built yet.

## 1.0.0

### Major Changes

- 11e62a2: # Kumo 1.0.0 Release

  The first stable release of Kumo, Cloudflare's component library.

  ## Breaking Changes

  ### Blocks Distribution via CLI

  Blocks (`PageHeader`, `ResourceListPage`) are no longer exported from `@cloudflare/kumo`. They must now be installed via the CLI:

  ```bash
  npx @cloudflare/kumo init        # Initialize kumo.json
  npx @cloudflare/kumo add PageHeader
  ```

  Blocks are copied to your project for full customization with imports automatically transformed to `@cloudflare/kumo`.

  ### Checkbox API Changes
  - **Ref type changed**: `HTMLInputElement` → `HTMLButtonElement`
  - **Props changed**: No longer extends `InputHTMLAttributes` (explicit props only)
  - **Handler renamed**: `onChange`/`onValueChange` → `onCheckedChange` (deprecated handlers still work)

  ### Banner API Deprecation

  The `text` prop is deprecated in favor of `children`:

  ```tsx
  // Before (deprecated)
  <Banner text="Your message" />

  // After (preferred)
  <Banner>Your message</Banner>
  ```

  ## New Features
  - **Link component**: Inline text links with Base UI composition API and `render` prop for framework routing
  - **DropdownMenu enhancements**: Nested submenus (`Sub`, `SubTrigger`, `SubContent`) and radio items (`RadioGroup`, `RadioItem`)
  - **Grid component**: New layout primitive
  - **Theme generator**: Config-driven token definitions with consolidated semantic color system
  - **Component catalog**: Visibility controls for documentation
  - **Deprecated props lint rule**: `kumo/no-deprecated-props` detects `@deprecated` JSDoc tags

  ## Fixes
  - Dropdown danger variant color contrast
  - Tabs segmented indicator border radius
  - Combobox dropdown scrolling
  - Primary button hover/focus contrast

  ## Migration Guide

  ### Blocks

  If you were using blocks (note: they were never officially exported):

  ```bash
  # 1. Initialize configuration
  npx @cloudflare/kumo init

  # 2. Install blocks
  npx @cloudflare/kumo add PageHeader
  npx @cloudflare/kumo add ResourceListPage

  # 3. Update imports to the local path shown after installation
  ```

  ### Checkbox

  ```tsx
  // Before
  <Checkbox onChange={(e) => setValue(e.target.checked)} />;
  const ref = useRef<HTMLInputElement>(null);

  // After
  <Checkbox onCheckedChange={(checked) => setValue(checked)} />;
  const ref = useRef<HTMLButtonElement>(null);
  ```

  ### Banner

  ```tsx
  // Before (still works, but deprecated)
  <Banner text="Your message" />

  // After
  <Banner>Your message</Banner>
  ```

### Minor Changes

- 3a28186: feat(banner): add children prop, deprecate text prop

  Banner now supports `children` for content, which is the preferred API. The `text` prop is deprecated but still works for backwards compatibility.

  ```tsx
  // Preferred (new)
  <Banner>Your message</Banner>
  <Banner icon={<Icon />}>Your message</Banner>

  // Deprecated (still works)
  <Banner text="Your message" />
  ```

  The `text` prop will be removed in a future major version.

- 2de0c7b: feat(cli): blocks are now distributed via CLI instead of npm exports

  New CLI commands for block management:
  - `kumo init` - Initialize kumo.json configuration file
  - `kumo blocks` - List all available blocks for CLI installation
  - `kumo add <block-name>` - Install a block to your project with transformed imports

  Blocks are copied to your project for full customization, with relative imports automatically converted to `@cloudflare/kumo`.

- 08c4426: Add lint rule to detect usage of deprecated props on Kumo components.
  - New `kumo/no-deprecated-props` lint rule automatically detects deprecated props from `@deprecated` JSDoc tags
  - Component registry now includes `deprecated` field for props with `@deprecated` annotations
  - Docs site shows strikethrough and `@deprecated` badge for deprecated props in API reference tables

  To deprecate a prop, add a JSDoc comment:

  ```tsx
  interface MyComponentProps {
    /** @deprecated Use `newProp` instead */
    oldProp?: string;
  }
  ```

  The lint rule will flag usage and show a helpful message:

  ```
  The `oldProp` prop on <MyComponent> is deprecated. Use `newProp` instead.
  ```

- 604fa9a: Add nested menu (submenu) and RadioGroup/RadioItem support to DropdownMenu
  - Add `DropdownMenu.Sub`, `DropdownMenu.SubTrigger`, and `DropdownMenu.SubContent` for nested submenus
  - Add `DropdownMenu.RadioGroup`, `DropdownMenu.RadioItem`, and `DropdownMenu.RadioItemIndicator` for single-selection menus
  - Fix `SubTrigger` styling to match `Item` component
  - Fix focus ring on dropdown popup
  - Add Storybook stories demonstrating nested menus and radio items
  - Update Astro docs with examples and API reference

- 98116b2: fix(checkbox): make label clickable, add new `onCheckedChange` API
  - Clicking the label now toggles the checkbox
  - New `onCheckedChange` callback (preferred over deprecated `onChange`/`onValueChange`)
  - Ref type is now `HTMLButtonElement` (aligns with Base UI implementation)

- 2c7f957: Add Link component with Base UI composition API
  - New `Link` component for consistent inline text links
  - Supports `render` prop for composition with framework-specific links (e.g., React Router)
  - Uses Base UI's `useRender` hook for proper ref/event merging
  - Three variants: `inline` (default), `current`, and `plain`
  - `Link.ExternalIcon` subcomponent for external link indicators
  - Integrates with `LinkProvider` for framework-agnostic routing

- 2de0c7b: feat: theme generator, color token consolidation, component catalog
  - New theme generator system with config-driven token definitions
  - Consolidated semantic color tokens with config.ts as single source of truth
  - New component catalog system with visibility controls
  - Added Grid component
  - Updated Figma plugin generators for new semantic tokens
  - Migrated documentation from Storybook to Astro

- 7d4a4e0: run component-registry when starting docs site

### Patch Changes

- 2de0c7b: Fix color contrast issue in Dropdown danger variant by using subtle bg-kumo-danger/5 background instead of bg-kumo-danger-tint, improving readability while maintaining the visual "danger" cue
- 8cf48b7: Add render prop for Tabs component
- d071bc8: Fix Combobox dropdown not scrolling when it has many items. The `overflow-hidden` class was overriding `overflow-y-auto`, causing content to be clipped instead of scrollable.
- 80c6470: fix: improve primary button hover/focus contrast by using bg-hover-selected instead of bg-primary/70
- 3a2e265: Adds disabled prop for table cell checkboxes
- e9fe499: fix(tabs): adjust segmented indicator border radius for proper visual nesting

## 0.7.0

### Minor Changes

- d04c91f: Ship component registry with @cloudflare/kumo module
- 0e246bf: feat(popover): Add new Popover component

  Adds a new Popover component based on Base UI's popover primitive. The Popover provides an accessible popup anchored to a trigger element, with support for:
  - Compound component API: `Popover`, `Popover.Trigger`, `Popover.Content`, `Popover.Title`, `Popover.Description`, `Popover.Close`
  - Positioning options: `side` (top, bottom, left, right), `align` (start, center, end), `sideOffset`
  - Click-to-open by default, with optional `openOnHover` behavior
  - Controlled mode via `open` and `onOpenChange` props
  - Visual styling matching the updated Tooltip component (surface-aware background, proper light/dark mode support)

### Patch Changes

- d04c91f: Migrate documentation site from React Router (`kumo-docs`) to Astro (`kumo-docs-astro`) as the primary docs platform, consolidate CI/CD pipelines, and add version display features.

  Bump node to v24.12.0

## 0.6.0

### Minor Changes

- 46236bd: Add Figma plugin for UI kit generation
  - New plugin at `packages/figma/` (`@cloudflare/figma-plugin`)
  - Generates 29 component types: Badge, Banner, Button, Checkbox, Code, CodeBlock, Collapsible, Combobox, DateRangePicker, Dialog, Dropdown, Icon Library, Input, InputArea, LayerCard, LinkButton, Loader, MenuBar, Meter, Pagination, RefreshButton, Select, SensitiveInput, Surface, Switch, Switch.Group, Tabs, Text, Toast
  - Each component generated with light and dark mode sections
  - Icon Library generator creates all Phosphor and Cloudflare brand icons
  - Parses component-registry.json and source files for variant specs
  - Extracts opacity modifiers from Tailwind classes (bg-kumo-brand/70 → opacity-primary-70)
  - Binds fills/strokes to kumo-colors variables
  - Includes progress UI and validation output

- 4266f72: feat(kumo): add command-palette component
- 4ac5fbe: semantic color changes and more consolidation for non-text colors
- 009097d: feat(tooltip): Update tooltip to use bg-kumo-base with proper light/dark mode support

  Changes the tooltip background from a fixed dark color to a surface-aware background that adapts to light and dark modes. Implements Base UI's 3-path arrow SVG approach for pixel-perfect border alignment across color modes.

### Patch Changes

- 50dae6f: fix(kumo): updated version in package.json (unintentionally downgraded)

## 0.5.0

### Minor Changes

- ee744b3: feat(PageHeader): add optional title and description props
  - Adds `title?: string` and `description?: string` props to PageHeader block
  - Title renders as semantic h1 for Section 508 and WCAG 2.4.2 (Level A) compliance: "Web pages have titles that describe topic or purpose"
  - Description uses max-w-prose (65ch) for optimal readability per industry standards
  - Styling matches Stratus Workers & Pages implementation
  - Includes comprehensive Storybook examples (WithTitle, WithTitleAndDescription, CompleteExample)

  ## Why This Feature Matters

  **Without this feature**, pages using only PageHeader would lack a semantic page title (h1), requiring developers to manually add titles elsewhere. This creates:
  - ❌ Risk of Section 508 and WCAG 2.4.2 violations
  - ❌ Compliance risk for FedRAMP High authorization (requires Section 508 conformance)
  - ❌ Inconsistent title placement across pages
  - ❌ Additional implementation burden on every page

  **With this feature**, PageHeader provides a standardized way to include accessible page titles that:
  - ✅ Render as semantic h1 elements (required by Section 508 and WCAG 2.4.2)
  - ✅ Visually differentiate from breadcrumbs
  - ✅ Work correctly with screen readers and assistive technology
  - ✅ Maintain consistency across the dashboard
  - ✅ Support FedRAMP High compliance requirements

  ### Important: Breadcrumbs Are Not Page Titles

  Breadcrumbs serve navigation purposes and cannot replace semantic page titles. Both should coexist:
  - **Page title (h1)**: Primary orientation, required for accessibility
  - **Breadcrumb trail**: Secondary navigation showing site hierarchy
  - **Visual differentiation**: Size, weight, and placement distinguish the two

  ### References
  - [Section 508 Standards](https://www.access-board.gov/ict/) - Requires WCAG 2.0 Level A and AA conformance
  - [WCAG 2.4.2: Page Titled](https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html) - Level A requirement

- b4a817f: Add table component
  - Introduce new Table component with row variants and styling options
  - Add Table documentation and examples to `kumo-docs`

- 0e5cf84: lighter red in light mode
- 6c94137: Add Label component with standardized label features for form fields
  - New Label component with support for ReactNode children, optional indicator, and tooltip
  - Enhanced form components (Input, Select, Checkbox, Switch, SensitiveInput, Combobox) with:
    - `label` prop now accepts ReactNode (not just strings)
    - `required={false}` shows "(optional)" text
    - `labelTooltip` prop for info icon with hover tooltip
  - Updated Field component to use Label internally
  - Added Label documentation page to kumo-docs

- 742dc89: Add Radio component for single-selection from a set of options
  - New `Radio.Group` and `Radio.Item` compound components built on Base UI primitives
  - Supports vertical and horizontal orientations
  - Includes error, description, and disabled states
  - `controlPosition` prop for label placement ("start" or "end")
  - Full accessibility support with semantic HTML and keyboard navigation
  - Documentation added to both kumo-docs and kumo-docs-astro sites

- 872ef11: Add Storybook preview deployments and MR reporter system
  - Storybook previews deploy to Cloudflare Workers on MR commits
  - Staging deployment to `storybook.staging.kumo-ui.com` on merge to main
  - Consolidated MR comments with beta npm version and preview URL

- 9537114: Add variant prop to Tabs component with 'segmented' (default) and 'underline' options

### Patch Changes

- 7c2e8dd: Fix label not appearing in Combobox unless a description or error given.
- 5bdfae9: fix bug where delete user external links were being treated as internal navigation and appending urls to domain
- d598621: Fix Base UI nativeButton warning in Switch component by adding nativeButton prop to BaseSwitch.Root
- e613876: Update deployment configs to enable preview urls
- d9add6b: added a next / previous form of pagination
- 356d1e6: Modernize Active Sessions page with updated Kumo design patterns
- 5b256bd: - Align border color with sidebar
  - Center arrow icon in select component
- d998518: Add `bg-kumo-base` as default background for Surface component

## 0.4.0

### Minor Changes

- 010d1f0: Fix Combobox button styles
- 933fdf2: Migrate to @base-ui/react V1

  **Breaking Change:** Updated from `@base-ui-components/react` to the new `@base-ui/react` V1 package.

  ## What Changed
  - **Package name:** `@base-ui-components/react` → `@base-ui/react`
  - **Version:** `^1.0.0-rc.0` > `^1.0.0`
  - All component imports updated to use the new package
  - All primitive re-exports updated to use the new package
  - Build configuration updated to bundle the new package

  ## Migration Required

  This is a **major version bump** because the underlying Base UI package has changed. While the Kumo API remains the same, you'll need to:
  1. **Update dependencies:**
     ```bash
     pnpm install
     ```
  2. **No code changes needed** - All Kumo components and primitives work exactly the same way. The package name change is internal to Kumo.

  ## For Kumo Maintainers

  After merging this PR, run:

  ```bash
  # Install the new @base-ui/react package
  pnpm install

  # Regenerate primitive files with new package references
  pnpm --filter @cloudflare/kumo build:primitives

  # Rebuild the package
  pnpm --filter @cloudflare/kumo build

  # Run tests to verify everything works
  pnpm --filter @cloudflare/kumo test:run
  ```

  ## Technical Details
  - Updated all imports from `@base-ui-components/react/*` to `@base-ui/react/*`
  - Updated `generate-primitives.ts` script to reference new package
  - Updated test files to check for new package name
  - Updated `vite.config.ts` manualChunks to match new package name
  - All 37 primitives will be regenerated with new imports

- 731e636: Add built-in Field integration to form components with automatic layout

  **New Features:**
  - Input, InputArea, SensitiveInput, Select, Checkbox, Switch, and Combobox now accept `label`, `description`, and `error` props for built-in Field wrapper support
  - Automatic CSS-driven layout: vertical for text inputs, horizontal for checkboxes/switches using `:has()` selectors
  - Checkbox.Group and Switch.Group compound components for managing multiple related controls with shared legend/description/error
  - Storybook Code Panel enabled for better component code examples

  **Accessibility:**
  - Runtime console warnings (dev-only) when Input/Checkbox lack accessible names (label, aria-label, or aria-labelledby)
  - Comprehensive JSDoc documentation with accessibility guidance and examples

  **Breaking Changes:**
  - Field component removed from public API (now internal implementation detail - use component props instead)

  **Migration:**

  ```tsx
  // Before: Explicit Field wrapper
  <Field label="Email" description="...">
    <Input placeholder="you@example.com" />
  </Field>

  // After: Built-in Field API (recommended)
  <Input
    label="Email"
    description="..."
    placeholder="you@example.com"
  />
  ```

- 1db802c: change error color for text component to match field input error colors
- 45ccaec: secondary-destructive button variant
- ccc03dc: fix: update changeset validation logic
- 2f91f1f: - Complete semantic color tokens migrated from Stratus app
  - Document color and text-color tokens in Storybook
  - Add accessibility tests via Storybook Vitest addon
  - Add component-metadata generator for AI tooling
  - Enable linting in CI/CD (passing)
  - Apply Prettier Tailwind plugin for consistent class ordering
  - Use pnpm catalog for shared package versions
  - Semantic colors now scoped to `[data-theme]` and `[data-mode]` attributes
  - Consumers must ensure root element has these attributes for proper theming

  ### Migration Guide

  Add `data-theme` and `data-mode` attributes to your root element:

  ```tsx
  // React example
  <html data-theme="kumo" data-mode={isDark ? "dark" : "light"}>

  // Static HTML
  <html data-theme="kumo" data-mode="light">
  ```

  - **`data-theme`**: Set to `"kumo"` (default theme) or other theme variants like `"fedramp"`
  - **`data-mode`**: Set to `"light"` or `"dark"` to control color scheme

  If no `data-mode` is set, the system defaults to light mode.

- ad3c8fa: tab and text style fixes; storybook theme select always visible
- 731e636: inputs with built-in fields
- 933fdf2: Bundle Base UI primitives with granular exports and fix critical compatibility issues

  ## Primitives: Granular Exports

  Added granular exports for all 37 Base UI primitives alongside the existing barrel export. This enables better tree-shaking and smaller bundle sizes when using individual primitives.

  ```tsx
  // Barrel export (imports all primitives)
  import { Slider, Popover, Tooltip } from "@cloudflare/kumo/primitives";

  // Granular exports (tree-shakeable, recommended)
  import { Slider } from "@cloudflare/kumo/primitives/slider";
  import { Popover } from "@cloudflare/kumo/primitives/popover";
  ```

  **Available primitives:** accordion, alert-dialog, autocomplete, avatar, button, checkbox, checkbox-group, collapsible, combobox, context-menu, dialog, direction-provider, field, fieldset, form, input, menu, menubar, meter, navigation-menu, number-field, popover, preview-card, progress, radio, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, toggle-group, toolbar, tooltip.

  ## Build Output Improvements

  Fixed critical compatibility issues with Jest and React Server Components by improving the build configuration.

  ### Problems Fixed
  1. **Jest Parsing Errors** - The previous build used `preserveModules: true`, which preserved the pnpm directory structure (`node_modules/.pnpm/`) in dist. This caused Jest to fail parsing ESM imports because Jest's `transformIgnorePatterns` blocks nested `node_modules` by default.
  2. **Missing "use client" Directives** - The `rollup-plugin-preserve-directives` plugin only works with `preserveModules: true`. When bundling with `preserveModules: false`, all "use client" directives were stripped, breaking components in Next.js App Router (RSC).

  ### Solutions Implemented
  - **Flat bundle structure** - Changed to `preserveModules: false` to eliminate nested `node_modules/.pnpm/` paths
  - **"use client" injection** - Added `output.banner` to inject the directive into all output chunks (since the plugin doesn't work without preserveModules)
  - **Manual code splitting** - Implemented `manualChunks` to split large vendor dependencies for better caching:
    - `vendor-base-ui` (598 KB, 152 KB gzipped) - Base UI components
    - `vendor-styling` (74 KB, 13 KB gzipped) - clsx + tailwind-merge
    - `vendor-floating-ui` (33 KB, 10 KB gzipped) - Floating UI positioning
    - `vendor-utils` (24 KB, 7 KB gzipped) - tabbable, reselect, etc.

- abc1a1e: kumo cli
- e6a6f8c: semantic text colors - consolidation
- 167a92b: Removed label prop from input components. Prefer using Field to compose a label with an input.
- 8578662: consolidate blue text to match banner blue text across: badge, expandable, text components
- 37a703d: consolidate on the green text tokens

### Patch Changes

- d23783f: Update kumo package to use literal depdency versions for better yarn linking/portal support.
- fe8fd1b: improve input group label to be semantic and use htmlFor
- 933fdf2: **Combobox Type Fixes**
  - Removed `any` type and eslint-disable comments
  - Used proper `ComboboxBase.Root.Props<Value, Multiple>` from base-ui's namespace
  - Simplified generic parameters from 3 (ItemValue, SelectedValue, Multiple) to 2 (Value, Multiple) to match base-ui's actual API

- 949fe52: fix remaining lint errors and increase lint warn -> error
- 72f0695: Update reamde documentation
- e6326f1: Consolidate AGENTS.md and CLAUDE.md LLM instructions
- 9fbb791: fix resource-list href lint errors
- a4231cc: Improve expandable component semantics
- 344372e: Update Storybook imports from @storybook/react to @storybook/react-vite for Storybook 10 compatibility. Also removes generatedAt timestamp from component registry to prevent merge conflicts during rebases.
- d1b80c8: improve sensitive input component - semantics, button nesting, labelling, screen reader experience
- 38f4424: Fix: Resolve type check errors across components/blocks/layouts
  Fix: Export Kumo Breadcrumb as Breadcrumbs + Documentation Improvements
  Fix: MenuBar -Bypass the React 19 type checking issue with IconContext.Provider
- e82f3f7: improve semantics and labelling for date picker component

## 0.3.0

### Minor Changes

- 8113cf4: docs updates and semantic colors for banner
- 3bca64a: ship dark-mode color scheme styles from kumo lib instead of setting it at the app
- a5cd231: Adds Storybook 10 integration to the Kumo component library for interactive component development, testing, and documentation. Includes stories for 29 components, automated plop generator updates, and documentation.

### Patch Changes

- 969750a: enforce button background transparency for tabs
- 2f516b0: Combobox - Adjust multiple select height with standard Kumo component height
- be563d1: Checkbox indeterminate state
- 7481c95: Improve development workflow with 10x faster rebuilds and comprehensive documentation

  Add development mode with optimized builds, skip minification and enable incremental TypeScript compilation. Update all READMEs and contributing docs with clear guidance on Storybook (recommended) vs watch build workflows. Add story file documentation to scaffolding sections and two-terminal setup instructions for testing components in docs.

- c48b7b5: Enhance CICD to publish beta releases
- b68c768: Fix: Resolve type check erros across components/blocks/layouts
  Fix: Export Kumo Breadcrumb as Breadcrumbs + Documentation Improvements
  Fix: MenuBar -Bypass the React 19 type checking issue with IconContext.Provider

## 0.2.0

### Minor Changes

- 924e016: Semantic color improvements
- 924e016: Improve select components
- 924e016: Fix Input borders
- e73fb2e: Fix exports
- 1bb5cf7: Compile Tailwind and Standalone CSS, update installation documentation

### Patch Changes

- 1bb5cf7: Adding changesets
