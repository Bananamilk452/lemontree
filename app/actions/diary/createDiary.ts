"use server";

import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { revalidatePath } from "next/cache";

import { DiaryService } from "~/lib/models/diary";

import { singleton } from "~/utils/singleton";

export default async function createDiary(data: DiaryWriterForm) {
  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { date, content } = validatedFields.data;
  const diaryService = singleton("DiaryService", () => new DiaryService());

  await diaryService.createDiary({
    content,
    date,
  });

  revalidatePath("/");

  return {
    success: true,
  };
}
