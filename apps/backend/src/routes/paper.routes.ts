import { Router } from "express";
import path from "path";
import fs from "fs";
import { QuestionPaper } from "../models/QuestionPaper";
import { getCachedPaper, cachePaper } from "../services/cache.service";

const router = Router();

// Get paper by ID
router.get("/:id", async (req, res) => {
  try {
    const cached = await getCachedPaper(req.params.id);
    if (cached) {
      res.json({ success: true, data: cached, cached: true });
      return;
    }
    const paper = await QuestionPaper.findById(req.params.id).select("-__v");
    if (!paper) {
      res.status(404).json({ success: false, error: "Paper not found" });
      return;
    }
    await cachePaper(req.params.id, paper.toObject());
    res.json({ success: true, data: paper });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch paper" });
  }
});

// Get paper by assignment ID
router.get("/assignment/:assignmentId", async (req, res) => {
  try {
    const paper = await QuestionPaper.findOne({
      assignmentId: req.params.assignmentId,
    }).select("-__v");
    if (!paper) {
      res.status(404).json({ success: false, error: "Paper not found" });
      return;
    }
    res.json({ success: true, data: paper });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch paper" });
  }
});

// Download PDF
router.get("/:id/download", async (req, res) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      res.status(404).json({ success: false, error: "Paper not found" });
      return;
    }

    // Generate PDF on demand
    const { generatePDF } = await import("../services/pdf.service");
    const pdfPath = await generatePDF(paper);

    const fileName = `${paper.subject}-${paper.grade}-exam.pdf`
      .replace(/\s+/g, "-")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ success: false, error: "PDF generation failed" });
  }
});

export default router;