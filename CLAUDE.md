# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev` (starts Vite dev server with HMR)
- **Build:** `pnpm build` (runs TypeScript compilation then Vite build)
- **Lint:** `pnpm lint` (runs ESLint)
- **Preview:** `pnpm preview` (preview production build)

## Tech Stack

- React 19 with TypeScript
- Vite 7 for bundling
- Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, not PostCSS)
- shadcn/ui components (new-york style, lucide icons)

## Project Structure

- `src/components/` - React components
- `src/components/ui/` - shadcn/ui components (add via `npx shadcn@latest add <component>`)
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging

## Path Aliases

`@/*` maps to `./src/*` - use `@/components`, `@/lib`, etc.

## Styling

- CSS variables defined in `src/index.css` for theming (light/dark mode)
- Use `cn()` from `@/lib/utils` for conditional class merging with Tailwind
