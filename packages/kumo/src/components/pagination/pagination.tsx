import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { InputGroup } from "../input";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { cn } from "../../utils/cn";
import { Select } from "../select";

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100, 250] as const;

/** Pagination controls variant definitions. */
export const KUMO_PAGINATION_VARIANTS = {
  controls: {
    full: {
      classes: "",
      description:
        "Full pagination controls with first, previous, page input, next, and last buttons",
    },
    simple: {
      classes: "",
      description:
        "Simple pagination controls with only previous and next buttons",
    },
  },
} as const;

export type KumoPaginationControls =
  keyof typeof KUMO_PAGINATION_VARIANTS.controls;

export const KUMO_PAGINATION_DEFAULT_VARIANTS = {
  controls: "full",
} as const;

export interface KumoPaginationVariantsProps {
  controls?: KumoPaginationControls;
}

export function paginationVariants({
  controls = KUMO_PAGINATION_DEFAULT_VARIANTS.controls,
}: KumoPaginationVariantsProps = {}) {
  return cn(
    "flex items-center justify-between gap-2",
    KUMO_PAGINATION_VARIANTS.controls[controls].classes,
  );
}

// ============================================================================
// Pagination Context
// ============================================================================

interface PaginationContextValue {
  page: number;
  perPage?: number;
  totalCount?: number;
  maxPage: number;
  pageShowingRange: string;
  setPage: (page: number) => void;
  editingPage: number;
  setEditingPage: (page: number) => void;
}

const PaginationContext = createContext<PaginationContextValue | null>(null);

function usePaginationContext() {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error(
      "Pagination compound components must be used within a Pagination component",
    );
  }
  return context;
}

// ============================================================================
// Pagination.Info
// ============================================================================

export interface PaginationInfoProps {
  /** Custom render function for the info text */
  children?: (props: {
    page: number;
    perPage?: number;
    totalCount?: number;
    pageShowingRange: string;
  }) => ReactNode;
  /** Additional CSS classes */
  className?: string;
}

function PaginationInfo({ children, className }: PaginationInfoProps) {
  const { page, perPage, totalCount, pageShowingRange } =
    usePaginationContext();

  const content = children
    ? children({ page, perPage, totalCount, pageShowingRange })
    : totalCount && totalCount > 0
      ? `Showing ${pageShowingRange} of ${totalCount}`
      : null;

  return (
    <div
      data-slot="pagination-info"
      className={cn("text-sm text-kumo-strong", className)}
    >
      {content}
    </div>
  );
}

PaginationInfo.displayName = "Pagination.Info";

// ============================================================================
// Pagination.PageSize
// ============================================================================

