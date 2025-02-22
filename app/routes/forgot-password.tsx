import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router";

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
import { Note } from "~/components/ui/note";
import type { ComponentVariant } from "~/lib/utils";
import {
  AUTH_MESSAGES,
  ZOD_MESSAGES,
  type AuthMessageKeys,
} from "~/lib/messages";
import { AuthContainer } from "~/components/auth/AuthContainer";
import {
  AuthBox,
  AuthBoxDescription,
  AuthBoxTitle,
} from "~/components/auth/AuthBox";

const formSchema = z.object({
  email: z
    .string({ required_error: ZOD_MESSAGES.REQUIRED })
    .email(ZOD_MESSAGES.INVALID_EMAIL),
});

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request, "/");
}

export default function ForgotPassword() {
  const [noteContent, setNoteContent] = useState<string>("");
  const [noteVariant, setNoteVariant] =
    useState<ComponentVariant<typeof Note>>();
  const [isNoteVisible, setIsNoteVisible] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsNoteVisible(false);

    const { error } = await authClient.forgetPassword({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (error?.code) {
      const code = error.code as AuthMessageKeys;
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES[code]);
      setNoteVariant("error");
    } else {
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS);
      setNoteVariant("success");
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
