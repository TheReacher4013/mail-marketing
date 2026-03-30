const {pool} = require("../config/db");
const { findAll, count, findById, create } = require("./Automation");

const Campaign = {
    findAll: (where, params, limit, offset) =>
        pool.query(
            `SELECT c.id, c.name, c.subject,c.status,c.scheduled_at, c.total_sent, c.created_at, t.name AS template_name, s.name AS segment_name, u.name As created_by_name
            FROM campaigns c 
            LEFT JOIN templates t ON c.template_id=t.id
            LEFT JOIN segments s ON c.segment_id=s.id
            LEFT JOIN users u ON c.created_by=u.id
            ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        ),

        count: (where, params) =>
            pool.query( `SELECT COUNT(*) AS total FROM campaigns c ${where}`, params),

        findById: (id) => 
            pool.query(
                `SELECT c.*,t.name AS template_name, t.html_contect, s.name AS segment_name, u.name AS created_by_name
                FROM campaigns c
                LEFT JOIN templates t ON c.template_id=t.id
                LEFT JOIN segments s ON c.segment_id=s.id
                LEFT JOIN users u ON c.created_by=u.id WHRER c.id=?`,
                [id]
            ),
            create: (data, userId) =>
                pool.query( `INSERT INTO campaigns (name,subject,template_id, segment_id, scheduled_at, created_by) VALUES (?,?,?,?,?,?)`,[data.name, data.subject, data.template_id, data.segment_id || null, data.scheduled_at || null, userId]
                ),
                
                update: (id, data) =>
                    pool.query(
                        'UPDATE campaigns SET name=COALESCE(?,name),subject=COALESCE(?,subject),template_id=COALESCE(?,template_id),segment_id=COALESCE(?,segment_id),scheduled_at=COALESCE(?,scheduled_at) WHERE id=?',
                        [data.name || null, data.subject || null, data.template_id || null, data.segment_id || null, data.scheduled_at || null, id]
                    ),

    delete: (id) => pool.query('DELETE FROM campaigns WHERE id=?', [id]),

    updateStatus: (id, status, extra = {}) => {
        let q = 'UPDATE campaigns SET status=?';
        const p = [status];
        if (extra.approved_by) { q += ',approved_by=?'; p.push(extra.approved_by); }
        if (extra.rejected_reason) { q += ',rejected_reason=?'; p.push(extra.rejected_reason); }
        q += ' WHERE id=?'; p.push(id);
        return pool.query(q, p);
    },

    incrementSent: (id) =>
        pool.query('UPDATE campaigns SET total_sent=total_sent+1 WHERE id=?', [id]),

    findScheduledDue: () =>
        pool.query(
            `SELECT c.*,t.html_content FROM campaigns c
       JOIN templates t ON c.template_id=t.id
       WHERE c.status='scheduled' AND c.scheduled_at<=NOW()`
        ),

    bulkInsertContacts: (campaignId, contactIds) => {
        const values = contactIds.map(id => [campaignId, id]);
        return pool.query('INSERT IGNORE INTO campaign_contacts (campaign_id,contact_id) VALUES ?', [values]);
    },
};

module.exports = Campaign;
