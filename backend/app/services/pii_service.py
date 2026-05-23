import re

# Each tuple is (compiled pattern, replacement label).
# Patterns are compiled once at import time.
_RULES: list[tuple[re.Pattern[str], str]] = [
    # Email addresses
    (
        re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"),
        "[EMAIL]",
    ),
    # US/international phone numbers — handles +1 (555) 123-4567, 555.123.4567, etc.
    (
        re.compile(
            r"\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
        ),
        "[PHONE]",
    ),
    # Credit/debit card numbers — 13–16 digits with optional space or hyphen separators
    (
        re.compile(r"\b(?:\d[ \-]?){13,15}\d\b"),
        "[CARD]",
    ),
    # US Social Security Numbers — NNN-NN-NNNN or NNN NN NNNN (separator required)
    (
        re.compile(r"\b\d{3}[-\s]\d{2}[-\s]\d{4}\b"),
        "[SSN]",
    ),
    # Google API keys (AIzaSy…) and OpenAI / Anthropic-style sk- keys
    (
        re.compile(r"\bAIzaSy[A-Za-z0-9_\-]{33}\b"),
        "[API_KEY]",
    ),
    (
        re.compile(r"\b(?:sk-ant-|sk-)[A-Za-z0-9\-_]{20,}\b"),
        "[API_KEY]",
    ),
    # Groq API keys (gsk_ + 52 alphanumeric chars)
    (
        re.compile(r"\bgsk_[A-Za-z0-9]{52}\b"),
        "[API_KEY]",
    ),
    (
        re.compile(r"Bearer\s+[A-Za-z0-9\-_.~+/]+=*", re.IGNORECASE),
        "[BEARER_TOKEN]",
    ),
]


def redact(text: str) -> str:
    """Replace known PII patterns with labelled placeholders."""
    for pattern, label in _RULES:
        text = pattern.sub(label, text)
    return text
