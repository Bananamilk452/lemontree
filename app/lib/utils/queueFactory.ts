import { Job, Queue, Worker } from "bullmq";
import { logger } from "./logger";

export abstract class QueueFactory<Input> {
  private queueName: string;
  private queue;
  private worker;

  constructor(queueName: string) {
    const connection = {
      host: process.env.VALKEY_HOST,
      port: Number(process.env.VALKEY_PORT),
    };

    this.queueName = queueName;
    this.queue = new Queue(queueName, {
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
      logger.info(
        `Job ${job.name}#${job.id} completed with result ${job.returnvalue}`,
      );
    });

    this.worker.on("failed", (job, err) => {
      logger.error(
        `Job ${job?.name}#${job?.id} failed with error ${err.message}`,
      );
    });
  }

  public async addJob(data: Input) {
    const job = await this.queue.add(this.queueName, data);
    return job;
  }

  abstract process(job: Job<Input>): Promise<unknown>;
}
