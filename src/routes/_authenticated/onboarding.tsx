import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
  UserRound,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AVATAR_EMOJIS, GRADE_LEVELS, STUDY_REASONS, SUBJECT_SUGGESTIONS } from "@/lib/defaults";
import { validateDeckJson, type ValidationResult } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { useStudyForge } from "@/store/studyforge";

export const Route = createFileRoute("/_authenticated/onboarding")({
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
  {
    icon: UserRound,
    title: "Create your profile",
    body: "Just for you — it personalises your dashboard, goals and reports. Nothing ever leaves this device.",
    points: [] as string[],
  },
  {
    icon: FileJson,
    title: "Import your first deck",
    body: "Already have StudyForge JSON from your AI? Drop it in now and you'll land straight in your library. Otherwise skip — you can import at any time.",
    points: [] as string[],
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const { state, completeOnboarding, updateSettings, addDeck } = useStudyForge();
  const navigate = useNavigate();
  const current = STEPS[step];
  const Icon = current.icon;
  const settings = state.settings;
  const isProfile = step === 4;
  const isImport = step === 5;

  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const evaluate = (text: string) => {
    setRaw(text);
    setImported(false);
    setResult(text.trim() ? validateDeckJson(text) : null);
  };

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const finish = (to: "/" | "/generate" | "/format" | "/decks") => {
    completeOnboarding();
    navigate({ to });
  };

  const doImport = () => {
    if (!result?.ok || !result.deck) return;
    addDeck(result.deck);
    setImported(true);
    toast.success(`Imported "${result.deck.title}"`);
  };

  return (
    <div className="grid-forge relative min-h-screen bg-background">
      <div className="anim-fade-in absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="anim-fade-up mb-10 flex items-center gap-3">
          <div className="anim-float grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-forge)]">
            <Flame className="size-6" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">StudyForge</p>
            <p className="text-xs text-muted-foreground">Local-first study platform · no AI inside</p>
          </div>
        </div>

        <div key={step} className="panel anim-fade-up p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="anim-pop grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <h1 className="text-3xl font-bold">{current.title}</h1>
          <p className="mt-3 text-muted-foreground">{current.body}</p>

          <ul className="stagger mt-6 space-y-2.5">
            {current.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          {step === 2 && (
            <div className="stagger mt-8 grid gap-3 sm:grid-cols-4">
              {[
                { icon: Wand2, label: "Generate prompt" },
                { icon: ClipboardCopy, label: "Copy to your AI" },
                { icon: FileJson, label: "Import JSON" },
                { icon: GraduationCap, label: "Study offline" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="hover-lift rounded-xl border border-border bg-surface-2/60 p-4 text-center"
                >
                  <s.icon className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {isProfile && (
            <div className="mt-6 space-y-6">
              <div>
                <Label className="text-xs">Pick an avatar</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVATAR_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => updateSettings({ avatarEmoji: e })}
                      className={cn(
                        "press grid size-10 place-items-center rounded-xl border border-border text-lg transition-all hover:scale-110",
                        settings.avatarEmoji === e && "scale-110 border-primary bg-primary/15",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">What should we call you?</Label>
                  <Input
                    value={settings.displayName}
                    onChange={(e) => updateSettings({ displayName: e.target.value })}
                    placeholder="Your name"
                    maxLength={40}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">School / institution</Label>
                  <Input
                    value={settings.school}
                    onChange={(e) => updateSettings({ school: e.target.value })}
                    placeholder="Optional"
                    maxLength={80}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Grade level</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GRADE_LEVELS.map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        updateSettings({ gradeLevel: settings.gradeLevel === g ? "" : g })
                      }
                      className={cn(
                        "press rounded-full border border-border px-3 py-1.5 text-xs transition-colors",
                        settings.gradeLevel === g && "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Subjects you're focusing on</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUBJECT_SUGGESTIONS.map((sub) => (
                    <button
                      key={sub}
                      onClick={() =>
                        updateSettings({ focusSubjects: toggle(settings.focusSubjects, sub) })
                      }
                      className={cn(
                        "press rounded-full border border-border px-3 py-1.5 text-xs transition-colors",
                        settings.focusSubjects.includes(sub) &&
                          "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Why are you studying?</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STUDY_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        updateSettings({ studyReason: settings.studyReason === r ? "" : r })
                      }
                      className={cn(
                        "press rounded-full border border-border px-3 py-1.5 text-xs transition-colors",
                        settings.studyReason === r && "border-primary bg-primary/15 text-primary",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Daily goal — {settings.dailyGoal} questions</Label>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={settings.dailyGoal}
                  onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
            </div>
          )}

          {isImport && (
            <div className="mt-6 space-y-4">
              <Button variant="outline" className="press" onClick={() => fileRef.current?.click()}>
                <Upload /> Choose a .json file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  evaluate(await file.text());
                }}
              />

              <Textarea
                value={raw}
                onChange={(e) => evaluate(e.target.value)}
                placeholder={'Or paste deck JSON here — { "title": "…", "questions": [ … ] }'}
                className="min-h-40 font-mono text-xs"
              />

              {result && (
                <div
                  className={cn(
                    "anim-fade-up rounded-xl border p-4 text-sm",
                    result.ok
                      ? "border-success/50 bg-success/10"
                      : "border-destructive/50 bg-destructive/10",
                  )}
                >
                  <p className="flex items-center gap-2 font-medium">
                    {result.ok ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <AlertTriangle className="size-4 text-destructive" />
                    )}
                    {result.ok
                      ? `Valid deck — ${result.deck?.questions.length} questions`
                      : "This JSON can't be imported yet"}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {[...result.errors, ...result.warnings].slice(0, 6).map((m) => (
                      <li key={m}>· {m}</li>
                    ))}
                  </ul>
                  {result.ok && (
                    <Button className="press mt-4" disabled={imported} onClick={doImport}>
                      {imported ? "Imported" : "Import this deck"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={
                    i === step
                      ? "h-1.5 w-8 rounded-full bg-primary transition-all duration-300"
                      : "h-1.5 w-3 rounded-full bg-border transition-all duration-300"
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" className="press" onClick={() => setStep((v) => v - 1)}>
                  <ArrowLeft /> Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button className="press" onClick={() => setStep((v) => v + 1)}>
                  Continue <ArrowRight />
                </Button>
              ) : imported ? (
                <Button className="press anim-glow" onClick={() => finish("/decks")}>
                  Go to my library <ArrowRight />
                </Button>
              ) : (
                <Button className="press" onClick={() => finish("/generate")}>
                  Open Prompt Forge <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="anim-fade-in mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <button className="underline-offset-4 hover:underline" onClick={() => finish("/")}>
            Skip and go to dashboard
          </button>
          <button className="underline-offset-4 hover:underline" onClick={() => finish("/format")}>
            Show me the JSON format first
          </button>
          <button className="underline-offset-4 hover:underline" onClick={() => setStep(5)}>
            I already have JSON — import it now
          </button>
        </div>
      </div>
    </div>
  );
}