const { pool } = require('../config/db');

const Contact = {
  findAll: (where, params, limit, offset) =>
    pool.query(`SELECT c.*,s.name AS segment_name FROM contacts c
                LEFT JOIN segments s ON c.segment_id=s.id ${where}
                ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]),

  count: (where, params) =>
    pool.query(`SELECT COUNT(*) AS total FROM contacts c ${where}`, params),

  findById: (id) =>
    pool.query(`SELECT c.*,s.name AS segment_name FROM contacts c
                LEFT JOIN segments s ON c.segment_id=s.id WHERE c.id=?`, [id]),

  findByEmail: (email) =>
    pool.query('SELECT id FROM contacts WHERE email=?', [email]),

  create: (data, userId) =>
    pool.query('INSERT INTO contacts (name,email,phone,tags,segment_id,created_by) VALUES (?,?,?,?,?,?)',
      [data.name, data.email, data.phone||null, JSON.stringify(data.tags||[]), data.segment_id||null, userId]),

  update: (id, data) =>
    pool.query('UPDATE contacts SET name=COALESCE(?,name),phone=COALESCE(?,phone),segment_id=COALESCE(?,segment_id),status=COALESCE(?,status) WHERE id=?',
      [data.name||null, data.phone||null, data.segment_id||null, data.status||null, id]),

  delete: (id) => pool.query('DELETE FROM contacts WHERE id=?', [id]),

  findActiveBySegment: (segmentId) =>
    pool.query("SELECT id,email,name FROM contacts WHERE segment_id=? AND status='active'", [segmentId]),

  findAllActive: () =>
    pool.query("SELECT id,email,name FROM contacts WHERE status='active'"),

  markUnsubscribed: (id) =>
    pool.query("UPDATE contacts SET status='unsubscribed' WHERE id=?", [id]),
};

module.exports = Contact;
