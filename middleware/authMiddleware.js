const { verifyToken } = require('../utils/helpers');
const { sendError } = require('../utils/responseHelper');
const { pool } = require('../config/db');

/**
 * protect middleware
 * - Authorization header se Bearer token nikalta hai
 * - Token verify karta hai
 * - DB se user fetch karta hai
 * - req.user set karta hai aage ke middlewares ke liye
 */
const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendError(res, 'Access denied. No token provided.', 401);
        }

        const decoded = verifyToken(token);

        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.is_active, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
            [decoded.id]
        );

        if (!rows.length) {
            return sendError(res, 'User not found.', 401);
        }

        if (!rows[0].is_active) {
            return sendError(res, 'Account is deactivated. Contact admin.', 401);
        }

        req.user = rows[0];
        next();
    } catch (err) {
        return sendError(res, 'Invalid or expired token.', 401);
    }
};

module.exports = { protect };