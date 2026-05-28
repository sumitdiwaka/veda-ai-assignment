import { create } from "zustand";
import type { Assignment } from "@/types/assignment";
import { assignmentService } from "@/services/assignmentService";

interface AssignmentStore {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  fetchAssignments: () => Promise<void>;
  addAssignment: (a: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  removeAssignment: (id: string) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  loading: false,
  error: null,

  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const data = await assignmentService.getAll();
      set({ assignments: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch",
        loading: false,
      });
    }
  },

  addAssignment: (a) =>
    set((s) => ({ assignments: [a, ...s.assignments] })),

  updateAssignment: (id, updates) =>
    set((s) => ({
      assignments: s.assignments.map((a) =>
        a._id === id ? { ...a, ...updates } : a
      ),
    })),

  removeAssignment: (id) =>
    set((s) => ({
      assignments: s.assignments.filter((a) => a._id !== id),
    })),
}));