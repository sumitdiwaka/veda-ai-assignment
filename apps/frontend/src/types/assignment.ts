export type QuestionType =
  | "mcq"
  | "short_answer"
  | "long_answer"
  | "true_false"
  | "fill_blank";

export type Difficulty = "easy" | "medium" | "hard";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
  difficulty?: Difficulty;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions?: string;
  fileName?: string;
  totalMarks: number;
  totalQuestions: number;
  jobId?: string;
  status: JobStatus;
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions?: string;
}

export type QuestionTypeLabel =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Long Answer Questions"
  | "True/False Questions"
  | "Fill in the Blanks";

export const QUESTION_TYPE_OPTIONS: {
  label: QuestionTypeLabel;
  value: QuestionType;
}[] = [
  { label: "Multiple Choice Questions", value: "mcq" },
  { label: "Short Questions", value: "short_answer" },
  { label: "Long Answer Questions", value: "long_answer" },
  { label: "True/False Questions", value: "true_false" },
  { label: "Fill in the Blanks", value: "fill_blank" },
];