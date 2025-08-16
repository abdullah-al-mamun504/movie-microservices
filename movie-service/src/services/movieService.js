const { Movie } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
} = require('./tmdbService');

const getAllMovies = async (page = 1, limit = 10, search = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { originalTitle: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Movie.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      movies: rows,
      total: count,
    };
  } catch (error) {
    logger.error('Error getting all movies:', error);
    throw error;
  }
};

const getMovieById = async (id) => {
  try {
    const movie = await Movie.findByPk(id, {
      include: ['comments'],
    });

    return movie;
  } catch (error) {
    logger.error(`Error getting movie with ID ${id}:`, error);
    throw error;
  }
};

const createMovie = async (movieData) => {
  try {
    const movie = await Movie.create(movieData);
    return movie;
  } catch (error) {
    logger.error('Error creating movie:', error);
    throw error;
  }
};

const updateMovie = async (id, movieData) => {
  try {
    const [updated] = await Movie.update(movieData, {
      where: { id },
    });

    if (updated) {
      const updatedMovie = await Movie.findByPk(id);
      return updatedMovie;
    }

    return null;
  } catch (error) {
    logger.error(`Error updating movie with ID ${id}:`, error);
    throw error;
  }
};

const deleteMovie = async (id) => {
  try {
    const deleted = await Movie.destroy({
      where: { id },
    });

    return deleted > 0;
  } catch (error) {
    logger.error(`Error deleting movie with ID ${id}:`, error);
    throw error;
  }
};

const searchMoviesTmdb = async (query, page = 1) => {
  try {
    const result = await searchMovies(query, page);
    return result;
  } catch (error) {
    logger.error('Error searching movies via TMDB:', error);
    throw error;
  }
};

const getPopularMoviesTmdb = async (page = 1) => {
  try {
    const result = await getPopularMovies(page);
    return result;
  } catch (error) {
    logger.error('Error getting popular movies from TMDB:', error);
    throw error;
  }
};

const getTopRatedMoviesTmdb = async (page = 1) => {
  try {
    const result = await getTopRatedMovies(page);
    return result;
  } catch (error) {
    logger.error('Error getting top rated movies from TMDB:', error);
    throw error;
  }
};

const getUpcomingMoviesTmdb = async (page = 1) => {
  try {
    const result = await getUpcomingMovies(page);
    return result;
  } catch (error) {
    logger.error('Error getting upcoming movies from TMDB:', error);
    throw error;
  }
};

const enrichMovieFromTmdb = async (movieId) => {
  try {
    // First, get the movie from our database
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      throw new Error('Movie not found');
    }

    // If we already have a TMDB ID, get the details from TMDB
    if (movie.tmdbId) {
      const tmdbMovie = await getMovieDetails(movie.tmdbId);
      
      // Update our movie with additional data from TMDB
      const updatedMovie = await movie.update({
        overview: tmdbMovie.overview || movie.overview,
        posterPath: tmdbMovie.poster_path || movie.posterPath,
        backdropPath: tmdbMovie.backdrop_path || movie.backdropPath,
        runtime: tmdbMovie.runtime || movie.runtime,
        voteAverage: tmdbMovie.vote_average || movie.voteAverage,
        voteCount: tmdbMovie.vote_count || movie.voteCount,
        popularity: tmdbMovie.popularity || movie.popularity,
      });

      return updatedMovie;
    }

    return movie;
  } catch (error) {
    logger.error(`Error enriching movie with ID ${movieId} from TMDB:`, error);
    throw error;
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMoviesTmdb,
  getPopularMoviesTmdb,
  getTopRatedMoviesTmdb,
  getUpcomingMoviesTmdb,
  enrichMovieFromTmdb,
};
