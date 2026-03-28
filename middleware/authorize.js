const { sendError } = require('../utils/responseHelper');


const authorize = (...roles) => (req, res, next) => {
    if (!req.user) return sendError(res, 'Not authenticated.', 401);
    if (!roles.includes(req.user.role))
        return sendError(res, `Access denied. Required role: ${roles.join(' or ')}`, 403);
    next();
};

module.exports = { authorize };
