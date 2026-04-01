const { pool } = require('../config/db');

const WhatsappCampaign = {
    findAll: (limit, offset) =>
        pool.query(`
      SELECT wc.id, wc.name, wc.status, wc.total_sent, wc.total_failed,
             wc.scheduled_at, wc.created_at,
             s.name AS segment_name, u.name AS created_by_name
      FROM whatsapp_campaigns wc
      LEFT JOIN segments s ON wc.segment_id = s.id
      LEFT JOIN users u ON wc.created_by = u.id
      ORDER BY wc.created_at DESC LIMIT ? OFFSET ?
    `, [limit, offset]),

    count: () =>
        pool.query('SELECT COUNT(*) AS total FROM whatsapp_campaigns'),

    findById: (id) =>
        pool.query(`
      SELECT wc.*, s.name AS segment_name, u.name AS created_by_name
      FROM whatsapp_campaigns wc
      LEFT JOIN segments s ON wc.segment_id = s.id
      LEFT JOIN users u ON wc.created_by = u.id
      WHERE wc.id=?
    `, [id]),

    create: (data, userId) =>
        pool.query(
            'INSERT INTO whatsapp_campaigns (name, message, media_url, segment_id, scheduled_at, created_by) VALUES (?,?,?,?,?,?)',
            [data.name, data.message, data.media_url || null, data.segment_id || null, data.scheduled_at || null, userId]
        ),

    update: (id, data) =>
        pool.query(
            'UPDATE whatsapp_campaigns SET name=COALESCE(?,name), message=COALESCE(?,message), media_url=COALESCE(?,media_url), segment_id=COALESCE(?,segment_id), scheduled_at=COALESCE(?,scheduled_at) WHERE id=?',
            [data.name || null, data.message || null, data.media_url || null, data.segment_id || null, data.scheduled_at || null, id]
        ),

    delete: (id) =>
        pool.query('DELETE FROM whatsapp_campaigns WHERE id=?', [id]),

    updateStatus: (id, status) =>
        pool.query('UPDATE whatsapp_campaigns SET status=? WHERE id=?', [status, id]),

    incrementSent: (id) =>
        pool.query('UPDATE whatsapp_campaigns SET total_sent=total_sent+1 WHERE id=?', [id]),

    incrementFailed: (id) =>
        pool.query('UPDATE whatsapp_campaigns SET total_failed=total_failed+1 WHERE id=?', [id]),

    logMessage: (campaignId, contactId, phone, status, errorMsg = null) =>
        pool.query(
            'INSERT INTO whatsapp_logs (campaign_id, contact_id, phone, status, error_msg) VALUES (?,?,?,?,?)',
            [campaignId, contactId, phone, status, errorMsg]
        ),

    getLogs: (campaignId) =>
        pool.query(`
      SELECT wl.*, c.name AS contact_name
      FROM whatsapp_logs wl
      JOIN contacts c ON wl.contact_id = c.id
      WHERE wl.campaign_id=? ORDER BY wl.sent_at DESC
    `, [campaignId]),
};

module.exports = WhatsappCampaign;
