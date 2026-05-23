from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.models.inference_log import InferenceLog
from app.repositories import inference_log_repo
from app.schemas.ingest import IngestRequest, IngestResponse
from app.schemas.metrics import LatencyDataPoint, MetricsSummaryResponse
from app.services import pii_service


async def ingest_log(session: AsyncSession, payload: IngestRequest) -> IngestResponse:
    existing = await inference_log_repo.get_by_request_id(session, payload.request_id)
    if existing is not None:
        raise ConflictError(f"Log with request_id {payload.request_id} already exists.")

    # Defensive redaction — the SDK should have run this already, but we
    # enforce the guarantee at the service boundary so no raw PII reaches the DB.
    input_preview = pii_service.redact(payload.input_preview) if payload.input_preview else None
    output_preview = pii_service.redact(payload.output_preview) if payload.output_preview else None

    log = InferenceLog(
        session_id=payload.session_id,
        request_id=payload.request_id,
        provider=payload.provider,
        model=payload.model,
        timestamp_request=payload.timestamp_request,
        timestamp_response=payload.timestamp_response,
        latency_ms=payload.latency_ms,
        prompt_tokens=payload.prompt_tokens,
        completion_tokens=payload.completion_tokens,
        total_tokens=payload.total_tokens,
        status=payload.status,
        error_code=payload.error_code,
        input_preview=input_preview,
        output_preview=output_preview,
    )

    saved = await inference_log_repo.save(session, log)

    return IngestResponse(
        id=saved.id,
        request_id=saved.request_id,
        status=saved.status,
    )


async def get_summary(session: AsyncSession) -> MetricsSummaryResponse:
    stats = await inference_log_repo.get_summary_stats(session)
    return MetricsSummaryResponse(**stats)


async def get_latency_series(session: AsyncSession) -> list[LatencyDataPoint]:
    rows = await inference_log_repo.get_latency_series(session)
    return [LatencyDataPoint(**row) for row in rows]
