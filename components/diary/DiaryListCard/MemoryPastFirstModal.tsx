"use client";

import { Diary } from "@prisma/client";
import { format } from "date-fns";

import { DiaryModalType } from "~/components/diary/DiaryListCard/Provider";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface MemoryPastFirstModalProps {
  diary: Diary;
  activeModal: DiaryModalType;
  setActiveModal: (modal: DiaryModalType) => void;
}

export function MemoryPastFirstModal({
  diary,
  activeModal,
  setActiveModal,
}: MemoryPastFirstModalProps) {
  function handleCloseModal(open: boolean) {
    if (!open) {
      setActiveModal(null);
    }
  }

  function handleConfirm() {
    setActiveModal("memory-reset-alert");
  }

  return (
    <Dialog
      open={activeModal === "memory-past-first"}
      onOpenChange={handleCloseModal}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>메모리화되지 않은 과거 일기가 있습니다</DialogTitle>
        </DialogHeader>
        <div>
          현재 메모리화 하려는 일기보다 과거의 일기(
          {format(diary.date, "yyyy년 M월 d일")})가 있습니다.
          <br />
          정상적인 메모리화를 위해서는 과거 일기를 먼저 메모리화 하는 것을
          추천합니다.
        </div>
        <DialogFooter className="flex justify-end gap-2 items-center">
          <Button type="submit" onClick={handleConfirm}>
            무시하고 메모리화하기
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              handleCloseModal(false);
            }}
          >
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
