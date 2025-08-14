module.exports = {
  development: {
    username: process.env.MOVIES_DB_USER || 'movies_admin',
    password: process.env.MOVIES_DB_PASSWORD || 'movies_secure_password_456',
    database: process.env.MOVIES_DB_NAME || 'movies_db',
    host: process.env.MOVIES_DB_HOST || 'movies-db',
    port: process.env.MOVIES_DB_PORT_INTERNAL || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  test: {
    username: process.env.MOVIES_DB_USER || 'movies_admin',
    password: process.env.MOVIES_DB_PASSWORD || 'movies_secure_password_456',
    database: process.env.MOVIES_DB_NAME || 'movies_db_test',
    host: process.env.MOVIES_DB_HOST || 'movies-db',
    port: process.env.MOVIES_DB_PORT_INTERNAL || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.MOVIES_DB_USER,
    password: process.env.MOVIES_DB_PASSWORD,
    database: process.env.MOVIES_DB_NAME,
    host: process.env.MOVIES_DB_HOST,
    port: process.env.MOVIES_DB_PORT_INTERNAL || 5432,
    dialect: 'postgres',
    logging: false,
  },
};
