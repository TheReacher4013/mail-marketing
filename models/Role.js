const { pool } = require('../config/db');

const Role = {
    // Sagle roles with  permissions
    findAll: () =>
        pool.query(`
      SELECT r.id, r.name,
        GROUP_CONCAT(
          CONCAT(rp.module,':', rp.can_view,',', rp.can_create,',', rp.can_edit,',', rp.can_delete)
        ) AS permissions_raw
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
    `),

    findById: (id) =>
        pool.query(`
      SELECT r.id, r.name,
        JSON_OBJECTAGG(rp.module,
          JSON_OBJECT(
            'can_view',   rp.can_view,
            'can_create', rp.can_create,
            'can_edit',   rp.can_edit,
            'can_delete', rp.can_delete
          )
        ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]),

    // Role ki permissions update karalaya
    updatePermissions: async (roleId, permissions, updatedBy) => {
        for (const [module, perms] of Object.entries(permissions)) {
            await pool.query(`
        INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          can_view=VALUES(can_view), can_create=VALUES(can_create),
          can_edit=VALUES(can_edit),  can_delete=VALUES(can_delete),
          updated_by=VALUES(updated_by)
      `, [roleId, module, perms.can_view ? 1 : 0, perms.can_create ? 1 : 0,
                perms.can_edit ? 1 : 0, perms.can_delete ? 1 : 0, updatedBy]);
        }
    },

    // Ek role ki permissions denaysathi
    getPermissions: (roleId) =>
        pool.query(
            'SELECT * FROM role_permissions WHERE role_id = ? ORDER BY module',
            [roleId]
        ),

    // User count per role
    getUserCount: () =>
        pool.query(`
      SELECT r.id, r.name, COUNT(u.id) AS user_count
      FROM roles r LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.id
    `),
};

module.exports = Role;
