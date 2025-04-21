"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ComponentVariant } from "~/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth-client";
import { AUTH_MESSAGES } from "~/lib/messages";

import {
  AuthBox,
  AuthBoxDescription,
  AuthBoxTitle,
} from "~/components/auth/AuthBox";
import { AuthContainer } from "~/components/auth/AuthContainer";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Note } from "~/components/ui/note";

import type { AuthMessageKeys } from "~/lib/messages";

const formSchema = z
  .object({
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    params: { code: "passwords-do-not-match" },
    path: ["passwordConfirm"],
  });

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [note, setNote] = useState<{
    content: string;
    variant: ComponentVariant<typeof Note>;
    visible: boolean;
  }>({
    content: "",
    variant: "success",
    visible: false,
  });

  if (!token) {
    setNote({
      content: AUTH_MESSAGES.INVALID_TOKEN,
      variant: "error",
      visible: true,
    });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setNote({ ...note, visible: false });

    if (!token) {
      setNote({
        content: AUTH_MESSAGES.INVALID_TOKEN,
        variant: "error",
        visible: true,
      });
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error?.code) {
      const code = error.code as AuthMessageKeys;
      setNote({
        content: AUTH_MESSAGES[code],
        variant: "error",
        visible: true,
      });
    } else {
      setNote({
        content: AUTH_MESSAGES.RESET_PASSWORD_SUCCESS,
        variant: "success",
        visible: true,
      });
    }
  }

  return (
    <AuthContainer>
      <AuthBox>
        <AuthBoxTitle>비밀번호 재설정</AuthBoxTitle>
        <AuthBoxDescription>
          새로 사용할 비밀번호를 입력해주세요.
        </AuthBoxDescription>

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

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Spinner />}
              비밀번호 재설정
            </Button>
          </form>
        </Form>

        <div className="flex flex-wrap justify-between gap-4 text-sm text-gray-600">
          <Link href="/sign-up" className="hover:underline">
            회원가입
          </Link>
          <Link href="/sign-in" className="hover:underline">
            로그인
          </Link>
        </div>
      </AuthBox>

      {note.visible && <Note variant={note.variant}>{note.content}</Note>}
    </AuthContainer>
  );
}
