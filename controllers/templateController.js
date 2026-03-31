const { validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { paginate, paginatedResponse } = require('../utils/helpers');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const getTemplates = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM templates WHERE name LIKE ?', [search]);
    const [rows] = await pool.query(
      `SELECT t.id,t.name,t.subject,t.created_at,u.name AS created_by_name
       FROM templates t JOIN users u ON t.created_by=u.id
       WHERE t.name LIKE ? ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [search, limit, offset]
    );
    return sendSuccess(res, paginatedResponse(rows, total, page, limit));
  } catch (err) { return sendError(res, 'Failed.', 500); }
};

const getTemplateById = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*,u.name AS created_by_name FROM templates t JOIN users u ON t.created_by=u.id WHERE t.id=?`,
    [req.params.id]
  );
  if (!rows.length) return sendError(res, 'Not found.', 404);
  return sendSuccess(res, { template: rows[0] });
};

const createTemplate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());
  const { name, subject, html_content } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO templates (name,subject,html_content,created_by) VALUES (?,?,?,?)',
      [name, subject||null, html_content, req.user.id]
    );
    return sendSuccess(res, { templateId: r.insertId }, 'Created.', 201);
  } catch (err) { return sendError(res, 'Failed.', 500); }
};

const updateTemplate = async (req, res) => {
  const { name, subject, html_content } = req.body;
  await pool.query(
    'UPDATE templates SET name=COALESCE(?,name),subject=COALESCE(?,subject),html_content=COALESCE(?,html_content) WHERE id=?',
    [name||null, subject||null, html_content||null, req.params.id]
  );
  return sendSuccess(res, {}, 'Updated.');
};

const deleteTemplate = async (req, res) => {
  const [used] = await pool.query('SELECT id FROM campaigns WHERE template_id=? LIMIT 1', [req.params.id]);
  if (used.length) return sendError(res, 'Template is used in a campaign.', 400);
  await pool.query('DELETE FROM templates WHERE id=?', [req.params.id]);
  return sendSuccess(res, {}, 'Deleted.');
};

module.exports = { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate };