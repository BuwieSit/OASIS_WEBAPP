"""add notification saved and read tracking

Revision ID: 7f2c1b9a4d10
Revises: b1f7c1b2d9aa
Create Date: 2026-03-11 00:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7f2c1b9a4d10"
down_revision = "b1f7c1b2d9aa"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("notifications", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("is_saved", sa.Boolean(), nullable=False, server_default=sa.false())
        )
        batch_op.add_column(sa.Column("read_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("saved_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("last_interacted_at", sa.DateTime(), nullable=True))

    with op.batch_alter_table("notifications", schema=None) as batch_op:
        batch_op.alter_column("is_saved", server_default=None)


def downgrade():
    with op.batch_alter_table("notifications", schema=None) as batch_op:
        batch_op.drop_column("last_interacted_at")
        batch_op.drop_column("saved_at")
        batch_op.drop_column("read_at")
        batch_op.drop_column("is_saved")