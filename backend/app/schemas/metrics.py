import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class MetricsSummaryResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    total_requests: int
    average_latency_ms: float
    total_tokens_used: int
    error_rate: float


class LatencyDataPoint(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    timestamp: datetime
    latency_ms: int


class RecentLogEntry(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    request_id: uuid.UUID
    timestamp_request: datetime
    latency_ms: int
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    status: Literal["success", "error", "timeout"]
    input_preview: str | None
