# StudyForge

> Turn any AI-generated JSON question bank into a polished study session — flashcards, quizzes, an XP arena, and real analytics.

[![Live Preview](https://img.shields.io/badge/Live%20Preview-StudyForge-blue)](https://id-preview--da147d52-248d-48c1-b85c-ad3de32156b9.lovable.app)

![StudyForge preview](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/73a20bc8-a697-475c-adfb-64348f72b302/id-preview-91177294--aae57bb8-07a6-43ea-a58c-114412ffe651.lovable.app-1785229173023.png)

StudyForge is a study platform that works with AI-generated question banks. It does **not** call any AI service itself. Instead, it provides a **Prompt Forge** that writes a strict prompt for the user's preferred LLM (ChatGPT, Gemini, Claude, OpenRouter, Ollama, etc.). The user brings the resulting JSON back, StudyForge validates it, and turns it into a fully synced study library.

---

## Features

- **Accounts & cloud sync** — decks, progress, XP, streaks, notes, and quiz history follow you across devices.
- **Guest mode** — start instantly on one device and create an account later.
- **Prompt Forge** — generate, copy, and customize prompts for any LLM.
- **JSON import** — paste, upload, or drag-and-drop JSON; validation with useful error messages.
- **Deck library** — search, sort, favorites, tags, colors, completion stats.
- **Study mode** — flashcards, multiple choice, true/false, fill-in-the-blank, short answer; bookmarks, notes, hints.
- **Quiz engine** — configurable timers, shuffle, difficulty filters, instant feedback, review mode.
- **Deck Arena** — timed rounds, lives, combo multipliers, and XP rewards.
- **XP & achievements** — levels, streaks, perfect quizzes, and unlockable badges.
- **Analytics** — concept heatmaps, weak topics, accuracy trends, quiz reports.
- **Deep customization** — themes, accent colors, wallpapers, fonts, density, dashboard layout, reduced motion, high contrast.

---

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) v1 + [React](https://react.dev) 19 + [TypeScript](https://www.typescriptlang.org/)
- **Build tool:** [Vite](https://vitejs.dev/) 8
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4 + shadcn/ui primitives (Radix)
- **Backend:** Lovable Cloud / Supabase — auth, Postgres database, row-level security, file storage
- **State & data:** TanStack Query, Zustand-style store (`src/store/studyforge.tsx`)
- **Charts & UI:** Recharts, Sonner, date-fns, Zod, Lucide icons

---

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- npm, pnpm, yarn, or Bun

### Install

```bash
bun install
# or
npm install
```

### Run locally

```bash
bun dev
# or
npm run dev
```

The dev server starts at `http://localhost:8080`.

### Build

```bash
bun run build
# or
npm run build
```

> **Note:** Lovable Cloud injects the required Supabase environment variables automatically in preview and published deployments. If you clone the repo outside Lovable, you will need to provide your own Supabase project credentials (see [Environment](#environment) below) or use guest mode for local-only testing.

---

## Project Structure

```text
src/
  routes/              # TanStack Start file-based routes
    __root.tsx         # Root layout, providers, global head meta
    index.tsx          # Landing page
    auth.tsx           # Sign up / sign in
    _authenticated/    # Protected app routes (dashboard, decks, quiz, etc.)
  components/          # Reusable UI components
  store/               # Global state, cloud sync, localStorage fallback
  lib/                 # Utilities, types, gamification, validators, prompts
  integrations/        # Supabase client, auth middleware, cloud helpers
  server.ts            # Server entry
  start.ts             # TanStack Start config
supabase/              # Supabase config and migrations
public/                # Static assets
```

---

## Available Scripts

| Script              | Description                  |
| ------------------- | ---------------------------- |
| `bun dev`           | Start the Vite dev server    |
| `bun run build`     | Build for production         |
| `bun run build:dev` | Build in development mode    |
| `bun run preview`   | Preview the production build |
| `bun run lint`      | Run ESLint                   |
| `bun run format`    | Format with Prettier         |

---

## Environment

Lovable-managed deployments use a `.env` file generated automatically. For self-hosting, set these variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Server-only secrets (Supabase service role, etc.) are read inside `createServerFn` handlers and should never be exposed to the browser.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and run `bun run lint`
4. Open a pull request

Please keep changes focused and follow the existing TypeScript/React conventions.

---

## License

MIT — see [LICENSE](./LICENSE) (add a `LICENSE` file to make this link valid).

---

Built with [Lovable](https://lovable.dev).
