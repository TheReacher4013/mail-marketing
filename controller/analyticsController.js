const { unsubscribe } = require('../app');
const {pool} = require('../config/db');
const {sendSuccess, SendError} = require('../utils/responseHelper');

const getOverview = async (req, res)=>{
    try {
        const[[async]] = await pool.query(`
            SELECT
            (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status='sent') AS sent_campaigns,
        (SELECT COUNT(*) FROM contacts WHERE status='active') AS total_contacts,
        (SELECT COALESCE(SUM(total_sent),0) FROM campaigns)  AS total_emails_sent
            `);
            const sent = totals.total_email_sent || 1;
            return sendSuccess(res,{
                ...totals,
                ...events,
                open_rate: +((events.totals_opens /sent)*100).toFixed(2),
                click_rate: +((events.totals_clicks /sent)*100).toFixed(2),
                bounce_rate: +((events/totals_bounces /sent)*100).toFixed(2),
                unsubscribe_rate : +((events.totals_unsubscribes /sent)*100).toFixed(2),
            });
    } catch (err) {return SendError(res, 'Failed.', 500); }
    
};


const getCampaignStats = async (req, res) => {
    try {
        const { id } = req.params;
        const [[cam]] = await pool.query(
            `SELECT c.id,c.name,c.subject,c.status,c.total_sent,c.created_at,
              (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id=c.id) AS total_recipients
       FROM campaigns c WHERE c.id=?`,
            [id]
        );
        if (!cam) return sendError(res, 'Campaign not found.', 404);

        const [[ev]] = await pool.query(`
      SELECT
        COUNT(CASE WHEN event_type='opened'       THEN 1 END) AS opens,
        COUNT(CASE WHEN event_type='clicked'      THEN 1 END) AS clicks,
        COUNT(CASE WHEN event_type='bounced'      THEN 1 END) AS bounces,
        COUNT(CASE WHEN event_type='unsubscribed' THEN 1 END) AS unsubscribes
      FROM email_events WHERE campaign_id=?`,
            [id]
        );

        const sent = cam.total_sent || 1;
        return sendSuccess(res, {
            campaign: cam,
            stats: {
                ...ev,
                open_rate: +((ev.opens / sent) * 100).toFixed(2),
                click_rate: +((ev.clicks / sent) * 100).toFixed(2),
                bounce_rate: +((ev.bounces / sent) * 100).toFixed(2),
                unsubscribe_rate: +((ev.unsubscribes / sent) * 100).toFixed(2),
            },
        });
    } catch (err) { return sendError(res, 'Failed.', 500); }
};

const getCampaignChart = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT c.name, c.total_sent AS sent,
        COUNT(CASE WHEN ee.event_type='opened'  THEN 1 END) AS opens,
        COUNT(CASE WHEN ee.event_type='clicked' THEN 1 END) AS clicks
      FROM campaigns c
      LEFT JOIN email_events ee ON c.id=ee.campaign_id
      WHERE c.status='sent'
      GROUP BY c.id ORDER BY c.created_at DESC LIMIT 10
    `);
        return sendSuccess(res, { chartData: rows });
    } catch (err) { return sendError(res, 'Failed.', 500); }
};

const getContactGrowth = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT DATE_FORMAT(created_at,'%Y-%m') AS month, COUNT(*) AS new_contacts
      FROM contacts
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);
        return sendSuccess(res, { growth: rows.reverse() });
    } catch (err) { return sendError(res, 'Failed.', 500); }
};

const getAuditLogs = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT al.*,u.name AS user_name
      FROM audit_logs al LEFT JOIN users u ON al.user_id=u.id
      ORDER BY al.timestamp DESC LIMIT 50
    `);
        return sendSuccess(res, { logs: rows });
    } catch (err) { return sendError(res, 'Failed.', 500); }
};

module.exports = { getOverview, getCampaignStats, getCampaignChart, getContactGrowth, getAuditLogs };
