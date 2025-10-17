"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";

interface ChangePasswordModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

type ChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordModal({
  open,
  setOpen,
}: ChangePasswordModalProps) {
  const form = useForm<ChangePasswordFormSchema>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const { mutate: setPassword, status } = useMutation({
    mutationFn: (values: ChangePasswordFormSchema) =>
      authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.password,
        revokeOtherSessions: true,
      }),
  });

  function onSubmit(values: ChangePasswordFormSchema) {
    setPassword(values, {
      onSuccess: () => {
        toast.success("비밀번호가 성공적으로 변경되었습니다.");
        form.reset();
        setOpen(false);
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
        </DialogHeader>

        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>현재 비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="password"
                      placeholder="현재 비밀번호"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>새 비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="새 비밀번호"
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
