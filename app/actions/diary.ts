"use server";

import { AVAILABLE_SORTS } from "~/constants";
import { DiaryService } from "~/lib/services";
import { DiaryWriterForm } from "~/types/zod/DiaryWriterFormSchema";
import { getValidSession } from "~/utils/action";

export async function createDiary(
  diaryId: string | undefined,
  data: DiaryWriterForm,
  options: { temp?: boolean } = {},
) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.createDiary(diaryId, data, options);
}

export async function updateDiary(diaryId: string, data: DiaryWriterForm) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.updateDiary(diaryId, data);
}

export async function deleteDiary(diaryId: string) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.deleteDiary(diaryId);
}

export async function processDiary(diaryId: string) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.processDiary(diaryId);
}

export async function getDiaryById(diaryId: string) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.getDiaryById(diaryId);
}

export async function getDiaryByDate(date: Date) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.getDiaryByDate(date);
}

export async function getRecentDiary() {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.getRecentDiary();
}

export async function getDiarys(
  options: Parameters<typeof DiaryService.prototype.getDiarys>[0],
) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.getDiarys(options);
}

export async function getOldestUnmemorizedDiaryByDate(date: Date) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.getOldestUnmemorizedDiaryByDate(date);
}

export async function semanticSearch(
  searchTerm: string,
  options: {
    page: number;
    limit: number;
    sort: string;
  },
) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  if (!AVAILABLE_SORTS.includes(options.sort)) {
    throw new Error(`Invalid sort option: ${options.sort}`);
  }

  return await diaryService.semanticSearch(
    searchTerm,
    options as {
      limit: number;
      page: number;
      sort: "accuracy" | "latest" | "oldest";
    },
  );
}

export async function fullTextSearch(
  searchTerm: string,
  options: {
    page: number;
    limit: number;
    sort: string;
  },
) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  if (!AVAILABLE_SORTS.includes(options.sort)) {
    throw new Error(`Invalid sort option: ${options.sort}`);
  }

  return await diaryService.fullTextSearch(
    searchTerm,
    options as {
      limit: number;
      page: number;
      sort: "accuracy" | "latest" | "oldest";
    },
  );
}

export async function updateSentiment(diaryId: string, sentiment: number) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.updateSentiment(diaryId, sentiment);
}

export async function getSentimentByDate(options: {
  limit: number;
  page: number;
}) {
  const session = await getValidSession();
  const diaryService = new DiaryService({ userId: session.user.id });

  return await diaryService.getSentiment(options);
}
