import { z } from "zod";

import { ZOD_MESSAGES } from "~/lib/messages";

export const DiaryWriterFormSchema = z.object({
  date: z.date({ required_error: ZOD_MESSAGES.REQUIRED }),
  content: z.string().min(1, ZOD_MESSAGES.REQUIRED),
});

export type DiaryWriterForm = z.infer<typeof DiaryWriterFormSchema>;
