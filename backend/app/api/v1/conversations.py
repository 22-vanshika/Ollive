from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.conversation import (
    ConversationCreate,
    ConversationPinUpdate,
    ConversationResponse,
    ConversationWithMessages,
    MessageCreate,
    MessageResponse,
)
from app.services import conversation_service

router = APIRouter()

_Db = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate, session: _Db
) -> ConversationResponse:
    return await conversation_service.create_conversation(session, payload)


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    session: _Db,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[ConversationResponse]:
    return await conversation_service.list_conversations(session, limit=limit, offset=offset)


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: UUID, session: _Db
) -> ConversationWithMessages:
    return await conversation_service.get_conversation_with_messages(session, conversation_id)


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: UUID, payload: ConversationCreate, session: _Db
) -> ConversationResponse:
    return await conversation_service.update_conversation_title(
        session, conversation_id, payload
    )


@router.patch("/{conversation_id}/pin", response_model=ConversationResponse)
async def pin_conversation(
    conversation_id: UUID, payload: ConversationPinUpdate, session: _Db
) -> ConversationResponse:
    return await conversation_service.pin_conversation(session, conversation_id, payload)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(conversation_id: UUID, session: _Db) -> None:
    await conversation_service.delete_conversation(session, conversation_id)


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_message(
    conversation_id: UUID, payload: MessageCreate, session: _Db
) -> MessageResponse:
    return await conversation_service.add_message(session, conversation_id, payload)
