const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    },
});

const APP_URL = process.env.APP_URL || 'http://localhost:5000';

const personalize = (html, contact) =>{
    return html
    .replace(/{{name}}/gi, contact.name || 'Subscriber')
    .replace(/{{email}}/gi, contact.email || '');
};

const injectTracking = (html, campaign)