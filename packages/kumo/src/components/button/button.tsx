import React from "react";
import { ArrowsClockwise, type Icon } from "@phosphor-icons/react";
import { Loader } from "../loader/loader";
import { Tooltip } from "../tooltip/tooltip";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import { useLinkComponent } from "../../utils/link-provider";

/** Button variant definitions mapping shape, size, and variant names to their Tailwind classes. */
export const KUMO_BUTTON_VARIANTS = {
  shape: {
    base: {
      classes: "",
      description: "Default rectangular button shape",
    },
    square: {
      classes: "items-center justify-center p-0",
      description: "Square button for icon-only actions",
    },
    circle: {
      classes: "items-center justify-center p-0 rounded-full",
      description: "Circular button for icon-only actions",
    },
  },
  size: {
    xs: {
      classes: "h-5 gap-1 rounded-sm px-1.5 text-xs",
      description: "Extra small button for compact UIs",
    },
    sm: {
      classes: "h-6.5 gap-1 rounded-md px-2 text-xs",
      description: "Small button for secondary actions",
    },
    base: {
      classes: "h-9 gap-1.5 rounded-lg px-3 text-base",
      description: "Default button size",
    },
    lg: {
      classes: "h-10 gap-2 rounded-lg px-4 text-base",
      description: "Large button for primary CTAs",
    },
  },
  compactSize: {
    xs: { classes: "size-3.5" },
    sm: { classes: "size-6.5" },
    base: { classes: "size-9" },
    lg: { classes: "size-10" },
  },
  variant: {
    primary: {
      classes:
        "bg-kumo-brand !text-white hover:bg-kumo-brand-hover disabled:bg-kumo-brand/50",
      description: "High-emphasis button for primary actions",
    },
    secondary: {
      classes:
        "bg-kumo-base !text-kumo-default ring not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-base",
      description: "Default button style for most actions",
    },
    ghost: {
      classes: "text-kumo-default hover:bg-kumo-tint shadow-none bg-inherit",
      description: "Minimal button with no background",
    },
    destructive: {
      classes: "bg-kumo-danger !text-white hover:bg-kumo-danger/70",
      description: "Danger button for destructive actions like delete",
    },
    "secondary-destructive": {
      classes:
        "bg-kumo-base !text-kumo-danger ring not-disabled:hover:!text-kumo-danger not-disabled:hover:ring-kumo-danger/30 disabled:bg-kumo-base/50 disabled:!text-kumo-danger/70 ring-kumo-line data-[state=open]:bg-kumo-base",
      description:
        "Secondary button with destructive text for less prominent dangerous actions",
    },
    outline: {
      classes:
        "bg-transparent text-kumo-default ring ring-kumo-line transition-colors not-disabled:hover:text-kumo-strong not-disabled:hover:ring-kumo-focus/25",
      description: "Bordered button with transparent background",
    },
  },
} as const;

export const KUMO_BUTTON_DEFAULT_VARIANTS = {
  shape: "base",
  size: "base",
  variant: "secondary",
} as const;

// Derived types from KUMO_BUTTON_VARIANTS
export type KumoButtonShape = keyof typeof KUMO_BUTTON_VARIANTS.shape;
export type KumoButtonSize = keyof typeof KUMO_BUTTON_VARIANTS.size;
export type KumoButtonVariant = keyof typeof KUMO_BUTTON_VARIANTS.variant;

export interface KumoButtonVariantsProps {
  /**
   * Button shape.
   * - `"base"` — Default rectangular button
   * - `"square"` — Square button for icon-only actions
   * - `"circle"` — Circular button for icon-only actions
   * @default "base"
   */
  shape?: KumoButtonShape;
  /**
   * Button size.
   * - `"xs"` — Extra small for compact UIs
   * - `"sm"` — Small for secondary actions
   * - `"base"` — Default size
   * - `"lg"` — Large for primary CTAs
   * @default "base"
   */
  size?: KumoButtonSize;
  /**
   * Visual style of the button.
   * - `"primary"` — High-emphasis, brand-colored for primary actions
   * - `"secondary"` — Default style with border for most actions
   * - `"ghost"` — Minimal, no background for tertiary actions
   * - `"destructive"` — Danger button for destructive actions
   * - `"secondary-destructive"` — Secondary style with destructive text
   * - `"outline"` — Bordered with transparent background
   * @default "secondary"
   */
  variant?: KumoButtonVariant;
}

