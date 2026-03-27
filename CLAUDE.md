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

- **API layer** (`src/api/`): One module per domain (auth, goals, categories, log-entries, chat, dashboard, persona, ai-settings). All use a shared Axios client (`client.ts`) that handles JWT Bearer tokens, automatic 401 refresh via interceptors, and `auth:logout` custom event dispatch on failure.
- **Auth**: `AuthContext` manages JWT + refresh token lifecycle. Tokens stored in `localStorage`. Proactive refresh every 4 minutes. Components use `useAuth()` hook. `ProtectedRoute` wraps authenticated routes.
- **Server state**: TanStack React Query for all data fetching/caching (configured with 30s stale time, 1 retry). No global state management beyond AuthContext.
- **Routing**: Flat route structure in `App.tsx`. `AppLayout` provides shared chrome for authenticated pages. Legacy paths redirect to new locations.
- **UI components**: Domain components in `src/components/`, shadcn/ui primitives in `src/components/ui/`. Icons from `lucide-react`. Toasts via `sonner`.
- **Path alias**: `@/` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).
- **Types**: All API request/response types in `src/types/api.ts`. Matches the Spring Boot backend DTOs.

### Testing

Vitest with jsdom environment, `@testing-library/react` + `@testing-library/jest-dom`. Setup file at `src/test/setup.ts`. Tests are colocated with source files (e.g., `client.test.ts` next to `client.ts`).

### Production

Multi-stage Docker build: Node 22 Alpine -> nginx Alpine. Nginx proxies `/api/` to `http://backend:8080` with SPA history-mode fallback.
