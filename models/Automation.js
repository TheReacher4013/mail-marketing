const { pool } = require('../config/db');

const Automation = {
    findAll: (limit, offset) =>
        pool.query(
            `SELECT a.id,a.name,a.trigger_event,a.is_active,a.created_at,u.name AS created_by_name
       FROM automations a JOIN users u ON a.created_by=u.id
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        ),

    count: () => pool.query('SELECT COUNT(*) AS total FROM automations'),

    findById: (id) =>
        pool.query(
            `SELECT a.*,u.name AS created_by_name FROM automations a
       JOIN users u ON a.created_by=u.id WHERE a.id=?`,
            [id]
        ),

    create: (data, userId) =>
        pool.query(
            'INSERT INTO automations (name,trigger_event,workflow_json,created_by) VALUES (?,?,?,?)',
            [data.name, data.trigger_event, JSON.stringify(data.workflow_json), userId]
        ),

    update: (id, data) =>
        pool.query(
            'UPDATE automations SET name=COALESCE(?,name),trigger_event=COALESCE(?,trigger_event),workflow_json=COALESCE(?,workflow_json),is_active=COALESCE(?,is_active) WHERE id=?',
            [data.name || null, data.trigger_event || null,
            data.workflow_json ? JSON.stringify(data.workflow_json) : null,
            data.is_active ?? null, id]
        ),

    delete: (id) => pool.query('DELETE FROM automations WHERE id=?', [id]),

    findActiveByTrigger: (triggerEvent) =>
        pool.query("SELECT * FROM automations WHERE trigger_event=? AND is_active=TRUE", [triggerEvent]),
};

module.exports = Automation;
