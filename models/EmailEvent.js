const { pool } = require('../config/db');

const EmailEvent = {
    log: (campaignId, contactId, eventType, extra = {}) =>
        pool.query(
            'INSERT INTO email_events (campaign_id,contact_id,event_type,link_url,ip_address,user_agent) VALUES (?,?,?,?,?,?)',
            [campaignId, contactId, eventType, extra.link_url || null, extra.ip || null, extra.ua || null]
        ),

    exists: (campaignId, contactId, eventType) =>
        pool.query(
            'SELECT id FROM email_events WHERE campaign_id=? AND contact_id=? AND event_type=? LIMIT 1',
            [campaignId, contactId, eventType]
        ),

    getByCampaign: (campaignId) =>
        pool.query(
            `SELECT ee.*,c.email AS contact_email,c.name AS contact_name
       FROM email_events ee JOIN contacts c ON ee.contact_id=c.id
       WHERE ee.campaign_id=? ORDER BY ee.timestamp DESC`,
            [campaignId]
        ),

    getStats: (campaignId) =>
        pool.query(
            `SELECT
         COUNT(CASE WHEN event_type='opened'       THEN 1 END) AS opens,
         COUNT(CASE WHEN event_type='clicked'      THEN 1 END) AS clicks,
         COUNT(CASE WHEN event_type='bounced'      THEN 1 END) AS bounces,
         COUNT(CASE WHEN event_type='unsubscribed' THEN 1 END) AS unsubscribes
       FROM email_events WHERE campaign_id=?`,
            [campaignId]
        ),

    getGlobalStats: () =>
        pool.query(
            `SELECT
         COUNT(CASE WHEN event_type='opened'       THEN 1 END) AS total_opens,
         COUNT(CASE WHEN event_type='clicked'      THEN 1 END) AS total_clicks,
         COUNT(CASE WHEN event_type='bounced'      THEN 1 END) AS total_bounces,
         COUNT(CASE WHEN event_type='unsubscribed' THEN 1 END) AS total_unsubscribes
       FROM email_events`
        ),
};

module.exports = EmailEvent;
