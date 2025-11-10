import { useEffect, useMemo, useState } from "react";
import { InputGroup } from "../input/input-group";
import { CaretDoubleLeftIcon, CaretDoubleRightIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

export function Pagination({
    page = 1,
    perPage,
    totalCount,
    setPage
  }: {
    setPage: (page: number) => void;
    page?: number;
    perPage?: number;
    totalCount?: number;
  }) {
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-400 grow">
          {totalCount && totalCount > 0 ? (
            `Showing ${pageShowingRange} of ${totalCount}`
          ) : null}
        </div>
        <div>
          <InputGroup>
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
            <InputGroup.Input
              style={{ width: 50 }}
              className="text-center"
              aria-label="Page number"
              value={editingPage}
              onValueChange={value => {
                setEditingPage(Number(value));
              }}
              onBlur={() => {
                let number = Math.max(editingPage, 1);
                number = Math.min(number, maxPage);
                setPage(number);
                setEditingPage(number);
              }}
            />
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
          </InputGroup>
        </div>
      </div>
    );
  }