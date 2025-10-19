import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const SignUpFormSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    params: { code: "passwords-do-not-match" },
    path: ["passwordConfirm"],
  });

z.setErrorMap(zodErrorMap);

export type SignUpForm = z.infer<typeof SignUpFormSchema>;
