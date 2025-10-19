import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const CreateUserFormSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    passwordConfirm: z.string().min(1),
    role: z.enum(["user", "admin"]),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    params: { code: "passwords-do-not-match" },
    path: ["passwordConfirm"],
  });

z.setErrorMap(zodErrorMap);

export type CreateUserForm = z.infer<typeof CreateUserFormSchema>;
