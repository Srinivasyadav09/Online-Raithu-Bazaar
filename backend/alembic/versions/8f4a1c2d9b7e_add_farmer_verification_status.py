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
    op.add_column("farmers", sa.Column("verification_status", sa.Enum("PROFILE_SUBMITTED", "VERIFYING", "COMPLETED", name="farmerverificationstatus"), nullable=True))
    op.execute("UPDATE farmers SET verification_status = CASE WHEN organic_certified = true THEN 'COMPLETED' ELSE 'PROFILE_SUBMITTED' END")
    op.alter_column("farmers", "verification_status", nullable=False)

def downgrade():
    op.drop_column("farmers", "verification_status")
    op.execute("DROP TYPE IF EXISTS farmerverificationstatus")
