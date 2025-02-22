import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { authClient } from "~/lib/auth";
import { redirectIfAuthenticated } from "~/lib/auth.server";
import type { Route } from "./+types/sign-up";
import { Spinner } from "~/components/Spinner";
import { Link, useSearchParams } from "react-router";
import { useState } from "react";
import { Note } from "~/components/ui/note";
import type { ComponentVariant } from "~/lib/utils";
import {
  AUTH_MESSAGES,
  ZOD_MESSAGES,
  type AuthMessageKeys,
} from "~/lib/messages";
import {
  AuthBox,
  AuthBoxDescription,
  AuthBoxTitle,
} from "~/components/auth/AuthBox";
import { AuthContainer } from "~/components/auth/AuthContainer";

const formSchema = z
  .object({
    password: z
      .string({ required_error: ZOD_MESSAGES.REQUIRED })
      .min(8, ZOD_MESSAGES.LEAST_CHARACTERS(8)),
    passwordConfirm: z
      .string({ required_error: ZOD_MESSAGES.REQUIRED })
      .min(8, ZOD_MESSAGES.LEAST_CHARACTERS(8)),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: ZOD_MESSAGES.PASSWORDS_DO_NOT_MATCH,
    path: ["passwordConfirm"],
  });

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request, "/");
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [noteContent, setNoteContent] = useState<string>("");
  const [noteVariant, setNoteVariant] =
    useState<ComponentVariant<typeof Note>>();
  const [isNoteVisible, setIsNoteVisible] = useState<boolean>(false);

  if (!token) {
    setIsNoteVisible(true);
    setNoteContent(AUTH_MESSAGES.INVALID_TOKEN);
    setNoteVariant("error");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsNoteVisible(false);

    if (!token) {
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES.INVALID_TOKEN);
      setNoteVariant("error");
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error?.code) {
      const code = error.code as AuthMessageKeys;
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES[code]);
      setNoteVariant("error");
    } else {
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES.RESET_PASSWORD_SUCCESS);
      setNoteVariant("success");
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
          <Link to="/sign-up" className="hover:underline">
            회원가입
          </Link>
          <Link to="/sign-in" className="hover:underline">
            로그인
          </Link>
        </div>
      </AuthBox>

      {isNoteVisible && <Note variant={noteVariant}>{noteContent}</Note>}
    </AuthContainer>
  );
}
