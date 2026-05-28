import { Queue } from "bullmq";
import { redis } from "../config/redis";

export interface GenerationJobData {
  assignmentId: string;
}

export const assignmentQueue = new Queue<GenerationJobData>(
  "assignment-generation",
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: "fixed", delay: 3000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 20 },
    },
  }
);

assignmentQueue.on("error", (err) => {
  if (!err.message.includes("ECONNRESET")) {
    console.error("❌ Queue error:", err.message);
  }
});

// Test queue connection
assignmentQueue.waitUntilReady().then(() => {
  console.log("✅ BullMQ Queue ready");
}).catch(err => {
  console.error("❌ Queue not ready:", err.message);
});