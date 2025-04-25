"use server";

import { removeTimeFromDate } from "~/utils";
import { revalidatePath } from "next/cache";

import { diary } from "~/lib/models/diary";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";

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

  // 시간 정보 제거
  const dateWithoutTime = removeTimeFromDate(date);

  if (options.temp) {
    await diary.tempSaveDiary({
      content,
      date: dateWithoutTime,
    });
  } else {
    await diary.createDiary({
      content,
      date: dateWithoutTime,
    });
  }

  // TODO: 일기 목록 페이지 만들면 그걸로 변경하기
  // revalidatePath("/home");

  return {
    success: true,
  };
}

export async function updateDiary(id: string, data: DiaryWriterForm) {
  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { date, content } = validatedFields.data;

  // 시간 정보 제거
  const dateWithoutTime = removeTimeFromDate(date);

  await diary.updateDiary(id, {
    content,
    date: dateWithoutTime,
  });

  // TODO: 일기 목록 페이지 만들면 그걸로 변경하기
  // revalidatePath("/home");

  return {
    success: true,
  };
}

export async function getDiaryById(id: string) {
  const data = await diary.getDiaryById(id);

  if (!data) {
    return null;
  }

  return data;
}

export async function getDiaryByDate(date: Date) {
  const data = await diary.getDiaryByDate(date);

  if (!data) {
    return null;
  }

  return data;
}

export async function getRecentDiary() {
  const data = await diary.getRecentDiary();

  if (!data) {
    return null;
  }

  return data;
}
