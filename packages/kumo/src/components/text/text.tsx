import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ForwardedRef,
  forwardRef,
  useMemo,
} from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";

/**
 * Text variant and size definitions mapping names to their Tailwind classes.
 *
 * Heading variants are role-based:
 *   display        24px semibold — hero / prominent moments
 *   page-title     17px medium   — the single title of a page or dialog
 *   section-title  15px medium   — card / panel / section headings
 *   heading        13px medium   — inline / row / list-item headings
 *
 * `heading1`, `heading2`, `heading3` are retained as deprecated aliases of
 * `display`, `page-title`, `section-title` respectively.
 *
 * Sizes: sm=12px, base=13px (default). `xs` and `lg` are deprecated.
 */
export const KUMO_TEXT_VARIANTS = {
  variant: {
    display: {
      classes: "text-2xl font-semibold",
      description: "Display heading — hero / prominent moments (24px semibold)",
    },
    "page-title": {
      classes: "text-xl font-medium",
      description: "Page or dialog title (17px medium)",
    },
    "section-title": {
      classes: "text-lg font-medium",
      description: "Card / panel / section heading (15px medium)",
    },
    heading: {
      classes: "text-base font-medium",
      description:
        "Inline / row / list-item heading (13px medium). The small, most-used heading.",
    },
    // Deprecated aliases — kept for backwards compatibility. Emit a runtime
    // warning in dev when used. Same classes as their replacements.
    heading1: {
      classes: "text-2xl font-semibold",
      description: "@deprecated Use variant=\"display\" instead.",
    },
    heading2: {
      classes: "text-xl font-medium",
      description: "@deprecated Use variant=\"page-title\" instead.",
    },
    heading3: {
      classes: "text-lg font-medium",
      description: "@deprecated Use variant=\"section-title\" instead.",
    },
    body: {
      classes: "text-kumo-default",
      description: "Default body text",
    },
    secondary: {
      classes: "text-kumo-subtle",
      description: "Muted text for secondary information",
    },
    success: {
      classes: "text-kumo-link",
      description: "Success state text",
    },
    error: {
      classes: "text-kumo-danger",
      description: "Error state text",
    },
    mono: {
      classes: "font-mono",
      description: "Monospace text for code",
    },
    "mono-secondary": {
      classes: "font-mono text-kumo-subtle",
      description: "Muted monospace text",
    },
  },
  size: {
    sm: {
      classes: "text-sm",
      description: "Small (12px) — caption / helper text",
    },
    base: {
      classes: "text-base",
      description: "Default body size (13px)",
    },
    // Deprecated sizes — kept for backwards compatibility. Emit a runtime
    // warning in dev when used. Same classes as before to avoid layout
    // shifts on existing usages.
    xs: {
      classes: "text-xs",
      description:
        '@deprecated Use `size="sm"` instead. The `xs` size will be removed in a future major version.',
    },
    lg: {
      classes: "text-lg",
      description:
        '@deprecated Use `size="base"` instead. The `lg` size will be removed in a future major version.',
    },
  },
} as const;

export const KUMO_TEXT_DEFAULT_VARIANTS = {
  variant: "body",
  size: "base",
} as const;

/**
 * KUMO_TEXT_STYLING - Typography metadata for Figma generator.
 *
 * Documents the actual pixel sizes and weights emitted by each token so the
 * Figma plugin can generate matching styles.
 *
 * Source of truth chain:
 * text.tsx (this file) → component-registry.json → text.ts (Figma generator)
 */
export const KUMO_TEXT_STYLING = {
  fontSizes: {
    xs: 11,
    sm: 12,
    base: 13,
    lg: 15,
    xl: 17,
    "2xl": 24,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  baseColor: "text-kumo-default",
  variantColors: {
    body: "text-kumo-default",
    secondary: "text-kumo-subtle",
    success: "text-kumo-link",
    error: "text-kumo-danger",
    mono: "text-kumo-default",
    "mono-secondary": "text-kumo-subtle",
  },
  fontFamilies: {
    default: "sans-serif",
    mono: "monospace",
  },
} as const;

// Derived types from KUMO_TEXT_VARIANTS
export type KumoTextVariant = keyof typeof KUMO_TEXT_VARIANTS.variant;
export type KumoTextSize = keyof typeof KUMO_TEXT_VARIANTS.size;

export interface KumoTextVariantsProps {
  variant?: KumoTextVariant;
  size?: KumoTextSize;
}

export function textVariants({
  variant = KUMO_TEXT_DEFAULT_VARIANTS.variant,
  size = KUMO_TEXT_DEFAULT_VARIANTS.size,
}: KumoTextVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_TEXT_VARIANTS.variant,
      variant,
      KUMO_TEXT_DEFAULT_VARIANTS.variant,
    ).classes,
    resolveVariant(
      KUMO_TEXT_VARIANTS.size,
      size,
      KUMO_TEXT_DEFAULT_VARIANTS.size,
    ).classes,
  );
}

