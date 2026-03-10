"""allow nullable moa_file_path in moa_prospects

Revision ID: 8f1c_allow_nullable_moa_file
Revises: 26cbf8bf022f
Create Date: 2026-03-10 08:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f1c_allow_nullable_moa_file'
down_revision = '26cbf8bf022f'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'moa_prospects',
        'moa_file_path',
        existing_type=sa.String(length=255),
        nullable=True
    )


def downgrade():
    op.alter_column(
        'moa_prospects',
        'moa_file_path',
        existing_type=sa.String(length=255),
        nullable=False
    )