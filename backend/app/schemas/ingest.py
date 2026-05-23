import uuid
from typing import Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class IngestRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    session_id: uuid.UUID
    request_id: uuid.UUID
    provider: str = Field(min_length=1)
    model: str = Field(min_length=1)

    # AwareDatetime rejects naive (timezone-less) datetimes
    timestamp_request: AwareDatetime
    timestamp_response: AwareDatetime

    latency_ms: int = Field(ge=0)
    prompt_tokens: int = Field(ge=0)
    completion_tokens: int = Field(ge=0)
    total_tokens: int = Field(ge=0)

    status: Literal["success", "error", "timeout"]
    error_code: str | None = None

    # Already PII-redacted and capped at 200 chars by the SDK before shipping
    input_preview: str | None = Field(default=None, max_length=200)
    output_preview: str | None = Field(default=None, max_length=200)


class IngestResponse(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    status: str
