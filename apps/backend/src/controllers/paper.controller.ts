import type { Request, Response } from "express";
import { QuestionPaper } from "../models/QuestionPaper";
import { getCachedPaper, cachePaper } from "../services/cache.service";

export async function getPaperByAssignment(
  req: Request,
  res: Response
): Promise<void> {
  const { assignmentId } = req.params;

  const paper = await QuestionPaper.findOne({ assignmentId }).select("-__v");
  if (!paper) {
    res.status(404).json({ success: false, error: "Paper not found" });
    return;
  }

  res.json({ success: true, data: paper });
}

export async function getPaperById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  const cached = await getCachedPaper(id);
  if (cached) {
    res.json({ success: true, data: cached, cached: true });
    return;
  }

  const paper = await QuestionPaper.findById(id).select("-__v");
  if (!paper) {
    res.status(404).json({ success: false, error: "Paper not found" });
    return;
  }

  await cachePaper(id, paper.toObject());
  res.json({ success: true, data: paper });
}