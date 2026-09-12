import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { ACCENTS, DEFAULT_PROGRESS, DEFAULT_SETTINGS, DEFAULT_STATE } from "@/lib/defaults";
import { evaluateAchievements, ACHIEVEMENTS } from "@/lib/gamification";
import { dayKey } from "@/lib/answers";
import type {
  AppState,
  Deck,
  Progress,
  Question,
  QuizResult,
  SessionSummary,
  Settings,
  PromptTemplate,
} from "@/lib/types";

const LEGACY_KEY = "studyforge.state.v1";
const HISTORY_LIMIT = 200;
const RESULTS_LIMIT = 50;

// ---------- Legacy localStorage (pre-cloud) ----------

function loadLegacyState(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...DEFAULT_STATE, ...parsed } as AppState;
  } catch {
    return null;
  }
}

function clearLegacyState() {
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* noop */
  }
}

// ---------- Cloud <-> AppState mapping ----------

interface DeckRow {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  color: string;
  tags: string[];
  favorite: boolean;
  created_at_ms: number;
  last_studied_at_ms: number | null;
}

interface QuestionRow {
  id: string;
  deck_id: string;
  type: string;
  question: string;
  answer: string;
  options: unknown;
  explanation: string | null;
  difficulty: string;
  concept: string | null;
  hint: string | null;
  tags: string[];
  items: unknown;
  pairs: unknown;
  blanks: unknown;
  word_bank: unknown;
}

function asStringArray(v: unknown): string[] | undefined {
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
}

interface StateRow {
  question_id: string;
  mastered: boolean;
  bookmarked: boolean;
  note: string | null;
}

async function loadCloudState(userId: string): Promise<AppState> {
  const [profile, decksRes, questionsRes, stateRes, sessionsRes, resultsRes, progressRes, settingsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("decks").select("*").eq("user_id", userId).order("position").order("created_at_ms"),
      supabase.from("questions").select("*").eq("user_id", userId).order("position"),
      supabase.from("question_state").select("*").eq("user_id", userId),
      supabase.from("sessions").select("*").eq("user_id", userId).order("date_ms", { ascending: false }).limit(HISTORY_LIMIT),
      supabase.from("quiz_results").select("*").eq("user_id", userId).order("created_at_ms", { ascending: false }).limit(RESULTS_LIMIT),
      supabase.from("user_progress").select("payload").eq("user_id", userId).maybeSingle(),
      supabase.from("user_settings").select("payload,templates").eq("user_id", userId).maybeSingle(),
    ]);

  const statesByQuestion = new Map<string, StateRow>();
  for (const r of (stateRes.data ?? []) as StateRow[]) statesByQuestion.set(r.question_id, r);

  const questionsByDeck = new Map<string, Question[]>();
  for (const q of (questionsRes.data ?? []) as unknown as QuestionRow[]) {
    const question: Question = {
      id: q.id,
      type: q.type as Question["type"],
      question: q.question,
      answer: q.answer,
      options: Array.isArray(q.options) ? (q.options as string[]) : undefined,
      explanation: q.explanation ?? undefined,
      difficulty: (q.difficulty as Question["difficulty"]) ?? "medium",
      concept: q.concept ?? undefined,
      hint: q.hint ?? undefined,
      tags: q.tags ?? [],
      items: asStringArray(q.items),
      pairs: Array.isArray(q.pairs) ? (q.pairs as Question["pairs"]) : undefined,
      blanks: asStringArray(q.blanks),
      wordBank: asStringArray(q.word_bank),
    };
    const list = questionsByDeck.get(q.deck_id) ?? [];
    list.push(question);
    questionsByDeck.set(q.deck_id, list);
  }

  const decks: Deck[] = ((decksRes.data ?? []) as DeckRow[]).map((d) => {
    const questions = questionsByDeck.get(d.id) ?? [];
    const masteredIds: string[] = [];
    const bookmarks: string[] = [];
    const notes: Record<string, string> = {};
    for (const q of questions) {
      const st = statesByQuestion.get(q.id);
      if (!st) continue;
      if (st.mastered) masteredIds.push(q.id);
      if (st.bookmarked) bookmarks.push(q.id);
      if (st.note) notes[q.id] = st.note;
    }
    return {
      id: d.id,
      title: d.title,
      subject: d.subject,
      description: d.description ?? undefined,
      color: d.color,
      tags: d.tags ?? [],
      favorite: d.favorite,
      createdAt: d.created_at_ms,
      lastStudiedAt: d.last_studied_at_ms ?? undefined,
      questions,
      masteredIds,
      bookmarks,
      notes,
    };
  });

  const settingsPayload = (settingsRes.data?.payload ?? {}) as Partial<Settings>;
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...settingsPayload,
    defaultQuizConfig: {
      ...DEFAULT_SETTINGS.defaultQuizConfig,
      ...(settingsPayload.defaultQuizConfig ?? {}),
    },
    quizWidgets: {
      ...DEFAULT_SETTINGS.quizWidgets,
      ...(settingsPayload.quizWidgets ?? {}),
    },
  };

  return {
    version: 1,
    onboardingComplete: profile.data?.onboarding_complete ?? false,
    decks,
    settings,
    progress: { ...DEFAULT_PROGRESS, ...((progressRes.data?.payload ?? {}) as Partial<Progress>) },
    history: (sessionsRes.data ?? []).map((s) => ({
      id: s.id,
      date: s.date_ms,
      mode: s.mode as SessionSummary["mode"],
      deckTitles: s.deck_titles,
      answered: s.answered,
      correct: s.correct,
      skipped: s.skipped,
      durationMs: s.duration_ms,
      xpEarned: s.xp_earned,
      percentage: s.percentage,
    })),
    results: (resultsRes.data ?? []).map((r) => r.payload as unknown as QuizResult),
    templates: ((settingsRes.data?.templates ?? []) as unknown as PromptTemplate[]),
  };
}

