import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "~/components/button/button";

export function Empty({
    icon,
    title,
    description,
    commandLine,
    contents
  }: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    commandLine?: string;
    contents?: React.ReactNode;
  }) {
    const [emptyStateCopied, setEmptyStateCopied] = useState<boolean>(false);

    return (
        <div className="w-full px-10 py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col gap-6 items-center">
        {icon}
        <h2 className="text-2xl font-semibold">{title}</h2>

        {description && (
            <p className="text-center max-w-140 text-neutral-600 dark:text-neutral-400">
            {description}
            </p>
        )}

        {commandLine && (
            <div className="group/cmd relative bg-neutral-50 dark:bg-black rounded-lg h-10 inline-flex items-center gap-2 font-mono pl-3 pr-2 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 transform-gpu transition-all duration-300 hover:shadow-md hover:border-neutral-300/80 dark:hover:border-neutral-700/80 max-w-8/10">
            <span className="text-xs text-neutral-400 dark:text-neutral-600 select-none">
                $
            </span>
            <span className="text-[#f6821f] text-[14px] overflow-scroll whitespace-nowrap no-scrollbar">
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
                <CheckIcon size={16} className="text-green-500 animate-bounce-in" />
                ) : (
                <CopyIcon
                    size={16}
                    className="group-hover:text-[#f6821f] text-neutral-400 dark:text-neutral-600"
                />
                )}
            </Button>
            </div>
        )}

        {contents && contents}
        </div>
    );
}