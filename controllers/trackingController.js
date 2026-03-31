const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const trackOpen = async (req, res) => {
  const { campaignId, contactId } = req.params;
  try {
    const [ex] = await pool.query(
      "SELECT id FROM email_events WHERE campaign_id=? AND contact_id=? AND event_type='opened'",
      [campaignId, contactId]
    );
    if (!ex.length) {
      await pool.query(
        "INSERT INTO email_events (campaign_id,contact_id,event_type,ip_address,user_agent) VALUES (?,?,'opened',?,?)",
        [campaignId, contactId, req.ip, req.headers['user-agent']||null]
      );
    }
  } catch (err) { console.error('trackOpen:', err); }
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
  res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length, 'Cache-Control': 'no-cache' });
  res.end(pixel);
};

const trackClick = async (req, res) => {
  const { campaignId, contactId } = req.params;
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing URL');
  try {
    await pool.query(
      "INSERT INTO email_events (campaign_id,contact_id,event_type,link_url,ip_address) VALUES (?,?,'clicked',?,?)",
      [campaignId, contactId, targetUrl, req.ip]
    );
  } catch (err) { console.error('trackClick:', err); }
  return res.redirect(decodeURIComponent(targetUrl));
};

const unsubscribe = async (req, res) => {
  const { campaignId, contactId } = req.params;
  try {
    const [c] = await pool.query('SELECT email FROM contacts WHERE id=?', [contactId]);
    if (!c.length) return res.status(404).send('Not found.');
    await pool.query("UPDATE contacts SET status='unsubscribed' WHERE id=?", [contactId]);
    await pool.query('INSERT IGNORE INTO unsubscribe_list (email) VALUES (?)', [c[0].email]);
    await pool.query(
      "INSERT INTO email_events (campaign_id,contact_id,event_type) VALUES (?,?,'unsubscribed')",
      [campaignId, contactId]
    );
    return res.send('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Unsubscribed</h2><p>You will no longer receive emails.</p></body></html>');
  } catch (err) { return res.status(500).send('Error.'); }
};

const getCampaignEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ee.*,c.email AS contact_email,c.name AS contact_name
       FROM email_events ee JOIN contacts c ON ee.contact_id=c.id
       WHERE ee.campaign_id=? ORDER BY ee.timestamp DESC`,
      [req.params.campaignId]
    );
    return sendSuccess(res, { events: rows });
  } catch (err) { return sendError(res, 'Failed.', 500); }
};

module.exports = { trackOpen, trackClick, unsubscribe, getCampaignEvents };