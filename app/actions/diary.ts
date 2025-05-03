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
    const data = await diary.tempSaveDiary({
      content,
      date: dateWithoutTime,
    });

    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");

    return {
      success: true,
      data,
    };
  } else {
    const data = await diary.createDiary({
      content,
      date: dateWithoutTime,
    });
    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");
    return {
      success: true,
      data,
    };
  }
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

  const result = await diary.updateDiary(id, {
    content,
    date: dateWithoutTime,
  });

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return {
    success: true,
    result,
  };
}

export async function deleteDiary(id: string) {
  await diary.deleteDiary(id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return {
    success: true,
  };
}

export async function processDiary(id: string) {
  const data = await diary.processDiary(id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return {
    success: true,
    data,
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

export async function getDiarys(
  options: Parameters<typeof diary.getDiarys>[0],
) {
  const data = await diary.getDiarys(options);

  if (!data) {
    return { diarys: [], total: 0 };
  }

  return data;
}
