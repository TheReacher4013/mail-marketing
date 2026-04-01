const trackingService = require('../services/trackingService');
const { PIXEL_BUFFER } = require('../utils/trackingPixel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const handleError = (res, error, message = 'Something went wrong.') => {
  return sendError(res, message, error?.status || 500);
};


exports.trackOpen = async (req, res) => {
  const { campaignId, contactId } = req.params;

  try {
    await trackingService.recordOpen(
      campaignId,
      contactId,
      req.ip,
      req.headers['user-agent']
    );
  } catch (error) {

  }

 
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': PIXEL_BUFFER.length,
    'Cache-Control': 'no-cache'
  });

  return res.end(PIXEL_BUFFER);
};


exports.trackClick = async (req, res) => {
  const { campaignId, contactId } = req.params;
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing URL');
  }

  try {
    await trackingService.recordClick(
      campaignId,
      contactId,
      targetUrl,
      req.ip
    );
  } catch (error) {
    
  }

  return res.redirect(decodeURIComponent(targetUrl));
};

exports.unsubscribe = async (req, res) => {
  const { campaignId, contactId } = req.params;

  try {
    await trackingService.recordUnsubscribe(campaignId, contactId);

    return res.send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>You have been unsubscribed.</h2>
          <p>You will no longer receive emails from us.</p>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send('Something went wrong.');
  }
};


exports.getCampaignEvents = async (req, res) => {
  try {
    const events = await trackingService.getEvents(req.params.campaignId);
    return sendSuccess(res, { events });
  } catch (error) {
    return handleError(res, error, 'Failed to fetch events.');
  }
};