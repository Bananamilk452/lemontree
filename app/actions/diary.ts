"use server";

import { removeTimeFromDate } from "~/utils";
import { revalidatePath } from "next/cache";

import { diary } from "~/lib/models/diary";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { getValidSession } from "~/utils/action";

async function checkDiaryOwner(diaryId: string, userId: string) {
  const d = await diary.isOwner(diaryId, userId);
  if (!d) {
    throw new Error("이 일기에 대한 권한이 없습니다");
  }
}

export async function createDiary(
  diaryId: string | undefined,
  data: DiaryWriterForm,
  options: { temp?: boolean } = {},
) {
  const session = await getValidSession();
  if (diaryId) {
    await checkDiaryOwner(diaryId, session.user.id);
  }

  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Validation failed", {
      cause: validatedFields.error.flatten().fieldErrors,
    });
  }

  const { date, content } = validatedFields.data;

  // 시간 정보 제거
  const dateWithoutTime = removeTimeFromDate(date);

  const diaryData = {
    content,
    date: dateWithoutTime,
  };

  if (options.temp) {
    const data = await diary.tempSaveDiary(diaryId, session.user.id, diaryData);

    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");

    return data;
  } else {
    const data = await diary.createDiary(diaryId, session.user.id, diaryData);
    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");
    return data;
  }
}

export async function updateDiary(diaryId: string, data: DiaryWriterForm) {
  const session = await getValidSession();
  if (diaryId) {
    await checkDiaryOwner(diaryId, session.user.id);
  }

  const validatedFields = DiaryWriterFormSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Validation failed", {
      cause: validatedFields.error.flatten().fieldErrors,
    });
  }

  const { date, content } = validatedFields.data;

  // 시간 정보 제거
  const dateWithoutTime = removeTimeFromDate(date);

  const result = await diary.updateDiary(diaryId, session.user.id, {
    content,
    date: dateWithoutTime,
  });

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return result;
}

export async function deleteDiary(diaryId: string) {
  const session = await getValidSession();
  await checkDiaryOwner(diaryId, session.user.id);

  await diary.deleteDiary(diaryId, session.user.id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return;
}

export async function processDiary(diaryId: string) {
  const session = await getValidSession();
  await checkDiaryOwner(diaryId, session.user.id);

  const data = await diary.processDiary(diaryId, session.user.id);

  revalidatePath("/home");
  revalidatePath("/new");
  revalidatePath("/list/[page]", "page");

  return data;
}

export async function getDiaryById(diaryId: string) {
  const session = await getValidSession();

  const data = await diary.getDiaryById(diaryId, session.user.id);

  if (!data) {
    return null;
  }

  return data;
}

export async function getDiaryByDate(date: Date) {
  const session = await getValidSession();

  const data = await diary.getDiaryByDate(date, session.user.id);

  if (!data) {
    return null;
  }

  return data;
}

export async function getRecentDiary() {
  const session = await getValidSession();

  const data = await diary.getRecentDiary(session.user.id);

  if (!data) {
    return null;
  }

  return data;
}

export async function getDiarys(
  options: Parameters<typeof diary.getDiarys>[1],
) {
  const session = await getValidSession();

  const data = await diary.getDiarys(session.user.id, options);

  if (!data) {
    return { diarys: [], total: 0 };
  }

  return data;
}

export async function getOldestUnmemorizedDiaryByDate(date: Date) {
  const session = await getValidSession();

  const data = await diary.getOldestUnmemorizedDiaryByDate(
    session.user.id,
    date,
  );

  return data;
}
