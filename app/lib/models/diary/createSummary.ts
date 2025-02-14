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

export class createSummaryQueue extends QueueFactory<Data> {
  constructor() {
    super("createSummary");
  }

  async process(job: Job<Data>) {
    try {
      logger.info(`Job ${job.name}#${job.id} 요약 진행`);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `다음 일기를 1~2문장으로 요약해주세요: ${job.data.content}`,
          },
        ],
      });

      const summary = completion.choices[0].message?.content;

      if (!summary) {
        throw new Error("요약 생성에 실패했습니다.");
      }

      const diary = await prisma.diary.update({
        where: { id: job.data.diaryId },
        data: {
          summary,
        },
      });

      return diary;
    } catch (err) {
      throw err;
    }
  }
}
