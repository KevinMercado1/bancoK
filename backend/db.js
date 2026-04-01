const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

pool.on('connect', () => {
  console.log('Connected to the database of postgreSQL');
});

pool.on('error', (err) => {
  console.error('Database error occurred in the client postgreSQL:', err);
  process.exit(-1);
});

const initializeDatabase = async () => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      pin_hash  VARCHAR(255) NOT NULL,
      account_number VARCHAR(20) UNIQUE NOT NULL,
      balance NUMERIC(15,2) DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTransactionsTableQuery = `
   CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type VARCHAR(20) NOT NULL,
      amount NUMERIC(15, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;
  try {
    await pool.query(createUsersTableQuery);
    console.log('Users table verificate/created successfully');
    await pool.query(createTransactionsTableQuery);
    console.log('Transactions table verificate/created successfully');
  } catch (error) {
    console.error('Error creating/verifying the users table:', error);
    process.exit(1);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initializeDatabase,
};
