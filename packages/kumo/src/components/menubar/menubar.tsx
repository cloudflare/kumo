import { Tooltip } from "../tooltip";
import { cn } from "../../utils/cn";
import { IconContext } from "@phosphor-icons/react";
import React, { useRef } from "react";
import { useMenuNavigation } from "./use-menu-navigation";

/** MenuBar variant definitions (currently empty, reserved for future additions). */
export const KUMO_MENUBAR_VARIANTS = {
  // MenuBar currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_MENUBAR_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_MENUBAR_VARIANTS
export interface KumoMenuBarVariantsProps {}

export function menuBarVariants(_props: KumoMenuBarVariantsProps = {}) {
  return cn(
    // Base styles
    "flex rounded-lg border border-kumo-recessed bg-kumo-recessed pl-px shadow-xs transition-colors",
  );
}

/** Props for an individual menu option within a MenuBar. */
type MenuOptionProps = {
  /** Icon element (typically from `@phosphor-icons/react`) rendered at 18px */
  icon: React.ReactNode;
  /** Unique identifier for the option (used when `optionIds` is true) */
  id?: number | string;
  /** Currently active value from the parent MenuBar */
  isActive?: number | boolean | string | undefined;
  /** Callback when this option is clicked */
  onClick: () => void;
  /** Tooltip text shown on hover */
  tooltip: string;
};

const MenuOption = ({
  icon,
  id,
  isActive,
  onClick,
  tooltip,
}: MenuOptionProps) => {
  const button = (
    <button
      aria-label={tooltip}
      className={cn(
        "relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none bg-kumo-recessed first:rounded-l-lg last:rounded-r-lg transition-colors focus:z-3 focus:outline-none focus:ring-kumo-focus/50 focus-visible:z-3 focus-visible:ring-2 focus-visible:ring-kumo-brand",
        {
          "z-2 bg-kumo-base shadow-xs transition-colors": isActive === id,
        },
      )}
      onClick={onClick}
    >
      <IconContext.Provider value={{ size: 18 }} {...({} as any)}>
        {icon}
      </IconContext.Provider>
    </button>
  );

  return <Tooltip content={tooltip} render={button} />;
};

/**
 * MenuBar component props.
 *
 * Horizontal icon-button toolbar with keyboard navigation and tooltip labels.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   isActive={activeIndex}
 *   options={[
 *     { icon: <ListIcon />, tooltip: "List view", onClick: () => setView("list") },
 *     { icon: <GridFourIcon />, tooltip: "Grid view", onClick: () => setView("grid") },
 *   ]}
 * />
 * ```
 */
type MenuBarProps = {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** The currently active option value — matched against option index or `id`. */
  isActive: number | boolean | string | undefined;
  /** Array of menu option configurations. */
  options: MenuOptionProps[];
  /** When true, each option's `id` field is used for matching instead of its array index. */
  optionIds?: boolean;
};

/**
 * MenuBar — horizontal icon-button toolbar with keyboard arrow-key navigation.
 *
 * Each option renders as a `<button>` with a Tooltip. The active option is
 * visually highlighted with an elevated background.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   isActive={0}
 *   options={[
 *     { icon: <ListIcon />, tooltip: "List", onClick: () => {} },
 *     { icon: <GridFourIcon />, tooltip: "Grid", onClick: () => {} },
 *   ]}
 * />
 * ```
 */
export const MenuBar = ({
  className,
  isActive,
  options,
  optionIds = false, // if option needs an extra unique ID
}: MenuBarProps) => {
  const menuRef = useRef<HTMLElement | null>(null);

  useMenuNavigation({ menuRef, direction: "horizontal" });

  return (
    <nav
      className={cn(
        "isolate flex rounded-lg ring ring-kumo-line bg-kumo-recessed pl-px shadow-xs transition-colors",
        className,
      )}
      ref={menuRef}
    >
      {options.map((option, index) => (
        <MenuOption
          key={index}
          {...option}
          isActive={isActive}
          id={optionIds ? option.id : index}
        />
      ))}
    </nav>
  );
};
