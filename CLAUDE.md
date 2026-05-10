# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@docs/auth.md
@docs/data-fetching.md
@docs/data-mutations.md
@docs/ui.md
@docs/server-components.md
@docs/routing.md

## IMPORTANT: Docs-First Rule

**Before writing any code**, always check the `/docs` directory for relevant documentation. If a matching doc exists, read it first and follow its guidance. This applies to all features, APIs, components, and conventions in this project.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

- **Framework**: Next.js 16.2.6 with App Router (`src/app/`)
- **Language**: TypeScript (strict mode), path alias `@/*` → `./src/*`
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`; theme defined in `globals.css` CSS variables
- **Fonts**: Geist and Geist Mono via `next/font/google`, exposed as CSS vars `--font-geist-sans` / `--font-geist-mono`

## Next.js Version Warning

This project uses Next.js 16.x which has **breaking changes** from earlier versions. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Key docs:

- `node_modules/next/dist/docs/01-app/` — App Router docs
- `node_modules/next/dist/docs/02-pages/` — Pages Router docs
- `node_modules/next/dist/docs/index.md` — Overview

Notable hint from the docs: for slow client-side navigation, `Suspense` alone is not enough — you must also export `unstable_instant` from the route. See `docs/01-app/02-guides/instant-navigation.mdx`.
