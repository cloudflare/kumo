import { Tooltip } from "../tooltip";
import { cn } from "../../utils/cn";
import { IconContext } from "@phosphor-icons/react";
import React, { useRef } from "react";
import { useMenuNavigation } from "./use-menu-navigation";

export const KUMO_MENUBAR_VARIANTS = {
  // MenuBar currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_MENUBAR_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_MENUBAR_VARIANTS
export interface KumoMenuBarVariantsProps {}

export function menuBarVariants(_props: KumoMenuBarVariantsProps = {}) {
  return cn(
    // Base styles
    "flex rounded-lg border border-kumo-fill bg-kumo-fill pl-px shadow-xs transition-colors",
  );
}

type MenuOptionProps = {
  icon: React.ReactNode;
  id?: number | string;
  isActive?: number | boolean | string | undefined;
  onClick: () => void;
  tooltip: string;
};

const MenuOption = ({
  icon,
  id,
  isActive,
  onClick,
  tooltip,
}: MenuOptionProps) => {
  return (
    <Tooltip content={tooltip} asChild>
      <button
        className={cn(
          "focus:inset-ring-focus relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center rounded-md border-none bg-kumo-fill transition-colors focus:z-10 focus:outline-none focus-visible:z-10 focus-visible:inset-ring-[0.5]",
          {
            "z-20 bg-kumo-base shadow-xs transition-colors": isActive === id,
          },
        )}
        onClick={onClick}
      >
        <IconContext.Provider value={{ size: 18 }} {...({} as any)}>
          {icon}
        </IconContext.Provider>
      </button>
    </Tooltip>
  );
};

type MenuBarProps = {
  className?: string;
  isActive: number | boolean | string | undefined;
  options: MenuOptionProps[];
  optionIds?: boolean;
};

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
        "flex rounded-lg border border-kumo-fill bg-kumo-fill pl-px shadow-xs transition-colors",
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
