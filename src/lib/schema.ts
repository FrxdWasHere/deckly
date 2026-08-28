import { z } from "zod";
import { DECK_COLORS } from "./defaults";
import type { Deck, Question } from "./types";

export const questionTypes = [
  "flashcard",
  "multiple-choice",
  "true-false",
  "fill-blank",
  "short-answer",
] as const;

export const questionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(questionTypes),
  question: z.string().min(1, "Question text is required"),
  answer: z.union([z.string(), z.boolean(), z.number()]).transform((v) => String(v)),
  options: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  concept: z.string().optional(),
  hint: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const deckSchema = z.object({
  title: z.string().min(1, "Deck title is required"),
  subject: z.string().default("General"),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  questions: z.array(questionSchema).min(1, "A deck needs at least one question"),
});

export type ParsedDeck = z.infer<typeof deckSchema>;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  deck?: Deck;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function validateDeckJson(raw: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return {
      ok: false,
      errors: [`Invalid JSON syntax: ${(e as Error).message}`],
      warnings,
    };
  }

  if (Array.isArray(data)) {
    data = { title: "Imported Deck", subject: "General", questions: data };
    warnings.push("Received a bare question array — wrapped it into a deck named “Imported Deck”.");
  }

  const parsed = deckSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    return { ok: false, errors, warnings };
  }

  const questions: Question[] = parsed.data.questions.map((q, i) => {
    if (q.type === "multiple-choice") {
      if (!q.options || q.options.length < 2) {
        errors.push(`questions[${i}]: multiple-choice questions need at least 2 options.`);
      } else if (!q.options.includes(q.answer)) {
        errors.push(`questions[${i}]: answer "${q.answer}" is not one of the provided options.`);
      }
    }
    if (q.type === "true-false" && !["true", "false"].includes(q.answer.toLowerCase())) {
      errors.push(`questions[${i}]: true-false answers must be "true" or "false".`);
    }
    if (!q.explanation) warnings.push(`questions[${i}]: no explanation provided.`);
    if (!q.concept) warnings.push(`questions[${i}]: no concept tag — topic analytics will be thin.`);
    return {
      id: q.id || uid(),
      type: q.type,
      question: q.question,
      answer: q.answer,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
      concept: q.concept,
      hint: q.hint,
      tags: q.tags,
    };
  });

  if (errors.length) return { ok: false, errors, warnings };

  const deck: Deck = {
    id: uid(),
    title: parsed.data.title,
    subject: parsed.data.subject,
    description: parsed.data.description,
    color: DECK_COLORS[Math.floor(Math.random() * DECK_COLORS.length)],
    tags: parsed.data.tags,
    createdAt: Date.now(),
    favorite: false,
    questions,
    masteredIds: [],
    bookmarks: [],
    notes: {},
  };

  return { ok: true, errors, warnings: warnings.slice(0, 12), deck };
}

export const SAMPLE_DECK_JSON = `{
  "title": "Cell Biology — Membranes & Transport",
  "subject": "Biology",
  "description": "Core concepts on membrane structure and transport mechanisms.",
  "tags": ["biology", "cells", "exam-prep"],
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Which model best describes the plasma membrane?",
      "options": [
        "Fluid mosaic model",
        "Rigid lattice model",
        "Static bilayer model",
        "Protein shell model"
      ],
      "answer": "Fluid mosaic model",
      "explanation": "Lipids and proteins move laterally, forming a fluid mosaic.",
      "difficulty": "easy",
      "concept": "Membrane structure"
    },
    {
      "type": "true-false",
      "question": "Facilitated diffusion requires ATP.",
      "answer": "false",
      "explanation": "It is passive; it uses the concentration gradient, not ATP.",
      "difficulty": "medium",
      "concept": "Passive transport"
    },
    {
      "type": "fill-blank",
      "question": "The sodium-potassium pump moves ___ sodium ions out per cycle.",
      "answer": "3",
      "explanation": "3 Na+ out, 2 K+ in, per ATP hydrolysed.",
      "difficulty": "medium",
      "concept": "Active transport"
    },
    {
      "type": "short-answer",
      "question": "Define osmosis in one sentence.",
      "answer": "The movement of water across a semipermeable membrane from low to high solute concentration.",
      "explanation": "Water follows the solute gradient.",
      "difficulty": "medium",
      "concept": "Osmosis"
    },
    {
      "type": "flashcard",
      "question": "Hypertonic solution",
      "answer": "A solution with higher solute concentration than the cell, causing water to leave the cell.",
      "difficulty": "easy",
      "concept": "Tonicity"
    }
  ]
}`;

