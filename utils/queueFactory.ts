import { Job, Queue, Worker } from "bullmq";

import { logger } from "~/utils/logger";

import type { JobsOptions } from "bullmq";

export interface QueueHandler<Input> {
  addJob: (data: Input, options?: JobsOptions) => Promise<Job>;
  process: (job: Job<Input>) => Promise<unknown>;
}

export function createQueue<Input>(
  queueName: string,
  processHandler: (job: Job<Input>) => Promise<unknown>,
): QueueHandler<Input> {
  const connection = {
    host: process.env.VALKEY_HOST,
    port: Number(process.env.VALKEY_PORT),
  };

  const queue = new Queue<Job<Input>, unknown>(queueName, {
    connection,
  });

  const worker = new Worker(queueName, processHandler, {
    connection,
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 3600,
      count: 1000,
    },
  });

  worker.on("completed", (job) => {
    let returnvalue = job.returnvalue;
    if (typeof returnvalue === "object" || Array.isArray(returnvalue)) {
      returnvalue = JSON.stringify(job.returnvalue, null, 2);
    }
    logger.info(
      `Job ${job.name}#${job.id} completed with result ${returnvalue}`,
    );
  });

  worker.on("failed", (job, err) => {
    logger.error(
      `Job ${job?.name}#${job?.id} failed with error ${err.message}`,
    );
  });

  return {
    addJob: async (data: Input, options?: JobsOptions) => {
      return queue.add(queueName, data, options);
    },
    process: processHandler,
  };
}
