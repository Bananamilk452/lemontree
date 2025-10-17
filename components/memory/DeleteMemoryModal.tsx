"use client";

import { useState } from "react";
import { toast } from "sonner";

import { deleteMemoryById } from "~/app/actions/memory";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Memory as MemoryType } from "~/prisma/generated/client";

interface DeleteMemoryModalProps {
  memory: MemoryType;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DeleteMemoryModal({
  memory,
  open,
  setOpen,
}: DeleteMemoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleDelete() {
    setIsLoading(true);
    deleteMemoryById(memory.id)
      .then(() => {
        toast.success("메모리가 삭제되었습니다.");
        setOpen(false);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error("메모리 삭제에 실패했습니다.");
        console.error("Error deleting memory:", error);
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>메모리 삭제</DialogTitle>
        </DialogHeader>
        <div>해당 메모리를 삭제하시겠습니까?</div>
        <DialogFooter className="flex items-center justify-end gap-2">
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
              setOpen(false);
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
