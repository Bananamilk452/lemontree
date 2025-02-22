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

export class createEmbeddingQueue extends QueueFactory<Data> {
  constructor() {
    super("createEmbedding");
  }

  async process(job: Job<Data>) {
    try {
      logger.info(`Job ${job.name}#${job.id} 임베딩 생성 진행`);

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: job.data.content,
      });

      const embedding = response.data[0].embedding;

      const diary = await prisma.$executeRaw`
        UPDATE "Diary"
        SET embedding = ${embedding}
        WHERE id = ${job.data.diaryId}
        RETURNING *
      `;

      return diary;
    } catch (err) {
      throw err;
    }
  }
}
