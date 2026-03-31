const { pool } = require('../config/db');
const EmailEvent = require('../models/EmailEvent');
const Contact = require('../models/Contact');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.sendgrid = async (req, res) => {
    try {
        const events = req.body;
        for (const event of events) {
            if (!event.campaign_id || !event.contact_id) continue;

            if (event.event === 'open') {
                await EmailEvent.log(event.campaign_id, event.contact_id, 'opened');
            } else if (event.event === 'click') {
                await EmailEvent.log(event.campaign_id, event.contact_id, 'clicked', { link_url: event.url });
            } else if (event.event === 'bounce' || event.event === 'dropped') {
                await pool.query("UPDATE contacts SET status='bounced' WHERE id=?", [event.contact_id]);
                await EmailEvent.log(event.campaign_id, event.contact_id, 'bounced');
            } else if (event.event === 'unsubscribe') {
                await Contact.markUnsubscribed(event.contact_id);
                await EmailEvent.log(event.campaign_id, event.contact_id, 'unsubscribed');
            }
        }
        return sendSuccess(res, {}, 'Webhook processed.');
    } catch (err) {
        return sendError(res, 'Webhook processing failed.', 500);
    }
};
