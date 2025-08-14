"""
create recommendations table

Revision ID: 20231101000000
Revises: 
Create Date: 2023-11-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '20231101000000'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create recommendations table
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('movie_id', sa.Integer(), nullable=True),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_recommendations_id'), 'recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_recommendations_movie_id'), 'recommendations', ['movie_id'], unique=False)
    op.create_index(op.f('ix_recommendations_user_id'), 'recommendations', ['user_id'], unique=False)

def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_recommendations_user_id'), table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_movie_id'), table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_id'), table_name='recommendations')
    
    # Drop table
    op.drop_table('recommendations')
