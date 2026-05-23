from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.conversation import Conversation


class InferenceLog(Base):
    __tablename__ = "inference_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
    )

    # §6.5 canonical payload fields
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    request_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, unique=True)
    provider: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp_request: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    timestamp_response: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    # "success" | "error" | "timeout" — validated at the schema layer
    status: Mapped[str] = mapped_column(Text, nullable=False)
    error_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_preview: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_preview: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    conversation: Mapped[Conversation | None] = relationship(
        back_populates="inference_logs",
        lazy="raise",
    )

    __table_args__ = (
        # Serves: fetch all logs for a conversation (dashboard timeline).
        # Beneficial from the first row — every conversation detail view uses this.
        Index("ix_inference_logs_conversation_id", "conversation_id"),
        # Serves: group/filter logs by session (SDK-level session replay).
        # Beneficial at ~1 000+ rows when sessions fan out across many logs.
        Index("ix_inference_logs_session_id", "session_id"),
        # Serves: idempotency check — reject duplicate request_ids on ingest.
        # Covered by the unique constraint; listed here for Alembic visibility.
        Index("ix_inference_logs_request_id", "request_id", unique=True),
    )
