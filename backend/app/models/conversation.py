from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.inference_log import InferenceLog
    from app.models.message import Message


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    # onupdate fires only via the ORM — raw SQL updates (migrations, admin tools)
    # will not refresh this column. For production, add a DB-level trigger:
    # CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
    # BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
    # CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations
    # FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=lambda: datetime.now(UTC),
    )

    # lazy="raise" forces explicit loading in repositories — safe for async
    messages: Mapped[list[Message]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="raise",
        order_by="Message.created_at",
    )
    inference_logs: Mapped[list[InferenceLog]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="raise",
    )
