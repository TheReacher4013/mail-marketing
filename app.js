const express = require('express');
const cors = reqiure('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost :3000',
    credentials: true,
}));

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended:true}));
app.use('/api/', rateLimit({
    window: 15* 60 * 1000,
    max: 200,
    message:{success: false, message: 'Too  many request.'},
}));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/templates',require("./routes/templateRoutes"));
app.use('/api/campaigns', require("./routes/campaignRoutes"));
app.use('/api/automations', require("./routes/automationRoutes"));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/track', require('./routes/trackingRoutes'));


app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;