"""initial migration

Revision ID: ba819521f539
Revises: 
Create Date: 2025-04-08 12:03:58.405992

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ba819521f539'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user')
    op.drop_table('friendship_mode')
    op.drop_table('couple_mode')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('couple_mode',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('username', sa.VARCHAR(length=25), autoincrement=False, nullable=False),
    sa.Column('display_name', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('profile_picture', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('bio', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('preferences', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('interest', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['username'], ['user.username'], name='couple_mode_username_fkey'),
    sa.PrimaryKeyConstraint('id', name='couple_mode_pkey')
    )
    op.create_table('friendship_mode',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('username', sa.VARCHAR(length=25), autoincrement=False, nullable=False),
    sa.Column('display_name', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('profile_picture', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('bio', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('preferences', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.Column('interest', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['username'], ['user.username'], name='friendship_mode_username_fkey'),
    sa.PrimaryKeyConstraint('id', name='friendship_mode_pkey')
    )
    op.create_table('user',
    sa.Column('username', sa.VARCHAR(length=25), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(length=30), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(length=15), autoincrement=False, nullable=False),
    sa.Column('age', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('email', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('gender', postgresql.ENUM('MALE', 'FEMALE', 'OTHER', name='genders'), autoincrement=False, nullable=False),
    sa.Column('location', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('username', name='user_pkey'),
    sa.UniqueConstraint('email', name='user_email_key')
    )
    # ### end Alembic commands ###
