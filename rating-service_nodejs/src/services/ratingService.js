const { Rating } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { getRedisClient } = require('../utils/redis');

const getAllRatings = async (page = 1, limit = 10, userId = null, movieId = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (movieId) {
      whereClause.movieId = movieId;
    }
    
    const { count, rows } = await Rating.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      ratings: rows,
      total: count,
    };
  } catch (error) {
    logger.error('Error getting all ratings:', error);
    throw error;
  }
};

const getRatingById = async (id) => {
  try {
    const rating = await Rating.findByPk(id);
    return rating;
  } catch (error) {
    logger.error(`Error getting rating with ID ${id}:`, error);
    throw error;
  }
};

const getRatingByUserAndMovie = async (userId, movieId) => {
  try {
    const rating = await Rating.findOne({
      where: {
        userId,
        movieId,
      },
    });
    return rating;
  } catch (error) {
    logger.error(`Error getting rating for user ${userId} and movie ${movieId}:`, error);
    throw error;
  }
};

const getRatingsByUserId = async (userId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Rating.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      ratings: rows,
      total: count,
    };
  } catch (error) {
    logger.error(`Error getting ratings for user with ID ${userId}:`, error);
    throw error;
  }
};

const getRatingsByMovieId = async (movieId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Rating.findAndCountAll({
      where: { movieId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      ratings: rows,
      total: count,
    };
  } catch (error) {
    logger.error(`Error getting ratings for movie with ID ${movieId}:`, error);
    throw error;
  }
};

const getAverageRatingForMovie = async (movieId) => {
  try {
    // Check cache first
    const redis = getRedisClient();
    const cacheKey = `movie:${movieId}:average_rating`;
    const cachedResult = await redis.get(cacheKey);
    
    if (cachedResult) {
      logger.debug(`Returning cached average rating for movie ${movieId}`);
      return JSON.parse(cachedResult);
    }
    
    // Calculate average rating from database
    const result = await Rating.findOne({
      where: { movieId, isApproved: true },
      attributes: [
        [Rating.sequelize.fn('AVG', Rating.sequelize.col('rating')), 'averageRating'],
        [Rating.sequelize.fn('COUNT', Rating.sequelize.col('id')), 'totalRatings'],
      ],
      raw: true,
    });
    
    const averageRating = {
      averageRating: parseFloat(result.averageRating || 0).toFixed(1),
      totalRatings: parseInt(result.totalRatings || 0),
    };
    
    // Cache the result for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(averageRating));
    
    return averageRating;
  } catch (error) {
    logger.error(`Error getting average rating for movie with ID ${movieId}:`, error);
    throw error;
  }
};

const createRating = async (ratingData) => {
  try {
    const rating = await Rating.create(ratingData);
    
    // Invalidate cache for this movie
    const redis = getRedisClient();
    await redis.del(`movie:${ratingData.movieId}:average_rating`);
    
    return rating;
  } catch (error) {
    logger.error('Error creating rating:', error);
    throw error;
  }
};

const updateRating = async (id, ratingData) => {
  try {
    const [updated] = await Rating.update(ratingData, {
      where: { id },
    });

    if (updated) {
      const updatedRating = await Rating.findByPk(id);
      
      // Invalidate cache for this movie
      const redis = getRedisClient();
      await redis.del(`movie:${updatedRating.movieId}:average_rating`);
      
      return updatedRating;
    }

    return null;
  } catch (error) {
    logger.error(`Error updating rating with ID ${id}:`, error);
    throw error;
  }
};

const deleteRating = async (id) => {
  try {
    // Get the rating first to invalidate cache
    const rating = await Rating.findByPk(id);
    if (!rating) {
      return false;
    }
    
    const deleted = await Rating.destroy({
      where: { id },
    });

    if (deleted > 0) {
      // Invalidate cache for this movie
      const redis = getRedisClient();
      await redis.del(`movie:${rating.movieId}:average_rating`);
      
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error deleting rating with ID ${id}:`, error);
    throw error;
  }
};

const approveRating = async (id) => {
  try {
    const [updated] = await Rating.update(
      { isApproved: true },
      {
        where: { id },
      }
    );

    if (updated) {
      const updatedRating = await Rating.findByPk(id);
      
      // Invalidate cache for this movie
      const redis = getRedisClient();
      await redis.del(`movie:${updatedRating.movieId}:average_rating`);
      
      return updatedRating;
    }

    return null;
  } catch (error) {
    logger.error(`Error approving rating with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllRatings,
  getRatingById,
  getRatingByUserAndMovie,
  getRatingsByUserId,
  getRatingsByMovieId,
  getAverageRatingForMovie,
  createRating,
  updateRating,
  deleteRating,
  approveRating,
};
