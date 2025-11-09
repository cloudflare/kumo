import { Tooltip } from "../tooltip/tooltip";
import { cn } from "../utils";
import { IconContext } from "@phosphor-icons/react";
import React, { useRef } from "react";
import { useMenuNavigation } from "./use-menu-navigation";

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
    <Tooltip content={tooltip}>
      <button
        className={cn(
          "focus:inset-ring-focus bg-neutral-200 dark:bg-neutral-800 border-none relative -ml-px flex h-full w-11 cursor-pointer items-center justify-center transition-colors focus:z-10 focus:outline-none focus-visible:z-10 focus-visible:inset-ring-[0.5] rounded-md",
          {
            "bg-white shadow-xs dark:bg-black z-20 transition-colors":
              isActive === id,
          }
        )}
        onClick={onClick}
      >
        <IconContext.Provider value={{ size: 18 }}>{icon}</IconContext.Provider>
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
  // bg-cl1-gray-9 dark:bg-cl1-gray-8
  return (
    <nav
      className={cn(
        "pl-px bg-neutral-200 dark:bg-neutral-800 border border-color flex rounded-lg shadow-xs transition-colors",
        className
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
