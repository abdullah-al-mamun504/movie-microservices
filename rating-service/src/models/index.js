const { Sequelize } = require('sequelize');
const config = require('../config/config');
const Rating = require('./rating');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: config.logging,
});

const models = {
  Rating: Rating(sequelize),
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
