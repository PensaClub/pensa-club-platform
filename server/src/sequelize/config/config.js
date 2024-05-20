const dotenv = require("dotenv");
dotenv.config({ path: ".env.development" });

module.exports = {
  "development": {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_URL,
    "dialect": "postgres"
  },

  "production": {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: '',
    "dialect": "postgres"
  }
}