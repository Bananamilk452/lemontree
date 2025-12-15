import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const UserChangeNameFormSchema = z.object({
  name: z.string().min(1),
});

z.setErrorMap(zodErrorMap);

export type UserChangeNameForm = z.infer<typeof UserChangeNameFormSchema>;
