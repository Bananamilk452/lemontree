"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDiary } from "~/app/actions/diary";
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

interface DeleteDiaryModalProps {
  diary: Diary;
  activeModal: DiaryModalType;
  setActiveModal: (modal: DiaryModalType) => void;
}

export function DeleteDiaryModal({
  diary,
  activeModal,
  setActiveModal,
}: DeleteDiaryModalProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  function handleCloseModal(open: boolean) {
    if (!open) {
      setActiveModal(null);
    }
  }

  function handleDelete() {
    setIsLoading(true);
    deleteDiary(diary.id)
      .then(() => {
        toast.success("일기가 삭제되었습니다.");
        setActiveModal(null);
        setIsLoading(false);

        // 일기 상세보기에서 삭제 시 목록으로 돌아감
        if (location.pathname.includes("/diary/")) {
          router.push("/list/1");
        }
      })
      .catch((error) => {
        toast.error("일기 삭제에 실패했습니다.");
        console.error("Error deleting diary:", error);
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={activeModal === "delete"} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>일기 삭제</DialogTitle>
        </DialogHeader>
        <div>
          {format(diary.date, "yyyy년 M월 d일")}의 일기를 삭제하시겠습니까?
          <br />
          <strong>(일기, 임베딩, 메모리도 함께 삭제됩니다.)</strong>
        </div>
        <DialogFooter className="flex justify-end gap-2 items-center">
          {isLoading && <Spinner className="mr-2 size-5" />}
          <Button
            variant="destructive"
            type="submit"
            onClick={handleDelete}
            disabled={isLoading}
          >
            삭제
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
