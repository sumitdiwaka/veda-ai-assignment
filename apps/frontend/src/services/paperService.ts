import api from "./api";
import type { QuestionPaper } from "@/types/paper";

export const paperService = {
  async getByAssignment(assignmentId: string): Promise<QuestionPaper> {
    const res = await api.get(`/papers/assignment/${assignmentId}`);
    return res.data.data;
  },

  async getById(id: string): Promise<QuestionPaper> {
    const res = await api.get(`/papers/${id}`);
    return res.data.data;
  },

  getDownloadUrl(paperId: string): string {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return `${base}/papers/${paperId}/download`;
  },
};