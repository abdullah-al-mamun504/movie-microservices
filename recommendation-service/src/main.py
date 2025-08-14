import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import redis
import json
from datetime import datetime, timedelta

from database import get_db, engine  # Fixed import
from models import Base, Recommendation  # Fixed import
from schemas import Recommendation as RecommendationSchema, RecommendationCreate  # Fixed import
from services import RecommendationService  # Fixed import
from utils import get_redis_client, setup_logging  # Fixed import

# Create database tables
Base.metadata.create_all(bind=engine)

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Movie Recommendation Service",
    description="Provides movie recommendations based on user preferences and ratings",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis client
redis_client = get_redis_client()

# Initialize services
recommendation_service = RecommendationService()

# External service URLs
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8080")
MOVIE_SERVICE_URL = os.getenv("MOVIE_SERVICE_URL", "http://movie-service:3001")
RATING_SERVICE_URL = os.getenv("RATING_SERVICE_URL", "http://rating-service:3002")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "recommendation-service", "timestamp": datetime.now().isoformat()}

@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    try:
        # Check database connection
        db = next(get_db())
        db.execute("SELECT 1")

        # Check Redis connection
        redis_client.ping()

        return {"status": "ready", "service": "recommendation-service", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service not ready")

@app.get("/api/recommendations/top", response_model=List[RecommendationSchema])
async def get_top_recommendations(
    userId: str = Query(..., description="User ID"),
    limit: int = Query(5, description="Number of recommendations to return"),
    db: Session = Depends(get_db)
):
    """
    Get top movie recommendations for a user based on their ratings and preferences.
    Returns the top 5 recommended movies by default.
    """
    try:
        # Check cache first
        cache_key = f"recommendations:top:{userId}:{limit}"
        cached_result = redis_client.get(cache_key)

        if cached_result:
            logger.info(f"Returning cached recommendations for user {userId}")
            return json.loads(cached_result)

        # Get user's ratings from the rating service
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{RATING_SERVICE_URL}/api/ratings/user/{userId}")

            if response.status_code != 200:
                logger.error(f"Failed to get user ratings: {response.status_code}")
                raise HTTPException(status_code=500, detail="Failed to get user ratings")

            user_ratings = response.json().get("data", [])

        # Get user's preferences
        user_preferences = await recommendation_service.extract_user_preferences(user_ratings)

        # Get popular movies as fallback
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{MOVIE_SERVICE_URL}/api/movies/popular/tmdb")

            if response.status_code != 200:
                logger.error(f"Failed to get popular movies: {response.status_code}")
                raise HTTPException(status_code=500, detail="Failed to get popular movies")

            popular_movies = response.json().get("data", {}).get("results", [])

        # Generate recommendations based on user preferences
        recommendations = await recommendation_service.generate_recommendations(
            user_preferences,
            popular_movies,
            limit
        )

        # Cache the result
        redis_client.setex(
            cache_key,
            timedelta(hours=1).seconds,
            json.dumps([rec.dict() for rec in recommendations])
        )

        # Store recommendations in database
        for rec in recommendations:
            db_recommendation = Recommendation(
                user_id=int(userId),
                movie_id=rec.movie_id,
                score=rec.score,
                reason=rec.reason,
                created_at=datetime.now()
            )
            db.add(db_recommendation)

        db.commit()

        return recommendations

    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@app.get("/api/recommendations/similar/{movie_id}", response_model=List[RecommendationSchema])
async def get_similar_movies(
    movie_id: int,
    limit: int = Query(5, description="Number of similar movies to return"),
    db: Session = Depends(get_db)
):
    """
    Get movies similar to the specified movie based on genre, director, and other attributes.
    """
    try:
        # Check cache first
        cache_key = f"recommendations:similar:{movie_id}:{limit}"
        cached_result = redis_client.get(cache_key)

        if cached_result:
            logger.info(f"Returning cached similar movies for movie {movie_id}")
            return json.loads(cached_result)

        # Get movie details
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{MOVIE_SERVICE_URL}/api/movies/{movie_id}")

            if response.status_code != 200:
                logger.error(f"Failed to get movie details: {response.status_code}")
                raise HTTPException(status_code=404, detail="Movie not found")

            movie = response.json().get("data", {})

        # Get similar movies
        similar_movies = await recommendation_service.get_similar_movies(movie, limit)

        # Cache the result
        redis_client.setex(
            cache_key,
            timedelta(hours=6).seconds,
            json.dumps([rec.dict() for rec in similar_movies])
        )

        return similar_movies

    except Exception as e:
        logger.error(f"Error getting similar movies: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get similar movies")

@app.get("/api/recommendations/popular", response_model=List[RecommendationSchema])
async def get_popular_movies(
    limit: int = Query(5, description="Number of popular movies to return"),
    db: Session = Depends(get_db)
):
    """
    Get popular movies based on ratings and views.
    """
    try:
        # Check cache first
        cache_key = f"recommendations:popular:{limit}"
        cached_result = redis_client.get(cache_key)

        if cached_result:
            logger.info("Returning cached popular movies")
            return json.loads(cached_result)

        # Get popular movies from movie service
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{MOVIE_SERVICE_URL}/api/movies/popular/tmdb")

            if response.status_code != 200:
                logger.error(f"Failed to get popular movies: {response.status_code}")
                raise HTTPException(status_code=500, detail="Failed to get popular movies")

            popular_movies_data = response.json().get("data", {}).get("results", [])

        # Convert to recommendation format
        popular_recommendations = []
        for movie in popular_movies_data[:limit]:
            rec = RecommendationSchema(
                id=0,  # Will be set when saved to DB
                user_id=0,  # System recommendation
                movie_id=movie.get("id"),
                score=movie.get("popularity", 0),
                reason="Popular movie",
                created_at=datetime.now()
            )
            popular_recommendations.append(rec)

        # Cache the result
        redis_client.setex(
            cache_key,
            timedelta(hours=12).seconds,
            json.dumps([rec.dict() for rec in popular_recommendations])
        )

        return popular_recommendations

    except Exception as e:
        logger.error(f"Error getting popular movies: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get popular movies")

@app.get("/api/recommendations/user/{user_id}", response_model=List[RecommendationSchema])
async def get_user_recommendations(
    user_id: int,
    limit: int = Query(10, description="Number of recommendations to return"),
    db: Session = Depends(get_db)
):
    """
    Get all recommendations for a specific user from the database.
    """
    try:
        recommendations = db.query(Recommendation).filter(
            Recommendation.user_id == user_id
        ).order_by(Recommendation.score.desc()).limit(limit).all()

        return recommendations

    except Exception as e:
        logger.error(f"Error getting user recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user recommendations")

@app.post("/api/recommendations", response_model=RecommendationSchema)
async def create_recommendation(
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new recommendation (admin function).
    """
    try:
        db_recommendation = Recommendation(
            user_id=recommendation.user_id,
            movie_id=recommendation.movie_id,
            score=recommendation.score,
            reason=recommendation.reason,
            created_at=datetime.now()
        )

        db.add(db_recommendation)
        db.commit()
        db.refresh(db_recommendation)

        # Invalidate cache
        redis_client.delete(f"recommendations:top:{recommendation.user_id}:*")

        return db_recommendation

    except Exception as e:
        logger.error(f"Error creating recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create recommendation")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
