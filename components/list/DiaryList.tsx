"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { getDiarys } from "~/app/actions/diary";
import { AppPagination } from "~/components/AppPagination";
import { DiaryListCard } from "~/components/diary/DiaryListCard";
import { Spinner } from "~/components/Spinner";
import { PaginationLink } from "~/components/ui/pagination";
import { PAGENATION_SIZE } from "~/constants";

import type { DiaryWithCount } from "~/lib/models/diary";

interface DiaryListProps {
  diarys: DiaryWithCount[];
  limit: number;
  page: number;
  total: number;
}

export default function DiaryList(props: DiaryListProps) {
  const [page, setPage] = useState(props.page);

  // 상위 페이지 revalidate 시에 props이 바뀌면 여기서도 바뀌게
  useEffect(() => {
    setPage(props.page);
  }, [props.page]);

  const {
    data,
    isFetching: isLoading,
    error,
  } = useQuery({
    queryKey: ["diarys", { page, limit: props.limit }],
    queryFn: () => getDiarys({ limit: props.limit, page }),
    enabled: page !== props.page,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error("일기 목록을 불러오는 데 실패했습니다.");
    }
  }, [error]);

  const diarys = data?.diarys ?? props.diarys;
  const total = data?.total ?? props.total;
  return (
    <>
      {isLoading ? (
        <div className="flex w-full justify-center">
          <Spinner className="size-5" />
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {diarys.map((diary, i) => (
            <React.Fragment key={diary.id}>
              <DiaryListCard diary={diary} />
              {i !== diarys.length - 1 && <hr />}
            </React.Fragment>
          ))}
        </div>
      )}

      <hr className="my-6" />

      <AppPagination
        total={total}
        page={page}
        size={PAGENATION_SIZE}
        limit={props.limit}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        render={(number) => {
          const href = `/diary/list/${number}`;
          const isActive = number === page;

          return (
            <PaginationLink href={href} isActive={isActive}>
              {number}
            </PaginationLink>
          );
        }}
      />
    </>
  );
}
