import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ResourceListPageProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  usage?: ReactNode;
  additionalContent?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * ResourceListPage - A layout component for resource list pages
 *
 * Layouts are page-level components that provide consistent structure
 * for common page patterns like resource lists, dashboards, and settings.
 */
export function ResourceListPage({
  title,
  description,
  icon,
  usage,
  additionalContent,
  children,
  className,
}: ResourceListPageProps) {
  return (
    <div
      className={cn(
        "h-full min-h-screen w-full bg-kumo-overlay",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col p-6 md:gap-4 md:p-8 lg:px-10 lg:py-9 xl:gap-6">
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-1.5">
            {icon}
            <h1 className="font-heading m-0 p-0 text-3xl font-semibold">
              {title}
            </h1>
          </div>
          <p className="hidden p-0 text-lg leading-normal text-pretty text-kumo-strong md:block">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-6 xl:flex-row xl:gap-8">
          <div className="min-w-0 grow">{children}</div>

          {(usage || additionalContent) && (
            <div
              className={`top-22 flex h-fit w-full shrink-0 flex-col gap-4 xl:sticky xl:w-[380px]`}
            >
              {usage}

              <div className={cn("hidden xl:block", usage ? "mt-6" : "")}>
                {additionalContent}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 xl:hidden">{additionalContent}</div>
      </div>
    </div>
  );
}
