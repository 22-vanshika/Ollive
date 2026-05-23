class OlliveError(Exception):
    """Base exception for all application-level errors."""

    http_status: int = 500
    default_message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class NotFoundError(OlliveError):
    """Raised when a requested resource does not exist."""

    http_status = 404
    default_message = "Resource not found."


class ConflictError(OlliveError):
    """Raised when an operation violates a uniqueness constraint."""

    http_status = 409
    default_message = "Resource already exists."


class BusinessValidationError(OlliveError):
    """Raised when a payload is structurally valid but fails business rules."""

    http_status = 422
    default_message = "Validation failed."


class IngestionError(OlliveError):
    """Raised when a log payload cannot be persisted."""

    http_status = 500
    default_message = "Log ingestion failed."


class ProviderError(OlliveError):
    """Raised when the LLM provider returns an error or times out."""

    http_status = 502
    default_message = "LLM provider error."


class DatabaseError(OlliveError):
    """Raised when a repository operation fails unexpectedly."""

    http_status = 500
    default_message = "Database operation failed."
