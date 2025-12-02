"use client";

import { useQuery } from "@tanstack/react-query";

import { getDiaryByDate } from "~/app/actions/diary";
import { DiaryListCard } from "~/components/diary/DiaryListCard";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";

interface DiaryViewModalProps {
  date: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DiaryViewModal({ date, open, setOpen }: DiaryViewModalProps) {
  const { data, status } = useQuery({
    queryKey: ["diary", date],
    queryFn: () => {
      const match = date.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
      if (match) {
        const parsedDate = new Date(
          Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
        );
        return getDiaryByDate(parsedDate);
      }

      return getDiaryByDate(new Date(date));
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-24px)] max-w-[calc(100dvw-24px)] !overflow-auto sm:max-w-3xl">
        {status === "pending" && (
          <div className="flex flex-col items-center gap-1 pt-4">
            <Spinner />
            <p className="text-sm">일기 로딩 중...</p>
          </div>
        )}
        {status === "success" && data && <DiaryListCard diary={data} />}
        {status === "success" && !data && (
          <div>해당 날짜의 일기를 찾을 수 없습니다.</div>
        )}
        {status === "error" && (
          <div>일기를 불러오는 중 오류가 발생했습니다.</div>
        )}

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
