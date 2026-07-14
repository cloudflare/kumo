import React, {
  Children,
  cloneElement,
  createContext,
  isValidElement,
} from "react";
import { Toolbar as ToolbarBase } from "@base-ui/react/toolbar";
import type { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "../../utils/cn";
import { Button as KumoButton, type ButtonProps } from "../button/button";
import { Input as KumoInput, type InputProps } from "../input/input";
import { InputGroup } from "../input-group/input-group";

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

export const KUMO_TOOLBAR_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type ToolbarSize = keyof typeof KUMO_TOOLBAR_VARIANTS.size;

export interface ToolbarProps extends Omit<ToolbarBase.Root.Props, "children"> {
  /** Toolbar controls rendered as one grouped card. */
  children: React.ReactNode;
  /** Locks every toolbar item to this size. */
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

function toolbarControlClassName(className?: string) {
  return cn(
    "relative min-w-0 border-0 bg-transparent shadow-none ring-0 focus:z-2 focus-within:z-2 focus-visible:z-2",
    "rounded-none first:rounded-l-lg last:rounded-r-lg only:rounded-lg",
    "not-first:border-l not-first:border-kumo-line",
    "focus:ring-kumo-focus/50 focus:ring-[1.5px] focus-visible:ring-2 focus-visible:ring-kumo-brand",
    className,
  );
}

/**
 * Groups toolbar controls into one compact card with shared sizing and internal
 * separators.
 */
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
          "inline-flex w-fit items-stretch rounded-lg ring ring-kumo-line bg-kumo-control shadow-xs",
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
    const button =
      resolvedShape === "base" ? (
        <KumoButton
          className={toolbarControlClassName(className)}
          disabled={disabled}
          icon={IconComponent}
          loading={loading}
          shape="base"
          size={toolbar.size}
          type={type ?? "button"}
          variant="ghost"
        >
          {children}
        </KumoButton>
      ) : (
        <KumoButton
          aria-label={ariaLabel as string}
          className={toolbarControlClassName(className)}
          disabled={disabled}
          icon={IconComponent}
          loading={loading}
          shape={resolvedShape}
          size={toolbar.size}
          type={type ?? "button"}
          variant="ghost"
        >
          {children}
        </KumoButton>
      );

    return (
      <ToolbarBase.Button
        ref={ref}
        data-kumo-component="Toolbar.Button"
        disabled={loading || disabled}
        render={button}
        {...props}
      />
    );
  },
);

Button.displayName = "Toolbar.Button";

const Input = React.forwardRef<HTMLInputElement, ToolbarInputProps>(
  ({ className, style, ...props }, ref) => {
    const toolbar = React.useContext(ToolbarSizeContext);
    const inputClassName =
      typeof className === "function"
        ? (state: BaseInput.State) => toolbarControlClassName(className(state))
        : toolbarControlClassName(className);

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
        className={toolbarControlClassName(className)}
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
