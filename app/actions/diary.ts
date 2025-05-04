"use server";

import { removeTimeFromDate } from "~/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { diary } from "~/lib/models/diary";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";

export async function createDiary(
  diaryId: string | undefined,
  data: DiaryWriterForm,
  options: { temp?: boolean } = {},
) {
  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Validation failed", {
      cause: validatedFields.error.flatten().fieldErrors,
    });
  }

  const { date, content } = validatedFields.data;

  const { user } = (await auth.api.getSession({
    headers: await headers(),
  }))!;

  // 시간 정보 제거
  const dateWithoutTime = removeTimeFromDate(date);

  const diaryData = {
    content,
    date: dateWithoutTime,
    userId: user.id,
  };

  if (options.temp) {
    const data = await diary.tempSaveDiary(diaryId, diaryData);

    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");

    return data;
  } else {
    const data = await diary.createDiary(diaryId, diaryData);
    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");
    return data;
  }
}

export async function updateDiary(id: string, data: DiaryWriterForm) {
  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Validation failed", {
      cause: validatedFields.error.flatten().fieldErrors,
    });
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

  return result;
}

export async function deleteDiary(id: string) {
  const { user } = (await auth.api.getSession({
    headers: await headers(),
  }))!;

  const targetDiary = await diary.getDiaryById(id);

  if (!targetDiary) {
    throw new Error("Diary not found");
  }

  if (targetDiary.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  await diary.deleteDiary(id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return;
}

export async function processDiary(id: string) {
  const data = await diary.processDiary(id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return data;
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

export async function getUnmemorizedOldestDiaryByDate(date: Date) {
  const data = await diary.getUnmemorizedOldestDiaryByDate(date);

  return data;
}
