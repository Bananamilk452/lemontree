"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { removeUser as removeUserAction } from "~/app/actions/admin";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { UserWithRole } from "~/types/auth";
import {
  DeleteUserForm,
  DeleteUserFormSchema,
} from "~/types/zod/DeleteUserFormSchema";

interface ChangePasswordModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  user: UserWithRole;
}

export function DeleteUserModal({
  open,
  setOpen,
  onSuccess,
  user,
}: ChangePasswordModalProps) {
  const form = useForm<DeleteUserForm>({
    resolver: zodResolver(DeleteUserFormSchema),
    defaultValues: {
      removeData: false,
    },
  });

  const { mutate: removeUser, status } = useMutation({
    mutationFn: (values: DeleteUserForm) =>
      removeUserAction(user.id, values.removeData),
  });

  function onSubmit(values: DeleteUserForm) {
    removeUser(values, {
      onSuccess: () => {
        toast.success("사용자가 성공적으로 삭제되었습니다.");
        setOpen(false);
        onSuccess();
      },
      onError: () => {
        toast.error("사용자 삭제에 실패했습니다.");
      },
    });
  }

  const isLoading = form.formState.isSubmitting || status === "pending";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>사용자 삭제</DialogTitle>
          <DialogDescription>
            {user?.email}를 계정을 삭제합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="removeData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>데이터 삭제</FormLabel>
                  <FormDescription>
                    위험! 일기/메모리/임베딩 데이터가 모두 삭제되고 이 작업은
                    되돌릴 수 없습니다.
                  </FormDescription>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="flex items-center justify-end gap-2">
          {isLoading && <Spinner />}
          <Button
            variant="destructive"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            사용자 삭제
          </Button>
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
