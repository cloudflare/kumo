import { type CSSProperties } from "react";
import { cn } from "../utils";

type BundledLanguage = "ts" | "tsx" | "jsonc" | "bash";

/**
 * Simple code component without syntax highlighting
 */
export function Code({
  lang,
  code,
  values,
  className,
  style,
}: {
  lang: BundledLanguage;
  code: string;
  values?: Record<
    string,
    {
      value: string;
      highlight?: boolean;
    }
  >;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <pre
      className={cn(
        "text-sm m-0 bg-transparent font-mono leading-[20px] p-0 rounded-none border-none w-auto text-neutral-700 dark:text-neutral-300",
        className
      )}
      style={style}
    >
      {code}
    </pre>
  );
}

export function CodeBlock({
  lang,
  code,
}: {
  lang: BundledLanguage;
  code: string;
}) {
  return (
    <div className="bg-surface rounded-md border border-neutral-200 dark:border-neutral-800 min-w-0 [&>pre]:!p-2.5">
      <Code lang={lang} code={code} />
    </div>
  );
}
