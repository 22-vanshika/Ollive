from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service

router = APIRouter()


@router.post("", response_model=ChatResponse, response_model_by_alias=True)
async def chat(payload: ChatRequest) -> ChatResponse:
    return await chat_service.chat(payload)
