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

/** Text variant and size definitions mapping names to their Tailwind classes. */
export const KUMO_TEXT_VARIANTS = {
  variant: {
    heading: {
      classes: "text-lg font-semibold",
      description: "Heading text (16px by default, 20px at large size)",
    },
    /** @deprecated Use `heading` and set `size` and `as` explicitly. */
    heading1: {
      classes: "text-3xl font-semibold",
      description:
        "Deprecated large heading for page titles; use heading instead",
    },
    /** @deprecated Use `heading` and set `size` and `as` explicitly. */
    heading2: {
      classes: "text-2xl font-semibold",
      description:
        "Deprecated medium heading for section titles; use heading instead",
    },
    /** @deprecated Use `heading` and set `size` and `as` explicitly. */
    heading3: {
      classes: "text-lg font-semibold",
      description:
        "Deprecated small heading for subsections; use heading instead",
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
    xs: {
      classes: "text-xs/[inherit]",
      description: "Extra small text",
    },
    sm: {
      classes: "text-sm/[inherit]",
      description: "Small text",
    },
    base: {
      classes: "text-base/[inherit]",
      description: "Default text size",
    },
    lg: {
      classes: "text-lg/[inherit]",
      description: "Large text",
    },
  },
} as const;

export const KUMO_TEXT_DEFAULT_VARIANTS = {
  variant: "body",
  size: "base",
} as const;

/**
 * KUMO_TEXT_STYLING - Typography metadata for Figma generator
 *
 * This export provides structured styling information extracted from text.tsx
 * for use by the Figma plugin generator. It documents font sizes, weights,
 * colors, and font families used across all Text variants.
 *
 * Source of truth chain:
 * text.tsx (this file) → component-registry.json → text.ts (Figma generator)
 */
export const KUMO_TEXT_STYLING = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
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

type Heading = "heading";
type DeprecatedHeading = "heading1" | "heading2" | "heading3";
type Copy = "body" | "secondary" | "success" | "error";
type Monospace = "mono" | "mono-secondary";
type TextSize = KumoTextSize;
type TextVariant = KumoTextVariant;

const DEPRECATED_HEADING_VARIANTS: readonly DeprecatedHeading[] = [
  "heading1",
  "heading2",
  "heading3",
];

function isDeprecatedHeadingVariant(
  variant: TextVariant,
): variant is DeprecatedHeading {
  return (DEPRECATED_HEADING_VARIANTS as readonly TextVariant[]).includes(
    variant,
  );
}

function resolveTextSizeClasses(variant: TextVariant, size: TextSize) {
  if (variant === "heading") {
    return size === "lg" ? "text-xl" : "";
  }

  if (isDeprecatedHeadingVariant(variant)) {
    return "";
  }

  if (["mono", "mono-secondary"].includes(variant)) {
    // Monospace fonts need to be 1pt smaller than body text to optically match.
    return size === "lg"
      ? KUMO_TEXT_VARIANTS.size.base.classes
      : KUMO_TEXT_VARIANTS.size.sm.classes;
  }

  return resolveVariant(
    KUMO_TEXT_VARIANTS.size,
    size,
    KUMO_TEXT_DEFAULT_VARIANTS.size,
  ).classes;
}

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
    resolveTextSizeClasses(variant, size),
  );
}

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
        bold?: boolean;
        size?: TextSize;
        truncate?: boolean;
        /** Optional element override. Defaults to `<p>`. */
        as?: TextElement;
      }
    : Variant extends Monospace
      ? {
          variant?: Variant;
          bold?: never;
          size?: "lg";
          truncate?: boolean;
          /** Optional element override. Defaults to `<span>`. */
          as?: TextElement;
        }
      : Variant extends Heading
        ? {
            variant: Variant;
            bold?: never;
            size?: "lg";
            truncate?: boolean;
            /**
             * Optional element override. Defaults to `<span>`. Pass the
             * appropriate heading element (`"h1"`–`"h6"`) when this text
             * belongs in the document outline.
             */
            as?: TextElement;
          }
        : Variant extends DeprecatedHeading
          ? {
              variant: Variant;
              bold?: never;
              size?: never;
              truncate?: boolean;
              /**
               * Required for deprecated heading variants. Pick the element
               * that reflects this text's place in the document outline, or
               * `"span"` for decorative heading-styled text.
               */
              as: TextElement;
            }
          : never);

