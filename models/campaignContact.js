const { pool } = require('../config/db');

const campaignContact ={
    updateStatus: (campaign, contactId, status)=>
        pool.query(
            "UPDATE campaign_contacts SET  status=?, sent_at=IF(?='sent',NOW(),NULL) WHERE campaign_id=? AND contact_id=?",
         [status, status, CampaignId, contactId ]
        )
};

module.exports = campaignContact;