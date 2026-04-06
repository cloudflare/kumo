import { Tooltip, TooltipProvider, Button } from "@cloudflare/kumo";
import { Info, PlusIcon, TranslateIcon } from "@phosphor-icons/react";

export function TooltipHeroDemo() {
  return (
    <TooltipProvider>
      <Tooltip content="Add new item" asChild>
        <Button shape="square" icon={PlusIcon} aria-label="Add new item" />
      </Tooltip>
    </TooltipProvider>
  );
}

export function TooltipBasicDemo() {
  return (
    <TooltipProvider>
      <Tooltip content="Add" asChild>
        <Button shape="square" icon={PlusIcon} aria-label="Add" />
      </Tooltip>
    </TooltipProvider>
  );
}

export function TooltipMultipleDemo() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip content="Add" asChild>
          <Button shape="square" icon={PlusIcon} aria-label="Add" />
        </Tooltip>
        <Tooltip content="Change language" asChild>
          <Button
            shape="square"
            icon={TranslateIcon}
            aria-label="Change language"
          />
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * Without `asChild`, Tooltip wraps children in an internal button element.
 * Defensive styles are applied by default, but you can fully customize
 * the trigger by passing className - your styles override the defaults.
 */
export function TooltipCustomTriggerDemo() {
  return (
    <TooltipProvider>
      <Tooltip
        content="Click to learn more"
        className="inline-flex items-center gap-1.5 rounded-full bg-kumo-brand px-3 py-1.5 text-sm font-medium text-white shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        <Info className="size-4" />
        <span>Help</span>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Control the delay before opening and closing the tooltip.
 * `delay` controls open delay (default: 600ms), `closeDelay` controls close delay (default: 0ms).
 */
export function TooltipDelayDemo() {
  return (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip content="Opens after 1 second" delay={1000} asChild>
          <Button variant="secondary">1s open delay</Button>
        </Tooltip>
        <Tooltip
          content="Stays open 500ms after leaving"
          closeDelay={500}
          asChild
        >
          <Button variant="secondary">500ms close delay</Button>
        </Tooltip>
        <Tooltip
          content="Instant open, stays 1s"
          delay={0}
          closeDelay={1000}
          asChild
        >
          <Button variant="secondary">Instant + 1s close</Button>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
