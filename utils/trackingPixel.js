const emailConfig = require('../config/emailConfig');

const PIXEL_BUFFER = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'
);

const getTrackingPixelTag = (campaignId, contactId) => {
    const url = `${emailConfig.appUrl}/api/track/open/${campaignId}/${contactId}`;
    return `<img src="${url}" width="1" height="1" style="display:none" alt="" />`;
};

module.exports = { PIXEL_BUFFER, getTrackingPixelTag };
