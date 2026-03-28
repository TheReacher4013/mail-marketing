const SystemSettings = require('../models/SystemSettings');
const { pool }       = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHelper');


exports.getAll = async (req, res) => {
  try {
    const [rows] = await SystemSettings.getAll();
    return sendSuccess(res, { settings: rows });
  } catch (err) {
    return sendError(res, 'Failed to fetch settings.', 500);
  }
};


exports.update = async (req, res) => {
  try {
    const { settings } = req.body; 
    for (const s of settings) {
      await SystemSettings.set(s.key, s.value, req.user.id);
    }
    return sendSuccess(res, {}, 'Settings updated.');
  } catch (err) {
    return sendError(res, 'Failed to update settings.', 500);
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rp.*, r.name AS role_name
       FROM role_permissions rp JOIN roles r ON rp.role_id = r.id
       ORDER BY rp.role_id, rp.module`
    );
    return sendSuccess(res, { permissions: rows });
  } catch (err) {
    return sendError(res, 'Failed to fetch permissions.', 500);
  }
};


exports.updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
   
    for (const p of permissions) {
      await pool.query(
        `INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           can_view=VALUES(can_view), can_create=VALUES(can_create),
           can_edit=VALUES(can_edit),  can_delete=VALUES(can_delete),
           updated_by=VALUES(updated_by)`,
        [p.role_id, p.module, p.can_view ? 1 : 0, p.can_create ? 1 : 0,
         p.can_edit ? 1 : 0, p.can_delete ? 1 : 0, req.user.id]
      );
    }
    return sendSuccess(res, {}, 'Permissions updated.');
  } catch (err) {
    return sendError(res, 'Failed to update permissions.', 500);
  }
  
};
