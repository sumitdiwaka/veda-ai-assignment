import { create } from "zustand";
import type { QuestionConfig } from "@/types/assignment";

interface CreateFormData {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions: string;
  file: File | null;
}

interface CreateStore {
  step: number;
  formData: CreateFormData;
  jobId: string | null;
  assignmentId: string | null;
  setStep: (step: number) => void;
  setFormData: (data: Partial<CreateFormData>) => void;
  setJobId: (id: string) => void;
  setAssignmentId: (id: string) => void;
  addQuestionConfig: () => void;
  updateQuestionConfig: (index: number, config: Partial<QuestionConfig>) => void;
  removeQuestionConfig: (index: number) => void;
  reset: () => void;
}

const defaultForm: CreateFormData = {
  title: "",
  subject: "",
  grade: "",
  topic: "",
  dueDate: "",
  questionConfigs: [{ type: "mcq", count: 4, marksPerQuestion: 1 }],
  additionalInstructions: "",
  file: null,
};

export const useCreateStore = create<CreateStore>((set) => ({
  step: 1,
  formData: defaultForm,
  jobId: null,
  assignmentId: null,

  setStep: (step) => set({ step }),
  setFormData: (data) =>
    set((s) => ({ formData: { ...s.formData, ...data } })),
  setJobId: (jobId) => set({ jobId }),
  setAssignmentId: (assignmentId) => set({ assignmentId }),

  addQuestionConfig: () =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionConfigs: [
          ...s.formData.questionConfigs,
          { type: "short_answer", count: 3, marksPerQuestion: 2 },
        ],
      },
    })),

  updateQuestionConfig: (index, config) =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionConfigs: s.formData.questionConfigs.map((c, i) =>
          i === index ? { ...c, ...config } : c
        ),
      },
    })),

  removeQuestionConfig: (index) =>
    set((s) => ({
      formData: {
        ...s.formData,
        questionConfigs: s.formData.questionConfigs.filter(
          (_, i) => i !== index
        ),
      },
    })),

  reset: () => set({ step: 1, formData: defaultForm, jobId: null, assignmentId: null }),
}));