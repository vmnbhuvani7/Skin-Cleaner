# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server on port 4000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured. There is no `npm test` command.

## Stack

- **Next.js 15** App Router
- **GraphQL** — Apollo Server 5 (`/api/graphql`) + Apollo Client; all data fetching goes through GraphQL except the chat streaming endpoint
- **MongoDB** via Mongoose models in `src/models/`
- **Mastra** AI agent framework (`src/mastra/`) — `consultationAgent` (`src/mastra/agents/consultation-agent.js`) streams through `/api/chat`
- **Cloudinary** for image storage (images are NOT stored in MongoDB)
- **JWT** auth — token in `Authorization: Bearer <token>` header; decoded in GraphQL context via `verifyToken()` from `src/utils/auth.js`

## Architecture

### Routing
App Router pages live in `src/app/`. Protected routes use the `<AuthGuard>` wrapper component. Each clinical module follows the same shape: list page, `[id]` detail, `/add`, and `/edit`.

### API Layer
- `src/app/api/graphql/route.js` — Apollo Server; context populates authenticated user from JWT
- `src/app/api/chat/route.js` — Mastra agent streaming (ReadableStream)
- `src/app/api/upload/route.js` — Cloudinary upload handler

### GraphQL Organization
- `src/graphql/typeDefs/` — domain type files aggregated in `index.js`
- `src/graphql/resolvers/` — mirrors typeDefs structure

### State
- `ChatContext` — chat messages + sessions, persisted to `localStorage`
- `ThemeContext` — dark/light mode, persisted to `localStorage`
- Apollo Client cache handles all GraphQL data

### Styling
Tailwind CSS with custom CSS variables (`--background`, `--foreground`, `--surface`, `--border`, `--text-muted`). Dark mode uses the `class` strategy — toggled by `ThemeContext`, not `prefers-color-scheme`.

### Path Alias
`@/*` resolves to `src/*` (jsconfig.json).

### Shared Helpers
`src/utils/` holds cross-cutting helpers: `auth.js` (JWT verify/sign), `dateUtils.js`, `roleUtils.js`, `storage.js` (localStorage wrappers), `constants.js`. Prefer these over re-implementing.

## Common UI Components (always use these)

Located in `src/components/ui/`:

| Component | Use for |
|-----------|---------|
| `DataTable` | List views with pagination |
| `Pagination` | Required on every list view |
| `ViewToggle` | List ↔ Card switcher |
| `FilterDrawer` | Sidebar filters |
| `ImageUpload` | Cloudinary-backed image fields |
| `Modal` | Dialogs/overlays |

Card view counterparts live alongside list views in the same module directory.

## Coding Conventions

- **Theme first**: Match the existing design — use Tailwind classes and the CSS variables (`--background`, `--foreground`, `--surface`, `--border`, `--text-muted`). Don't invent new colors, spacing scales, or typography.
- **No inline styles**: Don't write `style={{ ... }}` in JSX. Use Tailwind classes; if something truly cannot be expressed in Tailwind, put it in a `.css` file.
- **Reuse className patterns**: If a similar UI already exists, copy its className verbatim. Same look = same classes.
- **Always use common components**: Check `src/components/ui/` (and `src/components/clinical/`) before writing new markup. If a needed primitive doesn't exist, create it in `src/components/ui/` so it's reusable — don't inline a one-off.
- **No raw HTML form fields**: Never use bare `<input>`, `<select>`, `<textarea>`, or date pickers. Use the project wrappers: `Input`, `Select`, `DatePicker`, `DateTimePicker`, `CurrencyInput`, `ImageUpload`. Forms are built with `react-hook-form` + `zod` (via `@hookform/resolvers/zod`).
- **DRY**: If the same logic appears in 2–3 places, extract it into a helper (`src/utils/`) or a shared component.
- **Less state, fewer renders**: Prefer derived values over `useState`. Memoize where it matters. Don't put unstable references in dependency arrays.
- **Numbers**: Always render with thousand separators — `value.toLocaleString()` (or `Intl.NumberFormat`). Never show raw numeric strings to users.
- **Class merging**: Use `twMerge` from `tailwind-merge` (with `clsx` when needed) — already the project pattern.
- **Icons**: `lucide-react` only.
- **Toasts**: `react-toastify` (already wired in the root layout).
- **Dates**: `date-fns` for formatting; reuse helpers in `src/utils/dateUtils.js`.

## Environment Variables

Required in `.env`:
```
MONGODB_URL
JWT_SECRET
MISTRAL_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```
