# Ollive — LLM Inference Logger

> A production-grade chatbot with an embedded inference logging SDK, real-time ingestion pipeline, and operational telemetry dashboard.

**Live demo →** [https://ollive-murex.vercel.app/](https://ollive-murex.vercel.app/)

**Architecture notes (Notion) →** [https://www.notion.so/ARCHITECTURE-36aa0469ae7880998abdccf1c3a9b2e5](https://www.notion.so/ARCHITECTURE-36aa0469ae7880998abdccf1c3a9b2e5)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Schema Design](#schema-design)
- [Tradeoffs](#tradeoffs)
- [What I'd Improve](#what-id-improve-with-more-time)
- [Bonus Task Status](#bonus-task-status)
- [Project Structure](#project-structure)

---

## Overview

Most LLM applications are black boxes — you send a prompt, you get a response, and everything in between disappears. Ollive solves this by wrapping every inference call in a lightweight SDK that captures latency, token usage, error rates, and session context, then ships that data asynchronously to a purpose-built ingestion pipeline.

**What's built:**

| Component               | Description                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Chatbot UI**          | Multi-turn conversations with real-time streaming token output, conversation history (pin, resume, delete), and full markdown + syntax highlighting                      |
| **SDK / Middleware**    | TypeScript logger that measures end-to-end latency, captures token usage, redacts PII, and ships logs via `navigator.sendBeacon` — non-blocking and survives page unload |
| **Ingestion API**       | FastAPI endpoint that validates, deduplicates (by `request_id`), PII-scrubs (defensive second pass), and persists every log entry                                        |
| **Telemetry Dashboard** | Live stats: total requests, average latency, total tokens, error rate with configurable thresholds, latency time-series chart, and a recent inference feed table         |

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Browser  (React + Vite)                  │
│                                                            │
│  ┌──────────────────┐    ┌─────────────────────────────┐  │
│  │    Chat UI       │    │        SDK Logger            │  │
│  │                  │    │  ① measure latency           │  │
│  │  send message ───┼──► │  ② capture token counts      │  │
│  │  stream tokens ◄─┼──  │  ③ redact PII                │  │
│  └──────────────────┘    │  ④ ship log (sendBeacon)     │  │
│                          └──────────────┬───────────────┘  │
└──────────────────┬───────────────────────┼──────────────────┘
                   │ NDJSON stream         │ fire-and-forget
                   │ POST /api/v1/chat     │ POST /api/v1/ingest
                   ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend  (Railway)                  │
│                                                             │
│  /api/v1/chat ──────────────────► Groq API (Llama 3.3 70B) │
│        │  StreamingResponse (NDJSON, token-by-token)        │
│        │                                                    │
│  /api/v1/ingest                                             │
│        │  validate → deduplicate → PII redact → persist     │
│        │                                                    │
│  /api/v1/metrics, /metrics/latency, /metrics/recent         │
│  /api/v1/conversations  (CRUD + pin)                        │
│        │                                                    │
│    SQLAlchemy 2 (async) ──► asyncpg                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │  PostgreSQL  (Supabase)  │
               │                         │
               │  conversations          │
               │  messages               │
               │  inference_logs         │
               └─────────────────────────┘
```

**Key design decisions:**

- **API key never in the browser** — the frontend proxies all LLM calls through the FastAPI backend; no provider credentials exist on the client.
- **Non-blocking log shipping** — `navigator.sendBeacon` queues the log payload before returning control to the UI. A `fetch` fallback fires only if the beacon queue is full. Either way, a failed log ship is silently swallowed so it never surfaces an error to the user.
- **Dual-layer PII redaction** — the SDK redacts before shipping; the ingestion service redacts again before writing to the DB. The second pass is a hard boundary guarantee that holds regardless of SDK version.
- **Open/closed provider pattern** — the `ProviderAdapter` interface means adding OpenAI, Anthropic, or Gemini is one new adapter file. No existing code changes.

---

## Tech Stack

| Layer           | Technology                                                               |
| --------------- | ------------------------------------------------------------------------ |
| Frontend        | React 19, Vite 8, TypeScript 6                                           |
| Styling         | Tailwind CSS 3 with a full CSS custom-property design token system       |
| State           | Zustand 5                                                                |
| Markdown        | react-markdown 10 + react-syntax-highlighter 16 (Prism / solarizedlight) |
| Backend         | FastAPI + Uvicorn                                                        |
| ORM             | SQLAlchemy 2 (fully async) + asyncpg                                     |
| Migrations      | Alembic                                                                  |
| Validation      | Pydantic v2 + pydantic-settings                                          |
| LLM             | Groq API — Llama 3.3 70B Versatile                                       |
| Database        | PostgreSQL via Supabase                                                  |
| Frontend deploy | Vercel                                                                   |
| Backend deploy  | Railway                                                                  |
| Containers      | Docker + Docker Compose                                                  |

---

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (recommended) **or** Node.js 20+ and Python 3.12+
- A Groq API key — [console.groq.com/keys](https://console.groq.com/keys) (free)
- A PostgreSQL database — [Supabase](https://supabase.com) free tier works, or the Docker Compose stack spins one up automatically

### Option A — Docker (one command)

```bash
# 1. Clone and enter the repo
git clone https://github.com/22-vanshika/Ollive.git && cd Ollive

# 2. Set your Groq API key (the only required secret)
echo "GROQ_API_KEY=gsk_..." > .env

# 3. Start everything
docker compose up --build
```

| Service            | URL                        |
| ------------------ | -------------------------- |
| Chat UI            | http://localhost:5173      |
| Backend API        | http://localhost:8000      |
| API docs (Swagger) | http://localhost:8000/docs |

The compose stack automatically runs `alembic upgrade head` before starting the backend, so no manual migration step is needed.

### Option B — Manual (local dev)

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in environment variables
cp ../.env.example .env
# → set DATABASE_URL and GROQ_API_KEY

alembic upgrade head             # apply all migrations
uvicorn app.main:app --reload --port 8000
```

**Frontend** (new terminal)

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

### Environment Variables

| Variable       | Required | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | ✅       | `postgresql+asyncpg://user:pass@host:5432/dbname`                 |
| `GROQ_API_KEY` | ✅       | From [console.groq.com/keys](https://console.groq.com/keys)       |
| `APP_ENV`      | —        | `development` / `staging` / `production` (default: `development`) |
| `CORS_ORIGINS` | —        | JSON array: `["http://localhost:5173"]`                           |
| `LOG_LEVEL`    | —        | `DEBUG` / `INFO` / `WARNING` (default: `INFO`)                    |

---

## Schema Design

### `conversations`

Thin session record. All heavy data lives in child tables.

```sql
id         UUID  PRIMARY KEY DEFAULT gen_random_uuid()
title      TEXT                       -- nullable; auto-filled by LLM after first exchange
pinned     BOOLEAN NOT NULL DEFAULT false
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

`title` is nullable on creation and populated asynchronously after the first turn via a non-blocking summarisation call. This avoids a blocking round-trip before the user can start chatting.

### `messages`

Append-only turn log.

```sql
id              UUID  PRIMARY KEY
conversation_id UUID  NOT NULL  REFERENCES conversations(id) ON DELETE CASCADE
role            TEXT  NOT NULL  -- 'user' | 'assistant' | 'system'
content         TEXT  NOT NULL
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

Index on `conversation_id` — every message load is filtered by it.

### `inference_logs`

One row per LLM API call. The core observability table.

```sql
id                UUID  PRIMARY KEY
conversation_id   UUID  REFERENCES conversations(id) ON DELETE SET NULL  -- survives conversation deletion
session_id        UUID  NOT NULL
request_id        UUID  NOT NULL  UNIQUE   -- idempotency key
provider          TEXT  NOT NULL
model             TEXT  NOT NULL
timestamp_request TIMESTAMPTZ NOT NULL
timestamp_response TIMESTAMPTZ NOT NULL
latency_ms        INTEGER NOT NULL
prompt_tokens     INTEGER NOT NULL
completion_tokens INTEGER NOT NULL
total_tokens      INTEGER NOT NULL
status            TEXT NOT NULL   -- 'success' | 'error' | 'timeout'
error_code        TEXT
input_preview     TEXT            -- first 200 chars, PII-redacted
output_preview    TEXT            -- first 200 chars, PII-redacted
created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
```

**Indexes (with justification):**

| Index                                   | Serves                                       | Beneficial from                                |
| --------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| `ix_inference_logs_conversation_id`     | Dashboard timeline, per-conversation metrics | Row 1 — every conversation detail view hits it |
| `ix_inference_logs_session_id`          | SDK-level session replay                     | ~1 000+ rows when sessions fan out             |
| `ix_inference_logs_request_id` (unique) | Idempotency check on every ingest            | Row 1 — every ingest hits it                   |

`conversation_id` is `ON DELETE SET NULL` — inference logs are observability data and should outlive the conversation they came from. Deleting a chat does not purge its telemetry.

---

## Tradeoffs

**Synchronous HTTP ingestion over a message queue**
Logs are written inside the HTTP request via direct `asyncpg` writes, not via Kafka or Redis Streams. This keeps infrastructure to zero: no broker to deploy or monitor. At the current scale it holds fine; under sustained high write volume, a queue would decouple ingestion throughput from database capacity.

**Frontend SDK over a server-side proxy interceptor**
Logging runs in the browser SDK rather than intercepting at a server-side proxy. This keeps the FastAPI backend stateless and avoids a second network hop on the hot path. The risk is that `sendBeacon` delivery is best-effort; a hard browser crash before the beacon fires loses that single log entry. Acceptable for observability data — a missed log is not a missed transaction.

**Groq / Llama 3.3 70B as the sole provider**
The provider adapter is fully abstracted — switching to OpenAI, Anthropic, or Gemini is one new adapter file. Groq was chosen because its free tier has generous RPM limits and Llama 3.3 70B produces high-quality streamed output without per-token cost pressure during development.

**Supabase over self-managed PostgreSQL**
Zero operational overhead for a managed PostgreSQL instance with built-in PgBouncer connection pooling. No Supabase-specific code exists in the schema or query layer — migrating to any PostgreSQL host is a single connection string change.

**Simulated per-message token stats in the chat UI**
The latency and token counts shown beneath each assistant bubble are derived client-side from a deterministic hash of the message ID and content length — they are display conveniences, not real values. Real confirmed values come from `inference_logs` via the dashboard. In a v2, the message component would read confirmed values written back from the ingestion endpoint.

---

## What I'd Improve With More Time

1. **Event-based ingestion** — replace the direct HTTP ingest call with a message queue (Redis Streams, SQS, or Kafka). The ingestion service becomes a consumer, decoupling write volume from latency and enabling fan-out to multiple processors (alerting, aggregation, archival).

2. **Real-time dashboard** — the dashboard is a point-in-time fetch on load. WebSockets or Server-Sent Events would push new `inference_log` rows to the dashboard the moment they land.

3. **Streaming abort** — the send button disables during generation but has no cancel mechanism. An `AbortController` on the fetch call plus a cancel button in the UI is a small change with a big UX impact on long responses.

4. **Retry queue for failed log ships** — `sendBeacon` failures are silently swallowed. A lightweight IndexedDB queue with exponential-backoff retry would prevent data loss under flaky mobile connections.

5. **Authentication** — no auth layer exists. Supabase Auth (JWT) would be the lowest-friction addition before any multi-user deployment.

6. **OLAP for analytics at scale** — inference logs currently live in the primary operational PostgreSQL. At millions of rows, analytical aggregations (SUM, AVG, GROUP BY hour) will slow. Moving `inference_logs` to TimescaleDB or ClickHouse keeps the operational DB fast.

7. **Self-hosted Kubernetes** — the application is on Railway + Vercel (PaaS). Writing `Deployment`, `Service`, `Ingress`, `HPA`, `ConfigMap`, and `Secret` manifests would enable self-hosted production deployment with horizontal scaling and cost control.

---

## Bonus Task Status

### ✅ Completed — 8 / 10

| Bonus                                        | How it's implemented                                                                                                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multi-provider support**                   | `provider-adapter.ts` exposes a `ProviderAdapter` interface. `createProviderAdapter(id)` is a factory. Adding OpenAI or Anthropic = one new object implementing the interface + one new `case`. Zero changes to existing code.     |
| **Streaming responses**                      | Backend returns `StreamingResponse(media_type="application/x-ndjson")`. Frontend reads `response.body` as a `ReadableStream`, parses each newline-delimited JSON chunk, and calls `onChunk(token)` to update the UI incrementally. |
| **Latency + Throughput + Errors dashboards** | Three StatCards (total requests, avg latency, total tokens), a latency time-series chart, an error rate card with 5% elevated / 10% critical thresholds, an AI analysis card, and a live recent inference table.                   |
| **PII redaction**                            | SDK redacts before shipping (email, phone, SSN, card numbers, API keys, Bearer tokens). Ingestion service runs the same rules again as a hard boundary before writing to the DB.                                                   |
| **Docker Compose one-command setup**         | `docker compose up --build` starts PostgreSQL + backend (with auto-migration) + frontend served via nginx with an API proxy.                                                                                                       |
| **List conversations**                       | Sidebar with full conversation list, relative timestamps, pin indicators, delete action.                                                                                                                                           |
| **Resume a conversation**                    | Clicking any sidebar item loads the full message history from the database via `GET /api/v1/conversations/{id}`.                                                                                                                   |
| **Delete / cancel a conversation**           | Trash icon in the sidebar calls `DELETE /api/v1/conversations/{id}`. Cascade deletes messages. Inference logs are preserved (`ON DELETE SET NULL`).                                                                                |

### ❌ Not completed — 2 / 10

| Bonus                        | Effort estimate                    | Notes                                                                                                                                                                           |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Event-based architecture** | 1–2 days                           | Would need a broker (Redis Streams / SQS / Kafka), a producer in the SDK/ingest route, and a consumer worker. The HTTP path works at this scale but is not decoupled.           |
| **Self-hosted Kubernetes**   | 1 day of manifests + cluster setup | App currently deploys to Railway + Vercel (PaaS). k8s manifests would need `Deployment`, `Service`, `Ingress`, `HPA`, `ConfigMap`, `Secret`, and a container registry pipeline. |

---

## Project Structure

```
ollive/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── api/v1/
│       │   ├── chat.py           # POST /chat — streaming LLM proxy
│       │   ├── conversations.py  # CRUD + PATCH /pin
│       │   ├── ingest.py         # POST /ingest
│       │   └── metrics.py        # GET /metrics*
│       ├── core/                 # Config, DB session, exceptions
│       ├── models/               # SQLAlchemy ORM models
│       ├── repositories/         # All SQL lives here
│       ├── schemas/              # Pydantic I/O models
│       └── services/             # Business logic (no HTTP, no SQL)
│           ├── chat_service.py
│           ├── conversation_service.py
│           ├── ingestion_service.py
│           └── pii_service.py    # Regex-based PII redaction
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── components/
│       │   ├── chat/             # MessageBubble, ChatInput, MarkdownRenderer…
│       │   └── dashboard/        # StatCard, LatencyChart, ErrorRateCard
│       ├── hooks/                # useConversation, useInferenceMetrics
│       ├── pages/                # ChatPage, DashboardPage
│       ├── sdk/                  # logger.ts, pii-redactor.ts, provider-adapter.ts
│       ├── services/             # All fetch() calls (no fetch in components)
│       ├── store/                # Zustand store
│       ├── types/                # All TypeScript interfaces
│       └── constants/            # API endpoints, model IDs, timeouts
│
└── migrations/
    └── versions/                 # Alembic versioned migrations
```
