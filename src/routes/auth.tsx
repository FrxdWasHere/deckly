import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame, LogIn, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Deckly" },
      { name: "description", content: "Sign in to Deckly to sync your decks, XP, streaks and quiz history across devices." },
      { property: "og:title", content: "Sign in — Deckly" },
      { property: "og:description", content: "Sign in to Deckly to sync your decks, XP, streaks and quiz history across devices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const afterAuth = () => navigate({ to: "/dashboard", replace: true });

  const submitEmail = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        afterAuth();
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setConfirmSent(true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      afterAuth();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left panel — forge showcase */}
      <div className="relative hidden w-1/2 overflow-hidden border-r border-border lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[10%] -top-[10%] h-[70%] w-[70%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="grid-forge absolute inset-0 opacity-60" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <div className="anim-fade-up flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Flame className="size-5" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">Deckly</span>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.12s" }}>
            <h2 className="mb-6 font-display text-4xl font-light leading-tight xl:text-5xl">
              Master your craft, <br />
              <span className="ember-text font-bold">one deck at a time.</span>
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
              Decks, quizzes and streaks — forged into a study habit that actually sticks.
            </p>
          </div>
        <div className="anim-fade-up flex gap-8 text-sm font-medium text-muted-foreground" style={{ animationDelay: "0.2s" }}>
          </div>
        </div>
      </div> .

      {/* Right panel — auth form */}
      <div className="flex w-full items-center justify-center bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_7%,transparent),transparent)] p-6 sm:p-10 lg:w-1/2 lg:p-16">
        <div className="anim-fade-up w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Flame className="size-4" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Deckly</span>
          </div>

          {confirmSent ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Mail className="size-6" />
                </div>
                <h1 className="pt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Check your inbox
                </h1>
                <p className="text-muted-foreground">
                  We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
                  Confirm it, then sign in.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl py-6"
                onClick={() => {
                  setConfirmSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-muted-foreground">
                  {mode === "signin"
                    ? "Your streak missed you. Enter your details to sign in."
                    : "Your decks, XP and streaks sync everywhere."}
                </p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={signInGoogle}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 font-medium transition-all duration-300 hover:bg-secondary disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="size-5 transition-transform group-hover:scale-110" aria-hidden>
                  <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2.05 3.5-5.05 3.5-8.58z"/>
                  <path fill="#34A853" d="M12 24c3.2 0 5.9-1.06 7.9-2.9l-3.76-2.9c-1 .7-2.36 1.2-4.1 1.2-3.13 0-5.8-2.1-6.74-5.02l-.14.01-3.68 2.85-.05.14C3.4 21.3 7.4 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.26 14.38A7.4 7.4 0 0 1 4.86 12c0-.83.14-1.63.38-2.38l-.01-.16-3.72-2.89-.12.06A11.96 11.96 0 0 0 0 12c0 1.93.47 3.76 1.29 5.37l3.97-2.99z"/>
                  <path fill="#EA4335" d="M12 4.6c2.25 0 3.77.97 4.64 1.78l3.39-3.3C17.86 1.19 15.2 0 12 0 7.4 0 3.4 2.7 1.29 6.63l3.98 3c.94-2.92 3.6-5.03 6.73-5.03z"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">or with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="ml-1">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-border bg-secondary/50 px-4 py-6 placeholder:text-muted-foreground/60 focus-visible:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="ml-1">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitEmail()}
                    className="rounded-xl border-border bg-secondary/50 px-4 py-6 placeholder:text-muted-foreground/60 focus-visible:ring-primary/50"
                  />
                </div>

                <Button
                  className="press mt-2 w-full rounded-xl py-6 font-bold shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
                  disabled={busy || !email.trim() || !password}
                  onClick={submitEmail}
                >
                  {mode === "signin" ? <LogIn /> : <UserPlus />}
                  {mode === "signin" ? "Sign in to Deckly" : "Create account"}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New here? " : "Already have an account? "}
                <button
                  type="button"
                  className="font-semibold text-foreground transition-colors hover:text-primary"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
