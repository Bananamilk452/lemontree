import { revalidatePath } from "next/cache";

import { diary } from "~/lib/models/diary";
import {
  DiaryWriterForm,
  DiaryWriterFormSchema,
} from "~/types/zod/DiaryWriterFormSchema";
import { removeTimeFromDate } from "~/utils";
import { PermissionError, ValidationError } from "~/utils/error";

interface DiaryServiceDeps {
  userId: string;
}

export class DiaryService {
  private userId: string;

  constructor({ userId }: DiaryServiceDeps) {
    this.userId = userId;
  }

  private async checkOwnership(diaryId: string): Promise<void> {
    const isOwner = await diary.isOwner(diaryId, this.userId);
    if (!isOwner) {
      throw new PermissionError();
    }
  }

  private validateDiaryData(data: DiaryWriterForm) {
    const validatedFields = DiaryWriterFormSchema.safeParse(data);

    if (!validatedFields.success) {
      throw new ValidationError();
    }

    return validatedFields.data;
  }

  private revalidatePages() {
    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/diary/list/[page]", "page");
  }

  async createDiary(
    diaryId: string | undefined,
    data: DiaryWriterForm,
    options: { temp?: boolean } = {},
  ) {
    if (diaryId) {
      await this.checkOwnership(diaryId);
    }

    const validatedData = this.validateDiaryData(data);

    // 시간 정보 제거
    const dateWithoutTime = removeTimeFromDate(validatedData.date);

    const diaryData = {
      ...validatedData,
      date: dateWithoutTime,
    };

    let result;
    if (options.temp) {
      result = await diary.tempSaveDiary(diaryId, this.userId, diaryData);
    } else {
      result = await diary.createDiary(diaryId, this.userId, diaryData);
    }

    this.revalidatePages();
    return result;
  }

  async updateDiary(diaryId: string, data: DiaryWriterForm) {
    await this.checkOwnership(diaryId);

    const validatedData = this.validateDiaryData(data);
    const { date, content } = validatedData;

    // 시간 정보 제거
    const dateWithoutTime = removeTimeFromDate(date);

    const result = await diary.updateDiary(diaryId, this.userId, {
      content,
      date: dateWithoutTime,
    });

    this.revalidatePages();
    return result;
  }

  async deleteDiary(diaryId: string) {
    await this.checkOwnership(diaryId);

    await diary.deleteDiary(diaryId, this.userId);

    this.revalidatePages();
  }

  async processDiary(diaryId: string) {
    await this.checkOwnership(diaryId);

    const result = await diary.processDiary(diaryId, this.userId);

    this.revalidatePages();
    return result;
  }

  async getDiaryById(diaryId: string) {
    const diaryData = await diary.getDiaryById(diaryId, this.userId);

    if (!diaryData) {
      return null;
    }

    return diaryData;
  }

  async getDiaryByDate(date: Date) {
    const diaryData = await diary.getDiaryByDate(date, this.userId);

    if (!diaryData) {
      return null;
    }

    return diaryData;
  }

  async getRecentDiary() {
    const diaryData = await diary.getRecentDiary(this.userId);

    if (!diaryData) {
      return null;
    }

    return diaryData;
  }

  async getDiarys(options: { limit: number; page: number }) {
    const { limit, page } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    const data = await diary.getDiarys(this.userId, { take, skip });

    if (!data) {
      return { diarys: [], total: 0 };
    }

    return data;
  }

  async getOldestUnmemorizedDiaryByDate(date: Date) {
    return await diary.getOldestUnmemorizedDiaryByDate(this.userId, date);
  }

  async semanticSearch(
    searchTerm: string,
    options: {
      limit: number;
      page: number;
      sort: "accuracy" | "latest" | "oldest";
    },
  ) {
    const { limit, page, sort } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    return await diary.semanticSearch(this.userId, searchTerm, {
      take,
      skip,
      sort,
    });
  }

  async fullTextSearch(
    searchTerm: string,
    options: {
      limit: number;
      page: number;
      sort: "accuracy" | "latest" | "oldest";
    },
  ) {
    const { limit, page, sort } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    return await diary.fullTextSearch(this.userId, searchTerm, {
      take,
      skip,
      sort,
    });
  }

  async updateSentiment(diaryId: string, sentiment: number) {
    await this.checkOwnership(diaryId);

    const result = await diary.updateSentiment(this.userId, diaryId, sentiment);

    this.revalidatePages();
    return result;
  }

  async getSentiment(options: { limit: number; page: number }) {
    const { limit, page } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    return await diary.getSentiment(this.userId, { take, skip });
  }

  async deleteAllDiaries() {
    await diary.deleteAllDiaries(this.userId);
  }
}
