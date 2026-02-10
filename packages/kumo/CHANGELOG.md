# @cloudflare/kumo

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
