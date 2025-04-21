import { z } from "zod";

export const DiaryWriterFormSchema = z.object({
  date: z.date(),
  content: z.string().min(1),
});

export type DiaryWriterForm = z.infer<typeof DiaryWriterFormSchema>;
