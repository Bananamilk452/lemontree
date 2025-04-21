"use server";

import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { revalidatePath } from "next/cache";

import { diary } from "~/lib/models/diary";

export default async function createDiary(data: DiaryWriterForm) {
  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { date, content } = validatedFields.data;

  await diary.createDiary({
    content,
    date,
  });

  revalidatePath("/home");

  return {
    success: true,
  };
}
