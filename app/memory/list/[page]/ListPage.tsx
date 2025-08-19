"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { groupBy } from "lodash-es";
import { useState } from "react";

import { getMemories } from "~/app/actions/memory";
import { AppPagination } from "~/components/AppPagination";
import { Header } from "~/components/Header";
import { Memory } from "~/components/memory/Memory";
import { MemoryGroupList } from "~/components/memory/MemoryGroupList";
import { MainContainer } from "~/components/ui/container";
import { PaginationLink } from "~/components/ui/pagination";
import { MEMORY_PAGE_SIZE, PAGENATION_SIZE } from "~/constants";

export function ListPage(props: { page: number }) {
  const limit = MEMORY_PAGE_SIZE;

  const [page, setPage] = useState(props.page);

  const { data } = useSuspenseQuery({
    queryKey: ["memories", { limit, page }],
    queryFn: () => getMemories({ limit, page }),
  });

  const { memories, total } = data;

  const memoriesGroup = groupBy(memories, "diary.date");

  for (const date in memoriesGroup) {
    memoriesGroup[date].sort((a, b) => (a.id > b.id ? -1 : 1));
  }

  return (
    <>
      <Header>
        <h1 className="text-2xl font-bold">
          메모리 목록
          <span className="ml-2 text-base">(총 {total}개)</span>
        </h1>
      </Header>

      <MainContainer className="flex flex-col gap-4">
        {memories.length > 0 ? (
          Object.entries(memoriesGroup).map(([date, memories]) => (
            <MemoryGroupList
              key={date}
              date={date}
              memories={memories}
              render={(memory) => <Memory key={memory.id} memory={memory} />}
            />
          ))
        ) : (
          <p>메모리가 없습니다.</p>
        )}

        <hr className="my-6" />

        <AppPagination
          total={total}
          page={page}
          size={PAGENATION_SIZE}
          limit={limit}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          render={(number) => {
            const href = `/memory/list/${number}`;
            const isActive = number === page;

            return (
              <PaginationLink href={href} isActive={isActive}>
                {number}
              </PaginationLink>
            );
          }}
        />
      </MainContainer>
    </>
  );
}
