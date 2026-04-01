const trackingService  = require('../services/trackingService');
const { PIXEL_BUFFER } = require('../utils/trackingPixel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

exports.trackOpen = async (req, res) => {
  const { campaignId, contactId } = req.params;
  await trackingService.recordOpen(campaignId, contactId, req.ip, req.headers['user-agent']).catch(() => {});
  res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': PIXEL_BUFFER.length, 'Cache-Control': 'no-cache' });
  res.end(PIXEL_BUFFER);
};

exports.trackClick = async (req, res) => {
  const { campaignId, contactId } = req.params;
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing URL');
  await trackingService.recordClick(campaignId, contactId, targetUrl, req.ip).catch(() => {});
  return res.redirect(decodeURIComponent(targetUrl));
};

exports.unsubscribe = async (req, res) => {
  const { campaignId, contactId } = req.params;
  try {
    await trackingService.recordUnsubscribe(campaignId, contactId);
    return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2>You have been unsubscribed.</h2>
      <p>You will no longer receive emails from us.</p>
    </body></html>`);
  } catch {
    return res.status(500).send('Something went wrong.');
  }
};

exports.getCampaignEvents = async (req, res) => {
  try {
    const events = await trackingService.getEvents(req.params.campaignId);
    return sendSuccess(res, { events });
  } catch (err) {
    return sendError(res, 'Failed.', 500);
  }
};
