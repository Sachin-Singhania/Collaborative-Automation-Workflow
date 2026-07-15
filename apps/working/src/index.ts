import { prisma } from "@repo/database";
import "dotenv/config";
import { createClient, ErrorReply } from 'redis';
import { QUEUE_NAME, sample } from "./const";
import { workerProcess } from "./worker";

export const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`🔄 Reconnecting to Redis... Attempt #${retries}`);
      return Math.min(retries * 50, 5000);
    },
  },
});
redis.on('error', (err: ErrorReply) => console.error('Redis Client Error', err));
async function RedisWorker() {
  await redis.connect();
  console.log("✅ Redis client connected successfully");
  console.log(`🚀 Worker is running and waiting for tasks from "${QUEUE_NAME}"...`);
  while (true) {
    try {
      const result = await redis.brPop(QUEUE_NAME, 0);
      const task = result?.element;
      if (!task) {
        console.log('No task available in the queue');
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      const obj: sample = JSON.parse(task);
      console.log(obj);
      workerProcess(obj).then(async () => {
        await prisma.executions.update({
          where: {
            id: obj.executionid
          }, data: {
            status: "COMPLETED", completedAt: new Date()
          }
        });
      }).catch(async () => {
        await prisma.executions.update({
          where: {
            id: obj.executionid
          }, data: {
            status: "FAILED", completedAt: new Date()
          }
        });
      })

    } catch (err) {
      console.error('❌ Error processing task:', err);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
async function loopwoker() {
  while (true) {
    try {

      const pending = await prisma.executions.findMany({
        where: {
          status: "PENDING",
        },
        take: 100,
      });

      for (const execution of pending) {
        await redis.lPush(QUEUE_NAME, execution.id);

        await prisma.executions.update({
          where: { id: execution.id },
          data: {
            status: "QUEUED",
          },
        });
      }

    } catch (error) {
      console.log(error)
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
async function start() {
  await Promise.all([
    loopwoker(),
    RedisWorker(),
  ]);
}

start().catch(console.error);