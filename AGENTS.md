# Repository Guidelines

## Project Structure & Module Organization
- `app/` Next.js App Router entrypoints, API routes, and global styles (`globals.css`).
- `components/` shared UI (commerce, restaurant, admin) in PascalCase files; `lib/` utilities (auth, Supabase, stores, schemas); `types/` shared TypeScript types.
- `db/` Supabase migrations and helper scripts; `scripts/` operational utilities (DB cleanup, seeds, admin helpers).
- `tests/e2e/` Playwright specs plus `assets/` and `reports/`; `playwright.config.ts` & `playwright.config.simple.ts` set runners.
- `website/` Docusaurus docs site; `docs/` legacy markdown; `public/` static assets; `styles/` Tailwind tokens; `i18n/` + `messages/` for locale bundles.

## Build, Test, and Development Commands
- Install deps: `npm install`
- Dev server (Next, port 3000): `npm run dev`
- Production build / start: `npm run build` then `npm run start`
- Lint (Next + TS rules): `npm run lint`
- End-to-end tests (headless): `npm run test:e2e` | UI runner: `npm run test:e2e:ui`
- DB maintenance: `npm run db:reset` (uses scripts/clean-db.js); local Supabase reset: `npm run db:reset:local`
- Docs site: `npm run docs:dev` (localhost:3001), `npm run docs:build`, `npm run docs:serve`

## Coding Style & Naming Conventions
- Language: TypeScript + React Server/Client Components. Prefer functional components and hooks.
- Formatting: 2-space indent; rely on ESLint (`eslint.config.mjs` with `eslint-config-next/core-web-vitals` + TypeScript). Fix issues before PR.
- Naming: components and files in `components/` use PascalCase; hooks start with `use`; utilities camelCase; route segments in `app/` use kebab-case; translation keys lowercase dot notation.
- Styling: Tailwind CSS v4 in `styles/`; co-locate component styles via utility classes—avoid inline magic numbers.

## Testing Guidelines
- Primary framework: Playwright. Specs in `tests/e2e/`; shared fixtures in `tests/global-setup.ts` / `global-teardown.ts`.
- Run locally before PR: `npm run test:e2e`; capture UI evidence with `npm run test:e2e:ui` when debugging.
- Reports generated to `tests/reports/` and `test-results/`; keep failing screenshots/videos out of commits.
- Prefer deterministic selectors (`data-testid`) over text-based queries; seed/reset DB with `npm run db:reset` to stabilize tests.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (see history: `feat(...)`, `chore:`, `docs:`). Scope optional but helpful (e.g., `feat(seo): ...`).
- Before pushing: ensure `npm run lint` and `npm run test:e2e` pass or note known failures.
- PRs should include: concise summary, linked issue/linear ticket, screenshots or recordings for UI changes, and any DB migration notes.
- Avoid committing `.env*` or Supabase keys; prefer `.env.e2e.example` as a template and document new variables in PR description.
