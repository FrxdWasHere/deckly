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
      { title: "Sign in — StudyForge" },
      { name: "description", content: "Sign in to StudyForge to sync your decks, XP, streaks and quiz history across devices." },
      { property: "og:title", content: "Sign in — StudyForge" },
      { property: "og:description", content: "Sign in to StudyForge to sync your decks, XP, streaks and quiz history across devices." },
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
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="anim-fade-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="anim-pop mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Flame className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold">StudyForge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {confirmSent
              ? "Check your inbox"
              : mode === "signin"
                ? "Welcome back. Your streak missed you."
                : "Create your account — your decks sync everywhere."}
          </p>
        </div>

        {confirmSent ? (
          <div className="panel p-6 text-center">
            <Mail className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm">
              We sent a confirmation link to <strong>{email}</strong>. Confirm it, then sign in.
            </p>
            <Button
              variant="outline"
              className="mt-5 w-full"
              onClick={() => {
                setConfirmSent(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <div className="panel space-y-4 p-6">
            <Button
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={signInGoogle}
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2.05 3.5-5.05 3.5-8.58z"/>
                <path fill="#34A853" d="M12 24c3.2 0 5.9-1.06 7.9-2.9l-3.76-2.9c-1 .7-2.36 1.2-4.1 1.2-3.13 0-5.8-2.1-6.74-5.02l-.14.01-3.68 2.85-.05.14C3.4 21.3 7.4 24 12 24z"/>
                <path fill="#FBBC05" d="M5.26 14.38A7.4 7.4 0 0 1 4.86 12c0-.83.14-1.63.38-2.38l-.01-.16-3.72-2.89-.12.06A11.96 11.96 0 0 0 0 12c0 1.93.47 3.76 1.29 5.37l3.97-2.99z"/>
                <path fill="#EA4335" d="M12 4.6c2.25 0 3.77.97 4.64 1.78l3.39-3.3C17.86 1.19 15.2 0 12 0 7.4 0 3.4 2.7 1.29 6.63l3.98 3c.94-2.92 3.6-5.03 6.73-5.03z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitEmail()}
              />
            </div>

            <Button className="w-full" disabled={busy || !email.trim() || !password} onClick={submitEmail}>
              {mode === "signin" ? <LogIn /> : <UserPlus />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <button
              className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
