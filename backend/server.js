require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

db.initializeDatabase().catch((err) => {
  console.error('Error initializing the database:', err);
  process.exit(1);
});
const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', async (req, res) => {
  console.log('Health check endpoint hit');

  try {
    const time = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'UP',
      message: 'Server of the Bank is running',
      dbTime: time.rows[0].now,
    });
  } catch (error) {
    console.error('Error querying the database:', error);
    res.status(500).json({
      status: 'DOWN',
      message: 'Server of the Bank is down',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
