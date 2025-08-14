const { Comment } = require('../models');
const logger = require('../utils/logger');

const getCommentsByMovieId = async (movieId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Comment.findAndCountAll({
      where: { movieId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      comments: rows,
      total: count,
    };
  } catch (error) {
    logger.error(`Error getting comments for movie with ID ${movieId}:`, error);
    throw error;
  }
};

const getCommentById = async (id) => {
  try {
    const comment = await Comment.findByPk(id);
    return comment;
  } catch (error) {
    logger.error(`Error getting comment with ID ${id}:`, error);
    throw error;
  }
};

const createComment = async (commentData) => {
  try {
    const comment = await Comment.create(commentData);
    return comment;
  } catch (error) {
    logger.error('Error creating comment:', error);
    throw error;
  }
};

const updateComment = async (id, commentData) => {
  try {
    const [updated] = await Comment.update(commentData, {
      where: { id },
    });

    if (updated) {
      const updatedComment = await Comment.findByPk(id);
      return updatedComment;
    }

    return null;
  } catch (error) {
    logger.error(`Error updating comment with ID ${id}:`, error);
    throw error;
  }
};

const deleteComment = async (id) => {
  try {
    const deleted = await Comment.destroy({
      where: { id },
    });

    return deleted > 0;
  } catch (error) {
    logger.error(`Error deleting comment with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getCommentsByMovieId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
