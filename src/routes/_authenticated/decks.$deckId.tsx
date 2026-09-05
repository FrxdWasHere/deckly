import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Star, Trash2, Download, Play, BrainCircuit, Bookmark, Swords , Plus }from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/app-page";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TYPE_LABELS } from "@/lib/answers";
import { useStudyForge } from "@/store/studyforge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/decks/$deckId")({
  head: () => ({
    meta: [
      { title: "Deck Details — StudyForge" },
      {
        name: "description",
        content:
          "Inspect every question in a StudyForge deck, review bookmarks and notes, export the deck as JSON, or jump straight into study mode.",
      },
      { property: "og:title", content: "Deck Details — StudyForge" },
      {
        property: "og:description",
        content: "Review a deck's questions, mastery progress and notes offline.",
      },
    ],
  }),
  component: () => (
    <AppPage>
      <DeckDetail />
    </AppPage>
  ),
});

function DeckDetail() {
  const { deckId } = Route.useParams();
  const { state, updateDeck, deleteDeck } = useStudyForge();
  const navigate = useNavigate();
  const deck = state.decks.find((d) => d.id === deckId);

  if (!deck) {
    return (
      <div className="panel grid place-items-center p-16 text-center">
        <p className="font-medium">Deck not found</p>
        <Button className="mt-4" asChild>
          <Link to="/decks">Back to library</Link>
        </Button>
      </div>
    );
  }

  const pct = Math.round((deck.masteredIds.length / Math.max(1, deck.questions.length)) * 100);

  const exportDeck = () => {
    const payload = {
      title: deck.title,
      subject: deck.subject,
      description: deck.description,
      tags: deck.tags,
      questions: deck.questions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={deck.title}
        description={`${deck.subject} · ${deck.questions.length} questions · ${pct}% mastered`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => updateDeck(deck.id, { favorite: !deck.favorite })}>
              <Star className={cn(deck.favorite && "fill-primary text-primary")} />
              {deck.favorite ? "Favorited" : "Favorite"}
            </Button>
            <Button variant="outline" onClick={exportDeck}>
              <Download /> Export
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                deleteDeck(deck.id);
                toast.success("Deck deleted");
                navigate({ to: "/decks" });
              }}
            >
              <Trash2 /> Delete
            </Button>
            <Button asChild>
              <Link to="/study/$deckId" params={{ deckId: deck.id }}>
                <Play /> Study
              </Link>
            </Button>
            <Button className="press anim-glow" asChild>
              <Link to="/arena/$deckId" params={{ deckId: deck.id }}>
                <Swords /> Arena mode
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/import" search={{ deck: deck.id }}>
                <Plus /> Add questions
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/quiz">
                <BrainCircuit /> Quiz
              </Link>
            </Button>
          </div>
        }
      />

      {deck.description && <p className="mb-6 text-sm text-muted-foreground">{deck.description}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {deck.tags.map((t) => (
          <Badge key={t} variant="secondary">
            #{t}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        {deck.questions.map((q, i) => {
          const mastered = deck.masteredIds.includes(q.id);
          const bookmarked = deck.bookmarks.includes(q.id);
          return (
            <article key={q.id} className="panel p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono">#{i + 1}</span>
                <Badge variant="outline">{TYPE_LABELS[q.type]}</Badge>
                <Badge variant="outline" className="capitalize">
                  {q.difficulty}
                </Badge>
                {q.concept && <Badge variant="secondary">{q.concept}</Badge>}
                {mastered && <Badge className="bg-success text-success-foreground">Mastered</Badge>}
                <button
                  className="ml-auto"
                  aria-label="Toggle bookmark"
                  onClick={() =>
                    updateDeck(deck.id, {
                      bookmarks: bookmarked
                        ? deck.bookmarks.filter((b) => b !== q.id)
                        : [...deck.bookmarks, q.id],
                    })
                  }
                >
                  <Bookmark
                    className={cn("size-4", bookmarked ? "fill-primary text-primary" : "")}
                  />
                </button>
              </div>
              <p className="mt-3 font-medium">{q.question}</p>
              {q.options && (
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {q.options.map((o) => (
                    <li
                      key={o}
                      className={cn(
                        "rounded-md border border-border px-3 py-1.5 text-xs",
                        o === q.answer && "border-success/60 text-success",
                      )}
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Answer: </span>
                <span className="text-success">{q.answer}</span>
              </p>
              {q.explanation && (
                <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>
              )}
              {deck.notes[q.id] && (
                <p className="mt-2 rounded-md bg-surface-2/60 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Your note: </span>
                  {deck.notes[q.id]}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}