export interface PaginationPageSizeProps {
  /** Current page size value */
  value: number;
  /** Callback when page size changes */
  onChange: (size: number) => void;
  /** Available page size options */
  options?: number[];
  /** Label text shown before the selector */
  label?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

function PaginationPageSize({
  value,
  onChange,
  options = DEFAULT_PAGE_SIZE_OPTIONS as unknown as number[],
  label = "Per page:",
  className,
}: PaginationPageSizeProps) {
  return (
    <div
      data-slot="pagination-page-size"
      className={cn("flex items-center gap-2", className)}
    >
      {label && <span className="text-sm text-kumo-strong">{label}</span>}
      <Select
        label="Page size"
        value={value}
        onValueChange={(v) => onChange(v as number)}
      >
        {options.map((size) => (
          <Select.Option key={size} value={size}>
            {size}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}

PaginationPageSize.displayName = "Pagination.PageSize";

// ============================================================================
// Pagination.Controls
// ============================================================================

export interface PaginationControlsProps extends KumoPaginationVariantsProps {
  /** Additional CSS classes */
  className?: string;
}

function PaginationControls({
  controls = KUMO_PAGINATION_DEFAULT_VARIANTS.controls,
  className,
}: PaginationControlsProps) {
  const { page, maxPage, setPage, editingPage, setEditingPage } =
    usePaginationContext();

  return (
    <div
      data-slot="pagination-controls"
      className={cn("grow flex flex-col items-end", className)}
    >
      <div>
        <InputGroup focusMode="individual">
          {controls === "full" && (
            <InputGroup.Button
              variant="secondary"
              aria-label="First page"
              disabled={page <= 1}
              onClick={() => {
                setPage(1);
                setEditingPage(1);
              }}
            >
              <CaretDoubleLeftIcon size={16} />
            </InputGroup.Button>
          )}
          <InputGroup.Button
            variant="secondary"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => {
              const previousPage = Math.max(page - 1, 1);
              setPage(previousPage);
              setEditingPage(previousPage);
            }}
          >
            <CaretLeftIcon size={16} />
          </InputGroup.Button>
          {controls === "full" && (
            <InputGroup.Input
              style={{ width: 50 }}
              className="text-center"
              aria-label="Page number"
              value={editingPage}
              onValueChange={(value: string) => {
                setEditingPage(Number(value));
              }}
              onBlur={() => {
                let number = Math.max(editingPage, 1);
                number = Math.min(number, maxPage);
                setPage(number);
                setEditingPage(number);
              }}
            />
          )}
          <InputGroup.Button
            variant="secondary"
            aria-label="Next page"
            disabled={page === maxPage}
            onClick={() => {
              const nextPage = Math.min(page + 1, maxPage);
              setPage(nextPage);
              setEditingPage(nextPage);
            }}
          >
            <CaretRightIcon size={16} />
          </InputGroup.Button>
          {controls === "full" && (
            <InputGroup.Button
              variant="secondary"
              aria-label="Last page"
              disabled={page === maxPage}
              onClick={() => {
                setPage(maxPage);
                setEditingPage(maxPage);
              }}
            >
              <CaretDoubleRightIcon size={16} />
            </InputGroup.Button>
          )}
        </InputGroup>
      </div>
    </div>
  );
}

PaginationControls.displayName = "Pagination.Controls";

// ============================================================================
// Pagination.Separator
// ============================================================================

export interface PaginationSeparatorProps {
  /** Additional CSS classes */
  className?: string;
}

function PaginationSeparator({ className }: PaginationSeparatorProps) {
  return (
    <div
      data-slot="pagination-separator"
      className={cn("mx-2 h-6 border-l border-kumo-line", className)}
    />
  );
}

PaginationSeparator.displayName = "Pagination.Separator";

// ============================================================================
// Pagination Root
// ============================================================================

/** Base props shared by both compound and legacy Pagination APIs */
interface PaginationBaseProps {
  /** Callback fired when the current page changes. */
  setPage: (page: number) => void;
  /**
   * Current page number (1-indexed).
   * @default 1
   */
  page?: number;
  /** Number of items displayed per page. */
  perPage?: number;
  /** Total number of items across all pages. */
  totalCount?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Props for the compound component API (recommended).
 *
 * @example
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={perPage} totalCount={500}>
 *   <Pagination.Info />
 *   <Pagination.PageSize value={perPage} onChange={setPerPage} />
 *   <Pagination.Controls />
 * </Pagination>
 * ```
 */
export interface PaginationCompoundProps extends PaginationBaseProps {
  /**
   * Compound component children for custom layouts.
   * Use Pagination.Info, Pagination.PageSize, Pagination.Controls, and Pagination.Separator.
   */
  children: ReactNode;
  controls?: never;
  text?: never;
}

/**
 * Props for the legacy API (deprecated, use compound components instead).
 *
 * @deprecated Use the compound component API with children instead:
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={perPage} totalCount={500}>
 *   <Pagination.Info />
 *   <Pagination.Controls />
 * </Pagination>
 * ```
 *
 * @example
 * ```tsx
 * // Legacy usage (deprecated)
 * <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
 * ```
 */
export interface PaginationLegacyProps
  extends PaginationBaseProps,
    KumoPaginationVariantsProps {
  children?: never;
  /** @deprecated Use Pagination.Info with children prop instead */
  text?: (props: {
    page?: number;
    perPage?: number;
    totalCount?: number;
    pageShowingRange: string;
  }) => ReactNode;
}

/**
 * Pagination component props.
 *
 * Prefer the compound component API for new code:
 * @example
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={perPage} totalCount={500}>
 *   <Pagination.Info />
 *   <Pagination.PageSize value={perPage} onChange={setPerPage} />
 *   <Pagination.Controls />
 * </Pagination>
 * ```
 */
export type PaginationProps = PaginationCompoundProps | PaginationLegacyProps;

/**
 * Page navigation controls with page count display.
 *
 * Supports both compound component and legacy patterns. Prefer compound components for new code:
 *
 * @example
 * // Compound component (recommended)
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={perPage} totalCount={500}>
 *   <Pagination.Info />
 *   <Pagination.Separator />
 *   <Pagination.PageSize value={perPage} onChange={setPerPage} />
 *   <Pagination.Controls />
 * </Pagination>
 * ```
 *
 * @example
 * // Legacy (deprecated)
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
 * ```
 */
function PaginationRoot(props: PaginationProps) {
  const { page = 1, perPage, totalCount, setPage, children, className } = props;

  // Extract legacy props (only present when children is not provided)
  const text = "text" in props ? props.text : undefined;
  const controls =
    "controls" in props
      ? (props.controls ?? KUMO_PAGINATION_DEFAULT_VARIANTS.controls)
      : KUMO_PAGINATION_DEFAULT_VARIANTS.controls;
  const [editingPage, setEditingPage] = useState<number>(1);

  useEffect(() => {
    setEditingPage(page);
  }, [page]);

  const pageShowingRange = useMemo(() => {
    let lower = page * (perPage ?? 1) - (perPage ?? 0) + 1;
    let upper = Math.min(page * (perPage ?? 0), totalCount ?? 0);

    if (Number.isNaN(lower)) lower = 0;
    if (Number.isNaN(upper)) upper = 0;

    return `${lower}-${upper}`;
  }, [page, perPage, totalCount]);

  const maxPage = useMemo(() => {
    return Math.ceil((totalCount ?? 1) / (perPage ?? 1));
  }, [totalCount, perPage]);

  const contextValue: PaginationContextValue = {
    page,
    perPage,
    totalCount,
    maxPage,
    pageShowingRange,
    setPage,
    editingPage,
    setEditingPage,
  };

  // Compound component mode: render children within context
  if (children) {
    return (
      <PaginationContext.Provider value={contextValue}>
        <div
          data-slot="pagination"
          className={cn("flex items-center gap-2 w-full", className)}
        >
          {children}
        </div>
      </PaginationContext.Provider>
    );
  }

  // Legacy mode: render default layout for backwards compatibility
  const getPaginationText = () => {
    if (text) {
      return text({ page, perPage, totalCount, pageShowingRange });
    } else if (totalCount && totalCount > 0) {
      return `Showing ${pageShowingRange} of ${totalCount}`;
    }
    return null;
  };

  return (
    <PaginationContext.Provider value={contextValue}>
      <div
        data-slot="pagination"
        className={cn("flex items-center gap-2 w-full", className)}
      >
        <div
          data-slot="pagination-info"
          className="grow text-sm text-kumo-strong"
        >
          {getPaginationText()}
        </div>
        <PaginationControls controls={controls} />
      </div>
    </PaginationContext.Provider>
  );
}

PaginationRoot.displayName = "Pagination";

// ============================================================================
// Compound Component Export
// ============================================================================

export const Pagination = Object.assign(PaginationRoot, {
  Info: PaginationInfo,
  PageSize: PaginationPageSize,
  Controls: PaginationControls,
  Separator: PaginationSeparator,
});

export {
  PaginationInfo,
  PaginationPageSize,
  PaginationControls,
  PaginationSeparator,
};
