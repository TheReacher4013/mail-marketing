const auditService = require('../services/auditService');

const { sendSucess, sendError } = require('../utils/responseHelper');

exports.getLogs = async (req, res) => {
    try {
        const logs = await auditService.getLogs(parseInt(req.query.limit) || 50);
        return sendSuccess(res, { logs });
    } catch (err) {
        return sendError(res, err.message, err.status || 500);
    }
};