import type { IAssignment, IQuestionConfig } from "../models/Assignment";

function questionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mcq: "Multiple Choice Questions (4 options each labeled A, B, C, D)",
    short_answer: "Short Answer Questions (2-3 sentences expected)",
    long_answer: "Long Answer / Essay Questions (detailed explanation required)",
    true_false: "True or False Questions",
    fill_blank: "Fill in the Blank Questions (use ___ as blank)",
  };
  return labels[type] || type;
}

function buildSectionInstruction(type: string, marks: number): string {
  const instructions: Record<string, string> = {
    mcq: "Choose the most appropriate answer from the given options.",
    short_answer: `Answer all questions briefly. Each question carries ${marks} mark${marks > 1 ? "s" : ""}.`,
    long_answer: `Answer all questions in detail. Each question carries ${marks} mark${marks > 1 ? "s" : ""}.`,
    true_false: "Write True or False for each statement.",
    fill_blank: "Fill in the blanks with the most appropriate word or phrase.",
  };
  return instructions[type] || "Attempt all questions.";
}

export function buildPrompt(assignment: IAssignment): string {
  const configs = assignment.questionConfigs;

  const sectionDescriptions = configs
    .map((config: IQuestionConfig, idx: number) => {
      const sectionLetter = String.fromCharCode(65 + idx);
      return `
Section ${sectionLetter}: ${questionTypeLabel(config.type)}
- Number of questions: ${config.count}
- Marks per question: ${config.marksPerQuestion} (IMPORTANT: every question in this section MUST have exactly ${config.marksPerQuestion} marks)
- Difficulty: ${config.difficulty || "mixed"}
- Section instruction: "${buildSectionInstruction(config.type, config.marksPerQuestion)}"`;
    })
    .join("\n");

  const sectionSchemas = configs
    .map((config: IQuestionConfig, idx: number) => {
      const sectionLetter = String.fromCharCode(65 + idx).toLowerCase();
      return `Section ${String.fromCharCode(65 + idx)}: id="section-${sectionLetter}", ${config.count} questions, each with marks=${config.marksPerQuestion}`;
    })
    .join("\n");

  return `You are an expert educational assessment creator. Generate a structured question paper.

ASSIGNMENT DETAILS:
- Title: ${assignment.title}
- Subject: ${assignment.subject}
- Grade/Class: ${assignment.grade}
- Topic: ${assignment.topic}
- Total Marks: ${assignment.totalMarks}
- Total Questions: ${assignment.totalQuestions}
${assignment.additionalInstructions ? `- Additional Instructions: ${assignment.additionalInstructions}` : ""}

SECTIONS TO GENERATE:
${sectionDescriptions}

SECTION MARKS SUMMARY (follow exactly):
${sectionSchemas}

STRICT RULES:
1. Return ONLY valid JSON — no markdown, no backticks, no text outside JSON
2. Each question's "marks" field MUST exactly match the marks specified for its section
3. Difficulty must be exactly "easy", "medium", or "hard"
4. MCQ must have exactly 4 options labeled "A. option", "B. option", "C. option", "D. option"
5. Fill-blank uses "___" as the blank marker
6. Do NOT include answers
7. "generalInstructions" array MUST contain BOTH standard exam instructions AND any additional instructions provided. Always include these standard instructions:
   - "All questions are compulsory unless stated otherwise."
   - "Read each question carefully before answering."
   - "Write neatly and legibly."
   - "Mobile phones and electronic devices are not allowed in the examination hall."
   ${assignment.additionalInstructions ? `- Also include this additional instruction: "${assignment.additionalInstructions}"` : ""}

OUTPUT JSON FORMAT:
{
  "title": "descriptive exam title",
  "duration": <number in minutes>,
  "generalInstructions": ["instruction 1", "instruction 2", "instruction 3"],
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "instruction text",
      "questions": [
        {
          "id": "q-a-1",
          "text": "question text here",
          "type": "mcq|short_answer|long_answer|true_false|fill_blank",
          "difficulty": "easy|medium|hard",
          "marks": <EXACT marks number as specified above>,
          "options": ["A. opt1", "B. opt2", "C. opt3", "D. opt4"]
        }
      ],
      "totalMarks": <sum of all question marks in this section>
    }
  ],
  "totalMarks": <sum of all sections>,
  "totalQuestions": <total number of questions>
}

Generate the complete question paper now:`;
}