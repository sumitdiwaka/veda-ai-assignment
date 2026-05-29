import api, { apiLong } from "./api";
import type { Assignment, CreateAssignmentPayload } from "@/types/assignment";

export const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    const res = await api.get("/assignments");
    return res.data.data;
  },

  async getById(id: string): Promise<Assignment> {
    const res = await api.get(`/assignments/${id}`);
    return res.data.data;
  },

  async create(payload: CreateAssignmentPayload, file?: File): Promise<{ assignmentId: string; jobId: string }> {
    if (!file) {
      // ✅ apiLong use karo
      const res = await apiLong.post("/assignments", payload);
      return res.data.data;
    }

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("subject", payload.subject);
    formData.append("grade", payload.grade);
    formData.append("topic", payload.topic);
    formData.append("dueDate", payload.dueDate);
    payload.questionConfigs.forEach((config, index) => {
      formData.append(`questionConfigs[${index}][type]`, config.type);
      formData.append(`questionConfigs[${index}][count]`, String(config.count));
      formData.append(`questionConfigs[${index}][marksPerQuestion]`, String(config.marksPerQuestion));
      if (config.difficulty) {
        formData.append(`questionConfigs[${index}][difficulty]`, config.difficulty);
      }
    });
    if (payload.additionalInstructions) {
      formData.append("additionalInstructions", payload.additionalInstructions);
    }
    formData.append("file", file);

    // ✅ apiLong use karo
    const res = await apiLong.post("/assignments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async regenerate(id: string): Promise<{ assignmentId: string; jobId: string }> {
    const res = await api.post(`/assignments/${id}/regenerate`);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },
};