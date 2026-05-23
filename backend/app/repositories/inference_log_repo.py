import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inference_log import InferenceLog


async def save(session: AsyncSession, log: InferenceLog) -> InferenceLog:
    """Persist a fully-constructed InferenceLog instance built by the service."""
    session.add(log)
    await session.flush()
    await session.refresh(log)
    return log


async def get_by_request_id(
    session: AsyncSession, request_id: uuid.UUID
) -> InferenceLog | None:
    result = await session.execute(
        select(InferenceLog).where(InferenceLog.request_id == request_id)
    )
    return result.scalar_one_or_none()


async def get_latency_series(
    session: AsyncSession, limit: int = 100
) -> list[dict]:
    result = await session.execute(
        select(InferenceLog.timestamp_request, InferenceLog.latency_ms)
        .order_by(InferenceLog.timestamp_request.desc())
        .limit(limit)
    )
    rows = result.all()
    # Reverse so the chart receives points in chronological (oldest → newest) order.
    return [
        {"timestamp": row.timestamp_request, "latency_ms": row.latency_ms}
        for row in reversed(rows)
    ]


async def get_recent_logs(session: AsyncSession, limit: int = 6) -> list[dict]:
    result = await session.execute(
        select(
            InferenceLog.request_id,
            InferenceLog.timestamp_request,
            InferenceLog.latency_ms,
            InferenceLog.prompt_tokens,
            InferenceLog.completion_tokens,
            InferenceLog.total_tokens,
            InferenceLog.status,
            InferenceLog.input_preview,
        )
        .order_by(InferenceLog.timestamp_request.desc())
        .limit(limit)
    )
    return [row._asdict() for row in result.all()]


async def get_summary_stats(session: AsyncSession) -> dict:
    result = await session.execute(
        select(
            func.count(InferenceLog.id).label("total_requests"),
            func.avg(InferenceLog.latency_ms).label("avg_latency_ms"),
            func.sum(InferenceLog.total_tokens).label("total_tokens_used"),
            func.count(InferenceLog.id)
            .filter(InferenceLog.status.in_(["error", "timeout"]))
            .label("non_success_count"),
        )
    )
    row = result.one()
    total = row.total_requests or 0
    return {
        "total_requests": total,
        "average_latency_ms": float(row.avg_latency_ms) if row.avg_latency_ms else 0.0,
        "total_tokens_used": row.total_tokens_used or 0,
        "error_rate": (row.non_success_count / total) if total else 0.0,
    }
