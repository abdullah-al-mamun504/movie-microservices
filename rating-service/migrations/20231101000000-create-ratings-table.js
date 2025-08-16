module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ratings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      movieId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Add indexes
    await queryInterface.addIndex('ratings', ['userId']);
    await queryInterface.addIndex('ratings', ['movieId']);
    await queryInterface.addIndex('ratings', ['userId', 'movieId'], {
      unique: true,
      name: 'ratings_user_movie_unique'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ratings');
  }
};
