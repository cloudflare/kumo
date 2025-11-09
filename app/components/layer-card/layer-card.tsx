import type { ReactNode } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Surface } from "../surface/surface";
import { cn } from "../utils";
import { useLinkComponent } from "../link-provider";

export function LayerCard({
  className,
  title,
  children,
  href,
  badge,
}: {
  className?: string;
  title: ReactNode;
  children: ReactNode;
  href?: string;
  badge?: ReactNode;
}) {
  const LinkComponent = useLinkComponent();
  return (
    <Surface
      className={cn(
        "overflow-hidden rounded-lg bg-neutral-25 dark:bg-surface",
        className
      )}
    >
      {href ? (
        <LinkComponent href={href} to={href} className="no-underline!">
          <header className="px-4 py-2.5 font-medium text-neutral-500 flex items-center justify-between text-base hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              {title}
              {badge}
            </div>
            <ArrowRightIcon />
          </header>
        </LinkComponent>
      ) : (
        <header className="px-4 py-2.5 font-medium text-neutral-500 flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {title}
            {badge}
          </div>
        </header>
      )}
      <div className="bg-surface dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 -mx-px -mb-px dark:ring-neutral-800 rounded-lg">
        {children}
      </div>
    </Surface>
  );
}
