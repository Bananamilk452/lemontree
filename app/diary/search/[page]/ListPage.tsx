"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

import { fullTextSearch, semanticSearch } from "~/app/actions/diary";
import { AppPagination } from "~/components/AppPagination";
import { DiaryListCard } from "~/components/diary/DiaryListCard";
import { SearchBar } from "~/components/search/SearchBar";
import { Spinner } from "~/components/Spinner";
import { PaginationLink } from "~/components/ui/pagination";
import { PAGE_SIZE, PAGENATION_SIZE } from "~/constants";

interface SearchParams {
  searchInput: string;
  semanticSearch: boolean;
  sort: string;
}

export function SearchListPage(props: { page: number }) {
  const limit = PAGE_SIZE;

  const router = useRouter();
  const searchParams = useSearchParams();

  const searchInput = searchParams.get("q") || "";
  const isSemantic = searchParams.get("semantic") === "true";
  const sort = searchParams.get("sort") || "accuracy";

  const [page, setPage] = useState(props.page);

  function onSearch({ searchInput, semanticSearch, sort }: SearchParams) {
    const searchParams = new URLSearchParams();
    searchParams.set("q", searchInput);
    searchParams.set("semantic", String(semanticSearch));
    searchParams.set("sort", sort);

    router.push(`/diary/search/1?${searchParams.toString()}`);
  }

  const { data, status } = useQuery({
    queryKey: ["diarySearch", props.page, searchInput, isSemantic, sort, limit],
    queryFn: () => {
      if (isSemantic) {
        return semanticSearch(searchInput, {
          page: props.page,
          limit,
          sort,
        });
      } else {
        return fullTextSearch(searchInput, {
          page: props.page,
          limit,
          sort,
        });
      }
    },
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      <SearchBar
        searchInput={searchInput}
        semanticSearchEnabled={isSemantic}
        sortOrder={sort}
        onSearch={onSearch}
      />

      <hr className="my-6" />
      {status === "pending" && (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}
      {status === "error" && <p>검색 중 오류가 발생했습니다.</p>}

      {status === "success" && data && data.total > 0 && (
        <div className="flex flex-col gap-7">
          {data.diaries.map((diary, i) => (
            <Fragment key={diary.id}>
              <DiaryListCard diary={diary} />
              {i !== data.diaries.length - 1 && <hr />}
            </Fragment>
          ))}
        </div>
      )}
      {status === "success" && data && data.total === 0 && (
        <p>검색 결과가 없습니다.</p>
      )}

      {data && (
        <>
          <hr className="my-6" />

          <AppPagination
            total={data.total}
            page={page}
            size={PAGENATION_SIZE}
            limit={limit}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
            render={(number) => {
              const href = `/memory/search/${number}${searchParams.toString()}`;
              const isActive = number === page;

              return (
                <PaginationLink href={href} isActive={isActive}>
                  {number}
                </PaginationLink>
              );
            }}
          />
        </>
      )}
    </>
  );
}
