import React from "react";
import { ArrowsClockwiseIcon, type Icon } from "@phosphor-icons/react";
import { Loader } from "../loader/loader";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";

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
      classes: "h-5 gap-1 px-1.5 rounded-sm text-xs",
      description: "Extra small button for compact UIs",
    },
    sm: {
      classes: "h-6.5 gap-1 px-2 rounded-md text-xs",
      description: "Small button for secondary actions",
    },
    base: {
      classes: "h-9 gap-1.5 px-3 rounded-lg text-base",
      description: "Default button size",
    },
    lg: {
      classes: "h-10 gap-2 px-4 rounded-lg text-base",
      description: "Large button for primary CTAs",
    },
  },
  compactSize: {
    xs: { classes: "size-3.5 [&_svg:not([class*='size-'])]:size-3" },
    sm: { classes: "size-6.5 [&_svg:not([class*='size-'])]:size-4" },
    base: { classes: "size-9 [&_svg:not([class*='size-'])]:size-5" },
    lg: { classes: "size-10 [&_svg:not([class*='size-'])]:size-5" },
  },
  variant: {
    primary: {
      classes:
        "bg-kumo-brand text-white not-disabled:[:hover,:focus-visible,[data-pressed]]:bg-kumo-brand-hover",
      description: "High-emphasis button for primary actions",
    },
    secondary: {
      classes:
        "bg-kumo-control text-kumo-default ring ring-kumo-line shadow-none not-disabled:not-data-pressed:hover:ring-kumo-control",
      description: "Default button style for most actions",
    },
    ghost: {
      classes:
        "bg-inherit text-kumo-default shadow-none not-disabled:[:hover,[data-pressed]]:bg-kumo-tint",
      description: "Minimal button with no background",
    },
    destructive: {
      classes:
        "bg-kumo-danger text-white shadow-none not-disabled:[:hover,[data-pressed]]:bg-kumo-danger/70",
      description: "Danger button for destructive actions like delete",
    },
    "secondary-destructive": {
      classes:
        "bg-kumo-control text-kumo-danger ring ring-kumo-line shadow-none not-disabled:not-data-pressed:hover:ring-kumo-control",
      description:
        "Secondary button with destructive text for less prominent dangerous actions",
    },
    outline: {
      classes:
        "bg-kumo-base text-kumo-default ring ring-kumo-line not-disabled:[:hover,[data-pressed]]:bg-kumo-control data-[state=open]:bg-kumo-control",
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
  shape?: KumoButtonShape;
  size?: KumoButtonSize;
  variant?: KumoButtonVariant;
}

export function buttonVariants({
  variant = KUMO_BUTTON_DEFAULT_VARIANTS.variant,
  size = KUMO_BUTTON_DEFAULT_VARIANTS.size,
  shape = KUMO_BUTTON_DEFAULT_VARIANTS.shape,
}: KumoButtonVariantsProps = {}) {
  const isCompactShape = shape === "square" || shape === "circle";

  return cn(
    // Base styles
    "group flex w-max shrink-0 items-center font-medium select-none [&_svg]:shrink-0 [&_svg]:-mx-0.5",
    "border-0 shadow-xs",
    "cursor-pointer",
    // Disabled state
    "disabled:cursor-not-allowed",
    // Apply variant, size, shape styles from KUMO_BUTTON_VARIANTS
    KUMO_BUTTON_VARIANTS.variant[variant].classes,
    KUMO_BUTTON_VARIANTS.size[size].classes,
    KUMO_BUTTON_VARIANTS.shape[shape].classes,
    isCompactShape && KUMO_BUTTON_VARIANTS.compactSize[size].classes,
  );
}

// Normalize icon prop to support both React elements and component types
const renderIconNode = (IconComponent?: Icon | React.ReactNode) => {
  if (!IconComponent) return null;
  if (React.isValidElement(IconComponent)) return IconComponent;
  const Comp = IconComponent as React.ComponentType<Record<string, unknown>>;
  return <Comp />;
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  KumoButtonVariantsProps & {
    children?: React.ReactNode;
    className?: string;
    icon?: Icon | React.ReactNode;
    loading?: boolean;
  };

export type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  KumoButtonVariantsProps & {
    children?: React.ReactNode;
    className?: string;
    icon?: Icon | React.ReactNode;
    external?: boolean;
    linksExternal?: boolean;
  };

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
      ...props
    },
    ref,
  ) => {
    const { type, ...restProps } = props;
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, shape }),
          "outline-none focus:opacity-100 focus-visible:ring-2 focus-visible:ring-kumo-brand *:in-focus:opacity-100", // Focus styles
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        disabled={loading || disabled}
        type={type ?? "button"}
        {...restProps}
      >
        {loading && <Loader size={size === "lg" ? 16 : 14} />}
        {!loading && renderIconNode(IconComponent)}

        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export const RefreshButton = ({
  "aria-label": ariaLabel = "Refresh",
  loading,
  ...props
}: ButtonProps) => (
  <Button shape="square" aria-label={ariaLabel} {...props}>
    <ArrowsClockwiseIcon
      className={cn({
        "animate-refresh": loading,
        "size-4.5": props.size === "base" || !props.size,
        "size-4": props.size === "sm",
        "size-5": props.size === "lg",
      })}
    />
  </Button>
);

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
