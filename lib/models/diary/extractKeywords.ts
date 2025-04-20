import type { Job } from "bullmq";
import OpenAI from "openai";

import { prisma } from "~/lib/utils/db.server";
import { logger } from "~/lib/utils/logger";
import { QueueFactory } from "~/lib/utils/queueFactory";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Data {
  diaryId: string;
  content: string;
}

export class extractKeywordsQueue extends QueueFactory<Data> {
  constructor() {
    super("extractKeywords");
  }

  async process(job: Job<Data>) {
    try {
      logger.info(`Job ${job.name}#${job.id} 키워드 추출 진행`);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `다음 일기에서 주요 키워드 최대 5개를 추출해주세요. 키워드는 쉼표로 구별되게 작성해주세요.: ${job.data.content}`,
          },
        ],
      });

      const content = completion.choices[0].message?.content;

      if (!content) {
        throw new Error("키워드 추출 실패");
      }

      const keywords = content.split(",").map((k) => k.trim());

      const diary = await prisma.diary.update({
        where: { id: job.data.diaryId },
        data: { keywords },
      });

      return diary;
    } catch (err) {
      throw err;
    }
  }
}
