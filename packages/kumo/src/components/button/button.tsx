import React from "react";
import { ArrowsClockwise, type Icon } from "@phosphor-icons/react";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
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
        "bg-kumo-brand !text-white hover:bg-kumo-brand-hover focus:bg-kumo-brand-hover disabled:bg-kumo-brand/50",
      description: "High-emphasis button for primary actions",
    },
    secondary: {
      classes:
        "bg-kumo-control !text-kumo-default ring not-disabled:hover:border-secondary! not-disabled:hover:bg-kumo-control disabled:bg-kumo-control/50 disabled:!text-kumo-default/70 ring-kumo-line data-[state=open]:bg-kumo-control",
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
        "bg-kumo-control !text-kumo-danger ring not-disabled:hover:border-secondary! not-disabled:hover:bg-kumo-control disabled:bg-kumo-control/50 disabled:!text-kumo-danger/70 ring-kumo-line data-[state=open]:bg-kumo-control",
      description:
        "Secondary button with destructive text for less prominent dangerous actions",
    },
    outline: {
      classes: "bg-kumo-base text-kumo-default ring ring-kumo-line",
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
    "group flex w-max shrink-0 items-center font-medium select-none",
    "border-0 shadow-xs",
    "cursor-pointer",
    // Disabled state
    "disabled:cursor-not-allowed disabled:text-kumo-subtle",
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

/**
 * State object passed to the render callback function.
 * Allows consumers to conditionally render based on button state.
 */
export interface ButtonState extends Record<string, unknown> {
  disabled: boolean;
  loading: boolean;
}

export type ButtonProps = useRender.ComponentProps<"button", ButtonState> &
  KumoButtonVariantsProps & {
    children?: React.ReactNode;
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

/**
 * Button component with support for composition via the `render` prop.
 *
 * The `render` prop allows you to replace the underlying `<button>` element
 * with a different element or component (like an anchor or React Router Link),
 * while preserving all Button styling and behavior.
 *
 * @example Basic usage
 * ```tsx
 * <Button variant="primary">Click me</Button>
 * ```
 *
 * @example As a link (anchor)
 * ```tsx
 * <Button render={<a href="/about" />}>About</Button>
 * ```
 *
 * @example With React Router
 * ```tsx
 * import { Link } from 'react-router-dom';
 * <Button render={<Link to="/dashboard" />}>Dashboard</Button>
 * ```
 *
 * @example With Next.js Link
 * ```tsx
 * import Link from 'next/link';
 * <Button render={<Link href="/page" />}>Page</Button>
 * ```
 *
 * @example Render callback for state-based rendering
 * ```tsx
 * <Button
 *   render={(props, state) => (
 *     <a {...props} href="/link">
 *       {state.loading ? 'Loading...' : 'Click me'}
 *     </a>
 *   )}
 * />
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      shape = "base",
      size = "base",
      variant = "secondary",
      icon: IconComponent,
      render,
      ...props
    },
    ref,
  ) => {
    const { type, ...restProps } = props;

    const isDisabled = loading || disabled || false;

    const state: ButtonState = React.useMemo(
      () => ({
        disabled: isDisabled,
        loading,
      }),
      [isDisabled, loading],
    );

    const defaultProps: useRender.ElementProps<"button"> = {
      className: cn(
        buttonVariants({ variant, size, shape }),
        "outline-none focus:opacity-100 focus-visible:ring-1 focus-visible:ring-kumo-ring *:in-focus:opacity-100", // Focus styles
        isDisabled && "cursor-not-allowed opacity-50",
      ),
      disabled: isDisabled,
      type: type ?? "button",
      children: (
        <>
          {loading && <Loader size={size === "lg" ? 16 : 14} />}
          {!loading && renderIconNode(IconComponent)}
          {children}
        </>
      ),
    };

    return useRender<ButtonState, HTMLButtonElement>({
      render: render ?? <button />,
      ref,
      state,
      props: mergeProps<"button">(defaultProps, restProps, { className }),
    });
  },
);

Button.displayName = "Button";

export const RefreshButton = ({
  "aria-label": ariaLabel = "Refresh",
  loading,
  ...props
}: ButtonProps) => (
  <Button shape="square" aria-label={ariaLabel} {...props}>
    <ArrowsClockwise
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
