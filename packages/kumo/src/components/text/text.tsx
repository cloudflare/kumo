import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ForwardedRef,
  forwardRef,
  useMemo,
  type ElementType,
} from "react";
import { cn } from "../../utils/cn";

/** Text variant and size definitions mapping names to their Tailwind classes. */
export const KUMO_TEXT_VARIANTS = {
  variant: {
    heading1: {
      classes: "text-3xl font-semibold",
      description: "Large heading for page titles",
    },
    heading2: {
      classes: "text-2xl font-semibold",
      description: "Medium heading for section titles",
    },
    heading3: {
      classes: "text-lg font-semibold",
      description: "Small heading for subsections",
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
      classes: "text-xs",
      description: "Extra small text",
    },
    sm: {
      classes: "text-sm",
      description: "Small text",
    },
    base: {
      classes: "text-base",
      description: "Default text size",
    },
    lg: {
      classes: "text-lg",
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

export interface KumoTextVariantsProps {
  variant?: KumoTextVariant;
  size?: KumoTextSize;
}

export function textVariants({
  variant = KUMO_TEXT_DEFAULT_VARIANTS.variant,
  size = KUMO_TEXT_DEFAULT_VARIANTS.size,
}: KumoTextVariantsProps = {}) {
  return cn(
    KUMO_TEXT_VARIANTS.variant[variant].classes,
    KUMO_TEXT_VARIANTS.size[size].classes,
  );
}

// Legacy types for backwards compatibility
type Heading = "heading1" | "heading2" | "heading3";
type Copy = "body" | "secondary" | "success" | "error";
type Monospace = "mono" | "mono-secondary";
type TextSize = KumoTextSize;
type TextVariant = KumoTextVariant;

type BaseTextProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "className" | "style"
> & {
  DANGEROUS_className?: string;
  DANGEROUS_style?: CSSProperties;
  as?: ElementType;
};

type TextPropsInternal<Variant extends TextVariant = "body"> = BaseTextProps &
  (Variant extends Copy
    ? {
        variant?: Variant;
        bold?: boolean;
        size?: TextSize;
      }
    : Variant extends Monospace
      ? {
          variant?: Variant;
          bold?: never;
          size?: "lg";
        }
      : Variant extends Heading
        ? {
            variant?: Variant;
            bold?: never;
            size?: never;
          }
        : never);

/**
 * Text component props.
 *
 * @example
 * ```tsx
 * <Text variant="heading1">Page Title</Text>
 * <Text variant="body">Default paragraph text.</Text>
 * <Text variant="secondary" size="sm">Muted helper text</Text>
 * <Text variant="error">Something went wrong</Text>
 * <Text variant="mono">console.log("code")</Text>
 * ```
 */
export interface TextProps {
  /**
   * Text style variant. Determines color, font, and weight.
   * - `"heading1"` — Large page title (30px, semibold)
   * - `"heading2"` — Section title (24px, semibold)
   * - `"heading3"` — Subsection title (18px, semibold)
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
   * Text size (only applies to body/secondary/success/error variants).
   * - `"xs"` — 12px
   * - `"sm"` — 14px
   * - `"base"` — 16px
   * - `"lg"` — 18px
   * @default "base"
   */
  size?: KumoTextSize;
  /** Whether to use bold font weight (only applies to body variants). */
  bold?: boolean;
  /** The HTML element type to render as (e.g. `"span"`, `"p"`, `"h1"`). Auto-selected based on variant if omitted. */
  as?: ElementType;
  /** Text content. */
  children?: React.ReactNode;
}

/**
 * Typography component for rendering text with consistent styling.
 * Automatically selects the appropriate HTML element based on variant
 * (`h1`/`h2`/`h3` for headings, `p` for body, `span` for mono).
 *
 * @example
 * ```tsx
 * <Text variant="heading1">Dashboard</Text>
 * <Text>Default body text</Text>
 * ```
 */
function _Text<Variant extends TextVariant = "body">(
  {
    variant = "body" as Variant,
    bold = false,
    size = "base",
    children,
    DANGEROUS_className,
    DANGEROUS_style,
    as,
    ...props
  }: TextPropsInternal<Variant>,
  ref: ForwardedRef<HTMLHeadingElement>,
) {
  const isCopy = ["body", "secondary", "success", "error"].includes(variant);
  const isMono = ["mono", "mono-secondary"].includes(variant);

  const Component = useMemo(() => {
    if (as) return as;
    if (variant === "heading1") return "h1";
    if (variant === "heading2") return "h2";
    if (variant === "heading3") return "h3";
    if (["mono", "mono-secondary"].includes(variant)) return "span";
    return "p";
  }, [variant, as]);

  return (
    <Component
      ref={ref}
      className={cn(
        "text-kumo-default",
        KUMO_TEXT_VARIANTS.variant[variant].classes,
        isCopy ? KUMO_TEXT_VARIANTS.size[size].classes : "",
        isCopy && bold ? "font-medium" : "",
        // Monospace fonts need to be 1pt smaller than body text to optically match
        isMono &&
          (size === "lg"
            ? KUMO_TEXT_VARIANTS.size.base.classes
            : KUMO_TEXT_VARIANTS.size.sm.classes),
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
