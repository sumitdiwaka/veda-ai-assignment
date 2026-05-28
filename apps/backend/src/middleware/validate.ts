import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      console.log("❌ Validation error:", JSON.stringify(result.error.flatten(), null, 2));
      console.log("📦 Request body:", JSON.stringify(req.body, null, 2));
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().min(1, "Subject is required").max(100),
  grade: z.string().min(1, "Grade is required").max(50),
  topic: z.string().min(1, "Topic is required").max(300),
  // ✅ Accept both ISO string and date string
  dueDate: z.string().min(1, "Due date is required"),
  questionConfigs: z
    .array(
      z.object({
        type: z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_blank"]),
        // ✅ Accept string or number (FormData sends strings)
        count: z.union([z.number(), z.string()]).transform(v => Number(v)),
        marksPerQuestion: z.union([z.number(), z.string()]).transform(v => Number(v)),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      })
    )
    .min(1, "At least one question type required"),
  additionalInstructions: z.string().max(1000).optional(),
});