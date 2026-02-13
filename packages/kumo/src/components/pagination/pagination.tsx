import { useEffect, useMemo, useState } from "react";
import { InputGroup } from "../input";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { cn } from "../../utils/cn";

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

/**
 * Pagination component props.
 *
 * @example
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
 * <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} controls="simple" />
 * ```
 */
export interface PaginationProps extends KumoPaginationVariantsProps {
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
}

/**
 * Page navigation controls with page count display.
 *
 * @example
 * ```tsx
 * <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
 * ```
 */
export function Pagination({
  page = 1,
  perPage,
  totalCount,
  setPage,
  controls = KUMO_PAGINATION_DEFAULT_VARIANTS.controls,
}: PaginationProps) {
  const [editingPage, setEditingPage] = useState<number>(1);

  // Value of the input as its being modified to display in the input, eventually syncs with `pagination.page`
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

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="grow text-sm text-kumo-strong">
        {totalCount && totalCount > 0
          ? `Showing ${pageShowingRange} of ${totalCount}`
          : null}
      </div>
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
