import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { Button, cn, Tooltip } from "@cloudflare/kumo";

const slideAnimations = {
  initial:
    "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 translate-y-full",
  animate: "translate-y-0 opacity-100",
  end: "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 -translate-y-full",
} as const;

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }

    setCopied(true);

    // Clear previous timeout to handle rapid clicks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, 1500);
  }, [code]);

  return (
    <div className="absolute top-4 right-4">
      <Tooltip content={copied ? "Copied" : "Copy"} asChild>
        <Button
          aria-label={copied ? "Copied" : "Copy code to clipboard"}
          className="relative overflow-hidden bg-kumo-base text-kumo-subtle"
          onClick={handleCopy}
          shape="square"
          size="sm"
          variant="ghost"
        >
          <span
            className={cn(
              "flex items-center justify-center transition-all duration-200",
              copied ? slideAnimations.animate : slideAnimations.initial,
            )}
          >
            <CheckIcon size={16} />
          </span>
          <span
            className={cn(
              "flex items-center justify-center transition-all duration-200",
              copied ? slideAnimations.end : slideAnimations.animate,
            )}
          >
            <CopyIcon size={16} />
          </span>
        </Button>
      </Tooltip>
    </div>
  );
}
