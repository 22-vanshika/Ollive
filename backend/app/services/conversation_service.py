import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories import conversation_repo, message_repo
from app.schemas.conversation import (
    ConversationCreate,
    ConversationPinUpdate,
    ConversationResponse,
    ConversationWithMessages,
    MessageCreate,
    MessageResponse,
)


async def create_conversation(
    session: AsyncSession, payload: ConversationCreate
) -> ConversationResponse:
    conversation = await conversation_repo.create(session, title=payload.title)
    return ConversationResponse.model_validate(conversation)


async def list_conversations(
    session: AsyncSession, *, limit: int = 50, offset: int = 0
) -> list[ConversationResponse]:
    conversations = await conversation_repo.list_all(session, limit=limit, offset=offset)
    return [ConversationResponse.model_validate(c) for c in conversations]


async def get_conversation_with_messages(
    session: AsyncSession, conversation_id: uuid.UUID
) -> ConversationWithMessages:
    conversation = await conversation_repo.get_with_messages(session, conversation_id)
    if conversation is None:
        raise NotFoundError(f"Conversation {conversation_id} not found.")
    return ConversationWithMessages.model_validate(conversation)


async def update_conversation_title(
    session: AsyncSession, conversation_id: uuid.UUID, payload: ConversationCreate
) -> ConversationResponse:
    conversation = await conversation_repo.update_title(
        session, conversation_id, title=payload.title
    )
    if conversation is None:
        raise NotFoundError(f"Conversation {conversation_id} not found.")
    return ConversationResponse.model_validate(conversation)


async def pin_conversation(
    session: AsyncSession, conversation_id: uuid.UUID, payload: ConversationPinUpdate
) -> ConversationResponse:
    conversation = await conversation_repo.set_pinned(
        session, conversation_id, pinned=payload.pinned
    )
    if conversation is None:
        raise NotFoundError(f"Conversation {conversation_id} not found.")
    return ConversationResponse.model_validate(conversation)


async def delete_conversation(
    session: AsyncSession, conversation_id: uuid.UUID
) -> None:
    deleted = await conversation_repo.delete(session, conversation_id)
    if not deleted:
        raise NotFoundError(f"Conversation {conversation_id} not found.")


async def add_message(
    session: AsyncSession, conversation_id: uuid.UUID, payload: MessageCreate
) -> MessageResponse:
    conversation = await conversation_repo.get_by_id(session, conversation_id)
    if conversation is None:
        raise NotFoundError(f"Conversation {conversation_id} not found.")

    message = await message_repo.create(
        session,
        conversation_id=conversation_id,
        role=payload.role,
        content=payload.content,
    )
    return MessageResponse.model_validate(message)
