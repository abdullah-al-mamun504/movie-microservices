// movie-service/src/models/Movie.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tmdbId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
    comment: 'TMDB API movie ID'
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  originalTitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Original language title'
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Movie synopsis/description'
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Movie release date (YYYY-MM-DD)'
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    index: true,
    comment: 'Year extracted from release date for easy filtering'
  },
  runtime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  voteAverage: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    defaultValue: 0,
    comment: 'Average rating from TMDB (0-10)'
  },
  voteCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of votes on TMDB'
  },
  popularity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    defaultValue: 0,
    comment: 'TMDB popularity score'
  },
  posterPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Poster image path from TMDB'
  },
  backdropPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Backdrop/banner image path from TMDB'
  },
  originalLanguage: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'en'
  },
  adult: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Is adult content'
  },
  budget: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Production budget in USD'
  },
  revenue: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Box office revenue in USD'
  },
  status: {
    type: DataTypes.ENUM('Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled'),
    defaultValue: 'Released'
  },
  tagline: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  homepage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  imdbId: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'IMDb ID (e.g., tt0111161)'
  },
  // JSON fields for complex data
  genres: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of genre objects [{id, name}]'
  },
  productionCompanies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of production company objects'
  },
  productionCountries: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of country objects'
  },
  spokenLanguages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of language objects'
  },
  credits: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Cast and crew information'
  },
  // Computed fields
  director: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Main director name (extracted from credits)'
  },
  actors: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Top actors comma-separated (extracted from credits)'
  },
  // Metadata
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time synced with TMDB'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Soft delete flag'
  }
}, {
  tableName: 'movies',
  timestamps: true,
  indexes: [
    { fields: ['tmdbId'] },
    { fields: ['releaseYear'] },
    { fields: ['voteAverage'] },
    { fields: ['popularity'] },
    { fields: ['title'] },
    { fields: ['isActive'] }
  ],
  hooks: {
    // Automatically extract year from release date
    beforeSave: (movie) => {
      if (movie.releaseDate) {
        const year = new Date(movie.releaseDate).getFullYear();
        if (year && !isNaN(year)) {
          movie.releaseYear = year;
        }
      }
    }
  }
});

module.exports = Movie;