// ---------- Context ----------

interface Ctx {
  state: AppState;
  hydrated: boolean;
  user: User | null;
  setState: (updater: (s: AppState) => AppState) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  addDeck: (deck: Deck) => void;
  addQuestions: (deckId: string, questions: Question[]) => void;
  updateDeck: (id: string, patch: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  recordSession: (input: RecordSessionInput) => void;
  saveTemplate: (t: PromptTemplate) => void;
  deleteTemplate: (id: string) => void;
  completeOnboarding: () => void;
  resetAll: () => void;
  exportState: () => string;
  importState: (json: string) => boolean;
}

export interface RecordSessionInput {
  mode: "study" | "quiz";
  deckIds: string[];
  deckTitles: string[];
  answered: number;
  correct: number;
  skipped: number;
  durationMs: number;
  xpEarned: number;
  bestCombo: number;
  masteredIds: Record<string, string[]>;
  conceptStats: Record<string, { correct: number; total: number }>;
  result?: QuizResult;
}

const DecklyContext = createContext<Ctx | null>(null);

function questionToRow(q: Question, deckId: string, userId: string, position: number) {
  return {
    id: q.id,
    deck_id: deckId,
    user_id: userId,
    type: q.type,
    question: q.question,
    answer: q.answer,
    options: q.options ?? null,
    explanation: q.explanation ?? null,
    difficulty: q.difficulty ?? "medium",
    concept: q.concept ?? null,
    hint: q.hint ?? null,
    tags: q.tags ?? [],
    items: (q.items ?? null) as unknown as Json,
    pairs: (q.pairs ?? null) as unknown as Json,
    blanks: (q.blanks ?? null) as unknown as Json,
    word_bank: (q.wordBank ?? null) as unknown as Json,
    position,
  };
}

export function DecklyProvider({ children }: { children: ReactNode }) {
  const [state, setInternal] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const pendingAchievements = useRef<string[]>([]);
  const legacyChecked = useRef(false);

  // ---- Auth subscription ----
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUser(data.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ---- Load state from cloud when the user changes ----
  useEffect(() => {
    userRef.current = user;
    legacyChecked.current = false;
    if (!user) {
      // Guest mode: everything lives on this device only.
      setInternal(loadLegacyState() ?? DEFAULT_STATE);
      setHydrated(true);
      return;
    }

    setHydrated(false);
    loadCloudState(user.id)
      .then(async (cloud) => {
        // First-login offer: import pre-cloud local data if the cloud is empty.
        const legacy = loadLegacyState();
        if (
          legacy &&
          legacy.decks.length > 0 &&
          cloud.decks.length === 0
        ) {
          toast("Found existing Deckly data on this device", {
            description: `${legacy.decks.length} deck${legacy.decks.length === 1 ? "" : "s"} and your progress can be moved into your account.`,
            duration: 30000,
            action: {
              label: "Import",
              onClick: () => {
                void pushFullState(user.id, legacy).then(() => {
                  clearLegacyState();
                  setInternal(legacy);
                  toast.success("Local data imported to your account");
                });
              },
            },
          });
        } else if (legacy) {
          clearLegacyState();
        }
        legacyChecked.current = true;
        setInternal(cloud);
        setHydrated(true);
      })
      .catch((e) => {
        console.error("Failed to load cloud state", e);
        toast.error("Could not load your data — check your connection and refresh.");
        setHydrated(true);
      });
  }, [user]);

  const setState = useCallback((updater: (s: AppState) => AppState) => {
    setInternal((prev) => updater(prev));
  }, []);

  // ---- Debounced sync of blob state (settings/templates, progress, profile) ----
  const isFirstSync = useRef(true);
  useEffect(() => {
    const u = userRef.current;
    if (!u || !hydrated) return;
    if (isFirstSync.current) {
      // Skip the immediate echo right after hydration.
      isFirstSync.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const s = stateRef.current;
      void supabase.from("user_settings").upsert({
        user_id: u.id,
        payload: s.settings as unknown as Json,
        templates: s.templates as unknown as Json,
      });
      void supabase.from("user_progress").upsert({
        user_id: u.id,
        payload: s.progress as unknown as Json,
      });
      void supabase.from("profiles").upsert({
        id: u.id,
        display_name: s.settings.displayName,
        grade_level: s.settings.gradeLevel,
        school: s.settings.school,
        avatar_emoji: s.settings.avatarEmoji,
        focus_subjects: s.settings.focusSubjects,
        study_reason: s.settings.studyReason,
        daily_goal: s.settings.dailyGoal,
        onboarding_complete: s.onboardingComplete,
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  // ---- Guest mode: persist everything locally instead ----
  useEffect(() => {
    if (user || !hydrated || typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(LEGACY_KEY, JSON.stringify(stateRef.current));
      } catch {
        /* quota — ignore */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state, hydrated, user]);

  const stateRef = useRef(state);

  stateRef.current = state;

  // ---- Apply appearance settings to the document ----
  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    const s = state.settings;
    const root = document.documentElement;
    root.classList.toggle("light", s.theme === "light");
    root.classList.toggle("contrast-high", s.highContrast);
    root.classList.toggle("colorblind", s.colorblindPalette);
    root.classList.toggle("reduce-motion", s.reducedMotion);
    root.style.setProperty("--font-scale", String(s.fontScale));
    root.style.setProperty("--radius", `${s.radius}rem`);
    root.style.setProperty("--speed", String(s.animationSpeed));
    const accent = ACCENTS.find((a) => a.id === s.accent) ?? ACCENTS[0];
    root.style.setProperty("--primary", accent.value);
    root.style.setProperty("--primary-glow", accent.glow);
    root.style.setProperty("--ring", accent.value);
    root.style.setProperty("--sidebar-primary", accent.value);
  }, [state.settings, hydrated]);

  const flushAchievements = useCallback((progress: Progress, decks: Deck[]) => {
    const unlocked = evaluateAchievements(progress, decks);
    if (!unlocked.length) return progress;
    pendingAchievements.current.push(...unlocked.map((a) => a.id));
    return {
      ...progress,
      unlockedAchievements: [...progress.unlockedAchievements, ...unlocked.map((a) => a.id)],
    };
  }, []);

  useEffect(() => {
    if (!pendingAchievements.current.length || !state.settings.achievementPopups) {
      pendingAchievements.current = [];
      return;
    }
    const ids = [...pendingAchievements.current];
    pendingAchievements.current = [];
    ids.forEach((id, i) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (!a) return;
      window.setTimeout(() => {
        toast.success(`Achievement unlocked — ${a.name}`, { description: a.description });
      }, i * 500);
    });
  }, [state, state.settings.achievementPopups]);

  // ---- Deck writes (imperative, fire-and-forget) ----

  const syncDeckStateRows = useCallback((deck: Deck) => {
    const u = userRef.current;
    if (!u) return;
    const rows = deck.questions
      .map((q) => {
        const mastered = deck.masteredIds.includes(q.id);
        const bookmarked = deck.bookmarks.includes(q.id);
        const note = deck.notes[q.id] ?? null;
        if (!mastered && !bookmarked && !note) return null;
        return { user_id: u.id, question_id: q.id, mastered, bookmarked, note };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    const qids = deck.questions.map((q) => q.id);
    void (async () => {
      if (qids.length) {
        await supabase.from("question_state").delete().eq("user_id", u.id).in("question_id", qids);
      }
      if (rows.length) await supabase.from("question_state").upsert(rows);
    })();
  }, []);

  const addDeck = useCallback(
    (deck: Deck) => {
      setState((s) => {
        const decks = [deck, ...s.decks];
        return { ...s, decks, progress: flushAchievements(s.progress, decks) };
      });
      const u = userRef.current;
      if (u) {
        void (async () => {
          await supabase.from("decks").insert({
            id: deck.id,
            user_id: u.id,
            title: deck.title,
            subject: deck.subject,
            description: deck.description ?? null,
            color: deck.color,
            tags: deck.tags,
            favorite: deck.favorite,
            created_at_ms: deck.createdAt,
            last_studied_at_ms: deck.lastStudiedAt ?? null,
          });
          if (deck.questions.length) {
            await supabase
              .from("questions")
              .insert(deck.questions.map((q, i) => questionToRow(q, deck.id, u.id, i)));
          }
        })();
      }
    },
    [flushAchievements, setState],
  );

  const addQuestions = useCallback(
    (deckId: string, questions: Question[]) => {
      let fresh: Question[] = [];
      let baseCount = 0;
      setState((s) => {
        const decks = s.decks.map((d) => {
          if (d.id !== deckId) return d;
          const existing = new Set(d.questions.map((q) => q.id));
          fresh = questions.filter((q) => !existing.has(q.id));
          baseCount = d.questions.length;
          return { ...d, questions: [...d.questions, ...fresh] };
        });
        return { ...s, decks, progress: flushAchievements(s.progress, decks) };
      });
      const u = userRef.current;
      if (u && fresh.length) {
        void supabase
          .from("questions")
          .insert(fresh.map((q, i) => questionToRow(q, deckId, u.id, baseCount + i)));
      }
    },
    [flushAchievements, setState],
  );

  const updateDeck = useCallback(
    (id: string, patch: Partial<Deck>) => {
      setState((s) => ({
        ...s,
        decks: s.decks.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      }));
      const u = userRef.current;
      if (!u) return;
      const colPatch: Record<string, unknown> = {};
      if (patch.title !== undefined) colPatch.title = patch.title;
      if (patch.subject !== undefined) colPatch.subject = patch.subject;
      if (patch.description !== undefined) colPatch.description = patch.description ?? null;
      if (patch.color !== undefined) colPatch.color = patch.color;
      if (patch.tags !== undefined) colPatch.tags = patch.tags;
      if (patch.favorite !== undefined) colPatch.favorite = patch.favorite;
      if (patch.lastStudiedAt !== undefined) colPatch.last_studied_at_ms = patch.lastStudiedAt;
      if (Object.keys(colPatch).length) {
        void supabase.from("decks").update(colPatch as never).eq("id", id).eq("user_id", u.id);
      }
      if (
        patch.masteredIds !== undefined ||
        patch.bookmarks !== undefined ||
        patch.notes !== undefined
      ) {
        const deck = stateRef.current.decks.find((d) => d.id === id);
        if (deck) syncDeckStateRows({ ...deck, ...patch });
      }
    },
    [setState, syncDeckStateRows],
  );

  const deleteDeck = useCallback(
    (id: string) => {
      setState((s) => ({ ...s, decks: s.decks.filter((d) => d.id !== id) }));
      const u = userRef.current;
      if (u) void supabase.from("decks").delete().eq("id", id).eq("user_id", u.id);
    },
    [setState],
  );

  const recordSession = useCallback(
    (input: RecordSessionInput) => {
      let summary = null as SessionSummary | null;
      let touchedDecks: Deck[] = [];
      setState((s) => {
        const today = dayKey();
        const p = s.progress;
        const yesterday = dayKey(Date.now() - 86400000);
        const streak =
          p.lastStudyDay === today
            ? p.streak
            : p.lastStudyDay === yesterday
              ? p.streak + 1
              : 1;
        const hour = new Date().getHours();
        const conceptStats = { ...p.conceptStats };
        for (const [k, v] of Object.entries(input.conceptStats)) {
          const prev = conceptStats[k] ?? { correct: 0, total: 0 };
          conceptStats[k] = { correct: prev.correct + v.correct, total: prev.total + v.total };
        }
        const accuracy = input.answered ? (input.correct / input.answered) * 100 : 0;

        let progress: Progress = {
          ...p,
          xp: p.xp + input.xpEarned,
          lifetimeXp: p.lifetimeXp + input.xpEarned,
          totalAnswered: p.totalAnswered + input.answered,
          totalCorrect: p.totalCorrect + input.correct,
          totalIncorrect: p.totalIncorrect + (input.answered - input.correct - input.skipped),
          totalSkipped: p.totalSkipped + input.skipped,
          studyTimeMs: p.studyTimeMs + input.durationMs,
          streak,
          longestStreak: Math.max(p.longestStreak, streak),
          lastStudyDay: today,
          studyDays: {
            ...p.studyDays,
            [today]: (p.studyDays[today] ?? 0) + input.answered,
            ...(hour < 4 ? { __nightowl: 1 } : {}),
            ...(hour >= 4 && hour < 7 ? { __earlybird: 1 } : {}),
          },
          quizzesCompleted: p.quizzesCompleted + (input.mode === "quiz" ? 1 : 0),
          perfectQuizzes:
            p.perfectQuizzes +
            (input.mode === "quiz" && input.answered > 0 && input.correct === input.answered
              ? 1
              : 0),
          bestAccuracy: Math.max(p.bestAccuracy, accuracy),
          bestCombo: Math.max(p.bestCombo, input.bestCombo),
          conceptStats,
        };

        const now = Date.now();
        const decks = s.decks.map((d) => {
          const mastered = input.masteredIds[d.id];
          if (!mastered && !input.deckIds.includes(d.id)) return d;
          return {
            ...d,
            lastStudiedAt: now,
            masteredIds: Array.from(new Set([...d.masteredIds, ...(mastered ?? [])])),
          };
        });
        touchedDecks = decks.filter((d) => input.deckIds.includes(d.id));

        progress = flushAchievements(progress, decks);

        summary = {
          id: Math.random().toString(36).slice(2),
          date: now,
          mode: input.mode,
          deckTitles: input.deckTitles,
          answered: input.answered,
          correct: input.correct,
          skipped: input.skipped,
          durationMs: input.durationMs,
          xpEarned: input.xpEarned,
          percentage: Math.round(accuracy),
        };

        return {
          ...s,
          decks,
          progress,
          history: [summary, ...s.history].slice(0, HISTORY_LIMIT),
          results: input.result ? [input.result, ...s.results].slice(0, RESULTS_LIMIT) : s.results,
        };
      });

      const u = userRef.current;
      if (!u || !summary) return;
      const sm = summary;
      void (async () => {
        await supabase.from("sessions").insert({
          id: sm.id,
          user_id: u.id,
          date_ms: sm.date,
          mode: sm.mode,
          deck_titles: sm.deckTitles,
          answered: sm.answered,
          correct: sm.correct,
          skipped: sm.skipped,
          duration_ms: sm.durationMs,
          xp_earned: sm.xpEarned,
          percentage: sm.percentage,
        });
        if (input.result) {
          await supabase.from("quiz_results").insert({
            id: input.result.id,
            user_id: u.id,
            created_at_ms: input.result.createdAt,
            payload: input.result as unknown as Json,
          });
        }
        for (const deck of touchedDecks) {
          await supabase
            .from("decks")
            .update({ last_studied_at_ms: deck.lastStudiedAt })
            .eq("id", deck.id)
            .eq("user_id", u.id);
          syncDeckStateRows(deck);
        }
      })();
    },
    [flushAchievements, setState, syncDeckStateRows],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      user,
      setState,
      updateSettings: (patch) =>
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      resetSettings: () => setState((s) => ({ ...s, settings: DEFAULT_SETTINGS })),
      addDeck,
      addQuestions,
      updateDeck,
      deleteDeck,
      recordSession,
      saveTemplate: (t) =>
        setState((s) => ({
          ...s,
          templates: [t, ...s.templates.filter((x) => x.id !== t.id)],
        })),
      deleteTemplate: (id) =>
        setState((s) => ({ ...s, templates: s.templates.filter((t) => t.id !== id) })),
      completeOnboarding: () => setState((s) => ({ ...s, onboardingComplete: true })),
      resetAll: () => {
        setState(() => ({ ...DEFAULT_STATE, onboardingComplete: true }));
        const u = userRef.current;
        if (u) {
          void (async () => {
            await supabase.from("decks").delete().eq("user_id", u.id);
            await supabase.from("sessions").delete().eq("user_id", u.id);
            await supabase.from("quiz_results").delete().eq("user_id", u.id);
            await supabase.from("user_progress").upsert({
              user_id: u.id,
              payload: DEFAULT_PROGRESS as unknown as Json,
            });
            await supabase.from("user_settings").upsert({
              user_id: u.id,
              payload: DEFAULT_SETTINGS as unknown as Json,
              templates: [],
            });
          })();
        }
      },
      exportState: () => JSON.stringify(state, null, 2),
      importState: (json) => {
        try {
          const parsed = JSON.parse(json) as AppState;
          if (!parsed || typeof parsed !== "object") return false;
          const next = { ...DEFAULT_STATE, ...parsed };
          setState(() => next);
          const u = userRef.current;
          if (u) void pushFullState(u.id, next);
          return true;
        } catch {
          return false;
        }
      },
    }),
    [state, hydrated, user, setState, addDeck, addQuestions, updateDeck, deleteDeck, recordSession],
  );

  return <DecklyContext.Provider value={value}>{children}</DecklyContext.Provider>;
}

/** Push an entire AppState into the cloud (used for first-login + file imports). */
async function pushFullState(userId: string, s: AppState) {
  await supabase.from("decks").delete().eq("user_id", userId);
  for (const d of s.decks) {
    await supabase.from("decks").insert({
      id: d.id,
      user_id: userId,
      title: d.title,
      subject: d.subject,
      description: d.description ?? null,
      color: d.color,
      tags: d.tags,
      favorite: d.favorite,
      created_at_ms: d.createdAt,
      last_studied_at_ms: d.lastStudiedAt ?? null,
    });
    if (d.questions.length) {
      await supabase
        .from("questions")
        .insert(d.questions.map((q, i) => questionToRow(q, d.id, userId, i)));
    }
    const stateRows = d.questions
      .map((q) => {
        const mastered = d.masteredIds.includes(q.id);
        const bookmarked = d.bookmarks.includes(q.id);
        const note = d.notes[q.id] ?? null;
        if (!mastered && !bookmarked && !note) return null;
        return { user_id: userId, question_id: q.id, mastered, bookmarked, note };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (stateRows.length) await supabase.from("question_state").upsert(stateRows);
  }
  if (s.history.length) {
    await supabase.from("sessions").insert(
      s.history.map((h) => ({
        id: h.id,
        user_id: userId,
        date_ms: h.date,
        mode: h.mode,
        deck_titles: h.deckTitles,
        answered: h.answered,
        correct: h.correct,
        skipped: h.skipped,
        duration_ms: h.durationMs,
        xp_earned: h.xpEarned,
        percentage: h.percentage,
      })),
    );
  }
  if (s.results.length) {
    await supabase.from("quiz_results").insert(
      s.results.map((r) => ({
        id: r.id,
        user_id: userId,
        created_at_ms: r.createdAt,
        payload: r as unknown as Json,
      })),
    );
  }
  await supabase.from("user_progress").upsert({
    user_id: userId,
    payload: s.progress as unknown as Json,
  });
  await supabase.from("user_settings").upsert({
    user_id: userId,
    payload: s.settings as unknown as Json,
    templates: s.templates as unknown as Json,
  });
  await supabase.from("profiles").upsert({
    id: userId,
    display_name: s.settings.displayName,
    grade_level: s.settings.gradeLevel,
    school: s.settings.school,
    avatar_emoji: s.settings.avatarEmoji,
    focus_subjects: s.settings.focusSubjects,
    study_reason: s.settings.studyReason,
    daily_goal: s.settings.dailyGoal,
    onboarding_complete: s.onboardingComplete,
  });
}

export function useDeckly() {
  const ctx = useContext(DecklyContext);
  if (!ctx) throw new Error("useDeckly must be used inside DecklyProvider");
  return ctx;
}
