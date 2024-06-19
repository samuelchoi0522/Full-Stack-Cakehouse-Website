const { Pool } = require('pg');

const pool = new Pool({
  user: 'jschoi22',
  host: 'localhost',
  database: 'accountinfo',
  password: 'j@3m1nWkd',
  port: 5432,
});

module.exports = pool;
