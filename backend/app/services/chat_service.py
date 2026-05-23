import groq

from app.core.config import get_settings
from app.core.exceptions import ProviderError
from app.schemas.chat import ChatRequest, ChatResponse

_client: groq.AsyncGroq | None = None


def _get_client() -> groq.AsyncGroq:
    global _client
    if _client is None:
        _client = groq.AsyncGroq(api_key=get_settings().groq_api_key)
    return _client


async def chat(payload: ChatRequest) -> ChatResponse:
    client = _get_client()
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]

    try:
        response = await client.chat.completions.create(
            model=payload.model,
            messages=messages,
            max_tokens=payload.max_tokens,
        )
    except groq.APITimeoutError as exc:
        raise ProviderError("Groq request timed out.") from exc
    except groq.AuthenticationError as exc:
        raise ProviderError("Groq authentication failed.") from exc
    except groq.RateLimitError as exc:
        raise ProviderError("Groq rate limit reached.") from exc
    except groq.APIError as exc:
        raise ProviderError(f"Groq API error: {exc.message}") from exc

    choice = response.choices[0]
    usage = response.usage

    return ChatResponse(
        content=choice.message.content or "",
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
        model=response.model,
    )
