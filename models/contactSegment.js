const { pool } = require('../config/db');

const ContactSegment = {
  findAll: () =>
    pool.query(`SELECT s.*,COUNT(c.id) AS contact_count FROM segments s
                LEFT JOIN contacts c ON s.id=c.segment_id GROUP BY s.id ORDER BY s.created_at DESC`),
  create: (name, description, userId) =>
    pool.query('INSERT INTO segments (name,description,created_by) VALUES (?,?,?)', [name, description||null, userId]),
  update: (id, name, description) =>
    pool.query('UPDATE segments SET name=COALESCE(?,name),description=COALESCE(?,description) WHERE id=?',
      [name||null, description||null, id]),
  delete: (id) => pool.query('DELETE FROM segments WHERE id=?', [id]),
};

module.exports = ContactSegment;
