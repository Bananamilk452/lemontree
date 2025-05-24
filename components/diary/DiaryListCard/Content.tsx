"use client";

import { format } from "date-fns";
import { CaseSensitiveIcon, EllipsisVerticalIcon } from "lucide-react";

import { MemoryList } from "~/components/memory/MemoryList";
import { Note } from "~/components/ui/note";

import type { DiaryWithCount } from "~/lib/models/diary";

export function DiaryListCardContent({ diary }: { diary: DiaryWithCount }) {
  return (
    <>
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
      </div>
    </>
  );
}
