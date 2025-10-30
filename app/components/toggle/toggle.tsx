import { cn } from "../utils";

type ToggleProps = {
  onClick: () => void;
  size?: "sm" | "base" | "lg";
  toggled: boolean;
  transitioning?: boolean;
};

export const Toggle = ({
  onClick,
  size = "base",
  toggled,
  transitioning,
}: ToggleProps) => {
  return (
    <button
      className={cn(
        "ob-focus interactive dark:bg-neutral-750 bg-neutral-250 rounded-full border border-transparent p-1 transition-colors",
        {
          "h-5.5 w-8.5": size === "sm",
          "h-6.5 w-10.5": size === "base",
          "h-7.5 w-12.5": size === "lg",
          "bg-blue-600 dark:bg-blue-600": toggled,
          "hover:bg-blue-700 dark:hover:bg-blue-700": toggled && !transitioning,
          "hover:bg-neutral-300 dark:hover:bg-neutral-700":
            !toggled && !transitioning,
        },
        transitioning ? "cursor-wait" : "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "aspect-square h-full rounded-full bg-white transition-all",
          {
            "translate-x-full": toggled,
          }
        )}
      />
    </button>
  );
};
