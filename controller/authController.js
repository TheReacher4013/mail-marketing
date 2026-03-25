const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hashHelper');
const { generateToken } = require('../utils/jwtHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const { name, email, password, role_id } = req.body;

  try {
    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return sendError(res, 'Email already registered.', 409);
    }

    // Default role = viewer (role_id: 4) if not provided
    const assignedRole = role_id || 4;

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role_id, verification_token)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, assignedRole, verificationToken]
    );

    // TODO: Send verification email using emailService

    return sendSuccess(
      res,
      { userId: result.insertId },
      'Registration successful. Please verify your email.',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Registration failed.', 500);
  }
};


const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.is_active, u.is_verified, r.name as role, r.id as role_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const user = rows[0];

    if (!user.is_active) {
      return sendError(res, 'Account is deactivated. Contact admin.', 401);
    }


    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action_type, module, description, ip_address)
       VALUES (?, 'LOGIN', 'auth', 'User logged in', ?)`,
      [user.id, req.ip]
    );

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Login successful.');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed.', 500);
  }
};



const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    // Always return success (security - don't reveal if email exists)
    if (!rows.length) {
      return sendSuccess(res, {}, 'If this email is registered, you will receive a reset link.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpiry, rows[0].id]
    );


    return sendSuccess(res, {}, 'Password reset link sent to your email.');
  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, 'Something went wrong.', 500);
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (!rows.length) {
      return sendError(res, 'Invalid or expired reset token.', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, rows[0].id]
    );

    return sendSuccess(res, {}, 'Password reset successful. Please login.');
  } catch (error) {
    console.error('Reset password error:', error);
    return sendError(res, 'Password reset failed.', 500);
  }
};


const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'User fetched.');
};


const logout = async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action_type, module, description, ip_address)
       VALUES (?, 'LOGOUT', 'auth', 'User logged out', ?)`,
      [req.user.id, req.ip]
    );
    return sendSuccess(res, {}, 'Logged out successfully.');
  } catch (error) {
    return sendError(res, 'Logout failed.', 500);
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getMe, logout };