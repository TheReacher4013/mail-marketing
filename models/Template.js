const { pool } = require('../config/db');

const Template = {
  findAll: (search, limit, offset) =>
    pool.query(
      `SELECT t.id,t.name,t.subject,t.created_at,u.name AS created_by_name
       FROM templates t JOIN users u ON t.created_by=u.id
       WHERE t.name LIKE ? ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [search, limit, offset]
    ),

  count: (search) =>
    pool.query('SELECT COUNT(*) AS total FROM templates WHERE name LIKE ?', [search]),

  findById: (id) =>
    pool.query(
      `SELECT t.*,u.name AS created_by_name FROM templates t
       JOIN users u ON t.created_by=u.id WHERE t.id=?`,
      [id]
    ),

  create: (data, userId) =>
    pool.query(
      'INSERT INTO templates (name,subject,html_content,created_by) VALUES (?,?,?,?)',
      [data.name, data.subject||null, data.html_content, userId]
    ),

  update: (id, data) =>
    pool.query(
      'UPDATE templates SET name=COALESCE(?,name),subject=COALESCE(?,subject),html_content=COALESCE(?,html_content) WHERE id=?',
      [data.name||null, data.subject||null, data.html_content||null, id]
    ),

  delete: (id) => pool.query('DELETE FROM templates WHERE id=?', [id]),

  isUsedInCampaign: (id) =>
    pool.query('SELECT id FROM campaigns WHERE template_id=? LIMIT 1', [id]),
};

module.exports = Template;
