import { Job, Queue, Worker } from "bullmq";

import { logger } from "~/utils/logger";

import type { JobsOptions } from "bullmq";

export abstract class QueueFactory<Input> {
  private queueName: string;
  queue;
  worker;

  constructor(queueName: string) {
    const connection = {
      host: process.env.VALKEY_HOST,
      port: Number(process.env.VALKEY_PORT),
    };

    this.queueName = queueName;
    this.queue = new Queue<Job<Input>, unknown>(queueName, {
      connection,
    });
    this.worker = new Worker(queueName, this.process.bind(this), {
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

    this.worker.on("completed", (job) => {
      let returnvalue = job.returnvalue;

      if (typeof returnvalue === "object" || Array.isArray(returnvalue)) {
        returnvalue = JSON.stringify(job.returnvalue, null, 2);
      }

      logger.info(
        `Job ${job.name}#${job.id} completed with result ${returnvalue}`,
      );
    });

    this.worker.on("failed", (job, err) => {
      logger.error(
        `Job ${job?.name}#${job?.id} failed with error ${err.message}`,
      );
    });
  }

  public async addJob(data: Input, options?: JobsOptions) {
    const job = await this.queue.add(this.queueName, data, options);
    return job;
  }

  abstract process(job: Job<Input>): Promise<unknown>;
}
