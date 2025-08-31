"use client";

import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  getOldestUnmemorizedDiaryByDate,
  updateSentiment,
} from "~/app/actions/diary";
import { useDiaryModal } from "~/components/diary/DiaryListCard/Provider";
import { SentimentSelect } from "~/components/diary/SentimentSelect";
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

  const { openModal } = useDiaryModal();

  function handleEditButtonClick() {
    router.push(`/new?date=${format(diary.date, "yyyy-MM-dd")}`);
  }

  // 원래는 mutation이 아니라 useQuery를 쓰는게 맞지만 useMutation 쓰는게 더 편해서 이렇게 함
  const {
    mutate: openDiaryMemorifyModal,
    status: openDiaryMemorifyModalStatus,
  } = useMutation({
    mutationFn: async () => {
      const [pd] = await getOldestUnmemorizedDiaryByDate(diary.date);
      return pd;
    },
    onSuccess: (pd) => {
      if (pd) {
        openModal("memory-past-first", { pastDiary: pd });
      } else {
        openModal("memory-reset-alert");
      }
    },
  });

  const [sentiment, setSentiment] = useState<number | null>(diary.sentiment);
  const { mutate: updateDiarySentiment, status: updateDiarySentimentStatus } =
    useMutation({
      mutationFn: async (score: number) => updateSentiment(diary.id, score),
    });
  function handleSentimentChange(value: string) {
    const score = Number(value);
    setSentiment(score);
    updateDiarySentiment(score);
  }

  const isLoading =
    openDiaryMemorifyModalStatus === "pending" ||
    updateDiarySentimentStatus === "pending";

  return (
    <div className="flex items-center justify-between">
      <h2 className="flex flex-col justify-start font-bold sm:block">
        {format(diary.date, "yyyy년 M월 d일")}
        <span className="text-sm font-normal text-gray-400 sm:ml-2">
          {"score" in diary &&
            diary.score &&
            (diary.isSemantic
              ? `유사도 ${(diary.score * 100).toFixed(2)}%`
              : `검색어 포함 ${diary.score * 10}회`)}
        </span>
      </h2>
      <div className="flex items-center gap-2">
        {isLoading && <Spinner />}

        <SentimentSelect
          onValueChange={handleSentimentChange}
          defaultValue={sentiment ? String(sentiment) : undefined}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8">
              <EllipsisVerticalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleEditButtonClick}
                disabled={isLoading}
              >
                일기 수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openModal("delete")}
                disabled={isLoading}
              >
                일기 삭제
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDiaryMemorifyModal()}
                disabled={isLoading}
              >
                {diary._count.embeddings > 0
                  ? "일기 재메모리화"
                  : "일기 메모리화"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
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