export function buttonVariants({
  variant = KUMO_BUTTON_DEFAULT_VARIANTS.variant,
  size = KUMO_BUTTON_DEFAULT_VARIANTS.size,
  shape = KUMO_BUTTON_DEFAULT_VARIANTS.shape,
}: KumoButtonVariantsProps = {}) {
  const isCompactShape = shape === "square" || shape === "circle";
  const needsMinimumHitArea = size === "xs";

  return cn(
    // Base styles
    "group relative flex w-max shrink-0 items-center font-medium select-none",
    "border-0 shadow-xs",
    "focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand",
    "cursor-pointer",
    // Disabled state
    "disabled:cursor-not-allowed disabled:text-kumo-subtle",
    // Apply variant, size, shape styles from KUMO_BUTTON_VARIANTS
    resolveVariant(
      KUMO_BUTTON_VARIANTS.variant,
      variant,
      KUMO_BUTTON_DEFAULT_VARIANTS.variant,
    ).classes,
    resolveVariant(
      KUMO_BUTTON_VARIANTS.size,
      size,
      KUMO_BUTTON_DEFAULT_VARIANTS.size,
    ).classes,
    resolveVariant(
      KUMO_BUTTON_VARIANTS.shape,
      shape,
      KUMO_BUTTON_DEFAULT_VARIANTS.shape,
    ).classes,
    isCompactShape &&
      resolveVariant(
        KUMO_BUTTON_VARIANTS.compactSize,
        size,
        KUMO_BUTTON_DEFAULT_VARIANTS.size,
      ).classes,
    // Keep the compact visual size while meeting the WCAG 2.2 AA 24px
    // minimum target floor for xs buttons and xs icon buttons.
    needsMinimumHitArea &&
      "before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] disabled:before:hidden",
  );
}

const DECORATIVE_ICON_PROPS = {
  "aria-hidden": true,
  focusable: "false",
} as const;

const collectMeaningfulButtonText = (node: ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return "";
  }

  if (node.getAttribute("aria-hidden") === "true") {
    return "";
  }

  if (node instanceof SVGElement || node.tagName.toLowerCase() === "svg") {
    return "";
  }

  return Array.from(node.childNodes).map(collectMeaningfulButtonText).join("");
};

const getMeaningfulButtonText = (element: HTMLElement): string =>
  Array.from(element.childNodes)
    .map(collectMeaningfulButtonText)
    .join("")
    .trim();

// Normalize icon prop to support both React elements and component types.
// The button or adjacent text provides the accessible name, so the icon is
// always rendered as decorative.
const renderIconNode = (IconComponent?: Icon | React.ReactNode) => {
  if (!IconComponent) return null;
  if (React.isValidElement<Record<string, unknown>>(IconComponent)) {
    return React.cloneElement(IconComponent, DECORATIVE_ICON_PROPS);
  }
  const Comp = IconComponent as React.ComponentType<Record<string, unknown>>;
  return <Comp {...DECORATIVE_ICON_PROPS} />;
};

/**
 * Button component props.
 *
 * Keeps the existing discriminated union on `shape` so compact icon-only
 * buttons (`shape="square"` or `shape="circle"`) require an `aria-label`.
 * Runtime development warnings also cover any button without visible text or
 * `aria-label`/`aria-labelledby`, regardless of shape.
 * Use localized accessible names in product code.
 *
 * @example
 * ```tsx
 * <Button variant="primary">Save</Button>
 * <Button variant="secondary" shape="square" icon={PlusIcon} aria-label="Add item" />
 * <Button variant="destructive" loading>Deleting...</Button>
 * ```
 */
type ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Content rendered inside the button. */
  children?: React.ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Icon from `@phosphor-icons/react` or a React element. Rendered before children. */
  icon?: Icon | React.ReactNode;
  /** Shows a loading spinner and disables interaction. */
  loading?: boolean;
  /** When set, wraps the button in a Tooltip with this content. */
  title?: React.ReactNode;
};

type ButtonWithTextProps = ButtonBaseProps & {
  shape?: "base";
  size?: KumoButtonSize;
  variant?: KumoButtonVariant;
};

type IconOnlyButtonProps = ButtonBaseProps & {
  shape: "square" | "circle";
  size?: KumoButtonSize;
  variant?: KumoButtonVariant;
  /** Required for icon-only buttons to provide accessible label for screen readers */
  "aria-label": string;
};

export type ButtonProps = ButtonWithTextProps | IconOnlyButtonProps;

