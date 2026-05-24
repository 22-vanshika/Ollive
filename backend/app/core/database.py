import re as _re
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

# On Vercel (serverless=True):
#   - Use NullPool: no persistent process, so no connection pool survives.
#   - Swap asyncpg → psycopg (v3): Vercel Lambda is IPv4-only; asyncpg
#     connects to IPv6 and fails with EADDRNOTAVAIL.
#
# On Railway / Render / any persistent server (serverless=False):
#   - Use asyncpg with a proper connection pool (pool_size + max_overflow).
#   - asyncpg works fine because Railway supports outbound IPv6.

if _settings.serverless:
    _db_url = _re.sub(
        r"^postgresql\+asyncpg://",
        "postgresql+psycopg://",
        _settings.database_url,
    )
    engine = create_async_engine(
        _db_url,
        poolclass=NullPool,
        echo=False,
    )
else:
    engine = create_async_engine(
        _settings.database_url,
        echo=_settings.app_env == "development",
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
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
