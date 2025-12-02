# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev` (starts Next.js dev server with Turbopack)
- **Build:** `pnpm build` (Next.js production build)
- **Start:** `pnpm start` (serve production build)
- **Lint:** `pnpm lint` (runs ESLint via Next.js)

## Tech Stack

- React 19 with TypeScript
- Next.js 15 with App Router
- Tailwind CSS v4 (uses `@tailwindcss/postcss` plugin)
- shadcn/ui components (new-york style, lucide icons)

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components
- `src/components/ui/` - shadcn/ui components (add via `npx shadcn@latest add <component>`)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and libraries

## Path Aliases

`@/*` maps to `./src/*` - use `@/components`, `@/lib`, etc.

## Styling

- CSS variables defined in `src/app/globals.css` for theming (light/dark mode)
- Use `cn()` from `@/lib/utils` for conditional class merging with Tailwind
