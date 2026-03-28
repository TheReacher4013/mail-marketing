const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');
const { pool } = require('../config/db');
const { sendError } = require('../utils/responseHelper');


const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) return sendError(res, 'Access denied. No token provided.', 401);

        const decoded = jwt.verify(token, jwtConfig.secret);

        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.is_active, r.name AS role
       FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
            [decoded.id]
        );

        if (!rows.length) return sendError(res, 'User not found.', 401);
        if (!rows[0].is_active) return sendError(res, 'Account deactivated. Contact admin.', 401);

        req.user = rows[0];
        next();
    } catch {
        return sendError(res, 'Invalid or expired token.', 401);
    }
};

module.exports = { authenticate };
