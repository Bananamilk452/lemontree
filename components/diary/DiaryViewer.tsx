"use client";

import { utcDateNow } from "~/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { getDiaryByDate } from "~/app/actions/diary";
import { DatePicker } from "~/components/DatePicker";
import { DiaryEmpty } from "~/components/diary/DiaryEmpty";
import { DiaryCard } from "~/components/diary/DiaryPaper";
import { Spinner } from "~/components/Spinner";

import type { Diary } from "~/lib/models/diary";

interface DiaryViewerProps {
  diary: Diary | null;
}

export function DiaryViewer({ diary: initialDiary }: DiaryViewerProps) {
  const [date, setDate] = useState(initialDiary?.date ?? utcDateNow);
  const [currentDiary, setCurrentDiary] = useState<Diary | null>(
    initialDiary || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // SSR로 첫 로딩되면 패스
    if (initialDiary?.date == date) {
      return;
    }

    setIsLoading(true);
    getDiaryByDate(date).then((d) => {
      setCurrentDiary(d);
      setIsLoading(false);
    });
  }, [date, initialDiary]);

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
      <div className="w-full flex justify-center items-center gap-4">
        <button
          onClick={handlePreviousDiary}
          className="p-1 shadow rounded-md border border-gray-300 cursor-pointer"
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
          className="p-1 shadow rounded-md border border-gray-300 cursor-pointer"
        >
          <ChevronRightIcon strokeWidth={1.5} className="size-6" />
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner className="size-6" />
        </div>
      ) : currentDiary ? (
        <DiaryCard diary={currentDiary} />
      ) : (
        <DiaryEmpty date={date} />
      )}
    </div>
  );
}
