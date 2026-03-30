const AuditLog = require('../models/AuditLog');

const getLogs = async (limit = 50) => {
    const [rows] = await AuditLog.getAll(limit);
    return rows;

};

const log = (userId, actionType, module, description, ip) =>
    AuditLog.log(userId, actionType, module, description, ip);

module.exports = { getLogs, log};