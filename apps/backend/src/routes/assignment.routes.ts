import { Router } from "express";
import { upload } from "../middleware/upload";
import { validate, createAssignmentSchema } from "../middleware/validate";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getJobStatusById,
  regenerateAssignment,
} from "../controllers/assignment.controller";
import { Assignment } from "../models/Assignment";
import { QuestionPaper } from "../models/QuestionPaper";

const router = Router();

router.post("/", upload.single("file"), validate(createAssignmentSchema), createAssignment);
router.get("/", getAssignments);
router.get("/job/:jobId/status", getJobStatusById);
router.get("/:id", getAssignmentById);
router.post("/:id/regenerate", regenerateAssignment);
router.delete("/:id", async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await QuestionPaper.deleteMany({ assignmentId: req.params.id });
    res.json({ success: true, message: "Deleted successfully" });
  } catch {
    res.status(500).json({ success: false, error: "Delete failed" });
  }
});

export default router;