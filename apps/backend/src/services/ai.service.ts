import Groq from "groq-sdk";
import { env } from "../config/env";
import { buildPrompt } from "../utils/promptBuilder";
import { parseAIResponse, type ParsedPaper } from "../utils/responseParser";
import type { IAssignment } from "../models/Assignment";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export async function generateQuestionPaper(
  assignment: IAssignment
): Promise<ParsedPaper> {
  const prompt = buildPrompt(assignment);
  console.log(`🤖 Generating paper for assignment: ${assignment._id}`);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content:
          "You are an expert educational assessment creator. Always respond with valid JSON only. No markdown, no backticks, no explanation outside JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawText = completion.choices[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty response from Groq");
  }

  console.log(
    `✅ Groq response received (${rawText.length} chars), parsing...`
  );
  return parseAIResponse(rawText);
}