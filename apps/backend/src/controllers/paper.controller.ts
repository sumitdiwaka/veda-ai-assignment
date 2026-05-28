import type { Request, Response } from "express";
import { QuestionPaper } from "../models/QuestionPaper";
import { getCachedPaper, cachePaper } from "../services/cache.service";

export async function getPaperByAssignment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const assignmentId = Array.isArray(req.params.assignmentId) 
      ? req.params.assignmentId[0] 
      : req.params.assignmentId;
      
    const paper = await QuestionPaper.findOne({ assignmentId }).select("-__v");
    if (!paper) {
      res.status(404).json({ success: false, error: "Paper not found" });
      return;
    }
    res.json({ success: true, data: paper });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch paper" });
  }
}

export async function getPaperById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
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
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch paper" });
  }
}