// Heading variants (role-based) + deprecated numeric aliases.
type HeadingRole = "display" | "page-title" | "section-title" | "heading";
type HeadingDeprecated = "heading1" | "heading2" | "heading3";
type Heading = HeadingRole | HeadingDeprecated;
type Copy = "body" | "secondary" | "success" | "error";
type Monospace = "mono" | "mono-secondary";
type TextSize = KumoTextSize;
type TextVariant = KumoTextVariant;

/** Map deprecated heading variant names to their replacements. */
const DEPRECATED_HEADING_MAP: Record<HeadingDeprecated, HeadingRole> = {
  heading1: "display",
  heading2: "page-title",
  heading3: "section-title",
};

const HEADING_VARIANTS = new Set<string>([
  "display",
  "page-title",
  "section-title",
  "heading",
  "heading1",
  "heading2",
  "heading3",
]);

/** Valid HTML elements for the Text component's `as` prop. */
export type TextElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "label"
  | "dt"
  | "dd"
  | "li"
  | "figcaption"
  | "legend"
  | "pre"
  | "code"
  | "em"
  | "strong"
  | "small"
  | "abbr"
  | "time";

type BaseTextProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "className" | "style"
> & {
  DANGEROUS_className?: string;
  DANGEROUS_style?: CSSProperties;
};

type TextPropsInternal<Variant extends TextVariant = "body"> = BaseTextProps &
  (Variant extends Copy
    ? {
        variant?: Variant;
        size?: TextSize;
        /**
         * Bumps the weight of body copy to `font-medium` (500). Only
         * applies to copy variants (`body`, `secondary`, `success`,
         * `error`); heading variants already carry their role's weight.
         * For structural hierarchy inside a document outline reach for
         * `variant="heading"` instead; `bold` is for inline emphasis.
         */
        bold?: boolean;
        truncate?: boolean;
        /** Optional element override. Defaults to `<p>`. */
        as?: TextElement;
      }
    : Variant extends Monospace
      ? {
          variant?: Variant;
          /** @deprecated `size="lg"` is deprecated. Monospace text always renders at 12px. */
          size?: "lg";
          bold?: never;
          truncate?: boolean;
          /** Optional element override. Defaults to `<span>`. */
          as?: TextElement;
        }
      : Variant extends Heading
        ? {
            variant: Variant;
            size?: never;
            bold?: never;
            truncate?: boolean;
            /**
             * Required for heading variants. Pick the element that reflects
             * this text's place in the document outline (`"h1"` for a page
             * title, `"h2"` for a section title, etc.) or `"span"` for
             * decorative heading-styled text that is NOT a section heading.
             */
            as: TextElement;
          }
        : never);

/**
 * Text component props.
 *
 * @example
 * ```tsx
 * <Text variant="display" as="h1">Welcome</Text>
 * <Text variant="page-title" as="h1">Account settings</Text>
 * <Text variant="section-title" as="h2">General</Text>
 * <Text variant="heading" as="h3">API tokens</Text>
 * <Text variant="body">Default paragraph text.</Text>
 * <Text variant="secondary" size="sm">Muted helper text</Text>
 * <Text variant="error">Something went wrong</Text>
 * <Text variant="mono">console.log("code")</Text>
 * ```
 */
export interface TextProps {
  /**
   * Text style variant.
   *
   * Heading variants (role-based, weight-first hierarchy):
   * - `"display"` — Hero / prominent moments (24px semibold)
   * - `"page-title"` — The single title of a page or dialog (17px medium)
   * - `"section-title"` — Card / panel / section heading (15px medium)
   * - `"heading"` — Inline / row / list-item heading (13px medium)
   *
   * Body variants:
   * - `"body"` — Default body text (13px)
   * - `"secondary"` — Muted text for secondary information
   * - `"success"` — Success state text
   * - `"error"` — Error state text
   * - `"mono"` — Monospace text for code
   * - `"mono-secondary"` — Muted monospace text
   *
   * Deprecated (use the role-based names above):
   * - `"heading1"` → use `"display"`
   * - `"heading2"` → use `"page-title"`
   * - `"heading3"` → use `"section-title"`
   *
   * @default "body"
   */
  variant?: KumoTextVariant;
  /**
   * Text size (only applies to body/secondary/success/error variants).
   * - `"sm"` — 12px (caption / helper text)
   * - `"base"` — 13px (default body)
   * - `"xs"` — **Deprecated.** Use `"sm"` instead.
   * - `"lg"` — **Deprecated.** Use `"base"` instead.
   * @default "base"
   */
  size?: KumoTextSize;
  /**
   * Bumps body copy weight to `font-medium` (500). Only applies to copy
   * variants (`body`, `secondary`, `success`, `error`); heading variants
   * already carry their role's weight and disallow this prop at the type
   * level. For structural hierarchy inside a document outline reach for
   * `variant="heading"` instead — `bold` is for inline emphasis.
   * @default false
   */
  bold?: boolean;
  /** Whether to truncate overflowing text with an ellipsis. Adds `truncate min-w-0` classes. */
  truncate?: boolean;
  /**
   * The HTML element to render. Accepts headings (`"h1"`–`"h6"`), block text
   * (`"p"`, `"pre"`), inline text (`"span"`, `"code"`, `"em"`, `"strong"`,
   * `"small"`, `"abbr"`, `"time"`), form-related (`"label"`, `"legend"`),
   * list/definition (`"dt"`, `"dd"`, `"li"`), and `"figcaption"`.
   *
   * - **Required** for heading variants (`"display"`, `"page-title"`,
   *   `"section-title"`, `"heading"`) — pick the element that reflects this
   *   text's place in the document outline, or `"span"` for decorative
   *   heading-styled text that is not a section heading.
   * - **Optional** for body variants (defaults to `"p"`) and monospace
   *   variants (defaults to `"span"`).
   */
  as?: TextElement;
  /** Text content. */
  children?: React.ReactNode;
}

