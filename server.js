require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    
    require('./workers/campaignScheduler');

    app.listen(PORT, () => {
        console.log(` Server: http://localhost:${PORT}`);
        console.log(` Default login: admin@admin.com / Admin@123`);
    });
};

start();
