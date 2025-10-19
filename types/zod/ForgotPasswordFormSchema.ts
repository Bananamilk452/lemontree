import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const ForgotPasswordFormSchema = z.object({
  email: z.string().email(),
});

z.setErrorMap(zodErrorMap);

export type ForgotPasswordForm = z.infer<typeof ForgotPasswordFormSchema>;
