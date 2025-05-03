import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const DiaryWriterFormSchema = z.object({
  date: z.date(),
  content: z.string().min(1).max(5000),
});

z.setErrorMap(zodErrorMap);

export type DiaryWriterForm = z.infer<typeof DiaryWriterFormSchema>;
