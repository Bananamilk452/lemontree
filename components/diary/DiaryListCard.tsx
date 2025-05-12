"use client";

import { format } from "date-fns";
import {
  CaseSensitiveIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getOldestUnmemorizedDiaryByDate } from "~/app/actions/diary";
import { DeleteDiaryModal } from "~/components/diary/DeleteDiaryModal";
import { DiaryCard } from "~/components/diary/DiaryPaper";
import { MemoryPastFirstModal } from "~/components/diary/MemoryPastFirstModal";
import { MemoryResetAlertModal } from "~/components/diary/MemoryResetAlertModal";
import { MemoryList } from "~/components/memory/MemoryList";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Note } from "~/components/ui/note";

import type { Diary, DiaryWithCount } from "~/lib/models/diary";

interface DiaryListCardProps {
  diary: DiaryWithCount;
}

export type DiaryListCardActiveModal =
  | "memory-past-first"
  | "memory-reset-alert"
  | null;

export function DiaryListCard({ diary }: DiaryListCardProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDiaryModalOpen, setIsDeleteDiaryModalOpen] = useState(false);
  const [activeModal, setActiveModal] =
    useState<DiaryListCardActiveModal>(null);
  const [pastDiary, setPastDiary] = useState<Diary | null>(null);

  function handleEditButtonClick() {
    router.push(`/new?date=${format(diary.date, "yyyy-MM-dd")}`);
  }

  async function handleDiaryMemorify() {
    setIsLoading(true);
    const [pd] = await getOldestUnmemorizedDiaryByDate(diary.date);
    setIsLoading(false);

    if (pd) {
      setPastDiary(pd);
      setActiveModal("memory-past-first");
    } else {
      setActiveModal("memory-reset-alert");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold">{format(diary.date, "yyyy년 M월 d일")}</h2>
        <div className="flex gap-2 items-center">
          {isLoading && <Spinner />}
          <Button
            onClick={handleEditButtonClick}
            className="text-gray-600"
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            <PencilIcon className="size-5" />
            수정
          </Button>
          <Button
            onClick={() => setIsDeleteDiaryModalOpen(true)}
            className="text-red-600 hover:text-red-800"
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            <Trash2Icon className="size-5" />
            삭제
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
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DiaryCard diary={diary} className="max-h-96" />

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-4 items-center text-gray-600">
          <dl className="flex gap-1.5 items-center text-sm">
            <dt>
              <CaseSensitiveIcon className="size-5" />
            </dt>
            <dd>{diary.content.length}자</dd>
          </dl>
          <p className="text-xs text-gray-600">
            마지막 수정:{" "}
            {format(
              diary.updatedAt ?? diary.createdAt,
              "yyyy년 M월 d일 HH:mm:ss",
            )}
          </p>
        </div>

        <div className="min-h-12 mt-6">
          {diary._count.embeddings <= 0 ? (
            <Note variant="warning" title="일기 메모리화가 필요합니다.">
              일기의 메모리화가 필요합니다. 에디터에서 저장 버튼이나{" "}
              <EllipsisVerticalIcon className="inline-block size-4" />을 누르고
              &quot;일기 메모리화&quot;을 눌러주세요.
            </Note>
          ) : (
            <MemoryList memories={diary.memories} />
          )}
        </div>

        <div className="flex justify-between items-center"></div>
      </div>

      <DeleteDiaryModal
        diary={diary}
        open={isDeleteDiaryModalOpen}
        setOpen={setIsDeleteDiaryModalOpen}
      />
      <MemoryResetAlertModal
        diary={diary}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
      {pastDiary && (
        <MemoryPastFirstModal
          diary={pastDiary}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
        />
      )}
    </div>
  );
}

// function DiaryCard({ diary }: { diary: Diary }) {
//   const paragraph = useRef<HTMLParagraphElement>(null);
//   const [isHide, setIsHide] = useState(true);

//   const padding = 16;
//   const height = 256 - padding * 2; // h-64 - py-4

//   useLayoutEffect(() => {
//     // 컨테이너 크기보다 일기가 더 길면
//     // isHide가 true
//     if (paragraph.current) {
//       if (paragraph.current.scrollHeight > height) {
//         setIsHide(true);
//       } else {
//         setIsHide(false);
//       }
//     }
//   }, [height]);

//   return (
//     <article
//       className={cn(
//         "bg-white border border-gray-300 rounded-xl shadow-md relative",
//         isHide ? "max-h-64 overflow-hidden" : "h-auto",
//       )}
//     >
//       {isHide && (
//         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white to-95%">
//           <div className="size-full p-6 flex justify-center items-end">
//             <Button variant="outline" onClick={() => setIsHide(false)}>
//               더보기
//             </Button>
//           </div>
//         </div>
//       )}

//       <div className="p-4 h-full">
//         <p
//           ref={paragraph}
//           className="whitespace-pre-wrap break-keep-all h-full"
//           style={{
//             backgroundImage: "linear-gradient(#ccc 1px, transparent 1px)",
//             backgroundSize: "100% 26px",
//             lineHeight: "26px",
//             backgroundPosition: "0 25px",
//           }}
//         >
//           {diary.content}
//         </p>
//       </div>
//     </article>
//   );
// }
