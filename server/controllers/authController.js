const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  const { fullName, email, password } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = uuidv4();

  await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)`,
    [userId, fullName, email, passwordHash]
  );

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  const user = rows[0];
  const token = signToken(user);

  await logActivity({
    userId,
    action: 'login',
    entityType: 'user',
    entityId: userId,
    description: 'Account created and logged in',
  });

  res.status(201).json({ success: true, data: { user: sanitizeUser(user), token } });
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'This account has been deactivated' });
  }

  const token = signToken(user);

  await logActivity({
    userId: user.id,
    action: 'login',
    entityType: 'user',
    entityId: user.id,
    description: 'Logged in',
  });

  res.json({ success: true, data: { user: sanitizeUser(user), token } });
}

/**
 * GET /api/auth/me
 */
async function me(req, res) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: { user: sanitizeUser(rows[0]) } });
}

/**
 * POST /api/auth/logout
 * Stateless JWT — client discards the token. Logged server-side for the activity feed.
 */
async function logout(req, res) {
  await logActivity({
    userId: req.user.id,
    action: 'logout',
    entityType: 'user',
    entityId: req.user.id,
    description: 'Logged out',
  });
  res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = { register, login, me, logout };
