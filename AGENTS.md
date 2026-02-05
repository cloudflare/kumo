# AGENTS.md

Comprehensive guide for AI agents and developers working with Kumo.

## Quick Start

```bash
pnpm add @cloudflare/kumo
```

```tsx
import { Button } from "@cloudflare/kumo";
```

**CRITICAL:** Only use semantic tokens (`bg-kumo-base`, `text-kumo-default`). Never raw Tailwind colors (`bg-blue-500`).

```bash
pnpm --filter @cloudflare/kumo codegen:registry  # Generate component-registry.{json,md}
```

## Repository Overview

`Kumo` is Cloudflare's component library for building modern web applications. It is a `pnpm` monorepo containing a React component library and its documentation site. The library provides accessible, design-system-compliant UI components built on [Base UI](https://base-ui.com/).

## Dynamic Code Analysis Features

Kumo provides extensive automated tooling (`packages/kumo/scripts/`):

**1. Component Registry + CLI** (`scripts/component-registry/`, `src/command-line/`) - AI-readable metadata & CLI

- Auto-generates `ai/component-registry.{json,md}` from TypeScript types + demo files
- **Demo examples** are extracted from `kumo-docs-astro/src/components/demos/` (not kumo)
- Includes: props, variants, examples, semantic tokens, sub-components
- **Exported CLI:** `npx @cloudflare/kumo {ls|doc|docs}` - Quick component reference

**Build Pipeline:**

```
kumo-docs-astro/src/components/demos/*.tsx
    ↓ (pnpm codegen:demos)
kumo-docs-astro/dist/demo-metadata.json
    ↓ (pnpm codegen:registry)
kumo/ai/component-registry.{json,md}
```

**2. Figma Plugin** (`packages/kumo-figma/`) - React → Figma components

- Separate package: `@cloudflare/kumo-figma`
- 30+ generators (Button, Dialog, Tabs, Toast, etc.)
- Parses Tailwind → Figma auto-layout, binds semantic tokens to variables
- Icon library generation, loader variants, opacity modifiers
- **IMPORTANT:** After modifying any generator in `packages/kumo-figma/src/generators/`, you must rebuild the plugin with `pnpm --filter @cloudflare/kumo-figma build` before testing in Figma

**3. Figma Token Sync** (`packages/kumo-figma/scripts/`) - CSS → Figma Variables API

- Syncs semantic tokens from kumo theme CSS to Figma
- Parses `light-dark()`, converts colors (oklch/hex → Figma RGB)
- Run with `pnpm --filter @cloudflare/kumo-figma figma:sync`

**4. Custom Lint Rules** (`lint/`) - Design system enforcement

- `no-primitive-colors`: Blocks `bg-blue-500`, enforces semantic tokens
- `no-tailwind-dark-variant`: Prevents `dark:` (auto via tokens)

**5. Color Analysis** (`scripts/color/`) - Token extraction & usage stats

- Analyzes semantic token usage, generates color docs

**6. Primitives Generator** (`scripts/generate-primitives.ts`) - Base UI exports

- Auto-generates tree-shakeable primitive exports, updates package.json

**Key Commands:**

```bash
pnpm --filter @cloudflare/kumo codegen:registry  # Component registry
pnpm --filter @cloudflare/kumo codegen           # All codegen (primitives + registry)
npx @cloudflare/kumo doc                         # CLI docs (works in any project)
pnpm --filter @cloudflare/kumo-figma build       # Build Figma plugin (auto-runs figma:sync if FIGMA_TOKEN is set)
pnpm --filter @cloudflare/kumo-figma figma:sync  # Sync tokens to Figma (manual)
pnpm lint                                        # Custom rules + oxlint
```

## Project Structure