/**
 * LinkButton component props — renders an anchor styled as a button.
 *
 * @example
 * ```tsx
 * <LinkButton href="/docs" variant="ghost" icon={BookIcon}>Docs</LinkButton>
 * <LinkButton href="https://example.com" external>Visit Site</LinkButton>
 * ```
 */
export type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  KumoButtonVariantsProps & {
    /** Content rendered inside the link button. */
    children?: React.ReactNode;
    /** Additional CSS classes merged via `cn()`. */
    className?: string;
    /** Icon from `@phosphor-icons/react` or a React element. Rendered before children. */
    icon?: Icon | React.ReactNode;
    /** When `true`, opens in a new tab with `rel="noopener noreferrer"`. */
    external?: boolean;
    linksExternal?: boolean;
  };

/**
 * Primary action trigger. Supports multiple variants, sizes, shapes, icons, and loading state.
 *
 * @example
 * ```tsx
 * <Button variant="primary">Save</Button>
 * <Button variant="secondary" icon={PlusIcon}>Create Worker</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading,
      shape = "base",
      size = "base",
      variant = "secondary",
      icon: IconComponent,
      title,
      ...props
    },
    ref,
  ) => {
    const { type, ...restProps } = props;
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(
      ref,
      () => buttonRef.current as HTMLButtonElement,
    );

    const ariaLabel = restProps["aria-label"];
    const ariaLabelledBy = restProps["aria-labelledby"];

    React.useEffect(() => {
      if (process.env.NODE_ENV === "production") return;

      const hasAriaLabel =
        typeof ariaLabel === "string" ? ariaLabel.trim().length > 0 : false;
      const hasAriaLabelledBy =
        typeof ariaLabelledBy === "string"
          ? ariaLabelledBy.trim().length > 0
          : false;
      const hasMeaningfulContent = buttonRef.current
        ? getMeaningfulButtonText(buttonRef.current).length > 0
        : false;

      if (!hasMeaningfulContent && !hasAriaLabel && !hasAriaLabelledBy) {
        console.warn(
          "[Kumo Button]: Button must have an accessible name when it has no visible text. " +
            "Provide localized text content, aria-label, or aria-labelledby.",
        );
      }
    }, [ariaLabel, ariaLabelledBy, children, IconComponent, loading]);

    const button = (
      <button
        ref={buttonRef}
        data-kumo-component="Button"
        className={cn(
          buttonVariants({ variant, size, shape }),
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        disabled={loading || disabled}
        type={type ?? "button"}
        {...restProps}
      >
        {loading ? (
          <Loader size={size === "lg" ? 16 : 14} />
        ) : (
          renderIconNode(IconComponent)
        )}
        {children != null && <span className="contents">{children}</span>}
      </button>
    );

    if (title) {
      return <Tooltip content={title} render={button} />;
    }

    return button;
  },
);

Button.displayName = "Button";

/**
 * Square button with a rotating arrows icon, used to trigger data refresh actions.
 *
 * @example
 * ```tsx
 * <RefreshButton loading={isRefreshing} onClick={refresh} />
 * ```
 */
export const RefreshButton = ({
  "aria-label": ariaLabel = "Refresh",
  loading,
  ...props
}: ButtonProps) => (
  <Button shape="square" aria-label={ariaLabel} {...props}>
    <ArrowsClockwise
      aria-hidden="true"
      className={cn({
        "animate-refresh": loading,
        "size-4.5": props.size === "base" || !props.size,
        "size-4": props.size === "sm",
        "size-5": props.size === "lg",
      })}
      focusable="false"
    />
  </Button>
);

/**
 * Anchor element styled as a button. Integrates with `LinkProvider` for framework routing.
 *
 * @example
 * ```tsx
 * <LinkButton href="/settings" variant="ghost">Settings</LinkButton>
 * ```
 */
export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      children,
      className,
      external,
      href,
      shape = "base",
      size = "base",
      variant = "ghost",
      icon: IconComponent,
      // linksExternal = false,
      ...props
    },
    ref,
  ) => {
    const LinkComponent = useLinkComponent();
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <LinkComponent
        ref={ref}
        data-kumo-component="LinkButton"
        className={cn(
          buttonVariants({ variant, size, shape }),
          "flex items-center no-underline!",
          className,
        )}
        href={href}
        to={typeof href === "string" ? href : undefined}
        {...externalProps}
        {...props}
      >
        {renderIconNode(IconComponent)}
        {children}
      </LinkComponent>
    );
  },
);

LinkButton.displayName = "LinkButton";
