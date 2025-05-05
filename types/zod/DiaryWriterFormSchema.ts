import { DIARY_MAX_LENGTH } from "~/constants";
import { z } from "zod";

import { zodErrorMap } from "~/lib/messages";

export const DiaryWriterFormSchema = z.object({
  date: z.date(),
  content: z.string().min(1).max(DIARY_MAX_LENGTH),
});

z.setErrorMap(zodErrorMap);

export type DiaryWriterForm = z.infer<typeof DiaryWriterFormSchema>;
