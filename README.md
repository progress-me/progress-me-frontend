# Progress Me Frontend

A personal growth and self-reflection tracking application. Users log journal entries, set goals, categorize progress with custom tags, and get AI-powered insights from their data.

## Tech Stack

- **React 19** with TypeScript 5.9
- **Vite 7** for dev server and builds
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn/ui** (new-york style) with Radix UI primitives and Lucide icons
- **TanStack React Query** for async server state
- **Axios** for API communication
- **React Router v7** for client-side routing
- **Recharts** for mood/energy trend charts and activity heatmaps
- **react-markdown** with remark-gfm and rehype-sanitize for rendering AI insight content
- **Sonner** for toast notifications

## Features

| Area                  | Description                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Timeline**          | Paginated feed of journal entries, micro-notes, and check-ins with mood/energy tracking. Dashboard stats with activity charts, mood/energy trends, and streak tracking. |
| **Goals**             | Create, edit, and track goals with statuses (active/completed/paused/abandoned). Assign categories and date ranges. Template support.                                   |
| **Categories & Tags** | Organize goals and entries with custom categories and tag values. Color and icon support.                                                                               |
| **AI Analysis**       | Ask free-form questions about your progress or use pre-built prompts. View analysis history. Configure AI tone, strictness, focus areas, and language.                  |
| **Profile**           | Persona editor for display name, bio, strengths, weaknesses, interests, and context -- fed to the AI for personalized insights.                                         |
| **Auth**              | JWT-based login/registration with automatic token expiry detection and 401 handling.                                                                                    |

## Project Structure

```
src/
  api/           # Axios API modules (one per domain)
  components/    # Domain components + shadcn/ui primitives
  context/       # AuthContext (JWT auth state)
  lib/           # Utilities (cn, entry helpers)
  pages/         # Route-level page components
  types/         # TypeScript API type definitions
```

## Prerequisites

- **Node.js 22+**
- **npm**
- Backend API running at `localhost:8080` (Spring Boot)

## Development

```bash
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173` and proxies `/api` requests to `http://localhost:8080`.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Production (Docker)

```bash
docker build -t progress-me-frontend .
```

The Docker image uses a multi-stage build (Node 22 Alpine for build, nginx Alpine for serving). Nginx proxies `/api/` to `http://backend:8080` and serves the SPA with history-mode fallback.

## Lint

```bash
npm run lint
```

Uses ESLint with `typescript-eslint`, `react-hooks`, and `react-refresh` plugins.
