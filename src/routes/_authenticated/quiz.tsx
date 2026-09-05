import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/components/app-page";
import { QuizEngine } from "@/components/quiz/quiz-engine";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Practice Quiz — Configurable Offline Quiz Engine | StudyForge" },
      {
        name: "description",
        content:
          "Configure question count, types, difficulty, timers and scoring, then run a fully offline practice quiz with instant feedback, XP and a detailed report.",
      },
      { property: "og:title", content: "Practice Quiz — StudyForge" },
      {
        property: "og:description",
        content: "A deeply configurable offline quiz engine with XP, combos and analytics.",
      },
    ],
  }),
  component: () => (
    <AppPage>
      <QuizEngine />
    </AppPage>
  ),
});