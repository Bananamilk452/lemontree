import { Job, Queue, Worker } from "bullmq";

import { logger } from "~/utils/logger";

import type { JobsOptions } from "bullmq";

export interface QueueHandler<Input> {
  addJob: (data: Input, options?: JobsOptions) => Promise<Job>;
  process: (job: Job<Input>) => Promise<unknown>;
}

// 활성 큐들을 저장할 맵
const activeQueues = new Map<string, Queue>();
const activeWorkers = new Map<string, Worker>();

// 애플리케이션 종료 시 모든 큐와 워커를 정리
function cleanupQueuesAndWorkers() {
  console.log(
    `Cleaning up queues and workers... Queues: ${activeQueues.size}, Workers: ${activeWorkers.size}`,
  );
  for (const [, queue] of activeQueues) {
    queue.close();
  }
  for (const [, worker] of activeWorkers) {
    worker.removeAllListeners();
    worker.close();
  }
  activeQueues.clear();
  activeWorkers.clear();
}

// Node 프로세스가 종료될 때 정리
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
  process.on(signal, () => {
    cleanupQueuesAndWorkers();
    process.exit(0);
  });
});

export function createQueue<Input>(
  queueName: string,
  processHandler: (job: Job<Input>) => Promise<unknown>,
): QueueHandler<Input> {
  if (activeQueues.has(queueName)) {
    const existingQueue = activeQueues.get(queueName)!;

    return {
      addJob: async (data: Input, options?: JobsOptions) => {
        return existingQueue.add(queueName, data, options);
      },
      process: processHandler,
    };
  }

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
      `Job ${job.name}#${job.id}이 완료되었습니다. 값: ${returnvalue}`,
    );
  });

  worker.on("failed", (job, err) => {
    logger.error(
      `Job ${job?.name}#${job?.id}이 실패했습니다. 에러: ${err.message}`,
    );
  });

  activeQueues.set(queueName, queue);
  activeWorkers.set(queueName, worker);

  return {
    addJob: async (data: Input, options?: JobsOptions) => {
      return queue.add(queueName, data, options);
    },
    process: processHandler,
  };
}
