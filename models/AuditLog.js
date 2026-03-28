const {pool} = require("../config/db");

const AuditLog = {
    log: (userId, actionType, module, description, ip = null) =>
        pool.query(
            `INSERT INTO audit_logs (user_id, action_type, module, description, ip_address) VALUES (?,?,?,?,?)`,
            [userId, actionType, module, description, ip]
        ).catch(() => {}),
        
        getAll: (limit = 50) => 
            pool.query(
                `SELECT al.*,u.name As user_name FROM audit_logs al LEFT JOIN users u ON al.user_id=u.id ORDER BY al.timestamp DESC LIMIT ?`,
                [limit]
            ),

};

module.exports = AuditLog;