# Study Forge Hub

StudyForge — Full Project Specification (No Built-in AI)

You are an expert senior software engineer, UI/UX designer, and TypeScript architect.

Your task is to build StudyForge, a polished, local-first desktop-ready study platform built with React + TypeScript + Vite.

This is NOT an AI application.

Instead, StudyForge is a premium study platform that works with AI-generated JSON question banks.

The application itself must never call any AI APIs.

Instead, users generate question banks using their preferred LLM (Gemini, ChatGPT, Claude, OpenRouter, Ollama, LM Studio, etc.), then import the resulting JSON into StudyForge.

The application's responsibility begins after the JSON exists.

Philosophy

StudyForge should feel like:

modern

fast

polished

desktop-friendly

local-first

offline-capable

extremely configurable

open-source friendly

The application should prioritize user experience over flashy technology.

Core Workflow

The user journey should be:

Study Material

↓

StudyForge Prompt Generator

↓

Copy Prompt

↓

User opens preferred AI

↓

AI returns JSON

↓

Import JSON

↓

StudyForge validates JSON

↓

Deck created

↓

Study offline forever

The app itself never communicates with any AI service.

Technology

Use:

React

TypeScript

Vite

Structure the project cleanly for future migration to Tauri.

Use modern React best practices.

Use reusable components.

Avoid duplicated code.

Local-First Architecture

Store everything locally.

Persist:

decks

questions

quiz history

XP

levels

achievements

settings

prompt templates

onboarding completion

statistics

No cloud synchronization.

No accounts.

No authentication.

No backend.

First Launch

If no data exists:

Launch into onboarding.

Never open directly to the dashboard.

Onboarding

Create a polished onboarding experience.

Explain:

What StudyForge is.

Explain that:

StudyForge does not generate questions.

Instead:

StudyForge generates a prompt.

The user pastes that prompt into their preferred LLM.

The AI returns JSON.

StudyForge imports that JSON.

Explain that:

data stays local

studying works offline

any AI provider may be used

Prompt Generator

Create a prompt generation page.

Inputs:

Study material

Deck title

Subject

Question count

Difficulty distribution

Question types

Extra instructions

Output:

A beautifully formatted prompt ready for copying.

Include:

Copy Prompt button.

Clear Prompt button.

Character count.

Estimated question count.

Prompt preview.

Allow prompt templates.

Include Sample JSON

Include a dedicated page explaining the StudyForge JSON format.

Display a complete sample deck.

Explain every field.

Allow users to:

Copy sample JSON.

Download sample JSON.

Validate imported JSON.

Display useful validation errors.

JSON Import

Allow users to:

Paste JSON.

Upload JSON.

Drag & drop JSON.

Validate before importing.

Show:

Errors.

Warnings.

Import preview.

Question count.

Deck information.

Cancel.

Import.

Deck Library

Support:

Search.

Sorting.

Favorites.

Tags.

Recent decks.

Deck statistics.

Completion percentage.

Deck colors.

Deck thumbnails.

Study Mode

Create a beautiful study interface.

Support:

Flashcards.

Basic recall.

Multiple choice.

True/False.

Fill in the blank.

Short answer.

Keyboard shortcuts.

Progress tracking.

Session statistics.

Bookmarks.

Notes.

Reveal answer.

Skip.

Review later.

Practice Quiz

Build a complete quiz engine.

Before starting:

Allow configuring:

Question count.

Question types.

Difficulty.

Shuffle.

Per-question timer.

Whole quiz timer.

Unlimited mode.

Deck selection.

Mixed decks.

Passing score.

XP enabled.

Instant feedback.

Review mode.

Everything should be configurable.

During Quiz

Display configurable widgets:

Progress.

Timer.

Question number.

Accuracy.

Current score.

XP.

Combo.

Remaining questions.

Difficulty.

Concept.

Users can hide/show every widget.

Quiz Results

Generate a polished report.

Include:

Final score.

Grade.

Percentage.

Accuracy.

Average response time.

Fastest answer.

Slowest answer.

Question type breakdown.

Difficulty breakdown.

Concept breakdown.

Weak topics.

Strong topics.

Recommended review.

XP earned.

Level progress.

Buttons:

Retry.

Retry incorrect.

Review mistakes.

Return home.

Export report.

XP System

Award XP for:

Questions answered.

Correct answers.

Sessions completed.

Decks completed.

Daily streaks.

Perfect quizzes.

Combos.

Display:

XP animations.

Progress bar.

Current level.

Next level.

Lifetime XP.

Achievements

Implement achievements.

Examples:

First Deck.

100 Questions.

1000 Questions.

Perfect Quiz.

7 Day Streak.

30 Day Streak.

Night Owl.

Early Bird.

Deck Master.

Quiz Master.

Active Recall Expert.

Achievement popups should feel rewarding.

Statistics

Track:

Questions answered.

Correct.

Incorrect.

Skipped.

Accuracy.

Study time.

Quiz history.

Deck completion.

Weak concepts.

Strong concepts.

XP.

Levels.

Achievements.

Heatmap.

Streaks.

Personal bests.

Everything should persist locally.

Dashboard

Create a modern dashboard.

Include widgets:

Continue Studying.

Today's Goal.

XP.

Current Level.

Study Streak.

Cards Due.

Recent Activity.

Weak Topics.

Recent Decks.

Achievements.

Statistics.

Allow:

Drag.

Resize.

Hide.

Collapse.

Reset Layout.

Settings

Make StudyForge extremely configurable.

Users should control nearly every aspect of the application.

Categories:

General.

Appearance.

Accessibility.

Study.

Quiz.

Review.

Gamification.

Animations.

Keyboard.

Notifications.

Import.

Export.

Advanced.

Developer.

Support:

Import settings.

Export settings.

Restore defaults.

Search settings.

Favorites.

Personalization

Allow customization of:

Themes.

Accent colors.

Fonts.

Font scaling.

Spacing.

Density.

Corner radius.

Button size.

Animation speed.

Progress bars.

Dashboard layout.

Sidebar layout.

Study layout.

Quiz layout.

Everything that can reasonably be customized should be customizable.

Accessibility

Support:

Keyboard navigation.

Screen readers.

Reduced motion.

High contrast.

Colorblind palettes.

Large fonts.

Visible focus indicators.

Adjustable timers.

Offline First

Everything except prompt generation works entirely offline.

Users should always be able to:

Study.

Review.

Import existing JSON.

Export decks.

View statistics.

Manage settings.

No internet connection should be required after a deck has been created.

Future-Proof Design

Design the codebase so future optional modules can be added without major refactoring.

Examples:

Direct AI integrations.

Tauri desktop packaging.

Plugin system.

Cloud synchronization.

Community deck marketplace.

Additional import/export formats.

These should be optional extensions, not core requirements.

Code Quality

Use strict TypeScript.

Reusable hooks.

Reusable components.

Clean architecture.

Meaningful naming.

No duplicate logic.

No placeholder implementations unless clearly marked.

The application should be production-quality, visually polished, responsive, and ready for future Tauri packaging.

Focus on creating the best possible studying experience rather than implementing AI functionality.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://studyforge-test.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aae57bb8-07a6-43ea-a58c-114412ffe651).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
