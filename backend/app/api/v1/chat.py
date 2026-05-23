from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.services import chat_service

router = APIRouter()


@router.post("", response_class=StreamingResponse)
async def chat(payload: ChatRequest) -> StreamingResponse:
    return await chat_service.chat(payload)
