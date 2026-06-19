# Dog Tracker — Architecture & API Model

_Written for someone coming from a React + FastAPI background, where the frontend calls a
separate hand-written API service. This stack works differently. Read this before building._

## TL;DR

There **is** an API, but you hand-write far less of it, and **the security boundary moves
from your endpoint code into the database (RLS).** You trade "own an entire FastAPI service"
for "own the SQL schema + RLS policies, plus a handful of server functions for custom logic."

## The pieces

- **Next.js app (on Vercel)** — full-stack. Contains the UI *and* server-side code
  (Server Components, Server Actions, Route Handlers). This is the only "app" you deploy.
- **Supabase (managed service)** — your backend-as-a-service: Postgres, Auth, Storage,
  Edge Functions, cron. You configure it with SQL migrations, not by writing an app server.

There is no separate backend repo/service to write and deploy. Supabase *is* the backend;
Next.js holds both the frontend and the custom server logic.

## Where FastAPI's jobs go

| FastAPI job | Who does it here |
|---|---|
| CRUD endpoints (`GET /dogs`, `POST /weights`) | **Supabase auto-generates them** (PostgREST exposes REST over your tables). The client calls `supabase.from('dogs').select()`. You write **no** CRUD boilerplate. |
| AuthN (login, tokens) | **Supabase Auth** issues JWTs (email + Google). |
| AuthZ ("can this user see this row?") | **Postgres RLS policies** — not per-endpoint code. |
| Custom logic / secrets / orchestration | **Next.js server code** (Server Actions / Route Handlers) — the part you still write. |
| Scheduled jobs | **Supabase Edge Function on cron** (daily reminder email). |

So "the API" = ~80% auto-generated CRUD you didn't write + ~20% custom server logic you do.

## The custom server tools (the FastAPI analog)

- **Route Handlers** — `app/api/.../route.ts` exporting `GET`/`POST` is a literal REST
  endpoint (= `@app.post(...)`). Use for webhooks and anything needing an external URL.
- **Server Actions** — server functions you call directly from components (Next handles the
  HTTP plumbing; no manual `fetch`/endpoint). Think "RPC." Where most custom logic lives.

Both run server-side with access to secrets and the privileged DB key — same trust level as
a FastAPI route, minus the routing/serialization boilerplate.

## ⚠️ The mindset shift: the trust boundary moved

- **FastAPI:** the API is the wall. The browser can't reach the DB; every request runs your
  authz code first. A forgotten check tends to **fail closed** (no endpoint, no data).
- **Supabase:** the browser talks to the database directly (via PostgREST, carrying the
  user's JWT). No handwritten endpoint gatekeeps each query. **RLS is the wall.** A missing
  or wrong policy **fails open** — that table is queryable by anyone with the anon key.

**Therefore:** every household-owned table must have RLS policies, and we test them (Phase 1
includes verifying a second account cannot see your dogs). See
[DATA_MODEL.md — Row-level security](DATA_MODEL.md#row-level-security-rls).

### Two keys
- **anon key** — public, shipped to the browser. **RLS always applies.** Safe to expose.
- **service-role key** — **bypasses RLS**, server-only, **never** in the browser. Used inside
  Server Actions / Edge Functions for trusted operations (e.g. the cron emailing the household).

## Where each feature's logic lives

| Feature | Mechanism | Why |
|---|---|---|
| List dogs, add weight, log vaccination | **Direct Supabase client call**, guarded by RLS | Plain CRUD; the auto API + RLS cover it. |
| Accept household invite (writes membership) | **Server Action** (or Postgres `security definer` fn) | Trusted write that must not go through the open client path. |
| Dose calculator (lbs↔kg, mg/kg) | **Framework-free function in `lib/`** | Pure logic; portable (lifts into `packages/shared` if a native app is ever added). |
| Daily reminder email | **Edge Function on cron**, service-role key | Server-only, runs on a schedule, needs privileged access. |

## Rules of thumb

1. **Reads/writes a user is allowed to do directly** → client call + RLS. Don't wrap it in a
   needless endpoint.
2. **Needs a secret, must be authoritative, or is a multi-step transaction** → Server Action
   (or Route Handler for webhooks).
3. **Runs on a schedule or as a true webhook** → Edge Function / Route Handler.
4. **Pure business logic** → framework-free function in `lib/`, called from wherever.
5. **Security lives in the database.** Adding a table = adding its RLS policy in the same
   migration. Never ship a household table without one.
