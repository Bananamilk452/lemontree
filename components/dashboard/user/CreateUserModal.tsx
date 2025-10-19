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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { authClient } from "~/lib/auth-client";
import {
  CreateUserForm,
  CreateUserFormSchema,
} from "~/types/zod/CreateUserFormSchema";

interface CreateUserModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserModal({
  open,
  setOpen,
  onSuccess,
}: CreateUserModalProps) {
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(CreateUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role: "user",
    },
  });

  const { mutate: createUser, status } = useMutation({
    mutationFn: (values: CreateUserForm) =>
      authClient.admin.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      }),
  });

  function onSubmit(values: CreateUserForm) {
    createUser(values, {
      onSuccess: () => {
        toast.success("유저가 성공적으로 생성되었습니다.");
        form.reset();
        setOpen(false);
        onSuccess();
      },
      onError: () => {
        toast.error("유저 생성에 실패했습니다.");
      },
    });
  }

  const isLoading = form.formState.isSubmitting || status === "pending";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>유저 생성</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="이메일"
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>역할</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <FormControl>
                        <SelectValue placeholder="역할 선택" />
                      </FormControl>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">일반 사용자</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="flex items-center justify-end gap-2">
          {isLoading && <Spinner />}
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            생성
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