/**
 * Typography component for rendering text with consistent styling.
 * Renders as `<p>` for body variants and `<span>` for headings/mono.
 * Use the `as` prop to set semantic HTML elements for proper document outlines.
 *
 * @example
 * ```tsx
 * <Text variant="display" as="h1">Welcome</Text>
 * <Text variant="page-title" as="h1">Account settings</Text>
 * <Text variant="section-title" as="h2">General</Text>
 * <Text variant="heading" as="h3">API tokens</Text>
 * <Text>Default body text</Text>
 * ```
 */
function _Text<Variant extends TextVariant = "body">(
  {
    variant = "body" as Variant,
    size = "base",
    bold,
    truncate = false,
    children,
    DANGEROUS_className,
    DANGEROUS_style,
    as,
    ...props
  }: TextPropsInternal<Variant>,
  ref: ForwardedRef<HTMLElement>,
) {
  const isCopy = ["body", "secondary", "success", "error"].includes(variant);
  const isMono = ["mono", "mono-secondary"].includes(variant);

  // Deprecation warning for legacy heading variant names.
  if (
    process.env.NODE_ENV !== "production" &&
    (variant === "heading1" || variant === "heading2" || variant === "heading3")
  ) {
    const replacement = DEPRECATED_HEADING_MAP[variant];
    console.warn(
      `[Kumo Text]: variant="${variant}" is deprecated. Use variant="${replacement}" instead.`,
    );
  }

  // Deprecation warnings for legacy sizes on Copy variants.
  // Mono variants intentionally still accept `size="lg"` as a step-up hint
  // but render at the same 12px — no warning there.
  if (process.env.NODE_ENV !== "production" && isCopy) {
    if (size === "xs") {
      console.warn(
        '[Kumo Text]: size="xs" is deprecated. Use size="sm" instead. The xs size will be removed in a future major version.',
      );
    } else if (size === "lg") {
      console.warn(
        '[Kumo Text]: size="lg" is deprecated. Use size="base" instead. The lg size will be removed in a future major version.',
      );
    }
  }

  // Heading variants no longer auto-select h1/h2/h3 to avoid coupling visual
  // presentation to semantic HTML. Use the `as` prop to set the appropriate
  // heading level for your document outline (e.g., as="h2").
  const Component = useMemo(() => {
    if (as) return as;
    if (isMono) return "span";
    // Headings default to span; use `as` for semantic elements
    if (HEADING_VARIANTS.has(variant)) return "span";
    return "p";
  }, [variant, as, isMono]);

  return (
    <Component
      // The dynamic `Component` tag creates an impossible intersection of ref
      // types across all TextElement members. We widen to the common base
      // (HTMLElement) which is safe — all text elements extend HTMLElement.
      ref={ref as React.RefCallback<HTMLElement>}
      className={cn(
        "text-kumo-default",
        resolveVariant(
          KUMO_TEXT_VARIANTS.variant,
          variant,
          KUMO_TEXT_DEFAULT_VARIANTS.variant,
        ).classes,
        isCopy
          ? resolveVariant(
              KUMO_TEXT_VARIANTS.size,
              size,
              KUMO_TEXT_DEFAULT_VARIANTS.size,
            ).classes
          : "",
        // Monospace fonts render one size step down from body text so they
        // optically match — always text-sm (12px).
        isMono && KUMO_TEXT_VARIANTS.size.sm.classes,
        // `bold` on copy variants bumps body copy from the default 400 to
        // font-medium (500). Type-narrowed to `never` on headings and mono,
        // so this only ever fires on copy.
        isCopy && bold && "font-medium",
        truncate && "min-w-0 truncate",
        DANGEROUS_className,
      )}
      style={DANGEROUS_style}
      {...props}
    >
      {children}
    </Component>
  );
}

export const Text = forwardRef(_Text) as <Variant extends TextVariant = "body">(
  props: TextPropsInternal<Variant> & {
    ref?: ForwardedRef<ElementRef<"span">>;
  },
) => React.ReactElement;
