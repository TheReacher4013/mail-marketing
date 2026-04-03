const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, max: 300,
    message: { success: false, message: 'Too many requests.' },
}));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/segments', require('./routes/segmentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/automations', require('./routes/automationRoutes'));
app.use('/api/track', require('./routes/trackingRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ── New Feature Routes ───────────────────────────────────────
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));

app.get('/health', (req, res) => res.json({ success: true, message: 'Server running.' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
