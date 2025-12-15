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
import { authClient } from "~/lib/auth-client";
import {
  UserChangeNameForm,
  UserChangeNameFormSchema,
} from "~/types/zod/UserChangeNameFormSchema";

import { getQueryClient } from "../Providers";

interface ChangeNameModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ChangeNameModal({ open, setOpen }: ChangeNameModalProps) {
  const queryClient = getQueryClient();

  const form = useForm<UserChangeNameForm>({
    resolver: zodResolver(UserChangeNameFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: setPassword, status } = useMutation({
    mutationFn: (values: UserChangeNameForm) =>
      authClient.updateUser({
        name: values.name,
      }),
  });

  function onSubmit(values: UserChangeNameForm) {
    setPassword(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["session"] });

        toast.success("이름이 성공적으로 변경되었습니다.");
        form.reset();
        setOpen(false);
      },
      onError: () => {
        toast.error("이름 변경에 실패했습니다.");
      },
    });
  }

  const isLoading = form.formState.isSubmitting || status === "pending";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이름 변경</DialogTitle>
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
                    <Input type="text" placeholder="이름" {...field} />
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
            이름 변경
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
