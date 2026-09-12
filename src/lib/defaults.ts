import type { AppState, Progress, QuizConfig, Settings } from "./types";

export const ACCENTS: { id: string; label: string; value: string; glow: string }[] = [
  { id: "ocean", label: "Ocean", value: "oklch(0.7 0.15 240)", glow: "oklch(0.79 0.12 225)" },
  { id: "deep-blue", label: "Deep Blue", value: "oklch(0.62 0.18 255)", glow: "oklch(0.74 0.15 245)" },
  { id: "cyan", label: "Arc Blue", value: "oklch(0.75 0.12 220)", glow: "oklch(0.84 0.09 215)" },
  { id: "azure", label: "Azure", value: "oklch(0.68 0.17 235)", glow: "oklch(0.79 0.13 225)" },
  { id: "midnight", label: "Midnight", value: "oklch(0.55 0.2 270)", glow: "oklch(0.68 0.17 260)" },
  { id: "tidal", label: "Tidal", value: "oklch(0.66 0.15 205)", glow: "oklch(0.78 0.12 210)" },
];

export const DECK_COLORS = [
  "oklch(0.7 0.15 240)",
  "oklch(0.75 0.12 220)",
  "oklch(0.65 0.17 250)",
  "oklch(0.58 0.19 265)",
  "oklch(0.68 0.15 205)",
  "oklch(0.78 0.1 230)",
];

export function oceanDeckColor(color: string) {
  if (DECK_COLORS.includes(color)) return color;
  const index = Array.from(color).reduce((sum, char) => sum + char.charCodeAt(0), 0) % DECK_COLORS.length;
  return DECK_COLORS[index];
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  deckIds: [],
  questionCount: 10,
  types: [
    "multiple-choice",
    "true-false",
    "fill-blank",
    "short-answer",
    "flashcard",
    "ordering",
    "matching",
    "word-bank",
  ],
  difficulties: ["easy", "medium", "hard"],
  shuffle: true,
  perQuestionSeconds: null,
  totalMinutes: null,
  unlimited: false,
  passingScore: 70,
  xpEnabled: true,
  instantFeedback: true,
  reviewMode: false,
};

export const DEFAULT_SETTINGS: Settings = {
  displayName: "Scholar",
  gradeLevel: "",
  school: "",
  avatarEmoji: "🌊",
  focusSubjects: [],
  studyReason: "",
  dailyGoal: 20,
  confirmBeforeExit: true,
  theme: "dark",
  accent: "ocean",
  wallpaper: null,
  wallpaperOpacity: 0.35,
  wallpaperBlur: 4,
  fontScale: 1,
  density: "cozy",
  radius: 0.5,
  buttonSize: "default",
  animationSpeed: 1,
  showProgressBars: true,
  sidebarCollapsed: false,
  reducedMotion: false,
  highContrast: false,
  colorblindPalette: false,
  focusIndicators: true,
  timerMultiplier: 1,
  autoReveal: false,
  shuffleStudy: false,
  showHints: true,
  showExplanations: true,
  defaultQuizConfig: DEFAULT_QUIZ_CONFIG,
  quizWidgets: {
    progress: true,
    timer: true,
    questionNumber: true,
    accuracy: true,
    score: true,
    xp: true,
    combo: true,
    remaining: true,
    difficulty: true,
    concept: true,
  },
  xpEnabled: true,
  achievementPopups: true,
  soundEnabled: false,
  dashboardWidgets: [
    "continue",
    "goal",
    "level",
    "streak",
    "due",
    "activity",
    "weak",
    "decks",
    "achievements",
    "stats",
  ],
  hiddenWidgets: [],
  devMode: false,
};

export const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  lifetimeXp: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  totalSkipped: 0,
  studyTimeMs: 0,
  streak: 0,
  longestStreak: 0,
  lastStudyDay: null,
  studyDays: {},
  unlockedAchievements: [],
  perfectQuizzes: 0,
  quizzesCompleted: 0,
  bestAccuracy: 0,
  bestCombo: 0,
  conceptStats: {},
};

export const DEFAULT_STATE: AppState = {
  version: 1,
  onboardingComplete: false,
  decks: [],
  settings: DEFAULT_SETTINGS,
  progress: DEFAULT_PROGRESS,
  history: [],
  results: [],
  templates: [],
};

export const GRADE_LEVELS = [
  "Middle school",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Undergraduate",
  "Postgraduate",
  "Professional / certification",
  "Self-directed learner",
];

export const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "Literature",
  "Languages",
  "Computer Science",
  "Economics",
  "Law",
  "Medicine",
];

export const AVATAR_EMOJIS = ["🌊", "💧", "🐋", "🐬", "🧠", "📘", "🌀", "🫐", "🩵", "💙"];

export const STUDY_REASONS = [
  "Exam prep",
  "Daily revision",
  "Certification",
  "Curiosity",
];