import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/app-page";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ACCENTS } from "@/lib/defaults";
import { useStudyForge } from "@/store/studyforge";
import { cn } from "@/lib/utils";
import type { Settings } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Appearance, Study & Data Controls | StudyForge" },
      {
        name: "description",
        content:
          "Tune accent colors, density, accessibility, study behaviour and gamification, then export, import or wipe all locally stored StudyForge data.",
      },
      { property: "og:title", content: "Settings — StudyForge" },
      {
        property: "og:description",
        content: "Full control over appearance, accessibility, study rules and your local data.",
      },
    ],
  }),
  component: () => (
    <AppPage>
      <SettingsPage />
    </AppPage>
  ),
});

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const { state, updateSettings, resetSettings, resetAll, exportState, importState } =
    useStudyForge();
  const s = state.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    updateSettings({ [key]: value } as Partial<Settings>);

  const download = () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studyforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Settings"
        description="Everything is stored locally in this browser. Nothing is ever uploaded."
        action={
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw /> Reset settings
          </Button>
        }
      />

      <div className="grid gap-6">
        <Section title="Profile & goals">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Display name</Label>
              <Input value={s.displayName} onChange={(e) => set("displayName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Daily goal</Label>
                <Badge variant="secondary">{s.dailyGoal} questions</Badge>
              </div>
              <Slider
                value={[s.dailyGoal]}
                min={5}
                max={200}
                step={5}
                onValueChange={([v]) => set("dailyGoal", v)}
              />
            </div>
          </div>
          <Toggle
            label="Confirm before leaving a session"
            checked={s.confirmBeforeExit}
            onChange={(v) => set("confirmBeforeExit", v)}
          />
        </Section>

        <Section title="Appearance">
          <div>
            <Label className="text-xs">Accent</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => set("accent", a.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs",
                    s.accent === a.id && "border-primary bg-primary/15 text-primary",
                  )}
                >
                  <span className="size-3 rounded-full" style={{ background: a.value }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Font scale</Label>
                <Badge variant="secondary">{s.fontScale.toFixed(2)}×</Badge>
              </div>
              <Slider
                value={[s.fontScale]}
                min={0.85}
                max={1.3}
                step={0.05}
                onValueChange={([v]) => set("fontScale", v)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Corner radius</Label>
                <Badge variant="secondary">{s.radius.toFixed(2)}rem</Badge>
              </div>
              <Slider
                value={[s.radius]}
                min={0}
                max={1.5}
                step={0.05}
                onValueChange={([v]) => set("radius", v)}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Density</Label>
              <div className="mt-2 flex gap-2">
                {(["compact", "cozy", "spacious"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => set("density", d)}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-xs capitalize",
                      s.density === d && "border-primary bg-primary/15 text-primary",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Button size</Label>
              <div className="mt-2 flex gap-2">
                {(["sm", "default", "lg"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => set("buttonSize", b)}
                    className={cn(
                      "rounded-full border border-border px-3 py-1.5 text-xs capitalize",
                      s.buttonSize === b && "border-primary bg-primary/15 text-primary",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Toggle
            label="Show progress bars"
            checked={s.showProgressBars}
            onChange={(v) => set("showProgressBars", v)}
          />
        </Section>

        <Section title="Accessibility">
          <Toggle
            label="Reduced motion"
            hint="Disable animations and transitions"
            checked={s.reducedMotion}
            onChange={(v) => set("reducedMotion", v)}
          />
          <Toggle
            label="High contrast"
            checked={s.highContrast}
            onChange={(v) => set("highContrast", v)}
          />
          <Toggle
            label="Colorblind-safe palette"
            hint="Swap correct/incorrect colors for blue and orange"
            checked={s.colorblindPalette}
            onChange={(v) => set("colorblindPalette", v)}
          />
          <Toggle
            label="Strong focus indicators"
            checked={s.focusIndicators}
            onChange={(v) => set("focusIndicators", v)}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Timer multiplier</Label>
              <Badge variant="secondary">{s.timerMultiplier.toFixed(1)}×</Badge>
            </div>
            <Slider
              value={[s.timerMultiplier]}
              min={0.5}
              max={3}
              step={0.5}
              onValueChange={([v]) => set("timerMultiplier", v)}
            />
          </div>
        </Section>

        <Section title="Study behaviour">
          <Toggle
            label="Auto-reveal answers"
            checked={s.autoReveal}
            onChange={(v) => set("autoReveal", v)}
          />
          <Toggle
            label="Shuffle study order"
            checked={s.shuffleStudy}
            onChange={(v) => set("shuffleStudy", v)}
          />
          <Toggle label="Show hints" checked={s.showHints} onChange={(v) => set("showHints", v)} />
          <Toggle
            label="Show explanations"
            checked={s.showExplanations}
            onChange={(v) => set("showExplanations", v)}
          />
        </Section>

        <Section title="Gamification">
          <Toggle label="Earn XP" checked={s.xpEnabled} onChange={(v) => set("xpEnabled", v)} />
          <Toggle
            label="Achievement popups"
            checked={s.achievementPopups}
            onChange={(v) => set("achievementPopups", v)}
          />
          <Toggle
            label="Sound effects"
            checked={s.soundEnabled}
            onChange={(v) => set("soundEnabled", v)}
          />
          <Toggle
            label="Developer mode"
            hint="Show raw state details in the dashboard"
            checked={s.devMode}
            onChange={(v) => set("devMode", v)}
          />
        </Section>

        <Section
          title="Data"
          description={`${state.decks.length} decks · ${state.history.length} sessions stored on this device.`}
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={download}>
              <Download /> Export backup
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload /> Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const ok = importState(await file.text());
                toast[ok ? "success" : "error"](
                  ok ? "Backup restored" : "That file isn't a valid StudyForge backup",
                );
                e.target.value = "";
              }}
            />
            <Button
              variant="destructive"
              onClick={() => {
                if (!confirmWipe) {
                  setConfirmWipe(true);
                  return;
                }
                resetAll();
                setConfirmWipe(false);
                toast.success("All local data erased");
              }}
            >
              <Trash2 /> {confirmWipe ? "Click again to confirm" : "Erase all data"}
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}