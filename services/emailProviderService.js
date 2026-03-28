const nodemailer = require('nodemailer');
const emailConfig = require("../config/emailConfig");
const {personaliseTemplate} = require("../utils/personaliseTemplate");
const {rewriteLinks, addUnsubscribeLink} = require("../utils/rewriteLinks");
const {getTrackingPixelTag} = require("../utils/trackingPixel");

const transporter = nodemailer.createTransport(emailConfig.smtp);

const send = async({to, toName, subject, html, campaignId, contactId}) => {
    let finalHtml = html;
    if (campaignId && contactId){
        finalHtml = personaliseTemplate(finalHtml,{
            name: toName, email: to
        });
        finalHtml = rewriteLinks(finalHtml,campaignId, contactId);
        
        finalHtml = addUnsubscribeLink(finalHtml, campaignId, contactId);

        finalHtml += getTrackingPixelTag(campaignId, contactId);
    }
    return transporter.sendMail({
        from: `"${emailConfig.fromName}"<${emailConfig.from}>`,
        to: toName ? `"${toName}" <${to}>`: to,
        subject,
        html : finalHtml
    });
};

module.exports = {send};

