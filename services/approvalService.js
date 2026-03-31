const Campaign   = require('../models/Campaign');
const queueService = require('./queueService');
const Contact    = require('../models/contact');

const submit = async (campaignId) => {
  const [rows] = await Campaign.findById(campaignId);
  if (!rows.length)             throw { status: 404, message: 'Campaign not found.' };
  if (rows[0].status !== 'draft') throw { status: 400, message: 'Only draft campaigns can be submitted.' };
  await Campaign.updateStatus(campaignId, 'pending_approval');
};

const approve = async (campaignId, approverId) => {
  const [rows] = await Campaign.findById(campaignId);
  if (!rows.length)                          throw { status: 404, message: 'Campaign not found.' };
  if (rows[0].status !== 'pending_approval') throw { status: 400, message: 'Campaign is not pending approval.' };

  const newStatus = rows[0].scheduled_at ? 'scheduled' : 'sending';
  await Campaign.updateStatus(campaignId, newStatus, { approved_by: approverId });

  if (newStatus === 'sending') await dispatchCampaign(rows[0]);
  return newStatus;
};

const reject = async (campaignId, reason) => {
  const [rows] = await Campaign.findById(campaignId);
  if (!rows.length)                          throw { status: 404, message: 'Campaign not found.' };
  if (rows[0].status !== 'pending_approval') throw { status: 400, message: 'Campaign is not pending approval.' };
  await Campaign.updateStatus(campaignId, 'rejected', { rejected_reason: reason });
};

const dispatchCampaign = async (campaign) => {
  let contacts;
  if (campaign.segment_id) {
    [contacts] = await Contact.findActiveBySegment(campaign.segment_id);
  } else {
    [contacts] = await Contact.findAllActive();
  }

  if (!contacts.length) {
    await Campaign.updateStatus(campaign.id, 'sent');
    return;
  }

  await Campaign.bulkInsertContacts(campaign.id, contacts.map(c => c.id));

  for (const contact of contacts) {
    await queueService.add('send-email', {
      campaignId:  campaign.id,
      contactId:   contact.id,
      toEmail:     contact.email,
      toName:      contact.name,
      subject:     campaign.subject,
      htmlContent: campaign.html_content,
    }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  }

  await Campaign.updateStatus(campaign.id, 'sent');
};

module.exports = { submit, approve, reject, dispatchCampaign };
