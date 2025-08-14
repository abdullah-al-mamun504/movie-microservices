const express = require('express');
const router = express.Router();
const movieService = require('../services/movieService');
const commentService = require('../services/commentService');
const { validateMovie, validateComment } = require('../utils/validation');
const logger = require('../utils/logger');

// Get all movies with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await movieService.getAllMovies(pageNum, limitNum, search);
    
    res.status(200).json({
      success: true,
      data: result.movies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error getting movies:', error);
    next(error);
  }
});

// Get movie by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getMovieById(id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    logger.error(`Error getting movie with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Create a new movie
router.post('/', validateMovie, async (req, res, next) => {
  try {
    const movieData = req.body;
    const movie = await movieService.createMovie(movieData);
    
    res.status(201).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    logger.error('Error creating movie:', error);
    next(error);
  }
});

// Update a movie
router.put('/:id', validateMovie, async (req, res, next) => {
  try {
    const { id } = req.params;
    const movieData = req.body;
    
    const movie = await movieService.updateMovie(id, movieData);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    logger.error(`Error updating movie with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Delete a movie
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await movieService.deleteMovie(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting movie with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Get comments for a movie
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const result = await commentService.getCommentsByMovieId(id, pageNum, limitNum);
    
    res.status(200).json({
      success: true,
      data: result.comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (error) {
    logger.error(`Error getting comments for movie with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Add a comment to a movie
router.post('/:id/comments', validateComment, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, userId } = req.body;
    
    const comment = await commentService.createComment({
      content,
      userId,
      movieId: parseInt(id),
    });
    
    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    logger.error(`Error adding comment to movie with ID ${req.params.id}:`, error);
    next(error);
  }
});

// Search movies using TMDB
router.get('/search/tmdb', async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }
    
    const result = await movieService.searchMoviesTmdb(query, parseInt(page));
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error searching movies via TMDB:', error);
    next(error);
  }
});

// Get popular movies from TMDB
router.get('/popular/tmdb', async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    
    const result = await movieService.getPopularMoviesTmdb(parseInt(page));
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error getting popular movies from TMDB:', error);
    next(error);
  }
});

module.exports = router;
