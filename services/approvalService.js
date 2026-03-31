const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const emailProvider = require('./emailProviderService');
const EmailEvent = require('../models/EmailEvent');
const CampaignContact = require('../models/CampaignContact');

const submit = async (campaignId) => {
  const [rows] = await Campaign.findById(campaignId);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
  if (rows[0].status !== 'draft') throw { status: 400, message: 'Only draft campaigns can be submitted.' };
  await Campaign.updateStatus(campaignId, 'pending_approval');
};

const approve = async (campaignId, approverId) => {
  const [rows] = await Campaign.findById(campaignId);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
  if (rows[0].status !== 'pending_approval') throw { status: 400, message: 'Campaign is not pending approval.' };

  const newStatus = rows[0].scheduled_at ? 'scheduled' : 'sending';
  await Campaign.updateStatus(campaignId, newStatus, { approved_by: approverId });

  if (newStatus === 'sending') await dispatchCampaign(rows[0]);
  return newStatus;
};

const reject = async (campaignId, reason) => {
  const [rows] = await Campaign.findById(campaignId);
  if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
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

  // Direct email — no queue
  for (const contact of contacts) {
    try {
      await emailProvider.send({
        to: contact.email,
        toName: contact.name,
        subject: campaign.subject,
        html: campaign.html_content,
        campaignId: campaign.id,
        contactId: contact.id,
      });

      await CampaignContact.updateStatus(campaign.id, contact.id, 'sent');
      await EmailEvent.log(campaign.id, contact.id, 'sent');
      await Campaign.incrementSent(campaign.id);
    } catch (err) {
      console.error(`Failed to send to ${contact.email}:`, err.message);
      await CampaignContact.updateStatus(campaign.id, contact.id, 'failed');
      await EmailEvent.log(campaign.id, contact.id, 'bounced');
    }
  }

  await Campaign.updateStatus(campaign.id, 'sent');
};

module.exports = { submit, approve, reject, dispatchCampaign };