"""add program to student profiles

Revision ID: 94086360ff18
Revises: 4ac09a9d26ea
Create Date: 2026-xx-xx
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "94086360ff18"
down_revision = "4ac09a9d26ea"
branch_labels = None
depends_on = None


# 🔹 Define ENUM explicitly
student_program_enum = sa.Enum(
    "DLMOT",
    "DEET",
    "DMET",
    "DCvET",
    "DCpET",
    "DRET",
    "DECET",
    name="student_program_enum"
)


def upgrade():
    student_program_enum.create(op.get_bind(), checkfirst=True)

    with op.batch_alter_table("student_profiles") as batch_op:
        batch_op.add_column(
            sa.Column("program", student_program_enum, nullable=True)
        )


def downgrade():
    with op.batch_alter_table("student_profiles") as batch_op:
        batch_op.drop_column("program")

    student_program_enum.drop(op.get_bind(), checkfirst=True)
