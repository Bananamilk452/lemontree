import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const SignInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

z.setErrorMap(zodErrorMap);

export type SignInForm = z.infer<typeof SignInFormSchema>;
