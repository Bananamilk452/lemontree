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
import type { Route } from "./+types/sign-in";
import { useNavigate } from "react-router";
import { Spinner } from "~/components/Spinner";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

export async function loader({ request }: Route.LoaderArgs) {
  return redirectIfAuthenticated(request, "/");
}

export default function SignIn() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">로그인</h1>

        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              로그인
              {form.formState.isSubmitting && <Spinner />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
