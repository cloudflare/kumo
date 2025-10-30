import { Link } from "react-router";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  label: ReactNode;
  to?: string; // If omitted on non-last items, will render a non-clickable span
  icon?: ReactNode;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
      <nav
        className={`flex items-center gap-2 px-4 h-[57px] w-full ${className ?? ""}`}
        aria-label="Breadcrumb"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <div key={idx} className="flex items-center min-w-0 gap-2">
              {idx > 0 && (
                <span className="flex-shrink-0 text-neutral-300 dark:text-neutral-700">/</span>
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="truncate font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {item.icon}
                  {item.icon ? <span className="hidden sm:inline">{item.label}</span> : item.label}
                </span>
              ) : item.to ? (
                <Link
                  to={item.to}
                  className="truncate flex items-center gap-1 min-w-0 !no-underline text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ) : (
                <span className="truncate flex items-center gap-1 min-w-0 text-neutral-600 dark:text-neutral-400">
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              )}
            </div>
          );
        })}
      </nav>
  );
}

export default Breadcrumbs;