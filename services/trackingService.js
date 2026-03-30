const EmailEvent = require('../models/EmailEvent');
const Contact = require('../models/Contact');
const UnsubscribeList = require('../models/UnsubscribeList');

const recordOpen = async (campaignId, contactId, ip, ua) => {
    const [ex] = await EmailEvent.exists(campaignId, contactId, 'opened');
    if (!ex.length) {
        await EmailEvent.log(campaignId, contactId, 'opened', { ip, ua });
    }
};

const recordClick = async (campaignId, contactId, url, ip) => {
    await EmailEvent.log(campaignId, contactId, 'clicked', { link_url: url, ip });
};

const recordUnsubscribe = async (campaignId, contactId) => {
    const [contacts] = await Contact.findById(contactId);
    if (!contacts.length) return;

    await Contact.markUnsubscribed(contactId);
    await UnsubscribeList.add(contacts[0].email);
    await EmailEvent.log(campaignId, contactId, 'unsubscribed');
};

const getEvents = async (campaignId) => {
    const [rows] = await EmailEvent.getByCampaign(campaignId);
    return rows;
};

module.exports = { recordOpen, recordClick, recordUnsubscribe, getEvents };
