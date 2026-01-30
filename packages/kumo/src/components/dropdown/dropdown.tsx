import { Menu as DropdownMenuPrimitive } from "@base-ui/react/menu";
import * as React from "react";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";
import { Checkbox } from "../checkbox";
import {
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
  type Icon,
} from "@phosphor-icons/react";

export const KUMO_DROPDOWN_VARIANTS = {
  variant: {
    default: {
      classes: "",
      description: "Default dropdown item appearance",
    },
    danger: {
      classes:
        "text-kumo-danger data-highlighted:bg-kumo-danger/5 data-highlighted:text-kumo-danger",
      description: "Destructive action item",
    },
  },
} as const;

export const KUMO_DROPDOWN_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

// Derived types from KUMO_DROPDOWN_VARIANTS
export type KumoDropdownVariant = keyof typeof KUMO_DROPDOWN_VARIANTS.variant;

export interface KumoDropdownVariantsProps {
  variant?: KumoDropdownVariant;
}

export function dropdownVariants({
  variant = KUMO_DROPDOWN_DEFAULT_VARIANTS.variant,
}: KumoDropdownVariantsProps = {}) {
  return cn(KUMO_DROPDOWN_VARIANTS.variant[variant].classes);
}

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubmenuTrigger>,
  React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.SubmenuTrigger
  > & {
    inset?: boolean;
    icon?: Icon;
  }
>(({ className, inset, children, icon: IconComponent, ...props }, ref) => (
  <DropdownMenuPrimitive.SubmenuTrigger
    ref={ref}
    className={cn(
      "flex cursor-default items-center rounded-sm text-base outline-hidden select-none", // base styles
      "px-2 py-1.5", // spacing
      "focus:bg-kumo-tint", // focus state
      "data-[state=open]:bg-kumo-tint", // open state
      inset && "pl-8", // conditional inset
      className,
    )}
    {...props}
  >
    {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
    {children}
    <CaretRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubmenuTrigger>
));

DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubmenuTrigger.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Positioner>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Positioner>
>(({ className, sideOffset = 8, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Positioner
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    >
      <DropdownMenuPrimitive.Popup
        className={cn(
          "z-50 overflow-hidden bg-kumo-control text-kumo-default", // background
          "rounded-lg shadow-lg ring ring-kumo-line", // border part
          "min-w-36 p-1.5", // spacing
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", // open animation
          "data-[side=bottom]:slide-in-from-top-2", // bottom side animation
          "data-[side=left]:slide-in-from-right-2", // left side animation
          "data-[side=right]:slide-in-from-left-2", // right side animation
          "data-[side=top]:slide-in-from-bottom-2", // top side animation
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", // close animation
          className,
        )}
      >
        {children}
      </DropdownMenuPrimitive.Popup>
    </DropdownMenuPrimitive.Positioner>
  </DropdownMenuPrimitive.Portal>
));

const renderIconNode = (IconComponent?: Icon | React.ReactNode) => {
  if (!IconComponent) return null;
  if (React.isValidElement(IconComponent)) return IconComponent;
  const Comp = IconComponent as React.ComponentType<Record<string, unknown>>;
  return <Comp className="mr-2 h-4 w-4" />;
};

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    icon?: Icon | React.ReactNode;
    selected?: boolean;
    href?: string;
    variant?: "default" | "danger";
  }
>(
  (
    {
      className,
      inset,
      icon: IconComponent,
      children,
      selected,
      render,
      href,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const LinkComponent = useLinkComponent();
    const content = React.useMemo(() => {
      const innerContent = (
        <>
          {IconComponent && renderIconNode(IconComponent)}
          {children}
          {selected && (
            <span className="inline-flex">
              <Check />
            </span>
          )}
        </>
      );

      if (!href) return innerContent;

      const isExternal = href.startsWith("https://");
      const styles = cn(
        "flex items-center",
        variant === "danger" &&
          "text-kumo-danger data-highlighted:bg-kumo-danger/5 data-highlighted:text-kumo-danger",
      );
      if (isExternal) {
        return (
          <a
            className={cn(styles, "w-full text-inherit! no-underline!")}
            href={href}
            target="_blank"
            rel="noreferrer"
            /**
             * For some reason we need this here to prevent the outer link
             * from being clicked (thereby going to the worker details
             * instead of visiting the link)
             */
            onClick={(e) => e.stopPropagation()}
          >
            {innerContent}
          </a>
        );
      }
      return (
        <LinkComponent
          className={cn(styles, "w-full text-inherit! no-underline!")}
          href={href}
          to={href}
          /**
           * For some reason we need this here to prevent the outer link
           * from being clicked (thereby going to the worker details
           * instead of visiting the link)
           */
          onClick={(e) => e.stopPropagation()}
        >
          {innerContent}
        </LinkComponent>
      );
    }, [href, IconComponent, children, selected, variant, LinkComponent]);

    // When href is provided, content already contains children via innerContent
    // When render prop is provided, caller controls children rendering
    // Only pass children directly when neither href nor render is used
    const useRenderProp = href || render;

    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
          "relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none focus:text-kumo-default data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-overlay",
          inset && "pl-8",
          dropdownVariants({ variant }),
          className,
        )}
        render={href ? content : render}
        {...props}
      >
        {useRenderProp ? undefined : children}
      </DropdownMenuPrimitive.Item>
    );
  },
);

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-base outline-hidden transition-colors select-none focus:bg-kumo-tint focus:text-kumo-default data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-inherit">
      <Checkbox checked={checked} />
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.GroupLabel> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.GroupLabel
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-base font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.GroupLabel.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-kumo-line", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
    inset?: boolean;
    icon?: Icon | React.ReactNode;
  }
>(({ className, children, inset, icon: IconComponent, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none",
      "data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-kumo-tint",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {IconComponent && renderIconNode(IconComponent)}
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuRadioItemIndicator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItemIndicator>,
  React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.RadioItemIndicator
  >
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItemIndicator
    ref={ref}
    className={cn("ml-auto", className)}
    {...props}
  >
    {children ?? <Check className="h-4 w-4" />}
  </DropdownMenuPrimitive.RadioItemIndicator>
));
DropdownMenuRadioItemIndicator.displayName = "DropdownMenuRadioItemIndicator";

/**
 * Custom Trigger that converts a single child element to the `render` prop
 * to avoid nested button issues with base-ui's Menu.Trigger.
 */
const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ children, render, ...props }, ref) => {
  // If render prop is provided, use it directly
  // Otherwise, convert single child element to render prop
  const childElement = React.isValidElement(children) ? children : null;
  const effectiveRender = render ?? childElement;

  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      {...props}
      {...(effectiveRender && {
        render: effectiveRender as React.ReactElement<Record<string, unknown>>,
      })}
    >
      {/* Only pass children if not using as render prop */}
      {childElement ? undefined : children}
    </DropdownMenuPrimitive.Trigger>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenu = Object.assign(DropdownMenuPrimitive.Root, {
  Trigger: DropdownMenuTrigger,
  Portal: DropdownMenuPrimitive.Portal,
  Sub: DropdownMenuPrimitive.SubmenuRoot,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuContent,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuPrimitive.RadioGroup,
  RadioItem: DropdownMenuRadioItem,
  RadioItemIndicator: DropdownMenuRadioItemIndicator,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Group: DropdownMenuPrimitive.Group,
});
