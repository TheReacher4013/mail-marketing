// const express = require('express');
// const cors = require('cors');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// const app = express();

// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
//     credentials: true,
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// app.use('/api/', rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 200,
//     message: { success: false, message: 'Too many requests.' },
// }));

// // ── Routes ────────────────────────────────────────────────────────────────────
// app.use('/api/auth',          require('./routes/authRoutes'));
// app.use('/api/users',         require('./routes/userRoutes'));
// app.use('/api/contacts',      require('./routes/contactRoutes'));
// app.use('/api/templates',     require('./routes/templateRoutes'));
// app.use('/api/campaigns',     require('./routes/campaignRoutes'));
// app.use('/api/automations',   require('./routes/automationRoutes'));
// app.use('/api/analytics',     require('./routes/analyticsRoutes'));
// app.use('/api/track',         require('./routes/trackingRoutes'));

// // FIX: These routes were missing in original app.js
// app.use('/api/segments',      require('./routes/segmentRoutes'));
// app.use('/api/settings',      require('./routes/settingsRoutes'));
// app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
// app.use('/api/upload',        require('./routes/uploadRoutes'));
// app.use('/api/roles',         require('./routes/roleRoutes'));

// // ── Health check ──────────────────────────────────────────────────────────────
// app.get('/health', (req, res) => res.json({ success: true, message: 'Server running.' }));

// // ── 404 ───────────────────────────────────────────────────────────────────────
// app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// // ── Global error handler ──────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//     console.error('Error:', err);
//     res.status(500).json({ success: false, message: 'Internal server error.' });
// });

// module.exports = app;
































const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests.' },
}));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/automations', require('./routes/automationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/track', require('./routes/trackingRoutes'));

app.get('/health', (req, res) => res.json({ success: true, message: 'Server running.' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;