```
kumo/
├── packages/
│   ├── kumo/                      # Component library (@cloudflare/kumo)
│   │   ├── src/
│   │   │   ├── components/        # UI components (button, dialog, input, etc.)
│   │   │   ├── blocks/            # Composite components (breadcrumbs, page-header)
│   │   │   ├── pages/             # Full page components
│   │   │   ├── styles/            # CSS including kumo-binding.css
│   │   │   ├── utils/             # Utilities (cn, link-provider)
│   │   │   └── index.ts           # Main exports
│   │   ├── ai/                    # Component registry and JSON UI catalog
│   │   ├── scripts/               # Build and linting scripts
│   │   └── package.json
│   ├── kumo-docs-astro/           # Documentation site (Astro)
│   │   ├── src/
│   │   │   ├── components/demos/  # Interactive component demos
│   │   │   ├── pages/             # File-based routing
│   │   │   └── layouts/           # Page layouts
│   │   └── package.json
│   └── kumo-figma/                # Figma plugin (@cloudflare/kumo-figma)
│       ├── src/
│       │   ├── generators/        # 30+ component generators
│       │   ├── parsers/           # Tailwind → Figma conversion
│       │   └── code.ts            # Plugin entry point
│       ├── scripts/               # Token sync to Figma
│       └── package.json
├── ci/                            # CI/CD scripts and versioning
│   ├── reporters/                 # MR report generation
│   ├── scripts/                   # Deployment scripts
│   └── versioning/                # Beta/production release scripts
├── lint/                          # Custom ESLint rules
├── .changeset/                    # Changeset files for versioning
└── package.json                   # Workspace root
```

## Architecture

### Component Library (`packages/kumo`)

- **Built with**: React, TypeScript, Tailwind CSS v4, Base UI
- **Icons**: `@phosphor-icons/react`
- **Styling**: `cn()` utility combining `clsx` + `tailwind-merge`
- **Build**: Vite in library mode with tree-shakeable exports

### Documentation Site (`packages/kumo-docs-astro`)

- **Framework**: Astro + React
- **Deployment**: Cloudflare Workers
- **Dev server**: `http://localhost:4321`
- **Routes**: `/cli`, `/colors`, `/registry` for internal tools

## Component Registry (Source of Truth)

**Location:**

- `packages/kumo/ai/component-registry.json` - Machine-readable (28 components)
- `packages/kumo/ai/component-registry.md` - Human-readable (1575 lines)

### CLI Commands

The Kumo CLI provides quick access to component documentation, especially useful when `node_modules` is gitignored:

```bash
# List all components grouped by category
npx @cloudflare/kumo ls

# Get documentation for a specific component
npx @cloudflare/kumo doc Button
npx @cloudflare/kumo doc Dialog

# Get documentation for ALL components
npx @cloudflare/kumo docs

# Show help
npx @cloudflare/kumo help
```

**Note:** `kumo doc` (without a component name) is equivalent to `kumo docs`.

### Query examples (using jq):

```bash
# Get Button props
jq '.components.Button.props' component-registry.json

# List Action category components
jq '.search.byCategory.Action' component-registry.json

# Get all component names
jq '.search.byName' component-registry.json

# Find components using a specific token
grep "bg-kumo-base" component-registry.md
```

**Registry contains:**

- Props (type, required/optional, default values, descriptions)
- Variants (enum values with descriptions)
- Examples (real code from stories)
- Semantic colors used (kumo tokens only)
- Sub-components (for compound patterns like Dialog.Root, Dialog.Trigger)

## Critical Rules

### ❌ NEVER

- **Raw Tailwind colors:** `bg-blue-500`, `text-gray-900` → Breaks theming, fails lint
- **Dark mode variants:** `dark:bg-black` → Dark mode is automatic via semantic tokens
- **Missing displayName:** forwardRef components must set `displayName` for debugging
- **Skipping registry:** Always check `component-registry.json` for component API before use

### ✅ ALWAYS

- **Semantic tokens:** `bg-kumo-base`, `text-kumo-default`, `border-kumo-line`, `ring-kumo-ring`
- **Query registry first:** Props, variants, and examples are always current
- **Use `cn()` utility:** For className composition (`cn("base", conditional && "extra", className)`)
- **Forward refs:** Components wrapping DOM elements must use `forwardRef`

## Styling System

### Kumo Semantic Color Tokens

**CRITICAL**: Always use Kumo semantic color classes, never raw Tailwind colors.

The color system is defined in `packages/kumo/src/styles/kumo-binding.css`. Colors automatically adapt to light/dark mode via CSS `light-dark()` function.

