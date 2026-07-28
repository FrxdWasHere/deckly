import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Flame,
  WifiOff,
  Wand2,
  ClipboardCopy,
  Bot,
  FileJson,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudyForge } from "@/store/studyforge";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to StudyForge — Set Up Your Local Study Vault" },
      {
        name: "description",
        content:
          "Learn how StudyForge turns any AI-generated JSON question bank into an offline, local-first study platform with quizzes, XP and analytics.",
      },
      { property: "og:title", content: "Welcome to StudyForge" },
      {
        property: "og:description",
        content: "Generate a prompt, use any LLM, import the JSON, and study offline forever.",
      },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  {
    icon: Flame,
    title: "StudyForge is your study workshop",
    body: "A fast, local-first platform for turning raw material into flashcards, quizzes and long-term recall. Everything you create lives on this device.",
    points: [
      "No accounts, no sign-in, no backend",
      "Decks, stats, XP and settings persist locally",
      "Built to feel like a desktop app",
    ],
  },
  {
    icon: Bot,
    title: "StudyForge does not generate questions",
    body: "There is no AI inside this app and it never calls an AI service. Instead it writes a precise prompt for you to run in whichever model you already use.",
    points: [
      "Gemini, ChatGPT, Claude, OpenRouter, Ollama, LM Studio — your choice",
      "You stay in control of cost, privacy and model quality",
      "No API keys are ever stored here",
    ],
  },
  {
    icon: Wand2,
    title: "The four-step loop",
    body: "Paste your material into the Prompt Forge, copy the generated prompt, run it in your AI, then bring the JSON back here.",
    points: [
      "1. Prompt Forge builds a strict JSON instruction",
      "2. Your AI returns a StudyForge deck as JSON",
      "3. Import validates it and flags every problem",
      "4. Study, quiz and track progress offline forever",
    ],
  },
  {
    icon: WifiOff,
    title: "Offline from here on",
    body: "Once a deck exists you never need a connection again. Study modes, quizzes, statistics, achievements and exports all run locally.",
    points: [
      "Export decks and settings as JSON any time",
      "Import backups to move between machines",
      "Ready for desktop packaging later",
    ],
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useStudyForge();
  const navigate = useNavigate();
  const current = STEPS[step];
  const Icon = current.icon;

  const finish = (to: "/" | "/generate" | "/format") => {
    completeOnboarding();
    navigate({ to });
  };

  return (
    <div className="grid-forge relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-forge)]">
            <Flame className="size-6" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">StudyForge</p>
            <p className="text-xs text-muted-foreground">Local-first study platform · no AI inside</p>
          </div>
        </div>

        <div className="panel p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <h1 className="text-3xl font-bold">{current.title}</h1>
          <p className="mt-3 text-muted-foreground">{current.body}</p>

          <ul className="mt-6 space-y-2.5">
            {current.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          {step === 2 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {[
                { icon: Wand2, label: "Generate prompt" },
                { icon: ClipboardCopy, label: "Copy to your AI" },
                { icon: FileJson, label: "Import JSON" },
                { icon: GraduationCap, label: "Study offline" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-surface-2/60 p-4 text-center"
                >
                  <s.icon className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={
                    i === step
                      ? "h-1.5 w-8 rounded-full bg-primary"
                      : "h-1.5 w-3 rounded-full bg-border"
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft /> Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button onClick={() => finish("/generate")}>
                  Open Prompt Forge <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <button className="underline-offset-4 hover:underline" onClick={() => finish("/")}>
            Skip and go to dashboard
          </button>
          <button className="underline-offset-4 hover:underline" onClick={() => finish("/format")}>
            Show me the JSON format first
          </button>
        </div>
      </div>
    </div>
  );
}