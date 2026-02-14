import { useState } from "react";
import { Pagination } from "@cloudflare/kumo";

export function PaginationBasicDemo() {
  const [page, setPage] = useState(1);

  return (
    <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
  );
}

export function PaginationSimpleDemo() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      page={page}
      setPage={setPage}
      perPage={10}
      totalCount={100}
      controls="simple"
    />
  );
}

export function PaginationFullDemo() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      page={page}
      setPage={setPage}
      perPage={10}
      totalCount={100}
      controls="full"
    />
  );
}

export function PaginationMidPageDemo() {
  const [page, setPage] = useState(5);

  return (
    <Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
  );
}

export function PaginationLargeDatasetDemo() {
  const [page, setPage] = useState(1);

  return (
    <Pagination page={page} setPage={setPage} perPage={25} totalCount={1250} />
  );
}

export function PaginationCustomTextDemo() {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      text={({ perPage }) => `Page ${page} - showing ${perPage} per page`}
      page={page}
      setPage={setPage}
      perPage={25}
      totalCount={100}
    />
  );
}
