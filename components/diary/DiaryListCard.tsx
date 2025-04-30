"use client";

import { cn } from "~/utils";
import { format } from "date-fns";
import {
  CaseSensitiveIcon,
  EllipsisVerticalIcon,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MemoryStickIcon,
  PencilIcon,
  Trash2Icon,
  WaypointsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { DeleteDiaryModal } from "~/components/diary/DeleteDiaryModal";
import { Button } from "~/components/ui/button";

import type { Diary, DiaryWithCount } from "~/lib/models/diary";

interface DiaryListCardProps {
  diary: DiaryWithCount;
}

export function DiaryListCard({ diary }: DiaryListCardProps) {
  const router = useRouter();

  const [isDeleteDiaryModalOpen, setIsDeleteDiaryModalOpen] = useState(false);

  function handleEditButtonClick() {
    router.push(`/new?date=${format(diary.date, "yyyy-MM-dd")}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold">{format(diary.date, "yyyy년 M월 d일")}</h2>

      <DiaryCard diary={diary} />

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-3 text-gray-600">
          <dl className="flex gap-1.5 items-center text-sm">
            <dt>
              <CaseSensitiveIcon className="size-5" />
            </dt>
            <dd>{diary.content.length}자</dd>
          </dl>
          <dl className="flex gap-1.5 items-center text-sm">
            <dt>
              <WaypointsIcon className="size-5" />
            </dt>
            <dd>임베딩 {diary._count.embeddings}개</dd>
          </dl>
          {/* <dl className="flex gap-1.5 items-center text-sm">
            <dt>
              <MemoryStickIcon className="size-5" />
            </dt>
            <dd>메모리 2개</dd>
          </dl> */}
        </div>

        <div className="min-h-12"></div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-600">
            마지막 수정:{" "}
            {format(
              diary.updatedAt ?? diary.createdAt,
              "yyyy년 M월 d일 HH:mm:ss",
            )}
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleEditButtonClick}
              className="text-gray-600"
              variant="ghost"
              size="sm"
            >
              <PencilIcon className="size-5" />
              수정
            </Button>
            <Button
              onClick={() => setIsDeleteDiaryModalOpen(true)}
              className="text-red-600 hover:text-red-800"
              variant="ghost"
              size="sm"
            >
              <Trash2Icon className="size-5" />
              삭제
            </Button>
            <DeleteDiaryModal
              diary={diary}
              open={isDeleteDiaryModalOpen}
              setOpen={setIsDeleteDiaryModalOpen}
            />
            <Button variant="ghost" size="sm">
              <EllipsisVerticalIcon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiaryCard({ diary }: { diary: Diary }) {
  const paragraph = useRef<HTMLParagraphElement>(null);
  const [isHide, setIsHide] = useState(true);

  const padding = 16;
  const height = 256 - padding * 2; // h-64 - py-4

  useLayoutEffect(() => {
    // 컨테이너 크기보다 일기가 더 길면
    // isHide가 true
    if (paragraph.current) {
      if (paragraph.current.scrollHeight > height) {
        setIsHide(true);
      } else {
        setIsHide(false);
      }
    }
  }, [height]);

  return (
    <article
      className={cn(
        "bg-white border border-gray-300 rounded-xl shadow-md relative",
        isHide ? "max-h-64 overflow-hidden" : "h-auto",
      )}
    >
      {isHide && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white to-95%">
          <div className="size-full p-6 flex justify-center items-end">
            <Button variant="secondary" onClick={() => setIsHide(false)}>
              더보기
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 h-full">
        <p
          ref={paragraph}
          className="whitespace-pre-wrap break-keep-all h-full"
          style={{
            backgroundImage: "linear-gradient(#ccc 1px, transparent 1px)",
            backgroundSize: "100% 26px",
            lineHeight: "26px",
            backgroundPosition: "0 25px",
          }}
        >
          {diary.content}
        </p>
      </div>
    </article>
  );
}
