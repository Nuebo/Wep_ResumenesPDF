// ===========================
// RUTAS DE AUTENTICACION
// ===========================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');
const authMiddleware = require('../middleware/auth');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contrasena son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres.' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const pool = getPool();

    const [existentes] = await pool.query('SELECT id FROM users WHERE email = ?', [emailNormalizado]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con ese correo.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const [resultado] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), emailNormalizado, passwordHash]
    );

    const user = { id: resultado.insertId, name: name.trim(), email: emailNormalizado };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });

  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contrasena son obligatorios.' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const pool = getPool();

    const [filas] = await pool.query('SELECT * FROM users WHERE email = ?', [emailNormalizado]);
    const fila = filas[0];

    if (!fila || !bcrypt.compareSync(password, fila.password_hash)) {
      return res.status(401).json({ error: 'Correo o contrasena incorrectos.' });
    }

    const user = { id: fila.id, name: fila.name, email: fila.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });

  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error del servidor al iniciar sesion.' });
  }
});

// GET /api/auth/me  (requiere token)
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
