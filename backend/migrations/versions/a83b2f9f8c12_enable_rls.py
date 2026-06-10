"""enable_rls

Revision ID: a83b2f9f8c12
Revises: 790bf7a39b4b
Create Date: 2026-06-10 11:36:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a83b2f9f8c12'
down_revision: Union[str, Sequence[str], None] = '790bf7a39b4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE messages ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE inference_logs ENABLE ROW LEVEL SECURITY;")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE messages DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE inference_logs DISABLE ROW LEVEL SECURITY;")
