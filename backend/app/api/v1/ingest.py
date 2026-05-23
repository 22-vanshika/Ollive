from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.ingest import IngestRequest, IngestResponse
from app.services import ingestion_service

router = APIRouter()

_Db = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_log(payload: IngestRequest, session: _Db) -> IngestResponse:
    return await ingestion_service.ingest_log(session, payload)
