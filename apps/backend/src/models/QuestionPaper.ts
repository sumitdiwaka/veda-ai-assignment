import mongoose, { Document, Schema } from "mongoose";
import type { Difficulty, QuestionType } from "./Assignment";

export interface IQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];       // for MCQ
  answer?: string;          // optional model answer
  hint?: string;
}

export interface ISection {
  id: string;
  title: string;            // "Section A", "Section B", etc.
  instruction: string;      // "Attempt all questions"
  questions: IQuestion[];
  totalMarks: number;
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate: Date;
  sections: ISection[];
  totalMarks: number;
  totalQuestions: number;
  duration?: number;        // in minutes
  generalInstructions: string[];
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_blank"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  marks: { type: Number, required: true },
  options: [{ type: String }],
  answer: { type: String },
  hint: { type: String },
});

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
  totalMarks: { type: Number, required: true },
});

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    topic: { type: String, required: true },
    dueDate: { type: Date, required: true },
    sections: { type: [SectionSchema], required: true },
    totalMarks: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    duration: { type: Number },
    generalInstructions: [{ type: String }],
    pdfPath: { type: String },
  },
  { timestamps: true }
);

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  "QuestionPaper",
  QuestionPaperSchema
);