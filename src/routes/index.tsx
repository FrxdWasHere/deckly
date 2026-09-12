import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Flame,
  ArrowRight,
  Cloud,
  Bot,
  Swords,
  BarChart3,
  Trophy,
  UserRound,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { setGuest, isGuest } from "@/lib/guest";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Deckly | Your flashcards, forged to perfection." },
      {
        name: "description",
        content:
          "Create an account to sync decks, XP, streaks and quiz history across devices — or start instantly as a guest. Deckly turns AI-generated question banks into flashcards, quizzes and an XP arena.",
      },
      { property: "og:title", content: "Deckly | Your flashcards, forged to perfection." },
      {
        property: "og:description",
        content:
          "Sign up to sync your decks and progress to the cloud, or continue as a guest on this device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Bot,
    title: "Bring your own AI",
    body: "Prompt Forge writes a strict prompt for ChatGPT, Gemini, Claude — anything. Deckly never calls an AI itself.",
  },
  {
    icon: Cloud,
    title: "Your account, everywhere",
    body: "Decks, XP, streaks, notes and quiz history sync to your account and follow you to any device.",
  },
  {
    icon: Swords,
    title: "Deck Arena",
    body: "Timed rounds, lives, combo multipliers and XP you actually keep when the round ends.",
  },
  {
    icon: BarChart3,
    title: "Real analytics",
    body: "Concept heatmaps, weak-topic detection, accuracy trends and shareable quiz reports.",
  },
  {
    icon: Trophy,
    title: "Levels & achievements",
    body: "Earn XP for every correct answer, climb levels and unlock achievements as your streak grows.",
  },
  {
    icon: Sparkles,
    title: "Yours to shape",
    body: "Accent colours, wallpapers, dashboard widgets, high-contrast and reduced-motion modes.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      if (data.user || isGuest()) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, [navigate]);

  const continueAsGuest = () => {
    setGuest(true);
    navigate({ to: "/onboarding" });
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Flame className="anim-float size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="grid-forge relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_62%)]" />
      <div className="anim-float pointer-events-none absolute -right-24 top-32 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="anim-float pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-primary/10 blur-3xl [animation-delay:1.2s]" />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-10">
        <header className="anim-fade-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-forge)]">
              <Flame className="size-5" />
            </div>
            <span className="font-display text-lg font-bold">Deckly</span>
          </div>
          <Button variant="ghost" onClick={() => navigate({ to: "/auth" })}>
            Sign in
          </Button>
        </header>

        <section className="py-16 text-center sm:py-24">
          <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/70 px-3 py-1.5 text-xs text-muted-foreground">
            <Cloud className="size-3.5 text-primary" /> Now online: Bring your decks with you, across all of your devices.
          </p>
          <h1 className="anim-fade-up mt-6 text-balance font-display text-4xl font-bold leading-tight sm:text-6xl [animation-delay:80ms]">
            It's like Gizmo, 
            <span className="block bg-[linear-gradient(100deg,var(--primary),var(--primary-glow))] bg-clip-text text-transparent">
              but it's free.
            </span>
          </h1>
          <p className="anim-fade-up mx-auto mt-5 max-w-xl text-pretty text-muted-foreground [animation-delay:140ms]">
            Paste your material, run the generated prompt in whichever AI you like, bring the JSON
            back, and Deckly turns it into flashcards, quizzes, an XP arena and real analytics.
          </p>

          <div className="anim-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:200ms]">
            <Button size="lg" className="press hover-lift w-full sm:w-auto" onClick={() => navigate({ to: "/auth" })}>
              Create your free account <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="press w-full sm:w-auto"
              onClick={continueAsGuest}
            >
              <UserRound /> Continue as guest
            </Button>
          </div>
          <p className="anim-fade-up mt-3 text-xs text-muted-foreground [animation-delay:240ms]">
            Guest mode keeps everything on this device only — you can create an account later and
            bring your decks and all your progress with you.
          </p>
        </section>

        <section className="stagger grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="hover-lift panel p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          Deckly · your study workshop. No AI inside — you bring the model.
        </footer>
      </div>
    </div>
  );
}
