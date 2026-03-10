"""merge notification heads

Revision ID: b1f7c1b2d9aa
Revises: 4636095ec635, 8f1c_allow_nullable_moa_file
Create Date: 2026-03-11 00:00:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "b1f7c1b2d9aa"
down_revision = ("4636095ec635", "8f1c_allow_nullable_moa_file")
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass