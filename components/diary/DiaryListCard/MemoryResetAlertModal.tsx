"use client";

import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { processDiary } from "~/app/actions/diary";
import { DiaryModalType } from "~/components/diary/DiaryListCard/Provider";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Diary } from "~/prisma/generated/client";

interface MemoryResetAlertModalProps {
  diary: Diary;
  activeModal: DiaryModalType;
  setActiveModal: (modal: DiaryModalType) => void;
}

export function MemoryResetAlertModal({
  diary,
  activeModal,
  setActiveModal,
}: MemoryResetAlertModalProps) {
  const { mutate: resetMemory, isPending: isLoading } = useMutation({
    mutationFn: () => processDiary(diary.id),
    onSuccess: ({ memories }) => {
      toast.success(
        `일기 재메모리화가 완료되었습니다. (메모리 ${memories.length}개)`,
      );
      handleCloseModal(false);
    },
    onError: (error) => {
      toast.error("일기 재메모리화에 실패했습니다.");
      console.error("Error re-memorizing diary:", error);
    },
  });

  function handleCloseModal(open: boolean) {
    if (!open) {
      setActiveModal(null);
    }
  }

  function handleReset() {
    resetMemory();
  }

  return (
    <Dialog
      open={activeModal === "memory-reset-alert"}
      onOpenChange={handleCloseModal}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>일기 재메모리화</DialogTitle>
        </DialogHeader>
        <div>
          {format(diary.date, "yyyy년 M월 d일")}의 일기를 재메모리화
          하시겠습니까?
          <br />
          <strong>
            (해당 일기의 메모리들이 삭제되고, 새로운 메모리를 생성합니다.)
          </strong>
        </div>
        <DialogFooter className="flex items-center justify-end gap-2">
          {isLoading && <Spinner className="mr-2 size-5" />}
          <Button type="submit" onClick={handleReset} disabled={isLoading}>
            재메모리화
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              handleCloseModal(false);
            }}
            disabled={isLoading}
          >
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