**Full token reference:** See `packages/kumo/ai/component-registry.md` - the "Kumo Color System" section contains all available tokens with usage counts, organized by category (surfaces, text, state, interactive, borders).

### Key Patterns

```tsx
// ✅ CORRECT - Using Kumo semantic tokens
<div className="bg-kumo-base border border-kumo-line rounded-lg">        // Card
<button className="bg-kumo-brand text-white">Primary</button>          // Primary button
<button className="bg-kumo-control text-kumo-default ring ring-kumo-line">    // Secondary button
<input className="bg-kumo-control text-kumo-default ring ring-kumo-line" />   // Form input
<div className="bg-kumo-danger/20 border-kumo-danger text-kumo-danger">Error</div>   // Error state

// ❌ WRONG - Raw Tailwind colors break theming
<button className="bg-blue-500 text-white">Submit</button>
<div className="bg-white dark:bg-gray-900">Content</div>
```

### Dark Mode

**NEVER use Tailwind's `dark:` variant**. Semantic tokens handle dark mode automatically via `light-dark()`.

```tsx
// ❌ WRONG
<div className="bg-white dark:bg-black" />

// ✅ CORRECT
<div className="bg-kumo-base text-kumo-default" />
```

### Dark Mode

**NEVER use Tailwind's `dark:` variant**. The Kumo color system handles dark mode automatically through CSS custom properties and `light-dark()`.

All semantic tokens use `light-dark()` internally. **Never use `dark:` variant.**

```tsx
// ❌ WRONG - Manual dark mode handling
<div className="bg-white dark:bg-black text-black dark:text-white" />

// ✅ CORRECT - Automatic dark mode via semantic tokens
<div className="bg-kumo-base text-kumo-default" />
```

### Surface Hierarchy

Use layered surfaces for visual depth:

```
bg-kumo-base → bg-kumo-elevated → bg-kumo-recessed
```

### Mode & Theme System

Kumo uses two data attributes for styling control:

- **`data-mode`**: Controls light/dark mode (`"light"` | `"dark"`)
- **`data-theme`**: Controls theme variants (e.g., `"fedramp"`)

#### Dark Mode (`data-mode`)

Set `data-mode` on a parent element (typically `<html>` or `<body>`) to control color scheme:

```tsx
// Light mode
<html data-mode="light">

// Dark mode
<html data-mode="dark">
```

The CSS uses `color-scheme` and `light-dark()` to automatically adapt all semantic tokens:

```css
:root {
  color-scheme: light;
}

[data-mode="dark"] {
  color-scheme: dark;
}
```

#### Themes (`data-theme`)

Themes override semantic color tokens defined in `packages/kumo/src/styles/kumo-binding.css`.

**Existing Themes:**

- **Default**: No `data-theme` attribute required
- **FedRAMP**: `data-theme="fedramp"` - Government compliance styling

#### Adding a New Theme

1. Add theme overrides in `kumo-binding.css` within `@layer base`:

```css
@layer base {
  [data-theme="my-theme"] {
    --color-surface: light-dark(#custom-light, #custom-dark);
    --color-active: light-dark(#custom-light, #custom-dark);
    --text-color-surface: light-dark(#custom-light, #custom-dark);
    /* Override any semantic tokens as needed */
  }
}
```

2. Apply the theme by setting the `data-theme` attribute on a parent element:

```tsx
<div data-theme="my-theme">
  {/* All Kumo components inside will use theme overrides */}
</div>
```

#### Theme Guidelines

- **Use `light-dark()`**: Ensures themes work with both light and dark modes
- **Override sparingly**: Only override tokens that need to change
- **Semantic tokens only**: Themes should override `--color-*` and `--text-color-*` variables, not component-specific styles
- **Test both modes**: Verify theme looks correct in light and dark mode

## Component Patterns

### Standard Component Structure

Each component follows this file structure:

```
components/
└── button/
    ├── button.tsx           # Component implementation
    └── index.ts             # Re-exports
```

Demo files for documentation live in `packages/kumo-docs-astro/src/components/demos/`.

### Component Implementation Pattern

