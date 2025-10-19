import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    params: { code: "passwords-do-not-match" },
    path: ["passwordConfirm"],
  });

z.setErrorMap(zodErrorMap);

export type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>;
