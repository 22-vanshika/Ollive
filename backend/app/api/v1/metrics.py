from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.metrics import LatencyDataPoint, MetricsSummaryResponse, RecentLogEntry
from app.services import ingestion_service

router = APIRouter()

_Db = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=MetricsSummaryResponse)
async def get_summary(session: _Db) -> MetricsSummaryResponse:
    return await ingestion_service.get_summary(session)


@router.get("/latency", response_model=list[LatencyDataPoint])
async def get_latency_series(session: _Db) -> list[LatencyDataPoint]:
    return await ingestion_service.get_latency_series(session)


@router.get("/recent", response_model=list[RecentLogEntry])
async def get_recent_logs(session: _Db) -> list[RecentLogEntry]:
    return await ingestion_service.get_recent_logs(session)