```tsx
import { cn } from "../../utils/cn";
import { forwardRef } from "react";

export type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "xs" | "sm" | "base" | "lg";
  // ... other props
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "base", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "flex items-center font-medium",
          // Variant styles using Kumo tokens
          variant === "primary" && "bg-kumo-brand text-white",
          variant === "secondary" &&
            "text-secondary bg-kumo-control ring ring-kumo-line",
          // Size styles
          size === "base" && "h-9 px-3 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
```

### Using Base UI

Components are built on Base UI primitives:

```tsx
import { Dialog as DialogBase } from "@base-ui/react/dialog";

function DialogContent({ children }) {
  return (
    <DialogBase.Portal>
      <DialogBase.Backdrop className="bg-kumo-overlay opacity-80" />
      <DialogBase.Popup className="rounded-xl bg-kumo-base">
        {children}
      </DialogBase.Popup>
    </DialogBase.Portal>
  );
}
```

### Variants System

Components export `KUMO_<NAME>_VARIANTS` constants defining available variants.

**Check registry for:**

- `props[].values` - Available variant values (e.g., `["primary", "secondary"]`)
- `props[].default` - Default variant (e.g., `"secondary"`)
- `props[].descriptions` - Variant descriptions (when to use each)

**Example from registry:**

```json
{
  "Button": {
    "props": {
      "variant": {
        "type": "enum",
        "values": ["primary", "secondary", "ghost", "destructive"],
        "default": "secondary",
        "descriptions": {
          "primary": "Primary action button",
          "secondary": "Secondary action button with border"
        }
      }
    }
  }
}
```

### Compound Components

Check registry `subComponents` field for compound component patterns.

**Example:** Dialog has sub-components: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`

```json
{
  "Dialog": {
    "subComponents": {
      "Root": {
        "description": "Controls the open state",
        "props": { "open": { "type": "boolean" } }
      },
      "Trigger": {
        "description": "Button that opens the dialog",
        "renderElement": "<button>"
      }
    }
  }
}
```

### Component Requirements

All components must:

1. Export `KUMO_<NAME>_VARIANTS` (variants config)
2. Export `KUMO_<NAME>_DEFAULT_VARIANTS` (default values)
3. Use `forwardRef` when wrapping DOM elements
4. Set `displayName` for React DevTools

## Adding Components

### Workflow

1. **Run the scaffolding tool:**

   ```bash
   pnpm --filter @cloudflare/kumo new-component
   ```

2. **Implement the component:**
   - Use semantic tokens only (never raw Tailwind colors)
   - Add KUMO*\*\_VARIANTS and KUMO*\*\_DEFAULT_VARIANTS exports
   - Use `forwardRef` when wrapping DOM elements
   - Set `displayName` for React DevTools

3. **Write demo files** in `packages/kumo-docs-astro/src/components/demos/{Name}Demo.tsx`

4. **Regenerate the component registry:**
   ```bash
   pnpm --filter @cloudflare/kumo codegen:registry
   ```

### What Gets Scaffolded

- `src/components/{name}/{name}.tsx` - Component implementation
- `src/components/{name}/index.ts` - Re-exports
- Updates `src/index.ts` exports
- Updates `vite.config.ts` build entries
- Updates `package.json` exports

## Development & Tooling

### Package Management (`pnpm`)

```bash
pnpm install                              # Install all dependencies
pnpm --filter @cloudflare/kumo build      # Build component library
pnpm --filter @cloudflare/kumo-docs dev   # Run docs dev server
```

### Common Scripts

```bash
# From workspace root
pnpm dev           # Start docs dev server
pnpm build         # Build docs site
pnpm lint          # Run linting
pnpm typecheck     # Type check all packages

# From packages/kumo
pnpm test          # Run tests in watch mode
pnpm test:run      # Run tests once
pnpm new-component # Scaffold new component
```

### Build & Test

```bash
# Testing
pnpm --filter @cloudflare/kumo test       # Vitest watch mode
pnpm --filter @cloudflare/kumo test:run   # Single run
pnpm --filter @cloudflare/kumo test:ui    # UI mode

# Linting (includes custom rules)
pnpm --filter @cloudflare/kumo lint       # oxlint with:
                                           # - no-primitive-colors (fails on bg-blue-500)
                                           # - no-tailwind-dark-variant (fails on dark:)

