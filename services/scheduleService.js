const cron       = require('node-cron');
const { pool }   = require('../config/db');
const emailQueue = require('./queueService');

const startScheduler = () => {
  
  cron.schedule('* * * * *', async () => {
    try {
      const [campaigns] = await pool.query(
        `SELECT c.id, c.name, c.subject, c.segment_id,
                t.html_content
         FROM campaigns c
         JOIN templates t ON c.template_id = t.id
         WHERE c.status = 'scheduled'
           AND c.scheduled_at <= NOW()`
      );

      for (const campaign of campaigns) {
        console.log(`Dispatching scheduled campaign: ${campaign.name}`);

        await pool.query("UPDATE campaigns SET status = 'sending' WHERE id = ?", [campaign.id]);

        let contacts;
        if (campaign.segment_id) {
          [contacts] = await pool.query(
            "SELECT id, email, name FROM contacts WHERE segment_id = ? AND status = 'active'",
            [campaign.segment_id]
          );
        } else {
          [contacts] = await pool.query(
            "SELECT id, email, name FROM contacts WHERE status = 'active'"
          );
        }

        if (!contacts.length) {
          await pool.query("UPDATE campaigns SET status = 'sent' WHERE id = ?", [campaign.id]);
          continue;
        }

        const values = contacts.map(c => [campaign.id, c.id]);
        await pool.query(
          'INSERT IGNORE INTO campaign_contacts (campaign_id, contact_id) VALUES ?', [values]
        );

        for (const contact of contacts) {
          await emailQueue.add('send-email', {
            campaignId:  campaign.id,
            contactId:   contact.id,
            toEmail:     contact.email,
            toName:      contact.name,
            subject:     campaign.subject,
            htmlContent: campaign.html_content,
          }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
        }
        
        await pool.query("UPDATE campaigns SET status = 'sent' WHERE id = ?", [campaign.id]);
      }
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });

  console.log('Campaign scheduler started');
};

module.exports = { startScheduler };