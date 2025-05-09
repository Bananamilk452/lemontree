import { MEMORY_MAX_LENGTH } from "~/constants";
import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const EditMemoryModalFormSchema = z.object({
  content: z.string().min(1).max(MEMORY_MAX_LENGTH),
});

z.setErrorMap(zodErrorMap);

export type EditMemoryModalForm = z.infer<typeof EditMemoryModalFormSchema>;
