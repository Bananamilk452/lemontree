import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const DeleteUserFormSchema = z.object({
  removeData: z.boolean().default(false),
});

z.setErrorMap(zodErrorMap);

export type DeleteUserForm = z.infer<typeof DeleteUserFormSchema>;
