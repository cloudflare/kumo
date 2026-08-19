import React, {
  Children,
  cloneElement,
  createContext,
  isValidElement,
} from "react";
import { Toolbar as ToolbarBase } from "@base-ui/react/toolbar";
import type { InputState } from "@base-ui/react/input";
import { cn } from "../../utils/cn";
import { Button as KumoButton, type ButtonProps } from "../button/button";
import { Input as KumoInput, type InputProps } from "../input/input";
import { InputGroup } from "../input-group/input-group";

/** @deprecated Toolbar size customization is deprecated. Omit `size` to use the default base size. */
export const KUMO_TOOLBAR_VARIANTS = {
  size: {
    xs: {
      classes: "text-xs",
      description: "Extra small toolbar for compact UIs",
    },
    sm: {
      classes: "text-xs",
      description: "Small toolbar for secondary controls",
    },
    base: {
      classes: "text-base",
      description: "Default toolbar size",
    },
    lg: {
      classes: "text-base",
      description: "Large toolbar for prominent controls",
    },
  },
} as const;

/** @deprecated Toolbar size customization is deprecated. Omit `size` to use the default base size. */
export const KUMO_TOOLBAR_DEFAULT_VARIANTS = {
  size: "base",
} as const;

/** @deprecated Toolbar size customization is deprecated. Omit `size` to use the default base size. */
export type ToolbarSize = keyof typeof KUMO_TOOLBAR_VARIANTS.size;

export interface ToolbarProps extends Omit<ToolbarBase.Root.Props, "children"> {
  /** Toolbar controls rendered as one grouped card. */
  children: React.ReactNode;
  /**
   * Locks every toolbar item to this size.
   * @deprecated Omit this prop to use the default base size. Toolbar size customization will be removed in a future major release.
   */
  size?: ToolbarSize;
}

export type ToolbarButtonProps = Omit<ButtonProps, "size" | "variant"> &
  Pick<ToolbarBase.Button.Props, "focusableWhenDisabled">;

export type ToolbarInputProps = Omit<
  InputProps,
  | "size"
  | "variant"
  | "label"
  | "labelTooltip"
  | "description"
  | "hideLabel"
  | "error"
  | "passwordManagerIgnore"
  | "render"
> & {
  /** When `true`, the item remains focusable when disabled. */
  focusableWhenDisabled?: ToolbarBase.Input.Props["focusableWhenDisabled"];
};

export type ToolbarInputGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof InputGroup>,
  "size"
>;

type ToolbarInputGroupChildProps = React.ComponentPropsWithoutRef<
  typeof InputGroup.Input
>;

const ToolbarSizeContext = createContext<{ size: ToolbarSize }>({
  size: KUMO_TOOLBAR_DEFAULT_VARIANTS.size,
});

const TOOLBAR_CONTROL_STYLES = cn(
  "relative min-w-0 rounded-none border-0 bg-transparent shadow-none ring-0",
  "focus-within:z-2 focus:z-2 focus-visible:z-2 has-[:focus-visible]:z-2",
);

/** Groups toolbar controls into one compact card. */
const Root = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      children,
      className,
      size = KUMO_TOOLBAR_DEFAULT_VARIANTS.size,
      ...props
    },
    ref,
  ) => {
    return (
      <ToolbarBase.Root
        ref={ref}
        data-kumo-component="Toolbar"
        className={cn(
          "inline-flex w-fit items-stretch rounded-lg bg-kumo-control shadow-xs ring ring-kumo-line",
          "[&>*:first-child]:rounded-l-lg [&>*:not([aria-hidden='true']):not([type='hidden']):not(:has(~_:not([aria-hidden='true']):not([type='hidden'])))]:rounded-r-lg",
          "[&>*_[data-kumo-toolbar-input]:focus]:rounded-[inherit]",
          "[&>*:not([aria-hidden='true']):not(:first-child)]:border-l [&>*:not([aria-hidden='true']):not(:first-child)]:border-kumo-line",
          KUMO_TOOLBAR_VARIANTS.size[size].classes,
          className,
        )}
        {...props}
      >
        <ToolbarSizeContext.Provider value={{ size }}>
          {children}
        </ToolbarSizeContext.Provider>
      </ToolbarBase.Root>
    );
  },
);

Root.displayName = "Toolbar";

const Button = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading,
      shape,
      icon: IconComponent,
      type,
      ...props
    },
    ref,
  ) => {
    const toolbar = React.useContext(ToolbarSizeContext);
    const resolvedShape =
      shape ?? (children == null && IconComponent ? "square" : "base");
    const ariaLabel = props["aria-label"] as string | undefined;

    const buttonProps = {
      disabled,
      loading,
      icon: IconComponent,
      size: toolbar.size,
      type: type ?? "button",
      variant: "ghost",
    } satisfies ButtonProps;

    const button =
      resolvedShape === "base" ? (
        <KumoButton shape="base" {...buttonProps} />
      ) : (
        <KumoButton
          aria-label={ariaLabel as string}
          shape={resolvedShape}
          {...buttonProps}
        />
      );

    return (
      <ToolbarBase.Button
        ref={ref}
        data-kumo-component="Toolbar.Button"
        disabled={loading || disabled}
        className={cn(className, TOOLBAR_CONTROL_STYLES)}
        render={button}
        {...props}
      >
        {children}
      </ToolbarBase.Button>
    );
  },
);

Button.displayName = "Toolbar.Button";

const Input = React.forwardRef<HTMLInputElement, ToolbarInputProps>(
  ({ className, style, ...props }, ref) => {
    const toolbar = React.useContext(ToolbarSizeContext);
    const inputClassName =
      typeof className === "function"
        ? (state: InputState) => cn(className(state), TOOLBAR_CONTROL_STYLES)
        : cn(className, TOOLBAR_CONTROL_STYLES);
    return (
      <ToolbarBase.Input
        ref={ref}
        data-kumo-component="Toolbar.Input"
        render={
          <KumoInput
            className={inputClassName}
            size={toolbar.size}
            style={style}
          />
        }
        {...props}
        data-kumo-toolbar-input=""
      />
    );
  },
);

Input.displayName = "Toolbar.Input";

const InputGroupRoot = React.forwardRef<HTMLElement, ToolbarInputGroupProps>(
  ({ children, className, ...props }, ref) => {
    const toolbar = React.useContext(ToolbarSizeContext);
    const ariaLabel = props["aria-label"];
    const ariaLabelledBy = props["aria-labelledby"];

    const toolbarChildren = Children.map(children, (child) => {
      if (
        !isValidElement<ToolbarInputGroupChildProps>(child) ||
        (child.type as { displayName?: string })?.displayName !==
          "InputGroup.Input"
      ) {
        return child;
      }

      return (
        <ToolbarBase.Input
          aria-label={child.props["aria-label"] ?? ariaLabel}
          aria-labelledby={child.props["aria-labelledby"] ?? ariaLabelledBy}
          render={cloneElement(child)}
        />
      );
    });

    return (
      <InputGroup
        ref={ref}
        className={cn(TOOLBAR_CONTROL_STYLES, className)}
        size={toolbar.size}
        {...props}
      >
        {toolbarChildren}
      </InputGroup>
    );
  },
);

InputGroupRoot.displayName = "Toolbar.InputGroup";

export const Toolbar = Object.assign(Root, {
  Button,
  Input,
  InputGroup: InputGroupRoot,
});

Toolbar.displayName = "Toolbar";
