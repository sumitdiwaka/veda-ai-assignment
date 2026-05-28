import { Queue } from "bullmq";
import { env } from "../config/env";

export interface GenerationJobData {
  assignmentId: string;
}

const redisConnection = {
  host: "",
  port: 6379,
  // Use URL directly
};

export const assignmentQueue = new Queue<GenerationJobData>(
  "assignment-generation",
  {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: env.REDIS_URL.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
    } as never,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: "fixed", delay: 3000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 20 },
    },
  }
);

assignmentQueue.on("error", (err: Error) => {
  if (!err.message.includes("ECONNRESET") &&
      !err.message.includes("Command timed out") &&
      !err.message.includes("MaxRetries")) {
    console.error("❌ Queue error:", err.message);
  }
});

assignmentQueue.waitUntilReady()
  .then(() => console.log("✅ BullMQ Queue ready"))
  .catch(() => console.log("⚠️  BullMQ Queue not ready — DB fallback will handle jobs"));