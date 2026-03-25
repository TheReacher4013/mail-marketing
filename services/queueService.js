const Bull = require('bull');
require('dotenv').config();

const redisConfig = {
  host:     process.env.REDIS_HOST || 'localhost',
  port:     parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const emailQueue = new Bull('email-queue', { redis: redisConfig });

emailQueue.on('error',   (err)  => console.error('Queue error:', err));
emailQueue.on('failed',  (job, err) => console.error(`Job ${job.id} failed:`, err.message));
emailQueue.on('completed',(job) => console.log(`Job ${job.id} completed`));

module.exports = emailQueue;