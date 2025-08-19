"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateMemoryById } from "~/app/actions/memory";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Memory as MemoryType } from "~/prisma/generated/client";
import {
  EditMemoryModalForm,
  EditMemoryModalFormSchema,
} from "~/types/zod/EditMemoryModalFormSchema";

interface EditMemoryModalProps {
  memory: MemoryType;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (memory: MemoryType) => void;
}

export function EditMemoryModal({
  memory,
  open,
  setOpen,
  onSuccess,
}: EditMemoryModalProps) {
  const form = useForm<EditMemoryModalForm>({
    resolver: zodResolver(EditMemoryModalFormSchema),
    defaultValues: {
      content: memory.content,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(data: z.infer<typeof EditMemoryModalFormSchema>) {
    setIsLoading(true);
    updateMemoryById(memory.id, data.content)
      .then((updatedMemory) => {
        onSuccess?.(updatedMemory);
        toast.success("메모리가 수정되었습니다.");
        setOpen(false);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error("메모리 수정에 실패했습니다.");
        console.error("Error editing memory:", error);
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>메모리 수정</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      className="h-[200px] w-full resize-none rounded-xl p-4 !text-base shadow-md"
                      placeholder="메모리의 내용을 작성하세요."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="flex items-center justify-end gap-2">
          {isLoading && <Spinner className="mr-2 size-5" />}
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            수정
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
