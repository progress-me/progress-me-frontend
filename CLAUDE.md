# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server on :5173 (proxies /api -> localhost:8080)
npm run build        # TypeScript check + Vite build -> dist/
npm run lint         # ESLint (typescript-eslint + react-hooks + react-refresh)
npm run test         # Vitest (jsdom, single run)
npm run test:watch   # Vitest in watch mode
npx vitest run src/api/client.test.ts  # Run a single test file
```

The backend is a Spring Boot API expected at `localhost:8080`. The env var `VITE_API_BASE_URL` overrides the default `/api` base path.

## Architecture

**Personal growth tracking app** — users log journal entries, set goals, and get AI-powered analysis via chat.

### Stack

React 19 + TypeScript 5.9, Vite 7, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), shadcn/ui (new-york style), TanStack React Query, Axios, React Router v7, Recharts, react-markdown.

### Key patterns

- **API layer** (`src/api/`): One module per domain (auth, goals, categories, log-entries, chat, dashboard, persona, ai-settings). Some have no dedicated page anymore (categories are managed within goals, dashboard stats feed `/entries`, ai-settings lives under `/profile`). All use a shared Axios client (`client.ts`).
- **Base URL**: `VITE_API_BASE_URL ?? "/api"` is read in two places — `client.ts` and the raw `fetch` in `chat.ts`. Change both together.
- **Auth**: `AuthContext` manages JWT + refresh token lifecycle. Tokens stored in `localStorage` (`token`, `refreshToken`, `user`). Proactive refresh every 4 minutes. Components use `useAuth()` hook. `ProtectedRoute` wraps authenticated routes.
- **401/403 refresh** (`client.ts`): the response interceptor retries once on 401 _or_ 403, skips URLs starting with `/auth/`, and de-dupes concurrent refreshes via a shared `refreshPromise`. On failure it clears the three localStorage keys and dispatches `auth:logout`.
- **Chat streaming (SSE)**: `sendMessageStream` in `api/chat.ts` uses raw `fetch` + a manual `event:`/`data:` parser, **not** Axios, so it bypasses the refresh interceptor (it reads the token directly and throws `HTTP <status>` on failure). Events (`status`, `token`, `proposal`, `done`, `error`) map to `StreamCallbacks` in `types/api.ts`. `vite.config.ts` patches proxy headers for URLs containing `/stream` to disable buffering; `nginx.conf` has no SSE-specific settings, so production relies on the backend sending `X-Accel-Buffering: no`.
- **Server state**: TanStack React Query for all data fetching/caching (configured with 30s stale time, 1 retry). No global state management beyond AuthContext.
- **Routing**: Flat route structure in `App.tsx`. `AppLayout` provides shared chrome for authenticated pages. Current routes: `/entries`, `/entries/new`, `/goals`, `/goals/:id`, `/chat[/:sessionId]`, `/profile`; `/` goes to `/chat`. Legacy paths (`/dashboard`, `/categories`, `/analysis`, `/insights*`, `/ai-settings`) are redirect-only — don't add pages there.
- **UI components**: Domain components in `src/components/`, shadcn/ui primitives in `src/components/ui/`. Icons from `lucide-react`. Toasts via `sonner`.
- **Path alias**: `@/` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).
- **Types**: All API request/response types in `src/types/api.ts`. Matches the Spring Boot backend DTOs.

### Testing

Vitest (jsdom) + Testing Library, setup in `src/test/setup.ts`, tests colocated. Coverage is thin: only `api/client.test.ts` and `context/auth-utils.test.ts` exist.

### CI

`.github/workflows/ci.yml` runs `npm run lint` and `npm run build` on Node 20 — it does **not** run `npm run test`, so run tests locally. `publish.yml` (manual) builds and pushes the Docker image.

### Production

Docker: Node 22 Alpine build -> nginx Alpine. Nginx proxies `/api/` to `http://backend:8080` with SPA fallback.
