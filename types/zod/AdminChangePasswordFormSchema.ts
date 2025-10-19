import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const AdminChangePasswordFormSchema = z
  .object({
    password: z.string().min(6),
    passwordConfirm: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    params: { code: "passwords-do-not-match" },
    path: ["passwordConfirm"],
  });

z.setErrorMap(zodErrorMap);

export type AdminChangePasswordForm = z.infer<
  typeof AdminChangePasswordFormSchema
>;
