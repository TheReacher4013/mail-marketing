const https = require('https');
const { pool } = require('../config/db');

// Green API base URL
const GREEN_API_URL = 'https://api.green-api.com';

// Config DB se load karo
const getConfig = async () => {
    const [rows] = await pool.query('SELECT * FROM whatsapp_config WHERE is_active=TRUE LIMIT 1');
    if (!rows.length) throw { status: 400, message: 'WhatsApp config not set. Please configure Green API first.' };
    return rows[0];
};

// HTTP request helper
const makeRequest = (url, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { resolve(data); }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

// Phone number format karo — country code add karo
const formatPhone = (phone) => {
    // Remove spaces, dashes, +
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');

    // Agar 10 digit hai (India) toh 91 add karo
    if (cleaned.length === 10) cleaned = '91' + cleaned;

    return cleaned + '@c.us'; // Green API format
};

// Text message bhejo
const sendTextMessage = async (phone, message) => {
    const config = await getConfig();
    const url = `${GREEN_API_URL}/waInstance${config.instance_id}/sendMessage/${config.api_token}`;

    const body = {
        chatId: formatPhone(phone),
        message: message,
    };

    return makeRequest(url, 'POST', body);
};

// Image/Media message bhejo
const sendMediaMessage = async (phone, mediaUrl, caption = '') => {
    const config = await getConfig();
    const url = `${GREEN_API_URL}/waInstance${config.instance_id}/sendFileByUrl/${config.api_token}`;

    const body = {
        chatId: formatPhone(phone),
        urlFile: mediaUrl,
        fileName: 'media',
        caption: caption,
    };

    return makeRequest(url, 'POST', body);
};

// Account status check karo
const checkInstanceStatus = async () => {
    const config = await getConfig();
    const url = `${GREEN_API_URL}/waInstance${config.instance_id}/getStateInstance/${config.api_token}`;
    return makeRequest(url);
};

// Config save karo
const saveConfig = async (instanceId, apiToken, phoneNumber, userId) => {
    // Pehle existing deactivate karo
    await pool.query('UPDATE whatsapp_config SET is_active=FALSE');

    // Naya insert karo
    await pool.query(
        'INSERT INTO whatsapp_config (instance_id, api_token, phone_number, created_by) VALUES (?,?,?,?)',
        [instanceId, apiToken, phoneNumber, userId]
    );
};

module.exports = { sendTextMessage, sendMediaMessage, checkInstanceStatus, saveConfig, getConfig };
