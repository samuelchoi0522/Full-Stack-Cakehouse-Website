const { Pool } = require('pg');

const DB_USER=process.env.DB_USER;
const DB_HOST=process.env.DB_HOST;
const DB_DATABASE=process.env.DB_DATABASE;
const DB_PASSWORD=process.env.DB_PASSWORD;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: 5432,
});

module.exports = pool;
