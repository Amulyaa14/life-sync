const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Use cloud database (Aiven MySQL, Neon Postgres, etc.)
  // Sequelize automatically detects the dialect from the URI (mysql:// or postgres://)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for many cloud providers like Aiven
      }
    }
  });
} else {
  // Fallback to local SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const dialect = sequelize.getDialect();
    console.log(`${dialect.charAt(0).toUpperCase() + dialect.slice(1)} Database Connected successfully.`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Don't exit in development if DB fails, but maybe useful in production
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
