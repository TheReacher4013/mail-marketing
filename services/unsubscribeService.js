const Contact = require("../models/Contact");
const UnsubscribeList = require("../models/UnsubscribeList");
const EmailEvents = require("../models/EmailEvent")

const unsubscribe = async (campaignId, contactId) =>{
    const [contacts] = await Contact.findById(contactId);
    if (!contacts.length) return;
    await Contact.markUnsubscribed(contactId);
    await UnsubscribeList.add(contacts[0].email);
    await EmailEvents.log(campaignId, contactId, 'unsubscribed');
};
const isUnsubscribed = async(email) =>{
    const [rows] = await UnsubscribeList.check(email);
    return rows.length > 0;
}

module.exports = {unsubscribe, isUnsubscribed};