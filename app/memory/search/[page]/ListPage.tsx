"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { groupBy } from "lodash-es";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";

import { fullTextSearch, semanticSearch } from "~/app/actions/memory";
import { AppPagination } from "~/components/AppPagination";
import { Memory } from "~/components/memory/Memory";
import { MemoryGroupList } from "~/components/memory/MemoryGroupList";
import { SearchBar } from "~/components/search/SearchBar";
import { Spinner } from "~/components/Spinner";
import { PaginationLink } from "~/components/ui/pagination";
import { MEMORY_PAGE_SIZE, PAGENATION_SIZE } from "~/constants";
import { Memory as MemoryType } from "~/prisma/generated/client";

interface SearchParams {
  searchInput: string;
  semanticSearch: boolean;
  sort: string;
}

export function SearchListPage(props: { page: number }) {
  const limit = MEMORY_PAGE_SIZE;

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

    router.push(`/memory/search/1?${searchParams.toString()}`);
  }

  const { data, status } = useQuery({
    queryKey: [
      "memorySearch",
      props.page,
      searchInput,
      isSemantic,
      sort,
      limit,
    ],
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
        <MemoryList
          memories={data.memories}
          sort={sort}
          isSemantic={isSemantic}
        />
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

type Memories = Awaited<ReturnType<typeof semanticSearch>>["memories"];

function MemoryWithScore({
  memory,
  isSemantic,
}: {
  memory: MemoryType | Memories[0];
  isSemantic: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-gray-400">
        {"date" in memory && format(new Date(memory.date), "yyyy년 MM월 dd일")},
        {"score" in memory &&
          memory.score &&
          (isSemantic
            ? ` 유사도 ${(memory.score * 100).toFixed(2)}%`
            : ` 검색어 포함 ${memory.score * 10}회`)}
      </p>

      <Memory memory={memory} key={memory.id} />
    </div>
  );
}

function MemoryList({
  memories,
  sort,
  isSemantic,
}: {
  memories: Memories;
  sort: string;
  isSemantic: boolean;
}) {
  if (sort === "latest" || sort === "oldest") {
    const memoriesGroup = groupBy(memories, "date");

    for (const date in memoriesGroup) {
      memoriesGroup[date].sort((a, b) => (a.id > b.id ? -1 : 1));
    }

    return (
      <div className="flex flex-col gap-4">
        {Object.entries(memoriesGroup).map(([date, memories]) => (
          <MemoryGroupList
            key={date}
            date={date}
            memories={memories}
            render={(memory) => (
              <MemoryWithScore memory={memory} isSemantic={isSemantic} />
            )}
          />
        ))}
      </div>
    );
  } else {
    return memories.map((m, i) => (
      <Fragment key={m.id}>
        <MemoryWithScore memory={m} isSemantic={isSemantic} />
        {i !== memories.length - 1 && <hr className="my-4" />}
      </Fragment>
    ));
  }
}
