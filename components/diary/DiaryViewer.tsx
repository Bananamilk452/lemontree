"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { getDiaryByDate } from "~/app/actions/diary";
import { DatePicker } from "~/components/DatePicker";
import { DiaryEmpty } from "~/components/diary/DiaryEmpty";
import { DiaryPaper } from "~/components/diary/DiaryPaper";
import { Spinner } from "~/components/Spinner";
import { utcDateNow } from "~/utils";

import type { Diary } from "~/lib/models/diary";

interface DiaryViewerProps {
  diary?: Diary | null;
}

export function DiaryViewer({ diary: initialDiary }: DiaryViewerProps) {
  const [date, setDate] = useState(initialDiary?.date ?? utcDateNow);

  const { data: currentDiary, status } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["diary", date.toISOString().slice(0, 10)],
    queryFn: () => getDiaryByDate(date),
    initialData: initialDiary,
  });

  function handlePreviousDiary() {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  }

  function handleNextDiary() {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-center gap-4">
        <button
          onClick={handlePreviousDiary}
          className="cursor-pointer rounded-md border border-gray-300 p-1 shadow"
        >
          <ChevronLeftIcon strokeWidth={1.5} className="size-6" />
        </button>

        <DatePicker
          value={date}
          onChange={(date) => {
            if (date) {
              setDate(date);
            }
          }}
        />

        <button
          onClick={handleNextDiary}
          className="cursor-pointer rounded-md border border-gray-300 p-1 shadow"
        >
          <ChevronRightIcon strokeWidth={1.5} className="size-6" />
        </button>
      </div>
      {status === "pending" ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : status === "error" ? (
        <div className="flex h-48 items-center justify-center">
          <p>일기를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : currentDiary ? (
        <DiaryPaper diary={currentDiary} />
      ) : (
        <DiaryEmpty date={date} />
      )}
    </div>
  );
}
