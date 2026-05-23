from fastapi import APIRouter

from app.schemas.chat import ChatRequest
from app.services import chat_service

router = APIRouter()


@router.post("")
async def chat(payload: ChatRequest):
    return await chat_service.chat(payload)
