import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import router
from app.core.config import get_settings
from app.core.exceptions import OlliveError
from app.schemas import HealthResponse

_settings = get_settings()

logging.basicConfig(
    level=_settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)


def create_app() -> FastAPI:
    app = FastAPI(
        title="Ollive — LLM Inference Logger",
        version="0.1.0",
        # Hide docs in production
        docs_url="/docs" if _settings.app_env != "production" else None,
        redoc_url="/redoc" if _settings.app_env != "production" else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(OlliveError)
    async def _ollive_error_handler(request: Request, exc: OlliveError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.http_status,
            content={"detail": exc.message},
        )

    @app.get("/health", response_model=HealthResponse, tags=["health"], include_in_schema=False)
    async def _health() -> HealthResponse:
        return HealthResponse(status="ok")

    app.include_router(router)

    return app


app = create_app()
