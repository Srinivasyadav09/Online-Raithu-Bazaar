"""add farmer verification status

Revision ID: 8f4a1c2d9b7e
Revises: 32dca88ecba9
"""

from alembic import op
import sqlalchemy as sa

revision = "8f4a1c2d9b7e"
down_revision = "32dca88ecba9"
branch_labels = None
depends_on = None


def upgrade():
    verification_status_enum = sa.Enum(
        "PROFILE_SUBMITTED",
        "VERIFYING",
        "COMPLETED",
        name="farmerverificationstatus",
    )

    verification_status_enum.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.add_column(
        "farmers",
        sa.Column(
            "verification_status",
            verification_status_enum,
            nullable=True,
        ),
    )

    op.execute(
        """
        UPDATE farmers
        SET verification_status =
            CASE
                WHEN organic_certified = true
                    THEN 'COMPLETED'::farmerverificationstatus
                ELSE 'PROFILE_SUBMITTED'::farmerverificationstatus
            END
        """
    )

    op.alter_column(
        "farmers",
        "verification_status",
        nullable=False,
    )


def downgrade():
    op.drop_column(
        "farmers",
        "verification_status",
    )

    sa.Enum(
        "PROFILE_SUBMITTED",
        "VERIFYING",
        "COMPLETED",
        name="farmerverificationstatus",
    ).drop(
        op.get_bind(),
        checkfirst=True,
    )
