require('dotenv').config();
const cron           = require('node-cron');
const Campaign       = require('../models/Campaign');
const approvalService = require('../services/approvalService');
const { connectDB }  = require('../config/db');

console.log(' Campaign scheduler started...');

const start = async () => {
  await connectDB();

  
  cron.schedule('* * * * *', async () => {
    try {
      const [campaigns] = await Campaign.findScheduledDue();

      for (const campaign of campaigns) {
        console.log(`Dispatching scheduled campaign: ${campaign.name}`);
        await Campaign.updateStatus(campaign.id, 'sending');
        await approvalService.dispatchCampaign(campaign);
      }
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });

  console.log(' Scheduler running — checking every minute');
};

start();
