import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message


async def create(
    session: AsyncSession,
    *,
    conversation_id: uuid.UUID,
    role: str,
    content: str,
) -> Message:
    message = Message(conversation_id=conversation_id, role=role, content=content)
    session.add(message)
    await session.flush()
    await session.refresh(message)
    return message


async def list_by_conversation(
    session: AsyncSession, conversation_id: uuid.UUID
) -> list[Message]:
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    return list(result.scalars().all())
