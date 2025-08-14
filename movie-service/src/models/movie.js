const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    posterPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    backdropPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    runtime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    voteAverage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    voteCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    popularity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    adult: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    originalLanguage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tmdbId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'movies',
    timestamps: true,
  });

  Movie.associate = (models) => {
    Movie.hasMany(models.Comment, {
      foreignKey: 'movieId',
      as: 'comments',
    });
  };

  return Movie;
};
