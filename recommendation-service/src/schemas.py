from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RecommendationBase(BaseModel):
    user_id: int
    movie_id: int
    score: float
    reason: Optional[str] = None

class RecommendationCreate(RecommendationBase):
    pass

class Recommendation(RecommendationBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
