// const { validationResult } = require('express-validator');
// const { pool } = require('../config/db');
// const { paginate, paginatedResponse } = require('../utils/helpers');
// const { sendSuccess, sendError } = require('../utils/responseHelper');

// const getCampaigns = async (req, res) => {
//   try {
//     const { page, limit, offset } = paginate(req.query);
//     const search = req.query.search ? `%${req.query.search}%` : '%';
//     const status = req.query.status || null;
//     let where = 'WHERE (c.name LIKE ? OR c.subject LIKE ?)';
//     let p = [search, search];
//     if (status) { where += ' AND c.status=?'; p.push(status); }
//     const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM campaigns c ${where}`, p);
//     const [rows] = await pool.query(
//       `SELECT c.id,c.name,c.subject,c.status,c.scheduled_at,c.total_sent,c.created_at,
//               t.name AS template_name, s.name AS segment_name, u.name AS created_by_name
//        FROM campaigns c
//        LEFT JOIN templates t ON c.template_id=t.id
//        LEFT JOIN segments s  ON c.segment_id=s.id
//        LEFT JOIN users u     ON c.created_by=u.id
//        ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
//       [...p, limit, offset]
//     );
//     return sendSuccess(res, paginatedResponse(rows, total, page, limit));
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const getCampaignById = async (req, res) => {
//   const [rows] = await pool.query(
//     `SELECT c.*,t.name AS template_name,t.html_content,s.name AS segment_name,u.name AS created_by_name
//      FROM campaigns c
//      LEFT JOIN templates t ON c.template_id=t.id
//      LEFT JOIN segments s ON c.segment_id=s.id
//      LEFT JOIN users u ON c.created_by=u.id
//      WHERE c.id=?`,
//     [req.params.id]
//   );
//   if (!rows.length) return sendError(res, 'Not found.', 404);
//   return sendSuccess(res, { campaign: rows[0] });
// };

// const createCampaign = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());
//   const { name, subject, template_id, segment_id, scheduled_at } = req.body;
//   try {
//     const [tmpl] = await pool.query('SELECT id FROM templates WHERE id=?', [template_id]);
//     if (!tmpl.length) return sendError(res, 'Template not found.', 404);
//     const [r] = await pool.query(
//       'INSERT INTO campaigns (name,subject,template_id,segment_id,scheduled_at,created_by) VALUES (?,?,?,?,?,?)',
//       [name, subject, template_id, segment_id||null, scheduled_at||null, req.user.id]
//     );
//     return sendSuccess(res, { campaignId: r.insertId }, 'Campaign created.', 201);
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const updateCampaign = async (req, res) => {
//   const { name, subject, template_id, segment_id, scheduled_at } = req.body;
//   try {
//     const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
//     if (!rows.length) return sendError(res, 'Not found.', 404);
//     if (['sending','sent'].includes(rows[0].status))
//       return sendError(res, 'Cannot edit sent/sending campaign.', 400);
//     await pool.query(
//       'UPDATE campaigns SET name=COALESCE(?,name),subject=COALESCE(?,subject),template_id=COALESCE(?,template_id),segment_id=COALESCE(?,segment_id),scheduled_at=COALESCE(?,scheduled_at) WHERE id=?',
//       [name||null, subject||null, template_id||null, segment_id||null, scheduled_at||null, req.params.id]
//     );
//     return sendSuccess(res, {}, 'Updated.');
//   } catch (err) { return sendError(res, 'Failed.', 500); }
// };

// const deleteCampaign = async (req, res) => {
//   const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
//   if (!rows.length) return sendError(res, 'Not found.', 404);
//   if (['sending','sent'].includes(rows[0].status))
//     return sendError(res, 'Cannot delete sent campaign.', 400);
//   await pool.query('DELETE FROM campaigns WHERE id=?', [req.params.id]);
//   return sendSuccess(res, {}, 'Deleted.');
// };

// const submitForApproval = async (req, res) => {
//   const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
//   if (!rows.length) return sendError(res, 'Not found.', 404);
//   if (rows[0].status !== 'draft') return sendError(res, 'Only drafts can be submitted.', 400);
//   await pool.query("UPDATE campaigns SET status='pending_approval' WHERE id=?", [req.params.id]);
//   return sendSuccess(res, {}, 'Submitted for approval.');
// };

// const approveCampaign = async (req, res) => {
//   const [rows] = await pool.query('SELECT id,status,scheduled_at FROM campaigns WHERE id=?', [req.params.id]);
//   if (!rows.length) return sendError(res, 'Not found.', 404);
//   if (rows[0].status !== 'pending_approval') return sendError(res, 'Not pending approval.', 400);
//   const newStatus = rows[0].scheduled_at ? 'scheduled' : 'sending';
//   await pool.query('UPDATE campaigns SET status=?,approved_by=? WHERE id=?', [newStatus, req.user.id, req.params.id]);
//   if (newStatus === 'sending') await dispatchCampaign(req.params.id);
//   return sendSuccess(res, { status: newStatus }, 'Campaign approved.');
// };

// const rejectCampaign = async (req, res) => {
//   const { reason } = req.body;
//   await pool.query("UPDATE campaigns SET status='rejected',rejected_reason=? WHERE id=?", [reason||null, req.params.id]);
//   return sendSuccess(res, {}, 'Rejected.');
// };

// const sendNow = async (req, res) => {
//   const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
//   if (!rows.length) return sendError(res, 'Not found.', 404);
//   await pool.query("UPDATE campaigns SET status='sending' WHERE id=?", [req.params.id]);
//   await dispatchCampaign(req.params.id);
//   return sendSuccess(res, {}, 'Campaign queued for sending.');
// };

// const dispatchCampaign = async (campaignId) => {
//   const emailQueue = require('../services/queueService');
//   const [cam] = await pool.query(
//     'SELECT c.*,t.html_content FROM campaigns c JOIN templates t ON c.template_id=t.id WHERE c.id=?',
//     [campaignId]
//   );
//   if (!cam.length) return;
//   const c = cam[0];
//   let contacts;
//   if (c.segment_id) {
//     [contacts] = await pool.query(
//       "SELECT id,email,name FROM contacts WHERE segment_id=? AND status='active'", [c.segment_id]
//     );
//   } else {
//     [contacts] = await pool.query("SELECT id,email,name FROM contacts WHERE status='active'");
//   }
//   if (!contacts.length) {
//     await pool.query("UPDATE campaigns SET status='sent' WHERE id=?", [campaignId]);
//     return;
//   }
//   const values = contacts.map(ct => [campaignId, ct.id]);
//   await pool.query('INSERT IGNORE INTO campaign_contacts (campaign_id,contact_id) VALUES ?', [values]);
//   for (const ct of contacts) {
//     await emailQueue.add('send-email', {
//       campaignId, contactId: ct.id, toEmail: ct.email, toName: ct.name,
//       subject: c.subject, htmlContent: c.html_content,
//     }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
//   }
//   await pool.query("UPDATE campaigns SET status='sent' WHERE id=?", [campaignId]);
// };

// module.exports = {
//   getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign,
//   submitForApproval, approveCampaign, rejectCampaign, sendNow,
// };


const { validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { paginate, paginatedResponse } = require('../utils/helpers');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const axios = require('axios');

// ─── Green API WhatsApp Helper ─────────────────────────────────────────────────
// .env madhe he add kara:
//   GREEN_API_INSTANCE_ID=your_instance_id
//   GREEN_API_TOKEN=your_token
const sendWhatsApp = async (phone, message) => {
  try {
    const chatId = `${phone.replace(/\D/g, '')}@c.us`;
    await axios.post(
      `https://api.green-api.com/waInstance${process.env.GREEN_API_INSTANCE_ID}/sendMessage/${process.env.GREEN_API_TOKEN}`,
      { chatId, message },
      { timeout: 10000 }
    );
  } catch (err) {
    // Log karo pan crash nako — email flow continue rahil
    console.error(`[WhatsApp] Failed for ${phone}:`, err?.response?.data || err.message);
  }
};

// ─── NEW: Single Contact la Direct Send ───────────────────────────────────────
// Route: POST /api/campaigns/:id/send-to-contact
// Body:  { contact_id: 123 }
const sendToSingleContact = async (req, res) => {
  const { contact_id } = req.body;
  if (!contact_id) return sendError(res, 'contact_id is required.', 422);
  try {
    const [cam] = await pool.query(
      'SELECT c.*, t.html_content FROM campaigns c JOIN templates t ON c.template_id=t.id WHERE c.id=?',
      [req.params.id]
    );
    if (!cam.length) return sendError(res, 'Campaign not found.', 404);
    const c = cam[0];

    const [contacts] = await pool.query(
      "SELECT id, email, name, phone FROM contacts WHERE id=? AND status='active'",
      [contact_id]
    );
    if (!contacts.length) return sendError(res, 'Contact not found or inactive.', 404);
    const ct = contacts[0];

    const emailQueue = require('../services/queueService');

    // Email — original logic sarkha
    if (ct.email) {
      await emailQueue.add('send-email', {
        campaignId: c.id, contactId: ct.id,
        toEmail: ct.email, toName: ct.name,
        subject: c.subject, htmlContent: c.html_content,
      }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
    }

    // WhatsApp
    if (ct.phone) {
      await sendWhatsApp(ct.phone, c.subject);
    }

    // Tracking
    await pool.query(
      'INSERT IGNORE INTO campaign_contacts (campaign_id, contact_id) VALUES (?, ?)',
      [c.id, ct.id]
    );

    return sendSuccess(res, {}, `Sent to ${ct.name || ct.email}.`);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Failed.', 500);
  }
};

// ─── Original Functions (unchanged) ───────────────────────────────────────────

const getCampaigns = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const status = req.query.status || null;
    let where = 'WHERE (c.name LIKE ? OR c.subject LIKE ?)';
    let p = [search, search];
    if (status) { where += ' AND c.status=?'; p.push(status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM campaigns c ${where}`, p);
    const [rows] = await pool.query(
      `SELECT c.id,c.name,c.subject,c.status,c.scheduled_at,c.total_sent,c.created_at,
              t.name AS template_name, s.name AS segment_name, u.name AS created_by_name
       FROM campaigns c
       LEFT JOIN templates t ON c.template_id=t.id
       LEFT JOIN segments s  ON c.segment_id=s.id
       LEFT JOIN users u     ON c.created_by=u.id
       ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...p, limit, offset]
    );
    return sendSuccess(res, paginatedResponse(rows, total, page, limit));
  } catch (err) { return sendError(res, 'Failed.', 500); }
};

const getCampaignById = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*,t.name AS template_name,t.html_content,s.name AS segment_name,u.name AS created_by_name
     FROM campaigns c
     LEFT JOIN templates t ON c.template_id=t.id
     LEFT JOIN segments s ON c.segment_id=s.id
     LEFT JOIN users u ON c.created_by=u.id
     WHERE c.id=?`,
    [req.params.id]
  );
  if (!rows.length) return sendError(res, 'Not found.', 404);
  return sendSuccess(res, { campaign: rows[0] });
};

const createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());
  const { name, subject, template_id, segment_id, scheduled_at } = req.body;
  try {
    const [tmpl] = await pool.query('SELECT id FROM templates WHERE id=?', [template_id]);
    if (!tmpl.length) return sendError(res, 'Template not found.', 404);
    const [r] = await pool.query(
      'INSERT INTO campaigns (name,subject,template_id,segment_id,scheduled_at,created_by) VALUES (?,?,?,?,?,?)',
      [name, subject, template_id, segment_id||null, scheduled_at||null, req.user.id]
    );
    return sendSuccess(res, { campaignId: r.insertId }, 'Campaign created.', 201);
  } catch (err) { return sendError(res, 'Failed.', 500); }
};

const updateCampaign = async (req, res) => {
  const { name, subject, template_id, segment_id, scheduled_at } = req.body;
  try {
    const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
    if (!rows.length) return sendError(res, 'Not found.', 404);
    if (['sending','sent'].includes(rows[0].status))
      return sendError(res, 'Cannot edit sent/sending campaign.', 400);
    await pool.query(
      'UPDATE campaigns SET name=COALESCE(?,name),subject=COALESCE(?,subject),template_id=COALESCE(?,template_id),segment_id=COALESCE(?,segment_id),scheduled_at=COALESCE(?,scheduled_at) WHERE id=?',
      [name||null, subject||null, template_id||null, segment_id||null, scheduled_at||null, req.params.id]
    );
    return sendSuccess(res, {}, 'Updated.');
  } catch (err) { return sendError(res, 'Failed.', 500); }
};

const deleteCampaign = async (req, res) => {
  const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
  if (!rows.length) return sendError(res, 'Not found.', 404);
  if (['sending','sent'].includes(rows[0].status))
    return sendError(res, 'Cannot delete sent campaign.', 400);
  await pool.query('DELETE FROM campaigns WHERE id=?', [req.params.id]);
  return sendSuccess(res, {}, 'Deleted.');
};

const submitForApproval = async (req, res) => {
  const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
  if (!rows.length) return sendError(res, 'Not found.', 404);
  if (rows[0].status !== 'draft') return sendError(res, 'Only drafts can be submitted.', 400);
  await pool.query("UPDATE campaigns SET status='pending_approval' WHERE id=?", [req.params.id]);
  return sendSuccess(res, {}, 'Submitted for approval.');
};

const approveCampaign = async (req, res) => {
  const [rows] = await pool.query('SELECT id,status,scheduled_at FROM campaigns WHERE id=?', [req.params.id]);
  if (!rows.length) return sendError(res, 'Not found.', 404);
  if (rows[0].status !== 'pending_approval') return sendError(res, 'Not pending approval.', 400);
  const newStatus = rows[0].scheduled_at ? 'scheduled' : 'sending';
  await pool.query('UPDATE campaigns SET status=?,approved_by=? WHERE id=?', [newStatus, req.user.id, req.params.id]);
  if (newStatus === 'sending') await dispatchCampaign(req.params.id);
  return sendSuccess(res, { status: newStatus }, 'Campaign approved.');
};

const rejectCampaign = async (req, res) => {
  const { reason } = req.body;
  await pool.query("UPDATE campaigns SET status='rejected',rejected_reason=? WHERE id=?", [reason||null, req.params.id]);
  return sendSuccess(res, {}, 'Rejected.');
};

const sendNow = async (req, res) => {
  const [rows] = await pool.query('SELECT status FROM campaigns WHERE id=?', [req.params.id]);
  if (!rows.length) return sendError(res, 'Not found.', 404);
  await pool.query("UPDATE campaigns SET status='sending' WHERE id=?", [req.params.id]);
  await dispatchCampaign(req.params.id);
  return sendSuccess(res, {}, 'Campaign queued for sending.');
};

const dispatchCampaign = async (campaignId) => {
  const emailQueue = require('../services/queueService');
  const [cam] = await pool.query(
    'SELECT c.*,t.html_content FROM campaigns c JOIN templates t ON c.template_id=t.id WHERE c.id=?',
    [campaignId]
  );
  if (!cam.length) return;
  const c = cam[0];
  let contacts;
  if (c.segment_id) {
    [contacts] = await pool.query(
      "SELECT id,email,name,phone FROM contacts WHERE segment_id=? AND status='active'", [c.segment_id]
    );
  } else {
    [contacts] = await pool.query("SELECT id,email,name,phone FROM contacts WHERE status='active'");
  }
  if (!contacts.length) {
    await pool.query("UPDATE campaigns SET status='sent' WHERE id=?", [campaignId]);
    return;
  }
  const values = contacts.map(ct => [campaignId, ct.id]);
  await pool.query('INSERT IGNORE INTO campaign_contacts (campaign_id,contact_id) VALUES ?', [values]);
  for (const ct of contacts) {
    // Email — original logic (unchanged)
    await emailQueue.add('send-email', {
      campaignId, contactId: ct.id, toEmail: ct.email, toName: ct.name,
      subject: c.subject, htmlContent: c.html_content,
    }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

    // WhatsApp — fakt he 2 lines add kele
    if (ct.phone) {
      await sendWhatsApp(ct.phone, c.subject);
    }
  }
  await pool.query("UPDATE campaigns SET status='sent' WHERE id=?", [campaignId]);
};

module.exports = {
  getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign,
  submitForApproval, approveCampaign, rejectCampaign, sendNow,
  sendToSingleContact, // ← NEW
};