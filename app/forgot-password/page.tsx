"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ComponentVariant } from "~/utils";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { authClient } from "~/lib/auth-client";
import { AUTH_MESSAGES, zodErrorMap } from "~/lib/messages";

import type { AuthMessageKeys } from "~/lib/messages";

const formSchema = z.object({
  email: z.string().email(),
});

z.setErrorMap(zodErrorMap);

export default function ForgotPassword() {
  const [note, setNote] = useState<{
    content: string;
    variant: ComponentVariant<typeof Note>;
    visible: boolean;
  }>({
    content: "",
    variant: "success",
    visible: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setNote({ ...note, visible: false });

    const { error } = await authClient.forgetPassword({
      email: values.email,
      redirectTo: "/reset-password",
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
        content: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
        variant: "success",
        visible: true,
      });
    }
  }

  return (
    <AuthContainer>
      <AuthBox>
        <AuthBoxTitle>비밀번호 찾기</AuthBoxTitle>
        <AuthBoxDescription>
          가입한 계정의 이메일을 입력해주세요. 비밀번호를 재설정할 수 있는
          링크를 보내드립니다.
        </AuthBoxDescription>

        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Spinner />}
              비밀번호 찾기
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
