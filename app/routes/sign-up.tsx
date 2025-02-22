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
import { Link } from "react-router";
import { useState } from "react";
import { Note } from "~/components/ui/note";
import type { ComponentVariant } from "~/lib/utils";
import {
  AUTH_MESSAGES,
  ZOD_MESSAGES,
  type AuthMessageKeys,
} from "~/lib/messages";
import { AuthContainer } from "~/components/auth/AuthContainer";
import { AuthBox, AuthBoxTitle } from "~/components/auth/AuthBox";

const formSchema = z
  .object({
    name: z.string({ required_error: ZOD_MESSAGES.REQUIRED }).nonempty(),
    email: z
      .string({ required_error: ZOD_MESSAGES.REQUIRED })
      .email(ZOD_MESSAGES.INVALID_EMAIL),
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

export default function SignUp() {
  const [noteContent, setNoteContent] = useState<string>("");
  const [noteVariant, setNoteVariant] =
    useState<ComponentVariant<typeof Note>>();
  const [isNoteVisible, setIsNoteVisible] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsNoteVisible(false);

    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/sign-in",
    });

    if (error?.code) {
      const code = error.code as AuthMessageKeys;
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES[code]);
      setNoteVariant("error");
    } else {
      setIsNoteVisible(true);
      setNoteContent(AUTH_MESSAGES.SIGN_UP_SUCCESS);
      setNoteVariant("success");
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
          <Link to="/forgot-password" className="hover:underline">
            비밀번호 찾기
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
