import { Tooltip, TooltipProvider, Button } from "@cloudflare/kumo";
import { PlusIcon, TranslateIcon } from "@phosphor-icons/react";

export function TooltipHeroDemo() {
  return (
    <TooltipProvider>
      <Tooltip content="Add new item" asChild>
        <Button shape="square" icon={PlusIcon} />
      </Tooltip>
    </TooltipProvider>
  );
}

export function TooltipBasicDemo() {
  return (
    <TooltipProvider>
      <Tooltip content="Add" asChild>
        <Button shape="square" icon={PlusIcon} />
      </Tooltip>
    </TooltipProvider>
  );
}

export function TooltipMultipleDemo() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip content="Add" asChild>
          <Button shape="square" icon={PlusIcon} />
        </Tooltip>
        <Tooltip content="Change language" asChild>
          <Button shape="square" icon={TranslateIcon} />
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
