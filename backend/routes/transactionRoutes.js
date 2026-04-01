const express = require('express');
const { pool } = require('../db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/deposit', protect, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.userId;

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const updateBalanceQuery = `UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance`;
    const updatedBalanceResult = await client.query(updateBalanceQuery, [
      parsedAmount,
      userId,
    ]);
    const insertTransactionQuery = `INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'deposit', $2);`;
    await client.query(insertTransactionQuery, [userId, parsedAmount]);
    await client.query('COMMIT');
    res.status(200).json({
      message: 'Deposit successful',
      newBalance: updatedBalanceResult.rows[0].balance,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during deposit transaction:', error);
    res.status(500).json({
      message: 'Internal server error during deposit transaction',
    });
  } finally {
    client.release();
  }
});

router.post('/withdraw', protect, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.userId;

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    const currentBalance = parseFloat(rows[0].balance);

    if (currentBalance < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    const updateBalanceQuery = `UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance`;
    const updatedBalanceResult = await client.query(updateBalanceQuery, [
      parsedAmount,
      userId,
    ]);

    const insertTransactionQuery = `INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'withdrawal', $2);`;
    await client.query(insertTransactionQuery, [userId, parsedAmount]);

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Withdrawal successful.',
      newBalance: updatedBalanceResult.rows[0].balance,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during withdrawal transaction:', error);
    res
      .status(500)
      .json({ message: 'Internal server error during withdrawal transaction' });
  } finally {
    client.release();
  }
});

router.post('/transfer', protect, async (req, res) => {
  const { amount, destinationAccountNumber } = req.body;
  const senderUserId = req.user.userId;

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const senderQuery = 'SELECT * FROM users WHERE id = $1 FOR UPDATE';
    const senderResult = await client.query(senderQuery, [senderUserId]);
    const sender = senderResult.rows[0];

    if (sender.account_number === destinationAccountNumber) {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ message: 'Cannot transfer to your own account.' });
    }

    if (parseFloat(sender.balance) < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    const recipientQuery =
      'SELECT * FROM users WHERE account_number = $1 FOR UPDATE';
    const recipientResult = await client.query(recipientQuery, [
      destinationAccountNumber,
    ]);

    if (recipientResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ message: 'Destination account not found.' });
    }
    const recipient = recipientResult.rows[0];

    const updateSenderQuery =
      'UPDATE users SET balance = balance - $1 WHERE id = $2';
    await client.query(updateSenderQuery, [parsedAmount, sender.id]);

    const updateRecipientQuery =
      'UPDATE users SET balance = balance + $1 WHERE id = $2';
    await client.query(updateRecipientQuery, [parsedAmount, recipient.id]);

    const insertSenderTxQuery = `INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'transfer-out', $2);`;
    await client.query(insertSenderTxQuery, [sender.id, parsedAmount]);

    const insertRecipientTxQuery = `INSERT INTO transactions (user_id, type, amount) VALUES ($1, 'transfer-in', $2);`;
    await client.query(insertRecipientTxQuery, [recipient.id, parsedAmount]);

    const { rows } = await client.query(
      'SELECT balance FROM users WHERE id = $1',
      [sender.id]
    );
    const newBalance = rows[0].balance;

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Transfer successful.',
      newBalance: newBalance,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during transfer transaction:', error);
    res
      .status(500)
      .json({ message: 'Internal server error during transfer transaction' });
  } finally {
    client.release();
  }
});

router.get('/history', protect, async (req, res) => {
  const userId = req.user.userId;
  try {
    const getHistoryQuery = `SELECT id, type, amount, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC;`;
    const { rows } = await pool.query(getHistoryQuery, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      message: 'Internal server error while fetching transaction history',
    });
  }
});

module.exports = router;
