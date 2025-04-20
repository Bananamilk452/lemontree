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

export class analyzeSentimentQueue extends QueueFactory<Data> {
  constructor() {
    super("analyzeSentiment");
  }

  async process(job: Job<Data>) {
    try {
      logger.info(`Job ${job.name}#${job.id} 감정 분석 진행`);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `다음 일기의 전반적인 감정을 분석해주세요. 답변은 happy, sad, neutral, excited, anxious 중 하나로만 해주세요: ${job.data.content}`,
          },
        ],
      });

      const sentiment = completion.choices[0].message?.content || "neutral";

      const diary = await prisma.diary.update({
        where: { id: job.data.diaryId },
        data: { sentiment },
      });

      return diary;
    } catch (err) {
      throw err;
    }
  }
}
