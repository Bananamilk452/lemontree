"use server";

import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { revalidatePath } from "next/cache";

import { diary } from "~/lib/models/diary";

export async function createDiary(
  data: DiaryWriterForm,
  options: { temp?: boolean } = {},
) {
  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { date, content } = validatedFields.data;

  if (options.temp) {
    await diary.tempSaveDiary({
      content,
      date,
    });
  } else {
    await diary.createDiary({
      content,
      date,
    });
  }

  revalidatePath("/home");

  return {
    success: true,
  };
}
