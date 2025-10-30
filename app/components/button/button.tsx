import React from "react";
import { ArrowsClockwiseIcon, type Icon } from "@phosphor-icons/react";
import { Loader } from "../loader/loader";
import { cn } from "../utils";
import { Link } from "react-router";

interface KumoButtonVariantsProps {
  shape?: "base" | "square" | "circle";
  size?: "base" | "xs" | "sm" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
}

const sizeStyles = {
  xs: "h-5 gap-1 rounded-sm px-1.5 text-xs",
  sm: "h-6.5 gap-1 rounded-md px-2 text-xs",
  base: "h-9 gap-1.5 rounded-lg px-3 text-base",
  lg: "h-10 gap-2 rounded-lg px-4 text-base",
};

export function buttonVariants({
  variant = "secondary",
  size = "base",
  shape = "base",
}: KumoButtonVariantsProps = {}) {
  // Variant-specific styles
  const variantStyles = {
    primary:
      "bg-primary !text-primary hover:bg-primary/70 disabled:bg-primary/50 disabled:!text-primary/70",
    secondary:
      'bg-secondary !text-secondary ring ring-neutral-950/10 dark:ring-neutral-800 not-disabled:hover:border-border-hover! not-disabled:hover:bg-secondary-hover disabled:bg-secondary/50 disabled:!text-secondary/70 data-[state="open"]:bg-secondary-hover',
    ghost: "bg-inherit text-surface hover:bg-accent shadow-none",
    destructive: "bg-destructive text-destructive hover:bg-destructive/70",
    outline:
      "bg-surface text-surface ring ring-neutral-950/10 dark:ring-neutral-800",
  };

  const isCompactShape = shape === "square" || shape === "circle";

  // Compact shape size mappings
  const compactSizeStyles = {
    xs: "size-3.5",
    sm: "size-6.5",
    base: "size-9",
    lg: "size-10",
  };

  return cn(
    // Base styles
    "group flex w-max shrink-0 items-center font-medium select-none",
    "border-0 shadow-xs",
    "cursor-pointer",
    // Disabled state
    "disabled:text-muted disabled:cursor-not-allowed",
    // Apply variant, size styles
    variantStyles[variant],
    sizeStyles[size],
    // Apply shape-specific styles
    isCompactShape && compactSizeStyles[size],
    isCompactShape && "p-0 items-center justify-center",
    shape === "circle" && "rounded-full"
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
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, shape }),
          "focus-visible:ring-active outline-none focus:opacity-100 focus-visible:ring-1 *:in-focus:opacity-100", // Focus styles
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader size={size === "lg" ? 16 : 14} />}
        {!loading && renderIconNode(IconComponent)}

        {children}
      </button>
    );
  }
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
      linksExternal = false,
      ...props
    },
    ref
  ) => {
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    if (!external) {
      return (
        <Link
          className={cn(
            buttonVariants({ variant, size, shape }),
            "flex items-center !no-underline",
            className
          )}
          to={String(href)}
          {...props}
        >
          {renderIconNode(IconComponent)}
          {children}
        </Link>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          buttonVariants({ variant, size, shape }),
          "flex items-center !no-underline",
          className
        )}
        {...externalProps}
        {...props}
      >
        {renderIconNode(IconComponent)}
        {children}
      </a>
    );
  }
);

LinkButton.displayName = "LinkButton";
