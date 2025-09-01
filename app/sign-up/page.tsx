"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthBox, AuthBoxTitle } from "~/components/auth/AuthBox";
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
import { ComponentVariant } from "~/utils";

import type { AuthMessageKeys } from "~/lib/messages";

const formSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    params: { code: "passwords-do-not-match" },
    path: ["passwordConfirm"],
  });

z.setErrorMap(zodErrorMap);

export default function SignUp() {
  // 회원가입 비활성화
  notFound();

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
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setNote({ ...note, visible: false });

    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/sign-in",
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
        content: AUTH_MESSAGES.SIGN_UP_SUCCESS,
        variant: "success",
        visible: true,
      });
    }
  }

  return (
    <AuthContainer>
      <AuthBox>
        <AuthBoxTitle>회원가입</AuthBoxTitle>

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
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Spinner />}
              회원가입
            </Button>
          </form>
        </Form>

        <div className="flex flex-wrap justify-between gap-4 text-sm text-gray-600">
          <Link href="/forgot-password" className="hover:underline">
            비밀번호 찾기
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
