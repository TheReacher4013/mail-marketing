const AuditLog = require('../models/AuditLog');


const auditLog = (actionType, module) => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body?.success && req.user) {
      AuditLog.log(
        req.user.id,
        actionType,
        module,
        `${actionType} on ${module} by ${req.user.name}`,
        req.ip
      );
    }
    return originalJson(body);
  };

  next();
};

module.exports = { auditLog };