"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { UserWithRole } from "~/types/auth";
import {
  AdminChangePasswordForm,
  AdminChangePasswordFormSchema,
} from "~/types/zod/AdminChangePasswordFormSchema";

interface ChangePasswordModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  user: UserWithRole;
}

export function ChangePasswordModal({
  open,
  setOpen,
  onSuccess,
  user,
}: ChangePasswordModalProps) {
  const form = useForm<AdminChangePasswordForm>({
    resolver: zodResolver(AdminChangePasswordFormSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const { mutate: setPassword, status } = useMutation({
    mutationFn: (values: AdminChangePasswordForm) =>
      authClient.admin.setUserPassword({
        newPassword: values.password,
        userId: user?.id,
      }),
  });

  function onSubmit(values: AdminChangePasswordForm) {
    setPassword(values, {
      onSuccess: () => {
        toast.success("비밀번호가 성공적으로 변경되었습니다.");
        form.reset();
        setOpen(false);
        onSuccess();
      },
      onError: () => {
        toast.error("비밀번호 변경에 실패했습니다.");
      },
    });
  }

  const isLoading = form.formState.isSubmitting || status === "pending";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogDescription>
            {user?.email}의 비밀번호를 변경합니다
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="비밀번호"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="비밀번호 확인"
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
          {isLoading && <Spinner />}
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            비밀번호 변경
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
