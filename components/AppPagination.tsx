"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination";

interface AppPaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  render: (page: number) => React.ReactNode;
}

export function AppPagination(props: AppPaginationProps) {
  const totalPage = Math.ceil(props.total / props.limit);
  const pageNumbers = Array.from({ length: totalPage }, (_, i) => i + 1);

  function handlePageChange(newPage: number) {
    props.onPageChange(newPage);
  }

  return (
    <Pagination>
      <PaginationContent>
        {pageNumbers.map((number) => (
          <PaginationItem key={number} onClick={() => handlePageChange(number)}>
            {props.render(number)}
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  );
}
