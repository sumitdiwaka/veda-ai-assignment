import mongoose, { Document, Schema } from "mongoose";

export type QuestionType =
  | "mcq"
  | "short_answer"
  | "long_answer"
  | "true_false"
  | "fill_blank";

export type Difficulty = "easy" | "medium" | "hard";

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface IQuestionConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
  difficulty?: Difficulty;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate: Date;
  questionConfigs: IQuestionConfig[];
  additionalInstructions?: string;
  filePath?: string;
  fileName?: string;
  totalMarks: number;
  totalQuestions: number;
  jobId?: string;
  status: JobStatus;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionConfigSchema = new Schema<IQuestionConfig>({
  type: {
    type: String,
    enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_blank"],
    required: true,
  },
  count: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, min: 1 },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionConfigs: {
      type: [QuestionConfigSchema],
      required: true,
      validate: {
        validator: (v: IQuestionConfig[]) => v.length > 0,
        message: "At least one question configuration is required",
      },
    },
    additionalInstructions: { type: String },
    filePath: { type: String },
    fileName: { type: String },
    totalMarks: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    jobId: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    paperId: { type: Schema.Types.ObjectId, ref: "QuestionPaper" },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);