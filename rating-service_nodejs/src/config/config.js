module.exports = {
  development: {
    username: process.env.RATINGS_DB_USER || 'ratings_admin',
    password: process.env.RATINGS_DB_PASSWORD || 'ratings_secure_password_789',
    database: process.env.RATINGS_DB_NAME || 'ratings_db',
    host: process.env.RATINGS_DB_HOST || 'ratings-db',
    port: process.env.RATINGS_DB_PORT_INTERNAL || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  test: {
    username: process.env.RATINGS_DB_USER || 'ratings_admin',
    password: process.env.RATINGS_DB_PASSWORD || 'ratings_secure_password_789',
    database: process.env.RATINGS_DB_NAME || 'ratings_db_test',
    host: process.env.RATINGS_DB_HOST || 'ratings-db',
    port: process.env.RATINGS_DB_PORT_INTERNAL || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.RATINGS_DB_USER,
    password: process.env.RATINGS_DB_PASSWORD,
    database: process.env.RATINGS_DB_NAME,
    host: process.env.RATINGS_DB_HOST,
    port: process.env.RATINGS_DB_PORT_INTERNAL || 5432,
    dialect: 'postgres',
    logging: false,
  },
};
