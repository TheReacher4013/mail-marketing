const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());
  const { name, email, password, role_id } = req.body;
  try {
    const [ex] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) return sendError(res, 'Email already registered.', 409);
    const hashed = await hashPassword(password);
    const [r] = await pool.query(
      'INSERT INTO users (name, email, password, role_id, is_verified) VALUES (?, ?, ?, ?, TRUE)',
      [name, email, hashed, role_id || 4]
    );
    return sendSuccess(res, { userId: r.insertId }, 'Registered successfully.', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Registration failed.', 500);
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.is_active, r.name AS role
       FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?`,
      [email]
    );
    if (!rows.length) return sendError(res, 'Invalid email or password.', 401);
    const user = rows[0];
    if (!user.is_active) return sendError(res, 'Account deactivated.', 401);
    const match = await comparePassword(password, user.password);
    if (!match) return sendError(res, 'Invalid email or password.', 401);
    const token = generateToken({ id: user.id, role: user.role });
    await pool.query(
      "INSERT INTO audit_logs (user_id, action_type, module, description, ip_address) VALUES (?, 'LOGIN', 'auth', 'Login', ?)",
      [user.id, req.ip]
    );
    return sendSuccess(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 'Login successful.');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Login failed.', 500);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!rows.length) return sendSuccess(res, {}, 'Reset link sent if email exists.');
    const token = crypto.randomBytes(32).toString('hex');
    const exp   = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, exp, rows[0].id]);
    return sendSuccess(res, { resetToken: token }, 'Reset token generated.');
  } catch (err) {
    return sendError(res, 'Failed.', 500);
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]
    );
    if (!rows.length) return sendError(res, 'Invalid or expired token.', 400);
    const hashed = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashed, rows[0].id]);
    return sendSuccess(res, {}, 'Password reset successful.');
  } catch (err) {
    return sendError(res, 'Failed.', 500);
  }
};

const getMe = (req, res) => sendSuccess(res, { user: req.user });

const logout = async (req, res) => {
  await pool.query(
    "INSERT INTO audit_logs (user_id, action_type, module, description) VALUES (?, 'LOGOUT', 'auth', 'Logout')",
    [req.user.id]
  ).catch(() => {});
  return sendSuccess(res, {}, 'Logged out.');
};

module.exports = { register, login, forgotPassword, resetPassword, getMe, logout };