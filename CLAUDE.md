# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A matchmaking system that pairs "apples" and "oranges" (fruit entities with attributes and preferences). The system generates fruits, stores them in SurrealDB, matches them based on preference compatibility, and communicates results via LLM.

## Commands

### Backend (Supabase Edge Functions)
```bash
# Start Supabase local environment
npx supabase start

# Serve edge functions (separate terminal)
./scripts/serve-functions.sh

# Test edge functions
curl http://127.0.0.1:54321/functions/v1/get-incoming-apple -H "Content-Type: application/json" -d '{}'
curl http://127.0.0.1:54321/functions/v1/get-incoming-orange -H "Content-Type: application/json" -d '{}'
```

### Frontend (Next.js)
```bash
cd frontend
pnpm install
pnpm dev      # Development server at http://localhost:3000
pnpm build    # Production build
pnpm lint     # ESLint
```

### Testing (Deno for edge functions)
```bash
deno test --config supabase/functions/_shared/deno.json supabase/functions/_shared/generateFruit.test.ts
```

## Architecture

### Data Flow
1. Edge function receives request → generates new fruit via `generateFruit()`
2. Fruit communicates its attributes and preferences via `communicateAttributes()` / `communicatePreferences()`
3. Fruit stored in SurrealDB
4. Query opposite fruit type, calculate compatibility scores
5. Return matches with LLM-generated explanations

### Fruit Data Model
- **Attributes**: size, weight, hasStem, hasLeaf, hasWorm, shineFactor, hasChemicals (all nullable)
- **Preferences**: Partial set of desired attribute values; numeric fields use `{min?, max?}` ranges
- See `data/README.md` for full schema and TypeScript definitions

### Key Shared Code
- `supabase/functions/_shared/generateFruit.ts`: Fruit generation with normally-distributed attributes, preference generation, and natural language communication templates
- `frontend/lib/store.ts`: Zustand store with Apple, Orange, Match, Conversation types and persistence

### Tech Stack
- **Frontend**: React 19, Next.js 16, Tailwind CSS 4, Zustand, Effect
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: SurrealDB
- **AI**: AI SDK for LLM communication

## Workflow

### Task Tracking (`docs/todo.md`)
- When the user identifies a task as necessary, **automatically add it** to `docs/todo.md`
- When a task is completed, **mark it as done** with `[x]`

### Design Decisions (`docs/rationale.md`)
- **Only add entries when explicitly instructed** by the user
- Document the decision, context, and reasoning



## AI Assistant Guidelines

**Stick to the Tech Stack**: Use only the proposed technologies. Do not create workarounds or substitute different tools unless explicitly asked.

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Next.js, Tailwind CSS, Zustand, Effect |
| Backend | Trigger.dev, Supabase Edge Functions, SurrealDB |
| Agentic | AI SDK |

**MCP Tool Usage**: Automatically use MCP servers for relevant tasks:

- **Context7**: Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
- **Supabase MCP**: Use for database queries, schema management, and table operations instead of writing raw SQL manually.
- **Next.js Devtools**: Use for Next.js-specific debugging, route analysis, and performance optimization.
- **Chrome DevTools MCP**: Use for browser debugging, inspecting DOM elements, network requests, console logs, and performance profiling in Chrome.

**Parallel Execution Patterns**: When working on this React project, optimize for concurrent operations where possible:

✅ **BATCH THESE TOGETHER** (in one message):
- Reading multiple files for context
- Creating independent React components
- Setting up related state management files (store, slices, hooks)
- Running multiple test suites
- Formatting/linting multiple files
- Creating CSS/styling files

⚠️ **KEEP THESE SEQUENTIAL** (must wait for completion):
- Install dependencies → Run build
- Create file → Edit that file
- Database migration → Query database
- Generate types → Use those types
- Any operation where step B depends on step A's output

**Why?** Parallel execution is faster and ensures consistency across related files, but dependencies must be respected to avoid errors.

