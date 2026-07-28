import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Library,
  Wand2,
  FileJson,
  Download,
  BrainCircuit,
  BarChart3,
  Trophy,
  Settings as SettingsIcon,
  Flame,
  Zap,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useStudyForge } from "@/store/studyforge";
import { levelFromXp } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/decks", label: "Deck Library", icon: Library, exact: false },
  { to: "/generate", label: "Prompt Forge", icon: Wand2, exact: false },
  { to: "/import", label: "Import JSON", icon: Download, exact: false },
  { to: "/format", label: "JSON Format", icon: FileJson, exact: false },
  { to: "/quiz", label: "Practice Quiz", icon: BrainCircuit, exact: false },
  { to: "/stats", label: "Statistics", icon: BarChart3, exact: false },
  { to: "/achievements", label: "Achievements", icon: Trophy, exact: false },
  { to: "/settings", label: "Settings", icon: SettingsIcon, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, updateSettings } = useStudyForge();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const collapsed = state.settings.sidebarCollapsed;
  const { level, pct, intoLevel, needed } = levelFromXp(state.progress.lifetimeXp);
  const density = state.settings.density;
  const pad = density === "compact" ? "p-4" : density === "spacious" ? "p-10" : "p-6 md:p-8";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all md:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Flame className="size-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-base font-bold leading-none">StudyForge</p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">Local-first studying</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--primary)]",
                )}
              >
                <item.icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-sidebar-accent/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Lv {level}</span>
              {!collapsed && (
                <span className="text-muted-foreground">
                  {intoLevel}/{needed} XP
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => updateSettings({ sidebarCollapsed: !collapsed })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <Flame className="size-5 text-primary" />
            <span className="font-display font-bold">StudyForge</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="inline-flex size-1.5 rounded-full bg-success" />
            Offline-ready · all data stored on this device
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
              <Flame className="size-3.5 text-primary" />
              {state.progress.streak} day
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
              <Zap className="size-3.5 text-primary" />
              {state.progress.lifetimeXp.toLocaleString()} XP
            </span>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface/40 px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className={cn("flex-1", pad)}>{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}