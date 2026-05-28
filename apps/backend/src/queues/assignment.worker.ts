import "dotenv/config";
import { env } from "../config/env";
import { Worker, type Job } from "bullmq";
import { connectDB } from "../config/db";
import { redis } from "../config/redis";
import { Assignment } from "../models/Assignment";
import { QuestionPaper } from "../models/QuestionPaper";
import { generateQuestionPaper } from "../services/ai.service";
import { cachePaper } from "../services/cache.service";
import type { GenerationJobData } from "./assignment.queue";

// ── WebSocket notify (optional) ───────────────────────────────────────────────
let notifyFn: ((payload: unknown) => void) | null = null;
try {
  const ws = require("../websocket/ws.server");
  notifyFn = ws.notifyAssignment;
} catch {
  console.log("WS not available in worker");
}

function notify(payload: {
  type: string;
  assignmentId: string;
  jobId?: string;
  paperId?: string;
  progress?: number;
  message?: string;
  error?: string;
}) {
  console.log(
    `📡 [${payload.type}] assignment=${payload.assignmentId} progress=${payload.progress ?? "-"} ${payload.message ?? ""}`
  );
  try { notifyFn?.(payload); } catch { /* ignore */ }
}

// ── Core processing logic ─────────────────────────────────────────────────────
async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`\n⚙️  Processing job ${job.id} for assignment ${assignmentId}`);

  notify({
    type: "job:processing",
    assignmentId,
    jobId: job.id,
    progress: 10,
    message: "Starting AI generation...",
  });

  // 1. Fetch assignment from MongoDB
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  // 2. Mark as processing
  await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });

  notify({
    type: "job:progress",
    assignmentId,
    jobId: job.id,
    progress: 35,
    message: "Calling Gemini AI...",
  });

  // 3. Generate via Gemini AI
  const parsed = await generateQuestionPaper(assignment);
  console.log(
    `✅ AI done: ${parsed.totalQuestions} questions in ${parsed.sections.length} sections`
  );

  notify({
    type: "job:progress",
    assignmentId,
    jobId: job.id,
    progress: 75,
    message: "Saving question paper to database...",
  });

  // 4. Save paper to MongoDB
  const paper = await QuestionPaper.create({
    assignmentId: assignment._id,
    title: parsed.title,
    subject: assignment.subject,
    grade: assignment.grade,
    topic: assignment.topic,
    dueDate: assignment.dueDate,
    sections: parsed.sections,
    totalMarks: parsed.totalMarks,
    totalQuestions: parsed.totalQuestions,
    duration: parsed.duration,
    generalInstructions: parsed.generalInstructions,
  });

  console.log(`✅ Paper saved to MongoDB: ${paper._id}`);

  // 5. Update assignment status to completed
  await Assignment.findByIdAndUpdate(assignmentId, {
    status: "completed",
    paperId: paper._id,
  });

  // 6. Try Redis cache — ignore if it fails
  try {
    await cachePaper(paper._id.toString(), paper.toObject());
    console.log(`✅ Paper cached in Redis`);
  } catch (cacheErr) {
    console.log(`⚠️  Redis cache failed (ignoring):`, cacheErr instanceof Error ? cacheErr.message : "unknown");
  }

  // 7. Notify frontend via WebSocket
  notify({
    type: "job:completed",
    assignmentId,
    jobId: job.id,
    paperId: paper._id.toString(),
    progress: 100,
    message: "Question paper generated successfully!",
  });

  console.log(`\n🎉 Job ${job.id} COMPLETED! Paper ID: ${paper._id}\n`);
}

// ── Start Worker ──────────────────────────────────────────────────────────────
async function startWorker(): Promise<void> {
  console.log("🔧 Connecting to MongoDB...");
  await connectDB();
  console.log("🔧 Starting BullMQ Worker...");

const worker = new Worker<GenerationJobData>(
  "assignment-generation",
  processJob,
  {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: env.REDIS_URL.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
    } as never,
    concurrency: 1,
  }
);

  worker.on("active", (job) => {
    console.log(`🟡 Job ${job.id} picked up by worker`);
  });

  worker.on("completed", (job) => {
    console.log(`✅ Worker confirmed job ${job.id} completed`);
  });

  worker.on("failed", async (job, err) => {
    console.error(`❌ Job ${job?.id} FAILED:`, err.message);
    if (job?.data.assignmentId) {
      await Assignment.findByIdAndUpdate(
        job.data.assignmentId,
        { status: "failed" }
      ).catch(console.error);

      notify({
        type: "job:failed",
        assignmentId: job.data.assignmentId,
        jobId: job.id,
        error: err.message,
        message: "Generation failed. Please try again.",
      });
    }
  });

  worker.on("error", (err) => {
    // Ignore Redis connection noise
    if (
      !err.message.includes("ECONNRESET") &&
      !err.message.includes("Command timed out") &&
      !err.message.includes("MaxRetries")
    ) {
      console.error("❌ Worker error:", err.message);
    }
  });

  console.log("✅ BullMQ Worker RUNNING and listening for jobs...");

  // ── DB Polling Fallback ───────────────────────────────────────────────────
  // Agar BullMQ Redis se job na le sake toh MongoDB se directly pick karo
 // Ye interval replace karo — processing stuck assignments bhi pick karo:
const processing = new Set<string>();

setInterval(async () => {
  try {
    // ✅ pending AUR stuck processing dono pick karo
    const pendingAssignments = await Assignment.find({
      status: { $in: ["pending"] },
      paperId: { $exists: false },
    })
      .sort({ createdAt: 1 })
      .limit(2);

    for (const assignment of pendingAssignments) {
      const id = assignment._id.toString();
      if (processing.has(id)) continue;
      processing.add(id);

      console.log(`\n🔄 DB Fallback: Picked up assignment ${id}`);

      processJob({
        id: `fallback-${id}-${Date.now()}`,
        data: { assignmentId: id },
      } as Job<GenerationJobData>)
        .then(() => { processing.delete(id); })
        .catch(async (err: Error) => {
          processing.delete(id);
          console.error(`❌ DB Fallback FAILED for ${id}:`, err.message);
          await Assignment.findByIdAndUpdate(id, { status: "failed" }).catch(console.error);
        });
    }
  } catch { /* ignore */ }
}, 5000); // 5 seconds // har 8 second mein check

  console.log("✅ DB Polling Fallback started (checks every 8s)\n");
}

// ── Entry point ───────────────────────────────────────────────────────────────
startWorker().catch((err) => {
  console.error("❌ Worker startup failed:", err);
  process.exit(1);
});