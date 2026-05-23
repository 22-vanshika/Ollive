from fastapi import APIRouter

from app.api.v1 import chat, conversations, ingest, metrics

router = APIRouter(prefix="/api/v1")

router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
