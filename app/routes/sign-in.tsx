import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { authClient } from "~/lib/auth";
import { redirectIfAuthenticated } from "~/lib/auth.server";
import {
  AUTH_MESSAGES,
  ZOD_MESSAGES,
  type AuthMessageKeys,
} from "~/lib/messages";
import type { ComponentVariant } from "~/lib/utils";

import { AuthBox } from "~/components/auth/AuthBox";
import { AuthContainer } from "~/components/auth/AuthContainer";
import { LemonTreeLogo } from "~/components/LemonTreeLogo";
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

import type { Route } from "./+types/sign-in";

const formSchema = z.object({
  email: z
    .string({
      required_error: ZOD_MESSAGES.REQUIRED,
    })
    .email(ZOD_MESSAGES.INVALID_EMAIL),
  password: z
    .string({
      required_error: ZOD_MESSAGES.REQUIRED,
    })
    .nonempty(),
});

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request, "/");
}

export default function SignIn() {
  const [noteContent, setNoteContent] = useState<string>("");
  const [noteVariant, setNoteVariant] =
    useState<ComponentVariant<typeof Note>>();
  const [isNoteVisible, setIsNoteVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsNoteVisible(false);

    const { error } = await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (ctx) => {
          navigate("/", { replace: true });
        },
      },
    );

    if (error?.code) {
      const code = error.code as AuthMessageKeys;

      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES[code]);

      // 이메일 인증이 필요한 경우만 info로 표시
      if (code === "EMAIL_NOT_VERIFIED") {
        setNoteVariant("info");
      } else {
        setNoteVariant("error");
      }
    }
  }

  return (
    <AuthContainer>
      <AuthBox>
        <LemonTreeLogo />

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
                      placeholder="이메일"
                      autoComplete="email"
                      autoFocus
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
                      placeholder="비밀번호"
                      autoComplete="current-password"
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
              로그인
            </Button>
          </form>
        </Form>

        <div className="flex flex-wrap justify-between gap-4 text-sm text-gray-600">
          <Link to="/forgot-password" className="hover:underline">
            비밀번호 찾기
          </Link>
          <Link to="/sign-up" className="hover:underline">
            회원가입
          </Link>
        </div>
      </AuthBox>

      {isNoteVisible && <Note variant={noteVariant}>{noteContent}</Note>}
    </AuthContainer>
  );
}
