import json
import groq
from fastapi.responses import StreamingResponse

from app.core.config import get_settings
from app.core.exceptions import ProviderError
from app.schemas.chat import ChatRequest

_client: groq.AsyncGroq | None = None


def _get_client() -> groq.AsyncGroq:
    global _client
    if _client is None:
        _client = groq.AsyncGroq(api_key=get_settings().groq_api_key)
    return _client


async def chat(payload: ChatRequest) -> StreamingResponse:
    client = _get_client()
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]

    try:
        response_stream = await client.chat.completions.create(
            model=payload.model,
            messages=messages,
            max_tokens=payload.max_tokens,
            stream=True,
        )
    except groq.APITimeoutError as exc:
        raise ProviderError("Groq request timed out.") from exc
    except groq.AuthenticationError as exc:
        raise ProviderError("Groq authentication failed.") from exc
    except groq.RateLimitError as exc:
        raise ProviderError("Groq rate limit reached.") from exc
    except groq.APIError as exc:
        raise ProviderError(f"Groq API error: {exc.message}") from exc

    async def event_generator():
        async for chunk in response_stream:
            data = {}
            if chunk.choices:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    data["content"] = delta.content
            if hasattr(chunk, "usage") and chunk.usage:
                data["prompt_tokens"] = chunk.usage.prompt_tokens
                data["completion_tokens"] = chunk.usage.completion_tokens
                data["total_tokens"] = chunk.usage.total_tokens
            if hasattr(chunk, "model") and chunk.model:
                data["model"] = chunk.model
            
            if data:
                yield json.dumps(data) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")
