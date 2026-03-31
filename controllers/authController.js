const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password, req.ip);
    return sendSuccess(res, result, 'Login successful.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

exports.register = async (req, res) => {
  try {
    const userId = await authService.register(req.body);
    return sendSuccess(res, { userId }, 'Registered successfully.', 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    return sendSuccess(res, {}, 'If this email exists, a reset link has been sent.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return sendSuccess(res, {}, 'Password reset successful.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

exports.getMe = (req, res) => sendSuccess(res, { user: req.user });

exports.logout = async (req, res) => {
  const AuditLog = require('../models/AuditLog');
  await AuditLog.log(req.user.id, 'LOGOUT', 'auth', 'User logged out', req.ip);
  return sendSuccess(res, {}, 'Logged out.');
};
