const WhatsappCampaign = require('../models/WhatsappCampaign');
const Contact = require('../models/Contact');
const greenApi = require('./greenApiService');
const { paginate, paginatedResponse } = require('../utils/responseHelper');

const getAll = async (query) => {
    const { page, limit, offset } = paginate(query);
    const [[{ total }]] = await WhatsappCampaign.count();
    const [rows] = await WhatsappCampaign.findAll(limit, offset);
    return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
    const [rows] = await WhatsappCampaign.findById(id);
    if (!rows.length) throw { status: 404, message: 'WhatsApp campaign not found.' };
    return rows[0];
};

const create = async (data, userId) => {
    const [r] = await WhatsappCampaign.create(data, userId);
    return r.insertId;
};

const update = async (id, data) => {
    const [rows] = await WhatsappCampaign.findById(id);
    if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
    if (['sending', 'sent'].includes(rows[0].status))
        throw { status: 400, message: 'Cannot edit a sent campaign.' };
    await WhatsappCampaign.update(id, data);
};

const remove = async (id) => {
    const [rows] = await WhatsappCampaign.findById(id);
    if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
    if (['sending', 'sent'].includes(rows[0].status))
        throw { status: 400, message: 'Cannot delete a sent campaign.' };
    await WhatsappCampaign.delete(id);
};

// Campaign send karo — contacts ko WhatsApp message bhejo
const sendCampaign = async (campaignId) => {
    const [rows] = await WhatsappCampaign.findById(campaignId);
    if (!rows.length) throw { status: 404, message: 'Campaign not found.' };
    const campaign = rows[0];

    if (campaign.status === 'sent') throw { status: 400, message: 'Campaign already sent.' };

    await WhatsappCampaign.updateStatus(campaignId, 'sending');

    // Contacts fetch karo
    let contacts;
    if (campaign.segment_id) {
        [contacts] = await Contact.findActiveBySegment(campaign.segment_id);
    } else {
        [contacts] = await Contact.findAllActive();
    }

    if (!contacts.length) {
        await WhatsappCampaign.updateStatus(campaignId, 'sent');
        return { sent: 0, failed: 0 };
    }

    let sent = 0, failed = 0;

    for (const contact of contacts) {
        // Phone nahi hai toh skip
        if (!contact.phone) {
            failed++;
            await WhatsappCampaign.incrementFailed(campaignId);
            await WhatsappCampaign.logMessage(campaignId, contact.id, 'N/A', 'failed', 'No phone number');
            continue;
        }

        try {
            // Personalize karo
            const message = campaign.message
                .replace(/{{name}}/gi, contact.name || 'Customer')
                .replace(/{{email}}/gi, contact.email || '');

            // Media hai toh media bhejo, nahi toh text
            if (campaign.media_url) {
                await greenApi.sendMediaMessage(contact.phone, campaign.media_url, message);
            } else {
                await greenApi.sendTextMessage(contact.phone, message);
            }

            await WhatsappCampaign.incrementSent(campaignId);
            await WhatsappCampaign.logMessage(campaignId, contact.id, contact.phone, 'sent');
            sent++;

            // Rate limiting — Green API mein delay chahiye
            await new Promise(r => setTimeout(r, 3000)); // 3 second delay per message

        } catch (err) {
            failed++;
            await WhatsappCampaign.incrementFailed(campaignId);
            await WhatsappCampaign.logMessage(campaignId, contact.id, contact.phone, 'failed', err.message);
            console.error(`WhatsApp failed for ${contact.phone}:`, err.message);
        }
    }

    await WhatsappCampaign.updateStatus(campaignId, 'sent');
    return { sent, failed };
};

const getLogs = async (campaignId) => {
    const [rows] = await WhatsappCampaign.getLogs(campaignId);
    return rows;
};

module.exports = { getAll, getById, create, update, remove, sendCampaign, getLogs };
