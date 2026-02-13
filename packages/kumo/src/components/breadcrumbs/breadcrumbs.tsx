import { useEffect, useState, type PropsWithChildren } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { Button } from "../../components/button";
import { SkeletonLine } from "../../components/loader/skeleton-line";
import { useLinkComponent } from "../../utils/link-provider";
import { cn } from "../../utils/cn";

/** Breadcrumbs size variant definitions. */
export const KUMO_BREADCRUMBS_VARIANTS = {
  size: {
    sm: {
      classes: "text-sm h-10 gap-0.5",
      description: "Compact breadcrumbs for dense UIs",
    },
    base: {
      classes: "text-base h-12 gap-1",
      description: "Default breadcrumbs size",
    },
  },
} as const;

export const KUMO_BREADCRUMBS_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoBreadcrumbsSize = keyof typeof KUMO_BREADCRUMBS_VARIANTS.size;

export interface KumoBreadcrumbsVariantsProps {
  /**
   * Size of the breadcrumbs.
   * - `"sm"` — Compact breadcrumbs for dense UIs
   * - `"base"` — Default breadcrumbs size
   * @default "base"
   */
  size?: KumoBreadcrumbsSize;
}

export function breadcrumbsVariants({
  size = KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size,
}: KumoBreadcrumbsVariantsProps = {}) {
  return cn(
    "group mr-4 hidden min-w-0 grow items-center sm:flex",
    KUMO_BREADCRUMBS_VARIANTS.size[size].classes,
  );
}

export interface BreadcrumbsItemProps {
  href: string;
  icon?: React.ReactNode;
}

const Link = ({
  href,
  icon,
  children,
}: PropsWithChildren<BreadcrumbsItemProps>) => {
  const LinkComponent = useLinkComponent();

  return (
    <LinkComponent
      to={href}
      className="flex min-w-0 items-center gap-1 text-kumo-subtle no-underline"
    >
      {!!icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {children}
    </LinkComponent>
  );
};

interface BreadcrumbsCurrentProps {
  loading?: boolean;
  icon?: React.ReactNode;
}

function Current({
  children,
  icon,
  loading,
}: PropsWithChildren<BreadcrumbsCurrentProps>) {
  if (loading) {
    return (
      <div className="flex w-[125px] min-w-0 items-center gap-1">
        {icon && <span className="flex shrink-0 items-center">{icon}</span>}
        <SkeletonLine />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 truncate font-medium"
      aria-current="page"
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {children}
    </div>
  );
}

function Separator() {
  return (
    <span className="flex items-center text-kumo-inactive" aria-hidden="true">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M10.75 8.75L14.25 12L10.75 15.25"
        />
      </svg>
    </span>
  );
}

function Clipboard({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timeoutId = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopyDeeplink = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy deeplink:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      shape="square"
      size="sm"
      className="opacity-0 transition-[opacity] group-hover:opacity-100"
      onClick={handleCopyDeeplink}
      title="Click to copy"
      aria-label="Copy"
    >
      {isCopied ? (
        <CheckIcon weight="bold" className="text-kumo-success" />
      ) : (
        <CopyIcon weight="regular" />
      )}
    </Button>
  );
}

/**
 * Breadcrumbs component props.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
 * </Breadcrumbs>
 * ```
 */
export interface BreadcrumbsProps
  extends PropsWithChildren,
    KumoBreadcrumbsVariantsProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

/**
 * Navigation breadcrumb trail showing the current page's location in a hierarchy.
 * Compound component with `Breadcrumbs.Link`, `Breadcrumbs.Current`, `Breadcrumbs.Separator`, and `Breadcrumbs.Clipboard`.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Current>Dashboard</Breadcrumbs.Current>
 * </Breadcrumbs>
 * ```
 */
export function Breadcrumb({
  children,
  size = "base",
  className,
}: BreadcrumbsProps) {
  return (
    <nav
      className={cn(breadcrumbsVariants({ size }), className)}
      aria-label="breadcrumb"
    >
      {children}
    </nav>
  );
}

Breadcrumb.Link = Link;
Breadcrumb.Current = Current;
Breadcrumb.Separator = Separator;
Breadcrumb.Clipboard = Clipboard;
