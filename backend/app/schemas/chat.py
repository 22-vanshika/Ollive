import uuid

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    # Accept camelCase from the frontend (sessionId, maxTokens)
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    session_id: uuid.UUID
    messages: list[ChatMessage]
    model: str
    max_tokens: int = Field(default=1024, ge=1)


class ChatResponse(BaseModel):
    # Return camelCase to the frontend (promptTokens, completionTokens, totalTokens)
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model: str
