const express = require('express');
const router = express.Router();
const ratingService = require('../services/ratingService');
const { validateRating } = require('../utils/validation');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all ratings with pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userId, movieId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await ratingService.getAllRatings(pageNum, limitNum, userId, movieId);
    
    res.status(200).json({
      success: true,
      data: result.ratings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error getting ratings:', error);
    next(error);
  }
});

// Get rating by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const rating = await ratingService.getRatingById(id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    logger.error(`Error getting rating with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Get ratings by user ID
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await ratingService.getRatingsByUserId(userId, pageNum, limitNum);
    
    res.status(200).json({
      success: true,
      data: result.ratings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (error) {
    logger.error(`Error getting ratings for user with ID ${req.params.userId}:`, error);
    next(error);
  }
});

// Get ratings by movie ID
router.get('/movie/:movieId', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await ratingService.getRatingsByMovieId(movieId, pageNum, limitNum);
    
    res.status(200).json({
      success: true,
      data: result.ratings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (error) {
    logger.error(`Error getting ratings for movie with ID ${req.params.movieId}:`, error);
    next(error);
  }
});

// Get average rating for a movie
router.get('/movie/:movieId/average', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const averageRating = await ratingService.getAverageRatingForMovie(movieId);
    
    res.status(200).json({
      success: true,
      data: {
        movieId: parseInt(movieId),
        averageRating: averageRating.averageRating,
        totalRatings: averageRating.totalRatings,
      },
    });
  } catch (error) {
    logger.error(`Error getting average rating for movie with ID ${req.params.movieId}:`, error);
    next(error);
  }
});

// Create a new rating
router.post('/', authMiddleware, validateRating, async (req, res, next) => {
  try {
    const { userId } = req.user; // Extracted from JWT token
    const ratingData = { ...req.body, userId };
    
    // Check if user already rated this movie
    const existingRating = await ratingService.getRatingByUserAndMovie(userId, ratingData.movieId);
    
    if (existingRating) {
      // Update existing rating
      const updatedRating = await ratingService.updateRating(existingRating.id, ratingData);
      
      res.status(200).json({
        success: true,
        data: updatedRating,
      });
    } else {
      // Create new rating
      const rating = await ratingService.createRating(ratingData);
      
      res.status(201).json({
        success: true,
        data: rating,
      });
    }
  } catch (error) {
    logger.error('Error creating/updating rating:', error);
    next(error);
  }
});

// Update a rating
router.put('/:id', authMiddleware, validateRating, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // Extracted from JWT token
    
    // Check if rating exists and belongs to the user
    const rating = await ratingService.getRatingById(id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
      });
    }
    
    if (rating.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own ratings',
      });
    }
    
    const updatedRating = await ratingService.updateRating(id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedRating,
    });
  } catch (error) {
    logger.error(`Error updating rating with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Delete a rating
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user; // Extracted from JWT token
    
    // Check if rating exists and belongs to the user
    const rating = await ratingService.getRatingById(id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
      });
    }
    
    if (rating.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own ratings',
      });
    }
    
    const result = await ratingService.deleteRating(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting rating with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Approve a rating (admin function)
router.put('/:id/approve', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.user; // Extracted from JWT token
    
    // Check if user is admin
    if (role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can approve ratings',
      });
    }
    
    const rating = await ratingService.approveRating(id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    logger.error(`Error approving rating with ID ${req.params.id}:`, error);
    next(error);
  }
});

module.exports = router;
