import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, XCircle, AlertTriangle, FileJson, X } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/app-page";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { validateDeckJson, type ValidationResult } from "@/lib/schema";
import { TYPE_LABELS } from "@/lib/answers";
import { useStudyForge } from "@/store/studyforge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import a Deck — Validate AI JSON | StudyForge" },
      {
        name: "description",
        content:
          "Paste, upload or drag-and-drop AI-generated JSON. StudyForge validates the schema, previews the deck and imports it locally.",
      },
      { property: "og:title", content: "Import a Deck — StudyForge" },
      {
        property: "og:description",
        content: "Validate and import AI-generated question banks into your offline library.",
      },
    ],
  }),
  component: () => (
    <AppPage>
      <ImportPage />
    </AppPage>
  ),
});

function ImportPage() {
  const { addDeck } = useStudyForge();
  const navigate = useNavigate();
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = (text: string) => {
    setRaw(text);
    setResult(text.trim() ? validateDeckJson(text) : null);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => validate(String(reader.result));
    reader.readAsText(file);
  };

  const doImport = () => {
    if (!result?.deck) return;
    addDeck(result.deck);
    toast.success(`Imported “${result.deck.title}”`, {
      description: `${result.deck.questions.length} questions added to your library.`,
    });
    navigate({ to: "/decks/$deckId", params: { deckId: result.deck.id } });
  };

  const deck = result?.deck;
  const typeCounts = deck
    ? deck.questions.reduce<Record<string, number>>((acc, q) => {
        acc[q.type] = (acc[q.type] ?? 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Import JSON"
        description="Bring back what your AI produced. Nothing is saved until validation passes and you confirm."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
        className={cn(
          "panel flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center transition-colors",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <UploadCloud className="size-8 text-primary" />
        <p className="text-sm font-medium">Drag & drop a .json file here</p>
        <p className="text-xs text-muted-foreground">or</p>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <FileJson /> Choose a file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
          }}
        />
      </div>

      <section className="panel mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Paste JSON</h2>
          <span className="text-xs text-muted-foreground">{raw.length.toLocaleString()} chars</span>
        </div>
        <Textarea
          value={raw}
          onChange={(e) => validate(e.target.value)}
          placeholder='{ "title": "…", "questions": [ … ] }'
          className="mt-3 min-h-52 font-mono text-xs"
        />
      </section>

      {result && (
        <section className="panel mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                result.ok ? "text-success" : "text-destructive",
              )}
            >
              {result.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {result.ok ? "Validation passed" : `Validation failed — ${result.errors.length} error(s)`}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setRaw("");
                  setResult(null);
                }}
              >
                <X /> Cancel
              </Button>
              <Button disabled={!result.ok} onClick={doImport}>
                Import deck
              </Button>
            </div>
          </div>

          {result.errors.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.errors.map((e) => (
                <li
                  key={e}
                  className="rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
                >
                  {e}
                </li>
              ))}
            </ul>
          )}

          {result.warnings.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.warnings.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning"
                >
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          )}

          {deck && (
            <div className="mt-6 rounded-xl border border-border bg-surface-2/50 p-5">
              <p className="font-display text-lg font-bold">{deck.title}</p>
              <p className="text-xs text-muted-foreground">
                {deck.subject} · {deck.questions.length} questions
              </p>
              {deck.description && <p className="mt-2 text-sm">{deck.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(typeCounts).map(([t, n]) => (
                  <Badge key={t} variant="secondary">
                    {TYPE_LABELS[t] ?? t}: {n}
                  </Badge>
                ))}
                {deck.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    #{t}
                  </Badge>
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {deck.questions.slice(0, 3).map((q) => (
                  <li key={q.id} className="rounded-lg bg-background/40 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">{TYPE_LABELS[q.type]} · {q.difficulty}</span>
                    <p className="mt-1">{q.question}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}