# Build
pnpm --filter @cloudflare/kumo build      # Full build with CSS
pnpm --filter @cloudflare/kumo codegen:registry  # Regenerate component-registry
```

### Linting (`oxlint`)

The project uses `oxlint` with type-aware linting and custom rules:

```bash
pnpm --filter @cloudflare/kumo lint
```

#### Custom Lint Rules

1. **`no-primitive-colors`** (`lint/no-primitive-colors.js`)
   - Disallows Tailwind primitive colors (e.g., `bg-blue-500`, `text-gray-900`)
   - Validates that semantic tokens exist in theme CSS files
   - Enforces use of Kumo semantic tokens (e.g., `bg-kumo-base`, `text-kumo-subtle`)

2. **`no-tailwind-dark-variant`** (`lint/no-tailwind-dark-variant.js`)
   - Disallows `dark:` variant in class names
   - Dark mode is handled automatically by Kumo tokens

3. **`enforce-variant-standard`** (`lint/enforce-variant-standard.js`)
   - Enforces the KUMO\_\*\_VARIANTS naming convention for component exports
   - Only applies to files matching `src/components/{name}/{name}.tsx`
   - Extracts component name from path (e.g., `button.tsx` → `BUTTON`, `clipboard-text.tsx` → `CLIPBOARD_TEXT`)

4. **`no-cross-package-imports`** (`lint/no-cross-package-imports.js`)
   - Disallows relative imports that reach into sibling packages in the monorepo
   - Catches patterns like `../../kumo/src/...` from other packages
   - Enforces using proper package imports (e.g., `@cloudflare/kumo`) instead

   ```tsx
   // ❌ WRONG - Cross-package relative import
   import { Button } from "../../kumo/src/components/button";

   // ✅ CORRECT - Use the package export
   import { Button } from "@cloudflare/kumo";
   ```

   **Required Exports:**
   - `KUMO_{COMPONENT}_VARIANTS` - Variant configuration object
   - `KUMO_{COMPONENT}_DEFAULT_VARIANTS` - Default variant values

   **Optional Exports:**
   - `KUMO_{COMPONENT}_BASE_STYLES` - Base styles (must have `KUMO_` prefix if present)

   **Examples:**

   ```tsx
   // ✅ CORRECT - Valid exports in button.tsx
   export const KUMO_BUTTON_VARIANTS = {
     variant: ["primary", "secondary", "ghost", "destructive"],
     size: ["xs", "sm", "base", "lg"],
   };

   export const KUMO_BUTTON_DEFAULT_VARIANTS = {
     variant: "secondary",
     size: "base",
   };

   // Optional base styles
   export const KUMO_BUTTON_BASE_STYLES = "flex items-center font-medium";
   ```

   ```tsx
   // ✅ CORRECT - Valid exports in clipboard-text.tsx (kebab-case → UPPER_SNAKE_CASE)
   export const KUMO_CLIPBOARD_TEXT_VARIANTS = {
     /* ... */
   };
   export const KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS = {
     /* ... */
   };
   ```

   ```tsx
   // ❌ WRONG - Missing KUMO_ prefix
   export const BUTTON_VARIANTS = {
     /* ... */
   };
   export const BUTTON_DEFAULT_VARIANTS = {
     /* ... */
   };
   ```

   ```tsx
   // ❌ WRONG - Wrong component name
   // In button.tsx:
   export const KUMO_INPUT_VARIANTS = {
     /* ... */
   };
   export const KUMO_INPUT_DEFAULT_VARIANTS = {
     /* ... */
   };
   ```

   ```tsx
   // ❌ WRONG - BASE_STYLES without KUMO_ prefix
   export const BUTTON_BASE_STYLES = "..."; // Should be KUMO_BUTTON_BASE_STYLES
   ```

   ```tsx
   // ❌ WRONG - Missing required exports
   // In button.tsx - missing KUMO_BUTTON_DEFAULT_VARIANTS
   export const KUMO_BUTTON_VARIANTS = {
     /* ... */
   };
   // Error: Component must export KUMO_BUTTON_DEFAULT_VARIANTS
   ```

### Testing (`vitest`)

```bash
pnpm --filter @cloudflare/kumo test       # Watch mode
pnpm --filter @cloudflare/kumo test:run   # Single run
pnpm --filter @cloudflare/kumo test:ui    # UI mode
```

## Icon System

Kumo uses [Phosphor Icons](https://phosphoricons.com/) directly via `@phosphor-icons/react`. This is a peer dependency that consumers must install.

### Installation

```bash
pnpm add @phosphor-icons/react
```

### Using Icons

```tsx
import { Check, ArrowRight, X } from "@phosphor-icons/react";

