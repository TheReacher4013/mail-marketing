const Contact = require ('../models/Contact');
const EmailEvent = require ('../models/EmailEvent');
const CampaignContact = require('../models/CampaignContact');
const campaignContact = require('../models/CampaignContact');

const handleBounce = async (capmaignId, contactId) => {
    await pool.query("UPDATE contact SET status ='bounced' WHERE id=?",[contactId]);
     await EmailEvent.log(capmaignId, contactId, 'bounced');
     await CampaignContact.updateStatus(capmaignId, contactId, 'failed');
};

module.exports = { handleBounce}