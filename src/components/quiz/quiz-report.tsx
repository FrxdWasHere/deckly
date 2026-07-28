import { useMemo } from "react";
import { RotateCcw, Repeat, Home, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, TYPE_LABELS } from "@/lib/answers";
import { gradeFor } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { QuizResult } from "@/lib/types";

export function QuizReport({
  result,
  onRetry,
  onRetryIncorrect,
  onHome,
  onBackToSetup,
}: {
  result: QuizResult;
  onRetry: () => void;
  onRetryIncorrect: () => void;
  onHome: () => void;
  onBackToSetup: () => void;
}) {
  const wrong = result.answers.filter((a) => !a.correct);
  const avgTime = result.answers.length
    ? result.answers.reduce((s, a) => s + a.timeMs, 0) / result.answers.length
    : 0;

  const byConcept = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    result.answers.forEach((a) => {
      const key = a.concept ?? "Uncategorized";
      const prev = map[key] ?? { correct: 0, total: 0 };
      map[key] = { correct: prev.correct + (a.correct ? 1 : 0), total: prev.total + 1 };
    });
    return Object.entries(map).sort(
      (a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total,
    );
  }, [result.answers]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="panel p-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {result.deckTitles.join(" · ") || "Mixed decks"}
        </p>
        <p
          className={cn(
            "mt-4 font-display text-7xl font-black",
            result.passed ? "text-success" : "text-destructive",
          )}
        >
          {gradeFor(result.percentage)}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {result.percentage}% · {result.score}/{result.total}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.passed
            ? `Passed — target was ${result.config.passingScore}%`
            : `Below the ${result.config.passingScore}% target. Forge on.`}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Time", value: formatDuration(result.durationMs) },
            { label: "Avg / question", value: `${(avgTime / 1000).toFixed(1)}s` },
            { label: "XP earned", value: `+${result.xpEarned}` },
            { label: "Missed", value: `${wrong.length}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-surface-2/60 p-4">
              <p className="font-display text-lg font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button onClick={onRetry}>
            <RotateCcw /> Retake quiz
          </Button>
          <Button variant="secondary" disabled={!wrong.length} onClick={onRetryIncorrect}>
            <Repeat /> Retry missed ({wrong.length})
          </Button>
          <Button variant="outline" onClick={onBackToSetup}>
            <SlidersHorizontal /> Change setup
          </Button>
          <Button variant="ghost" onClick={onHome}>
            <Home /> Dashboard
          </Button>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-sm font-semibold">Performance by concept</h2>
        <div className="mt-4 space-y-3">
          {byConcept.map(([concept, s]) => {
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <div key={concept}>
                <div className="flex items-center justify-between text-xs">
                  <span>{concept}</span>
                  <span className="text-muted-foreground">
                    {s.correct}/{s.total} · {pct}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 80 ? "bg-success" : pct >= 50 ? "bg-primary" : "bg-destructive",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-sm font-semibold">Question review</h2>
        <ul className="mt-4 space-y-3">
          {result.answers.map((a, i) => (
            <li
              key={`${a.questionId}-${i}`}
              className={cn(
                "rounded-xl border p-4 text-sm",
                a.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <Badge variant="outline">{TYPE_LABELS[a.type]}</Badge>
                <Badge variant="outline" className="capitalize">
                  {a.difficulty}
                </Badge>
                {a.concept && <Badge variant="secondary">{a.concept}</Badge>}
                <span className="ml-auto text-muted-foreground">
                  {(a.timeMs / 1000).toFixed(1)}s
                </span>
              </div>
              <p className="mt-2">
                {a.skipped ? "Skipped" : a.correct ? "Correct" : "Incorrect"}
                {a.given ? ` — you answered “${a.given}”` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}