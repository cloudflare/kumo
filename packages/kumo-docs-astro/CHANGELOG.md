# @cloudflare/kumo-docs-astro

## 1.3.0

### Minor Changes

- d7a6da3: fix(cli): resolve broken doc/docs/ls commands by fixing registry path from catalog/ to ai/
  fix(dialog): wrap sub-components to isolate @base-ui/react type references from downstream consumers
  fix(label): render as `<label>` element with htmlFor support instead of `<span>`
  feat(input): add Textarea alias for InputArea
  feat(toast): add ToastProvider alias for Toasty
  feat(button): require aria-label on icon-only buttons (shape="square" | "circle") via discriminated union
  fix(docs): add Tailwind 4 @source directive to usage example, add confirmation dialog recipe, update Select basic example, document icon-only button aria-label pattern

### Patch Changes

- Updated dependencies [d7a6da3]
  - @cloudflare/kumo@1.5.0

## 1.2.2

### Patch Changes

- Updated dependencies [b64847d]
- Updated dependencies [ea583d8]
  - @cloudflare/kumo@1.4.1

## 1.2.1

### Patch Changes

- Updated dependencies [71d667b]
- Updated dependencies [262e0e6]
  - @cloudflare/kumo@1.4.0

## 1.2.0

### Minor Changes

- 6a40edf: add 'Delete Resource' block

### Patch Changes

- Updated dependencies [6a40edf]
  - @cloudflare/kumo@1.3.0

## 1.1.0

### Minor Changes

- 833ce8b: Add variant support, custom content, and action buttons to Toast component.

### Patch Changes

- Updated dependencies [d10c711]
- Updated dependencies [833ce8b]
  - @cloudflare/kumo@1.2.0

## 1.0.1

### Patch Changes

- Updated dependencies [6dc9a73]
- Updated dependencies [001f9e7]
  - @cloudflare/kumo@1.1.0

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

- 2de0c7b: feat: theme generator, color token consolidation, component catalog
  - New theme generator system with config-driven token definitions
  - Consolidated semantic color tokens with config.ts as single source of truth
  - New component catalog system with visibility controls
  - Added Grid component
  - Updated Figma plugin generators for new semantic tokens
  - Migrated documentation from Storybook to Astro

### Patch Changes

- Updated dependencies [3a28186]
- Updated dependencies [2de0c7b]
- Updated dependencies [08c4426]
- Updated dependencies [2de0c7b]
- Updated dependencies [604fa9a]
- Updated dependencies [8cf48b7]
- Updated dependencies [11e62a2]
- Updated dependencies [98116b2]
- Updated dependencies [d071bc8]
- Updated dependencies [80c6470]
- Updated dependencies [2c7f957]
- Updated dependencies [3a2e265]
- Updated dependencies [2de0c7b]
- Updated dependencies [e9fe499]
- Updated dependencies [7d4a4e0]
  - @cloudflare/kumo@1.0.0

## 0.5.0

### Minor Changes

- d04c91f: Ship component registry with @cloudflare/kumo module
- d04c91f: Migrate documentation site from React Router (`kumo-docs`) to Astro (`kumo-docs-astro`) as the primary docs platform, consolidate CI/CD pipelines, and add version display features.

  Bump node to v24.12.0

### Patch Changes

- Updated dependencies [d04c91f]
- Updated dependencies [0e246bf]
- Updated dependencies [d04c91f]
  - @cloudflare/kumo@0.7.0

## 0.4.2

### Patch Changes

- Updated dependencies [46236bd]
- Updated dependencies [50dae6f]
- Updated dependencies [4266f72]
- Updated dependencies [4ac5fbe]
- Updated dependencies [009097d]
  - @cloudflare/kumo@0.6.0

## 0.4.1

### Patch Changes

- Updated dependencies [ee744b3]
- Updated dependencies [b4a817f]
- Updated dependencies [7c2e8dd]
- Updated dependencies [5bdfae9]
- Updated dependencies [d598621]
- Updated dependencies [0e5cf84]
- Updated dependencies [e613876]
- Updated dependencies [6c94137]
- Updated dependencies [d9add6b]
- Updated dependencies [356d1e6]
- Updated dependencies [742dc89]
- Updated dependencies [5b256bd]
- Updated dependencies [872ef11]
- Updated dependencies [d998518]
- Updated dependencies [9537114]
  - @cloudflare/kumo@0.5.0
