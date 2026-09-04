# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tip Tap — a collection of small tap/drag games for toddlers and up (colors, counting, memory, sorting), built as a static React SPA. Intended to be played on a PC/Macbook, iPad, or iPhone via a touch/mouse-friendly UI, and hosted as a static site (GitHub Pages) since this is a public repo with no backend.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint (rules in `.oxlintrc.json`; react + oxc plugins, `react/rules-of-hooks` is an error)

There is no test suite configured in this repo.

## Architecture

- `src/App.jsx` is the sole router: a `GAMES` map of key → component, with `useState` picking which game is "open". No routing library — each game is a self-contained component that gets mounted/unmounted directly.
- Each game is one `<Name>.jsx` + matching `<Name>.css` pair at the top level of `src/` (e.g. `MixGame.jsx`/`MixGame.css`). Adding a new game means adding this pair and registering it in `App.jsx`'s `GAMES` map plus a tile button in the home screen.
- `src/colors.js` is the shared color engine used across games (MixGame, ThreeInARow, DragSort, etc.): a paint-mixing model (`RECIPES` as red/yellow/blue/white/black parts, blended via `rybToRgb`) that produces a hex color and a kid-friendly name (`nameOf`, via HSL heuristics) for any two colors mixed together. `OVERRIDES` hardcodes specific pairs where the math doesn't match painterly intuition (e.g. red+green → brown). `COLORS`/`colorById`/`mix` are the public API.
- `src/Players.jsx` is the shared two-player harness (animal-emoji picker, seat/turn UI, score piles) reused by the competitive games (ThreeInARow, QuickTap, SumGame, CountGame). `usePlayers()` drives the picking state; `PlayerPicker`/`PlayerBar` render it.
- `src/Answer.jsx` is a shared feedback component (correct/incorrect reveal) used by the quiz-style games.
- No global state management — each game owns its state locally via `useState`; nothing is persisted (no localStorage, no backend).
- Styling is plain CSS per component (no CSS-in-JS, no Tailwind), with `App.css`/`index.css` for shared/global styles.