// Basic usage
<Check />
<ArrowRight size={24} />

// With Kumo semantic colors
<X className="text-kumo-subtle" />
<Check className="text-success" />

// Different weights
import { CheckBold, CheckLight } from "@phosphor-icons/react";
```

### Size Guidelines

| Context          | Size | Phosphor prop |
| ---------------- | ---- | ------------- |
| Inline with text | 16px | `size={16}`   |
| Buttons (sm)     | 16px | `size={16}`   |
| Buttons (base)   | 20px | `size={20}`   |
| Buttons (lg)     | 24px | `size={24}`   |
| Empty states     | 48px | `size={48}`   |

### Figma Plugin

The Figma plugin embeds a subset of Phosphor icons needed for component generation. Icons are created on-demand using `figma.createNodeFromSvg()`.

To add new icons to the Figma plugin, update `packages/kumo-figma/src/build-phosphor-icons.ts`.

## Changesets & Version Management

Kumo uses [Changesets](https://github.com/changesets/changesets) for version management with automated validation and releases.

### ⚠️ IMPORTANT: AI Agents - Do NOT Version or Publish

**AI agents should NEVER run these commands:**

- ❌ `pnpm version` - Versions packages (human-only)
- ❌ `pnpm release` - Publishes to npm (human-only)
- ❌ `pnpm publish:beta` - Publishes beta versions (CI-only)
- ❌ `pnpm release:production` - Production release script (human-only)

**AI agents SHOULD:**

- ✅ Create changesets: `pnpm changeset`
- ✅ Validate changesets exist
- ✅ Build and test: `pnpm build`, `pnpm test`

**Reasoning:** Versioning and publishing are sensitive operations that require human oversight and proper npm credentials. Beta releases are automated via CI. Production releases require manual verification.

### Creating Changesets

**CRITICAL:** Changes to `packages/kumo/` **require** a changeset. Pre-push hooks enforce this locally, and CI validates in pull requests.

```bash
pnpm changeset
```

1. Select `@cloudflare/kumo` from the package list
2. Choose change type:
   - **patch** (`0.0.1`) - Bug fixes, small updates
   - **minor** (`0.1.0`) - New components, backwards-compatible features
   - **major** (`1.0.0`) - Breaking changes, removed components
3. Write a clear description (appears in CHANGELOG.md)
4. Commit the generated `.changeset/*.md` file

### Pre-Push Validation

Lefthook enforces changeset validation before pushing:

```bash
# Push normally - validation runs automatically
git push

# Skip validation if needed (use sparingly)
git push --no-verify
LEFTHOOK=0 git push
LEFTHOOK_EXCLUDE=validate-changeset git push
```

**What it validates:**

- Detects changes to `packages/kumo/` via `git merge-base origin/main HEAD`
- Ensures a **new** changeset exists targeting `@cloudflare/kumo`
- Blocks push with clear instructions if validation fails

**Troubleshooting:**

- **Missing origin/main**: Run `git fetch origin main`
- **GUI clients (Tower, SourceTree)**: Configure PATH in client settings
- **Hook not installed**: Run `pnpm lefthook install`

### Beta Releases (Automated)

Beta versions are automatically published for pull requests:

**Format:** `{version}-beta.{commit-hash}` (e.g., `0.1.0-beta.a1b2c3d`)

**Process:**

1. Create PR with changeset
2. CI validates changeset exists
3. CI publishes beta version with `beta` tag
4. PR receives comment with installation instructions

**Install beta:**

```bash
pnpm add @cloudflare/kumo@0.1.0-beta.a1b2c3d
```

### Production Releases

```bash
# 1. Ensure on main with latest changes
git checkout main && git pull

# 2. Version packages (consumes changesets)
pnpm version

# 3. Build all packages
pnpm build:all

# 4. Publish to npm
pnpm release

# 5. Commit and push
git add .
git commit -m "chore: release @cloudflare/kumo@{version}"
git push --follow-tags
```

**What happens:**

- Updates `package.json` version
- Generates/updates `CHANGELOG.md`
- Removes consumed changeset files
- Publishes to npm registry
- Creates git tags

## Figma Token Sync

The `kumo-figma` package provides scripts to sync semantic color tokens from CSS to Figma design variables, ensuring design tokens stay in sync between code and design.

### Purpose

The Figma sync script automates synchronization of Kumo's semantic color tokens (defined in `packages/kumo/src/styles/theme-kumo.css`) to Figma variables:

1. Parses CSS tokens from `theme-kumo.css`
2. Extracts light and dark mode values from `light-dark()` functions
3. Resolves color values (oklch, hex, rgb) to Figma RGB format
4. Pushes tokens to Figma via the Variables API

This enables:

- Designers to use semantic tokens in Figma
- Automatic updates when tokens change in code
- Single source of truth for color values

### Environment Setup

1. **Get a Figma personal access token:**
   - Go to [Figma Settings > Personal Access Tokens](https://www.figma.com/developers/api#authentication)
   - Create a new token with a descriptive name (e.g., "Kumo Token Sync")
   - Copy the token (you won't see it again)

2. **Copy `.env.example` to `.env`:**

   ```bash
   cp packages/kumo-figma/scripts/.env.example packages/kumo-figma/scripts/.env
   ```

3. **Add your token to `.env`:**
   ```bash
   FIGMA_TOKEN=your-token-here
   FIGMA_FILE_KEY=sKKZc6pC6W1TtzWBLxDGSU
   ```

### Running the Sync

```bash
# With environment variable
FIGMA_TOKEN="your-token" pnpm --filter @cloudflare/kumo-figma figma:sync

# Or load from .env
source packages/kumo-figma/scripts/.env
pnpm --filter @cloudflare/kumo-figma figma:sync
```

### Security Warning

**⚠️ NEVER commit your Figma token to the repository.**

- `.env` is gitignored by default
- Always use environment variables for tokens
- Rotate tokens if accidentally exposed

For detailed documentation, see the Figma Plugin section below.

## Code Review Guidelines

When reviewing code, focus on:

### Styling

- **Verify Kumo tokens**: Ensure `bg-*`, `text-*`, `border-*` semantic classes are used (e.g., `bg-kumo-base`, `text-kumo-subtle`, `border-kumo-line`)
- **No raw Tailwind colors**: Flag any `bg-blue-500`, `text-gray-*`, etc.
- **No `dark:` variants**: Dark mode should be automatic via tokens
- **Use `cn()` utility**: For conditional class composition

### Component Quality

- **Accessibility**: Components should use Base UI primitives for a11y
- **TypeScript**: Proper typing with exported types
- **forwardRef**: Components should forward refs when wrapping DOM elements
- **displayName**: Set for debugging in React DevTools

### Performance

- **Tree-shaking**: Components should be individually importable
- **Bundle size**: Avoid unnecessary dependencies
- **Re-renders**: Check for unnecessary re-renders in complex components

### Testing

- **Demo files**: Components should have demo files in the docs site for documentation
- **Edge cases**: Consider loading, error, empty, and disabled states

## Workflow Best Practices

### Before Writing Code

1. **Always check the component registry first** (`packages/kumo/ai/component-registry.{json,md}`)
   - Use `jq` to query component props, variants, and examples
   - Never guess component APIs - the registry is always current
   - Example: `jq '.components.Button.props' packages/kumo/ai/component-registry.json`

2. **Read related components before modifying or creating similar ones**
   - Examine existing implementations for patterns
   - Maintain consistency with established conventions

### Tool Usage for AI Agents

When working with this codebase as an AI agent:

1. **Read files** to examine component implementations before modifying them
2. **Use `jq`** to query the component registry (`packages/kumo/ai/component-registry.json`)
3. **Use search tools** for complex searches across the codebase (e.g., "find all components using bg-kumo-base")
4. **Run commands** for scaffolding, build, test, and lint operations

### When Modifying Components

1. **Read the component first**
2. **Verify semantic tokens** - Ensure no raw Tailwind colors exist
3. **Run linting** - Custom rules will catch color and dark mode violations
4. **Update demos** - Ensure demo files in docs site reflect changes
5. **Regenerate registry** - Run `pnpm --filter @cloudflare/kumo codegen:registry` after changes

## Important Notes

- The component registry (`packages/kumo/ai/component-registry.{json,md}`) is the source of truth for component APIs
- Always regenerate the registry (`pnpm --filter @cloudflare/kumo codegen:registry`) after modifying component props or variants
- Custom lint rules enforce semantic token usage and prevent `dark:` variants

### Common Mistakes to Avoid

- Using raw Tailwind colors (`bg-blue-500`) instead of semantic tokens (`bg-kumo-base`)
- Using `dark:` variants instead of letting semantic tokens handle dark mode
- Forgetting to set `displayName` on `forwardRef` components
- Not checking the component registry before using a component
- Creating new components without running the scaffolding tool
- Forgetting to regenerate the component registry after changes

## CI/CD Pipeline

### Pipeline Stages

| Stage                | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `build`              | Build packages                             |
| `checks`             | Linting, typechecking, validation          |
| `test`               | Run tests                                  |
| `review`             | AI-powered code review                     |
| `beta-release`       | Publish beta npm packages                  |
| `beta-preview`       | Deploy docs previews                       |
| `mr-report`          | Post consolidated MR comment               |
| `production-release` | Deploy staging, manual production releases |

### Deployment Environments

| Package         | Staging               | Production    |
| --------------- | --------------------- | ------------- |
| kumo-docs-astro | `staging.kumo-ui.com` | `kumo-ui.com` |

### MR Reporter System

The PR reporter collects artifacts from CI jobs and posts a consolidated comment:

```
ci/
├── reporters/           # NPM, docs reporters
├── scripts/             # post-pr-report.ts, write-*-report.ts
├── utils/               # GitHub API, PR comment utilities
└── versioning/          # deploy-*.sh, publish-beta.sh
```

## Figma Plugin (`packages/kumo-figma`)

### Quick Start

```bash
## Optional: enable token sync during build
# cp packages/kumo-figma/scripts/.env.example packages/kumo-figma/scripts/.env
# $EDITOR packages/kumo-figma/scripts/.env  # set FIGMA_TOKEN (and optionally FIGMA_FILE_KEY)

# Build the plugin (auto-runs token sync when FIGMA_TOKEN is present)
pnpm --filter @cloudflare/kumo-figma build

# Run in Figma: Plugins > Development > Import plugin from manifest...
# Select: packages/kumo-figma/src/manifest.json
```

### Workflow

1. **Sync tokens** (optional): `pnpm --filter @cloudflare/kumo-figma figma:sync` (or just set `FIGMA_TOKEN` and run build)
2. **Build plugin**: `pnpm --filter @cloudflare/kumo-figma build` (auto-syncs when `FIGMA_TOKEN` is present)
3. **Run in Figma**: Plugins > Development > Kumo UI Kit Generator

### Adding New Component Generators

1. Create `generators/yourcomponent.ts`
2. Register in `code.ts` GENERATORS array
3. Run `pnpm --filter @cloudflare/kumo-figma validate` (drift detection)

### Drift Prevention

- `drift-detection.test.ts` validates generators match `component-registry.json`
- CI enforces on MRs touching `component-registry.json` or generators
- Excluded components: Add to `EXCLUDED_COMPONENTS` in drift-detection.test.ts

## Resources

- **Component Registry** - `packages/kumo/ai/component-registry.{json,md}` - Always-current component metadata
- **Docs Site** - `pnpm dev` - Documentation at `http://localhost:4321`
- **Source** - `packages/kumo/src/` - Component source code organized by type:
  - `components/` - UI primitives (Button, Input, Dialog)
  - `blocks/` - Composite components (Breadcrumbs, PageHeader, Empty)
  - `styles/` - CSS including `kumo-binding.css` (semantic token definitions)
