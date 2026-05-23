# Ollive — LLM Inference Logger & Chat App

Ollive is a full-stack LLM inference logger and chat application. It provides a React-based conversational interface and a high-performance FastAPI backend that reliably tracks, redacts, and stores LLM inference metrics.

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL** (Optional if using SQLite locally)

### Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. It expects the backend to be running on `http://localhost:8000`.

### Backend (FastAPI + SQLAlchemy)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the development server
fastapi dev app/main.py
```
The backend API and interactive docs will be available at `http://localhost:8000/docs`.

---

## 🏗 Architecture Overview

Ollive is built on a modern, typed stack designed for speed and reliability:
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, and Zustand for state management. It also includes an integrated SDK (`src/sdk`) for tracking inference calls.
- **Backend**: Python, FastAPI, SQLAlchemy (Async), and Alembic for migrations.
- **Database**: Relational SQL (PostgreSQL/SQLite) using asynchronous drivers for non-blocking database I/O.

---

## 💾 Schema Design Decisions

- **Denormalized Metrics**: Token counts (prompt, completion, total), latencies, and metadata (provider, model) are stored directly on the `inference_logs` table. This avoids expensive `JOIN` operations when calculating system-wide aggregations and metrics.
- **Strategic Indexing**: 
  - `conversation_id` is indexed for lightning-fast timeline rendering in the UI.
  - `session_id` is indexed for SDK-level session replays.
  - `request_id` has a strict unique constraint to ensure idempotency.
- **Foreign Key Policies**: `conversation_id` on the `inference_logs` table uses `ON DELETE SET NULL`. If a user deletes their chat history, the conversation is wiped, but the anonymized inference metrics remain intact for global system analytics.

---

## ⚖️ Tradeoffs Made

1. **Synchronous DB Writes vs. Queueing**: Currently, inference logs are written directly to the database within the HTTP request lifecycle. 
   - *Tradeoff*: This provides immediate read-after-write consistency and drastically simplifies the architecture. However, under massive ingestion load, it could cause database connection bottlenecks compared to an asynchronous message queue (like Kafka/Redis) that batches writes.
2. **Operational DB for Analytics**: We are storing inference logs in the primary operational database (PostgreSQL/SQLite) rather than a dedicated OLAP database (like ClickHouse). 
   - *Tradeoff*: This keeps the infrastructure footprint small and easy to deploy, but as the dataset grows to millions of rows, analytical queries (SUM, AVG) over the logs will become slower.

---

## 📝 Architecture Notes

### Ingestion Flow
1. The frontend or SDK sends an inference payload to the `/api/v1/ingest` endpoint.
2. The service performs an **idempotency check** against the unique `request_id` to reject duplicate payloads caused by network retries.
3. The payload passes through a **Defensive Redaction layer** (`pii_service.redact`). This acts as a strict service boundary guarantee, ensuring that even if a client fails to redact sensitive information, no raw PII ever touches the database.
4. The sanitized log is written asynchronously to the database.

### Logging Strategy
To prevent explosive database growth, Ollive does not log full conversational payloads in the transactional database. Instead, it logs **input and output previews** alongside hard metrics (token counts, latency, status codes). 

### Scaling Considerations
The read paths are heavily optimized with composite indices, meaning dashboard queries will remain fast. The primary scaling bottleneck will be write-heavy ingestion. The use of asynchronous SQLAlchemy (`AsyncSession`) mitigates thread-blocking, allowing the FastAPI server to handle thousands of concurrent connections efficiently.

### Failure Handling Assumptions
- **Network Partitions**: The system assumes network failures will happen between the SDK and the backend. It relies on the client retrying requests with the same `request_id`, which the backend safely ignores via the idempotency constraint.
- **LLM Provider Outages**: External provider errors are gracefully caught, and the `status` column in the log is marked as `"error"`, storing the specific `error_code` for monitoring without crashing the ingestion flow.

---

## 🚀 What I Would Improve With More Time

1. **Decoupled Ingestion Pipeline**: Introduce Redis or RabbitMQ to queue incoming inference logs. A background worker would then batch-insert logs into the database, drastically increasing write throughput and protecting the database from sudden traffic spikes.
2. **OLAP Migration**: Move the `inference_logs` table to a columnar database like ClickHouse or TimescaleDB to support real-time sub-second analytics over massive datasets.
3. **Advanced PII Redaction**: Replace the current PII redaction logic with a specialized lightweight NLP model (e.g., Microsoft Presidio) to detect and mask complex edge cases (like contextual names or obscure identifiers) dynamically.
4. **Rate Limiting**: Implement API rate limiting on the `/api/v1/ingest` endpoint using Redis to prevent malicious actors from flooding the database with forged logs.
