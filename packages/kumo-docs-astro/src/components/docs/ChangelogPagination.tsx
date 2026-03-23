import { Pagination } from "@cloudflare/kumo";

interface ChangelogPaginationProps {
  page: number;
  perPage: number;
  totalCount: number;
}

export function ChangelogPagination({
  page,
  perPage,
  totalCount,
}: ChangelogPaginationProps) {
  const handlePageChange = (newPage: number) => {
    const href = newPage <= 1 ? "/changelog/" : `/changelog/${newPage}/`;
    window.location.href = href;
  };

  return (
    <Pagination
      page={page}
      setPage={handlePageChange}
      perPage={perPage}
      totalCount={totalCount}
    />
  );
}
