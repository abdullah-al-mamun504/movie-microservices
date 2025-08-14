const axios = require('axios');
const logger = require('../utils/logger');
const { getRedisClient } = require('../utils/redis');

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const CACHE_EXPIRY_SECONDS = 3600; // 1 hour

let redisClient;

const initializeTMDB = () => {
  // Initialize Redis connection
  getRedisClient().then(client => {
    redisClient = client;
    logger.info('TMDB service initialized');
  }).catch(err => {
    logger.error('Failed to initialize Redis for TMDB service:', err);
  });
};

const getFromCache = async (key) => {
  try {
    if (!redisClient) return null;
    
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(cachedData);
    }
    
    logger.debug(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error('Error getting data from cache:', error);
    return null;
  }
};

const setCache = async (key, data) => {
  try {
    if (!redisClient) return;
    
    await redisClient.setEx(key, CACHE_EXPIRY_SECONDS, JSON.stringify(data));
    logger.debug(`Data cached for key: ${key}`);
  } catch (error) {
    logger.error('Error setting cache:', error);
  }
};

const makeTmdbRequest = async (endpoint, params = {}) => {
  try {
    const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Make request to TMDB API
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params,
      },
    });
    
    // Cache the response
    await setCache(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    logger.error(`Error making TMDB request to ${endpoint}:`, error.message);
    throw error;
  }
};

const searchMovies = async (query, page = 1) => {
  return makeTmdbRequest('search/movie', { query, page });
};

const getMovieDetails = async (movieId) => {
  return makeTmdbRequest(`movie/${movieId}`);
};

const getPopularMovies = async (page = 1) => {
  return makeTmdbRequest('movie/popular', { page });
};

const getTopRatedMovies = async (page = 1) => {
  return makeTmdbRequest('movie/top_rated', { page });
};

const getUpcomingMovies = async (page = 1) => {
  return makeTmdbRequest('movie/upcoming', { page });
};

const getMovieGenres = async () => {
  return makeTmdbRequest('genre/movie/list');
};

module.exports = {
  initializeTMDB,
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieGenres,
};
