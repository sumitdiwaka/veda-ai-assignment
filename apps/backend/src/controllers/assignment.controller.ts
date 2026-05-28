import type { Request, Response } from "express";
import { Assignment } from "../models/Assignment";
import { assignmentQueue } from "../queues/assignment.queue";
import { getJobStatus } from "../services/cache.service";
import { QuestionPaper } from "../models/QuestionPaper";

export async function createAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const file = req.file;
    const questionConfigs = req.body.questionConfigs;

    const totalMarks = questionConfigs.reduce(
      (sum: number, c: { count: number; marksPerQuestion: number }) =>
        sum + Number(c.count) * Number(c.marksPerQuestion),
      0
    );
    const totalQuestions = questionConfigs.reduce(
      (sum: number, c: { count: number }) => sum + Number(c.count),
      0
    );

    const assignment = await Assignment.create({
      ...req.body,
      dueDate: new Date(req.body.dueDate),
      totalMarks,
      totalQuestions,
      filePath: file?.path,
      fileName: file?.originalname,
      status: "pending",
    });

    console.log(`✅ Assignment created: ${assignment._id}`);

    let jobId: string | undefined;
    try {
      const job = await assignmentQueue.add(
        "generate-paper",
        { assignmentId: assignment._id.toString() },
        { jobId: `assignment-${assignment._id}` }
      );
      jobId = job.id;
      await assignment.updateOne({ jobId: job.id });
      console.log(`✅ Job queued: ${job.id}`);
    } catch (queueErr: unknown) {
      const msg = queueErr instanceof Error ? queueErr.message : "unknown";
      console.error("❌ Queue add failed (DB fallback will handle):", msg);
    }

    res.status(201).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        jobId: jobId || `fallback-${assignment._id}`,
        status: "pending",
        message: "Assignment created. Generation queued.",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ createAssignment error:", msg);
    res.status(500).json({ success: false, error: msg });
  }
}

export async function getAssignments(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select("-__v")
      .populate("paperId", "title totalMarks totalQuestions");
    res.json({ success: true, data: assignments });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch" });
  }
}

export async function getAssignmentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const assignment = await Assignment.findById(id)
      .select("-__v")
      .populate("paperId");

    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    res.json({ success: true, data: assignment });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch" });
  }
}

export async function getJobStatusById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const jobId = Array.isArray(req.params.jobId)
      ? req.params.jobId[0]
      : req.params.jobId;

    const jobStatus = await getJobStatus(jobId);
    if (!jobStatus) {
      res.status(404).json({ success: false, error: "Job not found" });
      return;
    }
    res.json({ success: true, data: jobStatus });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get status" });
  }
}

export async function regenerateAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    if (assignment.paperId) {
      await QuestionPaper.findByIdAndDelete(assignment.paperId);
    }

    await Assignment.findByIdAndUpdate(id, {
      $set: { status: "pending" },
      $unset: { paperId: 1, jobId: 1 },
    });

    console.log(`✅ Assignment ${id} reset for regeneration`);

    let jobId: string | undefined;
    try {
      const job = await assignmentQueue.add(
        "generate-paper",
        { assignmentId: id },
        { jobId: `regen-${id}-${Date.now()}` }
      );
      jobId = job.id;
      await Assignment.findByIdAndUpdate(id, { jobId: job.id });
    } catch (err) {
      console.log("Queue add failed — DB fallback will handle it");
    }

    res.json({
      success: true,
      data: {
        assignmentId: id,
        jobId: jobId || `fallback-${id}`,
        status: "pending",
        message: "Regeneration queued.",
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to regenerate" });
  }
}