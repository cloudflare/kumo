import { Menu as DropdownMenuPrimitive } from "@base-ui-components/react/menu";
import * as React from "react";
import { cn } from "../utils";
import { Checkbox } from "./../checkbox/checkbox";
import {
  CaretRightIcon as CaretRight,
  CheckIcon as Check,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "react-router";

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
      "focus:bg-accent", // focus state
      "data-[state=open]:bg-accent", // open state
      inset && "pl-8", // conditional inset
      className
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
          "z-50 bg-surface dark:bg-neutral-900 text-surface overflow-hidden", // background
          "ring ring-neutral-950/10 dark:ring-neutral-800 shadow-lg rounded-lg", // border part
          "min-w-[9rem] p-1.5", // spacing
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", // open animation
          "data-[side=bottom]:slide-in-from-top-2", // bottom side animation
          "data-[side=left]:slide-in-from-right-2", // left side animation
          "data-[side=right]:slide-in-from-left-2", // right side animation
          "data-[side=top]:slide-in-from-bottom-2", // top side animation
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", // close animation
          className
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
    ref
  ) => {
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
          "text-error data-[highlighted]:text-error data-[highlighted]:bg-red-100 data-[highlighted]:dark:bg-red-950"
      );
      if (isExternal) {
        return (
          <a
            className={cn(styles, "w-full !no-underline !text-inherit")}
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
        <Link
          className={cn(styles, "w-full !no-underline !text-inherit")}
          to={href}
          /**
           * For some reason we need this here to prevent the outer link
           * from being clicked (thereby going to the worker details
           * instead of visiting the link)
           */
          onClick={(e) => e.stopPropagation()}
        >
          {innerContent}
        </Link>
      );
    }, [href, IconComponent, children, selected, variant]);

    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
          "data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-800 focus:text-secondary relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50",
          inset && "pl-8",
          className
        )}
        render={Boolean(href) ? content : render}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }
);

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "focus:bg-accent focus:text-secondary relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-base outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50",
      className
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
      className
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
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
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

export const DropdownMenu = Object.assign(DropdownMenuPrimitive.Root, {
  Trigger: DropdownMenuPrimitive.Trigger,
  Portal: DropdownMenuPrimitive.Portal,
  Sub: DropdownMenuPrimitive.SubmenuRoot,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuContent,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Group: DropdownMenuPrimitive.Group,
});
