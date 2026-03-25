require ('dotenv').config();
const app = require('./app');
const {connectDB} = require("./config/db");
const {startSchedular} = require('./services/schedulerService');

const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    startSchedular();
    app.listen(PORT, () =>{
        console.log (`server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Default login: admin@admin.com / password`);
    });
};

start();