const Joi = require('joi');

const validateMovie = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    originalTitle: Joi.string().optional(),
    overview: Joi.string().optional(),
    posterPath: Joi.string().optional(),
    backdropPath: Joi.string().optional(),
    releaseDate: Joi.date().optional(),
    runtime: Joi.number().integer().min(1).optional(),
    voteAverage: Joi.number().min(0).max(10).optional(),
    voteCount: Joi.number().integer().min(0).optional(),
    popularity: Joi.number().min(0).optional(),
    adult: Joi.boolean().optional(),
    originalLanguage: Joi.string().optional(),
    tmdbId: Joi.number().integer().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  next();
};

const validateComment = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().required().min(1).max(1000),
    userId: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateMovie,
  validateComment,
};
