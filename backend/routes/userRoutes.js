const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateAccountNumber = () => {
  let accountNumber = '55';
  for (let i = 0; i < 14; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  return accountNumber;
};

router.post('/register', async (req, res) => {
  const { fullName, pin } = req.body;

  if (!fullName || !pin) {
    return res
      .status(400)
      .json({ message: 'Nombre completo y PIN son requeridos.' });
  }
  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return res
      .status(400)
      .json({ message: 'El PIN debe ser una cadena de 4 dígitos.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);
    const accountNumber = generateAccountNumber();

    const insertUserQuery = `
      INSERT INTO users (full_name, pin_hash, account_number, balance)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, account_number, created_at;
    `;
    const result = await db.query(insertUserQuery, [
      fullName,
      pinHash,
      accountNumber,
      0,
    ]);
    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        accountNumber: newUser.account_number,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Error durante el registro de usuario:', error);
    if (error.code === '23505') {
      return res
        .status(409)
        .json({
          message: 'Error: El número de cuenta ya existe, intente de nuevo.',
        });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { accountNumber, pin } = req.body;

  if (!accountNumber || !pin) {
    return res
      .status(400)
      .json({ message: 'Número de cuenta y PIN son requeridos.' });
  }
  try {
    const userQuery = 'SELECT * FROM users WHERE account_number = $1';
    const { rows } = await db.query(userQuery, [accountNumber]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    const user = rows[0];
    const isPinValid = await bcrypt.compare(pin, user.pin_hash);

    if (!isPinValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    const tokenPayload = {
      userId: user.id,
      accountNumber: user.account_number,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        fullName: user.full_name,
        accountNumber: user.account_number,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error('Error durante el login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const userQuery =
      'SELECT id, full_name, account_number, balance, created_at FROM users WHERE id = $1';
    const { rows } = await db.query(userQuery, [req.user.userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const userProfile = rows[0];

    res.status(200).json({
      id: userProfile.id,
      fullName: userProfile.full_name,
      accountNumber: userProfile.account_number,
      balance: userProfile.balance,
      createdAt: userProfile.created_at,
    });
  } catch (error) {
    console.error('Error al obtener el perfil de usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;
