const Automation = require('../models/Automation');
const Contact    = require('../models/Contact');
const Template   = require('../models/Template');
const emailQueue = require('./queueService');

const trigger = async (triggerEvent, contactId) => {
  const [automations] = await Automation.findActiveByTrigger(triggerEvent);
  if (!automations.length) return { triggered: 0 };

  const [contacts] = await Contact.findById(contactId);
  if (!contacts.length) throw { status: 404, message: 'Contact not found.' };
  const contact = contacts[0];

  let triggered = 0;

  for (const auto of automations) {
    const steps   = auto.workflow_json?.steps || [];
    let   delayMs = 0;

    for (const step of steps) {
      delayMs += (step.delay_days || 0) * 86400000;

      if (step.type === 'send_email' && step.template_id) {
        const [tmpls] = await Template.findById(step.template_id);
        if (!tmpls.length) continue;
        const tmpl = tmpls[0];

        await emailQueue.add('automation-email', {
          contactId:   contact.id,
          toEmail:     contact.email,
          toName:      contact.name,
          subject:     tmpl.subject || 'Email from automation',
          htmlContent: tmpl.html_content,
          automationId: auto.id,
        }, { delay: delayMs, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

        triggered++;
      }
    }
  }

  return { triggered };
};

module.exports = { trigger };
