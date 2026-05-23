import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation


async def create(session: AsyncSession, *, title: str | None) -> Conversation:
    conversation = Conversation(title=title)
    session.add(conversation)
    await session.flush()
    await session.refresh(conversation)
    return conversation


async def get_by_id(
    session: AsyncSession, conversation_id: uuid.UUID
) -> Conversation | None:
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()


async def get_with_messages(
    session: AsyncSession, conversation_id: uuid.UUID
) -> Conversation | None:
    result = await session.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    return result.scalar_one_or_none()


async def list_all(
    session: AsyncSession, *, limit: int = 50, offset: int = 0
) -> list[Conversation]:
    result = await session.execute(
        select(Conversation)
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def update_title(
    session: AsyncSession, conversation_id: uuid.UUID, *, title: str | None
) -> Conversation | None:
    conversation = await get_by_id(session, conversation_id)
    if conversation is None:
        return None
    conversation.title = title
    await session.flush()
    await session.refresh(conversation)
    return conversation


async def delete(session: AsyncSession, conversation_id: uuid.UUID) -> bool:
    conversation = await get_by_id(session, conversation_id)
    if conversation is None:
        return False
    
    # Cascade delete to inference logs directly to clear them and trigger live updates
    from sqlalchemy import delete as sql_delete
    from app.models.inference_log import InferenceLog
    await session.execute(
        sql_delete(InferenceLog).where(InferenceLog.conversation_id == conversation_id)
    )
    
    await session.delete(conversation)
    await session.flush()
    return True
