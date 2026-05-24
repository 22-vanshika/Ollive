from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

_settings = get_settings()

# Vercel / any serverless platform: no persistent process means no connection
# pool survives between requests.  NullPool opens a fresh connection per
# request and closes it immediately — safe for all serverless runtimes.
# On a long-running server (e.g. Railway / Render) swap NullPool for
# pool_size=10, max_overflow=20, pool_pre_ping=True instead.
_is_serverless = _settings.app_env == "production"

engine = create_async_engine(
    _settings.database_url,
    echo=_settings.app_env == "development",
    **({"poolclass": NullPool} if _is_serverless else {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
    }),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
