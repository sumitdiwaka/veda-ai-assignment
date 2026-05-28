import type { Difficulty, QuestionType } from "./assignment";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate: string;
  sections: Section[];
  totalMarks: number;
  totalQuestions: number;
  duration?: number;
  generalInstructions: string[];
  pdfPath?: string;
  createdAt: string;
}