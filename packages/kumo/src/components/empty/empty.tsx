import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../../components/button";
import { cn } from "../../utils/cn";

export const KUMO_EMPTY_VARIANTS = {
  size: {
    sm: {
      classes: "px-6 py-8 gap-4",
      description: "Compact empty state for smaller containers",
    },
    base: {
      classes: "px-10 py-16 gap-6",
      description: "Default empty state size",
    },
    lg: {
      classes: "px-12 py-20 gap-8",
      description: "Large empty state for prominent placement",
    },
  },
} as const;

export const KUMO_EMPTY_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoEmptySize = keyof typeof KUMO_EMPTY_VARIANTS.size;

export interface KumoEmptyVariantsProps {
  size?: KumoEmptySize;
}

export function emptyVariants({
  size = KUMO_EMPTY_DEFAULT_VARIANTS.size,
}: KumoEmptyVariantsProps = {}) {
  return cn(
    "flex w-full flex-col items-center rounded-xl border border-kumo-fill bg-kumo-control text-kumo-default",
    KUMO_EMPTY_VARIANTS.size[size].classes,
  );
}

export interface EmptyProps extends KumoEmptyVariantsProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  commandLine?: string;
  contents?: React.ReactNode;
  className?: string;
}

export function Empty({
  icon,
  title,
  description,
  commandLine,
  contents,
  size = "base",
  className,
}: EmptyProps) {
  const [emptyStateCopied, setEmptyStateCopied] = useState<boolean>(false);

  return (
    <div className={cn(emptyVariants({ size }), className)}>
      {icon}
      <h2 className="text-2xl font-semibold">{title}</h2>

      {description && (
        <p className="max-w-140 text-center text-kumo-strong">{description}</p>
      )}

      {commandLine && (
        <div
          className={cn(
            "group/cmd relative inline-flex h-10 max-w-8/10 transform-gpu items-center gap-2 rounded-lg font-mono shadow-sm",
            "bg-kumo-overlay pr-2 pl-3",
            "transition-all duration-300 hover:border-kumo-interact/80 hover:shadow-md",
            "border border-kumo-fill/60",
          )}
        >
          <span className="text-xs text-kumo-inactive select-none">$</span>
          <span className="no-scrollbar overflow-scroll text-[14px] whitespace-nowrap text-kumo-brand">
            {commandLine}
          </span>
          <Button
            className="group"
            size="sm"
            variant="ghost"
            shape="square"
            aria-label="Copy command"
            onClick={async () => {
              setEmptyStateCopied(true);
              setTimeout(() => {
                setEmptyStateCopied(false);
              }, 1000);
              await navigator.clipboard.writeText(commandLine);
            }}
          >
            {emptyStateCopied ? (
              <CheckIcon size={16} className="animate-bounce-in text-kumo-success" />
            ) : (
              <CopyIcon
                size={16}
                className="text-kumo-inactive group-hover:text-kumo-brand"
              />
            )}
          </Button>
        </div>
      )}

      {contents}
    </div>
  );
}
