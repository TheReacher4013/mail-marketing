const { pool } = require("../config/db");

const checkPermission = (module, action = "view") => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user || !user.role_id) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const roleId = user.role_id;

            const [rows] = await pool.query(
                `SELECT can_view, can_create, can_edit, can_delete
         FROM role_permissions
         WHERE role_id = ? AND module = ?`,
                [roleId, module]
            );

            if (rows.length === 0) {
                return res.status(403).json({
                    message: `No access to module: ${module}`,
                });
            }

            const permission = rows[0];

            if (!permission[`can_${action}`]) {
                return res.status(403).json({
                    message: `Permission denied: ${module} (${action})`,
                });
            }

            next();
        } catch (err) {
            console.error("Permission Middleware Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    };
};

module.exports = checkPermission;