const contactService = require('../services/contactService');
const { sendSuccess, sendError } = require('../utils/responseHelper');


const handleError = (res, error) => {
  return sendError(res, error.message, error.status || 500);
};


exports.getAll = async (req, res) => {
  try {
    const contacts = await contactService.getAll(req.query);
    return sendSuccess(res, contacts);
  } catch (error) {
    return handleError(res, error);
  }
};


exports.getById = async (req, res) => {
  try {
    const contact = await contactService.getById(req.params.id);
    return sendSuccess(res, { contact });
  } catch (error) {
    return handleError(res, error);
  }
};


exports.create = async (req, res) => {
  try {
    const contactId = await contactService.create(req.body, req.user.id);
    return sendSuccess(res, { contactId }, 'Contact created.', 201);
  } catch (error) {
    return handleError(res, error);
  }
};


exports.update = async (req, res) => {
  try {
    await contactService.update(req.params.id, req.body);
    return sendSuccess(res, {}, 'Updated.');
  } catch (error) {
    return handleError(res, error);
  }
};


exports.remove = async (req, res) => {
  try {
    await contactService.remove(req.params.id);
    return sendSuccess(res, {}, 'Deleted.');
  } catch (error) {
    return handleError(res, error);
  }
};



































// const fs  = require('fs');
// const csv = require('csv-parser');
// const { validationResult } = require('express-validator');
// const { pool } = require('../config/db');
// const { paginate, paginatedResponse } = require('../utils/helpers');
// const { sendSuccess, sendError } = require('../utils/responseHelper');

// const getContacts = async (req, res) => {
//   try {
//     const { page, limit, offset } = paginate(req.query);
//     const search = req.query.search ? `%${req.query.search}%` : '%';
//     const status = req.query.status || null;
//     const seg    = req.query.segment_id || null;
//     let where = 'WHERE (c.email LIKE ? OR c.name LIKE ?)';
//     let p = [search, search];
//     if (status) { where += ' AND c.status=?'; p.push(status); }
//     if (seg)    { where += ' AND c.segment_id=?'; p.push(seg); }
//     const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM contacts c ${where}`, p);
//     const [rows] = await pool.query(
//       `SELECT c.id,c.name,c.email,c.phone,c.tags,c.status,c.created_at,s.name AS segment_name
//        FROM contacts c LEFT JOIN segments s ON c.segment_id=s.id
//        ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
//       [...p, limit, offset]
//     );
//     return sendSuccess(res, paginatedResponse(rows, total, page, limit));
//   } catch (err) {
//     return sendError(res, 'Failed.', 500);
//   }
// };

// const getContactById = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT c.*,s.name AS segment_name FROM contacts c LEFT JOIN segments s ON c.segment_id=s.id WHERE c.id=?`,
//       [req.params.id]
//     );
//     if (!rows.length) return sendError(res, 'Not found.', 404);
//     return sendSuccess(res, { contact: rows[0] });
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const createContact = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());
//   const { name, email, phone, tags, segment_id } = req.body;
//   try {
//     const [ex] = await pool.query('SELECT id FROM contacts WHERE email=?', [email]);
//     if (ex.length) return sendError(res, 'Email already exists.', 409);
//     const [r] = await pool.query(
//       'INSERT INTO contacts (name,email,phone,tags,segment_id,created_by) VALUES (?,?,?,?,?,?)',
//       [name, email, phone||null, JSON.stringify(tags||[]), segment_id||null, req.user.id]
//     );
//     return sendSuccess(res, { contactId: r.insertId }, 'Contact created.', 201);
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const updateContact = async (req, res) => {
//   const { name, phone, tags, segment_id, status } = req.body;
//   try {
//     await pool.query(
//       'UPDATE contacts SET name=COALESCE(?,name),phone=COALESCE(?,phone),tags=COALESCE(?,tags),segment_id=COALESCE(?,segment_id),status=COALESCE(?,status) WHERE id=?',
//       [name||null, phone||null, tags?JSON.stringify(tags):null, segment_id||null, status||null, req.params.id]
//     );
//     return sendSuccess(res, {}, 'Updated.');
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const deleteContact = async (req, res) => {
//   try {
//     await pool.query('DELETE FROM contacts WHERE id=?', [req.params.id]);
//     return sendSuccess(res, {}, 'Deleted.');
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const uploadCSVContacts = async (req, res) => {
//   if (!req.file) return sendError(res, 'CSV file required.', 400);
//   const results = []; let inserted = 0; let skipped = 0;
//   try {
//     await new Promise((resolve, reject) => {
//       fs.createReadStream(req.file.path).pipe(csv())
//         .on('data', (row) => { if (row.email) results.push(row); })
//         .on('end', resolve).on('error', reject);
//     });
//     for (const row of results) {
//       try {
//         const [ex] = await pool.query('SELECT id FROM contacts WHERE email=?', [row.email.trim()]);
//         if (ex.length) { skipped++; continue; }
//         await pool.query('INSERT INTO contacts (name,email,phone,created_by) VALUES (?,?,?,?)',
//           [row.name||null, row.email.trim(), row.phone||null, req.user.id]);
//         inserted++;
//       } catch { skipped++; }
//     }
//     fs.unlinkSync(req.file.path);
//     return sendSuccess(res, { inserted, skipped }, `${inserted} imported, ${skipped} skipped.`);
//   } catch (err) {
//     if (req.file?.path) fs.unlinkSync(req.file.path);
//     return sendError(res, 'CSV processing failed.', 500);
//   }
// };

// const getSegments = async (req, res) => {
//   const [rows] = await pool.query(
//     `SELECT s.*,COUNT(c.id) AS contact_count FROM segments s
//      LEFT JOIN contacts c ON s.id=c.segment_id GROUP BY s.id ORDER BY s.created_at DESC`
//   );
//   return sendSuccess(res, { segments: rows });
// };

// const createSegment = async (req, res) => {
//   const { name, description } = req.body;
//   if (!name) return sendError(res, 'Name required.', 400);
//   const [r] = await pool.query('INSERT INTO segments (name,description,created_by) VALUES (?,?,?)',
//     [name, description||null, req.user.id]);
//   return sendSuccess(res, { segmentId: r.insertId }, 'Segment created.', 201);
// };

// const updateSegment = async (req, res) => {
//   const { name, description } = req.body;
//   await pool.query('UPDATE segments SET name=COALESCE(?,name),description=COALESCE(?,description) WHERE id=?',
//     [name||null, description||null, req.params.id]);
//   return sendSuccess(res, {}, 'Updated.');
// };

// const deleteSegment = async (req, res) => {
//   await pool.query('DELETE FROM segments WHERE id=?', [req.params.id]);
//   return sendSuccess(res, {}, 'Deleted.');
// };

// module.exports = {
//   getContacts, getContactById, createContact, updateContact, deleteContact, uploadCSVContacts,
//   getSegments, createSegment, updateSegment, deleteSegment,
// };