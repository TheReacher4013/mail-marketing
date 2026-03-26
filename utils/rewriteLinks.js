const emailConfig = require('../config/emailConfig');

const rewriteLinks = (html, campaignId, contactId) => {
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (match, url) => {
    if (url.includes('/api/track')) return match;
    const encoded = encodeURIComponent(url);
    return `href="${emailConfig.appUrl}/api/track/click/${campaignId}/${contactId}?url=${encoded}"`;
  });
};

const addUnsubscribeLink = (html, campaignId, contactId) => {
  const link = `${emailConfig.appUrl}/api/track/unsubscribe/${campaignId}/${contactId}`;
  const footer = `<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
    <a href="${link}" style="color:#9ca3af">Unsubscribe</a>
  </p>`;
  return html.includes('</body>') ? html.replace('</body>', `${footer}</body>`) : html + footer;
};

module.exports = { rewriteLinks, addUnsubscribeLink };