export const FIELD_DOCS: { field: string; type: string; required: boolean; note: string }[] = [
  { field: "title", type: "string", required: true, note: "Deck name shown in your library." },
  { field: "subject", type: "string", required: false, note: "Used for grouping and filtering." },
  { field: "description", type: "string", required: false, note: "Short summary of the deck." },
  { field: "tags", type: "string[]", required: false, note: "Free-form tags for search." },
  { field: "questions", type: "Question[]", required: true, note: "At least one question." },
  {
    field: "questions[].type",
    type: '"flashcard" | "multiple-choice" | "true-false" | "fill-blank" | "short-answer"',
    required: true,
    note: "Determines how the question is presented.",
  },
  { field: "questions[].question", type: "string", required: true, note: "The prompt shown." },
  {
    field: "questions[].answer",
    type: "string",
    required: true,
    note: 'Correct answer. Must match an option for multiple-choice; "true"/"false" for true-false.',
  },
  {
    field: "questions[].options",
    type: "string[]",
    required: false,
    note: "Required for multiple-choice — 2 to 6 entries.",
  },
  {
    field: "questions[].explanation",
    type: "string",
    required: false,
    note: "Shown after answering. Strongly recommended.",
  },
  {
    field: "questions[].difficulty",
    type: '"easy" | "medium" | "hard"',
    required: false,
    note: "Defaults to medium. Powers difficulty filters and analytics.",
  },
  {
    field: "questions[].concept",
    type: "string",
    required: false,
    note: "Topic label — powers weak/strong topic analytics.",
  },
  { field: "questions[].hint", type: "string", required: false, note: "Optional nudge." },
];
/* ------------------------------------------------------------------ *
 * Additional questions (question-pack) schema
 * Used when expanding an existing deck instead of creating a new one.
 * ------------------------------------------------------------------ */

export const questionPackSchema = z.object({
  deckTitle: z.string().optional(),
  questions: z.array(questionSchema).min(1, "A question pack needs at least one question"),
});

export interface QuestionsValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  questions?: Question[];
  deckTitle?: string;
}

/** Validates a questions-only JSON payload (object with `questions`, or a bare array). */
export function validateQuestionsJson(
  raw: string,
  existing: Question[] = [],
): QuestionsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON syntax: ${(e as Error).message}`], warnings };
  }

  if (Array.isArray(data)) data = { questions: data };
  if (data && typeof data === "object" && !("questions" in data)) {
    warnings.push("No “questions” array found at the top level.");
  }

  const parsed = questionPackSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    return { ok: false, errors, warnings };
  }

  const existingText = new Set(existing.map((q) => q.question.trim().toLowerCase()));

  const questions: Question[] = parsed.data.questions.map((q, i) => {
    if (q.type === "multiple-choice") {
      if (!q.options || q.options.length < 2) {
        errors.push(`questions[${i}]: multiple-choice questions need at least 2 options.`);
      } else if (!q.options.includes(q.answer)) {
        errors.push(`questions[${i}]: answer "${q.answer}" is not one of the provided options.`);
      }
    }
    if (q.type === "true-false" && !["true", "false"].includes(q.answer.toLowerCase())) {
      errors.push(`questions[${i}]: true-false answers must be "true" or "false".`);
    }
    if (existingText.has(q.question.trim().toLowerCase())) {
      warnings.push(`questions[${i}]: looks like a duplicate of a question already in this deck.`);
    }
    if (!q.explanation) warnings.push(`questions[${i}]: no explanation provided.`);
    return {
      id: uid(),
      type: q.type,
      question: q.question,
      answer: q.answer,
      options: q.options,
      explanation: q.explanation,
      difficulty: q.difficulty,
      concept: q.concept,
      hint: q.hint,
      tags: q.tags,
    };
  });

  if (errors.length) return { ok: false, errors, warnings };
  return { ok: true, errors, warnings: warnings.slice(0, 12), questions, deckTitle: parsed.data.deckTitle };
}

export const SAMPLE_QUESTIONS_JSON = `{
  "deckTitle": "Cell Biology — Membranes & Transport",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Which transport protein moves ions against their gradient?",
      "options": ["Pump", "Channel", "Carrier (facilitated)", "Aquaporin"],
      "answer": "Pump",
      "explanation": "Pumps hydrolyse ATP to move ions up a gradient.",
      "difficulty": "medium",
      "concept": "Active transport"
    },
    {
      "type": "short-answer",
      "question": "What drives secondary active transport?",
      "answer": "The electrochemical gradient created by primary active transport.",
      "explanation": "It borrows energy stored in an existing ion gradient.",
      "difficulty": "hard",
      "concept": "Active transport"
    }
  ]
}`;