/**
 * Text component props.
 *
 * @example
 * ```tsx
 * <Text variant="heading" size="lg" as="h1">Page Title</Text>
 * <Text variant="heading">Decorative heading text</Text>
 * <Text variant="body">Default paragraph text.</Text>
 * <Text variant="secondary" size="sm">Muted helper text</Text>
 * <Text variant="error">Something went wrong</Text>
 * <Text variant="mono">console.log("code")</Text>
 * ```
 */
export interface TextProps {
  /**
   * Text style variant. Determines color, font, and weight.
   * - `"heading"` — Heading text (16px by default, 20px with `size="lg"`; semibold)
   * - `"heading1"` — Deprecated; use `"heading"` (30px, semibold)
   * - `"heading2"` — Deprecated; use `"heading"` (24px, semibold)
   * - `"heading3"` — Deprecated; use `"heading"` (16px, semibold)
   * - `"body"` — Default body text
   * - `"secondary"` — Muted text for secondary information
   * - `"success"` — Success state text
   * - `"error"` — Error state text
   * - `"mono"` — Monospace text for code
   * - `"mono-secondary"` — Muted monospace text
   * @default "body"
   */
  variant?: KumoTextVariant;
  /**
   * Text size. Supported values depend on the variant:
   * - `"heading"` — 16px when omitted, or 20px with `"lg"`
   * - Body variants — `"xs"` (12px), `"sm"` (13px), `"base"` (14px),
   *   or `"lg"` (16px)
   * - Monospace variants — 13px when omitted, or 14px with `"lg"`
   * @default "base"
   */
  size?: KumoTextSize;
  /** Whether to use bold font weight (only applies to body variants). */
  bold?: boolean;
  /** Whether to truncate overflowing text with an ellipsis. Adds `truncate min-w-0` classes. */
  truncate?: boolean;
  /**
   * The HTML element to render. Accepts headings (`"h1"`–`"h6"`), block text
   * (`"p"`, `"pre"`), inline text (`"span"`, `"code"`, `"em"`, `"strong"`,
   * `"small"`, `"abbr"`, `"time"`), form-related (`"label"`, `"legend"`),
   * list/definition (`"dt"`, `"dd"`, `"li"`), and `"figcaption"`.
   *
   * - **Optional** for `"heading"` (defaults to `"span"`). Pass the heading
   *   element that reflects this text's place in the document outline.
   * - **Required** for deprecated heading variants (`"heading1"`,
   *   `"heading2"`, `"heading3"`).
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
 * <Text variant="heading" size="lg" as="h1">Page Title</Text>
 * <Text variant="heading" as="h2">Section Title</Text>
 * <Text>Default body text</Text>
 * ```
 */
function _Text<Variant extends TextVariant = "body">(
  {
    variant = "body" as Variant,
    bold = false,
    size = "base",
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
  const isDeprecatedHeading = isDeprecatedHeadingVariant(variant);

  if (process.env.NODE_ENV !== "production" && isDeprecatedHeading) {
    console.warn(
      `[Kumo Text]: variant="${variant}" is deprecated. Use variant="heading" and set size and as explicitly.`,
    );
  }

  // Heading variants do not auto-select h1/h2/h3, keeping visual presentation
  // separate from the document outline. Use `as` to opt into semantic HTML.
  const Component = useMemo(() => {
    if (as) return as;
    if (["mono", "mono-secondary"].includes(variant)) return "span";
    if (variant === "heading" || isDeprecatedHeadingVariant(variant)) {
      return "span";
    }
    return "p";
  }, [variant, as]);

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
        resolveTextSizeClasses(variant, size),
        isCopy && bold ? "font-medium" : "",
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
