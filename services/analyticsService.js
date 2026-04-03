const {pool} = require('../config/db');
const EmailEvent = require("../models/EmailEvent");
const AuditLog = require("../models/AuditLog");


const getOverview = async () =>{
    const [[totals]] = await pool.query(`
        SELECT 
        (SELECT COUNT (*) FROM campaigns) AS total_campaigns,
        (SELECT COUNT (*) FROM campaigns WHERE
        status='sent') AS sent_campaigns,
        (SELECT COUNT (*) FROM contacts WHERE
        status='active') AS total_contacts,
        (SELECT COALESCE(SUM(total_sent),0)FROM campaigns) AS total_emails_sent
       
    `);

    const [[ev]] = await EmailEvent.getGlobalStats();
    const sent = totals.total_emails_sent || 1;

    return {
        ...totals,
        ...ev,
        open_rate :  +((ev.total_opens /sent) * 100).toFixed(2),
        clicks_rate : +((ev.total_clicks / sent) * 100).toFixed(2),
        bounce_rate : +((ev.total_bounce / sent) * 100).toFixed(2),
        unsubscribe_rate : +((ev.total_unsubscribes / sent) * 100).toFixed(2),
    };
};

const getCampaignStats = async (id) => {
    const [[cam]] = await pool.query(
        `SELECT c.id, c.name, c.subject, c.status, c.total_sent, c.created_at,
        (SELECT COUNT (*) FROM
        campaign_contacts WHERE campaign_id=c.id) AS total_recipients
        FROM campaigns c WHERE c.id=?`,[id]
    );

    if (!cam) throw { status:404, message:'Campaign not found.'};
    
    const [[ev]] = await EmailEvent.getStats(id);
    const sent = cam.total_sent || 1;

    return {
        campaign: cam,
        stats: {
            ...ev,
            open_rate: +((ev.opens  /sent)*100).toFixed(2),
            clicks_rate: +((ev.clicks /sent)*100).toFixed(2),
            bounce_rate: +((ev.bounces /sent)*100).toFixed(2),
            unsubscribe_rate: +((ev.unsubscribes /sent)*100).toFixed(2),
        },
    };
};
const getCampaignChart = async () => {
    const [rows] = await pool.query(`
    SELECT c.name,c.total_sent AS sent,
      COUNT(CASE WHEN ee.event_type='opened'  THEN 1 END) AS opens,
      COUNT(CASE WHEN ee.event_type='clicked' THEN 1 END) AS clicks
    FROM campaigns c
    LEFT JOIN email_events ee ON c.id=ee.campaign_id
    WHERE c.status='sent'
    GROUP BY c.id ORDER BY c.created_at DESC LIMIT 10
  `);
    return rows;
};

const getContactGrowth = async () => {
    const [rows] = await pool.query(`
    SELECT DATE_FORMAT(created_at,'%Y-%m') AS month, COUNT(*) AS new_contacts
    FROM contacts GROUP BY month ORDER BY month DESC LIMIT 12
  `);
    return rows.reverse();
};

const getAuditLogs = async () => {
    const [rows] = await AuditLog.getAll(50);
    return rows;
};

module.exports = { getOverview, getCampaignStats, getCampaignChart, getContactGrowth, getAuditLogs };
