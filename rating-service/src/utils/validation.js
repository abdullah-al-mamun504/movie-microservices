const Joi = require('joi');

const validateRating = (req, res, next) => {
  const schema = Joi.object({
    movieId: Joi.number().integer().required(),
    rating: Joi.number().integer().min(1).max(10).required(),
    comment: Joi.string().max(1000).optional(),
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
  validateRating,
};
