import { Tooltip, TooltipProvider, Button } from '@cloudflare/kumo';
import { Info, PlusIcon, TranslateIcon } from '@phosphor-icons/react';

export function TooltipHeroDemo() {
  return (
    <TooltipProvider>
      <Tooltip
        content="Add new item"
        render={
          <Button shape="square" icon={PlusIcon} aria-label="Add new item" />
        }
      />
    </TooltipProvider>
  );
}

export function TooltipBasicDemo() {
  return (
    <TooltipProvider>
      <Tooltip
        content="Add"
        render={<Button shape="square" icon={PlusIcon} aria-label="Add" />}
      />
    </TooltipProvider>
  );
}

export function TooltipMultipleDemo() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip
          content="Add"
          render={<Button shape="square" icon={PlusIcon} aria-label="Add" />}
        />
        <Tooltip
          content="Change language"
          render={
            <Button
              shape="square"
              icon={TranslateIcon}
              aria-label="Change language"
            />
          }
        />
      </div>
    </TooltipProvider>
  );
}

/**
 * Without `render`, Tooltip wraps children in an internal button element.
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
/**
 * Demonstrates that long tooltip content respects available viewport space.
 * Tooltips near the edge of the viewport constrain their width to
 * `--available-width` so they don't overflow.
 */
export function TooltipOverflowDemo() {
  const longContent =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.';
  return (
    <TooltipProvider>
      <div className="flex w-full justify-between">
        <Tooltip
          content={longContent}
          side="bottom"
          render={<Button variant="secondary" />}
        >
          Near left edge
        </Tooltip>
        <Tooltip
          content={longContent}
          side="bottom"
          render={<Button variant="secondary" />}
        >
          Centered
        </Tooltip>
        <Tooltip
          content={longContent}
          side="bottom"
          render={<Button variant="secondary" />}
        >
          Near right edge
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function TooltipDelayDemo() {
  return (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip
          content="Opens after 1 second"
          delay={1000}
          render={<Button variant="secondary" />}
        >
          1s open delay
        </Tooltip>
        <Tooltip
          content="Stays open 500ms after leaving"
          closeDelay={500}
          render={<Button variant="secondary" />}
        >
          500ms close delay
        </Tooltip>
        <Tooltip
          content="Instant open, stays 1s"
          delay={0}
          closeDelay={1000}
          render={<Button variant="secondary" />}
        >
          Instant + 1s close
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
