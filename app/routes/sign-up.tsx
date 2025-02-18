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

const formSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request, "/");
}

export default function SignUp() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/sign-in",
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">회원가입</h1>

        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
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
                  <FormLabel>패스워드</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="패스워드"
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
                  <FormLabel>패스워드 확인</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="패스워드 확인"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              회원가입
              {form.formState.isSubmitting && <Spinner />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
