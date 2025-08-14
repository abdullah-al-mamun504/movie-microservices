const { Sequelize } = require('sequelize');
//const config = require('../config/config');
const Movie = require('./movie');
const Comment = require('./comment');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; // This is the fix
// ... rest of the code

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: config.logging,
});
const models = {
  Movie: Movie(sequelize),
  Comment: Comment(sequelize),
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
