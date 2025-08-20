"use client";

import { format } from "date-fns";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getOldestUnmemorizedDiaryByDate } from "~/app/actions/diary";
import { useDiaryModal } from "~/components/diary/DiaryListCard/Provider";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import type { DiaryWithCount, DiaryWithScore } from "~/lib/models/diary";

interface DiaryListCardProps {
  diary: DiaryWithCount | DiaryWithScore;
}

export function DiaryListCardHeader({ diary }: DiaryListCardProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useDiaryModal();

  function handleEditButtonClick() {
    router.push(`/new?date=${format(diary.date, "yyyy-MM-dd")}`);
  }

  async function handleDiaryMemorify() {
    setIsLoading(true);
    const [pd] = await getOldestUnmemorizedDiaryByDate(diary.date);
    setIsLoading(false);

    if (pd) {
      openModal("memory-past-first", { pastDiary: pd });
    } else {
      openModal("memory-reset-alert");
    }
  }

  return (
    <div className="flex items-center justify-between">
      <h2 className="font-bold">
        {format(diary.date, "yyyy년 M월 d일")}
        <span className="text-sm font-normal text-gray-400">
          {"score" in diary &&
            diary.score &&
            (diary.isSemantic
              ? ` 유사도 ${(diary.score * 100).toFixed(2)}%`
              : ` 검색어 포함 ${diary.score * 10}회`)}
        </span>
      </h2>
      <div className="flex items-center gap-2">
        {isLoading && <Spinner />}
        <Button
          onClick={handleEditButtonClick}
          className="text-gray-600"
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          <PencilIcon className="size-5" />
          <span className="hidden sm:inline">수정</span>
        </Button>
        <Button
          onClick={() => openModal("delete")}
          className="text-red-600 hover:text-red-800"
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          <Trash2Icon className="size-5" />
          <span className="hidden sm:inline">삭제</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <EllipsisVerticalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleDiaryMemorify}
                disabled={isLoading}
              >
                {diary._count.embeddings > 0
                  ? "일기 재메모리화"
                  : "일기 메모리화"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild={true}>
                <Link href={`/diary/${diary.id}`}>일기 상세보기</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
