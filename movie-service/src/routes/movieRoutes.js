// movie-service/src/routes/movieRoutes.js

const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { 
  syncTop100Movies, 
  getMoviesByYear, 
  getAvailableYears,
  searchMovies 
} = require('../services/tmdbService');
const logger = require('../utils/logger');

/**
 * GET /api/movies
 * Get all movies with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const year = req.query.year ? parseInt(req.query.year) : null;

    const whereClause = { isActive: true };
    if (year) {
      whereClause.releaseYear = year;
    }

    const { count, rows } = await Movie.findAndCountAll({
      where: whereClause,
      order: [
        ['voteAverage', 'DESC'],
        ['popularity', 'DESC']
      ],
      limit: limit,
      offset: offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: page,
        limit: limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/top
 * Get top 100 movies (optionally filtered by year)
 */
router.get('/top', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : null;
    const limit = parseInt(req.query.limit) || 100;

    const whereClause = { isActive: true };
    if (year) {
      whereClause.releaseYear = year;
    }

    const movies = await Movie.findAll({
      where: whereClause,
      order: [
        ['voteAverage', 'DESC'],
        ['popularity', 'DESC']
      ],
      limit: limit
    });

    res.json({
      success: true,
      data: movies,
      count: movies.length,
      year: year || 'all'
    });
  } catch (error) {
    logger.error('Error fetching top movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/years
 * Get all available years
 */
router.get('/years', async (req, res) => {
  try {
    const years = await getAvailableYears();
    
    res.json({
      success: true,
      data: years
    });
  } catch (error) {
    logger.error('Error fetching years:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/search
 * Search movies by title
 */
router.get('/search', async (req, res) => {
  try {
    const { q, year } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }

    // First search in local database
    const whereClause = {
      title: {
        [require('sequelize').Op.iLike]: `%${q}%`
      },
      isActive: true
    };

    if (year) {
      whereClause.releaseYear = parseInt(year);
    }

    const localMovies = await Movie.findAll({
      where: whereClause,
      order: [['voteAverage', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      data: localMovies,
      count: localMovies.length,
      source: 'database'
    });
  } catch (error) {
    logger.error('Error searching movies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/:id
 * Get single movie by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({
      where: {
        id: req.params.id,
        isActive: true
      }
    });

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        error: 'Movie not found' 
      });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    logger.error('Error fetching movie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/movies/sync
 * Sync top 100 movies from TMDB (Admin only)
 */
router.post('/sync', async (req, res) => {
  try {
    const year = req.body.year ? parseInt(req.body.year) : null;
    
    logger.info(`Starting movie sync${year ? ` for year ${year}` : ''}...`);
    
    // Run sync in background
    syncTop100Movies(year).then((movies) => {
      logger.info(`Sync completed: ${movies.length} movies synced`);
    }).catch((error) => {
      logger.error('Sync failed:', error);
    });

    res.json({
      success: true,
      message: `Movie sync started${year ? ` for year ${year}` : ''}. This may take a few minutes.`
    });
  } catch (error) {
    logger.error('Error starting sync:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/movies/by-year/:year
 * Get movies by specific year
 */
router.get('/by-year/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const limit = parseInt(req.query.limit) || 100;

    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid year' 
      });
    }

    const movies = await getMoviesByYear(year, limit);

    res.json({
      success: true,
      data: movies,
      count: movies.length,
      year: year
    });
  } catch (error) {
    logger.error(`Error fetching movies for year ${req.params.year}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/movies/:id
 * Soft delete a movie (Admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        error: 'Movie not found' 
      });
    }

    movie.isActive = false;
    await movie.save();

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting movie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;