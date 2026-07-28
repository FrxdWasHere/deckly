import type { Difficulty, QuestionType } from "./types";

export interface PromptOptions {
  material: string;
  title: string;
  subject: string;
  count: number;
  distribution: Record<Difficulty, number>;
  types: QuestionType[];
  extra: string;
}

export function buildPrompt(o: PromptOptions) {
  const total = o.distribution.easy + o.distribution.medium + o.distribution.hard || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const typeList = o.types.join(", ");

  return `You are an expert exam writer. Convert the study material below into a StudyForge deck.

OUTPUT RULES
- Respond with ONE valid JSON object and nothing else. No markdown fences, no commentary.
- Every string must be valid JSON (escape quotes and newlines).
- Generate exactly ${o.count} questions.

SCHEMA
{
  "title": string,
  "subject": string,
  "description": string,
  "tags": string[],
  "questions": [
    {
      "type": "flashcard" | "multiple-choice" | "true-false" | "fill-blank" | "short-answer",
      "question": string,
      "options": string[],          // multiple-choice only, 4 entries
      "answer": string,             // must exactly match one option for multiple-choice; "true"/"false" for true-false
      "explanation": string,        // why the answer is correct
      "difficulty": "easy" | "medium" | "hard",
      "concept": string             // the specific topic being tested
    }
  ]
}

DECK SETTINGS
- title: "${o.title || "Untitled Deck"}"
- subject: "${o.subject || "General"}"
- allowed question types: ${typeList || "multiple-choice"}
- difficulty mix: ~${pct(o.distribution.easy)}% easy, ~${pct(o.distribution.medium)}% medium, ~${pct(o.distribution.hard)}% hard

QUALITY BAR
- Test understanding, not trivia phrasing. Avoid duplicate questions.
- Distractors must be plausible and mutually exclusive.
- Keep every "concept" value consistent so topic analytics group correctly.
- Explanations: 1-2 sentences, self-contained.
${o.extra ? `\nADDITIONAL INSTRUCTIONS\n${o.extra}\n` : ""}
STUDY MATERIAL
"""
${o.material || "(paste your study material here)"}
"""`;
}

export function estimateQuestions(materialLength: number) {
  return Math.max(5, Math.min(80, Math.round(materialLength / 220)));
}