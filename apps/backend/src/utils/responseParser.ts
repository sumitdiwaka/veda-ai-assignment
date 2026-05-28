import type { ISection, IQuestion } from "../models/QuestionPaper";

export interface ParsedPaper {
  title: string;
  duration?: number;
  generalInstructions: string[];
  sections: ISection[];
  totalMarks: number;
  totalQuestions: number;
}

function sanitizeText(text: unknown): string {
  if (typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}

function validateDifficulty(d: unknown): "easy" | "medium" | "hard" {
  if (d === "easy" || d === "medium" || d === "hard") return d;
  return "medium";
}

function validateType(t: unknown): IQuestion["type"] {
  const valid = ["mcq", "short_answer", "long_answer", "true_false", "fill_blank"];
  if (typeof t === "string" && valid.includes(t)) return t as IQuestion["type"];
  return "short_answer";
}

export function parseAIResponse(raw: string): ParsedPaper {
  // Strip any accidental markdown fences
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("AI response is not valid JSON. Raw: " + raw.slice(0, 200));
  }

  if (!data.sections || !Array.isArray(data.sections)) {
    throw new Error("AI response missing required 'sections' array");
  }

  let totalMarks = 0;
  let totalQuestions = 0;

  const sections: ISection[] = (data.sections as unknown[]).map(
    (sec: unknown, sIdx: number) => {
      const s = sec as Record<string, unknown>;
      const sectionLetter = String.fromCharCode(65 + sIdx);

      const questions: IQuestion[] = ((s.questions as unknown[]) || []).map(
        (q: unknown, qIdx: number) => {
          const question = q as Record<string, unknown>;

          // ✅ Fix: marks ko properly parse karo
          const rawMarks = question.marks;
          const marks = rawMarks !== undefined && rawMarks !== null
            ? Number(rawMarks)
            : 1;

          totalMarks += marks;
          totalQuestions += 1;

          const parsed: IQuestion = {
            id: sanitizeText(question.id) || `q-${sIdx + 1}-${qIdx + 1}`,
            text: sanitizeText(question.text) || "Question text unavailable",
            type: validateType(question.type),
            difficulty: validateDifficulty(question.difficulty),
            marks,
          };

          if (Array.isArray(question.options) && question.options.length > 0) {
            parsed.options = (question.options as unknown[]).map((o) =>
              sanitizeText(o)
            );
          }

          return parsed;
        }
      );

      const sectionMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      return {
        id: sanitizeText(s.id) || `section-${sectionLetter.toLowerCase()}`,
        title: sanitizeText(s.title) || `Section ${sectionLetter}`,
        instruction: sanitizeText(s.instruction) || "Attempt all questions.",
        questions,
        totalMarks: sectionMarks,
      };
    }
  );

  const generalInstructions = Array.isArray(data.generalInstructions)
    ? (data.generalInstructions as unknown[]).map((i) => sanitizeText(i)).filter(Boolean)
    : [
        "All questions are compulsory unless stated otherwise.",
        "Read each question carefully before answering.",
        "Write neatly and legibly.",
      ];

  return {
    title: sanitizeText(data.title) || "Question Paper",
    duration: typeof data.duration === "number" ? data.duration : undefined,
    generalInstructions,
    sections,
    totalMarks,
    totalQuestions,
  };
}