const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'movies_db',
  process.env.DB_USER || 'movies_admin', 
  process.env.DB_PASSWORD || 'movies_secure_password_456',
  {
    host: process.env.DB_HOST || 'movies-db',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = { sequelize };